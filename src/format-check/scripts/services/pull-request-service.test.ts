import {PullRequestService, getPullRequestService} from './pull-request-service';
import {IGitApi} from "azure-devops-node-api/GitApi";
import * as gi from "azure-devops-node-api/interfaces/GitInterfaces";
import {Settings} from "../types/settings";
import {beforeEach, describe, expect, it, jest} from '@jest/globals';

jest.mock('./base-git-api-service', () => {
    return {
        BaseGitApiService: {
            getGitApi: jest.fn().mockReturnValue({ }),
        },
    };
});


describe('PullRequestService', () => {
    let mockGitApi: jest.Mocked<IGitApi>;
    let settings: Settings;
    let service: PullRequestService;

    beforeEach(() => {
        mockGitApi = {
            getChanges: jest.fn(),
            createThread: jest.fn(),
            updateThread: jest.fn(),
            getThreads: jest.fn(),
            getPullRequestCommits: jest.fn(),
            createPullRequestStatus: jest.fn(),
            getPullRequestIterations: jest.fn()
        } as unknown as jest.Mocked<IGitApi>;

        settings = {
            Environment: {
                orgUrl: 'mockOrgUrl',
                repoId: 'mockRepoId',
                projectId: 'mockProjectId',
                pullRequestId: 1,
                token: 'mockToken'
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

        service = new PullRequestService(mockGitApi, settings);
    });

    it('should updatePullRequestStatus correctly', async () => {
        const status: gi.GitStatusState = gi.GitStatusState.Succeeded;
        const descriptionFunc = (_status: gi.GitStatusState) => 'description';

        (mockGitApi.getPullRequestIterations as jest.Mock).mockReturnValue([
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

        await service.updatePullRequestStatus(status, descriptionFunc);

        expect(mockGitApi.createPullRequestStatus).toBeCalled();  // Add more assertions based on your logic
    });

    it('should getPullRequestCommits correctly', async () => {
        await service.getPullRequestCommits();
        expect(mockGitApi.getPullRequestCommits).toBeCalled();
    });

    it('should getThreads correctly', async () => {
        await service.getThreads();
        expect(mockGitApi.getThreads).toBeCalled();
    });

    it('should updateThread correctly', async () => {
        const thread: gi.GitPullRequestCommentThread = { /* populate this */};
        const existingThreadId = 1;

        await service.updateThread(thread, existingThreadId);

        expect(mockGitApi.updateThread).toBeCalled();
    });

    it('should createThread correctly', async () => {
        const thread: gi.GitPullRequestCommentThread = { /* populate this */};

        await service.createThread(thread);

        expect(mockGitApi.createThread).toBeCalled();
    });
});

describe('getPullRequestService function', () => {
    let settings: Settings;

    beforeEach(() => {
        settings = {
            Environment: {
                orgUrl: 'mockOrgUrl',
                repoId: 'mockRepoId',
                projectId: 'mockProjectId',
                pullRequestId: 1,
                token: 'mockToken'
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
    
    it('should return a new PullRequestService instance', async () => {
        const result = await getPullRequestService(settings);
        expect(result).toBeInstanceOf(PullRequestService);
    });
});
