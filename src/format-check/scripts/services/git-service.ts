import {IGitApi} from "azure-devops-node-api/GitApi";
import {Settings} from "../types/settings";
import {BaseGitApiService} from "./base-git-api-service";
import {GitCommitChanges} from "azure-devops-node-api/interfaces/GitInterfaces";

/**
 * The GitService class is designed to interact with the Git API.
 * It encapsulates the interaction with the Git data in your Azure DevOps Services and Team Foundation Server projects.
 *
 * @method constructor(gitApi, settings) - Initializes a new instance of the GitService class.
 */
export class GitService {
    /**
     * Constructor for the GitService class.
     *
     * @param {IGitApi} gitApi - A Git API instance for interacting with Git data in Azure DevOps Services and Team Foundation Server projects.
     * @param {Settings} settings - An instance of Settings containing project-specific parameters and environment variables.
     */
    constructor(private gitApi: IGitApi, private settings: Settings) {
    }

    /**
     * Fetches changes associated with a specific Git commit.
     *
     * @param {string} commitId - The ID of the commit for which to fetch changes.
     *
     * @returns A `Promise<GitCommitChanges>` containing the changes related to the commit.
     */
    async getChanges(commitId: string): Promise<GitCommitChanges> {
        return await this.gitApi.getChanges(
            commitId,
            this.settings.Environment.repoId,
            this.settings.Environment.projectId);
    }

}


/**
 * The async function `getGitService` initializes the BaseGitApiService with the specified settings and then returns
 * a new instance of the GitService with the BaseGitApiService's GitApi and the specified settings.
 *
 * @param {Settings} settings - An instance of Settings containing project-specific parameters and environment variables.
 * @returns {Promise<GitService>} A promise that resolves to a new instance of GitService.
 */
export async function getGitService(settings: Settings): Promise<GitService> {
    return new GitService(await BaseGitApiService.getGitApi(), settings);
}