"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettings = void 0;
/**
 * Returns an object of type `Settings` populated from environment variables.
 *
 * @function getSettings
 * @returns {Settings} - An object that holds various environmental variables and parameters.
 *
 * @throws {Error} Will exit the process if `SYSTEM_PULLREQUEST_PULLREQUESTID` or `SolutionPath` is not set.
 */
var getSettings = function () {
    var _a, _b, _c;
    var pullRequestId = parseInt(process.env.SYSTEM_PULLREQUEST_PULLREQUESTID, 10);
    if (!pullRequestId) {
        console.log("Not a PR build. Skipping.");
        process.exit(0);
    }
    var settings = {
        Environment: {
            orgUrl: process.env.SYSTEM_TEAMFOUNDATIONCOLLECTIONURI || (function () {
                throw new Error("SYSTEM_TEAMFOUNDATIONCOLLECTIONURI is not set.");
            })(),
            repoId: process.env.BUILD_REPOSITORY_ID || (function () {
                throw new Error("BUILD_REPOSITORY_ID is not set.");
            })(),
            projectId: process.env.SYSTEM_TEAMPROJECTID || (function () {
                throw new Error("SYSTEM_TEAMPROJECTID is not set.");
            })(),
            pullRequestId: pullRequestId,
            token: process.env.SYSTEM_ACCESSTOKEN,
            sourcesDirectory: process.env.BUILD_SOURCESDIRECTORY || (function () {
                throw new Error("BUILD_SOURCESDIRECTORY is not set.");
            })(),
            pullRequestSourceCommit: process.env.SYSTEM_PULLREQUEST_SOURCECOMMITID || (function () {
                throw new Error("SYSTEM_PULLREQUEST_SOURCECOMMITID is not set.");
            })(),
            pullRequestTargetBranch: process.env.SYSTEM_PULLREQUEST_TARGETBRANCH || (function () {
                throw new Error("SYSTEM_PULLREQUEST_TARGETBRANCH is not set.");
            })(),
        },
        Parameters: {
            solutionPath: process.env.INPUT_SOLUTIONPATH,
            includePath: process.env.INPUT_INCLUDEPATH,
            excludePath: process.env.INPUT_EXCLUDEPATH,
            statusCheck: process.env.INPUT_STATUSCHECK === 'true',
            failOnFormattingErrors: process.env.INPUT_FAILONFORMATTINGERRORS === 'true',
            statusCheckContext: process.env.INPUT_STATUSCHECKNAME && process.env.INPUT_STATUSCHECKGENRE ? {
                name: process.env.INPUT_STATUSCHECKNAME,
                genre: process.env.INPUT_STATUSCHECKGENRE,
            } : undefined,
            scopeToPullRequest: process.env.INPUT_SCOPETOPULLREQUEST === 'true',
            token: process.env.INPUT_PAT || process.env.SYSTEM_ACCESSTOKEN || (function () {
                throw new Error("Token is not set.");
            })()
        }
    };
    console.log('task input parameters:');
    console.log("Solution Path: ".concat(settings.Parameters.solutionPath));
    console.log("Include Path: ".concat(settings.Parameters.includePath));
    console.log("Exclude Path: ".concat(settings.Parameters.excludePath));
    console.log("Status Check: ".concat(settings.Parameters.statusCheck));
    console.log("Fail On Formatting Errors: ".concat(settings.Parameters.failOnFormattingErrors));
    console.log("Status Check Name: ".concat((_a = settings.Parameters.statusCheckContext) === null || _a === void 0 ? void 0 : _a.name));
    console.log("Status Check Genre: ".concat((_b = settings.Parameters.statusCheckContext) === null || _b === void 0 ? void 0 : _b.genre));
    console.log("Scope To Pull Request: ".concat(settings.Parameters.scopeToPullRequest));
    console.log("OrgUrl: ".concat(settings.Environment.orgUrl));
    console.log("RepoId: ".concat(settings.Environment.repoId));
    console.log("ProjectId: ".concat(settings.Environment.projectId));
    console.log("PullRequestId: ".concat(settings.Environment.pullRequestId));
    console.log("Sources Directory: ".concat(settings.Environment.sourcesDirectory));
    if (!((_c = settings.Parameters.solutionPath) === null || _c === void 0 ? void 0 : _c.trim())) {
        console.error("SolutionPath is not set.");
        process.exit(1);
    }
    return settings;
};
exports.getSettings = getSettings;
