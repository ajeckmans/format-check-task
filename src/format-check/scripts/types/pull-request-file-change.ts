import {VersionControlChangeType} from "azure-devops-node-api/interfaces/GitInterfaces";

/**
 * @class PullRequestFileChange
 * A class to represent individual file changes within a Pull Request.
 */
export class PullRequestFileChange {
    /**
     * Path to the file that has changed.
     *
     * @type {string}
     */
    FilePath: string;

    /**
     * The commit ID associated with this file change.
     *
     * @type {string}
     */
    CommitId: string;

    /**
     * The type of change that occurred to the file.
     *
     * @type {VersionControlChangeType}
     * @see [VersionControlChangeType](https://learn.microsoft.com/en-us/rest/api/azure/devops/git/pull%20request%20commits/get%20changes?view=azure-devops-rest-7.1)
     */
    changeType: VersionControlChangeType;
}

/**
 * @class PullRequestFileChanges
 * An array-like class to hold multiple PullRequestFileChange instances.
 *
 * @extends {Array<PullRequestFileChange>}
 */
export class PullRequestFileChanges extends Array<PullRequestFileChange> {
}
