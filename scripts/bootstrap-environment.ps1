[CmdletBinding()]
param(
    [string[]]$Components = @("Node", "PowerShell", "Ffmpeg"),
    [string]$CodexHome = $env:CODEX_HOME,
    [string]$NodeVersion = "24.22.1",
    [string]$PowerShellVersion = "7.6.5",
    [string]$NodeUrl,
    [string]$PowerShellUrl,
    [string]$FfmpegUrl = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip",
    [string]$ProjectRoot = (Get-Location).Path,
    [string]$KitRoot,
    [string]$ConfigPath,
    [switch]$RunPreflight,
    [switch]$CheckOnly,
    [switch]$Json
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

if (-not $CodexHome) {
    $CodexHome = Join-Path $HOME ".codex"
}
$CodexHome = [System.IO.Path]::GetFullPath($CodexHome)
$ToolsRoot = Join-Path $CodexHome "tools"
$ToolsBin = Join-Path $ToolsRoot "bin"
$Results = New-Object System.Collections.ArrayList

$AllowedComponents = @("Node", "PowerShell", "Ffmpeg")
$Components = @($Components |
    ForEach-Object { $_ -split "," } |
    ForEach-Object { $_.Trim() } |
    Where-Object { $_ })
foreach ($component in $Components) {
    if ($AllowedComponents -notcontains $component) {
        throw "Unsupported component: $component. Use Node, PowerShell, or Ffmpeg."
    }
}

function Get-CommandPath {
    param([string]$Name)
    $command = Get-Command $Name -ErrorAction SilentlyContinue |
        Select-Object -First 1
    if ($command) {
        return $command.Source
    }
    return $null
}

function Resolve-ToolPath {
    param(
        [string]$Name,
        [string[]]$Candidates
    )
    $commandPath = Get-CommandPath $Name
    if ($commandPath) {
        return $commandPath
    }
    foreach ($candidate in @($Candidates)) {
        if ($candidate -and (Test-Path -LiteralPath $candidate -PathType Leaf)) {
            return [System.IO.Path]::GetFullPath($candidate)
        }
    }
    return $null
}

function Invoke-Tool {
    param(
        [string]$Executable,
        [string[]]$Arguments
    )
    try {
        $output = & $Executable @Arguments 2>&1
        return [pscustomobject]@{
            exitCode = $LASTEXITCODE
            output = (($output | ForEach-Object { [string]$_ }) -join "`n").Trim()
            startError = $null
        }
    }
    catch {
        return [pscustomobject]@{
            exitCode = -1
            output = $_.Exception.Message
            startError = $_.Exception.Message
        }
    }
}

function Get-NodeInfo {
    param([string]$Executable)
    if (-not $Executable) {
        return [pscustomobject]@{ major = $null; blocked = $false; error = $null }
    }
    $run = Invoke-Tool -Executable $Executable -Arguments @("--version")
    if ($run.exitCode -ne 0) {
        return [pscustomobject]@{
            major = $null
            blocked = [bool]$run.startError
            error = $(if ($run.startError) { $run.startError } else { $run.output })
        }
    }
    if ($run.output -match "v?(\d+)\.") {
        return [pscustomobject]@{
            major = [int]$Matches[1]
            blocked = $false
            error = $null
        }
    }
    return [pscustomobject]@{
        major = $null
        blocked = $false
        error = "Cannot parse Node.js version output: $($run.output)"
    }
}

function Get-PowerShellInfo {
    param([string]$Executable)
    if (-not $Executable) {
        return [pscustomobject]@{ major = $null; blocked = $false; error = $null }
    }
    $run = Invoke-Tool -Executable $Executable -Arguments @(
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        '$PSVersionTable.PSVersion.Major'
    )
    if ($run.exitCode -ne 0) {
        return [pscustomobject]@{
            major = $null
            blocked = [bool]$run.startError
            error = $(if ($run.startError) { $run.startError } else { $run.output })
        }
    }
    $value = ($run.output -split "\s+" | Where-Object { $_ -match "^\d+$" } |
        Select-Object -Last 1)
    if ($value) {
        return [pscustomobject]@{
            major = [int]$value
            blocked = $false
            error = $null
        }
    }
    return [pscustomobject]@{
        major = $null
        blocked = $false
        error = "Cannot parse PowerShell version output: $($run.output)"
    }
}

function Get-FfmpegInfo {
    param(
        [string]$Ffmpeg,
        [string]$Ffprobe
    )
    if (-not $Ffmpeg -or -not $Ffprobe) {
        return [pscustomobject]@{
            ready = $false
            blocked = $false
            error = $null
        }
    }
    $ffmpegRun = Invoke-Tool -Executable $Ffmpeg -Arguments @("-version")
    $ffprobeRun = Invoke-Tool -Executable $Ffprobe -Arguments @("-version")
    return [pscustomobject]@{
        ready = ($ffmpegRun.exitCode -eq 0 -and $ffprobeRun.exitCode -eq 0)
        blocked = [bool]($ffmpegRun.startError -or $ffprobeRun.startError)
        error = $(if ($ffmpegRun.exitCode -ne 0) {
            $(if ($ffmpegRun.startError) { $ffmpegRun.startError } else { $ffmpegRun.output })
        }
        elseif ($ffprobeRun.exitCode -ne 0) {
            $(if ($ffprobeRun.startError) { $ffprobeRun.startError } else { $ffprobeRun.output })
        }
        else {
            $null
        })
    }
}

function Write-Utf8NoBom {
    param(
        [string]$Path,
        [string]$Content
    )
    $parent = Split-Path -Parent $Path
    if ($parent) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }
    $encoding = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $encoding)
}

