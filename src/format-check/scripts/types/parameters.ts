/**
 * The Parameters class models the attributes for configuration settings.
 *
 * @class
 *
 * @param {string | undefined} solutionPath - The path of the solution to check. Can be undefined.
 * @param {string | undefined} excludePath - Path to exclude from the files to check. Can be undefined.
 * @param {boolean} failOnFormattingErrors - Whether to fail the process on formatting errors.
 * @param {string | undefined} includePath - Path to include for files to check. Can be undefined.
 * @param {boolean} scopeToPullRequest - Whether the operation scope is limited to thr pull request or not.
 * @param {boolean} scopeToChangedLines - Whether to limit validation to only the lines that have changed.
 * @param {boolean} statusCheck - Whether to set the status check or not.
 * @param {Object} statusCheckContext - Context for the status check comprising genre and name attributes.
 * @param {string | undefined} token - Authentication token. Can be undefined.
 */
export class Parameters {
    solutionPath!: string;
    excludePath: string | undefined;
    failOnFormattingErrors!: boolean;
    includePath: string | undefined;
    scopeToPullRequest!: boolean;
    scopeToChangedLines!: boolean;
    statusCheck!: boolean;
    statusCheckContext: {
        genre: string;
        name: string;
    } | undefined;
    token!: string;
}
