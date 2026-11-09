[CmdletBinding()]
param(
    [string]$LibraryRoot,
    [switch]$SkipMediaProbe
)

$ErrorActionPreference = "Stop"
$scriptRoot = Split-Path -Parent $PSScriptRoot

function Invoke-FfprobeProbe {
    param(
        [string]$Executable,
        [string]$Path
    )

    $startInfo = [System.Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = $Executable
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    foreach ($argument in @(
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=width,height",
        "-show_entries",
        "format=duration",
        "-of",
        "json",
        $Path
    )) {
        [void]$startInfo.ArgumentList.Add($argument)
    }

    try {
        $process = [System.Diagnostics.Process]::Start($startInfo)
        $stdoutTask = $process.StandardOutput.ReadToEndAsync()
        $stderrTask = $process.StandardError.ReadToEndAsync()
        $process.WaitForExit()
        return [pscustomobject]@{
            startError = $null
            exitCode = $process.ExitCode
            stdout = $stdoutTask.Result
            stderr = $stderrTask.Result
        }
    }
    catch {
        return [pscustomobject]@{
            startError = $_.Exception.Message
            exitCode = $null
            stdout = ""
            stderr = ""
        }
    }
}

if (-not $LibraryRoot) {
    if ($env:MOTION_TEMPLATE_LIBRARY_ROOT) {
        $LibraryRoot = $env:MOTION_TEMPLATE_LIBRARY_ROOT
    }
    elseif (Test-Path -LiteralPath (Join-Path (Get-Location) "template-number-index.csv")) {
        $LibraryRoot = (Get-Location).Path
    }
    else {
        $candidate = Split-Path -Parent (Split-Path -Parent $scriptRoot)
        if (Test-Path -LiteralPath (Join-Path $candidate "template-number-index.csv")) {
            $LibraryRoot = $candidate
        }
    }
}

if (-not $LibraryRoot) {
    throw "Template library path not found. Set MOTION_TEMPLATE_LIBRARY_ROOT or pass -LibraryRoot."
}

$root = [System.IO.Path]::GetFullPath($LibraryRoot)
$requiredPaths = @(
    "template-number-index.csv",
    "template-preview-index.csv",
    "previews",
    "gallery\index.html",
    "CARD_LIST.md"
)
$missingPaths = @(
    foreach ($relative in $requiredPaths) {
        if (-not (Test-Path -LiteralPath (Join-Path $root $relative))) {
            $relative
        }
    }
)

if ($missingPaths.Count -gt 0) {
    [pscustomobject]@{
        ok = $false
        libraryRoot = $root
        missingLibraryPaths = $missingPaths
        templateCount = 0
        previewCount = 0
        missingTemplates = @()
        missingPreviews = @()
        invalidPreviews = @()
        ratioMismatches = @()
        hashMismatches = @()
        previewIndexMismatches = @()
        probeStatus = "not-run"
        probeFailures = @()
        warnings = @()
    } | ConvertTo-Json -Depth 6
    exit 1
}

$index = @(Import-Csv -Encoding UTF8 -LiteralPath (Join-Path $root "template-number-index.csv"))
$previewIndexPath = Join-Path $root "template-preview-index.csv"
$previewIndex = @(Import-Csv -Encoding UTF8 -LiteralPath $previewIndexPath)

$motionFiles = @(Get-ChildItem -LiteralPath $root -File -Filter "*.motion")
$missingTemplates = @()
$missingPreviews = @()
$invalidPreviews = @()
$ratioMismatches = @()
$hashMismatches = @()
$previewIndexMismatches = @()
$probeFailures = @()
$warnings = @()
$probeStatus = "not-run"
$motionHashCheckedCount = 0

$indexLocalNos = @{}
foreach ($item in $index) {
    if ($indexLocalNos.ContainsKey($item.LocalNo)) {
        $previewIndexMismatches += [pscustomobject]@{
            localNo = $item.LocalNo
            field = "template-index"
            expected = "one unique row"
            actual = "duplicate rows"
        }
    }
    else {
        $indexLocalNos[$item.LocalNo] = $true
    }
}

if ($previewIndex.Count -ne $index.Count) {
    $previewIndexMismatches += [pscustomobject]@{
        localNo = $null
        field = "row-count"
        expected = $index.Count
        actual = $previewIndex.Count
    }
}

$ffprobe = Get-Command ffprobe -ErrorAction SilentlyContinue
if ($SkipMediaProbe) {
    $probeStatus = "skipped"
    $warnings += "ffprobe media probing was skipped by request."
}
elseif (-not $ffprobe) {
    $probeStatus = "unavailable"
    $warnings += "ffprobe is unavailable; preview structure and file size were checked, but not media streams."
}
else {
    $probeStatus = "ok"
}

foreach ($item in $index) {
    $localNo = $item.LocalNo
    $motion = $motionFiles |
        Where-Object { $_.Name -eq "$localNo.motion" -or $_.Name.StartsWith("$localNo`_", [System.StringComparison]::OrdinalIgnoreCase) } |
        Select-Object -First 1

    if (-not $motion) {
        $missingTemplates += $localNo
    }
    else {
        try {
            $actualHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $motion.FullName).Hash
            $motionHashCheckedCount++
            $expectedHash = ([string]$item.SHA256).Trim()
            if (
                -not $expectedHash -or
                -not $actualHash.Equals($expectedHash, [System.StringComparison]::OrdinalIgnoreCase)
            ) {
                $hashMismatches += [pscustomobject]@{
                    localNo = $localNo
                    expected = $expectedHash
                    actual = $actualHash
                    file = $motion.FullName
                }
            }
        }
        catch {
            $hashMismatches += [pscustomobject]@{
                localNo = $localNo
                expected = ([string]$item.SHA256).Trim()
                actual = $null
                file = $motion.FullName
                error = $_.Exception.Message
            }
        }
    }

    $previewRows = @($previewIndex | Where-Object { $_.LocalNo -eq $localNo })
    $previewRow = $previewRows | Select-Object -First 1
    if ($previewRows.Count -ne 1) {
        $previewIndexMismatches += [pscustomobject]@{
            localNo = $localNo
            field = "rows"
            expected = 1
            actual = $previewRows.Count
        }
    }
    if ($previewRow) {
        $fieldChecks = @(
            @{ Field = "Title"; Expected = $item.Title },
            @{ Field = "Version"; Expected = $item.Version },
            @{ Field = "Ratio"; Expected = $item.Ratio },
            @{ Field = "OfficialTemplateId"; Expected = $item.OfficialTemplateId }
        )
        foreach ($fieldCheck in $fieldChecks) {
            $actualValue = [string]$previewRow.($fieldCheck.Field)
            $expectedValue = [string]$fieldCheck.Expected
            if ($actualValue -ne $expectedValue) {
                $previewIndexMismatches += [pscustomobject]@{
                    localNo = $localNo
                    field = $fieldCheck.Field
                    expected = $expectedValue
                    actual = $actualValue
                }
            }
        }
    }

    $relativePreview = if ($previewRow -and $previewRow.LocalPreview) {
        $previewRow.LocalPreview
    }
    else {
        "previews/$localNo.mp4"
    }
    $previewPath = [System.IO.Path]::GetFullPath((Join-Path $root $relativePreview))
    $rootPrefix = $root.TrimEnd([System.IO.Path]::DirectorySeparatorChar) +
        [System.IO.Path]::DirectorySeparatorChar
    if (
        -not $previewPath.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase) -and
        -not $previewPath.Equals($root, [System.StringComparison]::OrdinalIgnoreCase)
    ) {
        $previewIndexMismatches += [pscustomobject]@{
            localNo = $localNo
            field = "LocalPreview"
            expected = "path inside library root"
            actual = $relativePreview
        }
        $missingPreviews += $localNo
        continue
    }
    if (-not $relativePreview.StartsWith("previews/", [System.StringComparison]::OrdinalIgnoreCase)) {
        $previewIndexMismatches += [pscustomobject]@{
            localNo = $localNo
            field = "LocalPreview"
            expected = "previews/MT-xxx.mp4"
            actual = $relativePreview
        }
    }

    if (-not (Test-Path -LiteralPath $previewPath)) {
        $missingPreviews += $localNo
        continue
    }

    $preview = Get-Item -LiteralPath $previewPath
    if ($preview.Length -lt 100KB) {
        $invalidPreviews += $localNo
        continue
    }

    if ($probeStatus -eq "ok") {
        $probe = Invoke-FfprobeProbe -Executable $ffprobe.Source -Path $previewPath
        if ($probe.startError) {
            $probeStatus = "blocked"
            $probeFailures += [pscustomobject]@{
                localNo = $localNo
                error = $probe.startError
            }
            $warnings += "ffprobe execution was blocked; preview files were not marked corrupt. Rerun with permission to start ffprobe."
            continue
        }
        $probeOutput = ($probe.stdout + "`n" + $probe.stderr).Trim()
        if ($probe.exitCode -ne 0 -or -not $probe.stdout.Trim()) {
            if ($probeOutput -match "(?i)access.*denied|eperm|permission denied|拒绝访问|failed to run") {
                $probeStatus = "blocked"
                $probeFailures += [pscustomobject]@{
                    localNo = $localNo
                    error = $probeOutput
                }
                $warnings += "ffprobe execution was blocked; preview files were not marked corrupt. Rerun with permission to start ffprobe."
                continue
            }
            $invalidPreviews += $localNo
            continue
        }

        try {
            $media = $probe.stdout | ConvertFrom-Json
            $width = [int]$media.streams[0].width
            $height = [int]$media.streams[0].height
            $actualRatio = if ($width -gt $height) {
                "16:9"
            }
            elseif ($width -lt $height) {
                "9:16"
            }
            else {
                "1:1"
            }

            if ($actualRatio -ne $item.Ratio) {
                $ratioMismatches += [pscustomobject]@{
                    localNo = $localNo
                    expected = $item.Ratio
                    actual = $actualRatio
                    width = $width
                    height = $height
                }
            }
        }
        catch {
            $invalidPreviews += $localNo
        }
    }
}

