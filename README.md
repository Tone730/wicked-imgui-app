# Wicked ImGui Maker

A standalone, locally rebuilt ImGui interface builder. The working tree contains the application source, the unpacked Electron runtime, and local scripts used to rebuild the packaged app.

## Related repositories

- Live dashboard / download page: https://tone730.github.io/wicked-imgui-site/
- Dashboard source: https://github.com/Tone730/wicked-imgui-site
- Release artifacts and update feeds: https://github.com/Tone730/wicked-imgui-releases
- This rebuilt app source: https://github.com/Tone730/wicked-imgui-app

## What is in this folder

- `app/` — application source packed into `resources/app.asar`.
- `runtime/` — extracted Electron runtime from the original installer (reference/staging source).
- `dist/` — assembled, rebranded runnable application.
- `build_asar.py` — deterministic ASAR repacker with Electron-compatible SHA-256 integrity metadata.
- `patch_integrity.py` — refreshes the embedded Windows `ElectronAsar` integrity resource after each repack.
- `validate.py` — static checks for syntax, rebranding, feature presence, and ASAR integrity agreement.
- `deobfuscate.js` — one-time decoder that restored readable string literals from the original JavaScript obfuscation.
- `rebrand.py` — product rebrand pass with compatibility preservation for shipped runtime identifiers.
- `assets-new/` — locally generated replacement logo assets.
- `make_logo.ps1` — regenerates the replacement logo assets.
- `sign.ps1` — optional Authenticode signing; an explicit no-op when no certificate is configured.
- `SIGNING.md` — current unsigned state, certificate options and the post-signing release checklist.

## Highlights

- Product identity, protocol (`wicked:`), preload bridge (`window.wicked`), IPC/storage keys, project filenames, window/HTML titles, updater names, and generated-code comments rebranded.
- Local full-access profile: the app starts signed in as Wicked Local Pro with every renderer and main-process feature gate unlocked. No login or license key is required. `app/src/main/account.cjs` is a clean offline provider: sign-in, redeem, refresh, logout, and usage all resolve locally and make zero network calls. Usage minutes are tracked in a local `local-usage.json` file. The updater reports an explicit `offline` state instead of pretending a check succeeded.
- Built-in **Wicked Local (offline)** AI provider: ready on first launch with no API key or network. It can add, edit, and delete widgets; add and rename pages; apply themes and effects; and add toast actions. External providers remain optional.
- Ten additional design-time widgets: badge, stat, rating, stepper, breadcrumb, chip, timeline, avatar, progressring, and toggle, with property controls, style presets, preview renderers, and generated-code mappings to existing runtime calls only.
- Seven additional global themes: Wicked Violet, Cyber Soda, Paper, Neon Noir, Arctic Glass, Sunset Ember, and Deep Ocean plus the original palette. Additional toast presets (Outline, Rainbow, Compact, Celebrate), per-widget style presets, and background effects (Rings, Confetti, Hearts, Comet).
- Four additional project templates: Setup Wizard, Loader Splash, Settings, and Branded Loader plus the originals. All generated markers are preserved.
- Expanded workflow limits, autosave choices, command-palette actions (with arrow-key/Enter navigation), grid/snap/alignment/distribute tools, duplicate page, Project Doctor (`Ctrl+Shift+D`) with duplicate-ID/bounds/reachability/marker checks, settings import/export, shortcut editor, asset cleanup, custom blocks, and workspace maintenance tools.
- Export fixes: generated C++ asset registration now emits `KavroRegisterAssets`, `kavro_impl.cpp` defines `KAVRO_IMPLEMENTATION`, and Rust generated code imports the `Wicked` compatibility alias. The offline C++ stub also provides `kv::AddAsset`.
- Offline runtime source stubs under `app/src/runtimes/` let Export Source and runtime-file views work without the encrypted `runtimes.pak` license key.
- Generated project comments and integration notes use Wicked wording; load-bearing generated markers (`// @page`, `// @endpage`, `// @widget`, `// @endwidget`) and legacy identifiers (`kavro.h`, `KAVRO_IMPLEMENTATION`, `KavroConfigure`, `crate::kavro`, `KVRT1`, `kavro-runtime:`, etc.) are retained only for generated-code compatibility, not as branding.

## Build

From `C:\Users\Wick\WickedImguiMaker`:

```powershell
# 1. Assemble dist from the extracted runtime (if not already present)
Copy-Item runtime dist -Recurse -Force
# Rename the original executables to the Wicked names if build.ps1 has not done it yet.

# 2. Repack the edited application source and refresh the embedded ASAR hash
python build_asar.py app dist/resources/app.asar dist/resources/app.asar.unpacked
python patch_integrity.py dist/resources/app.asar "dist\Wicked ImGui Maker.exe"

# 3. Validate and run the rebranded app
python validate.py
& ".\dist\Wicked ImGui Maker.exe"
```

No third-party installer is required or performed; `dist\` is self-contained.

## Verification

The final build was repacked and checked with:

```powershell
# Offline build (no feed baked in):
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\build.ps1

# Build with a self-hosted generic feed URL baked into app\update-feed.json:
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\build.ps1 `
  -UpdateFeedUrl "https://your-host/downloads/latest.json"
```

