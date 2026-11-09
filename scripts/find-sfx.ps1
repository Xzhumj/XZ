[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Query,
    [string]$Category,
    [ValidateRange(1, 50)]
    [int]$Limit = 10,
    [string]$LibraryRoot,
    [switch]$IncludeDuplicates
)

$ErrorActionPreference = "Stop"

function Resolve-SfxLibrary {
    param([string]$ExplicitRoot)

    if ($ExplicitRoot) {
        $resolved = [System.IO.Path]::GetFullPath($ExplicitRoot)
        if (Test-Path -LiteralPath (Join-Path $resolved "_meta\sound-index.csv")) {
            return $resolved
        }
        throw "Invalid SFX library: $resolved"
    }

    if ($env:MOTION_SFX_LIBRARY_ROOT) {
        $resolved = [System.IO.Path]::GetFullPath($env:MOTION_SFX_LIBRARY_ROOT)
        if (Test-Path -LiteralPath (Join-Path $resolved "_meta\sound-index.csv")) {
            return $resolved
        }
    }

    $cli = Join-Path $PSScriptRoot "cli.mjs"
    $raw = & node $cli paths --json 2>$null
    if ($LASTEXITCODE -eq 0 -and $raw) {
        $paths = ($raw -join "`n") | ConvertFrom-Json
        if ($paths.toolkitRoot) {
            $resolved = Join-Path $paths.toolkitRoot "sfx"
            if (Test-Path -LiteralPath (Join-Path $resolved "_meta\sound-index.csv")) {
                return $resolved
            }
        }
    }

    throw "Curated SFX library not found. Set MOTION_SFX_LIBRARY_ROOT or configure Video Template Kit."
}

$root = Resolve-SfxLibrary -ExplicitRoot $LibraryRoot
$indexPath = Join-Path $root "_meta\sound-index.csv"
$items = @(Import-Csv -Encoding UTF8 -LiteralPath $indexPath)
$terms = @(
    $Query -split "\s+" |
        Where-Object { $_.Trim() } |
        ForEach-Object { $_.Trim().ToLowerInvariant() }
)

$seenHashes = @{}
$candidates = @(
    foreach ($item in $items) {
        if (-not $IncludeDuplicates) {
            if ($item.DuplicateOf) {
                continue
            }
            if ($item.SHA256) {
                if ($seenHashes.ContainsKey($item.SHA256)) {
                    continue
                }
                $seenHashes[$item.SHA256] = $true
            }
        }
        $item
    }
)

$ranked = foreach ($item in $candidates) {
    if ($Category -and $item.Category -ne $Category) {
        continue
    }

    $score = 0
    foreach ($term in $terms) {
        if ($item.Category.Equals($term, [System.StringComparison]::OrdinalIgnoreCase)) {
            $score += 20
        }
        if ($item.Usage.IndexOf($term, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) {
            $score += 6
        }
        if ($item.Description.IndexOf($term, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) {
            $score += 4
        }
        if ($item.FileName.IndexOf($term, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) {
            $score += 3
        }
        if ($item.SourceName.IndexOf($term, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) {
            $score += 2
        }
    }

    if ($score -gt 0) {
        [pscustomobject]@{
            id = $item.Id
            score = $score
            file = $item.RelativePath
            path = Join-Path $root $item.RelativePath
            category = $item.Category
            usage = $item.Usage
            durationSeconds = $item.DurationSeconds
            source = $item.Source
            sourcePage = $item.SourcePage
            license = $item.License
            sha256 = $item.SHA256
        }
    }
}

$results = @(
    $ranked |
        Sort-Object @{ Expression = "score"; Descending = $true }, category, file |
        Select-Object -First $Limit
)

[pscustomobject]@{
    query = $Query
    category = $Category
    includeDuplicates = [bool]$IncludeDuplicates
    libraryRoot = $root
    count = $results.Count
    results = $results
} | ConvertTo-Json -Depth 5
