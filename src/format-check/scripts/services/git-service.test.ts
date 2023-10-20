import {getGitService, GitService} from './git-service';
import {IGitApi} from 'azure-devops-node-api/GitApi';
import {Settings} from '../types/settings';
import {GitCommitChanges, VersionControlChangeType} from 'azure-devops-node-api/interfaces/GitInterfaces';
import {beforeEach, describe, expect, it, jest} from '@jest/globals';

jest.mock('./base-git-api-service', () => {
    return {
        BaseGitApiService: {
            getGitApi: jest.fn().mockReturnValue({ }),
        },
    };
});

describe('GitService', () => {
    let mockGitApi: jest.Mocked<IGitApi>;
    let settings: Settings;
    let gitService: GitService;

    beforeEach(() => {
        // Initialize mock and settings
        mockGitApi = {
            getChanges: jest.fn(),
            createThread: jest.fn()
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

        gitService = new GitService(mockGitApi, settings);
    });

    it('should fetch changes successfully', async () => {
        const mockChanges: GitCommitChanges = {
            changeCounts: 3,
            changes: [{
                changeId: 1,
                changeType: VersionControlChangeType.Edit,
                item: {
                    path: "/src/file1.ts"
                }
            }, {
                changeId: 1,
                changeType: VersionControlChangeType.Add,
                item: {
                    path: "/src/file2.ts"
                }
            }, {
                changeId: 2,
                changeType: VersionControlChangeType.Delete,
                item: {
                    path: "/src/file1.ts"
                }
            }]
        };
        mockGitApi.getChanges.mockResolvedValue(mockChanges);

        const changes = await gitService.getChanges('some-commit-id');
        expect(changes).toEqual(mockChanges);
        expect(mockGitApi.getChanges).toHaveBeenCalledWith('some-commit-id', 'mockRepoId', 'mockProjectId');
    });
});

describe('getGitService', () => {
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

    it('should return a new GitService instance', async () => {
        const service = await getGitService(settings);
        expect(service).toBeInstanceOf(GitService);
    });
});
