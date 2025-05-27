import {VersionControlChangeType} from "azure-devops-node-api/interfaces/GitInterfaces";

/**
 * @class PullRequestFileChange
 * A class to represent individual file changes within a Pull Request.
 */
export class PullRequestFileChange {
    constructor(FilePath: string, CommitId: string, changeType: VersionControlChangeType, lineStart?: number, lineEnd?: number) {
        this.FilePath = FilePath;
        this.CommitId = CommitId;
        this.changeType = changeType;
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
    }

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

    /**
     * The starting line number of the change (1-based).
     *
     * @type {number}
     */
    lineStart?: number;

    /**
     * The ending line number of the change (1-based).
     *
     * @type {number}
     */
    lineEnd?: number;
}

/**
 * @class PullRequestFileChanges
 * An array-like class to hold multiple PullRequestFileChange instances.
 *
 * @extends {Array<PullRequestFileChange>}
 */
export class PullRequestFileChanges extends Array<PullRequestFileChange> {
}
