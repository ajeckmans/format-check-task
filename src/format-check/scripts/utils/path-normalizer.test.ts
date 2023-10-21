import {PathNormalizer} from './path-normalizer';
import {describe, it, expect, beforeEach, afterEach} from '@jest/globals';
import {Settings} from '../types/settings'

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

    it('should normalize file path by removing Settings.Environment.sourcesDirectory', () => {
        // Arrange
        const mockSettings = {
            Environment: {
                sourcesDirectory: '/source'
            }
        } as unknown as Settings;

        const filePath = '/source/folder/file.txt';
        const normalizer = new PathNormalizer(mockSettings);

        // Act
        const normalized = normalizer.normalizeFilePath(filePath);

        // Assert
        expect(normalized).toBe('/folder/file.txt');
    });
});
