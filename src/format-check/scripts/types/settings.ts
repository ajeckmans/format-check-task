import {Environment} from "./environment";
import {Parameters} from "./parameters";


/**
 * @class Settings
 * This class represents the combination of environment data and project parameters.
 *
 * @property {Environment} Environment - Holds data related to the project's running environment.
 * @property {Parameters} Parameters - A special class encapsulating various project related settings and preferences.
 */
export class Settings {
    Environment: Environment;
    Parameters: Parameters;
}

/**
* Returns an object of type `Settings` populated from environment variables.
* 
* @function getSettings
* @returns {Settings} - An object that holds various environmental variables and parameters.
* 
* @throws {Error} Will exit the process if `SYSTEM_PULLREQUEST_PULLREQUESTID` or `SolutionPath` is not set.
*/
export const getSettings = (): Settings => {
    const pullRequestId = parseInt(process.env.SYSTEM_PULLREQUEST_PULLREQUESTID!, 10);

    if (!pullRequestId) {
        console.log("Not a PR build. Skipping.");
        process.exit(0);
    }

    const settings: Settings = {
        Environment: {
            orgUrl: process.env.SYSTEM_TEAMFOUNDATIONCOLLECTIONURI!,
            repoId: process.env.BUILD_REPOSITORY_ID!,
            projectId: process.env.SYSTEM_TEAMPROJECTID!,
            pullRequestId: pullRequestId,
            token: process.env.SYSTEM_ACCESSTOKEN!
        },
        Parameters: {
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
            token: process.env.INPUT_PAT || process.env.SYSTEM_ACCESSTOKEN
        }
    };

    console.log('task input parameters:');
    console.log(`Solution Path: ${settings.Parameters.solutionPath}`);
    console.log(`Include Path: ${settings.Parameters.includePath}`);
    console.log(`Exclude Path: ${settings.Parameters.excludePath}`);
    console.log(`Status Check: ${settings.Parameters.statusCheck}`);
    console.log(`Fail On Formatting Errors: ${settings.Parameters.failOnFormattingErrors}`);
    console.log(`Status Check Name: ${settings.Parameters.statusCheckContext.name}`);
    console.log(`Status Check Genre: ${settings.Parameters.statusCheckContext.genre}`);
    console.log(`Scope To Pull Request: ${settings.Parameters.scopeToPullRequest}`);

    console.log(`OrgUrl: ${settings.Environment.orgUrl}`);
    console.log(`RepoId: ${settings.Environment.repoId}`);
    console.log(`ProjectId: ${settings.Environment.projectId}`);
    console.log(`PullRequestId: ${settings.Environment.pullRequestId}`);


    if (!settings.Parameters.solutionPath?.trim()) {
        console.error("SolutionPath is not set.");
        process.exit(1);
    }

    return settings;
};