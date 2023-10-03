export interface FormatReport {
    DocumentId: {
        ProjectId: {
            Id: string;
        };
        Id: string;
    };
    FileName: string;
    FilePath: string;
    FileChanges: {
        LineNumber: number;
        CharNumber: number;
        DiagnosticId: string;
        FormatDescription: string;
    }[];
}

export type FormatReports = FormatReport[];
