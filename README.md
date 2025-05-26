# Custom Azure DevOps PR Task for Code Formatting Check

This project contains a custom Azure DevOps Pull Request (PR) task designed to validate code formatting rules using dotnet. It enhances your workflows by automatically detecting and highlighting code violations, injecting these as comments directly into your PR.

## Table of Contents

- [Features](#features)
- [Task Parameters](#task-parameters)
- [How to Use](#how-to-use)
- [Installation](#installation)
- [Release Process](#release-process)
- [Contributing](#contributing)
- [Source Code](#source-code)

## Features

- Automated code formatting check using dotnet
- Direct injection of identified errors as comments into your PR
- Configurable to fail the build or just add comments
- Option to set a PR status check
- Ability to scope the check to only files included in the PR

## Task Parameters

The task has several configurable parameters:

- **SolutionPath**: (Required) Specify the path to the solution directory.
- **IncludePath**: (Optional) Specify the path to be included.
- **ExcludePath**: (Optional) Specify the path to be excluded.
- **FailOnFormattingErrors**: (Optional, default: true) If set to false, the task will NOT fail when formatting errors are found.
- **StatusCheck**: (Optional, default: false) If set to true, the task will set a status check in the PR when formatting errors are found.
- **StatusCheckName**: (Optional, default: "format check") Name of the status check in the PR for formatting errors.
- **StatusCheckGenre**: (Optional, default: "formatting") Genre of the status check in the PR for formatting errors.
- **ScopeToPullRequest**: (Optional, default: false) When checked, the task only considers failures for files in the pull request. Additionally, it will only report formatting issues on lines that have been changed in the pull request, which is particularly useful for files with conditional compilation blocks or other platform-specific code.

## How to Use

1. **Integrate the task into your Azure pipeline:**

   To include the task without failing the build but set a PR status check, use:
   ```yaml
   - task: FormatCheck@1
     inputs:
       SolutionPath: '$(Build.SourcesDirectory)'
       failOnFormattingErrors: false
       statusCheck: true
       statusCheckName: format check
       statusCheckGenre: formatting
     env:
       SYSTEM_ACCESSTOKEN: $(System.AccessToken)
   ```

   To make the task fail the PR build:
   ```yaml
   - task: FormatCheck@1
     inputs:
       SolutionPath: '$(Build.SourcesDirectory)'
     env:
       SYSTEM_ACCESSTOKEN: $(System.AccessToken)
   ```

   In either case, the task will add comments to the pull request for any issues found by dotnet format.

   To scope the task to only files included in the PR, set `ScopeToPullRequest` to true (default: false).
   When `ScopeToPullRequest` is set to true, the task will also only report formatting issues on lines that have been changed in the pull request, which is particularly useful for files with conditional compilation blocks or other platform-specific code.

   **Note:** Ensure the job running the task has rights to use the OAuth token and that the user running the build has the 'Contribute to Pull Requests' permission.

2. **During pipeline operation**, the task will examine your code and highlight formatting issues using dotnet.

3. **Any errors identified** will be automatically pushed as comments to your PR, highlighting the exact locations and nature of the issues.

## Installation

To install this task in your Azure DevOps organization:

1. Navigate to the [Azure DevOps Marketplace](https://marketplace.visualstudio.com/azuredevops)
2. Search for "Format Check dotnet"
3. Click "Get it free" and select your Azure DevOps organization
4. Follow the prompts to install the extension

## Release Process

This project uses GitHub Actions for its release process. When a new tag is pushed that matches the pattern `v*`, the following steps are executed:

1. The code is checked out
2. Node.js environment is set up
3. The version is set based on the tag
4. NPM packages are restored
5. Tests are run
6. The task version is updated
7. Dev dependencies are removed
8. TypeScript is compiled
9. The extension is packaged
10. The extension is published to the Azure DevOps Marketplace

For pull requests, a similar process is followed, but the extension is published as a private test version.

By incorporating this custom PR task into your workflow, we aim to help you save time, improve code quality, increase team efficiency, and ensure code consistency across your projects. Happy coding!

## Contributing

We welcome contributions to improve this task! If you'd like to contribute, please:

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes and commit them
4. Push to your fork and submit a pull request

Please make sure to add tests for any new functionality and update the documentation as needed.

## Source Code

The source code for this task is available on [GitHub](https://github.com/ajeckmans/format-check-task).

Feel free to open issues for bugs, feature requests, or questions!
