import {Settings} from "../types/settings";

/**
 * PathNormalizer is a class for path normalization tasks. It uses the settings object for its behavioural config.
 * The main task is to convert an absolute file path to a relative path from the project's source directory.
 *
 * @class
 * @property {Settings} settings - An object of Type Settings necessary for the working of PathNormalizer.
 * @constructor
 * @param {Settings} settings - Configurable settings used in path normalization tasks.
 * @method
 * public normalizeFilePath(filePath: string): string - Takes an absolute file path and normalizes it to be relative to the
 * source directory specified in the `settings` object.
 */
export class PathNormalizer {
    private settings: Settings;

    constructor(settings: Settings) {
        this.settings = settings;
    }

    /**
     * Takes a file path as input and returns a normalized version of the path, relative to the project's source directory.
     *
     * @public
     * @param {string} filePath - The absolute file path to normalise.
     * @returns {string} Normalized version of the supplied file path, relative to the project's source directory.
     */
    public normalizeFilePath(filePath: string): string {
     return filePath.replace(`${this.settings.Environment.sourcesDirectory}`, '');
    }
}