// learn.js — offline "learning" prebuild engine.
// Studies the user's own saved projects and produces new prebuilt menus that
// reflect their habits: favourite widgets, colours, fonts, spacing, effects and
// tab naming. Nothing leaves the machine and no model/network is involved.
import { createProject, createPage, createWidget, TEXT_STYLES } from './model.js';
import { visionSummary } from './vision.js';

export const LEARN_FORMAT = 'wicked-style-profile';
export const LEARN_VERSION = 1;

const countBy = (list, key) => {
  const m = new Map();
  for (const v of list) { const k = key(v); if (k != null) m.set(k, (m.get(k) || 0) + 1); }
  return m;
};
const topN = (map, n = 8) => [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);

/** Analyse an array of projects into a reusable style profile. */
export function learnFromProjects(projects) {
  const list = Array.isArray(projects) ? projects.filter(Boolean) : [];
  if (!list.length) throw new Error('No projects to learn from');
  const widgets = [];
  const pageNames = [];
  const colours = [];
  const fonts = [];
  const effects = [];
  const anims = [];
  const gapsX = [], gapsY = [], widths = [], heights = [];
  let type = 'loader', language = 'cpp', backend = 'dx11';

  for (const p of list) {
    if (p.type) type = p.type;
    if (p.language) language = p.language;
    if (p.backend) backend = p.backend;
    const st = p.style || {};
    for (const k of ['accent', 'accent2', 'bg', 'text', 'border', 'frame']) if (st[k]) colours.push(st[k]);
    if (st.font) fonts.push(st.font);
    if (p.background?.effect) effects.push(p.background.effect);
    for (const page of p.pages || []) {
      pageNames.push(page.name);
      const sorted = [...(page.widgets || [])].sort((a, b) => (a.y - b.y) || (a.x - b.x));
      let prev = null;
      for (const w of sorted) {
        widgets.push(w);
        widths.push(w.w); heights.push(w.h);
        if (w.anim?.type && w.anim.type !== 'none') anims.push(w.anim.type);
        if (prev) {
          if (Math.abs(w.y - prev.y) < 6 && w.x > prev.x) gapsX.push(w.x - (prev.x + prev.w));
          else if (w.y > prev.y) gapsY.push(w.y - (prev.y + prev.h));
        }
        prev = w;
      }
    }
  }

  const median = (arr, fallback) => {
    if (!arr.length) return fallback;
    const a = arr.slice().sort((x, y) => x - y);
    return a[Math.floor(a.length / 2)];
  };

  const typeCounts = countBy(widgets, (w) => w.type);
  const textSamples = widgets.filter((w) => w.type === 'text' || w.type === 'header').map((w) => w.text);
  const prefixCounts = countBy(pageNames, (n) => String(n || '').trim().split(/\s+/)[0]);

  return {
    format: LEARN_FORMAT, version: LEARN_VERSION,
    learnedAt: Date.now(),
    sourceCount: list.length,
    widgetCount: widgets.length,
    type: type || 'loader', language, backend,
    favouriteWidgets: topN(typeCounts, 10).map(([type, count]) => ({ type, count })),
    colours: topN(countBy(colours, (c) => c.toUpperCase()), 8).map(([hex, count]) => ({ hex, count })),
    fonts: topN(countBy(fonts, (f) => f), 6).map(([font, count]) => ({ font, count })),
    effects: topN(countBy(effects, (e) => e), 5).map(([effect, count]) => ({ effect, count })),
    animations: topN(countBy(anims, (a) => a), 5).map(([type, count]) => ({ type, count })),
    pagePrefixes: topN(prefixCounts, 8).map(([name, count]) => ({ name, count })),
    textSamples: [...new Set(textSamples)].slice(0, 20),
    spacing: {
      gapX: Math.max(6, Math.min(40, Math.round(median(gapsX, 14)))),
      gapY: Math.max(6, Math.min(40, Math.round(median(gapsY, 12)))),
      width: Math.max(80, Math.min(480, Math.round(median(widths, 220)))),
      height: Math.max(24, Math.min(120, Math.round(median(heights, 40)))),
    },
    sampleNames: [...new Set(pageNames)].slice(0, 12),
  };
}

