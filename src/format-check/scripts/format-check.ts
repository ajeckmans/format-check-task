import dotenv from 'dotenv';
import * as gi from "azure-devops-node-api/interfaces/GitInterfaces";
import {PullRequestFileChanges} from './types/pull-request-file-change';
import {PullRequestService, getPullRequestService} from './services/pull-request-service';
import {GitService, getGitService} from "./services/git-service";
import {AnnotatedReports} from './types/annotated-report';
import {getSettings} from "./types/settings";
import {BaseGitApiService} from './services/base-git-api-service';
import {FormatCheckRunner} from "./services/format-check-runner";
import {AzureFilePathUtils} from './utils/path-normalizer';

const commentPreamble = '[DotNetFormatTask][Automated]';

dotenv.config();

async function main() {
    // Retrieve the settings for the format check task.
    // If the settings indicate that it's not a PR request build, the program will exit.
    const settings = getSettings();

    await BaseGitApiService.init(this.settings);

    const pullRequestService = await getPullRequestService(settings);

    if (settings.Parameters.statusCheck) {
        await pullRequestService.updatePullRequestStatus(gi.GitStatusState.Pending, getStatusDescription);
    }

    // Initialize and run the format check runner
    const runner = new FormatCheckRunner(
        settings.Parameters.solutionPath,
        settings.Parameters.includePath,
        settings.Parameters.excludePath
    );
    const reports = await runner.runFormatCheck();

    // Create annotated reports to later annotate with additional data
    let annotatedReports = reports.map(r => {
        return {
            ...r,
            FilePath: AzureFilePathUtils.normalizeFilePath(r.FilePath),
            commitId: '',
            changeType: gi.VersionControlChangeType.None
        };
    }) as AnnotatedReports;

    if (settings.Parameters.scopeToPullRequest) {
        console.log("Scoping to Pull Request.");
        const gitService = await getGitService(settings);
        let changedInPR = await getChangedFilesInPR(gitService, pullRequestService);

        annotatedReports = annotatedReports.map(report => {
            let change = changedInPR.find(c => c.FilePath === report.FilePath);
            if (change) {
                report.commitId = change.CommitId;
                report.changeType = change.changeType;
            }
            return report;
        });
    }

    // Update the Pull Request comment threads based on the format check reports
    await updatePullRequestThreads(
        pullRequestService,
        annotatedReports);

    // Set final Pull Request status and determine if the task should fail
    const shouldFail = await setPullRequestStatusAndDetermineShouldFailTask(
        pullRequestService,
        annotatedReports.length > 0,
        settings.Parameters.failOnFormattingErrors,
        settings.Parameters.statusCheck);

    // Exit the program based on the format check outcome
    if (shouldFail) {
        console.log("Format check task failed.");
        process.exit(1);
    } else {
        console.log("Format check task succeeded.");
        process.exit(0);
    }
}

/**
 * The `getChangedFilesInPR` function retrieves
 * all pull request file changes with respect to their commits it handles.
 *
 * @param {GitService} gitService - An instance of GitService to interact with GIT API
 * @param {PullRequestService} pullRequestUtils - An instance of PullRequestService to interact with Pull Request API
 *
 * @return {Promise<PullRequestFileChanges>} - Returns a Promise that resolves to an array of file changes.
 * Each record denotes a path, commit id and change type in a file as a result of a commit.
 *
 * @description
 * Function operates asynchronously, because of the nature of its service calls to GitService and PullRequestService.
 */
async function getChangedFilesInPR(gitService: GitService, pullRequestUtils: PullRequestService): Promise<PullRequestFileChanges> {
    console.log("Getting the PR commits...");
    const pullRequestCommits = await pullRequestUtils.getPullRequestCommits();

    let files: PullRequestFileChanges = [];

    for (const commit of pullRequestCommits) {
        console.log("Processing commit: " + commit.commitId);
        const changes = await gitService.getChanges(commit.commitId);

        for (const change of changes.changes) {
            let normalizedPath = AzureFilePathUtils.normalizeFilePath(change.item.path);
            if (change.changeType === gi.VersionControlChangeType.Delete) {
                files = files.filter(item => item.FilePath !== normalizedPath);
            } else {
                files.push({
                    FilePath: normalizedPath,
                    CommitId: commit.commitId,
                    changeType: change.changeType
                });
            }
        }
    }

    console.log("All changed files: ", Array.from(files.entries()));
    return files;
}

/**
 * The `updatePullRequestThreads` function updates the pull request comment threads based on given format check reports.
 *
 * @param {PullRequestService} pullRequestService - An instance of PullRequestService to interact with the Pull Request API.
 * @param {AnnotatedReports} reports - AnnotatedReports object containing information about every commit that contains formatting issues.
 *
 * @returns {Promise<void>} - Returns a Promise that will be fulfilled after all the pull request comment threads have been updated.
 *
 * @description
 * This function operates asynchronously due to the nature of its service calls to the PullRequestService.
 * It fetches existing threads and for each report in `reports`, it generates a content for comments which keeps the track of active issues.
 * If there is an existing thread for the active issue, it updates that thread; if not, it creates a new thread for the issue.
 * Lastly, it also closes threads for resolved issues.
 */
