import * as gi from 'azure-devops-node-api/interfaces/GitInterfaces';
import {GitItem, VersionControlChangeType} from 'azure-devops-node-api/interfaces/GitInterfaces';
import {beforeEach, describe, expect, it, jest} from '@jest/globals';
import {PullRequestService} from './services/pull-request-service';
import {PullRequestFileChange} from './types/pull-request-file-change';
import {getChangedFilesInPR, runFormatCheck} from "./format-check";
import {Settings} from './types/settings';
import {BaseGitApiService} from './services/base-git-api-service';
import {IGitApi} from 'azure-devops-node-api/GitApi';
import * as fs from "fs";
import {randomUUID} from 'crypto';
import {FormatReports} from './types/format-report';
import * as child_process from "child_process";
import {PathNormalizer} from "./utils/path-normalizer";

jest.mock('fs');
jest.mock('child_process');
jest.mock('process');
jest.mock('console', () => ({
    error: jest.fn(),
}));

describe('getChangedFilesInPR', () => {
    // mock PullRequestService
    const pullRequestServiceMock = {
        getPullRequestChanges: jest.fn()
    } as unknown as PullRequestService;

    const settingsMock = {
        Environment: {
            sourcesDirectory: "/path/to"
        }
    } as unknown as Settings;

    beforeEach(() => {
        jest.resetAllMocks();

        // mock console
        global.console.warn = jest.fn();
    });

    it('should return the list of changed files in a PR', async () => {

        // Arrange
        const changesListMock = [
            {
                changeType: gi.VersionControlChangeType.Edit,
                item: {
                    path: 'path/to/test.ts',
                    commitId: 'commit123'
                }
            }
        ];

        (pullRequestServiceMock.getPullRequestChanges as jest.Mock).mockReturnValue(changesListMock);

        // Act
        const result = await getChangedFilesInPR(pullRequestServiceMock, settingsMock);

        // Assert
        expect(result).toHaveLength(1);
        expect(result).toEqual([new PullRequestFileChange('path/to/test.ts', 'commit123', gi.VersionControlChangeType.Edit)]);
    });

    it('should console warn if a change does not have a path', async () => {
        // Arrange
        const changesListMock = [
            {
                changeType: gi.VersionControlChangeType.Edit,
                item: {
                    path: undefined,
                    commitId: 'commit123'
                }
            }
        ];

        (pullRequestServiceMock.getPullRequestChanges as jest.Mock).mockReturnValue(changesListMock);

        // Act
        await getChangedFilesInPR(pullRequestServiceMock, settingsMock);

        // Assert
        expect(console.warn).toHaveBeenCalledWith("Warning: File path is undefined for commit id commit123");
    });
});

describe('runFormatCheck', () => {
    let mockGitApi: jest.Mocked<IGitApi>;
    const mockSettings = {
        Environment: {
            orgUrl: "some-url",
            repoId: "rrrrr",
            projectId: "ppppp",
            pullRequestId: 123,
            token: "some-token-secret",
            sourcesDirectory: '/src'
        },
        Parameters: {
            statusCheck: true,
            statusCheckContext: {
                genre: "formatting",
                name: "dotnet format check"
            },
            scopeToPullRequest: true,
            failOnFormattingErrors: false,
            solutionPath: 'test',
            includePath: 'test',
            excludePath: 'test'
        }
    } as Settings;

    beforeEach(() => {
        jest.resetAllMocks();

        mockGitApi = {
            updatePullRequest: jest.fn(),
            getPullRequestIterations: jest.fn(),
            getPullRequest: jest.fn(),
            getCommitDiffs: jest.fn(),
            createPullRequestStatus: jest.fn(),
            getThreads: jest.fn(),
            createThread: jest.fn(),
            updateThread: jest.fn()
        } as unknown as jest.Mocked<IGitApi>;
    });

    it('should update PullRequest status and return false if there are format errors', async () => {
        jest.spyOn(BaseGitApiService, 'getGitApi').mockReturnValue(Promise.resolve(mockGitApi));
        (fs.existsSync as jest.Mock).mockReturnValue(true); // Mock return value
        (jest.spyOn(child_process, 'execSync') as jest.Mock).mockReturnValue(Buffer.from(''));

        const document = {
            Id: randomUUID(),
            ProjectId: {
                Id: randomUUID()
            }
        };
        const mockReport: FormatReports = [
            {
                DocumentId: document,
                FileName: "somefile.ts",
                FilePath: "/src/somefile.ts",
                FileChanges: [
                    {
                        CharNumber: 1,
                        DiagnosticId: randomUUID(),
                        LineNumber: 2,
                        FormatDescription: "some error"
                    }
                ]
            },
            {
                DocumentId: document,
                FileName: "file-not-in-pr.ts",
                FilePath: "/src/file-not-in-pr.ts",
                FileChanges: [
                    {
                        CharNumber: 5,
                        DiagnosticId: randomUUID(),
                        LineNumber: 1,
                        FormatDescription: "some error not relevant"
                    }
                ]
            }
        ];
        (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockReport));

        (mockGitApi.updatePullRequest as jest.Mock).mockImplementation(jest.fn());
        (mockGitApi.getPullRequestIterations as jest.Mock).mockReturnValueOnce([
            {
                id: 1,
                description: 'Initial commit',
                author: {
                    displayName: 'Mock Author',
                    id: 'mock_author_123',
                },
                updatedAt: new Date()
            }
        ]);

        (mockGitApi.getPullRequestIterations as jest.Mock).mockReturnValueOnce([
            {
                id: 1,
                description: 'Initial commit',
                author: {
                    displayName: 'Mock Author',
                    id: 'mock_author_123',
                },
                updatedAt: new Date()
            }
        ]);

        (mockGitApi.getPullRequest as jest.Mock).mockReturnValue(Promise.resolve({
            status: 'active',
            createdBy: {
                displayName: 'Test User',
                id: 'test_user_123',
            },
            creationDate: new Date()
        }));

        (mockGitApi.getCommitDiffs as jest.Mock).mockReturnValue(Promise.resolve({
            changes: [
                {
                    changeType: VersionControlChangeType.Edit,
                    item: {
                        path: "/somefile.ts",
                        commitId: randomUUID()
                    } as GitItem
                }
            ]
        } as gi.GitCommitDiffs));

        (mockGitApi.getThreads as jest.Mock).mockReturnValue(Promise.resolve([
            {
                id: 1,
                comments: [
                    {
                        content: '[DotNetFormatTask][Automated] Test comment',
                    }
                ]
            }
        ]));


        expect(await runFormatCheck(mockSettings)).toEqual(false);

        const firstArg = mockGitApi.createThread.mock.calls[0][0];

        // expect the first call to be for '/src/somefile.ts'
        expect(firstArg).toMatchObject({
            threadContext: expect.objectContaining({
                filePath: expect.stringContaining('/somefile.ts')
            })
        });

        // Loop through each call to ensure none of them contain '/src/some-file-not-in-pr.ts'
        mockGitApi.createThread.mock.calls.forEach(call => {
            const firstArg = call[0];
            expect(firstArg).not.toMatchObject({
                threadContext: expect.objectContaining({
                    filePath: expect.stringContaining('/src/file-not-in-pr.ts')
                })
            });
        });
    });
});