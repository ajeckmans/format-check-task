"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parameters = void 0;
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
 * @param {boolean} statusCheck - Whether to set the status check or not.
 * @param {Object} statusCheckContext - Context for the status check comprising genre and name attributes.
 * @param {string | undefined} token - Authentication token. Can be undefined.
 */
var Parameters = /** @class */ (function () {
    function Parameters() {
    }
    return Parameters;
}());
exports.Parameters = Parameters;
