import {getSettings} from './settings'; // Adjust the import to match your actual file layout
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
        process.env.SYSTEM_PULLREQUEST_PULLREQUESTID = '123';
        process.env.SYSTEM_TEAMFOUNDATIONCOLLECTIONURI = 'uri';
        process.env.BUILD_REPOSITORY_ID = 'repoId';
        process.env.SYSTEM_TEAMPROJECTID = 'projectId';
        process.env.SYSTEM_ACCESSTOKEN = 'token';
        process.env.INPUT_SOLUTIONPATH = 'solutionPath';

        getSettings();

        // Verify token is not logged
        expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('token'));
    });
});
