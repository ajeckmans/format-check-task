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
var node_fetch_1 = __importDefault(require("node-fetch"));
jest.mock('node-fetch', function () { return jest.fn(); });
jest.mock('./base-git-api-service', function () {
    return {
        BaseGitApiService: {
            getGitApi: jest.fn().mockReturnValue({}),
        },
    };
});
var pull_request_service_1 = require("./pull-request-service");
var gi = __importStar(require("azure-devops-node-api/interfaces/GitInterfaces"));
var globals_1 = require("@jest/globals");
var crypto_1 = require("crypto");
(0, globals_1.describe)('PullRequestService', function () {
    var mockGitApi;
    var settings;
    var service;
    (0, globals_1.beforeEach)(function () {
        mockGitApi = {
            getChanges: jest.fn(),
            createThread: jest.fn(),
            updateThread: jest.fn(),
            getThreads: jest.fn(),
            getPullRequestById: jest.fn(),
            createPullRequestStatus: jest.fn(),
            getPullRequestIterations: jest.fn()
        };
        settings = {
            Environment: {
                orgUrl: 'https://mockOrgUrl/',
                repoId: 'mockRepoId',
                projectId: 'mockProjectId',
                pullRequestId: 1,
                token: 'mockToken',
                sourcesDirectory: '/src',
                pullRequestSourceCommit: (0, crypto_1.randomUUID)(),
                pullRequestTargetBranch: '/refs/heads/main'
            },
            Parameters: {
                solutionPath: 'mockSolutionPath',
                includePath: 'mockIncludePath',
                excludePath: 'mockExcludePath',
                statusCheck: true,
                failOnFormattingErrors: false,
                statusCheckContext: {
                    name: 'mockName',
                    genre: 'mockGenre'
                },
                scopeToPullRequest: true,
                token: 'mockToken'
            }
        };
        service = new pull_request_service_1.PullRequestService(mockGitApi, settings);
    });
    (0, globals_1.it)('should updatePullRequestStatus correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
        var status, descriptionFunc;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    status = gi.GitStatusState.Succeeded;
                    descriptionFunc = function (_status) { return 'description'; };
                    mockGitApi.getPullRequestIterations.mockReturnValue([
                        {
                            id: 1,
                            description: 'Initial commit',
                            author: {
                                displayName: 'Mock Author',
                                id: 'mock_author_123',
                            },
                            updatedAt: new Date(),
                        },
                        {
                            id: 2,
                            description: 'Updated commit',
                            author: {
                                displayName: 'Mock Author',
                                id: 'mock_author_123',
                            },
                            updatedAt: new Date(),
                        }
                    ]);
                    return [4 /*yield*/, service.updatePullRequestStatus(status, descriptionFunc)];
                case 1:
                    _a.sent();
                    (0, globals_1.expect)(mockGitApi.createPullRequestStatus).toHaveBeenCalled(); // Add more assertions based on your logic
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should getPullRequestChanges correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockReturnValue, changes;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockGitApi.getPullRequestById.mockReturnValue({
                        pullRequestId: settings.Environment.pullRequestId,
                        repository: {
                            id: settings.Environment.repoId
                        },
                        sourceRefName: 'refs/heads/feature/test',
                        targetRefName: 'targetRef',
                    });
                    mockReturnValue = {
                        changeCounts: {
                            edit: 2,
                            add: 3,
                            delete: 1
                        },
                        changes: [
                            {
                                changeType: gi.VersionControlChangeType.Edit,
                                item: {
                                    path: '/path1',
                                },
                            },
                            {
                                changeType: gi.VersionControlChangeType.Edit,
                                item: {
                                    path: '/path2',
                                },
                            },
                            {
                                changeType: gi.VersionControlChangeType.Add,
                                item: {
                                    path: '/path3',
                                },
                            },
                            {
                                changeType: gi.VersionControlChangeType.Add,
                                item: {
                                    path: '/path4',
                                },
                            },
                            {
                                changeType: gi.VersionControlChangeType.Add,
                                item: {
                                    path: '/path5',
                                },
                            },
                            {
                                changeType: gi.VersionControlChangeType.Delete,
                                item: {
                                    path: '/path6',
                                },
                            },
                        ],
                        diffCommonCommit: {
                            commitId: 'mockCommitId',
                        },
                    };
                    node_fetch_1.default.mockResolvedValueOnce({
                        status: 200,
                        json: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, mockReturnValue];
                        }); }); },
                    });
                    return [4 /*yield*/, service.getPullRequestChanges()];
                case 1:
                    changes = _a.sent();
                    (0, globals_1.expect)(changes).toEqual(mockReturnValue.changes);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should getThreads correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, service.getThreads()];
                case 1:
                    _a.sent();
                    (0, globals_1.expect)(mockGitApi.getThreads).toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should updateThread correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
        var thread, existingThreadId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    thread = { /* populate this */};
                    existingThreadId = 1;
                    return [4 /*yield*/, service.updateThread(thread, existingThreadId)];
                case 1:
                    _a.sent();
                    (0, globals_1.expect)(mockGitApi.updateThread).toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should createThread correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
        var thread;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    thread = { /* populate this */};
                    return [4 /*yield*/, service.createThread(thread)];
                case 1:
                    _a.sent();
                    (0, globals_1.expect)(mockGitApi.createThread).toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
});
(0, globals_1.describe)('getPullRequestService function', function () {
    var settings;
    (0, globals_1.beforeEach)(function () {
        settings = {
            Environment: {
                orgUrl: 'mockOrgUrl',
                repoId: 'mockRepoId',
                projectId: 'mockProjectId',
                pullRequestId: 1,
                token: 'mockToken',
                sourcesDirectory: '/src',
                pullRequestSourceCommit: (0, crypto_1.randomUUID)(),
                pullRequestTargetBranch: '/refs/heads/main'
            },
            Parameters: {
                solutionPath: 'mockSolutionPath',
                includePath: 'mockIncludePath',
                excludePath: 'mockExcludePath',
                statusCheck: true,
                failOnFormattingErrors: false,
                statusCheckContext: {
                    name: 'mockName',
                    genre: 'mockGenre'
                },
                scopeToPullRequest: true,
                token: 'mockToken'
            }
        };
    });
    (0, globals_1.it)('should return a new PullRequestService instance', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, pull_request_service_1.getPullRequestService)(settings)];
                case 1:
                    result = _a.sent();
                    (0, globals_1.expect)(result).toBeInstanceOf(pull_request_service_1.PullRequestService);
                    return [2 /*return*/];
            }
        });
    }); });
});