/** Build a fresh, editable project from a learned style profile. */
export function generatePrebuild(profile, options = {}) {
  const p = profile && profile.format === LEARN_FORMAT ? profile : learnFromProjects(profile);
  const name = String(options.name || p.sampleNames[0] || 'Generated menu');
  const project = createProject({
    name, type: options.type || p.type, language: options.language || p.language,
    backend: options.backend || p.backend,
  });
  const fav = p.colours[0]?.hex;
  if (fav) { project.style.accent = fav; project.style.accent2 = p.colours[1]?.hex || fav; }
  if (p.fonts[0]?.font) project.style.font = p.fonts[0].font;
  if (p.effects[0]?.effect) project.background.effect = p.effects[0].effect;
  project.window.title = name;
  project.titlebar.title = name;

  const wanted = (options.widgets || p.favouriteWidgets || []).slice(0, 10);
  const names = options.pageNames || p.sampleNames.slice(0, 4);
  const pageNames = names.length ? names : ['Main'];
  project.pages = [];
  const used = new Set();
  const gap = p.spacing || { gapX: 14, gapY: 12, width: 220, height: 40 };

  pageNames.forEach((pn, pi) => {
    const page = createPage('page_' + (pi + 1), pn);
    project.pages.push(page);
    let x = 20, y = 20;
    const perPage = Math.max(2, Math.ceil(wanted.length / pageNames.length));
    const slice = wanted.slice(pi * perPage, (pi + 1) * perPage);
    for (let i = 0; i < slice.length; i++) {
      const entry = slice[i];
      const type = typeof entry === 'string' ? entry : entry.type;
      let id = `${type}_${pi}_${i}`;
      while (used.has(id)) id += '_x';
      used.add(id);
      let w;
      try { w = createWidget(type, id, x, y); } catch { continue; }
      w.text = p.textSamples[i % (p.textSamples.length || 1)] || w.text;
      if (type === 'slider') { w.props.min = 0; w.props.max = 100; w.props.value = 50; }
      if (type === 'combo' || type === 'list' || type === 'tabs') w.text = 'Option A|Option B|Option C';
      const anim = p.animations[0]?.type;
      w.anim = anim && anim !== 'none' ? { type: anim, delay: i * 0.05, duration: 0.4 } : { type: 'none', delay: 0, duration: 0.4 };
      page.widgets.push(w);
      x += w.w + gap.gapX;
      if (x + gap.width > project.window.width) { x = 20; y += w.h + gap.gapY; }
      if (y > project.window.height - 60) { x = 20; y = 20; }
    }
  });
  project.startPage = project.pages[0]?.id || 'page_1';
  return project;
}

/** Score how much a profile resembles a project (used for template suggestions). */
export function profileAffinity(profile, project) {
  if (!profile || !project) return 0;
  let score = 0;
  const colours = (project.style?.accent || '').toUpperCase();
  if (profile.colours?.some((c) => c.hex === colours)) score += 25;
  if (profile.fonts?.some((f) => f.font === project.style?.font)) score += 15;
  if (profile.type === project.type) score += 15;
  const types = new Set((project.pages || []).flatMap((p) => (p.widgets || []).map((w) => w.type)));
  for (const fw of profile.favouriteWidgets || []) if (types.has(fw.type)) score += 5;
  return Math.min(100, score);
}

export function describeProfile(profile) {
  const widgets = (profile.favouriteWidgets || []).slice(0, 5).map((w) => `${w.count}× ${w.type}`).join(', ');
  const colours = (profile.colours || []).slice(0, 3).map((c) => c.hex).join(', ');
  return `Learned from ${profile.sourceCount} project(s), ${profile.widgetCount} widgets. Favourites: ${widgets || 'none'}. Colours: ${colours || 'default'}.`;
}
