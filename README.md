# Custom Azure DevOps PR task for code formatting check

This project contains a custom Azure DevOps Pull Request (PR) task constructed for the specific need of validating code formatting rules using dotnet. It is designed to add value to your workflows by automatically detecting and highlighting any code violations, injecting these as comments directly into your PR.

## Features

* Automated code formatting check using dotnet.
* Direct injection of any identified errors as comments into your PR.

## How to use

1. Integrate this task into your Azure pipeline.
2. During the operation of the pipeline, the task will examine your code and highlight formatting issues using dotnet.
3. Any errors identified will be automatically pushed as comments to your PR, highlighting the exact locations and nature of the issues.

By improving your workflow with this custom PR task, we hope to save time, improve code quality, increase team efficiency, and ensure code consistency across your projects. Happy coding!