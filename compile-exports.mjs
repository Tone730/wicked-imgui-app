// compile-exports.mjs — compile-verify generated export artifacts.
//
// Generates a representative project in every language, writes the generated
// files to a temp directory, and hands the self-contained artifacts to the
// locally available toolchains. Toolchains that are not installed are reported
// as SKIP rather than failing the run.
//
// Scope: the v2.9.0 generated theme/credits files and the offline runtime
// stubs. Full generated projects intentionally target a real Dear ImGui
// backend (their CMake/csproj references third_party/imgui and Silk.NET), so
// they are not compiled here — see INTEGRATION_NOTES.md in each export.
//
//   node compile-exports.mjs
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { spawnSync } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const base = 'file:///C:/Users/Wick/WickedImguiMaker/app/src/shared/';
const model = await import(base + 'model.js');
const codegen = await import(base + 'codegen/index.js');
const { createRuntimes } = require('C:/Users/Wick/WickedImguiMaker/app/src/main/runtimes.cjs');
const runtimes = createRuntimes({ root: 'C:/Users/Wick/WickedImguiMaker/app' });

const results = [];
const record = (label, status, detail) => {
  results.push({ label, status, detail });
  console.log(status.padEnd(5), label, detail ? '— ' + detail : '');
};
const tool = (name) => {
  const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [name], { encoding: 'utf8' });
  return r.status === 0 && r.stdout.trim() ? r.stdout.trim().split(/\r?\n/)[0] : null;
};
const run = (cmd, args, cwd, timeout = 180000) => spawnSync(cmd, args, {
  cwd, encoding: 'utf8', timeout,
  env: { ...process.env, DOTNET_CLI_TELEMETRY_OPTOUT: '1', DOTNET_NOLOGO: '1', DOTNET_SKIP_FIRST_TIME_EXPERIENCE: '1' },
});

async function exportFiles(language) {
  const p = model.createProject({ name: 'ArtifactCompile', language });
  p.pages = [{ id: 'main', name: 'Main', widgets: model.WIDGET_TYPES.map((t, i) =>
    model.createWidget(t, 'w' + i, 10, 10, { text: t })) }];
  p.startPage = 'main';
  const files = codegen.generateProject(p, {});
  await runtimes.fill({ language, files });
  return files;
}
function materialize(files, wanted) {
  const dir = mkdtempSync(join(tmpdir(), 'wim-compile-'));
  for (const f of files) {
    if (!wanted.includes(f.path)) continue;
    const out = join(dir, f.path);
    mkdirSync(join(out, '..'), { recursive: true });
    writeFileSync(out, f.content);
  }
  return dir;
}

// ---- C++: generated theme/credits + offline runtime stubs --------------------
const gxx = tool('g++') || tool('clang++');
const cppFiles = await exportFiles('cpp');
const cppNames = ['theme.h', 'credits.h', 'kavro.h', 'kavro_win32.h', 'kavro_assets.h'];
const missingCpp = cppNames.filter((n) => !cppFiles.some((f) => f.path === n));
record('C++ export artifact set', missingCpp.length ? 'FAIL' : 'PASS', missingCpp.length ? 'missing ' + missingCpp.join(', ') : cppNames.length + ' files');
if (gxx) {
  const dir = materialize(cppFiles, cppNames);
  writeFileSync(join(dir, 'check_theme.cpp'),
    '#include "theme.h"\n#include "credits.h"\nint main(){return wicked::theme::accent[0] >= 0.0f ? 0 : 1;}\n');
  writeFileSync(join(dir, 'check_stubs.cpp'),
    '#include "kavro.h"\n#include "kavro_win32.h"\n#include "kavro_assets.h"\nint main(){return 0;}\n');
  for (const [label, file] of [['C++ generated theme.h + credits.h', 'check_theme.cpp'], ['C++ offline runtime stubs', 'check_stubs.cpp']]) {
    const r = run(gxx, ['-std=c++17', '-fsyntax-only', '-I', dir, file], dir, 60000);
    record(label, r.status === 0 ? 'PASS' : 'FAIL', r.status === 0 ? gxx : (r.stderr || '').split('\n').filter((l) => /error|fatal/.test(l)).slice(0, 2).join(' | '));
  }
  rmSync(dir, { recursive: true, force: true });
} else {
  record('C++ compile', 'SKIP', 'no g++/clang++ on PATH');
}

