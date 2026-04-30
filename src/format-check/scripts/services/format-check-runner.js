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
exports.FormatCheckRunner = void 0;
var child_process_1 = require("child_process");
var fs = __importStar(require("fs"));
/**
 * @class FormatCheckRunner
 * A utility class to run .NET format checks on a given solution.
 */
var FormatCheckRunner = /** @class */ (function () {
    /**
     * Initializes a new instance of FormatCheckRunner.
     *
     * @param {string} solutionPath - The path to the .NET solution file.
     * @param {string} includePath - Files to include in the format check.
     * @param {string} excludePath - Files to exclude from the format check.
     *
     * @example
     * const runner = new FormatCheckRunner("./solution.sln", "./include", "./exclude");
     */
    function FormatCheckRunner(solutionPath, includePath, excludePath) {
        this.solutionPath = solutionPath;
        this.includePath = includePath;
        this.excludePath = excludePath;
        this.reportPath = "format-report.json";
        if (!fs.existsSync(solutionPath)) {
            console.error("Solution file at solutionPath does not exist.");
            process.exit(1);
        }
        if (fs.existsSync(this.reportPath)) {
            fs.unlinkSync(this.reportPath);
            console.log("Successfully deleted the existing report file.");
        }
    }
    /**
     * Runs the .NET format check command and returns a report.
     *
     * @returns {Promise<FormatReports>} - The formatting error report.
     *
     * @example
     * const report = await runner.runFormatCheck();
     *
     * @throws Error when the command fails.
     */
    FormatCheckRunner.prototype.runFormatCheck = function () {
        return __awaiter(this, void 0, void 0, function () {
            var formatCmd, dotnetFormatVersion, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        formatCmd = this.getCommandString();
                        console.log("Running dotnet format command. (".concat(formatCmd, ")"));
                        dotnetFormatVersion = (0, child_process_1.execSync)("dotnet format --version", {
                            encoding: "utf8",
                        });
                        console.log("Using dotnet format version ".concat(dotnetFormatVersion));
                        try {
                            (0, child_process_1.execSync)(formatCmd, { stdio: ["inherit", "inherit", "pipe"] });
                        }
                        catch (error) {
                            this.handleDotnetFormatError(error);
                        }
                        console.log("Dotnet format command completed.");
                        return [4 /*yield*/, this.retrieveErrorReport()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_1 = _a.sent();
                        console.error("Dotnet format task failed with error ".concat(error_1));
                        process.exit(1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @private
     * Generates the .NET format command string based on the given parameters.
     *
     * @returns {string} - The generated command string.
     */
    FormatCheckRunner.prototype.getCommandString = function () {
        return "dotnet format ".concat(this.solutionPath, " --verify-no-changes --verbosity diagnostic --report ").concat(this.reportPath, " ").concat(this.includePath ? "--include ".concat(this.includePath) : "", " ").concat(this.excludePath ? "--exclude ".concat(this.excludePath) : "");
    };
    /**
     * @private
     * Handles errors thrown by the `dotnet format` command.
     *
     * @param {any} error - The error to handle.
     */
    FormatCheckRunner.prototype.handleDotnetFormatError = function (error) {
        console.error("Dotnet format command failed with error ".concat(error));
        if ("stderr" in error && error.stderr) {
            console.error("stderr output:", error.stderr.toString());
        }
        if (!fs.existsSync(this.reportPath)) {
            // Format command has failed. No report was generated.
            console.error("No report found at reportPath.");
            process.exit(1);
        }
    };
    /**
     * @private
     * Retrieves the formatting error report generated by the `dotnet format` command.
     *
     * @returns {Promise<FormatReports>} - The formatting error report.
     */
    FormatCheckRunner.prototype.retrieveErrorReport = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("Loading error report.");
                return [2 /*return*/, JSON.parse(fs.readFileSync(this.reportPath, "utf8"))];
            });
        });
    };
    return FormatCheckRunner;
}());
exports.FormatCheckRunner = FormatCheckRunner;
