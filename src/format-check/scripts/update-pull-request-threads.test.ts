import { updatePullRequestThreads } from './format-check';
import { PullRequestService } from './services/pull-request-service';
import { AnnotatedReports } from './types/annotated-report';
import { randomUUID } from 'crypto';
import * as gi from 'azure-devops-node-api/interfaces/GitInterfaces';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock the module to avoid import errors
jest.mock('node-fetch', () => require('jest-fetch-mock'));

describe('updatePullRequestThreads', () => {
    let pullRequestServiceMock: jest.Mocked<PullRequestService>;
    let existingThreads: any[];

    beforeEach(() => {
        jest.resetAllMocks();

        // Mock PullRequestService
        pullRequestServiceMock = {
            getThreads: jest.fn(),
            createThread: jest.fn(),
            updateThread: jest.fn()
        } as any;

        // Mock existing threads
        existingThreads = [
            {
                id: 1,
                comments: [
                    {
                        content: '[DotNetFormatTask][Automated] Test comment',
                        commentType: gi.CommentType.Text
                    }
                ],
                status: gi.CommentThreadStatus.Active,
                threadContext: {
                    filePath: '/src/somefile.ts'
                }
            }
        ];
    });

    it('should create new threads for active issues', async () => {
        // Arrange
        const document = {
            Id: randomUUID(),
            ProjectId: {
                Id: randomUUID()
            }
        };

        const reports: AnnotatedReports = [
            {
                DocumentId: document,
                FileName: 'newfile.ts',
                FilePath: '/src/newfile.ts',
                FileChanges: [
                    {
                        CharNumber: 1,
                        DiagnosticId: randomUUID(),
                        LineNumber: 2,
                        FormatDescription: 'some error'
                    }
                ],
                commitId: '',
                changeType: gi.VersionControlChangeType.None
            }
        ];

        pullRequestServiceMock.getThreads.mockResolvedValue(existingThreads);

        // Act
        await updatePullRequestThreads(pullRequestServiceMock, reports);

        // Assert
        expect(pullRequestServiceMock.createThread).toHaveBeenCalled();
        const threadArg = pullRequestServiceMock.createThread.mock.calls[0][0];
        expect((threadArg.comments && threadArg.comments[0]?.content)).toContain('some error');
        expect((threadArg.threadContext && threadArg.threadContext.filePath)).toBe('/src/newfile.ts');
    });

    it('should update existing threads for active issues', async () => {
        // Arrange
        const document = {
            Id: randomUUID(),
            ProjectId: {
                Id: randomUUID()
            }
        };

        const reports: AnnotatedReports = [
            {
                DocumentId: document,
                FileName: 'somefile.ts',
                FilePath: '/src/somefile.ts',
                FileChanges: [
                    {
                        CharNumber: 1,
                        DiagnosticId: randomUUID(),
                        LineNumber: 2,
                        FormatDescription: 'some error'
                    }
                ],
                commitId: '',
                changeType: gi.VersionControlChangeType.None
            }
        ];

        pullRequestServiceMock.getThreads.mockResolvedValue(existingThreads);

        // Act
        await updatePullRequestThreads(pullRequestServiceMock, reports);

        // Assert
        expect(pullRequestServiceMock.updateThread).toHaveBeenCalled();
    });

    it('should close threads for resolved issues', async () => {
        // Arrange
        const reports: AnnotatedReports = []; // No active issues

        pullRequestServiceMock.getThreads.mockResolvedValue(existingThreads);

        // Act
        await updatePullRequestThreads(pullRequestServiceMock, reports);

        // Assert
        expect(pullRequestServiceMock.updateThread).toHaveBeenCalled();
        const threadArg = pullRequestServiceMock.updateThread.mock.calls[0][0];
        expect(threadArg.status).toBe(gi.CommentThreadStatus.Closed);
    });

    it('should handle multiple issues in a single report', async () => {
        // Arrange
        const document = {
            Id: randomUUID(),
            ProjectId: {
                Id: randomUUID()
            }
        };

        const reports: AnnotatedReports = [
            {
                DocumentId: document,
                FileName: 'multifile.ts',
                FilePath: '/src/multifile.ts',
                FileChanges: [
                    {
                        CharNumber: 1,
                        DiagnosticId: randomUUID(),
                        LineNumber: 2,
                        FormatDescription: 'first error'
                    },
                    {
                        CharNumber: 5,
                        DiagnosticId: randomUUID(),
                        LineNumber: 3,
                        FormatDescription: 'second error'
                    }
                ],
                commitId: '',
                changeType: gi.VersionControlChangeType.None
            }
        ];

        pullRequestServiceMock.getThreads.mockResolvedValue([]);

        // Act
        await updatePullRequestThreads(pullRequestServiceMock, reports);

        // Assert
        expect(pullRequestServiceMock.createThread).toHaveBeenCalledTimes(2);
        const firstCallArg = pullRequestServiceMock.createThread.mock.calls[0][0];
        const secondCallArg = pullRequestServiceMock.createThread.mock.calls[1][0];
        expect((firstCallArg.comments && firstCallArg.comments[0]?.content)).toContain('first error');
        expect((secondCallArg.comments && secondCallArg.comments[0]?.content)).toContain('second error');
    });
});