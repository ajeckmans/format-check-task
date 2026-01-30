jest.mock('fs');
jest.mock('child_process');
jest.mock('process');
jest.mock('console', () => ({
    error: jest.fn(),
}));

jest.mock('node-fetch', () => jest.fn(() => Promise.resolve({
    json: async () => ({
        changes: [
            {
                changeType: gi.VersionControlChangeType.Edit,
                item: {
                    path: "somefile.ts",
                    commitId: "commit123"
                },
                changes: [
                    {
                        addedLines: [{ lineNumber: 10 }, { lineNumber: 11 }],
                        removedLines: [{ lineNumber: 5 }]
                    }
                ]
            }
        ]
    }),
})));


import * as gi from 'azure-devops-node-api/interfaces/GitInterfaces';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { PullRequestService } from './services/pull-request-service';
import { PullRequestFileChange } from './types/pull-request-file-change';
import { getChangedFilesInPR, runFormatCheck } from "./format-check";
import { Settings } from './types/settings';
import { BaseGitApiService } from './services/base-git-api-service';
import { IGitApi } from 'azure-devops-node-api/GitApi';
import fs from "fs";
import { randomUUID } from 'crypto';
import { FormatReports } from './types/format-report';
import * as child_process from "child_process";

describe('getChangedFilesInPR', () => {
    // mock PullRequestService
    const pullRequestServiceMock = {
        getPullRequestChanges: jest.fn()
    } as any as PullRequestService;

    const settingsMock = {
        Environment: {
            sourcesDirectory: "/path/to"
        }
    } as any as Settings;

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
        expect(result).toEqual([new PullRequestFileChange('path/to/test.ts', 'commit123', gi.VersionControlChangeType.Edit, [])]);
    });

    it('should extract line changes from pull request changes', async () => {
        // Arrange
        const changesListMock = [
            {
                changeType: gi.VersionControlChangeType.Edit,
                item: {
                    path: 'path/to/test.ts',
                    commitId: 'commit123'
                },
                changes: [
                    {
                        addedLines: [{ lineNumber: 10 }, { lineNumber: 11 }],
                        removedLines: [{ lineNumber: 5 }]
                    }
                ]
            }
        ];

        (pullRequestServiceMock.getPullRequestChanges as jest.Mock).mockReturnValue(changesListMock);

        // Act
        const result = await getChangedFilesInPR(pullRequestServiceMock, settingsMock);

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].FilePath).toEqual('path/to/test.ts');
        // Sort the lineChanges array to ensure consistent order
        expect(result[0].lineChanges.sort((a, b) => a - b)).toEqual([5, 10, 11].sort((a, b) => a - b));
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
            orgUrl: "https://some-url/",
            repoId: "rrrrr",
            projectId: "ppppp",
            pullRequestId: 123,
            token: "some-token-secret",
            sourcesDirectory: '/src',
            pullRequestSourceCommit: '123123132123',
            pullRequestTargetBranch: '/refs/heads/main'
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
            getPullRequestById: jest.fn(),
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

        (fs.readFileSync as jest.Mock).mockImplementation(() => JSON.stringify(mockReport));
        (fs.unlinkSync as jest.Mock).mockImplementation(() => { });
        (fs.existsSync as jest.Mock).mockImplementation(() => true);


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

        (mockGitApi.getPullRequestById as jest.Mock).mockReturnValue(Promise.resolve({
            status: 'active',
            createdBy: {
                displayName: 'Test User',
                id: 'test_user_123',
            },
            creationDate: new Date()
        }));

        let mockGitCommitDiffs = {
            changes: [
                {
                    changeType: gi.VersionControlChangeType.Edit,
                    item: {
                        path: "/somefile.ts",
                        commitId: randomUUID()
                    } as gi.GitItem,
                    changes: [
                            {
                                addedLines: [{ lineNumber: 10 }, { lineNumber: 11 }],
                                removedLines: [{ lineNumber: 5 }]
                            }
                        ]
                }
            ]
        } as any;

        jest.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockGitCommitDiffs),
            headers: new Headers({ 'Content-Type': 'application/json' })
        } as unknown as Response);

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

        if (mockGitApi.createThread.mock.calls.length > 0) {
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

        // Test that format issues are filtered to only include those in changed lines
            const mockReportWithMultipleIssues: FormatReports = [
                {
                    DocumentId: document,
                    FileName: "somefile.ts",
                    FilePath: "/src/somefile.ts",
                    FileChanges: [
                        {
                            CharNumber: 1,
                            DiagnosticId: randomUUID(),
                            LineNumber: 2, // Not in changed lines
                            FormatDescription: "some error"
                        },
                        {
                            CharNumber: 1,
                            DiagnosticId: randomUUID(),
                            LineNumber: 10, // In changed lines
                            FormatDescription: "some error in changed line"
                        }
                    ]
                }
            ];

            (fs.readFileSync as jest.Mock).mockImplementation(() => JSON.stringify(mockReportWithMultipleIssues));

            // Reset mocks
            mockGitApi.createThread.mockReset();
            mockGitApi.updateThread.mockReset();

            expect(await runFormatCheck(mockSettings)).toEqual(true); // Should return true because there is a formatting error in a changed line

            // Verify that only the issue on line 10 (a changed line) was reported
            expect(mockGitApi.createThread).toHaveBeenCalled();
            const threadArgs = mockGitApi.createThread.mock.calls[0][0];
            if (threadArgs.comments) {
                expect(threadArgs.comments[0].content).toContain("LineNumber: 10");
                expect(threadArgs.comments[0].content).not.toContain("LineNumber: 2");
            }
        }
    });
});