"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runFormatCheck = runFormatCheck;
exports.getChangedFilesInPR = getChangedFilesInPR;
exports.updatePullRequestThreads = updatePullRequestThreads;
exports.markResolvedThreadsAsClosed = markResolvedThreadsAsClosed;
exports.getStatusDescription = getStatusDescription;
exports.setPullRequestStatusAndDetermineShouldFailTask = setPullRequestStatusAndDetermineShouldFailTask;
var gi = __importStar(require("azure-devops-node-api/interfaces/GitInterfaces"));
var pull_request_file_change_1 = require("./types/pull-request-file-change");
var pull_request_service_1 = require("./services/pull-request-service");
var format_check_runner_1 = require("./services/format-check-runner");
var path_normalizer_1 = require("./utils/path-normalizer");
var commentPreamble = '[DotNetFormatTask][Automated]';
/**
 * The `runFormatCheck` is an asynchronous function that performs a formatting check on certain code files and updates pull request status accordingly.
 *
 * The function follows these main steps:
 * 1. Initializes and starts a format check runner with appropriate file paths provided via Settings.
 * 2. Generates annotated reports for the files checked.
 * 3. If the scope is set to Pull Request, it retrieves the list of files involved in the Pull Request and updates the reports accordingly.
 * 4. Updates the Pull Request comment threads based on the resulting check report.
 * 5. Sets the final Pull Request status based on the check outcome and determines if the task should fail.
 *
 * @async
 * @function runFormatCheck
 * @param {Settings} settings - Settings object containing parameters needed for the format check runner and Pull Request Service.
 * @returns {Promise<boolean>} - Promise resolving to a boolean indicating if the task should fail due to formatting errors.
 */
