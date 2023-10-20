/**
* Environment class parameters.
* @property {string | undefined} orgUrl - The organization URL.
* @property {string | undefined} repoId - The repository ID.
* @property {string | undefined} projectId - The project ID.
* @property {number | undefined} pullRequestId - The pull request ID.
* @property {string | undefined} token - The access token used for authentication. 
*/
export class Environment {
    orgUrl!: string;
    repoId!: string;
    projectId!: string;
    pullRequestId!: number;
    token?: string;
}
