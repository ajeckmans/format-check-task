import {execSync} from 'child_process';
import * as fs from 'fs';
import dotenv from 'dotenv';
import * as azdev from "azure-devops-node-api";
import * as gi from "azure-devops-node-api/interfaces/GitInterfaces"

import {FormatReports} from './format-report.interface';

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
    const orgUrl = process.env.SYSTEM_TEAMFOUNDATIONCOLLECTIONURI;
    const repoId = process.env.BUILD_REPOSITORY_ID;
    const projectId = process.env.SYSTEM_TEAMPROJECTID;

    console.log('Solution Path:', solutionPath);
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
        const formatCmd = `dotnet format ${solutionPath} --verify-no-changes --verbosity diagnostic --report ${reportPath}`;
        console.log(`Running dotnet format command. (${formatCmd})`);

        const dotnetFormatVersion = execSync("dotnet format --version", {encoding: 'utf8'});
        console.log(`using dotnet format version ${dotnetFormatVersion}`);

        try {
            execSync(formatCmd);
        } catch (e) {
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
                const content = `[Automated] ${report.FilePath} - ${change.DiagnosticId}: ${change.FormatDescription} on line ${change.LineNumber}, position ${change.CharNumber}`;
                activeIssuesContent.push(content);  // Keep track of active issues
                const existingThread = existingThreads.find(thread => thread.comments.some(comment => comment.content === content));

                const comment = <gi.Comment>{
                    content: content,
                    commentType: gi.CommentType.Text
                };

                if (existingThread) {
                    console.log("Updating existing thread.");

                    const thread = {
                        ...existingThread,
                        status: gi.CommentThreadStatus.Active
                    };
                    await gitApi.updateThread(thread, repoId, parseInt(pullRequestId), existingThread.id, projectId);
                } else {
                    console.log("Creating new thread.");
                    const thread = <gi.GitPullRequestCommentThread>{
                        comments: [comment],
                        status: gi.CommentThreadStatus.Active,
                        threadContext: {
                            filePath: report.FilePath.replace(`${process.env.BUILD_SOURCESDIRECTORY}/`, ''),
                            rightFileStart: {line: change.LineNumber, offset: change.CharNumber},
                            rightFileEnd: {line: change.LineNumber, offset: change.CharNumber + 1}
                        }
                    };
                    await gitApi.createThread(thread, repoId, parseInt(pullRequestId), projectId);
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
                await gitApi.updateThread(closedThread, repoId, parseInt(pullRequestId), existingThread.id, projectId);
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