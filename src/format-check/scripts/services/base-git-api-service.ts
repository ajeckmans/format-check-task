/**
 * @module BaseGitApiService
 * Provides functionalities to initialize and get Azure DevOps Git API service.
 */

import * as azdev from "azure-devops-node-api";
import {IGitApi} from "azure-devops-node-api/GitApi";
import {Settings} from "../types/settings";

export module BaseGitApiService {
    /**
     * Stores an instance of the Azure DevOps Git API.
     */
    let GitApi: IGitApi;

    /**
     * Initializes the Azure DevOps Git API with authentication and other configurations.
     *
     * @param settings - The configuration settings.
     * @returns {Promise<void>} - A promise that resolves when the API is initialized.
     *
     * @example
     * await init(mySettings);
     *
     * @see [azdev.getPersonalAccessTokenHandler](https://github.com/microsoft/azure-devops-node-api/blob/main/api/PersonalAccessTokenCredentialHandler.ts)
     * @see [azdev.WebApi](https://github.com/microsoft/azure-devops-node-api/blob/main/api/WebApi/WebApi.ts)
     */
    export async function init(settings: Settings): Promise<void> {
        console.log("Creating personal access token handler.");
        const authHandler = azdev.getPersonalAccessTokenHandler(settings.Parameters.token);

        console.log("Creating TFS connection.");
        const connection = new azdev.WebApi(settings.Environment.orgUrl, authHandler);

        console.log("Getting Git API.");
        GitApi = await connection.getGitApi();
    }

    /**
     * Returns the initialized instance of Azure DevOps Git API.
     *
     * @returns {IGitApi} - The initialized Git API instance.
     *
     * @example
     * const gitApi = getGitApi();
     */
    export function getGitApi(): IGitApi {
        return GitApi;
    }
}
