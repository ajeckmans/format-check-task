"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PullRequestService = void 0;
exports.getPullRequestService = getPullRequestService;
var gi = __importStar(require("azure-devops-node-api/interfaces/GitInterfaces"));
var base_git_api_service_1 = require("./base-git-api-service");
var node_fetch_1 = __importDefault(require("node-fetch"));
/**
 * PullRequestService class is a service that offers methods to interact with pull requests.
 * Its purpose is to help in performing operations related to pull requests like obtaining pull request commits,
 * updating pull request statuses and working with threads in pull requests.
 *
 * @class
 * @public
 *
 * @property {IGitApi} gitApi - An instance of IGitApi to interact with Azure DevOps Git API.
 * @property {Settings} settings - An instance of Settings, containing project-specific parameters and environment variables.
 *
 * @method constructor(gitApi, settings) - Initializes a new instance of the PullRequestService class.
 * @method async updatePullRequestStatus(status, getStatusDescription) - Asynchronously updates the pull request status.
 * @method private async getLastPullRequestIteration() - Asynchronously obtains the last pull request iteration.
 * @method async getPullRequestChanges() - Asynchronously fetches and returns the changes made in a pull request.
 * @method async getThreads() - Asynchronously gets the threads related to a pull request.
 * @method async updateThread(commentThread, existingThreadId) - Asynchronously updates a specific thread of a pull request.
 * @method async createThread(thread) - Asynchronously creates a new thread in a pull request.
 */