async function updatePullRequestThreads(
    pullRequestService: PullRequestService,
    reports: AnnotatedReports): Promise<void> {
    console.log("Fetching existing threads.");
    const existingThreads = await pullRequestService.getThreads();
    console.log("Completed fetching existing threads.");

    let activeIssuesContent: string[] = [];

    for (const report of reports) {
        for (const change of report.FileChanges) {
            const content = `${commentPreamble} ${change.DiagnosticId}: ${change.FormatDescription} on line ${change.LineNumber}, position ${change.CharNumber}`;
            activeIssuesContent.push(content);  // Keep track of active issues
            const existingThread = existingThreads.find(thread => thread.comments.some(comment => comment.content === content));

            const comment = <gi.Comment>{
                content: content,
                commentType: gi.CommentType.Text
            };

            if (existingThread) {
                console.log("Updating existing thread.");

                const thread = {
                    status: gi.CommentThreadStatus.Active,
                    lastUpdatedTime: new Date()
                };
                await pullRequestService.updateThread(thread, existingThread.id);
            } else {
                console.log("Creating new thread.");
                const thread = <gi.GitPullRequestCommentThread>{
                    comments: [comment],
                    status: gi.CommentThreadStatus.Active,
                    threadContext: {
                        filePath: report.FilePath,
                        rightFileStart: {line: change.LineNumber, offset: change.CharNumber},
                        rightFileEnd: {line: change.LineNumber, offset: change.CharNumber + 1}
                    }
                };
                await pullRequestService.createThread(thread);
            }
        }
    }

    // Close threads for resolved issues
    await markResolvedThreadsAsClosed(
        pullRequestService,
        existingThreads,
        activeIssuesContent);
}

/**
 * Asynchronously marks threads that were previously marked as resolved now as closed.
 *
 * @param {PullRequestService} pullRequestService - An instance of PullRequestService to interact with the Pull Request API.
 * @param {gi.GitPullRequestCommentThread[]} existingThreads - The current set of existing pull request comment threads.
 * @param {string[]} activeIssuesContent - The content of comments that have active issues.
 *
 * @description
 * Iterates over the existing threads filtered for those starting with a specific preamble.
 * If the existing thread status is set to closed, it is ignored. Else, for each existing thread, its content is compared with the
 * contents of active issues. If a particular threads content does not match, it is considered as resolved and hence marked as closed.
 */
async function markResolvedThreadsAsClosed(
    pullRequestService: PullRequestService,
    existingThreads: gi.GitPullRequestCommentThread[],
    activeIssuesContent: string[]) {
    for (const existingThread of existingThreads.filter(thread => thread.comments.some(comment => comment.content?.startsWith(commentPreamble)))) {
        console.log("Processing the existing thread");
        if (existingThread.status === gi.CommentThreadStatus.Closed) {
            continue;
        }
        const threadContent = existingThread.comments[0]?.content;
        if (!activeIssuesContent.includes(threadContent)) {
            console.log("Closing resolved thread.");
            const closedThread = {
                status: gi.CommentThreadStatus.Closed
            };
            await pullRequestService.updateThread(closedThread, existingThread.id);
        }
    }
}

/**
 * Function `getStatusDescription` provides human-reader friendly status messages based on git status state.
 * @param {gi.GitStatusState} status - determines a state of the Git.
 * @returns {string} - corresponding message to the Git state.
 */
function getStatusDescription(status: gi.GitStatusState): string {
    switch (status) {
        case gi.GitStatusState.Pending:
            return "Format check is running";
        case gi.GitStatusState.Failed:
            return "Formatting errors found";
        case gi.GitStatusState.Error:
            return "Formatting task failed with an error.";
        default:
            return "No formatting errors found";
    }
}

/**
 * An asynchronous function named `setPullRequestStatusAndDetermineShouldFailTask` is used for setting the status for pull requests and determining if the task should fail or not.
 *
 * @param {PullRequestService} pullRequestService - An instance of PullRequestService which is used to handle interactions with the Pull Request API.
 * @param {boolean} formatIssuesExist - It denotes whether issues related with code format exist or not.
 * @param {boolean} failOnFormattingErrors - It signifies whether the formatting errors should cause the function to fail.
 * @param {boolean} setStatusCheck - It signifies whether the status check is to be set or not.
 * @returns {Promise<boolean>} - The function returns a promise that resolves to a boolean indicating if the task should fail based on the code format.
 *
 * @description
 * This function makes use of console variable for logging and PullRequestService for setting the pull request status. In case of formatting errors and when set to fail on such errors,
 * the function logs a failure message and subsequently sets the pull request status to 'Failed'. If there are no formatting issues or the function is not set to fail on such issues,
 * the successful log message is printed and the pull request status is set to 'Succeeded'.
 */
async function setPullRequestStatusAndDetermineShouldFailTask(
    pullRequestService: PullRequestService,
    formatIssuesExist: boolean,
    failOnFormattingErrors: boolean,
    setStatusCheck: boolean): Promise<boolean> {
    if (formatIssuesExist && failOnFormattingErrors) {
        console.log(`##vso[task.complete result=Failed;]Code format is incorrect.`);
        if (setStatusCheck) {
            await pullRequestService.updatePullRequestStatus(gi.GitStatusState.Failed, getStatusDescription);
        }
        return true;
    } else {
        console.log(`##vso[task.complete result=Succeeded;]Code format is correct.`);
        if (setStatusCheck) {
            await pullRequestService.updatePullRequestStatus(gi.GitStatusState.Succeeded, getStatusDescription);
        }
        return false;
    }
}

// Call these functions in your main function and do your own error handling
main().catch(error => {
    console.error(error);
    process.exit(1);
});