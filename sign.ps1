# Authenticode signing for Wicked Imgui binaries.
# No certificate configured = explicit no-op, never a fake "signed" claim.
param(
  [Parameter(Mandatory = $true)][string]$Exe,
  [string]$Thumbprint = $env:SIGNING_CERT_THUMBPRINT,
  [string]$Pfx = $env:SIGNING_CERT_FILE,
  [string]$Password = $env:SIGNING_CERT_PASSWORD,
  [string]$TimestampUrl = 'http://timestamp.digicert.com',
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath $Exe)) { throw "File not found: $Exe" }

function Find-Signtool {
  $roots = @("${env:ProgramFiles(x86)}\Windows Kits\10\bin", "$env:ProgramFiles\Windows Kits\10\bin")
  foreach ($root in $roots) {
    if (-not (Test-Path -LiteralPath $root)) { continue }
    $tool = Get-ChildItem -LiteralPath $root -Recurse -Filter signtool.exe -ErrorAction SilentlyContinue |
      Where-Object { $_.FullName -match '\\x64\\' } | Select-Object -First 1
    if ($tool) { return $tool.FullName }
  }
  return $null
}

$tool = Find-Signtool
if ($DryRun) {
  Write-Host "DRY RUN — no signing performed."
  Write-Host "Target: $Exe"
  $certLabel = if ($Thumbprint) { "thumbprint $Thumbprint" } elseif ($Pfx) { "PFX $Pfx" } else { "NONE (would skip)" }
  Write-Host "Certificate: $certLabel"
  Write-Host "Timestamp: $TimestampUrl"
  if (-not $tool) { Write-Host "signtool.exe: not found on this machine" } else { Write-Host "signtool.exe: $tool" }
  exit 0
}

if (-not $Thumbprint -and -not $Pfx) {
  Write-Warning "No SIGNING_CERT_THUMBPRINT / SIGNING_CERT_FILE configured. Leaving this build UNSIGNED."
  Write-Host "The portable ZIP stays hash-verified; Windows SmartScreen/AV warnings are expected."
  exit 0
}
if (-not $tool) { throw "signtool.exe not found. Install the Windows SDK (or pass a signed build from your CI)." }

$signArgs = @('sign', '/fd', 'SHA256', '/tr', $TimestampUrl, '/td', 'SHA256')
if ($Thumbprint) {
  $signArgs += @('/sha1', $Thumbprint)
} else {
  $signArgs += @('/f', $Pfx)
  if ($Password) { $signArgs += @('/p', $Password) }
}
$signArgs += $Exe

& $tool @signArgs
if ($LASTEXITCODE -ne 0) { throw "signtool sign failed with exit code $LASTEXITCODE" }
& $tool verify /pa $Exe
if ($LASTEXITCODE -ne 0) { throw "signtool verify failed with exit code $LASTEXITCODE" }
Write-Host "Signed and verified: $Exe"
