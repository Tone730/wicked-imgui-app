"""Static validation for the rebranded Wicked ImGui Maker build."""

from __future__ import annotations

import hashlib
import json
import pathlib
import re
import struct
import subprocess
import sys

ROOT = pathlib.Path(r"C:\Users\Wick\WickedImguiMaker")
APP = ROOT / "app"
DIST = ROOT / "dist"

errors: list[str] = []
warnings: list[str] = []

js_files = [
    p
    for p in APP.rglob("*")
    if p.is_file()
    and p.suffix in {".js", ".cjs"}
    and "vendor" not in p.parts
    and "node_modules" not in p.parts
]
for p in js_files:
    result = subprocess.run(["node", "--check", str(p)], capture_output=True, text=True)
    if result.returncode:
        errors.append(
            f"syntax: {p.relative_to(APP)}: "
            f"{result.stderr.splitlines()[0] if result.stderr else 'unknown'}"
        )

all_text = "\n".join(
    p.read_text(encoding="utf-8", errors="replace")
    for p in APP.rglob("*")
    if p.is_file()
    and p.suffix in {".js", ".cjs", ".html", ".css", ".json"}
    and "vendor" not in p.parts
)
if "__WIM_" in all_text:
    errors.append("leftover __WIM_ placeholders")
if "window.kavro" in all_text or "window['kavro']" in all_text:
    errors.append("old preload bridge reference remains")
if "kavro://" in all_text or "'kavro:'" in all_text or '"kavro:"' in all_text:
    errors.append("old protocol reference remains")

model = (APP / "src" / "shared" / "model.js").read_text(encoding="utf-8")
for widget in [
    "badge", "stat", "rating", "stepper", "breadcrumb", "chip", "timeline",
    "avatar", "progressring", "toggle",
    "iconbutton", "divider", "statcard", "taginput", "password", "searchbox",
    "sparkline", "statusbar",
]:
    if f"'{widget}':" not in model and f'"{widget}":' not in model:
        errors.append(f"model.js missing widget: {widget}")
for preset in [
    "wicked-violet", "cyber-soda", "paper", "neon-noir", "arctic-glass",
    "sunset-ember", "deep-ocean",
    "midnight-gold", "retro-terminal", "dracula", "nord", "gruvbox",
    "catppuccin", "tokyo-night", "rose-pine",
]:
    if f"'{preset}':" not in model and f'"{preset}":' not in model:
        errors.append(f"model.js missing theme preset: {preset}")
for effect in [
    "rings", "confetti", "hearts", "comet",
    "plasma", "fireworks", "sakura", "lightning",
]:
    if f"'{effect}'" not in model and f'"{effect}"' not in model:
        errors.append(f"model.js missing effect: {effect}")

styles = (APP / "src" / "shared" / "stylePresets.js").read_text(encoding="utf-8")
for widget in [
    "badge", "stat", "rating", "stepper", "breadcrumb", "chip", "timeline",
    "avatar", "progressring", "toggle", "shape", "table", "plot",
    "iconbutton", "divider", "statcard", "taginput", "password", "searchbox",
    "sparkline", "statusbar",
]:
    if f"'{widget}':" not in styles and f'"{widget}":' not in styles:
        errors.append(f"stylePresets.js missing widget: {widget}")
for label in [
    "Pulse", "Hollow", "Zebra", "Glassy", "Smooth", "Columns", "Vivid",
    "Track", "Nodes", "Rainbow", "Circle", "Square", "Thin", "Glow",
    "Slim", "Neon", "Compact", "Celebrate",
    "Symbol", "Stacked", "Mono", "Caps", "Success", "Warning", "Danger",
    "Info", "Bounce", "Airy", "Sharp",
]:
    if label not in styles:
        errors.append(f"stylePresets.js missing preset label: {label}")
for toast_preset in [
    "outline", "rainbow", "compact", "celebrate",
    "success", "warning", "danger", "info",
]:
    if f"'id':'{toast_preset}'" not in styles and f'"id":"{toast_preset}"' not in styles:
        errors.append(f"stylePresets.js missing toast preset: {toast_preset}")

common = (APP / "src" / "shared" / "codegen" / "common.js").read_text(encoding="utf-8")
for widget in [
    "badge", "stat", "rating", "stepper", "breadcrumb", "chip", "timeline",
    "avatar", "progressring", "toggle",
    "iconbutton", "divider", "statcard", "taginput", "password", "searchbox",
    "sparkline", "statusbar",
]:
    if widget not in common:
        errors.append(f"codegen common.js missing mapping for {widget}")

