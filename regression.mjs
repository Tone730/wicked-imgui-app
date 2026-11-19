// Functional regression suite for Wicked ImGui Maker.
// Run with: node regression.mjs
// This file is intentionally dynamic: it discovers every widget/theme/effect/
// template/preset from the shipped modules, so newly added ids are covered
// automatically without editing this file.
import { createRequire } from 'module';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const require = createRequire(import.meta.url);
const base = 'file:///C:/Users/Wick/WickedImguiMaker/app/src/shared/';
const model = await import(base + 'model.js');
const styles = await import(base + 'stylePresets.js');
const templatesMod = await import(base + 'templates.js');
const codegen = await import(base + 'codegen/index.js');
const doctor = await import(base + 'projectDoctor.js');
const aiShared = await import(base + 'ai.js');
const editorTools = await import(base + 'editorTools.js');
const htmlMockup = await import(base + 'htmlMockup.js');
const themeBundle = await import(base + 'themeBundle.js');
const projectBundle = await import(base + 'projectBundle.js');
const sourceDiff = await import(base + 'sourceDiff.js');

let passed = 0;
const failures = [];
function ok(name, condition, detail = '') {
  if (condition) { passed++; return; }
  failures.push('FAIL ' + name + (detail ? ' — ' + detail : ''));
}
function check(name, fn) {
  try { const r = fn(); ok(name, r !== false, typeof r === 'string' ? r : ''); }
  catch (e) { failures.push('FAIL ' + name + ' — ' + (e && e.message)); }
}

const widgetIds = Object.keys(model.WIDGETS);
const presetIds = Object.keys(model.PRESETS);
const effectIds = model.EFFECTS;
const themeIds = presetIds.filter((id) => !['wicked', 'light'].includes(id));

// ---- 1. Model: every widget instantiates and has metadata -------------------
for (const id of widgetIds) {
  check('widget ' + id, () => {
    const w = model.createWidget(id, 'w_' + id, 10, 20, { text: id });
    if (!w || w.type !== id) return 'createWidget failed';
    if (!model.WIDGETS[id].prefix) return 'missing prefix';
    if (!model.WIDGETS[id].label && !model.WIDGETS[id].name) return 'missing label';
    return true;
  });
}
for (const id of presetIds) {
  check('theme ' + id, () => {
    const p = model.PRESETS[id];
    for (const key of ['style', 'window', 'titlebar', 'background']) {
      if (!p[key]) return 'missing ' + key;
    }
    return true;
  });
}
for (const id of effectIds) {
  check('effect ' + id, () => Number.isInteger(model.EFFECTS.indexOf(id)));
}

// ---- 2. Style + toast presets ----------------------------------------------
for (const [type, presets] of Object.entries(styles.STYLE_PRESETS)) {
  ok('style group ' + type, Array.isArray(presets) && presets.length > 0);
  for (const preset of presets) {
    ok('style preset ' + type + '.' + preset.id, !!preset.id && !!preset.props && !!styles.PRESET_EN[preset.id]);
  }
}
for (const preset of styles.TOAST_PRESETS) {
  ok('toast preset ' + preset.id, !!preset.id && !!preset.props && !!styles.PRESET_EN[preset.id]);
}
for (const label of Object.values(styles.PRESET_EN)) {
  ok('preset label ' + label, typeof label === 'string' && label.length > 0);
}

// ---- 3. Templates -----------------------------------------------------------
const templateKeys = [];
for (const type of ['window', 'loader']) {
  for (const tpl of templatesMod.TEMPLATES[type] || []) {
    const key = tpl.key || tpl.id || tpl.name;
    if (!key) continue;
    templateKeys.push(type + ':' + key);
    check('template ' + type + ':' + key, () => {
      const p = templatesMod.buildFromTemplate({
        name: 'T ' + key, type, language: 'cpp', backend: 'dx11',
        template: key, preset: 'wicked', login: 'password',
      });
      if (!p || !Array.isArray(p.pages) || !p.pages.length) return 'no pages';
      if (!p.pages.some((page) => page.widgets && page.widgets.length)) return 'no widgets';
      return true;
    });
  }
}
ok('template fallback', (() => {
  const p = templatesMod.buildFromTemplate({ name: 'Fallback', type: 'window', language: 'cpp', backend: 'dx11', template: 'missing-id' });
  return !!p && p.pages.length > 0;
})());

