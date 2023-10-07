export interface TaskParameters {
    solutionPath: string;
    includePath: string | undefined;
    excludePath: string | undefined;
    statusCheck: boolean;
    failOnFormattingErrors: boolean;
    statusCheckContext: {
        name: string;
        genre: string;
    };
    token: string | undefined;
}