import { PathNormalizer } from './path-normalizer';
import {describe, it, expect, beforeEach, afterEach} from '@jest/globals';

describe('PathNormalizer', () => {
    let originalBuildSourcesDirectory: string | undefined;

    beforeEach(() => {
        // Save the original environment variable
        originalBuildSourcesDirectory = process.env.BUILD_SOURCESDIRECTORY;
    });

    afterEach(() => {
        // Restore the original environment variable
        process.env.BUILD_SOURCESDIRECTORY = originalBuildSourcesDirectory;
    });

    it('should normalize file path by removing BUILD_SOURCESDIRECTORY', () => {
        // Arrange
        process.env.BUILD_SOURCESDIRECTORY = '/source/';
        const filePath = '/source/folder/file.txt';

        // Act
        const normalized = PathNormalizer.normalizeFilePath(filePath);

        // Assert
        expect(normalized).toBe('folder/file.txt');
    });

    it('should return same path if BUILD_SOURCESDIRECTORY is not found in path', () => {
        // Arrange
        process.env.BUILD_SOURCESDIRECTORY = '/source/';
        const filePath = '/another/folder/file.txt';

        // Act
        const normalized = PathNormalizer.normalizeFilePath(filePath);

        // Assert
        expect(normalized).toBe('/another/folder/file.txt');
    });
});