// ---- 4. Code generation for every language, with every widget --------------
const allWidgetsProject = templatesMod.buildFromTemplate({
  name: 'Regression', type: 'window', language: 'cpp', backend: 'dx11', template: 'blank',
});
if (!allWidgetsProject.pages.length) allWidgetsProject.pages = [model.createPage('p1', 'Main')];
for (const id of widgetIds) {
  allWidgetsProject.pages[0].widgets.push(model.createWidget(id, 'w_' + id, 10, 10, { text: id }));
}
for (const language of ['cpp', 'csharp', 'rust']) {
  check('codegen ' + language, () => {
    const project = JSON.parse(JSON.stringify(allWidgetsProject));
    project.language = language;
    const files = codegen.generateProject(project, {});
    if (!Array.isArray(files) || !files.length) return 'no files';
    const ui = files.find((f) => /ui\.(cpp|cs|rs)$/i.test(f.path));
    if (!ui) return 'no UI file';
    for (const marker of ['@page', '@endpage']) {
      if (!ui.content.includes(marker)) return 'missing ' + marker;
    }
    for (const id of widgetIds) {
      if (!ui.content.includes('w_' + id)) return 'missing widget w_' + id;
    }
    return true;
  });
}

// ---- 5. Project Doctor still works -----------------------------------------
check('doctor healthy', () => {
  const p = templatesMod.buildFromTemplate({ name: 'Healthy', type: 'window', language: 'cpp', backend: 'dx11', template: 'blank' });
  const findings = doctor.checkProject(p);
  return Array.isArray(findings) && findings.filter((f) => f.severity === 'error').length === 0;
});
check('doctor detects duplicate id', () => {
  const p = model.createProject({ name: 'Dup' });
  p.pages = [{ id: 'p1', name: 'One', widgets: [
    model.createWidget('button', 'dup', 10, 10, { text: 'A' }),
    model.createWidget('button', 'dup', 10, 50, { text: 'B' }),
  ] }];
  return doctor.checkProject(p).some((f) => /Duplicate widget ID/i.test(f.message));
});
check('doctor detects unknown widget type', () => {
  const p = model.createProject({ name: 'BadType' });
  p.pages = [{ id: 'p1', name: 'One', widgets: [
    { ...model.createWidget('button', 'b1', 10, 10, { text: 'A' }), type: 'not-a-widget' },
  ] }];
  return doctor.checkProject(p).some((f) => /unknown type/i.test(f.message));
});
check('doctor detects duplicate page id', () => {
  const p = model.createProject({ name: 'BadPages' });
  p.pages = [
    { id: 'same', name: 'One', widgets: [] },
    { id: 'same', name: 'Two', widgets: [] },
  ];
  return doctor.checkProject(p).some((f) => /Duplicate page ID/i.test(f.message));
});
check('doctor detects unknown theme', () => {
  const p = model.createProject({ name: 'BadTheme' });
  p.pages = [{ id: 'p1', name: 'One', widgets: [] }];
  p.preset = 'not-a-theme';
  return doctor.checkProject(p).some((f) => /unknown theme/i.test(f.message));
});
check('doctor detects unknown effect', () => {
  const p = model.createProject({ name: 'BadEffect' });
  p.pages = [{ id: 'p1', name: 'One', widgets: [] }];
  p.background = { ...(p.background || {}), effect: 'not-an-effect' };
  return doctor.checkProject(p).some((f) => /unknown background effect/i.test(f.message));
});