function runFormatCheck(settings) {
    return __awaiter(this, void 0, void 0, function () {
        var pullRequestService, runner, reports, annotatedReports, changedInPR_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, pull_request_service_1.getPullRequestService)(settings)];
                case 1:
                    pullRequestService = _a.sent();
                    if (!settings.Parameters.statusCheck) return [3 /*break*/, 3];
                    return [4 /*yield*/, pullRequestService.updatePullRequestStatus(gi.GitStatusState.Pending, getStatusDescription)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    runner = new format_check_runner_1.FormatCheckRunner(settings.Parameters.solutionPath, settings.Parameters.includePath, settings.Parameters.excludePath);
                    return [4 /*yield*/, runner.runFormatCheck()];
                case 4:
                    reports = _a.sent();
                    annotatedReports = reports.map(function (r) {
                        return __assign(__assign({}, r), { FilePath: new path_normalizer_1.PathNormalizer(settings).normalizeFilePath(r.FilePath), commitId: '', changeType: gi.VersionControlChangeType.None });
                    });
                    if (!settings.Parameters.scopeToPullRequest) return [3 /*break*/, 6];
                    console.log("Scoping issues to files part of the Pull Request.");
                    return [4 /*yield*/, getChangedFilesInPR(pullRequestService, settings)];
                case 5:
                    changedInPR_1 = _a.sent();
                    annotatedReports = annotatedReports.map(function (report) {
                        var change = changedInPR_1.find(function (c) { return c.FilePath === report.FilePath; });
                        if (change) {
                            report.commitId = change.CommitId;
                            report.changeType = change.changeType;
                        }
                        return report;
                    }).filter(function (x) {
                        var include = changedInPR_1.some(function (c) { return c.FilePath === x.FilePath; });
                        if (include) {
                            console.log("\u2714 Include file: ".concat(x.FilePath));
                        }
                        else {
                            console.log("\u274C Exclude file: ".concat(x.FilePath));
                        }
                        return include;
                    });
                    // Filter format issues to only include those in changed lines
                    annotatedReports = annotatedReports.map(function (report) {
                        var change = changedInPR_1.find(function (c) { return c.FilePath === report.FilePath; });
                        if (change && change.lineChanges.length > 0) {
                            report.FileChanges = report.FileChanges.filter(function (changeData) {
                                return change.lineChanges.includes(changeData.LineNumber);
                            });
                        }
                        return report;
                    }).filter(function (report) { return report.FileChanges.length > 0; });
                    _a.label = 6;
                case 6: 
                // Update the Pull Request comment threads based on the format check reports
                return [4 /*yield*/, updatePullRequestThreads(pullRequestService, annotatedReports)];
                case 7:
                    // Update the Pull Request comment threads based on the format check reports
                    _a.sent();
                    return [4 /*yield*/, setPullRequestStatusAndDetermineShouldFailTask(pullRequestService, annotatedReports.length > 0, settings.Parameters.failOnFormattingErrors, settings.Parameters.statusCheck)];
                case 8: 
                // Set final Pull Request status and determine if the task should fail
                return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * The `getChangedFilesInPR` function retrieves
 * all pull request file changes with respect to their commits it handles.
 *
 * @param {PullRequestService} pullRequestUtils - An instance of PullRequestService to interact with Pull Request API
 * @param {Settings} settings
 * @return {Promise<PullRequestFileChanges>} - Returns a Promise that resolves to an array of file changes.
 * Each record denotes a path, commit id and change type in a file as a result of a commit.
 *
 * @description
 * Function operates asynchronously, because of the nature of its service calls to GitService and PullRequestService.
 */
function getChangedFilesInPR(pullRequestUtils, settings) {
    return __awaiter(this, void 0, void 0, function () {
        var pullRequestChanges, maxRetries, attempt, error_1, files, _loop_1, _i, _a, change;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    console.log("Getting the PR commits...");
                    maxRetries = 3;
                    attempt = 0;
                    _d.label = 1;
                case 1:
                    if (!(attempt < maxRetries)) return [3 /*break*/, 8];
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 4, , 7]);
                    return [4 /*yield*/, pullRequestUtils.getPullRequestChanges()];
                case 3:
                    // Due to intermittent issues with Azure DevOps API (ECONNRESET), we implement a retry mechanism
                    pullRequestChanges = _d.sent();
                    return [3 /*break*/, 8];
                case 4:
                    error_1 = _d.sent();
                    attempt++;
                    console.warn("Attempt ".concat(attempt, " to getPullRequestChanges failed: ").concat(error_1));
                    if (!(attempt < maxRetries)) return [3 /*break*/, 6];
                    return [4 /*yield*/, new Promise(function (res) { return setTimeout(res, 1000 * attempt); })];
                case 5:
                    _d.sent();
                    _d.label = 6;
                case 6: return [3 /*break*/, 7];
                case 7: return [3 /*break*/, 1];
                case 8:
                    if (!pullRequestChanges) {
                        throw new Error("Pull request changes could not be retrieved.");
                    }
                    files = [];
                    _loop_1 = function (change) {
                        if (change.item.path == undefined) {
                            console.warn("Warning: File path is undefined for commit id " + ((_b = change.item) === null || _b === void 0 ? void 0 : _b.commitId));
                            return "continue";
                        }
                        var normalizedPath = new path_normalizer_1.PathNormalizer(settings).normalizeFilePath(change.item.path);
                        // Extract line changes if available
                        var lineChanges = [];
                        if (change) {
                            // Check if the change has a 'changes' property and handle it
                            if (change.changes && Array.isArray(change.changes)) {
                                for (var _e = 0, _f = change.changes; _e < _f.length; _e++) {
                                    var fileChange = _f[_e];
                                    if (fileChange.addedLines && Array.isArray(fileChange.addedLines)) {
                                        fileChange.addedLines.forEach(function (line) {
                                            if (line && line.lineNumber > 0) {
                                                lineChanges.push(line.lineNumber);
                                            }
                                        });
                                    }
                                    if (fileChange.removedLines && Array.isArray(fileChange.removedLines)) {
                                        fileChange.removedLines.forEach(function (line) {
                                            if (line && line.lineNumber > 0) {
                                                lineChanges.push(line.lineNumber);
                                            }
                                        });
                                    }
                                }
                            }
                        }
                        files.push(new pull_request_file_change_1.PullRequestFileChange(normalizedPath, (_c = change.item) === null || _c === void 0 ? void 0 : _c.commitId, change.changeType, lineChanges));
                    };
                    for (_i = 0, _a = pullRequestChanges; _i < _a.length; _i++) {
                        change = _a[_i];
                        _loop_1(change);
                    }
                    console.log("All changed files considered to be part of this Pull Request: ");
                    files.forEach(function (file) {
                        console.log("".concat(file.FilePath, " - ").concat(file.changeType, " - ").concat(file.CommitId));
                        if (file.lineChanges.length > 0) {
                            console.log("  Changed lines: ".concat(file.lineChanges.join(', ')));
                        }
                    });
                    return [2 /*return*/, files];
            }
        });
    });
}
/**
 * The `updatePullRequestThreads` function updates the pull request comment threads based on given format check reports.
 *
 * @param {PullRequestService} pullRequestService - An instance of PullRequestService to interact with the Pull Request API.
 * @param {AnnotatedReports} reports - AnnotatedReports object containing information about every commit that contains formatting issues.
 *
 * @returns {Promise<void>} - Returns a Promise that will be fulfilled after all the pull request comment threads have been updated.
 *
 * @description
 * This function operates asynchronously due to the nature of its service calls to the PullRequestService.
 * It fetches existing threads and for each report in `reports`, it generates a content for comments which keeps the track of active issues.
 * If there is an existing thread for the active issue, it updates that thread; if not, it creates a new thread for the issue.
 * Lastly, it also closes threads for resolved issues.
 */