runtime = (APP / "src" / "renderer" / "js" / "preview" / "runtime.js").read_text(
    encoding="utf-8"
)
for widget in [
    "badge", "stat", "rating", "stepper", "breadcrumb", "chip", "timeline",
    "avatar", "progressring", "toggle",
    "iconbutton", "divider", "statcard", "taginput", "password", "searchbox",
    "sparkline", "statusbar",
]:
    if f"w_{widget}" not in runtime:
        errors.append(f"preview runtime missing renderer: {widget}")
for effect_case in [
    "case 0xe:", "case 0xf:", "case 0x10:", "case 0x11:",
    "case 0x12:", "case 0x13:", "case 0x14:", "case 0x15:",
]:
    if effect_case not in runtime:
        errors.append(f"preview runtime missing effect case: {effect_case}")

templates = (APP / "src" / "shared" / "templates.js").read_text(encoding="utf-8")
for template in [
    "window:wizard", "loader:splash", "window:settings", "loader:branded",
    "window:chat", "window:login", "loader:minimal",
]:
    if template not in templates:
        errors.append(f"templates.js missing template: {template}")

left = (APP / "src" / "renderer" / "js" / "editor" / "left.js").read_text(
    encoding="utf-8"
)
if "Wicked Extras" not in left:
    errors.append("left.js missing Wicked Extras widget group")
for widget in [
    "badge", "stat", "rating", "stepper", "breadcrumb", "chip", "timeline",
    "avatar", "progressring", "toggle",
    "iconbutton", "divider", "statcard", "taginput", "password", "searchbox",
    "sparkline", "statusbar",
]:
    if widget not in left:
        errors.append(f"left.js missing palette entry: {widget}")

settings = (APP / "src" / "renderer" / "js" / "screens" / "settings.js").read_text(
    encoding="utf-8"
)
if "0xa" not in settings and "10" not in settings:
    warnings.append("settings.js 10-second autosave option not found")
if "0x78" not in settings and "120" not in settings:
    warnings.append("settings.js 2-minute autosave option not found")
for needle in [
    "Clear recent projects", "Open app data folder", "Reset local settings",
    "Copy diagnostics", "Workspace tools",
]:
    if needle not in settings:
        errors.append(f"settings.js missing workspace tool: {needle}")

doctor = (APP / "src" / "shared" / "projectDoctor.js").read_text(encoding="utf-8")
for needle in [
    "shared by two widgets on the same page",
    "positioned mostly outside the window bounds",
    "no start page set",
    "no incoming goto action",
    "unbalanced @widget / @endwidget markers",
    "targetPage",
    "unknown type", "Duplicate page ID", "unknown theme", "unknown background effect",
]:
    if needle not in doctor:
        errors.append(f"projectDoctor.js missing check: {needle}")

main_js = (APP / "src" / "renderer" / "js" / "main.js").read_text(encoding="utf-8")
for needle in [
    "Sunset Ember", "Deep Ocean", "Hearts", "Comet",
    "Distribute selection ", "Duplicate current page", "Open Settings",
    "Midnight Gold", "Retro Terminal", "Dracula", "Nord", "Gruvbox",
    "Catppuccin", "Tokyo Night", "Rose Pine",
    "Plasma", "Fireworks", "Sakura", "Lightning",
]:
    if needle not in main_js:
        errors.append(f"main.js missing palette command: {needle}")
for needle in [
    "Group selected widgets", "Ungroup selection", "Save canvas PNG",
    "Toggle rulers", "Export single-file HTML mockup", "Export theme JSON",
    "Import theme JSON", "Export project bundle", "Import project bundle",
]:
    if needle not in main_js:
        errors.append(f"main.js missing power-tool command: {needle}")

feature_modules = {
    "editorTools.js": ["ZOOM_PRESETS", "groupWidgets", "ungroupWidgets", "bulkOffset", "bulkPatch", "rulerTicks", "snapshotName"],
    "htmlMockup.js": ["generateHtmlMockup", "escapeHtml", "mock-nav", "mock-stage"],
    "themeBundle.js": ["THEME_FORMAT", "exportTheme", "importTheme", "serializeTheme", "themeFileName"],
    "projectBundle.js": ["BUNDLE_FORMAT", "createProjectBundle", "parseProjectBundle", "serializeProjectBundle"],
    "sourceDiff.js": ["previewExportDiff", "diffSummary", "formatDiffRow"],
}
for name, needles in feature_modules.items():
    path = APP / "src" / "shared" / name
    if not path.is_file():
        errors.append(f"shared module missing: {name}")
        continue
    text = path.read_text(encoding="utf-8")
    for needle in needles:
        if needle not in text:
            errors.append(f"{name} missing feature: {needle}")

