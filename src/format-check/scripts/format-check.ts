import {exec} from 'child_process';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as azdev from "azure-devops-node-api";
import * as gi from "azure-devops-node-api/interfaces/GitInterfaces"

import { FormatReports } from './format-report.interface';

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
    const solutionPath = process.env.SolutionPath;
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

    // Validate reportPath
    if (!reportPath.trim()) {
        console.error("Report path is not set.");
        process.exit(1);
    }

    if (fs.existsSync(reportPath)) {
        fs.unlinkSync(reportPath);
    }

    // Run dotnet format with verbosity and reporting
    const formatCmd = `dotnet format ${solutionPath} --verify-no-changes -v diag --report ${reportPath}`;
    console.log("Running dotnet format command.");

    try {
        exec(formatCmd, (error, _stdout) => {
            if (error) {
                console.error(`Error: ${error}`);
                process.exit(1);
            }
            console.log("Dotnet format command completed.");
        });


        console.log("Fetching existing threads with pagination.");

        const orgUrl = process.env.SYSTEM_TEAMFOUNDATIONCOLLECTIONURI;
        const token = process.env.SYSTEM_ACCESSTOKEN;
        const authHandler = azdev.getPersonalAccessTokenHandler(token);
        const connection = new azdev.WebApi(orgUrl, authHandler);

        const gitApi = await connection.getGitApi();

        const repoId = process.env.BUILD_REPOSITORY_ID;
        const projectId = process.env.SYSTEM_TEAMPROJECTID;
        const pullRequestId = parseInt(process.env.SYSTEM_PULLREQUEST_PULLREQUESTID);

        // Fetching existing threads
        const existingThreads = await gitApi.getThreads(repoId, pullRequestId, projectId);


        console.log("Completed fetching existing threads.");

        // Load JSON report
        const reports = JSON.parse(fs.readFileSync(process.env.reportPath, 'utf8')) as FormatReports;

        let activeIssuesContent = [];
        
        for (const report of reports) {
            for (const change of report.FileChanges) {
                const content = `[Automated] ${change.DiagnosticId}: ${change.FormatDescription}`;
                activeIssuesContent.push(content);  // Keep track of active issues
                const existingThread = existingThreads.find(thread => thread.comments.some(comment => comment.content === content));

                const comment = <gi.Comment>{
                    content: content,
                    commentType: gi.CommentType.Text
                };

                const thread = <gi.GitPullRequestCommentThread>{
                    comments: [comment, ...existingThread.comments.slice(1)],
                    status: gi.CommentThreadStatus.Active,
                    lastUpdatedDate: new Date(),
                    threadContext: {
                        filePath: report.FilePath,
                        rightFileStart: {line: change.LineNumber, offset: change.CharNumber},
                        rightFileEnd: {line: change.LineNumber, offset: change.CharNumber + 1}
                    }
                };

                if (existingThread) {
                    console.log("Updating existing thread.");
                    await gitApi.updateThread(thread, repoId, pullRequestId, existingThread.id, projectId);
                } else {
                    console.log("Creating new thread.");
                    await gitApi.createThread(thread, repoId, pullRequestId, projectId);
                }
            }
        }

        // Close threads for resolved issues
        for (const existingThread of existingThreads) {
            const threadContent = existingThread.comments[0]?.content;
            if (!activeIssuesContent.includes(threadContent)) {
                console.log("Closing resolved thread.");
                const closedThread = {
                    ...existingThread,
                    status: gi.CommentThreadStatus.Closed
                };
                await gitApi.updateThread(closedThread, repoId, pullRequestId, existingThread.id, projectId);
            }
        }
        
        // Fail the build
        console.log("##vso[task.complete result=Failed;]Code format is incorrect.");
        console.log("Format check script completed.");
    } catch (error) {
        console.error(`Dotnet format command failed with error ${error}`);
        process.exit(1);
    }
}

main().catch(error => console.error(error));