function Write-CmdShim {
    param(
        [string]$Name,
        [string]$Executable,
        [string[]]$PrefixArguments = @()
    )
    $argumentText = ""
    if ($PrefixArguments.Count -gt 0) {
        $argumentText = (($PrefixArguments | ForEach-Object {
            '"{0}"' -f $_.Replace('"', '""')
        }) -join " ") + " "
    }
    $content = @(
        "@echo off",
        "setlocal EnableExtensions",
        ('"{0}" {1}%*' -f $Executable, $argumentText),
        "exit /b %ERRORLEVEL%",
        ""
    ) -join "`r`n"
    Write-Utf8NoBom -Path (Join-Path $ToolsBin "$Name.cmd") -Content $content
}

function Add-Result {
    param(
        [string]$Id,
        [string]$Status,
        [string]$Path,
        [string]$Version,
        [string]$Error
    )
    [void]$Results.Add([pscustomobject]@{
        id = $Id
        status = $Status
        path = $Path
        version = $Version
        error = $Error
    })
}

function Get-WindowsArchitecture {
    $architecture = [string]$env:PROCESSOR_ARCHITECTURE
    if ($architecture -match "ARM64") {
        return "arm64"
    }
    if ($architecture -match "AMD64|x86") {
        return "x64"
    }
    throw "Unsupported Windows architecture: $architecture"
}

