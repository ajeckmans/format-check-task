"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_normalizer_1 = require("./path-normalizer");
var globals_1 = require("@jest/globals");
(0, globals_1.describe)('PathNormalizer', function () {
    var originalBuildSourcesDirectory;
    (0, globals_1.beforeEach)(function () {
        // Save the original environment variable
        originalBuildSourcesDirectory = process.env.BUILD_SOURCESDIRECTORY;
    });
    (0, globals_1.afterEach)(function () {
        // Restore the original environment variable
        process.env.BUILD_SOURCESDIRECTORY = originalBuildSourcesDirectory;
    });
    (0, globals_1.it)('should normalize file path by removing Settings.Environment.sourcesDirectory', function () {
        // Arrange
        var mockSettings = {
            Environment: {
                sourcesDirectory: '/source'
            }
        };
        var filePath = '/source/folder/file.txt';
        var normalizer = new path_normalizer_1.PathNormalizer(mockSettings);
        // Act
        var normalized = normalizer.normalizeFilePath(filePath);
        // Assert
        (0, globals_1.expect)(normalized).toBe('/folder/file.txt');
    });
    (0, globals_1.it)('should normalize file path and always keep a /', function () {
        // Arrange
        var mockSettings = {
            Environment: {
                sourcesDirectory: '/source/'
            }
        };
        var filePath = '/source/folder/file.txt';
        var normalizer = new path_normalizer_1.PathNormalizer(mockSettings);
        // Act
        var normalized = normalizer.normalizeFilePath(filePath);
        // Assert
        (0, globals_1.expect)(normalized).toBe('/folder/file.txt');
    });
});
