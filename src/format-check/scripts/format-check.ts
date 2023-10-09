import {execSync} from 'child_process';
import * as fs from 'fs';
import dotenv from 'dotenv';
import * as azdev from "azure-devops-node-api";
import * as gi from "azure-devops-node-api/interfaces/GitInterfaces";
import {CommentThreadStatus, VersionControlChangeType} from "azure-devops-node-api/interfaces/GitInterfaces";
import {TaskParameters} from './TaskParameters';
import {EnvVariables} from './EnvVariables';

import {FormatReports} from './format-report.interface';
import {IGitApi} from "azure-devops-node-api/GitApi";

const commentPreamble = '[DotNetFormatTask][Automated]';

dotenv.config();

async function main() {
    // Check if it's a PR build
    const pullRequestId = process.env.SYSTEM_PULLREQUEST_PULLREQUESTID;
    if (!pullRequestId) {
        console.log("Not a PR build. Skipping.");
        process.exit(0);
    }

    // Task parameters
    const envVars = getEnvVariables();
    const taskParams = getTaskParameters(envVars);

    const gitApi = await getGitAPI(taskParams, envVars);

    if (taskParams.statusCheck) {
        await updatePullRequestStatus(gitApi, envVars, taskParams, gi.GitStatusState.Pending);
    }

    // Run the format check
    const reports = await runFormatCheck(gitApi, envVars, taskParams);

    // Check the format and set PR according to the result
    let shouldFail = await checkFormatAndSetPR(gitApi, reports, envVars, taskParams);

    if (shouldFail) {
        console.log("Format check task failed.");
        process.exit(1);
    } else {
        console.log("Format check task succeeded.");
        process.exit(0);
    }
}

async function getGitAPI(taskParams: TaskParameters, envVars: EnvVariables) {
    console.log("Creating personal access token handler.");
    const authHandler = azdev.getPersonalAccessTokenHandler(taskParams.token);

    console.log("Creating TFS connection.");
    const connection = new azdev.WebApi(envVars.orgUrl, authHandler);

    console.log("Getting Git API.");
    return await connection.getGitApi();
}

function getTaskParameters(envVars: EnvVariables): TaskParameters {
    let params = {
        solutionPath: process.env.INPUT_SOLUTIONPATH!,
        includePath: process.env.INPUT_INCLUDEPATH,
        excludePath: process.env.INPUT_EXCLUDEPATH,
        statusCheck: process.env.INPUT_STATUSCHECK === 'true',
        failOnFormattingErrors: process.env.INPUT_FAILONFORMATTINGERRORS === 'true',
        statusCheckContext: {
            name: process.env.INPUT_STATUSCHECKNAME,
            genre: process.env.INPUT_STATUSCHECKGENRE,
        },
        scopeToPullRequest: process.env.INPUT_SCOPETOPULLREQUEST === 'true',
        token: process.env.INPUT_PAT || envVars.token
    };

    console.log('task input parameters:')
    console.log(`Solution Path: ${params.solutionPath}`);
    console.log(`Include Path: ${params.includePath}`);
    console.log(`Exclude Path: ${params.excludePath}`);
    console.log(`Status Check: ${params.statusCheck}`);
    console.log(`Fail On Formatting Errors: ${params.failOnFormattingErrors}`);
    console.log(`Status Check Name: ${params.statusCheckContext.name}`);
    console.log(`Status Check Genre: ${params.statusCheckContext.genre}`);
    console.log(`Scope To Pull Request: ${params.scopeToPullRequest}`);

    return params;
}

function getEnvVariables(): EnvVariables {
    const pullRequestId = parseInt(process.env.SYSTEM_PULLREQUEST_PULLREQUESTID!, 10);
    let envVars = {
        orgUrl: process.env.SYSTEM_TEAMFOUNDATIONCOLLECTIONURI!,
        repoId: process.env.BUILD_REPOSITORY_ID!,
        projectId: process.env.SYSTEM_TEAMPROJECTID!,
        pullRequestId: isNaN(pullRequestId) ? process.exit(1) : pullRequestId,
        token: process.env.SYSTEM_ACCESSTOKEN!
    };

    console.log(`OrgUrl: ${envVars.orgUrl}`);
    console.log(`RepoId: ${envVars.repoId}`);
    console.log(`ProjectId: ${envVars.projectId}`);
    console.log(`PullRequestId: ${envVars.pullRequestId}`);

    return envVars;
}

async function runFormatCheck(gitApi: IGitApi, envVars: EnvVariables, taskParams: TaskParameters) {
    const reportPath = "format-report.json";

    validateSolutionPath(taskParams.solutionPath, reportPath);

    try {
        const formatCmd = formatCommandString(taskParams, reportPath);
        console.log(`Running dotnet format command. (${formatCmd})`);
        const dotnetFormatVersion = execSync("dotnet format --version", {encoding: 'utf8'});
        console.log(`Using dotnet format version ${dotnetFormatVersion}`);

        try {
            execSync(formatCmd, {stdio: 'inherit'});
        } catch (error) {
            handleDotnetFormatError(error, reportPath);
        }

        console.log("Dotnet format command completed.");
        return await loadErrorReport(gitApi, envVars, reportPath, taskParams.scopeToPullRequest);
    } catch (error) {
        console.error(`Dotnet format task failed with error ${error}`);
        process.exit(1);
    }
}

function formatCommandString(taskParams: TaskParameters, reportPath: string) {
    return `dotnet format ${taskParams.solutionPath} --verify-no-changes --verbosity diagnostic --report ${reportPath} ${taskParams.includePath ? `--include ${taskParams.includePath}` : ''} ${taskParams.excludePath ? `--exclude ${taskParams.excludePath}` : ''}`
}