function Expand-DownloadedZip {
    param(
        [string]$Url,
        [string]$Destination
    )
    $tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) (
        "xz-video-bootstrap-" + [guid]::NewGuid().ToString("N")
    )
    New-Item -ItemType Directory -Path $tempRoot -Force | Out-Null
    $archivePath = Join-Path $tempRoot "download.zip"
    $extractPath = Join-Path $tempRoot "extract"
    try {
        Invoke-WebRequest -Uri $Url -OutFile $archivePath -UseBasicParsing -TimeoutSec 900
        Expand-Archive -LiteralPath $archivePath -DestinationPath $extractPath -Force
        New-Item -ItemType Directory -Path $Destination -Force | Out-Null
        Get-ChildItem -LiteralPath $extractPath -Force | ForEach-Object {
            Copy-Item -LiteralPath $_.FullName -Destination $Destination -Recurse -Force
        }
    }
    finally {
        if (Test-Path -LiteralPath $tempRoot) {
            Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

function Install-Node {
    $nodePath = Resolve-ToolPath -Name "node" -Candidates @(
        (Join-Path $ToolsBin "node.cmd"),
        (Join-Path $ToolsRoot "node\node.exe")
    )
    $nodeInfo = Get-NodeInfo $nodePath
    if ($nodeInfo.major -ge 22) {
        Add-Result -Id "node" -Status "present" -Path $nodePath -Version "v$($nodeInfo.major)" -Error $null
        return
    }
    if ($nodeInfo.blocked) {
        Add-Result -Id "node" -Status "blocked" -Path $nodePath -Version $null -Error $nodeInfo.error
        return
    }
    if ($CheckOnly) {
        Add-Result -Id "node" -Status "missing" -Path $nodePath -Version $null -Error "Node.js 22 or newer is required."
        return
    }

    try {
        $arch = Get-WindowsArchitecture
        $url = $NodeUrl
        if (-not $url) {
            $url = "https://nodejs.org/dist/v$NodeVersion/node-v$NodeVersion-win-$arch.zip"
        }
        $target = Join-Path $ToolsRoot "node"
        Expand-DownloadedZip -Url $url -Destination $target
        $nodeExe = Get-ChildItem -LiteralPath $target -Recurse -File -Filter "node.exe" |
            Select-Object -First 1
        if (-not $nodeExe) {
            throw "node.exe was not found after extraction."
        }
        $nodeRoot = $nodeExe.Directory.FullName
        Write-CmdShim -Name "node" -Executable $nodeExe.FullName
        $npmCli = Join-Path $nodeRoot "node_modules\npm\bin\npm-cli.js"
        $npxCli = Join-Path $nodeRoot "node_modules\npm\bin\npx-cli.js"
        if (Test-Path -LiteralPath $npmCli) {
            Write-CmdShim -Name "npm" -Executable $nodeExe.FullName -PrefixArguments @($npmCli)
        }
        if (Test-Path -LiteralPath $npxCli) {
            Write-CmdShim -Name "npx" -Executable $nodeExe.FullName -PrefixArguments @($npxCli)
        }
        $installed = Join-Path $ToolsBin "node.cmd"
        $installedInfo = Get-NodeInfo $installed
        if ($installedInfo.major -lt 22) {
            throw "Installed Node.js did not pass the version check."
        }
        Add-Result -Id "node" -Status "installed" -Path $installed -Version "v$($installedInfo.major)" -Error $null
    }
    catch {
        Add-Result -Id "node" -Status "failed" -Path $null -Version $null -Error $_.Exception.Message
    }
}

function Install-PowerShell {
    $pwshPath = Resolve-ToolPath -Name "pwsh" -Candidates @(
        (Join-Path $ToolsBin "pwsh.cmd"),
        (Join-Path $ToolsRoot "powershell\pwsh.exe")
    )
    $pwshInfo = Get-PowerShellInfo $pwshPath
    if ($pwshInfo.major -ge 7) {
        Add-Result -Id "powershell" -Status "present" -Path $pwshPath -Version "$($pwshInfo.major)" -Error $null
        return
    }
    if ($pwshInfo.blocked) {
        Add-Result -Id "powershell" -Status "blocked" -Path $pwshPath -Version $null -Error $pwshInfo.error
        return
    }
    if ($CheckOnly) {
        Add-Result -Id "powershell" -Status "missing" -Path $pwshPath -Version $null -Error "PowerShell 7 or newer is required."
        return
    }

    try {
        $arch = Get-WindowsArchitecture
        $url = $PowerShellUrl
        if (-not $url) {
            $url = "https://github.com/PowerShell/PowerShell/releases/download/v$PowerShellVersion/PowerShell-$PowerShellVersion-win-$arch.zip"
        }
        $target = Join-Path $ToolsRoot "powershell"
        Expand-DownloadedZip -Url $url -Destination $target
        $pwshExe = Get-ChildItem -LiteralPath $target -Recurse -File -Filter "pwsh.exe" |
            Select-Object -First 1
        if (-not $pwshExe) {
            throw "pwsh.exe was not found after extraction."
        }
        Write-CmdShim -Name "pwsh" -Executable $pwshExe.FullName
        $installed = Join-Path $ToolsBin "pwsh.cmd"
        $installedInfo = Get-PowerShellInfo $installed
        if ($installedInfo.major -lt 7) {
            throw "Installed PowerShell did not pass the version check."
        }
        Add-Result -Id "powershell" -Status "installed" -Path $installed -Version "$($installedInfo.major)" -Error $null
    }
    catch {
        Add-Result -Id "powershell" -Status "failed" -Path $null -Version $null -Error $_.Exception.Message
    }
}

function Install-Ffmpeg {
    $ffmpegPath = Resolve-ToolPath -Name "ffmpeg" -Candidates @(
        (Join-Path $ToolsBin "ffmpeg.cmd"),
        (Join-Path $ToolsRoot "ffmpeg\ffmpeg.exe")
    )
    $ffprobePath = Resolve-ToolPath -Name "ffprobe" -Candidates @(
        (Join-Path $ToolsBin "ffprobe.cmd"),
        (Join-Path $ToolsRoot "ffmpeg\ffprobe.exe")
    )
    $ffmpegInfo = Get-FfmpegInfo -Ffmpeg $ffmpegPath -Ffprobe $ffprobePath
    if ($ffmpegInfo.ready) {
        Add-Result -Id "ffmpeg" -Status "present" -Path $ffmpegPath -Version $null -Error $null
        return
    }
    if ($ffmpegInfo.blocked) {
        Add-Result -Id "ffmpeg" -Status "blocked" -Path $ffmpegPath -Version $null -Error $ffmpegInfo.error
        return
    }
    if ($CheckOnly) {
        Add-Result -Id "ffmpeg" -Status "missing" -Path $ffmpegPath -Version $null -Error "FFmpeg and ffprobe are required."
        return
    }

    try {
        $target = Join-Path $ToolsRoot "ffmpeg"
        Expand-DownloadedZip -Url $FfmpegUrl -Destination $target
        $ffmpegExe = Get-ChildItem -LiteralPath $target -Recurse -File -Filter "ffmpeg.exe" |
            Select-Object -First 1
        $ffprobeExe = Get-ChildItem -LiteralPath $target -Recurse -File -Filter "ffprobe.exe" |
            Select-Object -First 1
        if (-not $ffmpegExe -or -not $ffprobeExe) {
            throw "ffmpeg.exe or ffprobe.exe was not found after extraction."
        }
        Write-CmdShim -Name "ffmpeg" -Executable $ffmpegExe.FullName
        Write-CmdShim -Name "ffprobe" -Executable $ffprobeExe.FullName
        $installedFfmpeg = Join-Path $ToolsBin "ffmpeg.cmd"
        $installedFfprobe = Join-Path $ToolsBin "ffprobe.cmd"
        if (-not (Get-FfmpegInfo -Ffmpeg $installedFfmpeg -Ffprobe $installedFfprobe).ready) {
            throw "Installed FFmpeg did not pass the health check."
        }
        Add-Result -Id "ffmpeg" -Status "installed" -Path $installedFfmpeg -Version $null -Error $null
    }
    catch {
        Add-Result -Id "ffmpeg" -Status "failed" -Path $null -Version $null -Error $_.Exception.Message
    }
}

if (-not $CheckOnly) {
    New-Item -ItemType Directory -Path $ToolsBin -Force | Out-Null
}
$env:PATH = "$ToolsBin;$env:PATH"

foreach ($component in $Components) {
    switch ($component) {
        "Node" { Install-Node }
        "PowerShell" { Install-PowerShell }
        "Ffmpeg" { Install-Ffmpeg }
    }
}

$failed = @($Results | Where-Object {
    $_.status -eq "failed" -or
    $_.status -eq "missing" -or
    $_.status -eq "blocked"
})
$report = [pscustomobject]@{
    ok = ($failed.Count -eq 0)
    codexHome = $CodexHome
    toolsRoot = $ToolsRoot
    toolsBin = $ToolsBin
    checkOnly = [bool]$CheckOnly
    components = @($Results)
}

$preflightReport = $null
$preflightExitCode = $null
$preflightRawOutput = $null
if ($RunPreflight -and $report.ok) {
    $nodePath = Resolve-ToolPath -Name "node" -Candidates @(
        (Join-Path $ToolsBin "node.cmd"),
        (Join-Path $ToolsRoot "node\node.exe")
    )
    if (-not $nodePath) {
        $preflightExitCode = 1
        $preflightRawOutput = "Node.js is unavailable after bootstrap."
    }
    else {
        $cliPath = Join-Path $PSScriptRoot "cli.mjs"
        $nodeArguments = @(
            $cliPath,
            "preflight",
            "--json",
            "--project-root",
            [System.IO.Path]::GetFullPath($ProjectRoot)
        )
        if ($KitRoot) {
            $nodeArguments += @("--kit-root", [System.IO.Path]::GetFullPath($KitRoot))
        }
        if ($ConfigPath) {
            $nodeArguments += @("--config", [System.IO.Path]::GetFullPath($ConfigPath))
        }
        $preflightRawOutput = & $nodePath @nodeArguments 2>&1
        $preflightExitCode = $LASTEXITCODE
        $preflightText = (($preflightRawOutput | ForEach-Object {
            [string]$_
        }) -join "`n").Trim()
        $jsonStart = $preflightText.IndexOf("{")
        $jsonEnd = $preflightText.LastIndexOf("}")
        if ($jsonStart -ge 0 -and $jsonEnd -gt $jsonStart) {
            try {
                $preflightReport = $preflightText.Substring(
                    $jsonStart,
                    $jsonEnd - $jsonStart + 1
                ) | ConvertFrom-Json
            }
            catch {
                $preflightReport = $null
            }
        }
    }
}

$overallOk = (
    $report.ok -and
    (-not $RunPreflight -or (
        $preflightExitCode -eq 0 -and
        $preflightReport -and
        $preflightReport.ok
    ))
)
$combined = [pscustomobject]@{
    ok = $overallOk
    bootstrap = $report
    preflightExitCode = $preflightExitCode
    preflight = $preflightReport
}
if ($RunPreflight -and -not $preflightReport -and $preflightRawOutput) {
    $combined | Add-Member -NotePropertyName preflightOutput `
        -NotePropertyValue (
            (($preflightRawOutput | ForEach-Object { [string]$_ }) -join "`n").Trim()
        )
}

if ($Json) {
    if ($RunPreflight) {
        $combined | ConvertTo-Json -Depth 10
    }
    else {
        $report | ConvertTo-Json -Depth 6
    }
}
else {
    if ($RunPreflight) {
        $combined
    }
    else {
        $report
    }
}

if (-not $overallOk) {
    exit 1
}
