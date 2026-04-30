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
Object.defineProperty(exports, "__esModule", { value: true });
var settings_1 = require("./settings"); // Adjust the import to match your actual file layout
var globals_1 = require("@jest/globals");
(0, globals_1.describe)('getSettings', function () {
    var consoleLogSpy;
    var originalEnv;
    (0, globals_1.beforeAll)(function () {
        // Save the original process.env
        originalEnv = __assign({}, process.env);
    });
    (0, globals_1.beforeEach)(function () {
        consoleLogSpy = globals_1.jest.spyOn(console, 'log').mockImplementation(function (_message) {
            var _options = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                _options[_i - 1] = arguments[_i];
            }
        });
    });
    (0, globals_1.afterEach)(function () {
        // Restore the original process.env and console.log
        process.env = __assign({}, originalEnv);
        consoleLogSpy.mockRestore();
    });
    (0, globals_1.it)('should not log the token', function () {
        // Mock necessary environment variables
        process.env.BUILD_REPOSITORY_ID = 'repoId';
        process.env.BUILD_SOURCESDIRECTORY = '/src';
        process.env.SYSTEM_PULLREQUEST_PULLREQUESTID = '123';
        process.env.SYSTEM_PULLREQUEST_SOURCECOMMITID = '123123-1231230123123-13123';
        process.env.SYSTEM_PULLREQUEST_TARGETBRANCH = '/refs/heads/main';
        process.env.SYSTEM_TEAMPROJECTID = 'projectId';
        process.env.SYSTEM_TEAMFOUNDATIONCOLLECTIONURI = 'uri';
        process.env.INPUT_SOLUTIONPATH = 'solutionPath';
        process.env.INPUT_INCLUDEPATH = '.*';
        process.env.INPUT_EXCLUDEPATH = '.*.test.ts';
        process.env.INPUT_STATUSCHECK = 'true';
        process.env.INPUT_STATUSCHECKNAME = 'code formatting';
        process.env.INPUT_STATUSCHECKGENRE = 'formatting check';
        process.env.INPUT_FAILONFORMATTINGERRORS = 'true';
        process.env.INPUT_SCOPETOPULLREQUEST = 'true';
        process.env.SYSTEM_ACCESSTOKEN = 'token';
        process.env.INPUT_PAT = 'token';
        var settings = (0, settings_1.getSettings)();
        // Verify token is not logged
        (0, globals_1.expect)(consoleLogSpy).not.toHaveBeenCalledWith(globals_1.expect.stringContaining('token'));
        (0, globals_1.expect)(settings).toEqual({
            Environment: {
                orgUrl: 'uri',
                repoId: 'repoId',
                projectId: 'projectId',
                pullRequestId: 123,
                token: 'token',
                sourcesDirectory: '/src',
                pullRequestSourceCommit: '123123-1231230123123-13123',
                pullRequestTargetBranch: '/refs/heads/main'
            },
            Parameters: {
                excludePath: '.*.test.ts',
                failOnFormattingErrors: true,
                includePath: '.*',
                scopeToPullRequest: true,
                solutionPath: 'solutionPath',
                statusCheck: true,
                statusCheckContext: {
                    genre: 'formatting check',
                    name: 'code formatting'
                },
                token: 'token'
            }
        });
    });
});
