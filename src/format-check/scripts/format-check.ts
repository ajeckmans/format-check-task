import {execSync} from 'child_process';
import * as fs from 'fs';
import dotenv from 'dotenv';
import * as azdev from "azure-devops-node-api";
import * as gi from "azure-devops-node-api/interfaces/GitInterfaces"

import {FormatReports} from './format-report.interface';

const commentPreamble = '[DotNetFormatTask][Automated]';

async function main() {
    // Loading environment variables
    dotenv.config();

    // Check if it's a PR build
    const pullRequestId = process.env.SYSTEM_PULLREQUEST_PULLREQUESTID;
    if (!pullRequestId) {
        console.log("Not a PR build. Skipping.");
        process.exit(0);
    }

    // Task parameters
    const solutionPath = process.env.INPUT_SOLUTIONPATH;
    const includePath = process.env.INPUT_INCLUDEPATH;
    const excludePath = process.env.INPUT_EXCLUDEPATH;
    const failOnFormattingErrors = process.env.INPUT_FAILONFORMATTINGERRORS === 'true';

    // Ennvironment variables
    const orgUrl = process.env.SYSTEM_TEAMFOUNDATIONCOLLECTIONURI;
    const repoId = process.env.BUILD_REPOSITORY_ID;
    const projectId = process.env.SYSTEM_TEAMPROJECTID;

    console.log('Solution Path:', solutiYUTnPath);
    console.log('Organization URL:', orgUrl);
    console.log('Repo ID:', repoId);
    console.log('Project ID:', projectId);
    console.log('Pull Request ID:', pullRequestId);

    const reportPath = "format-report.json";

    // Validate solutionPath
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
    }

    try {
        // Run dotnet format with verbosity and reporting
        const formatCmd = `dotnet format ${solutionPath} --verify-no-changes --verbosity diagnostic --report ${reportPath} ${includePath ? `--include ${includePath}` : ''} ${excludePath ? `--exclude ${excludePath}` : ''}`;
        console.log(`Running dotnet format command. (${formatCmd})`);

        const dotnetFormatVersion = execSync("dotnet format --version", {encoding: 'utf8'});
        console.log(`using dotnet format version ${dotnetFormatVersion}`);

        try {
            execSync(formatCmd, {stdio: 'inherit'});
        } catch (error) {
            // The dotnet format command can return a non-zero exit code for both fatal and non-fatal errors.
            console.error(`Dotnet format command failed with error ${error}`);

            if (!fs.existsSync(reportPath)) {
                // Format command has failed. No report was generated.
                console.error("No report found at reportPath.");
                process.exit(1);
            }
        }
        console.log("Dotnet format command completed.");

        console.log("Fetching existing threads.");
        const token = process.env.SYSTEM_ACCESSTOKEN;
        const authHandler = azdev.getPersonalAccessTokenHandler(token);
        const connection = new azdev.WebApi(orgUrl, authHandler);

        const gitApi = await connection.getGitApi();

        const existingThreads = await gitApi.getThreads(repoId, parseInt(pullRequestId), projectId);

        console.log("Completed fetching existing threads.");

        console.log("Loading error report.");
        const reports = JSON.parse(fs.readFileSync(reportPath, 'utf8')) as FormatReports;

        let activeIssuesContent = [];

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
                    await gitApi.updateThread(thread, repoId, parseInt(pullRequestId), existingThread.id, projectId);
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
                    await gitApi.createThread(thread, repoId, parseInt(pullRequestId), projectId);
                }
            }
        }

        // Close threads for resolved issues
        for (const existingThread of existingThreads.filter(thread => thread.comments.some(comment => comment.content.startsWith(commentPreamble)))) {
            const threadContent = existingThread.comments[0]?.content;
            if (!activeIssuesContent.includes(threadContent)) {
                console.log("Closing resolved thread.");
                const closedThread = {
                    status: gi.CommentThreadStatus.Closed
                };
                await gitApi.updateThread(closedThread, repoId, parseInt(pullRequestId), existingThread.id, projectId);
            }
        }

        // if formatting errors exist, fail the task
        if (activeIssuesContent.length && failOnFormattingErrors) {
            console.log("##vso[task.complete result=Failed;]Code format is incorrect.");
        } else {
            // no formatting errors, or we're not failing on formatting errors, task succeeds
    console.log("##vso[task.complete result=Succeeded;]Code format is correct.");
        }

        console.log("Format check script completed.");
    } catch (error) {
        console.error(`Dotnet format task failed with error ${error}`);
        process.exit(1);
    }
}

main().catch(error => console.error(error));