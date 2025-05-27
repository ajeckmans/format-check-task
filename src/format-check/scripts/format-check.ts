import * as gi from "azure-devops-node-api/interfaces/GitInterfaces";
import {PullRequestFileChange, PullRequestFileChanges} from './types/pull-request-file-change';
import {PullRequestService, getPullRequestService} from './services/pull-request-service';
import {AnnotatedReports} from './types/annotated-report';
import {FormatCheckRunner} from "./services/format-check-runner";
import {PathNormalizer} from './utils/path-normalizer';
import {Settings} from './types/settings';
import * as fs from 'fs';
import * as path from 'path';

const commentPreamble = '[DotNetFormatTask][Automated]';

/**
 * The `runFormatCheck` is an asynchronous function that performs a formatting check on certain code files and updates pull request status accordingly.
 *
 * The function follows these main steps:
 * 1. Initializes and starts a format check runner with appropriate file paths provided via Settings.
 * 2. Generates annotated reports for the files checked.
 * 3. If the scope is set to Pull Request, it retrieves the list of files involved in the Pull Request and updates the reports accordingly.
 * 4. Updates the Pull Request comment threads based on the resulting check report.
 * 5. Sets the final Pull Request status based on the check outcome and determines if the task should fail.
 *
 * @async
 * @function runFormatCheck
 * @param {Settings} settings - Settings object containing parameters needed for the format check runner and Pull Request Service.
 * @returns {Promise<boolean>} - Promise resolving to a boolean indicating if the task should fail due to formatting errors.
 */
async function runFormatCheck(settings: Settings): Promise<boolean> {
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
            FilePath: new PathNormalizer(settings).normalizeFilePath(r.FilePath),
            commitId: '',
            changeType: gi.VersionControlChangeType.None
        };
    }) as AnnotatedReports;

    if (settings.Parameters.scopeToPullRequest) {
        console.log("Scoping issues to files part of the Pull Request.");
        let changedInPR = await getChangedFilesInPR(pullRequestService, settings);

        // Filter reports to only include files that have changed
        annotatedReports = annotatedReports.map(report => {
            let change = changedInPR.find(c => c.FilePath === report.FilePath);
            if (change) {
                report.commitId = change.CommitId;
                report.changeType = change.changeType;

                // If scopeToChangedLines is enabled and we have line information
                if (settings.Parameters.scopeToChangedLines && change.lineStart !== undefined && change.lineEnd !== undefined) {
                    // Filter file changes to only include those within the changed line range
                    report.FileChanges = report.FileChanges.filter(changeInfo =>
                        changeInfo.LineNumber >= change.lineStart! && changeInfo.LineNumber <= change.lineEnd!
                    );
                }
            }
            return report;
        }).filter(x => {
            let include = changedInPR.some(c => c.FilePath === x.FilePath);

            if (include) {
                console.log(`✔ Include file: ${x.FilePath}`);
            } else {
                console.log(`❌ Exclude file: ${x.FilePath}`);
            }
            return include;
        });
    }

    // Update the Pull Request comment threads based on the format check reports
    await updatePullRequestThreads(
        pullRequestService,
        annotatedReports);

    // Set final Pull Request status and determine if the task should fail
    return await setPullRequestStatusAndDetermineShouldFailTask(
        pullRequestService,
        annotatedReports.length > 0,
        settings.Parameters.failOnFormattingErrors,
        settings.Parameters.statusCheck);
}

/**
 * The `getChangedFilesInPR` function retrieves
 * all pull request file changes with respect to their commits it handles.
 *
 * @param {PullRequestService} pullRequestUtils - An instance of PullRequestService to interact with Pull Request API
 * @param {Settings} settings
 * @return {Promise<PullRequestFileChanges>} - Returns a Promise that resolves to an array of file changes.
 * Each record denotes a path, commit id, change type, and line range in a file as a result of a commit.
 *
 * @description
 * Function operates asynchronously, because of the nature of its service calls to GitService and PullRequestService.
 */
async function getChangedFilesInPR(pullRequestUtils: PullRequestService, settings: Settings): Promise<PullRequestFileChanges> {
    console.log("Getting the PR commits...");
    let pullRequestChanges = await pullRequestUtils.getPullRequestChanges();

    let files: PullRequestFileChanges = [];

    for (const change of pullRequestChanges) {
        if (change.item!.path == undefined) {
            console.warn("Warning: File path is undefined for commit id " + change.item?.commitId);
            continue;
        }

        let normalizedPath = new PathNormalizer(settings).normalizeFilePath(change.item!.path);

        files.push(new PullRequestFileChange(normalizedPath, change.item?.commitId!, change.changeType!, lineStart, lineEnd));
    }

    console.log("All changed files considered to be part of this Pull Request: ");
    files.forEach(file => {
        let lineInfo = file.lineStart && file.lineEnd ? ` (lines ${file.lineStart}-${file.lineEnd})` : '';
        console.log(`${file.FilePath} - ${file.changeType} - ${file.CommitId}${lineInfo}`);
    });
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
            const existingThread = existingThreads.find(thread => thread.comments?.some(comment => comment.content === content));

            const comment = <gi.Comment>{
                content: content,
                commentType: gi.CommentType.Text
            };

            if (existingThread) {
                console.log("Updating existing thread.");

                if (!existingThread.id) {
                    throw new Error("Existing thread id is not set.");
                }

                const thread = {
                    status: gi.CommentThreadStatus.Active,
                    lastUpdatedTime: new Date()
                };
                await pullRequestService.updateThread(thread, existingThread.id);
            } else {
                console.log(`📝 Creating new thread for file ${report.FilePath}.`);
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
    for (const existingThread of existingThreads.filter(thread => thread.comments?.some(comment => comment.content?.startsWith(commentPreamble)))) {
        console.log(`Processing the existing thread for file ${existingThread.threadContext?.filePath}.`);
        if (existingThread.status === gi.CommentThreadStatus.Closed) {
            continue;
        }
        const threadContent = existingThread.comments![0]?.content;
        if (threadContent && !activeIssuesContent.includes(threadContent)) {
            console.log("🔒 Closing resolved thread.");

            if (!existingThread.id) {
                throw new Error("Existing thread id is not set.");
            }

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
    if (formatIssuesExist) {
        if (setStatusCheck) {
            await pullRequestService.updatePullRequestStatus(gi.GitStatusState.Failed, getStatusDescription);
        }
        if(failOnFormattingErrors){
            console.log(`##vso[task.complete result=Failed;]Code format is incorrect.`);
            return true;
        } else {
            console.log(`##vso[task.complete result=Succeeded;]Code format is incorrect.`);
            return false;
        }
    } else {
        console.log(`##vso[task.complete result=Succeeded;]Code format is correct.`);
        if (setStatusCheck) {
            await pullRequestService.updatePullRequestStatus(gi.GitStatusState.Succeeded, getStatusDescription);
        }
        return false;
    }
}

export {
    runFormatCheck,
    getChangedFilesInPR,
    updatePullRequestThreads,
    markResolvedThreadsAsClosed,
    getStatusDescription,
    setPullRequestStatusAndDetermineShouldFailTask
};
