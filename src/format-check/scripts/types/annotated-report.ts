import {FormatReport} from "./format-report";
import {VersionControlChangeType} from "azure-devops-node-api/interfaces/GitInterfaces";

/**
 * @class AnnotatedReport
 * Extends FormatReport to include version control information.
 *
 * @extends {FormatReport}
 */
export class AnnotatedReport extends FormatReport {
    constructor(commitId: string, changeType: VersionControlChangeType, lineStart?: number, lineEnd?: number) {
        super();
        this.commitId = commitId;
        this.changeType = changeType;
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
    }

    /**
     * The commit ID associated with the report.
     *
     * @type {string}
     */
    commitId: string;

    /**
     * The type of version control change associated with the report.
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
 * An array of AnnotatedReport objects.
 *
 * @type {AnnotatedReport[]}
 */
export type AnnotatedReports = AnnotatedReport[];