$previewFiles = @(Get-ChildItem -LiteralPath (Join-Path $root "previews") -File -Filter "*.mp4")
$structuralOk = (
    $index.Count -eq 57 -and
    $missingTemplates.Count -eq 0 -and
    $missingPreviews.Count -eq 0 -and
    $invalidPreviews.Count -eq 0 -and
    $ratioMismatches.Count -eq 0 -and
    $hashMismatches.Count -eq 0 -and
    $previewIndexMismatches.Count -eq 0
)
$probeAllowsSuccess = $probeStatus -in @("ok", "skipped")
$ok = $structuralOk -and $probeAllowsSuccess

$report = [pscustomobject]@{
    ok = $ok
    structuralOk = $structuralOk
    libraryRoot = $root
    templateCount = $index.Count
    motionFileCount = $motionFiles.Count
    motionHashCheckedCount = $motionHashCheckedCount
    previewCount = $previewFiles.Count
    previewIndexCount = $previewIndex.Count
    missingLibraryPaths = @()
    missingTemplates = $missingTemplates
    missingPreviews = $missingPreviews
    invalidPreviews = $invalidPreviews
    ratioMismatches = $ratioMismatches
    hashMismatches = $hashMismatches
    previewIndexMismatches = $previewIndexMismatches
    probeStatus = $probeStatus
    probeFailures = $probeFailures
    warnings = $warnings
}

$report | ConvertTo-Json -Depth 6
if (-not $ok) {
    exit 1
}
