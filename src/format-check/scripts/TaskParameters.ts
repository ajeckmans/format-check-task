export interface TaskParameters {
    excludePath: string | undefined;
    failOnFormattingErrors: boolean;
    includePath: string | undefined;
    solutionPath: string;
    scopeToPullRequest: boolean;
    statusCheck: boolean;
    statusCheckContext: {
        genre: string;
        name: string;
    };
    token: string | undefined;
}