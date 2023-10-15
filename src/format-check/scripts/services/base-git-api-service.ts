import * as azdev from "azure-devops-node-api";
import {IGitApi} from "azure-devops-node-api/GitApi";
import {Settings} from "../types/settings";

export class BaseGitApiService {
    private static GitApi: IGitApi | null = null;

    public static async init(settings: Settings): Promise<void> {
        if (this.GitApi != null) {
            return;
        }

        console.log("Creating personal access token handler.");
        const authHandler = azdev.getPersonalAccessTokenHandler(settings.Parameters.token);

        console.log("Creating TFS connection.");
        const connection = new azdev.WebApi(settings.Environment.orgUrl, authHandler);

        console.log("Getting Git API.");
        this.GitApi = await connection.getGitApi();
    }

    public static getGitApi(): IGitApi {
        if (this.GitApi == null) {
            throw new Error('call BaseGitApiService.init() first');
        }
        return this.GitApi;
    }

    // This method is only for testing purposes
    public static reset() {
        this.GitApi = null;
    }

}
