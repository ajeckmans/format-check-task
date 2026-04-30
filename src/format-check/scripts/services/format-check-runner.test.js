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
var format_check_runner_1 = require("./format-check-runner");
var child_process_1 = require("child_process");
var fs = __importStar(require("fs"));
var globals_1 = require("@jest/globals");
var crypto_1 = require("crypto");
globals_1.jest.mock('child_process');
var mockExecSync = globals_1.jest.mocked(child_process_1.execSync);
globals_1.jest.mock('process');
globals_1.jest.mock('console', function () { return ({
    error: globals_1.jest.fn(),
}); });
globals_1.jest.mock('fs');
var mockUnlinkSync = globals_1.jest.mocked(fs.unlinkSync);
var mockExistsSync = globals_1.jest.mocked(fs.existsSync);
(0, globals_1.describe)('FormatCheckRunner', function () {
    var runner;
    var exitSpy;
    var exitCode = 0;
    (0, globals_1.beforeEach)(function () {
        globals_1.jest.clearAllMocks();
        exitSpy = globals_1.jest.spyOn(process, 'exit').mockImplementation(function (code) {
            exitCode = code === null ? 0 : (typeof code === 'number' ? code : 0);
            return undefined;
        });
    });
    (0, globals_1.afterEach)(function () {
        // Clean up the spy
        exitSpy.mockRestore();
    });
    (0, globals_1.it)('should construct without errors', function () {
        fs.existsSync.mockReturnValue(true); // Mock return value
        runner = new format_check_runner_1.FormatCheckRunner('./solution.sln', './include', './exclude');
        (0, globals_1.expect)(runner).toBeInstanceOf(format_check_runner_1.FormatCheckRunner);
    });
    (0, globals_1.it)('should fail construction if solution does not exist', function () {
        fs.existsSync.mockReturnValue(false);
        // Mock process.exit before the test
        var exitSpy = globals_1.jest.spyOn(process, 'exit').mockImplementation((function () {
        }));
        new format_check_runner_1.FormatCheckRunner('./solution.sln', './include', './exclude');
        // Check if process.exit has been called with code 1
        (0, globals_1.expect)(exitSpy).toHaveBeenCalledWith(1);
        // Restore process.exit to its original function after the test
        exitSpy.mockRestore();
    });
    (0, globals_1.it)('should run format check successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockReport, report;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockReport = [
                        {
                            DocumentId: {
                                Id: (0, crypto_1.randomUUID)(),
                                ProjectId: {
                                    Id: (0, crypto_1.randomUUID)()
                                }
                            },
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
                        }
                    ];
                    fs.existsSync.mockReturnValue(true); // Mock return value
                    fs.readFileSync.mockReturnValue(JSON.stringify(mockReport));
                    runner = new format_check_runner_1.FormatCheckRunner('./solution.sln', './include', './exclude');
                    return [4 /*yield*/, runner.runFormatCheck()];
                case 1:
                    report = _a.sent();
                    (0, globals_1.expect)(report).toEqual(mockReport);
                    (0, globals_1.expect)(child_process_1.execSync).toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should handle dotnet format crashes', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockError;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockError = new Error('Dotnet format crashed');
                    mockExecSync.mockImplementation((function (command) {
                        if (command.startsWith('dotnet format')) {
                            throw mockError;
                        }
                        return Buffer.from('mock buffer content', 'utf-8');
                    }));
                    mockExistsSync.mockReturnValue(false);
                    runner = new format_check_runner_1.FormatCheckRunner('./solution.sln', './include', './exclude');
                    return [4 /*yield*/, runner.runFormatCheck()];
                case 1:
                    _a.sent();
                    (0, globals_1.expect)(exitCode).toBe(1);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should handle dotnet format errors', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockReport;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockReport = [
                        {
                            DocumentId: {
                                Id: (0, crypto_1.randomUUID)(),
                                ProjectId: {
                                    Id: (0, crypto_1.randomUUID)()
                                }
                            },
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
                        }
                    ];
                    fs.readFileSync.mockReturnValue(JSON.stringify(mockReport));
                    child_process_1.execSync
                        .mockImplementationOnce(function () {
                    })
                        .mockImplementationOnce(function () {
                    });
                    fs.existsSync.mockReturnValueOnce(true);
                    mockUnlinkSync.mockImplementation((function (path) {
                        if (path.toString().endsWith('format-report.json')) {
                            // do nothing
                        }
                        else {
                            throw new Error("not mocked");
                        }
                    }));
                    runner = new format_check_runner_1.FormatCheckRunner('./solution.sln', './include', './exclude');
                    return [4 /*yield*/, (0, globals_1.expect)(runner.runFormatCheck()).resolves.toEqual([{
                                "DocumentId": {
                                    "Id": mockReport[0].DocumentId.Id,
                                    "ProjectId": { "Id": mockReport[0].DocumentId.ProjectId.Id }
                                },
                                "FileChanges": [{
                                        "CharNumber": 1,
                                        "DiagnosticId": mockReport[0].FileChanges[0].DiagnosticId,
                                        "FormatDescription": "some error",
                                        "LineNumber": 2
                                    }],
                                "FileName": "somefile.ts",
                                "FilePath": "/src/somefile.ts"
                            }])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
