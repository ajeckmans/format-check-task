import {execSync} from 'child_process';
import * as fs from 'fs';
import dotenv from 'dotenv';
import * as azdev from "azure-devops-node-api";
import * as gi from "azure-devops-node-api/interfaces/GitInterfaces";
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
    const taskParams = getTaskParameters();
    const envVars = getEnvVariables();

    // Run the format check
    const reports = runFormatCheck(taskParams);

    // Check the format and set PR according to the result
    await checkFormatAndSetPR(reports, envVars, taskParams.statusCheck, taskParams.failOnFormattingErrors, taskParams.statusCheckContext);
}


function getTaskParameters(): TaskParameters {
    let params =  {
        solutionPath: process.env.INPUT_SOLUTIONPATH!,
        includePath: process.env.INPUT_INCLUDEPATH,
        excludePath: process.env.INPUT_EXCLUDEPATH,
        statusCheck: process.env.INPUT_STATUSCHECK === 'true',
        failOnFormattingErrors: process.env.INPUT_FAILONFORMATTINGERRORS === 'true',
        statusCheckContext: {
            name: process.env.INPUT_STATUSCHECKNAME,
            genre: process.env.INPUT_STATUSCHECKGENRE,
        }
    };

    console.log('task input parameters:')
    console.log(`Solution Path: ${params.solutionPath}`);
    console.log(`Include Path: ${params.includePath}`);
    console.log(`Exclude Path: ${params.excludePath}`);
    console.log(`Status Check: ${params.statusCheck}`);
    console.log(`Fail On Formatting Errors: ${params.failOnFormattingErrors}`);
    console.log(`Status Check Name: ${params.statusCheckContext.name}`);
    console.log(`Status Check Genre: ${params.statusCheckContext.genre}`);

    return params;
}

function getEnvVariables(): EnvVariables {
    const pullRequestId = parseInt(process.env.SYSTEM_PULLREQUEST_PULLREQUESTID!, 10);
    return {
        orgUrl: process.env.SYSTEM_TEAMFOUNDATIONCOLLECTIONURI!,
        repoId: process.env.BUILD_REPOSITORY_ID!,
        projectId: process.env.SYSTEM_TEAMPROJECTID!,
        pullRequestId: isNaN(pullRequestId) ? process.exit(1) : pullRequestId,
        token: process.env.SYSTEM_ACCESSTOKEN!
    };
}

function runFormatCheck(taskParams: TaskParameters) {
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
        return loadErrorReport(reportPath);
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

function loadErrorReport(reportPath: string) {
    console.log("Loading error report.");
    return JSON.parse(fs.readFileSync(reportPath, 'utf8')) as FormatReports;
}

async function checkFormatAndSetPR(reports: FormatReports, envVars: EnvVariables, statusCheck: boolean, failOnFormattingErrors: boolean, statusCheckContext: gi.GitStatusContext) {
    console.log("Creating personal access token handler.");
    const authHandler = azdev.getPersonalAccessTokenHandler(envVars.token);

    console.log("Creating TFS connection.");
    const connection = new azdev.WebApi(envVars.orgUrl, authHandler);

    console.log("Getting Git API.");
    const gitApi = await connection.getGitApi();

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
                    status: gi.CommentThreadStatus.Active
                };
                await gitApi.updateThread(thread, envVars.repoId, envVars.pullRequestId, existingThread.id, envVars.projectId);
            } else {
                console.log("Creating new thread.");
                const thread = <gi.GitPullRequestCommentThread>{
                    comments: [comment],
                    status: gi.CommentThreadStatus.Active,
                    threadContext: {
                        filePath: report.FilePath.replace(`${process.env.BUILD_SOURCESDIRECTORY}`, ''),
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
    await setPRStatusAndFailTask(activeIssuesContent.length > 0, statusCheck, gitApi, envVars, failOnFormattingErrors, statusCheckContext);
}

async function markResolvedThreadsAsClosed(existingThreads: gi.GitPullRequestCommentThread[], activeIssuesContent: string[], gitApi: IGitApi, envVars: EnvVariables) {
    for (const existingThread of existingThreads.filter(thread => thread.comments.some(comment => comment.content.startsWith(commentPreamble)))) {
        console.log("Processing the existing thread");
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

async function setPRStatusAndFailTask(formatIssuesExist: boolean, statusCheck: boolean, gitApi: IGitApi, envVars: EnvVariables, failOnFormattingErrors: boolean, statusCheckContext: gi.GitStatusContext) {
    if (formatIssuesExist && statusCheck) {
        const status: gi.GitPullRequestStatus = {
            context: statusCheckContext,
            state: gi.GitStatusState.Failed,
            description: "Formatting errors found"
        };
        console.log("Attempting to create a Pull Request Status.");
        await gitApi.createPullRequestStatus(status, envVars.repoId, envVars.pullRequestId);
    }

    if (formatIssuesExist && failOnFormattingErrors) {
        console.log("##vso[task.complete result=Failed;]Code format is incorrect.");
    } else {
        console.log("##vso[task.complete result=Succeeded;]Code format is correct.");
    }
}

// Call these functions in your main function and do your own error handling
main().catch(error => {
    console.error(error);
    process.exit(1);
});