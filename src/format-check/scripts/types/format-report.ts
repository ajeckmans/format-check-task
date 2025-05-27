/**
 * @class FormatReport
 * A class to represent the report of a single file's formatting issues.
 */
export class FormatReport {

  /**
   * Information about the Document ID.
   *
   * @type {{ ProjectId: { Id: string }, Id: string }}
   */
  DocumentId!: { ProjectId: { Id: string }, Id: string };

  /**
   * Name of the file.
   *
   * @type {string}
   */
  FileName!: string;

  /**
   * Path to the file.
   *
   * @type {string}
   */
  FilePath!: string;

  /**
   * Array of formatting issues in the file.
   *
   * @type {{ LineNumber: number, CharNumber: number, DiagnosticId: string, FormatDescription: string }[]}
   */
  FileChanges!: { LineNumber: number, CharNumber: number, DiagnosticId: string, FormatDescription: string }[];
}

/**
* @class FormatReports
* An array-like class to hold multiple FormatReport instances.
*
* @extends {Array<FormatReport>}
*/
export class FormatReports extends Array<FormatReport> {
}
