param([string] $UpdateFeedUrl = $env:WICKED_UPDATE_URL)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$dist = Join-Path $root 'dist'
$runtime = Join-Path $root 'runtime'

if (-not (Test-Path $runtime)) { throw "Missing runtime staging folder: $runtime" }

$feedConfig = Join-Path $root 'app\update-feed.json'
$feedValue = if ($UpdateFeedUrl) { $UpdateFeedUrl } else { '' }
$feedJson = '{"feedUrl":' + (ConvertTo-Json $feedValue -Compress) + '}'
[IO.File]::WriteAllText($feedConfig, $feedJson, [Text.UTF8Encoding]::new($false))
Write-Host "Update feed: $(if ($feedValue) { $feedValue } else { 'not configured (offline)' })"

if (-not (Test-Path $dist)) {
  Copy-Item $runtime $dist -Recurse -Force
}

$mainExe = Join-Path $dist 'Kavro.exe'
$brandedExe = Join-Path $dist 'Wicked ImGui Maker.exe'
if ((Test-Path $mainExe) -and -not (Test-Path $brandedExe)) {
  Rename-Item $mainExe 'Wicked ImGui Maker.exe'
}

$oldUpdater = Join-Path $dist 'resources\updater\KavroUpdate.exe'
$newUpdater = Join-Path $dist 'resources\updater\WickedUpdate.exe'
if ((Test-Path $oldUpdater) -and -not (Test-Path $newUpdater)) {
  Rename-Item $oldUpdater 'WickedUpdate.exe'
}

python (Join-Path $root 'build_asar.py') `
  (Join-Path $root 'app') `
  (Join-Path $dist 'resources\app.asar') `
  (Join-Path $dist 'resources\app.asar.unpacked')

if ($LASTEXITCODE -ne 0) { throw "ASAR build failed with exit code $LASTEXITCODE" }

python (Join-Path $root 'patch_integrity.py') `
  (Join-Path $dist 'resources\app.asar') `
  $brandedExe
if ($LASTEXITCODE -ne 0) { throw "Integrity patch failed with exit code $LASTEXITCODE" }

python (Join-Path $root 'patch_pe_version.py')
if ($LASTEXITCODE -ne 0) { throw "PE version rebrand failed with exit code $LASTEXITCODE" }

python (Join-Path $root 'validate.py')
if ($LASTEXITCODE -ne 0) { throw "Validation failed" }
Write-Host "Build complete: $brandedExe"