stage_js = (APP / "src" / "renderer" / "js" / "editor" / "stage.js").read_text(encoding="utf-8")
for needle in ["zoomPresets", "snapshot()", "drawRulers()", "ruler-x", "ruler-y", "showRulers"]:
    if needle not in stage_js:
        errors.append(f"stage.js missing editor power tool: {needle}")
if "'showRulers':![]" not in (APP / "src" / "renderer" / "js" / "store.js").read_text(encoding="utf-8"):
    errors.append("store.js missing showRulers default")
if "showRulers" not in settings:
    errors.append("settings.js missing ruler toggle")
if ".stage-ruler" not in (APP / "src" / "renderer" / "styles" / "editor.css").read_text(encoding="utf-8"):
    errors.append("editor.css missing ruler styling")

account = (APP / "src" / "main" / "account.cjs").read_text(encoding="utf-8")
if "'plan':'pro'" not in account or "'signedIn':!![]" not in account:
    errors.append("account.cjs local full-access profile missing")
for needle in [
    "local-usage.json", "async ping(data)", "async usage()", "async clearUsage()",
    "async login()", "async redeem()", "async logout()", "async runtimeKey()",
    "onChange(cb)", "'plan':'pro'", "full.access@wicked.local",
]:
    if needle not in account:
        errors.append(f"account.cjs missing offline API: {needle}")
for forbidden in ["fetch(", "/v1/app", "kavro.pro", "apiBase", "publicKey"]:
    if forbidden in account:
        errors.append(f"account.cjs still contains remote dependency: {forbidden}")

updater_cjs = (APP / "src" / "main" / "updater.cjs").read_text(encoding="utf-8")
for needle in [
    "feedUrl", "latest.json", "sha512", "'offline'", "external",
    "openPath", "checksum", "downloadFile", "AbortSignal.timeout",
]:
    if needle not in updater_cjs:
        errors.append(f"updater.cjs missing self-hosted feed wiring: {needle}")
if "wimState" in updater_cjs or "/v1/app/update?current=" in updater_cjs:
    errors.append("updater.cjs still contains the forced-offline legacy check")
if "'offline':t(\"upd.disabled\"" not in settings:
    errors.append("settings.js missing offline update status label")
if "Offline runtime sources" not in settings:
    errors.append("settings.js missing offline runtime disclosure")
if not (APP / "update-feed.json").is_file():
    errors.append("app/update-feed.json missing (build cannot bake the feed URL)")

integrate_ui = (APP / "src" / "renderer" / "js" / "editor" / "integrate.js").read_text(
    encoding="utf-8"
)
for stale in ["Kavro finds", "Kavro puts back", "Kavro can't check", "so Kavro works",
              "Kavro changed", "Kavro files are already", "Kavro found no file",
              "and Kavro keeps", "Kavro runtime"]:
    if stale in integrate_ui:
        errors.append(f"integrate.js still shows stale branding: {stale}")

main_process = (APP / "main.cjs").read_text(encoding="utf-8")
def unsplit_brand(text: str) -> str:
    return re.sub(r"[\"']\s*\+\s*[\"']", "", text).lower()

main_brand = unsplit_brand(main_process)
for stale in ["kavro.pro", "open kavro project", "this kavro installation", "part of kavro pro"]:
    if stale in main_brand:
        errors.append(f"main.cjs still shows stale branding: {stale}")
for needle in ["UPDATE_FEED_URL", "'feedUrl':UPDATE_FEED_URL", "update-feed.json", "'openPath':"]:
    if needle not in main_process:
        errors.append(f"main.cjs missing update wiring: {needle}")

main_flat = unsplit_brand(main_process)
preload_flat = unsplit_brand((APP / "preload.cjs").read_text(encoding="utf-8"))
api_js = (APP / "src" / "renderer" / "js" / "api.js").read_text(encoding="utf-8")
for channel in [
    "build:previewExport", "project:exportBundle", "project:importBundle",
]:
    if channel.lower() not in main_flat:
        errors.append(f"main.cjs missing IPC channel: {channel}")
