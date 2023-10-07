export interface TaskParameters {
    solutionPath: string | undefined;
    includePath: string | undefined;
    excludePath: string | undefined;
    statusCheck: boolean;
    failOnFormattingErrors: boolean;
    statusCheckContext: {
        name: string;
        genre: string;
    };
}