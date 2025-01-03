import { execSync } from "child_process";
import { FormatReports } from "../types/format-report";
import * as fs from "fs";

/**
 * @class FormatCheckRunner
 * A utility class to run .NET format checks on a given solution.
 */
export class FormatCheckRunner {
  private reportPath: string = "format-report.json";

  /**
   * Initializes a new instance of FormatCheckRunner.
   *
   * @param {string} solutionPath - The path to the .NET solution file.
   * @param {string} includePath - Files to include in the format check.
   * @param {string} excludePath - Files to exclude from the format check.
   *
   * @example
   * const runner = new FormatCheckRunner("./solution.sln", "./include", "./exclude");
   */
  constructor(
    private solutionPath: string,
    private includePath: string | undefined,
    private excludePath: string | undefined
  ) {
    if (!fs.existsSync(solutionPath)) {
      console.error("Solution file at solutionPath does not exist.");
      process.exit(1);
    }

    if (fs.existsSync(this.reportPath)) {
      fs.unlinkSync(this.reportPath);
      console.log("Successfully deleted the existing report file.");
    }
  }

  /**
   * Runs the .NET format check command and returns a report.
   *
   * @returns {Promise<FormatReports>} - The formatting error report.
   *
   * @example
   * const report = await runner.runFormatCheck();
   *
   * @throws Error when the command fails.
   */
  async runFormatCheck(): Promise<FormatReports> {
    try {
      const formatCmd = this.getCommandString();

      console.log(`Running dotnet format command. (${formatCmd})`);
      const dotnetFormatVersion = execSync("dotnet format --version", {
        encoding: "utf8",
      });
      console.log(`Using dotnet format version ${dotnetFormatVersion}`);

      try {
        execSync(formatCmd, { stdio: ["inherit", "inherit", "pipe"] });
      } catch (error) {
        this.handleDotnetFormatError(error);
      }

      console.log("Dotnet format command completed.");
      return await this.retrieveErrorReport();
    } catch (error) {
      console.error(`Dotnet format task failed with error ${error}`);
      process.exit(1);
    }
  }

  /**
   * @private
   * Generates the .NET format command string based on the given parameters.
   *
   * @returns {string} - The generated command string.
   */
  private getCommandString(): string {
    return `dotnet format ${
      this.solutionPath
    } --verify-no-changes --verbosity diagnostic --report ${this.reportPath} ${
      this.includePath ? `--include ${this.includePath}` : ""
    } ${this.excludePath ? `--exclude ${this.excludePath}` : ""}`;
  }

  /**
   * @private
   * Handles errors thrown by the `dotnet format` command.
   *
   * @param {any} error - The error to handle.
   */
  private handleDotnetFormatError(error: any): void {
    console.error(`Dotnet format command failed with error ${error}`);

    if ("stderr" in error && error.stderr) {
      console.error("stderr output:", error.stderr.toString());
    }

    if (!fs.existsSync(this.reportPath)) {
      // Format command has failed. No report was generated.
      console.error("No report found at reportPath.");
      process.exit(1);
    }
  }

  /**
   * @private
   * Retrieves the formatting error report generated by the `dotnet format` command.
   *
   * @returns {Promise<FormatReports>} - The formatting error report.
   */
  private async retrieveErrorReport(): Promise<FormatReports> {
    console.log("Loading error report.");
    return JSON.parse(fs.readFileSync(this.reportPath, "utf8"));
  }
}
