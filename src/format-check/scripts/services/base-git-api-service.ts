import { IGitApi } from "azure-devops-node-api/GitApi";
import { Settings } from "../types/settings";
import * as azdev from "azure-devops-node-api";

export class BaseGitApiService {
    private static GitApi: IGitApi | null = null;
    private static GitApiPromise: Promise<IGitApi> | null = null;

    public static async init(settings: Settings): Promise<void> {
        if (this.GitApiPromise) return;

        console.log("Creating personal access token handler.");
        const authHandler = azdev.getPersonalAccessTokenHandler(settings.Parameters.token);

        console.log("Creating TFS connection.");
        const connection = new azdev.WebApi(settings.Environment.orgUrl, authHandler);

        console.log("Getting Git API.");
        this.GitApiPromise = connection.getGitApi();
        this.GitApi = await this.GitApiPromise;
    }

    public static async getGitApi(): Promise<IGitApi> {
        if (this.GitApiPromise === null) {
            throw new Error('call BaseGitApiService.init() first');
        }
        if (this.GitApi === null) {
            this.GitApi = await this.GitApiPromise;
        }
        return this.GitApi;
    }

    public static reset() {
        this.GitApi = null;
        this.GitApiPromise = null;
    }
}