function updatePullRequestThreads(pullRequestService, reports) {
    return __awaiter(this, void 0, void 0, function () {
        var existingThreads, activeIssuesContent, _i, reports_1, report, _loop_2, _a, _b, change;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log("Fetching existing threads.");
                    return [4 /*yield*/, pullRequestService.getThreads()];
                case 1:
                    existingThreads = _c.sent();
                    console.log("Completed fetching existing threads.");
                    activeIssuesContent = [];
                    _i = 0, reports_1 = reports;
                    _c.label = 2;
                case 2:
                    if (!(_i < reports_1.length)) return [3 /*break*/, 7];
                    report = reports_1[_i];
                    _loop_2 = function (change) {
                        var content, existingThread, comment, thread, thread;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    content = "".concat(commentPreamble, " ").concat(change.DiagnosticId, ": ").concat(change.FormatDescription, " on line ").concat(change.LineNumber, ", position ").concat(change.CharNumber);
                                    activeIssuesContent.push(content); // Keep track of active issues
                                    existingThread = existingThreads.find(function (thread) { var _a; return (_a = thread.comments) === null || _a === void 0 ? void 0 : _a.some(function (comment) { return comment.content === content; }); });
                                    comment = {
                                        content: content,
                                        commentType: gi.CommentType.Text
                                    };
                                    if (!existingThread) return [3 /*break*/, 2];
                                    console.log("Updating existing thread.");
                                    if (!existingThread.id) {
                                        throw new Error("Existing thread id is not set.");
                                    }
                                    thread = {
                                        status: gi.CommentThreadStatus.Active,
                                        lastUpdatedTime: new Date()
                                    };
                                    return [4 /*yield*/, pullRequestService.updateThread(thread, existingThread.id)];
                                case 1:
                                    _d.sent();
                                    return [3 /*break*/, 4];
                                case 2:
                                    if (report.changeType === gi.VersionControlChangeType.Delete) {
                                        console.log("Skipping creating thread for deleted file ".concat(report.FilePath, "."));
                                        return [2 /*return*/, "continue"];
                                    }
                                    console.log("\uD83D\uDCDD Creating new thread for file ".concat(report.FilePath, "."));
                                    thread = {
                                        comments: [comment],
                                        status: gi.CommentThreadStatus.Active,
                                        threadContext: {
                                            filePath: report.FilePath,
                                            rightFileStart: { line: change.LineNumber, offset: change.CharNumber },
                                            rightFileEnd: { line: change.LineNumber, offset: change.CharNumber + 1 }
                                        }
                                    };
                                    return [4 /*yield*/, pullRequestService.createThread(thread)];
                                case 3:
                                    _d.sent();
                                    _d.label = 4;
                                case 4: return [2 /*return*/];
                            }
                        });
                    };
                    _a = 0, _b = report.FileChanges;
                    _c.label = 3;
                case 3:
                    if (!(_a < _b.length)) return [3 /*break*/, 6];
                    change = _b[_a];
                    return [5 /*yield**/, _loop_2(change)];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5:
                    _a++;
                    return [3 /*break*/, 3];
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7: 
                // Close threads for resolved issues
                return [4 /*yield*/, markResolvedThreadsAsClosed(pullRequestService, existingThreads, activeIssuesContent)];
                case 8:
                    // Close threads for resolved issues
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Asynchronously marks threads that were previously marked as resolved now as closed.
 *
 * @param {PullRequestService} pullRequestService - An instance of PullRequestService to interact with the Pull Request API.
 * @param {gi.GitPullRequestCommentThread[]} existingThreads - The current set of existing pull request comment threads.
 * @param {string[]} activeIssuesContent - The content of comments that have active issues.
 *
 * @description
 * Iterates over the existing threads filtered for those starting with a specific preamble.
 * If the existing thread status is set to closed, it is ignored. Else, for each existing thread, its content is compared with the
 * contents of active issues. If a particular threads content does not match, it is considered as resolved and hence marked as closed.
 */