Expected result: a packed ASAR, an updated `ElectronAsar` integrity hash in `Wicked ImGui Maker.exe`, `validation passed`, and `Build complete`.

`validate.py` checks every app JavaScript/CJS file with `node --check`, verifies the local Pro account and unlocked plan, confirms the offline runtime stubs and local AI provider are present, checks all new widgets/themes/effects/templates/presets, and confirms the embedded ASAR hash agrees with `dist\resources\app.asar`.

A 10-second smoke test of `dist\Wicked ImGui Maker.exe` leaves the app running with no stderr output and no fatal stdout errors.

The matching website remake is at `C:\Users\Wick\wicked-imgui`. Its Downloads page serves the portable ZIP generated from `dist\` by `tools\package-app.ps1`, including size, SHA-256, and the release “What’s new” list.

Run `node test-updater.js` to exercise the feed reader against the generated `downloads/latest.json` and attached ZIP. It checks version comparison, available/latest/offline states, checksum-verified download, and the manual-install fallback.

## Auto updates

`app\src\main\updater.cjs` reads the free generic feed generated by the website:

- `downloads\latest.json` — version, file name, download URL, byte size, SHA-256, SHA-512, channel and notes.
- `downloads\latest.yml` — standard generic-provider manifest for future signed installer builds.

The feed URL is baked into `app\update-feed.json` by `build.ps1 -UpdateFeedUrl <url>`, or can be overridden at runtime with `WICKED_UPDATE_URL`. Publishing the same folder from GitHub Releases, Cloudflare R2 or any static host is enough; there is no paid update service.

Because the distributed build is a portable ZIP, the updater verifies the download with the published checksum and opens the download folder. Extract the ZIP and run `Wicked ImGui Maker.exe` to finish the update. No silent/background replacement is claimed. A future signed installer artifact with an Ed25519 signature can use the existing Wicked Update launcher for one-click install.

If the feed is not configured — or a localhost feed is unreachable — the app reports an honest offline state and continues to work fully offline.

## Signing

The shipped portable build is **unsigned** and hash-verified. `sign.ps1` will sign and timestamp a Windows binary when `SIGNING_CERT_THUMBPRINT` or `SIGNING_CERT_FILE` is configured; with no certificate it says so plainly and exits without claiming success. See [SIGNING.md](SIGNING.md) before packaging a signed release — the ZIP and both update manifests must be regenerated afterwards.

## Compatibility notes

- The shipped `runtimes.pak` is encrypted and contains the native ImGui runtime templates. For that reason, legacy generated-code identifiers such as `kavro.h`, `KAVRO_IMPLEMENTATION`, `KavroConfigure`, `Kavro.cs`, `kavro.rs`, and `crate::kavro` are intentionally preserved. They are contracts, not branding. New design-time widgets generate calls to existing runtime widgets so exported projects remain buildable.
- The legacy `.kavro` project filename and old config folder are still read for backward compatibility. They are not shown as branding in the product UI.
- Account/licensing is local-only; sign-in, redeem and usage statistics make no network calls. Update checks use only the self-hosted feed URL baked into `app\update-feed.json` (or `WICKED_UPDATE_URL` at runtime). With no published URL, Settings → About reports “Update feed not configured — this portable build works fully offline.”
- AI works offline out of the box through Wicked Local. Ollama on `http://localhost:11434` also works offline with a local model; Google Gemini, AiHubMix, OpenRouter, NVIDIA, Anthropic, and OpenAI are optional and need their own keys/network.
- The bundled runtime sources are offline compatibility stubs: export produces a complete source tree that compiles and runs with local toolchains (C++ DX11/DX9/DX12/OpenGL3/Vulkan, C#, Rust), but real ImGui rendering needs the full vendor runtime. Settings → Build & run displays this disclosure in-product.
- Packaged PE version resources are rewritten from `app/package.json`; Windows file and product version metadata now match the released version (currently 2.2.1).

## Local QA

```
npm test                 # every gate, fully offline (npm.cmd test on Windows PowerShell)
node regression.mjs      # functional suite + all 118 kit-board baselines
node visual-regression.mjs --update   # regenerate PNG baselines after an intentional palette/label change
```

`node regression.mjs` folds in the visual-regression baselines, so a palette or label
drift fails the main gate even when only the functional suite is run. `npm test`
(calling `qa.mjs`) adds static validation, updater tests, server API tests and
generated-export compile checks. Baseline changes must be deliberate: update them
with `--update`, then re-run `npm test` before publishing.

## One-command publish

```
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ..\wicked-imgui\tools\publish.ps1
```

The single local command rebuilds `dist`, smoke-tests the executable, syntax-checks every
app and dashboard JS file, packages and attaches the portable ZIP, verifies all hashes in
`js/release.js` / `latest.json` / `latest.yml`, and appends `downloads/build-history.jsonl`.
No network, installer, or VCS. Options: `-Bump patch|minor|major`, `-Version x.y.z`,
`-Notes "..."`, `-SkipSmoke`, `-Watch`. Release notes come from `CHANGELOG.md`.
