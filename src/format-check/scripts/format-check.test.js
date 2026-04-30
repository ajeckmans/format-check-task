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
jest.mock('fs');
jest.mock('child_process');
jest.mock('process');
jest.mock('console', function () { return ({
    error: jest.fn(),
}); });
jest.mock('node-fetch', function () { return jest.fn(function () { return Promise.resolve({
    json: function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, ({
                    changes: [
                        {
                            changeType: gi.VersionControlChangeType.Edit,
                            item: {
                                path: "somefile.ts",
                                commitId: "commit123"
                            },
                            changes: [
                                {
                                    addedLines: [{ lineNumber: 10 }, { lineNumber: 11 }],
                                    removedLines: [{ lineNumber: 5 }]
                                }
                            ]
                        }
                    ]
                })];
        });
    }); },
}); }); });
var gi = __importStar(require("azure-devops-node-api/interfaces/GitInterfaces"));
var globals_1 = require("@jest/globals");
var pull_request_file_change_1 = require("./types/pull-request-file-change");
var format_check_1 = require("./format-check");
var base_git_api_service_1 = require("./services/base-git-api-service");
var fs_1 = __importDefault(require("fs"));
var crypto_1 = require("crypto");
var child_process = __importStar(require("child_process"));
(0, globals_1.describe)('getChangedFilesInPR', function () {
    // mock PullRequestService
    var pullRequestServiceMock = {
        getPullRequestChanges: jest.fn()
    };
    var settingsMock = {
        Environment: {
            sourcesDirectory: "/path/to"
        }
    };
    (0, globals_1.beforeEach)(function () {
        jest.resetAllMocks();
        // mock console
        global.console.warn = jest.fn();
    });
    (0, globals_1.it)('should return the list of changed files in a PR', function () { return __awaiter(void 0, void 0, void 0, function () {
        var changesListMock, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    changesListMock = [
                        {
                            changeType: gi.VersionControlChangeType.Edit,
                            item: {
                                path: 'path/to/test.ts',
                                commitId: 'commit123'
                            }
                        }
                    ];
                    pullRequestServiceMock.getPullRequestChanges.mockReturnValue(changesListMock);
                    return [4 /*yield*/, (0, format_check_1.getChangedFilesInPR)(pullRequestServiceMock, settingsMock)];
                case 1:
                    result = _a.sent();
                    // Assert
                    (0, globals_1.expect)(result).toHaveLength(1);
                    (0, globals_1.expect)(result).toEqual([new pull_request_file_change_1.PullRequestFileChange('path/to/test.ts', 'commit123', gi.VersionControlChangeType.Edit, [])]);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should extract line changes from pull request changes', function () { return __awaiter(void 0, void 0, void 0, function () {
        var changesListMock, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    changesListMock = [
                        {
                            changeType: gi.VersionControlChangeType.Edit,
                            item: {
                                path: 'path/to/test.ts',
                                commitId: 'commit123'
                            },
                            changes: [
                                {
                                    addedLines: [{ lineNumber: 10 }, { lineNumber: 11 }],
                                    removedLines: [{ lineNumber: 5 }]
                                }
                            ]
                        }
                    ];
                    pullRequestServiceMock.getPullRequestChanges.mockReturnValue(changesListMock);
                    return [4 /*yield*/, (0, format_check_1.getChangedFilesInPR)(pullRequestServiceMock, settingsMock)];
                case 1:
                    result = _a.sent();
                    // Assert
                    (0, globals_1.expect)(result).toHaveLength(1);
                    (0, globals_1.expect)(result[0].FilePath).toEqual('path/to/test.ts');
                    // Sort the lineChanges array to ensure consistent order
                    (0, globals_1.expect)(result[0].lineChanges.sort(function (a, b) { return a - b; })).toEqual([5, 10, 11].sort(function (a, b) { return a - b; }));
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should console warn if a change does not have a path', function () { return __awaiter(void 0, void 0, void 0, function () {
        var changesListMock;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    changesListMock = [
                        {
                            changeType: gi.VersionControlChangeType.Edit,
                            item: {
                                path: undefined,
                                commitId: 'commit123'
                            }
                        }
                    ];
                    pullRequestServiceMock.getPullRequestChanges.mockReturnValue(changesListMock);
                    // Act
                    return [4 /*yield*/, (0, format_check_1.getChangedFilesInPR)(pullRequestServiceMock, settingsMock)];
                case 1:
                    // Act
                    _a.sent();
                    // Assert
                    (0, globals_1.expect)(console.warn).toHaveBeenCalledWith("Warning: File path is undefined for commit id commit123");
                    return [2 /*return*/];
            }
        });
    }); });
});
(0, globals_1.describe)('runFormatCheck', function () {
    var mockGitApi;
    var mockSettings = {
        Environment: {
            orgUrl: "https://some-url/",
            repoId: "rrrrr",
            projectId: "ppppp",
            pullRequestId: 123,
            token: "some-token-secret",
            sourcesDirectory: '/src',
            pullRequestSourceCommit: '123123132123',
            pullRequestTargetBranch: '/refs/heads/main'
        },
        Parameters: {
            statusCheck: true,
            statusCheckContext: {
                genre: "formatting",
                name: "dotnet format check"
            },
            scopeToPullRequest: true,
            failOnFormattingErrors: false,
            solutionPath: 'test',
            includePath: 'test',
            excludePath: 'test'
        }
    };
    (0, globals_1.beforeEach)(function () {
        jest.resetAllMocks();
        mockGitApi = {
            updatePullRequest: jest.fn(),
            getPullRequestIterations: jest.fn(),
            getPullRequest: jest.fn(),
            getPullRequestById: jest.fn(),
            createPullRequestStatus: jest.fn(),
            getThreads: jest.fn(),
            createThread: jest.fn(),
            updateThread: jest.fn()
        };
    });
    (0, globals_1.it)('should update PullRequest status and return false if there are format errors', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, mockReport, mockGitCommitDiffs, _a, firstArg, mockReportWithMultipleIssues_1, _b, threadArgs;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    jest.spyOn(base_git_api_service_1.BaseGitApiService, 'getGitApi').mockReturnValue(Promise.resolve(mockGitApi));
                    fs_1.default.existsSync.mockReturnValue(true); // Mock return value
                    jest.spyOn(child_process, 'execSync').mockReturnValue(Buffer.from(''));
                    document = {
                        Id: (0, crypto_1.randomUUID)(),
                        ProjectId: {
                            Id: (0, crypto_1.randomUUID)()
                        }
                    };
                    mockReport = [
                        {
                            DocumentId: document,
                            FileName: "somefile.ts",
                            FilePath: "/src/somefile.ts",
                            FileChanges: [
                                {
                                    CharNumber: 1,
                                    DiagnosticId: (0, crypto_1.randomUUID)(),
                                    LineNumber: 2,
                                    FormatDescription: "some error"
                                }
                            ]
                        },
                        {
                            DocumentId: document,
                            FileName: "file-not-in-pr.ts",
                            FilePath: "/src/file-not-in-pr.ts",
                            FileChanges: [
                                {
                                    CharNumber: 5,
                                    DiagnosticId: (0, crypto_1.randomUUID)(),
                                    LineNumber: 1,
                                    FormatDescription: "some error not relevant"
                                }
                            ]
                        }
                    ];
                    fs_1.default.readFileSync.mockImplementation(function () { return JSON.stringify(mockReport); });
                    fs_1.default.unlinkSync.mockImplementation(function () { });
                    fs_1.default.existsSync.mockImplementation(function () { return true; });
                    mockGitApi.updatePullRequest.mockImplementation(jest.fn());
                    mockGitApi.getPullRequestIterations.mockReturnValueOnce([
                        {
                            id: 1,
                            description: 'Initial commit',
                            author: {
                                displayName: 'Mock Author',
                                id: 'mock_author_123',
                            },
                            updatedAt: new Date()
                        }
                    ]);
                    mockGitApi.getPullRequestIterations.mockReturnValueOnce([
                        {
                            id: 1,
                            description: 'Initial commit',
                            author: {
                                displayName: 'Mock Author',
                                id: 'mock_author_123',
                            },
                            updatedAt: new Date()
                        }
                    ]);
                    mockGitApi.getPullRequestById.mockReturnValue(Promise.resolve({
                        status: 'active',
                        createdBy: {
                            displayName: 'Test User',
                            id: 'test_user_123',
                        },
                        creationDate: new Date()
                    }));
                    mockGitCommitDiffs = {
                        changes: [
                            {
                                changeType: gi.VersionControlChangeType.Edit,
                                item: {
                                    path: "/somefile.ts",
                                    commitId: (0, crypto_1.randomUUID)()
                                },
                                changes: [
                                    {
                                        addedLines: [{ lineNumber: 10 }, { lineNumber: 11 }],
                                        removedLines: [{ lineNumber: 5 }]
                                    }
                                ]
                            }
                        ]
                    };
                    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
                        ok: true,
                        status: 200,
                        json: function () { return Promise.resolve(mockGitCommitDiffs); },
                        headers: new Headers({ 'Content-Type': 'application/json' })
                    });
                    mockGitApi.getThreads.mockReturnValue(Promise.resolve([
                        {
                            id: 1,
                            comments: [
                                {
                                    content: '[DotNetFormatTask][Automated] Test comment',
                                }
                            ]
                        }
                    ]));
                    _a = globals_1.expect;
                    return [4 /*yield*/, (0, format_check_1.runFormatCheck)(mockSettings)];
                case 1:
                    _a.apply(void 0, [_c.sent()]).toEqual(false);
                    if (!(mockGitApi.createThread.mock.calls.length > 0)) return [3 /*break*/, 3];
                    firstArg = mockGitApi.createThread.mock.calls[0][0];
                    // expect the first call to be for '/src/somefile.ts'
                    (0, globals_1.expect)(firstArg).toMatchObject({
                        threadContext: globals_1.expect.objectContaining({
                            filePath: globals_1.expect.stringContaining('/somefile.ts')
                        })
                    });
                    // Loop through each call to ensure none of them contain '/src/some-file-not-in-pr.ts'
                    mockGitApi.createThread.mock.calls.forEach(function (call) {
                        var firstArg = call[0];
                        (0, globals_1.expect)(firstArg).not.toMatchObject({
                            threadContext: globals_1.expect.objectContaining({
                                filePath: globals_1.expect.stringContaining('/src/file-not-in-pr.ts')
                            })
                        });
                    });
                    mockReportWithMultipleIssues_1 = [
                        {
                            DocumentId: document,
                            FileName: "somefile.ts",
                            FilePath: "/src/somefile.ts",
                            FileChanges: [
                                {
                                    CharNumber: 1,
                                    DiagnosticId: (0, crypto_1.randomUUID)(),
                                    LineNumber: 2, // Not in changed lines
                                    FormatDescription: "some error"
                                },
                                {
                                    CharNumber: 1,
                                    DiagnosticId: (0, crypto_1.randomUUID)(),
                                    LineNumber: 10, // In changed lines
                                    FormatDescription: "some error in changed line"
                                }
                            ]
                        }
                    ];
                    fs_1.default.readFileSync.mockImplementation(function () { return JSON.stringify(mockReportWithMultipleIssues_1); });
                    // Reset mocks
                    mockGitApi.createThread.mockReset();
                    mockGitApi.updateThread.mockReset();
                    _b = globals_1.expect;
                    return [4 /*yield*/, (0, format_check_1.runFormatCheck)(mockSettings)];
                case 2:
                    _b.apply(void 0, [_c.sent()]).toEqual(true); // Should return true because there is a formatting error in a changed line
                    // Verify that only the issue on line 10 (a changed line) was reported
                    (0, globals_1.expect)(mockGitApi.createThread).toHaveBeenCalled();
                    threadArgs = mockGitApi.createThread.mock.calls[0][0];
                    if (threadArgs.comments) {
                        (0, globals_1.expect)(threadArgs.comments[0].content).toContain("LineNumber: 10");
                        (0, globals_1.expect)(threadArgs.comments[0].content).not.toContain("LineNumber: 2");
                    }
                    _c.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); });
});
