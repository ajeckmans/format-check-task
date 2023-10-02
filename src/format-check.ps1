# Error Handling Function
function Handle-Error {
    param(
        [string]$Message
    )
    Write-Host "##vso[task.logissue type=error]$Message"
    Write-Host "##vso[task.complete result=Failed;]Failed."
    exit 1
}

# Check for Task Cancellation
function Check-Cancellation {
    if ($env:AGENT_JOBSTATUS -eq 'Cancelling') {
        Handle-Error "Task was cancelled."
    }
}

# Start of script
Write-Host "Starting format check script."

# Check if it's a PR build
$pullRequestId = $env:SYSTEM_PULLREQUEST_PULLREQUESTID
if (-not $pullRequestId) {
  Write-Host "Not a PR build. Skipping."
  exit 0
}

# Task parameters
$solutionPath = Get-TaskVariable "SolutionPath"
$reportPath = "format-report.json"

# Validate SolutionPath
if ([string]::IsNullOrWhiteSpace($solutionPath)) {
    Handle-Error "SolutionPath is not set."
}
if (-Not (Test-Path -Path $solutionPath -PathType Leaf)) {
    Handle-Error "Solution file at $solutionPath does not exist."
}

# Validate reportPath
if ([string]::IsNullOrWhiteSpace($reportPath)) {
    Handle-Error "reportPath is not set."
}
if (Test-Path -Path $reportPath -PathType Leaf) {
    Remove-Item -Path $reportPath -Force
}

# Run dotnet format with verbosity and reporting
$formatCmd = "dotnet format $solutionPath --verify-no-changes -v diag --report $reportPath"
Write-Host "Running dotnet format command."
Invoke-Expression $formatCmd -ErrorAction Stop -ErrorVariable +errors
Write-Host "Dotnet format command completed."

# Check for errors
if ($errors.Count -gt 0) {
    Handle-Error "Dotnet format command failed."
}

# Check if dotnet format was successful
if ($LASTEXITCODE -eq 0) {
  Write-Host "Code format is correct."
  exit 0
}

# Fetch existing threads with pagination
Write-Host "Fetching existing threads with pagination."
$uriForExistingThreads = "$($env:SYSTEM_TEAMFOUNDATIONCOLLECTIONURI)$env:SYSTEM_TEAMPROJECTID/_apis/git/repositories/$($env:BUILD_REPOSITORY_ID)/pullRequests/$pullRequestId/threads?api-version=6.0"
$headers = @{
  Authorization = "Bearer $env:SYSTEM_ACCESSTOKEN"
}

$existingThreads = @()
$continuationToken = $null
do {
    $uri = $uriForExistingThreads
    if ($continuationToken) {
        $uri = "$uri&continuationToken=$continuationToken"
    }
    Write-Host "Fetching threads: $uri"
    $response = Invoke-RestMethod -Uri $uri -Method Get -Headers $headers -ErrorAction Stop -ErrorVariable +errors
    $existingThreads += $response.value
    $continuationToken = $response.continuationToken
    if ($continuationToken) {
        Write-Host "Continuation token found. Fetching next set of threads."
    }
} while ($continuationToken)
Write-Host "Completed fetching existing threads."

# Check for errors
if ($errors.Count -gt 0) {
    Handle-Error "Fetching existing threads failed."
}

# Parse the JSON report to extract failures
Write-Host "Parsing the JSON report to extract failures."
$report = Get-Content $reportPath | ConvertFrom-Json
foreach ($file in $report) {
  foreach ($change in $file.FileChanges) {
    # Check for task cancellation
    Check-Cancellation

    $content = "[Automated] $($change.DiagnosticId): $($change.FormatDescription)"
    $existingThread = $existingThreads.value | Where-Object { $_.comments.content -eq $content }

    $threadData = @{
      "path" = $file.FilePath
      "line" = $change.LineNumber
      "comments" = @(@{
        "content" = $content
        "commentType" = 1
      })
    }

    $uriForThread = "$($env:SYSTEM_TEAMFOUNDATIONCOLLECTIONURI)$env:SYSTEM_TEAMPROJECTID/_apis/git/repositories/$($env:BUILD_REPOSITORY_ID)/pullRequests/$pullRequestId/threads?api-version=6.0"

    if ($existingThread) {
      # Update the existing thread
      Write-Host "Updating existing thread." 
      $uriForThread += "/$($existingThread.id)"
      Invoke-RestMethod -Uri $uriForThread -Method Update -Body ($threadData | ConvertTo-Json -Compress) -Headers $headers -ContentType "application/json"
    } else {
      # Create a new thread
      Write-Host "Creating new thread."
      Invoke-RestMethod -Uri $uriForThread -Method Post -Body ($threadData | ConvertTo-Json -Compress) -Headers $headers -ContentType "application/json"
    }
  }
}

# Fail the build
Write-Host "##vso[task.complete result=Failed;]Code format is incorrect."

Write-Host "Format check script completed."