for wrapper in ["previewExport", "exportBundle", "importBundle"]:
    if wrapper.lower() not in preload_flat:
        errors.append(f"preload.cjs missing wrapper: {wrapper}")
    if wrapper not in api_js:
        errors.append(f"api.js missing browser/desktop wrapper: {wrapper}")
if "SOURCE-DIFF.txt" not in main_process:
    errors.append("main.cjs missing source diff review artifact")
if "backupChanged" not in main_process:
    errors.append("main.cjs missing overwrite backup step")

helper_cjs = (APP / "src" / "main" / "update-helper.cjs").read_text(encoding="utf-8")
if "kavro" in unsplit_brand(helper_cjs):
    errors.append("update-helper.cjs still generates stale Kavro text")

plan_js = (APP / "src" / "renderer" / "js" / "plan.js").read_text(encoding="utf-8")
if "export const LOCAL_FULL_ACCESS=!![]" not in plan_js:
    errors.append("plan.js local full-access flag missing")
if "export function requirePro(X){return!![];}" not in plan_js:
    errors.append("plan.js requirePro is not unlocked")
for ident in [
    "hearts", "comet", "avatar", "progressring", "toggle", "settings", "branded",
    "iconbutton", "divider", "statcard", "taginput", "password", "searchbox",
    "sparkline", "statusbar",
    "chat", "login", "minimal", "plasma", "fireworks", "sakura", "lightning",
]:
    if ident not in plan_js:
        errors.append(f"plan.js FREE lists missing: {ident}")

store_js = (APP / "src" / "renderer" / "js" / "store.js").read_text(encoding="utf-8")
if "FULL_ACCESS_ACCOUNT" not in store_js or "'plan':'pro'" not in store_js:
    errors.append("store.js local full-access account missing")

runtimes_js = (APP / "src" / "main" / "runtimes.cjs").read_text(encoding="utf-8")
if '!X["packaged"]&&fs["exists"' in runtimes_js:
    errors.append("runtimes.cjs still requires unpackaged mode for dev sources")

ai_js = (APP / "src" / "main" / "ai.cjs").read_text(encoding="utf-8")
for needle in [
    'pK["local"]=pLocal',
    "C[\"provid\"+'er']=\"local\"",
    "function localAiAnswer",
    "function localAiEdit",
    '==="local")return localAiRun',
    "delete", "rename", "theme", "effect", "toast",
    "iconbutton", "divider", "statcard", "taginput", "password",
    "searchbox", "sparkline", "statusbar",
    "midnight-gold", "retro-terminal", "dracula", "nord", "gruvbox",
    "catppuccin", "tokyo-night", "rose-pine",
    "plasma", "fireworks", "sakura", "lightning",
    "23 global themes or 22 background effects",
]:
    if needle not in ai_js:
        errors.append(f"ai.cjs missing offline local provider: {needle}")
ai_ui = (APP / "src" / "renderer" / "js" / "editor" / "ai.js").read_text(
    encoding="utf-8"
)
if 'S["id"]==="local"' not in ai_ui or "ai.localBuiltIn" not in ai_ui:
    errors.append("AI settings UI does not handle the local offline provider")

newproject = (APP / "src" / "renderer" / "js" / "screens" / "newproject.js").read_text(
    encoding="utf-8"
)
for needle in [
    "Setup wizard", "Settings window", "Team chat", "Login window",
    "Branded splash", "Wicked loader", "Minimal loader",
]:
    if needle not in newproject:
        errors.append(f"newproject.js missing template label: {needle}")

builder = (APP / "src" / "main" / "builder.cjs").read_text(encoding="utf-8")
if 'C["kavro.h"]' not in builder:
    errors.append("builder.cjs does not map generated kavro.h correctly")
if '"void "+"KavroR"+"egiste"+"rAsset"+"s() {"' not in builder:
    errors.append("builder.cjs does not emit KavroRegisterAssets")
if '"WICKED_"+"IMPLEM"+"ENTATI"+"ON' in builder:
    errors.append("builder.cjs still emits legacy WICKED_IMPLEMENTATION definition")
rust_gen = (APP / "src" / "shared" / "codegen" / "rust.js").read_text(
    encoding="utf-8"
)
if "Kavro,\\x20Area,\\x20Wicked" not in rust_gen:
    errors.append("rust.js does not import the Wicked compatibility alias")