// ---- C#: generated theme/credits --------------------------------------------
const csFiles = await exportFiles('csharp');
const csDir = materialize(csFiles, ['Theme.cs', 'Credits.cs']);
const csproj = `<Project Sdk="Microsoft.NET.Sdk">
<PropertyGroup>
<TargetFramework>net8.0</TargetFramework>
<OutputType>Library</OutputType>
<ImplicitUsings>disable</ImplicitUsings>
<Nullable>disable</Nullable>
<EnableDefaultCompileItems>false</EnableDefaultCompileItems>
</PropertyGroup>
<ItemGroup>
<Compile Include="Theme.cs" />
<Compile Include="Credits.cs" />
</ItemGroup>
</Project>
`;
writeFileSync(join(csDir, 'ArtifactCheck.csproj'), csproj);
if (tool('dotnet')) {
  const r = run('dotnet', ['build', '--nologo', '-v', 'q', 'ArtifactCheck.csproj'], csDir);
  record('C# generated Theme.cs + Credits.cs', r.status === 0 ? 'PASS' : 'FAIL',
    r.status === 0 ? 'net8.0' : ((r.stdout || '') + (r.stderr || '')).split('\n').filter((l) => /error/i.test(l)).slice(0, 2).join(' | '));
} else {
  record('C# compile', 'SKIP', 'no dotnet on PATH');
}
rmSync(csDir, { recursive: true, force: true });

// ---- Rust: generated theme/credits ------------------------------------------
const rsFiles = await exportFiles('rust');
const rsNames = ['src/theme.rs', 'src/credits.rs'];
const rsMissing = rsNames.filter((n) => !rsFiles.some((f) => f.path === n));
record('Rust export artifact set', rsMissing.length ? 'FAIL' : 'PASS', rsMissing.length ? 'missing ' + rsMissing.join(', ') : rsNames.length + ' files');
const rustc = tool('rustc');
if (rustc) {
  const dir = materialize(rsFiles, rsNames);
  writeFileSync(join(dir, 'lib.rs'), '#[path = "src/theme.rs"] pub mod theme;\n#[path = "src/credits.rs"] pub mod credits;\n');
  const r = run(rustc, ['--edition', '2021', '--crate-type', 'lib', 'lib.rs'], dir, 60000);
  record('Rust generated theme.rs + credits.rs', r.status === 0 ? 'PASS' : 'FAIL',
    r.status === 0 ? rustc : (r.stderr || '').split('\n').filter((l) => /error/.test(l)).slice(0, 2).join(' | '));
  rmSync(dir, { recursive: true, force: true });
} else {
  // Fallback structural check: balanced delimiters and well-formed const lines.
  const ok = rsNames.every((n) => {
    const text = rsFiles.find((f) => f.path === n).content;
    const count = (c) => (text.match(new RegExp('\\' + c, 'g')) || []).length;
    return count('{') === count('}') && count('(') === count(')')
      && text.split('\n').filter((l) => l.includes('=')).every((l) => !/=\s*;/.test(l));
  });
  record('Rust generated theme.rs + credits.rs', ok ? 'PASS' : 'FAIL', 'rustc absent — structural check only');
}

const failed = results.filter((r) => r.status === 'FAIL');
console.log('\ncompile-exports: ' + results.length + ' checks, ' + failed.length + ' failure(s)');
if (failed.length) process.exitCode = 1;
else console.log('compile-exports: all green');
