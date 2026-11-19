// Functional regression suite for Wicked ImGui Maker.
// Run with: node regression.mjs
// This file is intentionally dynamic: it discovers every widget/theme/effect/
// template/preset from the shipped modules, so newly added ids are covered
// automatically without editing this file.
import { createRequire } from 'module';
import { mkdtempSync, readFileSync } from 'fs';
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
const menus = await import(base + 'menus.js');
const targetConfig = await import(base + 'targetConfig.js');
const game = require('C:/Users/Wick/WickedImguiMaker/app/src/main/game.cjs');
const vision = await import(base + 'vision.js');
const assets = await import(base + 'assets.js');
const loaders = await import(base + 'loaders.js');
const learn = await import(base + 'learn.js');
const library = await import(base + 'library.js');
const premade = await import(base + 'premade.js');
const uikit = await import(base + 'uikit.js');

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

check('C++ export always includes kavro_assets.h', () => {
  const files = codegen.generateProject(model.createProject({ name: 'NoAssets', language: 'cpp' }), {});
  const assets = files.find((f) => f.path === 'kavro_assets.h');
  return !!assets && assets.content.includes('#pragma once') && files.some((f) =>
    f.path === 'project.cpp' && f.content.includes('#include "kavro_assets.h"'));
});

for (const language of ['cpp', 'csharp', 'rust']) {
  check('theme + credits export ' + language, () => {
    const project = model.createProject({ name: 'ThemeTest', language });
    model.applyPreset(project, 'kali-dark');
    const files = codegen.generateProject(project, {});
    const expected = codegen.GENERATED_THEME_FILES[language];
    if (!expected || expected.length !== 2) return 'no descriptor';
    for (const p of expected) {
      const f = files.find((x) => x.path === p);
      if (!f || typeof f.content !== 'string' || !f.content.trim()) return 'missing ' + p;
    }
    const theme = files.find((x) => x.path === expected[0]).content;
    if (!/windowBg|WINDOW_BG/i.test(theme)) return 'no palette constant';
    const credits = files.find((x) => x.path === expected[1]).content;
    if (!credits.includes('MIT') || !credits.includes('Source:')) return 'credits missing attribution';
    return true;
  });
}
check('ui-only export whitelist includes theme + credits headers', () => {
  const mainSrc = readFileSync('C:/Users/Wick/WickedImguiMaker/app/main.cjs', 'utf8');
  const builderSrc = readFileSync('C:/Users/Wick/WickedImguiMaker/app/src/main/builder.cjs', 'utf8');
  return mainSrc.includes("'theme.h'") && mainSrc.includes("'credits.h'")
    && builderSrc.includes("'theme.h'") && builderSrc.includes("'credits.h'");
});

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
check('doctor detects broken kit reference', () => {
  const p = uikit.buildKitProject('kali-dark');
  p.kit = 'not-a-kit';
  return doctor.checkProject(p).some((f) => /unknown UI kit/i.test(f.message));
});
check('doctor detects broken preset reference', () => {
  const p = uikit.buildKitProject('cupertino-ui');
  p.style = { ...(p.style || {}), preset: 'not-a-preset' };
  return doctor.checkProject(p).some((f) => /unknown preset/i.test(f.message));
});
check('doctor accepts every shipped kit project', () => {
  return uikit.listKits().every((k) => {
    const p = uikit.buildKitProject(k.id);
    return p && doctor.checkProject(p).filter((f) => f.severity === 'error').length === 0;
  });
});

