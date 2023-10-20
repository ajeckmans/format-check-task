import {IGitApi} from "azure-devops-node-api/GitApi";
import * as gi from "azure-devops-node-api/interfaces/GitInterfaces";
import {
    GitPullRequestCommentThread,
    GitVersionOptions,
    GitVersionType
} from "azure-devops-node-api/interfaces/GitInterfaces";
import {Settings} from "../types/settings";
import {BaseGitApiService} from "./base-git-api-service";

/**
 * PullRequestService class is a service that offers methods to interact with pull requests.
 * Its purpose is to help in performing operations related to pull requests like obtaining pull request commits,
 * updating pull request statuses and working with threads in pull requests.
 *
 * @class
 * @public
 *
 * @property {IGitApi} gitApi - An instance of IGitApi to interact with Azure DevOps Git API.
 * @property {Settings} settings - An instance of Settings, containing project-specific parameters and environment variables.
 *
 * @method constructor(gitApi, settings) - Initializes a new instance of the PullRequestService class.
 * @method async updatePullRequestStatus(status, getStatusDescription) - Asynchronously updates the pull request status.
 * @method private async getLastPullRequestIteration() - Asynchronously obtains the last pull request iteration.
 * @method async getPullRequestChanges() - Asynchronously fetches and returns the changes made in a pull request.
 * @method async getThreads() - Asynchronously gets the threads related to a pull request.
 * @method async updateThread(commentThread, existingThreadId) - Asynchronously updates a specific thread of a pull request.
 * @method async createThread(thread) - Asynchronously creates a new thread in a pull request.
 */
export class PullRequestService {
    /**
     * Constructor for PullRequestService.
     *
     * @param {IGitApi} gitApi - An instance of IGitApi to interact with Azure DevOps Git API.
     * @param {Settings} settings - An instance of Settings to use project-specific parameters and environment variables.
     */

    constructor(private gitApi: IGitApi, private settings: Settings) {
    }

    /**
     * Async method that updates the pull request status.
     *
     * @method updatePullRequestStatus
     * @public
     * @async
     *
     * @param {gi.GitStatusState} status - The status enum of GitStatusState, representing the status of the pull request.
     * @param {Function} getStatusDescription - A function that returns the description of the GitStatusState status.
     *
     * This method first gets the last pull request iteration ID, then creates a GitPullRequestStatus object.
     * Finally, it calls the `createPullRequestStatus` method from the `gitApi` to update the pull request status.
     *
     * @returns {Promise<void>} A promise that resolves when the pull request status has been updated.
     */
    async updatePullRequestStatus(status: gi.GitStatusState, getStatusDescription: (status: gi.GitStatusState) => string): Promise<void> {

        if (!this.settings.Parameters.statusCheck) {
            console.warn("updatePullRequestStatus called to set status check, but statusCheck task parameter is false");
            return;
        }

        if (!this.settings.Parameters.statusCheckContext) {
            throw new Error("statusCheckContext is not set in the settings");
        }

        const logMsg = `Setting status check '${this.settings.Parameters.statusCheckContext.genre}\\${this.settings.Parameters.statusCheckContext.name}' to: ${gi.GitStatusState[status]}`;
        console.log(logMsg);

        const iterationId = await this.getLastPullRequestIteration();

        const prStatus: gi.GitPullRequestStatus = {
            context: this.settings.Parameters.statusCheckContext,
            state: status,
            description: getStatusDescription(status),
            iterationId: iterationId,
        };
        await this.gitApi.createPullRequestStatus(prStatus, this.settings.Environment.repoId, this.settings.Environment.pullRequestId);
    }

    /**
     * Asynchronously fetches and returns the changes made in a pull request.
     *
     * @method getPullRequestChanges
     * @public
     * @async
     *
     * This method first fetches an instance of the pull request with the help of the `gitApi.getPullRequest` method,
     * using repository id, pull request id, and project id derived from `settings.Environment`.
     * Then, it fetches the differences between the base version (source branch) and the target version (target branch)
     * of the pull request using the `gitApi.getCommitDiffs` method.
     *
     * The `baseVersion`, `baseVersionOptions`, `baseVersionType`, `targetVersion`, `targetVersionOptions`,
     * and `targetVersionType` parameters for `gitApi.getCommitDiffs` method are set using the properties of
     * the obtained pull request instance.
     *
     * @returns {Promise<gi.GitChange[]>} A promise that fulfills with an array of GitChange objects that represents the changes
     * made in the pull request. If there are no changes, an empty array is returned.
     */
    async getPullRequestChanges(): Promise<gi.GitChange[]> {
        let pr = await this.gitApi.getPullRequest(this.settings.Environment.repoId,
            this.settings.Environment.pullRequestId,
            this.settings.Environment.projectId);
        let commitDiffs = await this.gitApi.getCommitDiffs(
            this.settings.Environment.repoId,
            this.settings.Environment.projectId,
            false,
            undefined,
            undefined,
            {
                baseVersion: pr.sourceRefName,
                baseVersionOptions: GitVersionOptions.None,
                baseVersionType: GitVersionType.Branch
            },
            {
                targetVersion: pr.targetRefName,
                targetVersionOptions: GitVersionOptions.None,
                targetVersionType: GitVersionType.Branch
            });

        return commitDiffs.changes || [];
    }