function validateSolutionPath(solutionPath: string, reportPath: string) {
    if (!solutionPath?.trim()) {
        console.error("SolutionPath is not set.");
        process.exit(1);
    }

    if (!fs.existsSync(solutionPath)) {
        console.error("Solution file at solutionPath does not exist.");
        process.exit(1);
    }

    if (fs.existsSync(reportPath)) {
        fs.unlinkSync(reportPath);
        console.log("Successfully deleted the existing report file.");
    }
}

function handleDotnetFormatError(error: any, reportPath: string) {
    console.error(`Dotnet format command failed with error ${error}`);
    if (!fs.existsSync(reportPath)) {
        // Format command has failed. No report was generated.
        console.error("No report found at reportPath.");
        process.exit(1);
    }
}

async function loadErrorReport(gitApi: IGitApi, envVars: EnvVariables, reportPath: string, scopeToPullRequest: boolean) {
    console.log("Loading error report.");
    let report = JSON.parse(fs.readFileSync(reportPath, 'utf8')) as FormatReports;

    // normalize filepath
    report = report.map(r => ({...r, FilePath: r.FilePath.replace(`${process.env.BUILD_SOURCESDIRECTORY}`, '')}))

    if (scopeToPullRequest) {
        console.log("Scoping to Pull Request.");
        const filesInPR = await getPullRequestFiles(gitApi, envVars);
        report = report.filter(r => filesInPR.includes(r.FilePath));
    }

    return report;
}

async function getPullRequestFiles(gitApi: IGitApi, envVars: EnvVariables) {
    console.log("Getting the PR commits...");
    const pullRequestCommits = await gitApi.getPullRequestCommits(envVars.repoId, envVars.pullRequestId, envVars.projectId);
    const latestCommit = pullRequestCommits.slice(-1)[0];
    console.log("latest commit: " + latestCommit.commitId)

    const changes = await gitApi.getChanges(latestCommit.commitId, envVars.repoId, envVars.projectId);
    let files = changes.changes
        .filter(change => change.changeType !== VersionControlChangeType.Delete)
        .map(change => change.item.path);

    console.log("Commit file changed obtained: ", files);
    return files;
}

async function checkFormatAndSetPR(gitApi: IGitApi, reports: FormatReports, envVars: EnvVariables, taskParams: TaskParameters) {
    console.log("Fetching existing threads.");
    const existingThreads = await gitApi.getThreads(envVars.repoId, envVars.pullRequestId, envVars.projectId);
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
                await gitApi.updateThread(thread, envVars.repoId, envVars.pullRequestId, existingThread.id, envVars.projectId);
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
                await gitApi.createThread(thread, envVars.repoId, envVars.pullRequestId, envVars.projectId);
            }
        }
    }

    // Close threads for resolved issues
    await markResolvedThreadsAsClosed(existingThreads, activeIssuesContent, gitApi, envVars);

    // Set PR status and fail the task if necessary
    return await setPRStatusAndFailTask(reports.length > 0, gitApi, envVars, taskParams);
}

async function markResolvedThreadsAsClosed(existingThreads: gi.GitPullRequestCommentThread[], activeIssuesContent: string[], gitApi: IGitApi, envVars: EnvVariables) {
    for (const existingThread of existingThreads.filter(thread => thread.comments.some(comment => comment.content?.startsWith(commentPreamble)))) {
        console.log("Processing the existing thread");
        if (existingThread.status === CommentThreadStatus.Closed) {
            continue;
        }
        const threadContent = existingThread.comments[0]?.content;
        if (!activeIssuesContent.includes(threadContent)) {
            console.log("Closing resolved thread.");
            const closedThread = {
                status: gi.CommentThreadStatus.Closed
            };
            await gitApi.updateThread(closedThread, envVars.repoId, envVars.pullRequestId, existingThread.id, envVars.projectId);
        }
    }
}

async function setPRStatusAndFailTask(formatIssuesExist: boolean, gitApi: IGitApi, envVars: EnvVariables, taskParams: TaskParameters) {
    if (formatIssuesExist && taskParams.failOnFormattingErrors) {
        console.log(`##vso[task.complete result=Failed;]Code format is incorrect.`);
        if (taskParams.statusCheck) {
            await updatePullRequestStatus(gitApi, envVars, taskParams, gi.GitStatusState.Failed);
        }
        return true;
    } else {
        console.log(`##vso[task.complete result=Succeeded;]Code format is correct.`);
        if (taskParams.statusCheck) {
            await updatePullRequestStatus(gitApi, envVars, taskParams, gi.GitStatusState.Succeeded);
        }
        return false;
    }
}

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

async function updatePullRequestStatus(gitApi: IGitApi, envVars: EnvVariables, taskParams: TaskParameters, status: gi.GitStatusState) {
    const logMsg = `Setting status check '${taskParams.statusCheckContext.genre}\\${taskParams.statusCheckContext.name}' to: ${gi.GitStatusState[status]}`;
    console.log(logMsg);

    const iterationId = await getLastPullRequestIteration(gitApi, envVars);

    const prStatus: gi.GitPullRequestStatus = {
        context: taskParams.statusCheckContext,
        state: status,
        description: getStatusDescription(status),
        iterationId: iterationId,
    };
    await gitApi.createPullRequestStatus(prStatus, envVars.repoId, envVars.pullRequestId);
}

async function getLastPullRequestIteration(gitApi: IGitApi, envVars: EnvVariables) {
    const pullRequestIterations = await gitApi.getPullRequestIterations(envVars.repoId, envVars.pullRequestId, envVars.projectId, true);
    return pullRequestIterations[pullRequestIterations.length - 1].id;
}

// Call these functions in your main function and do your own error handling
main().catch(error => {
    console.error(error);
    process.exit(1);
});