// ---- 5b. Project Doctor layout checks --------------------------------------
check('doctor detects partially clipped widget', () => {
  const p = model.createProject({ name: 'Clipped' });
  p.window = { ...(p.window || {}), width: 200, height: 150 };
  p.pages = [{ id: 'p1', name: 'One', widgets: [
    model.createWidget('button', 'edge', 180, 10, { text: 'Edge', w: 40, h: 20 }),
  ] }];
  return doctor.checkProject(p).some((f) => /partially clipped/i.test(f.message));
});
check('doctor detects negative widget position', () => {
  const p = model.createProject({ name: 'Negative' });
  p.pages = [{ id: 'p1', name: 'One', widgets: [
    { ...model.createWidget('button', 'neg', 10, 10, { text: 'Neg' }), x: -12 },
  ] }];
  return doctor.checkProject(p).some((f) => /negative x or y/i.test(f.message));
});
check('doctor detects tiny widget', () => {
  const p = model.createProject({ name: 'Tiny' });
  p.pages = [{ id: 'p1', name: 'One', widgets: [
    { ...model.createWidget('button', 'tiny', 10, 10, { text: 'Tiny' }), w: 4, h: 4 },
  ] }];
  return doctor.checkProject(p).some((f) => /smaller than 8px/i.test(f.message));
});
check('doctor detects non-finite widget geometry', () => {
  const p = model.createProject({ name: 'NaN' });
  p.pages = [{ id: 'p1', name: 'One', widgets: [
    { ...model.createWidget('button', 'nan', 10, 10, { text: 'NaN' }), x: NaN },
  ] }];
  return doctor.checkProject(p).some((f) => /non-finite geometry/i.test(f.message));
});
check('doctor flags an empty non-start page', () => {
  const p = model.createProject({ name: 'EmptyPage' });
  p.pages = [
    { id: 'p1', name: 'One', widgets: [model.createWidget('button', 'b1', 10, 10, { text: 'A' })] },
    { id: 'p2', name: 'Two', widgets: [] },
  ];
  p.startPage = 'p1';
  return doctor.checkProject(p).some((f) => /has no widgets/i.test(f.message) && f.pageId === 'p2');
});
check('every shipped preset has no doctor errors', () => {
  return Object.keys(model.PRESETS).every((id) => {
    const p = model.createProject({ name: id });
    model.applyPreset(p, id);
    return doctor.checkProject(p).filter((f) => f.severity === 'error').length === 0;
  });
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

// Batch AI intents operate across every page, not just the focused one.
const batchAiCases = [
  ['rename across pages', 'rename all "Play" to "Launch" across every page',
    (p) => p.pages.every((pg) => pg.widgets.every((w) => !/play/i.test(w.text || '')))
      && p.pages.some((pg) => pg.widgets.some((w) => /launch/i.test(w.text || '')))],
  ['restyle all pages', 'restyle all pages with the cyber soda theme',
    (p) => p.style.accent.toLowerCase() === model.PRESETS['cyber-soda'].style.accent.toLowerCase()],
  ['convert widget types', 'convert all buttons to switches across all pages',
    (p) => p.pages.flatMap((pg) => pg.widgets).filter((w) => w.type === 'button').length === 0
      && p.pages.some((pg) => pg.widgets.some((w) => w.type === 'switch'))],
];
for (const [label, prompt, verify] of batchAiCases) {
  const proj = model.createProject({ name: 'Batch AI ' + label });
  proj.pages = [
    { id: 'main', name: 'Main', widgets: [
      model.createWidget('button', 'b1', 10, 10, { text: 'Play now' }),
      model.createWidget('checkbox', 'c1', 10, 50, { text: 'Enable Play sounds' }),
    ] },
    { id: 'two', name: 'Two', widgets: [model.createWidget('button', 'b2', 10, 10, { text: 'Play again' })] },
  ];
  proj.startPage = 'main';
  const ctx = JSON.stringify(aiShared.compactProject(proj)) + '\n\nRequest: ' + prompt;
  const res = await ai.run({ provider: 'local', json: true, messages: [{ role: 'user', content: ctx }] });
  check('batch AI ' + label, () => {
    const patch = aiShared.parseAiJson(res.text);
    return verify(aiShared.applyAiResult(proj, patch).project);
  });
}

// ---- 8c. Source-derived UI kit catalog + offline AI ------------------------
const kitIds = ['kali-dark', 'cloudy-light', 'givenchy-gold', 'eon-wtf', 'fortnite-external', 'fn-external', 'loader-template', 'hat-ui', 'lazyui-combat', 'imjson-demo', 'vision-menu', 'dear-imgui-styles', 'imgui-candy', 'untitled-theme-editor', 'clean-menu', 'lumin-menu', 'hello-imgui-themes', 'imthemes-browser', 'cupertino-ui', 'imgui-styles-rs', 'cpstyling-lua', 'imkit-design-system'];
ok('UI kit registry', uikit.UI_KIT_IDS.length === 22 && kitIds.every((id) => uikit.UI_KIT_IDS.includes(id)));
check('every UI kit carries attribution metadata', () => uikit.listKits().every((k) => k.license && k.repo && k.author && k.attribution));

//---- Third-party licence notices -------------------------------------------
const kitLicenses = await import(base + 'kitLicenses.js');
const notices = readFileSync(new URL('./THIRD-PARTY-NOTICES.txt', import.meta.url), 'utf8');
const mitKits = uikit.listKits().filter((k) => /^MIT/i.test(k.license || ''));
const sampleKits = uikit.listKits().filter((k) => !/^MIT/i.test(k.license || ''));
check('THIRD-PARTY-NOTICES covers every bundled kit', () => uikit.listKits()
  .every((k) => notices.includes(k.name) && notices.includes(k.id)));
check('every MIT kit ships its verbatim licence', () => mitKits.length > 0 && mitKits.every((k) => {
  const text = kitLicenses.kitLicenseText(k.id);
  return text && /MIT License/i.test(text) && /Permission is hereby granted/i.test(text)
    && text.split('\n').some((ln) => /Copyright \(c\)/i.test(ln));
}));
check('unlicensed source samples are explicitly labelled', () => {
  const labels = (notices.match(/No licence file was present/g) || []).length;
  return sampleKits.length > 0 && labels === sampleKits.length;
});
check('generated licence module matches licenses/ files', () => {
  const dir = new URL('./licenses/', import.meta.url);
  const { readdirSync } = require('fs');
  const files = readdirSync(dir).filter((f) => f.endsWith('.txt'));
  return files.length === Object.keys(kitLicenses.KIT_LICENSE_TEXTS).length && files.every((f) => {
    const id = f.replace(/\.txt$/, '');
    return kitLicenses.kitLicenseText(id) === readFileSync(new URL('./licenses/' + f, import.meta.url), 'utf8')
      .replace(/\r\n/g, '\n').trimEnd() + '\n';
  });
});
check('ZIP packaging includes third-party notices', () => {
  const pkg = readFileSync('C:/Users/Wick/wicked-imgui/tools/package-app.ps1', 'utf8');
  return pkg.includes('THIRD-PARTY-NOTICES.txt') && pkg.includes("'licenses'");
});
check('UI kit recipes target real widgets/actions', () => Object.values(uikit.CONTROL_RECIPES)
  .every((r) => (r.widget && model.WIDGETS[r.widget]) || (r.action && model.ACTIONS[r.action])));
check('UI kit presets all exist', () => kitIds.every((id) => {
  const kit = uikit.getKit(id);
  return kit && model.PRESETS[kit.preset] && kit.screens.length && kit.window.width > 0;
}));
for (const id of kitIds) {
  const built = uikit.buildKitProject(id);
  check('UI kit builds editable project: ' + id, () => {
    if (!built || !built.pages.length) return false;
    const widgets = built.pages.flatMap((pg) => pg.widgets);
    return widgets.length >= 10 && widgets.every((w) => model.WIDGETS[w.type] && /^[A-Za-z_][A-Za-z0-9_]*$/.test(w.id));
  });
  const ctx = JSON.stringify(aiShared.compactProject(model.createProject({ name: 'Kit test' }))) +
    '\n\nRequest: recreate the ' + uikit.getKit(id).name;
  const res = await ai.run({ provider: 'local', json: true, messages: [{ role: 'user', content: ctx }] });
  check('local AI recreates UI kit: ' + id, () => {
    const patch = aiShared.parseAiJson(res.text);
    const out = aiShared.applyAiResult(model.createProject({ name: 'Kit target' }), patch);
    return out.stats.pagesAdded >= 1 && out.stats.added >= 10 && patch.summary.includes(uikit.getKit(id).name);
  });
}
check('new online kits detected in AI requests', () => {
  const ids = uikit.detectKitRequests('Recreate the Vision Overlay Menu and the Lumin Free ImGui Menu');
  return ids.includes('vision-menu') && ids.includes('lumin-menu');
});
check('new online kits keep exact source strings', () => {
  const grab = (id) => JSON.stringify(uikit.getKit(id));
  return grab('clean-menu').includes('Slider Intager')
    && grab('clean-menu').includes('Aimbot Mode')
    && grab('lumin-menu').includes('License key required')
    && grab('lumin-menu').includes('Tournament preset')
    && grab('imjson-demo').includes('Counter = 0')
    && grab('vision-menu').includes('Nothing here yet.')
    && grab('hello-imgui-themes').includes('SoDark_AccentYellow')
    && grab('imgui-candy').includes('Theme_Cyberpunk')
    && grab('untitled-theme-editor').includes('DestructiveColor')
    && grab('dear-imgui-styles').includes('StyleColorsSpectrum');
});
check('v2.9 kits keep exact source-derived values', () => {
  const grab = (id) => JSON.stringify(uikit.getKit(id));
  return grab('imthemes-browser').includes('Cherry (r-lyeh)')
    && grab('imthemes-browser').includes('Refresh Feed')
    && grab('cupertino-ui').includes('#FF5F57')
    && grab('cupertino-ui').includes('SystemPurple dark = #BF5AF2')
    && grab('imgui-styles-rs').includes('Embrace the Darkness')
    && grab('imgui-styles-rs').includes('[0.74,0.58,0.98,1.0]')
    && grab('cpstyling-lua').includes('CPToggleOn')
    && grab('cpstyling-lua').includes('{0.34,0.95,0.98,1.00}')
    && grab('imkit-design-system').includes('elevation.offset = 2 2')
    && grab('imkit-design-system').includes('show_schedule_page');
});
check('lexicon patch inserts a new-kit sampled control', () => {
  const proj = model.createProject({ name: 'Lexicon2' });
  proj.pages = [{ id: 'main', name: 'Main', widgets: [] }];
  proj.startPage = 'main';
  const ctx = JSON.stringify(aiShared.compactProject(proj)) + '\n\nRequest: add a "Slider Intager" control';
  const patch = uikit.lexiconPatchFromRequest(ctx);
  if (!patch) return 'no patch';
  const out = aiShared.applyAiResult(proj, aiShared.parseAiJson(patch));
  const w = out.project.pages[0].widgets[0];
  return !!w && w.type === 'slider' && w.text === 'Slider Intager';
});
check('UI kit knowledge in AI prompts', () => {
  const prompt = aiShared.editSystemPrompt(model.createProject({ name: 'Prompt test' }));
  return prompt.includes('SOURCE-DERIVED UI KITS') && prompt.includes('#FFD700') && prompt.includes('CONTROL RECIPES');
});
{
  const ask = await ai.run({ provider: 'local', system: '', messages: [{ role: 'user', content: 'Tell me about the Givenchy Standalone Menu' }] });
  check('local AI explains UI kits', () => ask.text.includes('Givenchy Standalone Menu') && ask.text.includes('#FFD700'));
}

// ---- 8d. Reusable control lexicon + premade registry -----------------------
check('lexicon expands array labels into single controls', () => {
  const lex = uikit.controlLexicon();
  const joints = lex.filter((e) => e.label === 'Skeletons JointsTTTT');
  return joints.length >= 1 && joints[0].kit === 'hat-ui' && joints[0].widget === 'checkbox'
    && !lex.some((e) => e.label === 'SkeletonsTTTTT,Skeletons JointsTTTT');
});
check('findKitControl prefers the exact sampled name', () => {
  const ref = uikit.findKitControl('Aimbot Smoothing');
  return !!ref && ref.label === 'Aimbot Smoothing' && ref.widget === 'slider' && ref.kit === 'fn-external';
});
check('lexicon patch inserts a quoted sampled control', () => {
  const proj = model.createProject({ name: 'Lexicon' });
  proj.pages = [{ id: 'main', name: 'Main', widgets: [] }];
  proj.startPage = 'main';
  const ctx = JSON.stringify(aiShared.compactProject(proj)) + '\n\nRequest: add a "Maximum range" control';
  const patch = uikit.lexiconPatchFromRequest(ctx);
  if (!patch) return 'no patch';
  const out = aiShared.applyAiResult(proj, aiShared.parseAiJson(patch));
  const w = out.project.pages[0].widgets[0];
  return !!w && w.type === 'slider' && w.text === 'Maximum range';
});
check('lexicon patch ignores generic widget requests', () => {
  const proj = model.createProject({ name: 'Generic' });
  proj.pages = [{ id: 'main', name: 'Main', widgets: [] }];
  proj.startPage = 'main';
  const ctx = JSON.stringify(aiShared.compactProject(proj)) + '\n\nRequest: add an icon button';
  return uikit.lexiconPatchFromRequest(ctx) === null;
});
check('new design systems detected in AI requests', () => {
  const ids = uikit.detectKitRequests('Recreate HAT UI and the LazyUI Combat Dashboard');
  return ids.includes('hat-ui') && ids.includes('lazyui-combat');
});
check('premade registry builds every template', () => {
  if (premade.PREMADE_TEMPLATES.length !== 25) return 'expected 25 templates';
  return premade.PREMADE_TEMPLATES.every((t) => {
    try { const p = premade.buildPremade(t.id); return p && p.pages && p.pages.length > 0; }
    catch { return false; }
  });
});

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

// ---- 13. Reusable menu system ----------------------------------------------
for (const type of Object.keys(menus.MENU_TYPES)) {
  check('menu preset ' + type, () => {
    const menu = menus.createMenu({ type });
    const project = model.createProject({ name: 'MenuTest', type: 'loader' });
    const applied = menus.applyMenuToProject(project, menu);
    return !!applied.menu && applied.pages.length === menu.categories.length
      && applied.pages.every(page => page.widgets.length > 0)
      && menus.menuFromProject(applied).id === menu.id;
  });
}
check('menu normalize and serialize round trip', () => {
  const menu = menus.createMenu({ type: 'dashboard', name: 'My HUD' });
  const parsed = menus.parseMenu(menus.serializeMenu(menu));
  return parsed.name === 'My HUD' && parsed.type === 'dashboard'
    && menus.normalizeMenu({ categories: [{ id: 'x', items: [{ type: 'unknown' }] }] }).categories[0].items[0].type === 'toggle';
});
check('menu source markers and codegen files', () => {
  const menu = menus.createMenu({ type: 'trainer' });
  for (const lang of ['cpp', 'csharp', 'rust']) {
    const src = menus.menuSource(menu, lang);
    if (!src.includes('// @menu') || !src.includes('// @endmenu')) return false;
    const project = model.createProject({ name: 'M', type: 'loader', language: lang });
    menus.applyMenuToProject(project, menu);
    const file = codegen.generateProject(project, {}).find(f => /menu\.(cpp|cs|rs)$/i.test(f.path));
    if (!file || !file.content.includes('@menu')) return false;
  }
  return true;
});

// ---- 14. Generic target detection + loader config --------------------------
check('target config defaults', () => {
  const t = targetConfig.normalizeTarget(null);
  return t.renderer === 'dx11' && t.arch === 'x64' && t.attachMode === 'inject' && t.version === 1;
});
check('target config from offline analysis', () => {
  const cfg = targetConfig.configFromAnalysis({
    processName: 'game.exe', file: 'C:/Games/game.exe', arch: 'x64', renderer: 'dx12',
    engine: 'unity-il2cpp', input: { xinput: true, directinput: false },
  }, { windowClass: 'UnityWndClass' });
  return cfg.processName === 'game.exe' && cfg.renderer === 'dx12' && cfg.windowClass === 'UnityWndClass'
    && cfg.input.xinput === true && targetConfig.targetSummary(cfg).includes('DX12');
});
check('target config file only for loader projects', () => {
  const window = model.createProject({ name: 'W', type: 'window' });
  const loader = model.createProject({ name: 'L', type: 'loader' });
  loader.target = targetConfig.configFromAnalysis({ processName: 'game.exe', renderer: 'vulkan' });
  const file = targetConfig.targetConfigFile(loader);
  return targetConfig.targetConfigFile(window) === null && !!file && file.path === 'loader.config.json'
    && JSON.parse(file.content).renderer === 'vulkan';
});
check('offline renderer/engine detection', () => {
  const d = game.detect(['UnityPlayer.dll', 'd3d12.dll', 'GameAssembly.dll', 'xinput1_3.dll']);
  const d2 = game.detect(['d3d9.dll', 'tier0.dll', 'vstdlib.dll']);
  return d.renderer === 'dx12' && d.engine === 'unity-il2cpp' && d.input.xinput === true
    && d2.renderer === 'dx9' && d2.engine === 'source';
});
check('PE import parser reads real binaries', () => {
  try {
    const a = game.analyzeTarget('C:\\Windows\\System32\\kernel32.dll');
    return a.arch === 'x64' && a.importCount > 0 && Array.isArray(a.imports);
  } catch (error) {
    return false;
  }
});
check('loader export includes menu and config files', () => {
  const project = model.createProject({ name: 'Loader', type: 'loader' });
  menus.applyMenuToProject(project, menus.createMenu({ type: 'combat' }));
  project.target = targetConfig.configFromAnalysis({ processName: 'game.exe', renderer: 'dx11' });
  for (const lang of ['cpp', 'csharp', 'rust']) {
    project.language = lang;
    const paths = codegen.generateProject(project, {}).map(f => f.path);
    if (!paths.some(p => /menu\.(cpp|cs|rs)$/i.test(p)) || !paths.includes('loader.config.json')) return false;
  }
  return true;
});

// ---- 15. Extended animations and effects -----------------------------------
check('new animation ids are indexable', () => {
  return ['pop', 'bounce', 'zoom', 'pulse'].every(id => model.ANIMS.indexOf(id) >= 6);
});
check('new effect ids are indexable', () => {
  return ['vortex', 'sparks', 'scanlines', 'glitch', 'tunnel', 'dna'].every(id => model.EFFECTS.indexOf(id) >= 22);
});
check('preview implements new effects and animations', () => {
  const src = readFileSync('C:/Users/Wick/WickedImguiMaker/app/src/renderer/js/preview/runtime.js', 'utf8');
  return [0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b].every(i => src.includes('case 0x' + i.toString(16)))
    && [0x6, 0x7, 0x8, 0x9].every(i => src.includes("y['anim']===0x" + i.toString(16)));
});
check('runtime config maps new effect indices', () => {
  const project = model.createProject();
  project.background.effect = 'vortex';
  return model.runtimeConfig(project).background.effect === model.EFFECTS.indexOf('vortex');
});

// ---- 16. Persistence round trips with new data -----------------------------
check('bundle preserves menus and target config', () => {
  const project = model.createProject({ name: 'Bundle2', type: 'loader' });
  project.menu = menus.createMenu({ type: 'sidebar' });
  project.target = targetConfig.configFromAnalysis({ processName: 'game.exe', renderer: 'dx12' });
  const json = projectBundle.serializeProjectBundle(project, []);
  const parsed = projectBundle.parseProjectBundle(json);
  return parsed.project.menu.type === 'sidebar' && parsed.project.target.renderer === 'dx12'
    && model.migrateProject(parsed.project).menu.id === project.menu.id;
});
check('migrateProject keeps menu and target', () => {
  const project = model.createProject({ name: 'M', type: 'loader' });
  project.menu = menus.createMenu();
  project.target = targetConfig.normalizeTarget({ renderer: 'vulkan' });
  const migrated = model.migrateProject(JSON.parse(JSON.stringify(project)));
  return !!migrated.menu && migrated.target.renderer === 'vulkan';
});

// ---- 17. v2.4.0 offline expansion modules ----------------------------------
check('vision extracts widgets from C++ source', () => {
  const info = vision.extractFeatures({
    text: 'void M(){ ImGui::Button("Go"); ImGui::Checkbox("ESP", &e); ImGui::SliderFloat("FOV", &f, 0, 800); ImGui::Combo("Box", &b, items); }',
    kind: 'cpp',
  });
  return info.features.length >= 4 && info.kind === 'cpp'
    && vision.visionProject(info).project.pages.every(p => Array.isArray(p.widgets));
});
check('vision detects web / JS object menus', () => {
  const info = vision.extractFeatures({ text: 'const menu={tabs:[{name:"Player",items:[{type:"checkbox",label:"Godmode"}]}]};', kind: 'web' });
  return info.features.length >= 1;
});
check('vision never executes pasted code', () => {
  const info = vision.extractFeatures({ text: 'while(true){ evil(); }', kind: 'cpp' });
  return !!info && Array.isArray(info.features);
});
check('assets image round trip', () => {
  const url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const a = assets.createImageAsset(url, 'pixel.png');
  const p = model.createProject({ name: 'A' });
  assets.addAsset(p, a);
  const back = assets.importAssetPack(assets.exportAssetPack(p, 't'));
  return a.url === url && a.mime === 'image/png' && back.assets.length === 1
    && /unsigned char/.test(assets.assetCpp(a, 'img'));
});
check('loaders detect + apply generic profile', () => {
  const hints = loaders.detectLoaderHints('BOOL APIENTRY DllMain(...) { CreateThread(...); }');
  const prof = loaders.makeProfile({ loader: 'external', api: 'dx11', language: 'cpp' });
  const p = model.createProject({ name: 'L' });
  loaders.applyProfile(p, prof);
  return hints.hints.length >= 2 && p.overrides.loader === 'external'
    && loaders.compatibilityChecklist(prof).length >= 3;
});
check('learn generates an editable prebuild', () => {
  const a = model.createProject({ name: 'A' });
  a.pages[0].widgets.push(model.createWidget('button', 'b', 1, 2, { text: 'Go' }));
  const prof = learn.learnFromProjects([a]);
  const built = learn.generatePrebuild(prof, { name: 'Pre' });
  return built.pages.length >= 1 && /Learned from/.test(learn.describeProfile(prof));
});
check('library publish/search/pack round trip', () => {
  const lib = library.createLibrary('T');
  library.publishLocal(lib, model.createProject({ name: 'A' }), { name: 'Alpha', tags: ['dark'] });
  const lib2 = library.parseLibrary(library.serializeLibrary(lib));
  const imp = library.importPack(lib2, library.exportPack(lib, { name: 'P' }));
  return lib.entries.length === 1
    && library.searchEntries(lib, 'alpha').length === 1
    && library.searchEntries(lib, '', 'dark').length === 1
    && imp.added >= 1 && library.instantiateEntry(lib.entries[0]).pages.length >= 1;
});
for (const t of premade.PREMADE_TEMPLATES) {
  check('premade template ' + t.id, () => {
    const p = premade.buildPremade(t.id);
    return p.pages.length >= 1 && p.pages.some(pg => pg.widgets.length > 0)
      && !!p.style && !!p.window;
  });
}
check('premade kali-loader fidelity', () => {
  const p = premade.buildPremade('kali-loader');
  const ids = p.pages.map(pg => pg.id);
  const txt = p.pages.flatMap(pg => pg.widgets.map(w => w.text || '')).join('|');
  return ['kali_signin', 'kali_signup', 'kali_dashboard'].every(id => ids.includes(id))
    && ['LOGIN', 'CREATE ACCOUNT', 'WELCOME BACK', 'KALI-XXXX-XXXX-XXXX', 'SIGN IN', 'SIGN UP'].every(s => txt.includes(s))
    && p.style.preset === 'kali-dark' && p.window.width === 760 && p.window.height === 560;
});
check('premade cloudy-ui fidelity', () => {
  const p = premade.buildPremade('cloudy-ui');
  const ids = p.pages.map(pg => pg.id);
  const txt = p.pages.flatMap(pg => pg.widgets.map(w => w.text || '')).join('|');
  return ['cloudy_welcome', 'cloudy_spoofer'].every(id => ids.includes(id))
    && ['welcome back', 'Please sing in to continue', 'SPOOF', 'CLEAN', 'Hardware Identifiers & Protection'].every(s => txt.includes(s))
    && p.style.preset === 'cloudy-light' && p.window.width === 900 && p.window.height === 580;
});
check('premade givenchy fidelity', () => {
  const p = premade.buildPremade('givenchy');
  const ids = p.pages.map(pg => pg.id);
  const txt = p.pages.flatMap(pg => pg.widgets.map(w => w.text || '')).join('|');
  return ['gv_combat', 'gv_silent', 'gv_visuals', 'gv_exploits', 'gv_movement', 'gv_clientsided', 'gv_settings'].every(id => ids.includes(id))
    && ['Enable Aimbot', 'Target Hitbox', 'Walkspeed', 'Headless', 'Config Name', 'COMBAT|VISUALS|EXPLOITS|MISC'].every(s => txt.includes(s))
    && p.style.preset === 'givenchy-gold' && p.window.width === 720 && p.window.height === 445;
});
check('webhook / discord / open_url actions emit in C++', () => {
  const p = model.createProject({ name: 'Act', language: 'cpp' });
  const w = model.createWidget('button', 'b1', 1, 2, { text: 'Go' });
  w.actions = [
    { type: 'webhook', url: 'https://x', payload: '{}', method: 'POST' },
    { type: 'discord', url: 'https://discord.gg/x', message: 'Join', username: 'W' },
    { type: 'open_url', url: 'https://example.com' },
  ];
  p.pages[0].widgets.push(w);
  const files = codegen.generateProject(p, {});
  const ui = files.find(f => /ui|menu|project/i.test(f.path));
  const body = ui?.content || '';
  return /Webhook\(/.test(body) && /Discord\(/.test(body) && /OpenUrl\(/.test(body);
});
check('expanded font list + text styles are available', () => {
  return model.FONTS.includes('outfit') && model.FONTS.includes('inter')
    && model.FONT_CSS.outfit && model.TEXT_STYLES.includes('heading')
    && model.WIDGETS.text.props.some(x => x.key === 'textStyle');
});

// ---- Visual regression: kit-board PNG baselines ----------------------------
// Folded into the main gate so `node regression.mjs` alone cannot miss palette
// or label drift across the 118 shipped kit boards.
const { checkVisualRegression } = await import('./visual-regression.mjs');
const visual = checkVisualRegression({ log: false });
for (const name of visual.expected) {
  ok('visual board ' + name, !visual.failures.includes(name));
}
const staleBaselines = visual.failures.filter((f) => f.startsWith('stale:'));
ok('no stale visual baselines', staleBaselines.length === 0, staleBaselines.join(', '));

// ---- Summary ---------------------------------------------------------------
console.log('regression: ' + passed + ' checks passed');
if (failures.length) {
  for (const f of failures) console.error(f);
  console.error('regression: ' + failures.length + ' failure(s)');
  process.exit(1);
}
console.log('regression: all green');