function markResolvedThreadsAsClosed(pullRequestService, existingThreads, activeIssuesContent) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, _a, existingThread, threadContent, closedThread;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _i = 0, _a = existingThreads.filter(function (thread) { var _a; return (_a = thread.comments) === null || _a === void 0 ? void 0 : _a.some(function (comment) { var _a; return (_a = comment.content) === null || _a === void 0 ? void 0 : _a.startsWith(commentPreamble); }); });
                    _d.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    existingThread = _a[_i];
                    console.log("Processing the existing thread for file ".concat((_b = existingThread.threadContext) === null || _b === void 0 ? void 0 : _b.filePath, "."));
                    if (existingThread.status === gi.CommentThreadStatus.Closed) {
                        return [3 /*break*/, 3];
                    }
                    threadContent = (_c = existingThread.comments[0]) === null || _c === void 0 ? void 0 : _c.content;
                    if (!(threadContent && !activeIssuesContent.includes(threadContent))) return [3 /*break*/, 3];
                    console.log("🔒 Closing resolved thread.");
                    if (!existingThread.id) {
                        throw new Error("Existing thread id is not set.");
                    }
                    closedThread = {
                        status: gi.CommentThreadStatus.Closed
                    };
                    return [4 /*yield*/, pullRequestService.updateThread(closedThread, existingThread.id)];
                case 2:
                    _d.sent();
                    _d.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Function `getStatusDescription` provides human-reader friendly status messages based on git status state.
 * @param {gi.GitStatusState} status - determines a state of the Git.
 * @returns {string} - corresponding message to the Git state.
 */
function getStatusDescription(status) {
    switch (status) {
        case gi.GitStatusState.Pending:
            return "Format check is running";
        case gi.GitStatusState.Failed:
            return "Formatting errors found";
        case gi.GitStatusState.Error:
            return "Formatting task failed with an error.";
        default:
            return "No formatting errors found";
    }
}
/**
 * An asynchronous function named `setPullRequestStatusAndDetermineShouldFailTask` is used for setting the status for pull requests and determining if the task should fail or not.
 *
 * @param {PullRequestService} pullRequestService - An instance of PullRequestService which is used to handle interactions with the Pull Request API.
 * @param {boolean} formatIssuesExist - It denotes whether issues related with code format exist or not.
 * @param {boolean} failOnFormattingErrors - It signifies whether the formatting errors should cause the function to fail.
 * @param {boolean} setStatusCheck - It signifies whether the status check is to be set or not.
 * @returns {Promise<boolean>} - The function returns a promise that resolves to a boolean indicating if the task should fail based on the code format.
 *
 * @description
 * This function makes use of console variable for logging and PullRequestService for setting the pull request status. In case of formatting errors and when set to fail on such errors,
 * the function logs a failure message and subsequently sets the pull request status to 'Failed'. If there are no formatting issues or the function is not set to fail on such issues,
 * the successful log message is printed and the pull request status is set to 'Succeeded'.
 */
function setPullRequestStatusAndDetermineShouldFailTask(pullRequestService, formatIssuesExist, failOnFormattingErrors, setStatusCheck) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!formatIssuesExist) return [3 /*break*/, 3];
                    if (!setStatusCheck) return [3 /*break*/, 2];
                    return [4 /*yield*/, pullRequestService.updatePullRequestStatus(gi.GitStatusState.Failed, getStatusDescription)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    if (failOnFormattingErrors) {
                        console.log("##vso[task.complete result=Failed;]Code format is incorrect.");
                        return [2 /*return*/, true];
                    }
                    else {
                        console.log("##vso[task.complete result=Succeeded;]Code format is incorrect.");
                        return [2 /*return*/, false];
                    }
                    return [3 /*break*/, 6];
                case 3:
                    console.log("##vso[task.complete result=Succeeded;]Code format is correct.");
                    if (!setStatusCheck) return [3 /*break*/, 5];
                    return [4 /*yield*/, pullRequestService.updatePullRequestStatus(gi.GitStatusState.Succeeded, getStatusDescription)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [2 /*return*/, false];
                case 6: return [2 /*return*/];
            }
        });
    });
}
