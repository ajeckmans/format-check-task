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
Object.defineProperty(exports, "__esModule", { value: true });
var azdev = __importStar(require("azure-devops-node-api"));
var globals_1 = require("@jest/globals");
var base_git_api_service_1 = require("./base-git-api-service");
var crypto_1 = require("crypto");
// Explicitly cast to jest.Mock
var MockedWebApi = azdev.WebApi;
var MockedGetPersonalAccessTokenHandler = azdev.getPersonalAccessTokenHandler;
globals_1.jest.mock('azure-devops-node-api');
(0, globals_1.describe)('BaseGitApiService', function () {
    var mockSettings;
    (0, globals_1.beforeEach)(function () {
        mockSettings = {
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
        globals_1.jest.clearAllMocks();
        MockedWebApi.mockClear();
        base_git_api_service_1.BaseGitApiService.reset();
    });
    (0, globals_1.it)('should initialize Azure DevOps Git API', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockGetGitApi, mockWebApiInstance;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockGetGitApi = globals_1.jest.fn();
                    mockWebApiInstance = { getGitApi: mockGetGitApi };
                    MockedGetPersonalAccessTokenHandler.mockReturnValue({});
                    MockedWebApi.mockImplementation(function () { return mockWebApiInstance; });
                    // Calling the function
                    return [4 /*yield*/, base_git_api_service_1.BaseGitApiService.init(mockSettings)];
                case 1:
                    // Calling the function
                    _a.sent();
                    // Assertions
                    (0, globals_1.expect)(MockedGetPersonalAccessTokenHandler).toHaveBeenCalledWith(mockSettings.Parameters.token);
                    (0, globals_1.expect)(MockedWebApi).toHaveBeenCalledWith(mockSettings.Environment.orgUrl, {});
                    (0, globals_1.expect)(mockGetGitApi).toHaveBeenCalledTimes(1);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should return the initialized Git API instance', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockGitApiInstance, returnedGitApi;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockGitApiInstance = {
                        baseUrl: "https://mockurl"
                    };
                    base_git_api_service_1.BaseGitApiService.GitApiPromise = Promise.resolve(mockGitApiInstance);
                    base_git_api_service_1.BaseGitApiService.GitApi = mockGitApiInstance;
                    return [4 /*yield*/, base_git_api_service_1.BaseGitApiService.getGitApi()];
                case 1:
                    returnedGitApi = _a.sent();
                    // Assertions
                    (0, globals_1.expect)(returnedGitApi).toBe(mockGitApiInstance);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should throw error if init fails', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    MockedWebApi.mockImplementation(function () {
                        return {
                            getGitApi: function () { return Promise.reject(new Error('Initialization failed')); }
                        };
                    });
                    return [4 /*yield*/, (0, globals_1.expect)(base_git_api_service_1.BaseGitApiService.init(mockSettings)).rejects.toThrow('Initialization failed')];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should throw an error if GitApi is not initialized', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    base_git_api_service_1.BaseGitApiService.GitApi = null;
                    return [4 /*yield*/, (0, globals_1.expect)(base_git_api_service_1.BaseGitApiService.getGitApi()).rejects.toStrictEqual(new Error('call BaseGitApiService.init() first'))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should not re-initialize if already initialized', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockGetGitApi, mockWebApiInstance;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log(" =====================     it('should not re-initialize if already initialized', async () => { ================");
                    mockGetGitApi = globals_1.jest.fn(function () { return Promise.resolve(); });
                    mockWebApiInstance = { getGitApi: mockGetGitApi };
                    MockedWebApi.mockImplementation(function () { return mockWebApiInstance; });
                    return [4 /*yield*/, base_git_api_service_1.BaseGitApiService.init(mockSettings)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, base_git_api_service_1.BaseGitApiService.init(mockSettings)];
                case 2:
                    _a.sent();
                    (0, globals_1.expect)(mockGetGitApi).toHaveBeenCalledTimes(1);
                    return [2 /*return*/];
            }
        });
    }); });
});
