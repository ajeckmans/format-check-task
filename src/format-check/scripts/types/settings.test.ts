import {Settings, getSettings} from './settings'; // Adjust the import to match your actual file layout
import {jest, describe, it, expect, beforeEach, afterEach, beforeAll} from '@jest/globals';

describe('getSettings', () => {
    let consoleLogSpy: jest.Mock;
    let originalEnv: NodeJS.ProcessEnv;

    beforeAll(() => {
        // Save the original process.env
        originalEnv = {...process.env};
    });

    beforeEach(() => {
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation((_message?: any, ..._options: any[]) => {
        }) as unknown as jest.Mock;
    });

    afterEach(() => {
        // Restore the original process.env and console.log
        process.env = {...originalEnv};
        consoleLogSpy.mockRestore();
    });

    it('should not log the token', () => {
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


        const settings = getSettings();

        // Verify token is not logged
        expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('token'));


        expect(settings).toEqual({
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
        } as Settings);
    });
});
