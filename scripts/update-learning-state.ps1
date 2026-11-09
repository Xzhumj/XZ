[CmdletBinding()]
param(
    [string]$LibraryRoot,
    [switch]$MarkProposalGenerated
)

$ErrorActionPreference = "Stop"
$scriptRoot = Split-Path -Parent $PSScriptRoot

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
if (-not (Test-Path -LiteralPath (Join-Path $root "template-number-index.csv"))) {
    throw "Invalid template library: $root"
}

$outputRoot = Join-Path $root "输出"
$statePath = Join-Path $root "学习状态.json"
$threshold = 5

$state = $null
if (Test-Path -LiteralPath $statePath) {
    try {
        $state = Get-Content -Raw -Encoding UTF8 -LiteralPath $statePath | ConvertFrom-Json
    }
    catch {
        $state = $null
    }
}

$lastProposalReviewCount = if ($state -and $null -ne $state.lastProposalReviewCount) {
    [int]$state.lastProposalReviewCount
}
else {
    0
}

$reviews = @(
    if (Test-Path -LiteralPath $outputRoot) {
        Get-ChildItem -LiteralPath $outputRoot -Recurse -File -Filter "复盘.md" -ErrorAction SilentlyContinue |
            Sort-Object LastWriteTime, FullName
    }
)

$reviewCount = $reviews.Count
$lastReview = if ($reviewCount -gt 0) { $reviews[-1] } else { $null }
$newReviews = [Math]::Max(0, $reviewCount - $lastProposalReviewCount)
$needsUpgradeProposal = $false

if ($MarkProposalGenerated) {
    $lastProposalReviewCount = $reviewCount
    $newReviews = 0
}
else {
    $needsUpgradeProposal = ($reviewCount -ge $threshold -and $newReviews -ge $threshold)
}

$nextProposalAt = $lastProposalReviewCount + $threshold
$now = (Get-Date).ToString("s")

$updated = [pscustomobject]@{
    schemaVersion = 1
    reviewCount = $reviewCount
    newReviewsSinceProposal = $newReviews
    lastProposalReviewCount = $lastProposalReviewCount
    nextProposalAtReviewCount = $nextProposalAt
    needsUpgradeProposal = $needsUpgradeProposal
    lastReview = if ($lastReview) {
        $lastReview.FullName.Substring($root.Length).TrimStart('\')
    }
    else {
        $null
    }
    lastReviewAt = if ($lastReview) {
        $lastReview.LastWriteTime.ToString("s")
    }
    else {
        $null
    }
    lastProposalGeneratedAt = if ($MarkProposalGenerated) {
        $now
    }
    elseif ($state -and $state.lastProposalGeneratedAt) {
        $state.lastProposalGeneratedAt
    }
    else {
        $null
    }
    updatedAt = $now
}

$updated | ConvertTo-Json -Depth 4 | Set-Content -Encoding utf8 -LiteralPath $statePath
$updated | ConvertTo-Json -Depth 4
