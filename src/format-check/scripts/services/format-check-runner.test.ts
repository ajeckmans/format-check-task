import {FormatCheckRunner} from './format-check-runner';
import {execSync} from 'child_process';
import * as fs from 'fs';
import {FormatReports} from '../types/format-report';
import {jest, describe, it, expect, beforeEach, afterEach} from '@jest/globals';
import {randomUUID} from "crypto";

jest.mock('child_process');
const mockExecSync = jest.mocked(execSync);
jest.mock('process');
jest.mock('console', () => ({
    error: jest.fn(),
}));
jest.mock('fs');
const mockUnlinkSync = jest.mocked(fs.unlinkSync);
const mockExistsSync = jest.mocked(fs.existsSync);

describe('FormatCheckRunner', () => {
    let runner: FormatCheckRunner;
    let exitSpy: jest.Mock;
    let exitCode: number = 0;

    beforeEach(() => {
        jest.clearAllMocks();

        exitSpy = jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
            if (typeof code === 'string') {
                exitCode = 1;
            } else {
                exitCode = code ?? 0;
            }
            return undefined as unknown as never;
        }) as unknown as jest.Mock;
    });

    afterEach(() => {
        // Clean up the spy
        exitSpy.mockRestore();
    });

    it('should construct without errors', () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true); // Mock return value
        runner = new FormatCheckRunner('./solution.sln', './include', './exclude');
        expect(runner).toBeInstanceOf(FormatCheckRunner);
    });

    it('should fail construction if solution does not exist', () => {
        (fs.existsSync as jest.Mock).mockReturnValue(false);

        // Mock process.exit before the test
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => {
        }) as any);

        new FormatCheckRunner('./solution.sln', './include', './exclude');

        // Check if process.exit has been called with code 1
        expect(exitSpy).toHaveBeenCalledWith(1);

        // Restore process.exit to its original function after the test
        exitSpy.mockRestore();
    });


    it('should run format check successfully', async () => {
        const mockReport: FormatReports = [
            {
                DocumentId: {
                    Id: randomUUID(),
                    ProjectId: {
                        Id: randomUUID()
                    }
                },
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
            }
        ];
        (fs.existsSync as jest.Mock).mockReturnValue(true); // Mock return value
        (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockReport));

        runner = new FormatCheckRunner('./solution.sln', './include', './exclude');
        const report = await runner.runFormatCheck();
        expect(report).toEqual(mockReport);
        expect(execSync).toHaveBeenCalled();
    });

    it('should handle dotnet format crashes', async () => {
        const mockError = new Error('Dotnet format crashed');
        mockExecSync.mockImplementation(((command: string) => {
            if (command.startsWith('dotnet format')) {
                throw mockError;
            }
            return Buffer.from('mock buffer content', 'utf-8');
        }) as typeof execSync);

        mockExistsSync.mockReturnValue(false);

        runner = new FormatCheckRunner('./solution.sln', './include', './exclude');
        await runner.runFormatCheck();
        expect(exitCode).toBe(1);
    });

    it('should handle dotnet format errors', async () => {
        const mockReport: FormatReports = [
            {
                DocumentId: {
                    Id: randomUUID(),
                    ProjectId: {
                        Id: randomUUID()
                    }
                },
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
            }
        ];
        (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockReport));

        (execSync as jest.Mock)
            .mockImplementationOnce(() => {
            })
            .mockImplementationOnce(() => {
            });
        (fs.existsSync as jest.Mock).mockReturnValueOnce(true);

        mockUnlinkSync.mockImplementation(((path: fs.PathLike) => {
            if (path.toString().endsWith('format-report.json')) {
                // do nothing
            } else {
                throw new Error("not mocked");
            }
        }) as typeof fs.unlinkSync);

        runner = new FormatCheckRunner('./solution.sln', './include', './exclude');
        await expect(runner.runFormatCheck()).resolves.toEqual(
            [{
                "DocumentId": {
                    "Id": mockReport[0].DocumentId.Id,
                    "ProjectId": {"Id": mockReport[0].DocumentId.ProjectId.Id}
                },
                "FileChanges": [{
                    "CharNumber": 1,
                    "DiagnosticId": mockReport[0].FileChanges[0].DiagnosticId,
                    "FormatDescription": "some error",
                    "LineNumber": 2
                }],
                "FileName": "somefile.ts",
                "FilePath": "/src/somefile.ts"
            }]
        );
    });
});
