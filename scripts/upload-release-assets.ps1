param (
    [string]$Tag = "v1.0.0-assets",
    [string]$Title = "Study Space Assets v1.0.0",
    [string]$Repo = "TienxDun/HUFLIT_GPA_Strategist"
)

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  HUFLIT StudySpace - GitHub Release Asset Uploader     " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Resolve-Path "$scriptDir\..\UI_enhanced\public"
$studyPath = Join-Path $rootPath "study"
$thumbPath = Join-Path $rootPath "thumbnails"

$filesToUpload = @()

if (Test-Path $studyPath) {
    $filesToUpload += Get-ChildItem -Path $studyPath -Recurse -File
}

if (Test-Path $thumbPath) {
    $filesToUpload += Get-ChildItem -Path $thumbPath -Recurse -File
}

Write-Host "[*] Total asset files found: $($filesToUpload.Count)" -ForegroundColor Yellow

if ($filesToUpload.Count -eq 0) {
    Write-Error "No files found in $studyPath or $thumbPath"
    exit 1
}

$ghExe = "gh"
$hasGh = Get-Command "gh" -ErrorAction SilentlyContinue
if (-not $hasGh) {
    $defaultGhPath = "C:\Program Files\GitHub CLI\gh.exe"
    if (Test-Path $defaultGhPath) {
        $ghExe = $defaultGhPath
    }
}

Write-Host "[*] Checking release $Tag on $Repo..." -ForegroundColor Cyan

$releaseCheck = & $ghExe release view $Tag --repo $Repo 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[+] Creating new release: $Tag..." -ForegroundColor Green
    & $ghExe release create $Tag --repo $Repo --title $Title --notes "Media assets for HUFLIT StudySpace"
} else {
    Write-Host "[i] Release $Tag already exists, proceeding to upload..." -ForegroundColor Green
}

$current = 0
$total = $filesToUpload.Count
foreach ($file in $filesToUpload) {
    $current++
    $sizeMB = [math]::Round($file.Length / 1048576, 2)
    $name = $file.Name
    Write-Host "[$current/$total] Uploading: $name ($sizeMB MB)..." -ForegroundColor Gray
    & $ghExe release upload $Tag $file.FullName --repo $Repo --clobber
}

Write-Host "`n[SUCCESS] Successfully uploaded all $total assets to Release $Tag!" -ForegroundColor Green
Write-Host "CDN URL Format: https://github.com/$Repo/releases/download/$Tag/<filename>" -ForegroundColor Cyan
