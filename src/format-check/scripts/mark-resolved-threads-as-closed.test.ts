import { markResolvedThreadsAsClosed } from './format-check';
import { PullRequestService } from './services/pull-request-service';
import * as gi from 'azure-devops-node-api/interfaces/GitInterfaces';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock the module to avoid import errors
jest.mock('node-fetch', () => require('jest-fetch-mock'));

describe('markResolvedThreadsAsClosed', () => {
    let pullRequestServiceMock: jest.Mocked<PullRequestService>;
    let existingThreads: gi.GitPullRequestCommentThread[];

    beforeEach(() => {
        jest.resetAllMocks();

        // Mock PullRequestService
        pullRequestServiceMock = {
            updateThread: jest.fn()
        } as unknown as jest.Mocked<PullRequestService>;

        // Mock existing threads
        existingThreads = [
            {
                id: 1,
                comments: [
                    {
                        content: '[DotNetFormatTask][Automated] Test comment 1',
                        commentType: gi.CommentType.Text
                    }
                ],
                status: gi.CommentThreadStatus.Active,
                threadContext: {
                    filePath: '/src/file1.ts'
                }
            },
            {
                id: 2,
                comments: [
                    {
                        content: '[DotNetFormatTask][Automated] Test comment 2',
                        commentType: gi.CommentType.Text
                    }
                ],
                status: gi.CommentThreadStatus.Active,
                threadContext: {
                    filePath: '/src/file2.ts'
                }
            },
            {
                id: 3,
                comments: [
                    {
                        content: 'Some other comment',
                        commentType: gi.CommentType.Text
                    }
                ],
                status: gi.CommentThreadStatus.Active,
                threadContext: {
                    filePath: '/src/file3.ts'
                }
            },
            {
                id: 4,
                comments: [
                    {
                        content: '[DotNetFormatTask][Automated] Test comment 4',
                        commentType: gi.CommentType.Text
                    }
                ],
                status: gi.CommentThreadStatus.Closed,
                threadContext: {
                    filePath: '/src/file4.ts'
                }
            }
        ] as gi.GitPullRequestCommentThread[];
    });

    it('should close threads for resolved issues', async () => {
        // Arrange
        const activeIssuesContent: string[] = [
            '[DotNetFormatTask][Automated] Test comment 2'
        ];

        // Act
        await markResolvedThreadsAsClosed(pullRequestServiceMock, existingThreads, activeIssuesContent);

        // Assert
        expect(pullRequestServiceMock.updateThread).toHaveBeenCalled();
        const threadArg = pullRequestServiceMock.updateThread.mock.calls[0][0];
        expect(threadArg.status).toBe(gi.CommentThreadStatus.Closed);
        expect(pullRequestServiceMock.updateThread).toHaveBeenCalledWith(
            { status: gi.CommentThreadStatus.Closed },
            1
        );
    });

    it('should not close threads that are already closed', async () => {
        // Arrange
        const activeIssuesContent: string[] = [];

        // Act
        await markResolvedThreadsAsClosed(pullRequestServiceMock, existingThreads, activeIssuesContent);

        // Assert
        // Thread with id 4 is already closed, so it should not be called for this thread
        expect(pullRequestServiceMock.updateThread).not.toHaveBeenCalledWith(
            expect.anything(),
            4
        );
    });

    it('should not close threads for active issues', async () => {
        // Arrange
        const activeIssuesContent: string[] = [
            '[DotNetFormatTask][Automated] Test comment 1',
            '[DotNetFormatTask][Automated] Test comment 2'
        ];

        // Act
        await markResolvedThreadsAsClosed(pullRequestServiceMock, existingThreads, activeIssuesContent);

        // Assert
        // No threads should be closed as both are still active issues
        expect(pullRequestServiceMock.updateThread).not.toHaveBeenCalled();
    });

    it('should not close threads that do not start with the comment preamble', async () => {
        // Arrange
        const activeIssuesContent: string[] = [];

        // Act
        await markResolvedThreadsAsClosed(pullRequestServiceMock, existingThreads, activeIssuesContent);

        // Assert
        // Thread with id 3 does not start with the preamble, so it should not be called for this thread
        expect(pullRequestServiceMock.updateThread).not.toHaveBeenCalledWith(
            expect.anything(),
            3
        );
    });
});