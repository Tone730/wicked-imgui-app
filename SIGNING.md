# Code signing — current state and how to finish it

## Current state (honest)

- The published `v2.2.1` build is a **portable ZIP**, not a signed installer.
- It is published with a SHA-256 and SHA-512 in `latest.json` / `latest.yml`, and the updater verifies those hashes before opening the download folder.
- There is **no Authenticode certificate configured**. Windows SmartScreen and some antivirus products may warn. The app does not claim a silent install.
- ASAR integrity and Electron fuses are enabled in the shipped EXE. These verify internal app files, not publisher identity.

## What signing would change

An Authenticode-signed `.exe` gives Windows a publisher identity, reduces SmartScreen warnings and unlocks a future one-click/silent update path through the existing Wicked Update launcher. It does **not** change the portable ZIP's checksum-based workflow by itself — after signing you must repackage and regenerate the feeds.

## Certificate options

| Route | Cost | Fit |
|---|---|---|
| SignPath Foundation | Free for qualifying open-source projects | Requires an OSI license with no commercial dual-licensing, public maintained repo, released binary, MFA and a published code-signing policy. The paid Pro tier makes eligibility unlikely while the code is proprietary. |
| OV Authenticode | Roughly $250–$700/year | DigiCert, Sectigo or GlobalSign. Standard for an individual developer selling software. |
| EV Authenticode | Usually more | Faster SmartScreen reputation, hardware token, more paperwork. |

There is no legitimate free Authenticode certificate for closed-source commercial software. Do not use leaked, borrowed or "trial" certificates.

## Using the included script

Install the Windows SDK, then sign the EXE **before** packaging the ZIP:

```powershell
cd C:\Users\Wick\WickedImguiMaker
# Certificate from the Windows certificate store:
$env:SIGNING_CERT_THUMBPRINT = 'YOUR_THUMBPRINT_HEX'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\sign.ps1 -Exe ".\dist\Wicked ImGui Maker.exe"

# Or a PFX file:
$env:SIGNING_CERT_FILE = 'C:\secure\wicked.pfx'
$env:SIGNING_CERT_PASSWORD = '<from your password manager / CI secret store>'
```

`sign.ps1` hashes with SHA-256, adds an RFC3161 timestamp, and verifies with `signtool verify /pa`. With **no** certificate configured it exits successfully but explicitly says the build is unsigned — it never prints a false success.

## Release checklist after signing

1. Re-run `python validate.py` and `python patch_integrity.py` if the EXE was rebuilt (signing itself only appends the certificate table).
2. Repackage with `tools\package-app.ps1` (or the dashboard's `tools\set-update-host.ps1`) so the ZIP contains the signed EXE and updater.
3. Regenerate `latest.json`, `latest.yml`, `js/release.js` and `js/checkout-links.js` as needed; old hashes no longer match.
4. Re-upload all three release assets with `gh release upload --clobber`.
5. Verify the remote digests and that `signtool verify /pa` still passes on the downloaded EXE.
6. Update the "code signing" wording in `faq.html` and `README.md` only after the signed build is actually public.

## Code signing policy page

SignPath and many certificate authorities expect a public policy. A draft is at `../wicked-imgui/code-signing-policy.html`. It describes who can sign, where keys live, and how to report a suspected bad build. Have it reviewed together with the legal checklist before publishing it as a commitment.