cpp_stub = (APP / "src" / "runtimes" / "cpp" / "kavro.h").read_text(
    encoding="utf-8"
)
if "void AddAsset(int index" not in cpp_stub or "inline void AddAsset" not in cpp_stub:
    errors.append("cpp runtime stub does not declare/define kv::AddAsset")

runtime_pak = (APP / "src" / "main" / "runtime-pak.cjs").read_text(encoding="utf-8")
if "kavro-runtime:" not in runtime_pak and '"kavro-"+"runtim"+\'e:\'' not in runtime_pak:
    errors.append("runtime-pak.cjs no longer uses the kavro-runtime: HMAC label")
generated_ids = [
    "kavro.h", "kavro_assets.h", "kavro_win32.h", "kavro_impl.cpp",
    "Kavro.cs", "kavro.rs", "KAVRO_IMPLEMENTATION", "KavroConfigure",
    "KavroRegisterAssets", "KavroUI", "KavroProject", "KavroApp",
    "crate::kavro", "KVRT1",
]
for ident in generated_ids:
    if not any(ident in p.read_text(encoding="utf-8", errors="replace") for p in APP.rglob("*") if p.is_file() and p.suffix in {".js", ".cjs", ".h", ".cpp", ".rs", ".cs", ".md", ".txt"}):
        errors.append(f"generated identifier missing: {ident}")
markers = ["@page", "@endpage", "@widget", "@endwidget"]
for marker in markers:
    if not any(marker in p.read_text(encoding="utf-8", errors="replace") for p in APP.rglob("*") if p.is_file() and p.suffix in {".js", ".cjs"}):
        errors.append(f"generated marker missing: {marker}")

runtime_files = [
    "cpp/kavro.h",
    "cpp/kavro_win32.h",
    "cpp/main.cpp",
    "cpp/main_dx9.cpp",
    "cpp/main_dx12.cpp",
    "cpp/main_opengl3.cpp",
    "cpp/main_vulkan.cpp",
    "cpp/build.bat",
    "csharp/Kavro.cs",
    "csharp/Program.cs",
    "rust/kavro.rs",
    "rust/main.rs",
]
for rel in runtime_files:
    if not (APP / "src" / "runtimes" / rel).exists():
        errors.append(f"offline runtime source missing: {rel}")

main_exe = DIST / "Wicked ImGui Maker.exe"
updater_exe = DIST / "resources" / "updater" / "WickedUpdate.exe"
if not main_exe.exists():
    errors.append("dist main executable missing")
if not updater_exe.exists():
    errors.append("dist updater executable missing")

package_version = json.loads((APP / "package.json").read_text(encoding="utf-8"))["version"]
for exe in (main_exe, updater_exe):
    if exe.exists() and package_version.encode("utf-16le") not in exe.read_bytes():
        errors.append(f"{exe.name}: PE version resource does not contain {package_version}")
pe_script = (ROOT / "patch_pe_version.py").read_text(encoding="utf-8")
if '"2.0.0"' in pe_script or "'2.0.0'" in pe_script:
    errors.append("patch_pe_version.py still hard-codes version 2.0.0")

asar = DIST / "resources" / "app.asar"
if not asar.exists():
    errors.append("dist app.asar missing")
else:
    data = asar.read_bytes()
    if data[:4] != b"\x04\x00\x00\x00":
        errors.append("app.asar has unexpected header prefix")
    else:
        json_size = struct.unpack("<I", data[12:16])[0]
        header_digest = hashlib.sha256(data[16 : 16 + json_size]).hexdigest()
        if (
            b"wicked-imgui-maker" not in data
            and b"Wicked ImGui Maker" not in data
        ):
            warnings.append("app.asar payload does not show rebranded package identity")

        exe = DIST / "Wicked ImGui Maker.exe"
        if exe.exists():
            exe_data = exe.read_bytes()
            record = re.search(
                rb'\[\{"file":"resources\\\\app\.asar","alg":"[^"]+","value":"([0-9a-f]{64})"\}\]',
                exe_data,
            )
            if not record:
                errors.append("embedded ASAR integrity record missing")
            elif record.group(1).decode("ascii") != header_digest:
                errors.append("embedded ASAR integrity hash does not match app.asar header")

print(f"checked {len(js_files)} JavaScript files")
for warning in warnings:
    print(f"WARN {warning}")
for error in errors:
    print(f"ERROR {error}")
if errors:
    sys.exit(1)
print("validation passed")
