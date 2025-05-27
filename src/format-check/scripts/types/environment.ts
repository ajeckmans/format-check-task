/**
 * @class Environment
 * This class represents the environment in which the project is running.
 *
 * @property {string} orgUrl - The URL of the organization.
 * @property {string} repoId - The ID of the repository.
 * @property {string} projectId - The ID of the project.
 * @property {number} pullRequestId - The ID of the pull request.
 * @property {string} token - The authentication token.
 * @property {string} sourcesDirectory - The directory containing the source code.
 * @property {string} pullRequestSourceCommit - The commit ID of the source branch.
 * @property {string} pullRequestTargetBranch - The target branch of the pull request.
 */
export class Environment {
    orgUrl!: string;
    repoId!: string;
    projectId!: string;
    pullRequestId!: number;
    token!: string;
    sourcesDirectory!: string;
    pullRequestSourceCommit!: string;
    pullRequestTargetBranch!: string;
}