// ---- 6. Offline account provider -------------------------------------------
const accountMod = require('C:/Users/Wick/WickedImguiMaker/app/src/main/account.cjs');
const account = accountMod.createAccount({ dataDir: mkdtempSync(join(tmpdir(), 'wim-reg-')) });
const api = ['init', 'status', 'isPro', 'runtimeKey', 'onChange', 'login', 'refresh', 'redeem', 'ping', 'usage', 'clearUsage', 'logout'];
for (const name of api) ok('account api ' + name, typeof account[name] === 'function');
check('account pro identity', () => {
  const s = account.status();
  return s.signedIn === true && s.plan === 'pro' && s.expired === false && account.isPro() === true;
});
check('account no network', () => {
  const text = require('fs').readFileSync('C:/Users/Wick/WickedImguiMaker/app/src/main/account.cjs', 'utf8');
  return !/fetch\s*\(|\/v1\/app|kavro\.pro/.test(text);
});
const acctResult = await (async () => {
  const s = await account.login({ email: 'x', password: 'y' });
  const r = await account.redeem({ key: 'anything' });
  const u = await account.usage();
  await account.ping({ minutes: 2 });
  const u2 = await account.usage();
  const cleared = await account.clearUsage();
  const u3 = await account.usage();
  return { s, r, u, u2, u3, cleared };
})();
ok('account login local', acctResult.s.plan === 'pro');
ok('account redeem local', acctResult.r.plan === 'pro');
ok('account usage local', acctResult.u.ok === true && acctResult.u.usage.days.length === 7);
ok('account usage accumulates', acctResult.u2.usage.total === acctResult.u.usage.total + 2);
ok('account clear usage', acctResult.cleared.ok === true && acctResult.u3.usage.total === 0);
ok('account runtimeKey null', (await account.runtimeKey()) === null);

// ---- 7. Offline updater reports honest status ------------------------------
const updaterMod = require('C:/Users/Wick/WickedImguiMaker/app/src/main/updater.cjs');
const updater = updaterMod.createUpdater({ dataDir: mkdtempSync(join(tmpdir(), 'wim-upd-')), currentVersion: '2.0.0' });
const updState = await updater.check();
ok('updater offline status', updState.status === 'offline', 'got ' + updState.status);

// ---- 8. Local AI provider still edits projects -----------------------------
const { createAi } = require('C:/Users/Wick/WickedImguiMaker/app/src/main/ai.cjs');
const ai = createAi({ dataDir: mkdtempSync(join(tmpdir(), 'wim-ai-')) });
const conn = await ai.run({ provider: 'local', system: 'Reply with the single word OK.', messages: [{ role: 'user', content: 'Test' }] });
ok('local AI connection', conn.text === 'OK' && conn.model === 'wicked-local');
const p = model.createProject({ name: 'AI Regression' });
p.pages = [{ id: 'main', name: 'Main', widgets: [model.createWidget('button', 'btn_1', 20, 20, { text: 'Save' })] }];
p.startPage = 'main';
const ctx = JSON.stringify({ ...aiShared.compactProject(p) }) + '\n\nRequest: add a badge widget';
const aiResult = await ai.run({ provider: 'local', json: true, messages: [{ role: 'user', content: ctx }] });
check('local AI add widget', () => {
  const patch = aiShared.parseAiJson(aiResult.text);
  if (!patch.summary) return 'no summary';
  const applied = aiShared.applyAiResult(p, patch);
  return applied.project.pages.some((pg) => pg.widgets.some((w) => w.type === 'badge'));
});

// New AI intents: additional widgets, themes and effects must resolve too.
const aiPrompts = [
  ['add iconbutton', 'add an icon button', 'iconbutton'],
  ['add divider', 'add a divider', 'divider'],
  ['add statcard', 'add a stat card', 'statcard'],
  ['add taginput', 'add a tag input', 'taginput'],
  ['add password', 'add a password field', 'password'],
  ['add searchbox', 'add a search box', 'searchbox'],
  ['add sparkline', 'add a sparkline', 'sparkline'],
  ['add statusbar', 'add a status bar', 'statusbar'],
];
for (const [label, prompt, expected] of aiPrompts) {
  const proj = model.createProject({ name: 'AI ' + label });
  proj.pages = [{ id: 'main', name: 'Main', widgets: [] }];
  proj.startPage = 'main';
  const ctx = JSON.stringify(aiShared.compactProject(proj)) + '\n\nRequest: ' + prompt;
  const res = await ai.run({ provider: 'local', json: true, messages: [{ role: 'user', content: ctx }] });
  check('local AI ' + label, () => {
    const patch = aiShared.parseAiJson(res.text);
    const applied = aiShared.applyAiResult(proj, patch);
    return applied.project.pages.some((pg) => pg.widgets.some((w) => w.type === expected));
  });
}
for (const [name, id] of [['midnight gold', 'midnight-gold'], ['dracula', 'dracula'], ['nord', 'nord'], ['tokyo night', 'tokyo-night'], ['rose pine', 'rose-pine']]) {
  const proj = model.createProject({ name: 'AI theme' });
  proj.pages = [{ id: 'main', name: 'Main', widgets: [] }];
  proj.startPage = 'main';
  const ctx = JSON.stringify(aiShared.compactProject(proj)) + '\n\nRequest: apply the ' + name + ' theme';
  const res = await ai.run({ provider: 'local', json: true, messages: [{ role: 'user', content: ctx }] });
  check('local AI theme ' + name, () => {
    const patch = aiShared.parseAiJson(res.text);
    const applied = aiShared.applyAiResult(proj, patch);
    return applied.project.style.accent === model.PRESETS[id].style.accent;
  });
}
for (const effect of ['plasma', 'fireworks', 'sakura', 'lightning']) {
  const proj = model.createProject({ name: 'AI effect' });
  proj.pages = [{ id: 'main', name: 'Main', widgets: [] }];
  proj.startPage = 'main';
  const ctx = JSON.stringify(aiShared.compactProject(proj)) + '\n\nRequest: use the ' + effect + ' effect';
  const res = await ai.run({ provider: 'local', json: true, messages: [{ role: 'user', content: ctx }] });
  check('local AI effect ' + effect, () => {
    const patch = aiShared.parseAiJson(res.text);
    const applied = aiShared.applyAiResult(proj, patch);
    return JSON.stringify(applied.project).includes(effect);
  });
}

// ---- 8b. Advanced local AI intents -----------------------------------------
const advancedAiCases = [
  ['duplicate', 'duplicate the Save button', (project) => project.pages[0].widgets.length === 3],
  ['align', 'align all widgets left', (project) => project.pages[0].widgets.every((w) => w.x === 10)],
  ['style preset', 'apply the heading style preset', (project) => project.style.fontSize === 28],
  ['action', 'add an open_url action with "https://example.com" to Save', (project) =>
    project.pages[0].widgets.some((w) => (w.actions || []).some((a) => a.type === 'open_url' && a.url === 'https://example.com'))],
  ['generate page', 'generate a login page', (project) => project.pages.length === 2 && project.pages[1].widgets.length >= 4],
];
for (const [label, prompt, verify] of advancedAiCases) {
  const proj = model.createProject({ name: 'Advanced AI ' + label });
  proj.pages = [{ id: 'main', name: 'Main', widgets: [
    model.createWidget('button', 'btn_1', 10, 20, { text: 'Save' }),
    model.createWidget('text', 'lbl_1', 120, 20, { text: 'Label' }),
  ] }];
  proj.startPage = 'main';
  const ctx = JSON.stringify(aiShared.compactProject(proj)) + '\n\nRequest: ' + prompt;
  const res = await ai.run({ provider: 'local', json: true, messages: [{ role: 'user', content: ctx }] });
  check('advanced AI ' + label, () => {
    const patch = aiShared.parseAiJson(res.text);
    return verify(aiShared.applyAiResult(proj, patch).project);
  });
}

// ---- 9. Editor power tools -------------------------------------------------
ok('zoom presets', editorTools.ZOOM_PRESETS.length >= 6 && editorTools.ZOOM_PRESETS.includes(1));
check('group widgets', () => {
  const widgets = [
    model.createWidget('button', 'b1', 10, 20, { text: 'One' }),
    model.createWidget('text', 't1', 40, 80, { text: 'Two' }),
  ];
  const grouped = editorTools.groupWidgets(widgets, ['b1', 't1'], 'Actions', 'grp_test');
  if (!grouped.groupId) return 'no group id';
  if (grouped.widgets.filter((w) => w.parent === 'grp_test').length !== 2) return 'children not parented';
  const undone = editorTools.ungroupWidgets(grouped.widgets, 'grp_test');
  if (undone.widgets.some((w) => w.parent === 'grp_test')) return 'group not dissolved';
  return undone.widgets.length === 2;
});
check('bulk edit tools', () => {
  const widgets = [model.createWidget('button', 'b1', 10, 20), model.createWidget('text', 't1', 50, 60)];
  const moved = editorTools.bulkOffset(widgets, ['b1'], 5, -3);
  if (moved[0].x !== 15 || moved[0].y !== 17) return 'offset failed';
  const patched = editorTools.bulkPatch(moved, ['t1'], { hidden: true, locked: true, type: 'image' });
  return patched[1].hidden === true && patched[1].locked === true && !('type' in patched[1] ? patched[1].type === 'image' : false);
});
check('ruler ticks', () => {
  const ticks = editorTools.rulerTicks(2, 8, 200);
  return ticks.length > 0 && ticks[0].value === 0 && ticks.some((t) => t.major);
});
ok('snapshot name', editorTools.snapshotName('My Cool UI') === 'my-cool-ui.png');

// ---- 10. HTML mockup export ------------------------------------------------
check('html mockup', () => {
  const p = model.createProject({ name: 'Mock <UI>' });
  p.pages = [{ id: 'main', name: 'Main & Settings', widgets: [model.createWidget('button', 'b1', 10, 10, { text: 'Save' })] }];
  const html = htmlMockup.generateHtmlMockup(p);
  return html.includes('<!doctype html>') && html.includes('Main &amp; Settings') && html.includes('data-page="main"') && !/https?:\/\//.test(html);
});

// ---- 11. Theme + bundle portability ----------------------------------------
check('theme round trip', () => {
  const p = model.createProject({ name: 'Theme Source' });
  p.style.accent = '#123456';
  const json = themeBundle.serializeTheme(p, 'Unit Theme');
  const imported = themeBundle.importTheme(model.createProject({ name: 'Other' }), json);
  return imported.style.accent === '#123456' && themeBundle.themeFileName('Unit Theme') === 'unit-theme.wicked-theme.json';
});
check('bundle round trip', () => {
  const p = model.createProject({ name: 'Bundle' });
  const json = projectBundle.serializeProjectBundle(p, [{ file: 'assets/a.png', kind: 'image', data: 'aGVsbG8=' }]);
  const parsed = projectBundle.parseProjectBundle(json);
  return parsed.project.name === 'Bundle' && parsed.assets[0].data === 'aGVsbG8=' && projectBundle.bundleFileName(p) === 'bundle.wickedbundle.json';
});
check('bundle binary asset', () => {
  const bytes = new Uint8Array([72, 101, 108, 108, 111]);
  const bundle = projectBundle.createProjectBundle(model.createProject({ name: 'Bytes' }), [
    { file: 'assets/hello.bin', data: bytes },
    { file: 'assets/logo.png', data: 'data:image/png;base64,aGVsbG8=' },
  ]);
  return bundle.assets[0].data === 'SGVsbG8=' && bundle.assets[1].data === 'aGVsbG8=';
});
check('theme import rejects foreign file', () => {
  try {
    themeBundle.importTheme(model.createProject(), JSON.stringify({ format: 'other', style: {} }));
    return false;
  } catch (error) {
    return /Not a Wicked theme/.test(error.message);
  }
});

// ---- 12. Export source diff -------------------------------------------------
check('source diff preview', () => {
  const files = [
    { path: 'new.h', content: 'one\ntwo' },
    { path: 'ui.cpp', content: 'a\nchanged' },
    { path: 'same.cpp', content: 'stable' },
  ];
  const changes = sourceDiff.previewExportDiff(files, { 'ui.cpp': 'a\nold', 'same.cpp': 'stable' });
  const summary = sourceDiff.diffSummary(changes);
  return changes[0].action === 'new' && changes[1].action === 'changed' && changes[2].action === 'unchanged'
    && summary.new === 1 && summary.changed === 1 && summary.unchanged === 1 && summary.needsReview === true
    && sourceDiff.formatDiffRow({ k: '+', t: 'added line' }) === '+ added line';
});

// ---- Summary ---------------------------------------------------------------
console.log('regression: ' + passed + ' checks passed');
if (failures.length) {
  for (const f of failures) console.error(f);
  console.error('regression: ' + failures.length + ' failure(s)');
  process.exit(1);
}
console.log('regression: all green');