var PullRequestService = /** @class */ (function () {
    /**
     * Constructor for PullRequestService.
     *
     * @param {IGitApi} gitApi - An instance of IGitApi to interact with Azure DevOps Git API.
     * @param {Settings} settings - An instance of Settings to use project-specific parameters and environment variables.
     */
    function PullRequestService(gitApi, settings) {
        this.gitApi = gitApi;
        this.settings = settings;
    }
    /**
     * Async method that updates the pull request status.
     *
     * @method updatePullRequestStatus
     * @public
     * @async
     *
     * @param {gi.GitStatusState} status - The status enum of GitStatusState, representing the status of the pull request.
     * @param {Function} getStatusDescription - A function that returns the description of the GitStatusState status.
     *
     * This method first gets the last pull request iteration ID, then creates a GitPullRequestStatus object.
     * Finally, it calls the `createPullRequestStatus` method from the `gitApi` to update the pull request status.
     *
     * @returns {Promise<void>} A promise that resolves when the pull request status has been updated.
     */
    PullRequestService.prototype.updatePullRequestStatus = function (status, getStatusDescription) {
        return __awaiter(this, void 0, void 0, function () {
            var logMsg, iterationId, prStatus;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.settings.Parameters.statusCheck) {
                            console.warn("updatePullRequestStatus called to set status check, but statusCheck task parameter is false");
                            return [2 /*return*/];
                        }
                        if (!this.settings.Parameters.statusCheckContext) {
                            throw new Error("statusCheckContext is not set in the settings");
                        }
                        logMsg = "Setting status check '".concat(this.settings.Parameters.statusCheckContext.genre, "\\").concat(this.settings.Parameters.statusCheckContext.name, "' to: ").concat(gi.GitStatusState[status]);
                        console.log(logMsg);
                        return [4 /*yield*/, this.getLastPullRequestIteration()];
                    case 1:
                        iterationId = _a.sent();
                        prStatus = {
                            context: this.settings.Parameters.statusCheckContext,
                            state: status,
                            description: getStatusDescription(status),
                            iterationId: iterationId,
                        };
                        return [4 /*yield*/, this.gitApi.createPullRequestStatus(prStatus, this.settings.Environment.repoId, this.settings.Environment.pullRequestId)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Asynchronously fetches and returns the changes made in a pull request.
     *
     * @method getPullRequestChanges
     * @public
     * @async
     *
     * This method first fetches an instance of the pull request with the help of the `gitApi.getPullRequest` method,
     * using repository id, pull request id, and project id derived from `settings.Environment`.
     * Then, it fetches the differences between the base version (source branch) and the target version (target branch)
     * of the pull request using the `gitApi.getCommitDiffs` method.
     *
     * The `baseVersion`, `baseVersionOptions`, `baseVersionType`, `targetVersion`, `targetVersionOptions`,
     * and `targetVersionType` parameters for `gitApi.getCommitDiffs` method are set using the properties of
     * the obtained pull request instance.
     *
     * @returns {Promise<gi.GitChange[]>} A promise that fulfills with an array of GitChange objects that represents the changes
     * made in the pull request. If there are no changes, an empty array is returned.
     */
    PullRequestService.prototype.getPullRequestChanges = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pr, sourceRefName, targetRefName, token, encodedToken, url, response, commitDiffs, error_1;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.gitApi.getPullRequestById(this.settings.Environment.pullRequestId, this.settings.Environment.projectId)];
                    case 1:
                        pr = _c.sent();
                        sourceRefName = (_a = pr.sourceRefName) === null || _a === void 0 ? void 0 : _a.replace('refs/heads/', '');
                        targetRefName = (_b = pr.targetRefName) === null || _b === void 0 ? void 0 : _b.replace('refs/heads/', '');
                        console.log("Checking for file changes between ".concat(sourceRefName, " and ").concat(targetRefName));
                        token = this.settings.Parameters.token;
                        encodedToken = Buffer.from(":".concat(token)).toString('base64');
                        url = "".concat(this.settings.Environment.orgUrl).concat(this.settings.Environment.projectId, "/") +
                            "_apis/git/repositories/".concat(this.settings.Environment.repoId, "/diffs/commits") +
                            "?api-version=4.1&baseVersion=".concat(targetRefName, "&targetVersion=").concat(sourceRefName) +
                            "&targetVersionType=branch&baseVersionType=branch&diffCommonCommit=false&inlineChangedLines=true";
                        console.log("Fetching ".concat(url));
                        return [4 /*yield*/, (0, node_fetch_1.default)(url, {
                                headers: {
                                    'Authorization': "Basic ".concat(encodedToken)
                                }
                            })];
                    case 2:
                        response = _c.sent();
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, response.json()];
                    case 4:
                        commitDiffs = (_c.sent());
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _c.sent();
                        console.error("Error parsing JSON response:", error_1);
                        return [2 /*return*/, []];
                    case 6: return [2 /*return*/, (commitDiffs === null || commitDiffs === void 0 ? void 0 : commitDiffs.changes) || []];
                }
            });
        });
    };
    /**
     * Asynchronously fetches and returns discussion threads related to a specific pull request.
     *
     * @method getThreads
     * @public
     * @async
     *
     * This method uses the `gitApi` instance to call the `getThreads` function where it fetches all discussion threads for
     * a specific pull request in the Azure DevOps Git API. The repository id, pull request id, and project id derived from
     * the properties of `settings.EnvVars` specified in the Settings instance are used to target the correct pull request.
     * Fetching pull request threads can be beneficial when wanting to analyze the discussions and comments related to a pull
     * request.
     *
     * @returns {Promise<gi.GitPullRequestCommentThread[]>} A promise that fulfills with an array of
     * GitPullRequestCommentThread objects representing all the threads involved in the pull request discussion. Each
     * GitPullRequestCommentThread object encapsulates information regarding a single thread including the comments,
     * the status of the thread, and so on.
     */
    PullRequestService.prototype.getThreads = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.gitApi.getThreads(this.settings.Environment.repoId, this.settings.Environment.pullRequestId, this.settings.Environment.projectId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Asynchronously updates a specific thread of a pull request.
     *
     * @method updateThread
     * @public
     * @async
     *
     * @param {GitPullRequestCommentThread} commentThread - The comment thread object containing the modifications.
     * @param {number} existingThreadId - The ID of the existing thread to be updated.
     *
     * This method leverages the `gitApi` instance to interact with the Azure DevOps Git API's `updateThread` method.
     * It uses the repository id, pull request id, and project id from `settings.EnvVars` to pinpoint the desired pull request.
     * This is used when modifications are required in a specific discussion thread concerning a pull request.
     *
     * @returns {Promise<gi.GitPullRequestCommentThread>} A promise that fulfills with the updated GitPullRequestCommentThread
     * object once the thread update operation completes.
     */
    PullRequestService.prototype.updateThread = function (commentThread, existingThreadId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.gitApi.updateThread(commentThread, this.settings.Environment.repoId, this.settings.Environment.pullRequestId, existingThreadId, this.settings.Environment.projectId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Asynchronously creates a new discussion thread in a specific pull request.
     *
     * @method createThread
     * @public
     * @async
     *
     * @param {GitPullRequestCommentThread} thread - The comment thread object to be created in the pull request.
     *
     * This method employs the `gitApi` instance to call the Azure DevOps Git API's `createThread` method.
     * It uses attributes like repository id, pull request id, and project id from `settings.EnvVars` to
     * target the intended pull request. Typically, a new thread could be created to start a discussion about
     * some aspect of the pull request.
     *
     * @returns {Promise<gi.GitPullRequestCommentThread>} A promise that fulfills with the newly created
     * GitPullRequestCommentThread object after the thread creation operation is done.
     */
    PullRequestService.prototype.createThread = function (thread) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.gitApi.createThread(thread, this.settings.Environment.repoId, this.settings.Environment.pullRequestId, this.settings.Environment.projectId)];
            });
        });
    };
    /**
     * Private asynchronous method that retrieves the last pull request iteration's ID.
     *
     * @private
     * @async
     *
     * @method getLastPullRequestIteration
     *
     * This method internally queries the Azure DevOps Git API to fetch all iterations of a pull request
     * by utilizing project-specific parameters and environment variables provided in the Settings instance.
     * From the received data, it retrieves and returns the ID of the last pull request iteration.
     *
     * @returns {Promise<number>} A promise that fulfills with the ID of the last iteration of the pull request.
     */
    PullRequestService.prototype.getLastPullRequestIteration = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pullRequestIterations, lastIteration;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.gitApi.getPullRequestIterations(this.settings.Environment.repoId, this.settings.Environment.pullRequestId, this.settings.Environment.projectId, true)];
                    case 1:
                        pullRequestIterations = _a.sent();
                        lastIteration = pullRequestIterations.pop();
                        if (!(lastIteration === null || lastIteration === void 0 ? void 0 : lastIteration.id)) {
                            throw new Error("Last PullRequest Iteration ID not set");
                        }
                        return [2 /*return*/, lastIteration.id];
                }
            });
        });
    };
    return PullRequestService;
}());
exports.PullRequestService = PullRequestService;
/**
 * The async function `getPullRequestService` initializes the BaseGitApiService with the specified settings and then returns
 * a new instance of the PullRequestService with the BaseGitApiService's GitApi and the specified settings.
 *
 * @param {Settings} settings - An instance of Settings containing project-specific parameters and environment variables.
 * @returns {Promise<PullRequestService>} A promise that resolves to a new instance of PullRequestService.
 */
function getPullRequestService(settings) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = PullRequestService.bind;
                    return [4 /*yield*/, base_git_api_service_1.BaseGitApiService.getGitApi()];
                case 1: return [2 /*return*/, new (_a.apply(PullRequestService, [void 0, _b.sent(), settings]))()];
            }
        });
    });
}