    /**
     * Asynchronously fetches and returns discussion threads related to a specific pull request.
     *
     * @method getThreads
     * @public
     * @async
     *
     * This method uses the `gitApi` instance to call the `getThreads` function where it fetches all discussion threads for
     * a specific pull request in the Azure DevOps Git API. The repository id, pull request id, and project id derived from
     * the properties of `settings.EnvVars` specified in the Settings instance are used to target the correct pull request.
     * Fetching pull request threads can be beneficial when wanting to analyze the discussions and comments related to a pull
     * request.
     *
     * @returns {Promise<gi.GitPullRequestCommentThread[]>} A promise that fulfills with an array of
     * GitPullRequestCommentThread objects representing all the threads involved in the pull request discussion. Each
     * GitPullRequestCommentThread object encapsulates information regarding a single thread including the comments,
     * the status of the thread, and so on.
     */
    async getThreads(): Promise<gi.GitPullRequestCommentThread[]> {
        return await this.gitApi.getThreads(
            this.settings.Environment.repoId,
            this.settings.Environment.pullRequestId,
            this.settings.Environment.projectId);
    }


    /**
     * Asynchronously updates a specific thread of a pull request.
     *
     * @method updateThread
     * @public
     * @async
     *
     * @param {GitPullRequestCommentThread} commentThread - The comment thread object containing the modifications.
     * @param {number} existingThreadId - The ID of the existing thread to be updated.
     *
     * This method leverages the `gitApi` instance to interact with the Azure DevOps Git API's `updateThread` method.
     * It uses the repository id, pull request id, and project id from `settings.EnvVars` to pinpoint the desired pull request.
     * This is used when modifications are required in a specific discussion thread concerning a pull request.
     *
     * @returns {Promise<gi.GitPullRequestCommentThread>} A promise that fulfills with the updated GitPullRequestCommentThread
     * object once the thread update operation completes.
     */
    async updateThread(commentThread: GitPullRequestCommentThread, existingThreadId: number): Promise<gi.GitPullRequestCommentThread> {
        return await this.gitApi.updateThread(
            commentThread,
            this.settings.Environment.repoId,
            this.settings.Environment.pullRequestId,
            existingThreadId,
            this.settings.Environment.projectId)
    }

    /**
     * Asynchronously creates a new discussion thread in a specific pull request.
     *
     * @method createThread
     * @public
     * @async
     *
     * @param {GitPullRequestCommentThread} thread - The comment thread object to be created in the pull request.
     *
     * This method employs the `gitApi` instance to call the Azure DevOps Git API's `createThread` method.
     * It uses attributes like repository id, pull request id, and project id from `settings.EnvVars` to
     * target the intended pull request. Typically, a new thread could be created to start a discussion about
     * some aspect of the pull request.
     *
     * @returns {Promise<gi.GitPullRequestCommentThread>} A promise that fulfills with the newly created
     * GitPullRequestCommentThread object after the thread creation operation is done.
     */
    async createThread(thread: GitPullRequestCommentThread): Promise<gi.GitPullRequestCommentThread> {
        return this.gitApi.createThread(
            thread,
            this.settings.Environment.repoId,
            this.settings.Environment.pullRequestId,
            this.settings.Environment.projectId);
    }

    /**
     * Private asynchronous method that retrieves the last pull request iteration's ID.
     *
     * @private
     * @async
     *
     * @method getLastPullRequestIteration
     *
     * This method internally queries the Azure DevOps Git API to fetch all iterations of a pull request
     * by utilizing project-specific parameters and environment variables provided in the Settings instance.
     * From the received data, it retrieves and returns the ID of the last pull request iteration.
     *
     * @returns {Promise<number>} A promise that fulfills with the ID of the last iteration of the pull request.
     */
    private async getLastPullRequestIteration(): Promise<number> {
        const pullRequestIterations = await this.gitApi.getPullRequestIterations(
            this.settings.Environment.repoId,
            this.settings.Environment.pullRequestId,
            this.settings.Environment.projectId,
            true);

        const lastIteration = pullRequestIterations.pop();
        if (!lastIteration?.id) {
            throw new Error("Last PullRequest Iteration ID not set");
        }
        return lastIteration.id;
    }

}

/**
 * The async function `getPullRequestService` initializes the BaseGitApiService with the specified settings and then returns
 * a new instance of the PullRequestService with the BaseGitApiService's GitApi and the specified settings.
 *
 * @param {Settings} settings - An instance of Settings containing project-specific parameters and environment variables.
 * @returns {Promise<PullRequestService>} A promise that resolves to a new instance of PullRequestService.
 */
export async function getPullRequestService(settings: Settings): Promise<PullRequestService> {
    return new PullRequestService(await BaseGitApiService.getGitApi(), settings);
}