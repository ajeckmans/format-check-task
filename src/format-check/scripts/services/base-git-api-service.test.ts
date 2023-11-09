import * as azdev from "azure-devops-node-api";
import {jest, describe, it, expect, beforeEach} from '@jest/globals';
import {Settings} from "../types/settings";
import {BaseGitApiService} from "./base-git-api-service";
import {IGitApi} from "azure-devops-node-api/GitApi";
import {randomUUID} from "crypto";

// Explicitly cast to jest.Mock
const MockedWebApi = azdev.WebApi as unknown as jest.Mock;
const MockedGetPersonalAccessTokenHandler = azdev.getPersonalAccessTokenHandler as jest.Mock;

jest.mock('azure-devops-node-api');

describe('BaseGitApiService', () => {
    let mockSettings: Settings;

    beforeEach(() => {
        mockSettings = {
            Environment: {
                orgUrl: 'mockOrgUrl',
                repoId: 'mockRepoId',
                projectId: 'mockProjectId',
                pullRequestId: 1,
                token: 'mockToken',
                sourcesDirectory: '/src',
                pullRequestSourceCommit: randomUUID(),
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
        jest.clearAllMocks();
        MockedWebApi.mockClear();

        BaseGitApiService.reset();
    });

    it('should initialize Azure DevOps Git API', async () => {
        // Mocking the azdev methods
        const mockGetGitApi = jest.fn();
        const mockWebApiInstance = {getGitApi: mockGetGitApi};

        MockedGetPersonalAccessTokenHandler.mockReturnValue({});
        MockedWebApi.mockImplementation(() => mockWebApiInstance);

        // Calling the function
        await BaseGitApiService.init(mockSettings);

        // Assertions
        expect(MockedGetPersonalAccessTokenHandler).toHaveBeenCalledWith(mockSettings.Parameters.token);
        expect(MockedWebApi).toHaveBeenCalledWith(mockSettings.Environment.orgUrl, {});
        expect(mockGetGitApi).toHaveBeenCalledTimes(1);
    });

    it('should return the initialized Git API instance', async () => {
        const mockGitApiInstance: Partial<IGitApi> = {
            baseUrl: "https://mockurl"
        };

        (BaseGitApiService as any).GitApiPromise = Promise.resolve(mockGitApiInstance);
        (BaseGitApiService as any).GitApi = mockGitApiInstance;

        // Call the function and check the return value
        const returnedGitApi = await BaseGitApiService.getGitApi();

        // Assertions
        expect(returnedGitApi).toBe(mockGitApiInstance);
    });

    it('should throw error if init fails', async () => {
        MockedWebApi.mockImplementation(() => {
            return {
                getGitApi: () => Promise.reject(new Error('Initialization failed'))
            };
        });

        await expect(BaseGitApiService.init(mockSettings)).rejects.toThrow('Initialization failed');
    });

    it('should throw an error if GitApi is not initialized', async () => {
        (BaseGitApiService as any).GitApi = null;
        await expect(BaseGitApiService.getGitApi()).rejects.toStrictEqual(new Error('call BaseGitApiService.init() first'));
    });

   it('should not re-initialize if already initialized', async () => {
       console.log(" =====================     it('should not re-initialize if already initialized', async () => { ================")
       const mockGetGitApi = jest.fn(() => Promise.resolve());
       const mockWebApiInstance = {getGitApi: mockGetGitApi};

       MockedWebApi.mockImplementation(() => mockWebApiInstance);

       await BaseGitApiService.init(mockSettings);
       await BaseGitApiService.init(mockSettings);

       expect(mockGetGitApi).toHaveBeenCalledTimes(1);
   });
});
