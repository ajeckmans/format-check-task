/**
 * @module AzureFilePathUtils
 * Utilities for working with file paths in an Azure DevOps environment.
 */
export module PathNormalizer {

    /**
     * Normalizes the provided file path by removing the `BUILD_SOURCESDIRECTORY` environment variable value from it.
     *
     * @function normalizeFilePath
     * @param {string} filePath - The absolute file path to normalize.
     * @returns {string} - A normalized file path relative to the `BUILD_SOURCESDIRECTORY`.
     */
    export function normalizeFilePath(filePath: string): string {
        return filePath.replace(`${process.env.BUILD_SOURCESDIRECTORY}`, '');
    }
}