import fetch from 'node-fetch';
jest.mock('node-fetch', () => jest.fn());

jest.mock('./base-git-api-service', () => {
    return {
        BaseGitApiService: {
            getGitApi: jest.fn().mockReturnValue({}),
        },
    };
});

import {PullRequestService, getPullRequestService} from './pull-request-service';
import {IGitApi} from "azure-devops-node-api/GitApi";
import * as gi from "azure-devops-node-api/interfaces/GitInterfaces";
import {Settings} from "../types/settings";
import {beforeEach, describe, expect, it} from '@jest/globals';
import {randomUUID} from 'crypto';

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
            getPullRequestById: jest.fn(),
            createPullRequestStatus: jest.fn(),
            getPullRequestIterations: jest.fn()
        } as unknown as jest.Mocked<IGitApi>;

        settings = {
            Environment: {
                orgUrl: 'https://mockOrgUrl/',
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

        service = new PullRequestService(mockGitApi, settings);

        // fetch.resetMocks();
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

        expect(mockGitApi.createPullRequestStatus).toHaveBeenCalled();  // Add more assertions based on your logic
    });

    it('should getPullRequestChanges correctly', async () => {
        (mockGitApi.getPullRequestById as jest.Mock).mockReturnValue({
            pullRequestId: settings.Environment.pullRequestId,
            repository: {
                id: settings.Environment.repoId
            },
            sourceRefName: 'refs/heads/feature/test',
            targetRefName: 'targetRef',
        });

        let mockReturnValue = {
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

(fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: async () => mockReturnValue,
        });

        const changes = await service.getPullRequestChanges();

        expect(changes).toEqual(mockReturnValue.changes);
    });


    it('should getThreads correctly', async () => {
        await service.getThreads();
        expect(mockGitApi.getThreads).toHaveBeenCalled();
    });

    it('should updateThread correctly', async () => {
        const thread: gi.GitPullRequestCommentThread = { /* populate this */};
        const existingThreadId = 1;

        await service.updateThread(thread, existingThreadId);

        expect(mockGitApi.updateThread).toHaveBeenCalled();
    });

    it('should createThread correctly', async () => {
        const thread: gi.GitPullRequestCommentThread = { /* populate this */};

        await service.createThread(thread);

        expect(mockGitApi.createThread).toHaveBeenCalled();
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
    });

    it('should return a new PullRequestService instance', async () => {
        const result = await getPullRequestService(settings);
        expect(result).toBeInstanceOf(PullRequestService);
    });
});
