// vision.js — offline "menu understanding" engine.
// Reads C++/C#/Rust ImGui code, web UI source, JSON or a plain description and
// extracts the features it finds (sliders, buttons, checks, tabs, keybinds,
// colours, fonts, links and images). It then builds a normal editable project
// so anything the user pastes can be customised like a native Wicked project.
// Nothing here executes the input: it is all static text pattern recognition.
import { createProject, createPage, createWidget, FONTS } from './model.js';

export const VISION_FORMAT = 'wicked-menu-vision';
export const VISION_VERSION = 1;

const KIND_WIDGET = {
  check: 'checkbox', checkbox: 'checkbox', toggle: 'switch', bool: 'checkbox',
  slider: 'slider', sliderfloat: 'slider', sliderint: 'slider', number: 'number',
  combo: 'combo', select: 'combo', dropdown: 'combo', choice: 'combo',
  multi: 'list', multicombo: 'list', list: 'list', listbox: 'list',
  button: 'button', click: 'button', link: 'button', url: 'button',
  key: 'hotkey', hotkey: 'hotkey', keybind: 'hotkey', keybox: 'hotkey',
  color: 'colorpicker', colour: 'colorpicker', swatch: 'colorpicker', colorpicker: 'colorpicker',
  input: 'input', inputtext: 'input', text: 'text', label: 'text', heading: 'header',
  image: 'image', picture: 'image', panel: 'panel', group: 'panel',
  progress: 'progress', separator: 'separator', tabs: 'tabs',
};

const TAB_WORDS = /\b(?:BeginTabItem|TabItem|TopTab|NavItem|SelectTab|tabs?|tab_labels|categories|sections)\b/i;
const ARRAY_RE = /(?:const\s+)?(?:char\*|std::string|string)\s*(?:const\s*)?[^\n;]*?\b([A-Za-z_]\w*)\s*\[[^\]]*\]\s*=\s*\{([^}]*)\}/g;

const stripComments = (s) => String(s || '')
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
  .replace(/<!--[\s\S]*?-->/g, ' ');

const unquote = (s) => String(s == null ? '' : s)
  .replace(/^['"`]|[ '"`]$/g, '')
  .replace(/\\(["'\\])/g, '$1')
  .replace(/\\x20/g, ' ').trim();

function numbers(text) {
  return (String(text || '').match(/-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g) || []).map(Number);
}

/** Split a call's arguments on top-level commas, ignoring nested brackets and strings. */
function callArgs(text) {
  const out = []; let depth = 0, quote = '', start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) { if (c === '\\') { i++; continue; } if (c === quote) quote = ''; continue; }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '(' || c === '[' || c === '{') depth++;
    else if (c === ')' || c === ']' || c === '}') depth--;
    else if (c === ',' && depth === 0) { out.push(text.slice(start, i).trim()); start = i + 1; }
  }
  out.push(text.slice(start).trim());
  return out;
}

function rangeFromArgs(text) {
  const args = callArgs(text).filter((a) => !/^["'`]/.test(a));
  const nums = args.map((a) => numbers(a)).filter((n) => n.length === 1).map((n) => n[0]);
  if (nums.length < 2) return { min: undefined, max: undefined, value: undefined };
  return { min: nums[nums.length - 2], max: nums[nums.length - 1], value: nums[0] };
}

function itemList(text) {
  const vals = String(text || '').match(/["'`]([^"'`\n]{1,80})["'`]/g) || [];
  return vals.map(unquote).filter(Boolean).slice(0, 24);
}

/** Guess the input format. */
export function detectSourceKind(text) {
  const s = String(text || '');
  if (s.trim().startsWith('{') || s.trim().startsWith('[')) return 'json';
  if (/\bpostMessage\s*\(|\bsubmenu\s*:|\bcheckbox\s*:\s*\{|\bslider\s*:\s*\{/i.test(s)) return 'js';
  if (/ImGui::|\bui::|ImVec4|AddFontFromFileTTF|VK_INSERT/i.test(s)) return 'cpp';
  if (/ImGui\.|\bKv\.|new\s+Vector2|using\s+ImGuiNET/i.test(s)) return 'csharp';
  if (/\bui\.(?:slider|button|checkbox|input_text)|imgui-rs|&mut\s+\w+/i.test(s)) return 'rust';
  if (/<html|<\/?(?:div|input|button|select|script)\b|document\.|localStorage/i.test(s)) return 'web';
  if (/^\s*[-*]\s+|^\s*\d+\.\s+/m.test(s)) return 'text';
  return 'text';
}

function collectArrays(src) {
  const map = new Map();
  let m;
  ARRAY_RE.lastIndex = 0;
  while ((m = ARRAY_RE.exec(src))) {
    const vals = itemList(m[2]);
    if (vals.length > 1) map.set(m[1], vals);
  }
  // JS/JSON-style arrays: const items = ['a','b'] or "items": ["a","b"]
  const re2 = /(?:const\s+|let\s+|var\s+|["']?items["']?\s*:\s*)?([A-Za-z_$][\w$]*)\s*[:=]\s*\[([^\]]{2,400})\]/g;
  while ((m = re2.exec(src))) {
    const vals = itemList(m[2]);
    if (vals.length > 1 && !map.has(m[1])) map.set(m[1], vals);
  }
  return map;
}

function colourFromRgb(nums) {
  const n = nums.filter((x) => Number.isFinite(x));
  const rgb = n.length >= 4 ? n.slice(n.length >= 4 ? 1 : 0) : n;
  if (rgb.length < 3) return '';
  const scale = rgb.slice(0, 3).some((x) => x > 1) ? 255 : 255;
  const ch = rgb.slice(0, 3).map((x) => Math.round(Math.max(0, Math.min(1, x / scale)) * 255));
  return '#' + ch.map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function extractPalette(src) {
  const out = [];
  const push = (c) => {
    if (/^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(c) && !out.includes(c)) out.push(c.toUpperCase());
  };
  for (const m of src.matchAll(/#[0-9a-fA-F]{6}\b/g)) push(m[0]);
  for (const m of src.matchAll(/\b(?:ImColor|ImVec4|Color)=\s*(?:\w+\s*,\s*)?([-\d.,\s]+)\)/g)) {
    const c = colourFromRgb(numbers(m[1])); if (c) push(c);
  }
  for (const m of src.matchAll(/\bRgb\s*\([^)]*\)|\brgba?\(\s*([\d.,\s]+)\)/gi)) {
    const c = colourFromRgb(numbers(m[1] || m[0])); if (c) push(c);
  }
  return out.slice(0, 24);
}

// filename/token -> canonical FONT id from model.js
const FONT_CSS_FALLBACK = {
  material: 'materialIcons', materialicons: 'materialIcons', outfit: 'outfit',
  inter: 'inter', montserrat: 'montserrat', poppins: 'poppins', roboto: 'roboto',
  opensans: 'openSans', lato: 'lato', nunito: 'nunito', rubik: 'rubik',
  rajdhani: 'rajdhani', orbitron: 'orbitron', oswald: 'oswald', ubuntu: 'ubuntu',
  noto: 'noto', jetbrains: 'jetbrains', firacode: 'firaCode', cascadia: 'cascadia',
  sourcecode: 'sourceCode', segoe: 'segoe', verdana: 'verdana', consolas: 'consolas',
  tahoma: 'tahoma', arial: 'arial', impact: 'impact', georgia: 'georgia',
  times: 'times', trebuchet: 'trebuchet', comic: 'comic',
};

function matchFont(name) {
  const n = String(name || '').toLowerCase().replace(/[\s_-]/g, '');
  for (const [token, canonical] of Object.entries(FONT_CSS_FALLBACK)) {
    if (n.includes(token)) return canonical;
  }
  return null;
}

function extractFonts(src) {
  const out = [];
  const push = (hit) => { if (hit && !out.includes(hit)) out.push(hit); };
  for (const m of src.matchAll(/(?:AddFontFromFileTTF|AddFontFromMemoryTTF)\s*\(\s*["'`]([^"'`]+)/gi)) push(matchFont(m[1]));
  for (const m of src.matchAll(/font-family\s*:\s*["']?([A-Za-z][\w\s-]{1,30})/gi)) push(matchFont(m[1]));
  return out.slice(0, 8);
}

function extractLinks(src) {
  const out = [];
  const add = (u) => { const v = String(u || '').replace(/[),;]"']+$/, ''); if (v && !out.includes(v)) out.push(v); };
  for (const m of src.matchAll(/https?:\/\/[^\s"'<>)]+/gi)) add(m[0]);
  for (const m of src.matchAll(/\b(discord\.gg\/[A-Za-z0-9_-]+)/gi)) add('https://' + m[1]);
  return out.slice(0, 12);
}

function extractImages(src) {
  const out = [];
  for (const m of src.matchAll(/["'`]([^"'`\n]+\.(?:png|jpe?g|webp|gif|bmp|svg))["'`]/gi)) {
    if (!out.includes(m[1])) out.push(m[1]);
  }
  return out.slice(0, 16);
}

function feature(type, label, extra = {}) {
  return {
    type, label: String(label || '').slice(0, 80) || type,
    min: undefined, max: undefined, value: undefined, options: [],
    page: '', confidence: 0.8, ...extra,
  };
}

/** Extract a structured feature list from any supported menu source. */
export function extractFeatures(input) {
  const raw = typeof input === 'string' ? input : String(input?.text || input?.source || '');
  const kind = input && typeof input === 'object' && !Array.isArray(input) && input.kind
    ? input.kind : detectSourceKind(raw);
  const src = stripComments(raw);
  const arrays = collectArrays(src);
  const resolveItems = (token) => {
    const t = String(token || '').trim();
    if (arrays.has(t)) return arrays.get(t);
    return itemList(t);
  };
  const features = [];
  const pages = [];
  const pageMarkers = [];
  let title = '';
  let window = null;
  const setPage = (name, index = 0) => {
    const n = unquote(name);
    if (!n) return;
    if (!pages.includes(n)) pages.push(n);
    pageMarkers.push({ name: n, index });
  };
  const add = (f, index = 0) => features.push({ ...f, page: f.page || '', _at: index });

  if (kind === 'json' || (typeof input === 'object' && input && !Array.isArray(input) && input.items)) {
    const root = typeof input === 'object' ? input : (() => { try { return JSON.parse(raw); } catch { return {}; } })();
    title = root.title || root.name || '';
    if (root.window) window = { w: Number(root.window.width) || undefined, h: Number(root.window.height) || undefined };
    const walk = (node, page) => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) { for (const v of node) walk(v, page); return; }
      const t = String(node.type || node.widget || node.kind || '').toLowerCase();
      const label = node.label || node.text || node.title || node.name || t;
      if (TAB_WORDS.test(t) || (Array.isArray(node.pages) && node.pages.length)) {
        for (const p of (node.pages || node.items || [])) {
          if (typeof p === 'string') { if (!pages.includes(p)) pages.push(p); }
          else { const n = String(p.name || p.title || ''); if (n && !pages.includes(n)) pages.push(n); walk(p, n); }
        }
        return;
      }
      const w = KIND_WIDGET[t];
      if (w) {
        const opts = Array.isArray(node.options) ? node.options : Array.isArray(node.items) ? node.items : resolveItems(node.values || '');
        add(feature(w, label, {
          min: Number(node.min), max: Number(node.max), value: node.value ?? node.default,
          options: opts.map((x) => (typeof x === 'object' ? x.label || x.name || String(x) : String(x))),
          url: node.url, key: node.key, color: node.color, page, confidence: 0.95,
        }));
      }
      for (const [k, v] of Object.entries(node)) if (!['type', 'widget', 'kind'].includes(k)) walk(v, page);
    };
    walk(root, '');
  } else if (kind === 'js') {
    // Object-literal menu trees (Nexus-style controller files).
    for (const m of src.matchAll(/(?:const|let|var)\s+\w*Menu\s*=\s*\{/gi)) {
      const win = src.slice(m.index, m.index + 160);
      const hit = win.match(/label\s*:\s*["'`]([^"'`]+)["'`]/i);
      if (hit) setPage(unquote(hit[1]), m.index);
    }
    for (const m of src.matchAll(/\bname\s*:\s*["'`]([^"'`]{1,60})["'`]/g)) {
      const win = src.slice(m.index, m.index + 320);
      const label = unquote(m[1]);
      if (/\bseparator\s*:/.test(win)) add(feature('separator', label), m.index);
      else if (/\bcheckbox\s*:/.test(win)) add(feature('check', label), m.index);
      else if (/\bslider\s*:/.test(win)) {
        const opts = [...win.matchAll(/\blabel\s*:\s*["'`]([^"'`]{1,50})["'`]/g)].map((x) => unquote(x[1]));
        if (opts.length) add(feature('combo', label, { options: opts }), m.index);
        else add(feature('slider', label, { min: 0, max: 100 }), m.index);
      } else if (/\bbutton\s*:/.test(win)) add(feature('button', label), m.index);
      else if (/\bsubmenu\s*:/.test(win)) add(feature('panel', label), m.index);
    }
    title = unquote((src.match(/\b(?:label|name)\s*:\s*["'`]([^"'`]{1,40})["'`]/i) || [])[1]) || title;
  } else if (kind === 'web') {
    title = (raw.match(/<title>([^<]+)<\/title>/i) || [])[1] || title;
    const tagRe = /<(button|input|select|textarea|label|h[1-6])\b([^>]*)>([\s\S]{0,120}?)<\/\1>|<input\b([^>]*)\/?>/gi;
    const labelFrom = (attrs, inner) => unquote(
      (attrs.match(/(?:placeholder|aria-label|title|name|value)\s*=\s*["']([^"']+)["']/i) || [])[1]
      || (inner || '').replace(/<[^>]+>/g, ' ').trim()
    ) || 'Control';
    for (const m of src.matchAll(tagRe)) {
      const tag = (m[1] || 'input').toLowerCase();
      const attrs = m[2] || m[4] || '';
      const inner = m[3] || '';
      const type = (attrs.match(/type\s*=\s*["']([^"']+)["']/i) || [])[1] || '';
      const label = labelFrom(attrs, inner);
      if (tag === 'input' && /range/i.test(type)) {
        add(feature('slider', label, { min: Number((attrs.match(/min\s*=\s*["']?(-?[\d.]+)/i) || [])[1] ?? 0), max: Number((attrs.match(/max\s*=\s*["']?(-?[\d.]+)/i) || [])[1] ?? 100) }));
      } else if (tag === 'input' && /checkbox|radio/i.test(type)) add(feature('check', label));
      else if (tag === 'input' && /color/i.test(type)) add(feature('color', label));
      else if (tag === 'select') add(feature('combo', label, { options: itemList(inner) }));
      else if (tag === 'button') add(feature('button', label));
      else if (/h[1-6]/.test(tag)) add(feature('heading', label));
      else if (tag === 'label') add(feature('text', label));
    }
    for (const m of src.matchAll(/\{\s*type\s*:\s*['"]([\w-]+)['"]([^}]{0,240})\}/gi)) {
      const t = KIND_WIDGET[m[1].toLowerCase()] || (m[1] === 'range' ? 'slider' : null);
      if (!t) continue;
      const body = m[2];
      const label = unquote((body.match(/(?:label|text|name)\s*:\s*['"]([^'"]+)['"]/i) || [])[1]) || m[1];
      add(feature(t, label, {
        min: Number((body.match(/\bmin\s*:\s*(-?[\d.]+)/i) || [])[1]),
        max: Number((body.match(/\bmax\s*:\s*(-?[\d.]+)/i) || [])[1]),
        options: itemList((body.match(/(?:options|items)\s*:\s*\[([^\]]*)\]/i) || [])[1] || ''),
      }));
    }
  } else {
    // C++ / C# / Rust / plain text — one pattern family with optional prefixes.
    title = (src.match(/\bBegin\s*\(\s*["'`]([^"'`]{1,60})["'`]/i) || [])[1]
      || (src.match(/\b(?:Title|WindowTitle|name)\s*[:=]\s*["'`]([^"'`]+)["'`]/i) || [])[1] || '';
    const size = numbers((src.match(/SetNextWindowSize\s*\(([^)]*)\)/i) || [])[1] || '');
    if (size.length >= 2) window = { w: size[0], h: size[1] };

    for (const m of src.matchAll(/\b(?:BeginTabItem|TopTab|NavItem|SelectTab|Tab)\s*\([^)]*?["'`]([A-Z][\w /-]{1,28})["'`]\s*(?:,|\))/gi)) setPage(m[1], m.index);
    for (const m of src.matchAll(/tab_labels\s*\[[^\]]*\]\s*=\s*\{([^}]*)\}/gi)) for (const p of itemList(m[1])) if (!pages.includes(p)) pages.push(p);
    for (const m of src.matchAll(/tabs\s*:\s*\[([^\]]+)\]/gi)) for (const p of itemList(m[1])) if (!pages.includes(p)) pages.push(p);
    // Function boundaries such as PageWeapon()/DrawRadar() also mark page regions.
    for (const m of src.matchAll(/\b(?:void|auto|fn|function)\s+(?:pages::|menu::)?(?:draw_|page_|Page|Draw|Render)?([A-Z]\w{2,24})\s*\(/g)) {
      const pg = pages.find((p) => p.toLowerCase() === m[1].toLowerCase());
      if (pg) setPage(pg, m.index);
    }

    const rules = [
      [/\b(?:ui::)?(?:SliderFloat|SliderInt|slider_float|slider|Slider)\s*\(\s*["'`]([^"'`]{1,70})["'`]([\s\S]{0,220}?)\)/gi, (m) => {
        const r = rangeFromArgs(m[2]);
        return feature('slider', m[1], {
          min: r.min ?? 0, max: r.max ?? 100,
          value: r.value ?? 0, confidence: 0.9,
        });
      }],
      [/\b(?:ImGui\.)?Slider(?:Float|Int)?\s*\(\s*["'`]([^"'`]+)["'`]\s*,\s*[^,]+,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)/gi, (m) => feature('slider', m[1], { min: Number(m[2]), max: Number(m[3]) })],
      [/\b(?:ui::)?(?:Checkbox|Check|checkbox|CheckBox)\s*\(\s*["'`]([^"'`]{1,70})["'`]/gi, (m) => feature('check', m[1])],
      [/\b(?:ImGui\.)?(?:Button|button)\s*\(\s*["'`]([^"'`]{1,70})["'`]/gi, (m) => feature('button', m[1])],
      [/\b(?:ui::)?(?:MultiCombo|multi_combo)\s*\(\s*["'`]([^"'`]*)["'`][\s\S]{0,220}?,\s*&?(\w+)\s*,/gi, (m) => feature('multi', unquote(m[1]) || 'Selection', { options: resolveItems(m[2]) })],
      [/\b(?:ui::)?(?:Combo|combo|Select|ListBox|list_box)\s*\(\s*["'`]([^"'`]{1,70})["'`][\s\S]{0,260}?,\s*&?(\w+)\s*,/gi, (m) => feature('combo', unquote(m[1]), { options: resolveItems(m[2]) })],
      [/\b(?:ui::)?(?:KeyBox|Keybind|keybind|Hotkey)\s*\(\s*["'`]([^"'`]{1,70})["'`]/gi, (m) => feature('key', unquote(m[1]))],
      [/\b(?:ui::)?(?:Swatch|ColorPicker|color_picker|ColorEdit)\s*\([^)]*?["'`]([A-Z][\w /-]{1,40})["'`]\s*\)/gi, (m) => feature('color', m[1])],
      [/\b(?:ui::)?(?:Swatch|ColorPicker|color_picker|ColorEdit)\s*\(\s*["'`]([^"'`]{1,70})["'`]/gi, (m) => feature('color', unquote(m[1]) || 'Color')],
      [/\b(?:ui::)?(?:InputField|InputText|input_text)\s*\(\s*["'`]([^"'`]{1,70})["'`]/gi, (m) => feature('input', unquote(m[1]))],
      [/\b(?:ui::)?(?:Label|StrongLabel|Text|TextUnformatted|text|Hint|Quiet)\s*\(\s*["'`]([^"'`]{1,80})["'`]/gi, (m) => feature('text', m[1])],
      [/\b(?:ui::)?Panel\s*\([^)]*?["'`]([^"'`]{1,60})["'`]\s*\)/gi, (m) => feature('panel', m[1])],
      [/\b(?:Button|button)\s*\(\s*["'`]([^"'`]+)["'`][^)]*\)\s*\)?\s*(?:{|=>)/gi, (m) => feature('button', m[1])],
    ];
    for (const [re, make] of rules) for (const m of src.matchAll(re)) {
      try { add(make(m), m.index); } catch { /* skip malformed match */ }
    }
    // Plain-text shorthand: "Slider: Name [0-100]", "- [x] Toggle", "Button: Name".
    let offset = 0;
    for (const line of src.split(/\n/)) {
      const at = offset; offset += line.length + 1;
      const t = line.trim().replace(/^[-*#\d.)\s]+/, '');
      if (!t || t.length > 120) continue;
      const m = t.match(/^([\w -]{2,18})\s*:\s*(.+)$/);
      if (!m) continue;
      const type = KIND_WIDGET[m[1].toLowerCase().replace(/\s/g, '')];
      if (!type) continue;
      const range = m[2].match(/\[\s*(-?[\d.]+)?\s*(?:-|to|..)\s*(-?[\d.]+)?\s*\]/i);
      add(feature(type, unquote(m[2].replace(/\[[^\]]*\]/, '')), {
        min: range ? Number(range[1] ?? 0) : undefined,
        max: range ? Number(range[2] ?? 100) : undefined,
        options: itemList((m[2].match(/\(([^)]*)\)/) || [])[1] || ''),
      }), at);
    }
  }

  // Assign each feature to the page marker that last preceded it in the source.
  // This keeps widgets on the tab where they were declared instead of piling
  // everything onto whichever tab happened to be found last.
  if (kind !== 'json' && kind !== 'web' && pageMarkers.length) {
    const markers = pageMarkers.slice().sort((a, b) => a.index - b.index);
    for (const f of features) {
      const at = f._at ?? 0;
      let pg = '';
      for (const mk of markers) { if (mk.index <= at) pg = mk.name; else break; }
      f.page = pg || pages[0] || '';
    }
  }
  for (const f of features) delete f._at;

  // De-duplicate by type + label, keeping the highest-confidence entry.
  const seen = new Map();
  for (const f of features) {
    const k = f.type + '|' + f.label.toLowerCase();
    if (!seen.has(k) || (seen.get(k).confidence || 0) < (f.confidence || 0)) seen.set(k, f);
  }
  const clean = [...seen.values()];

  return {
    format: VISION_FORMAT, version: VISION_VERSION, kind,
    title: unquote(title) || 'Imported menu',
    window, tabs: pages, features: clean,
    palette: extractPalette(src), fonts: extractFonts(src),
    links: extractLinks(src), images: extractImages(src),
    sourceLength: raw.length,
  };
}

function safeId(label, prefix, used) {
  const base = (String(label || '').replace(/[^A-Za-z0-9_]/g, '_').replace(/^_+|_+$/g, '') || prefix).toLowerCase();
  let id = base.length > 32 ? base.slice(0, 32) : base;
  if (!/^[a-z_]/.test(id)) id = prefix + '_' + id;
  let n = 2;
  while (used.has(id)) id = base + '_' + n++;
  used.add(id);
  return id;
}

/** Turn extracted features into a normal editable project. */
export function visionProject(input, options = {}) {
  const info = input && input.format === VISION_FORMAT ? input : extractFeatures(input);
  const name = String(options.name || info.title || 'Imported menu').slice(0, 60);
  const project = createProject({
    name,
    type: options.type || 'loader',
    language: options.language || 'cpp',
    backend: options.backend || 'dx11',
  });
  if (info.window?.w) project.window.width = Math.max(320, Math.min(1920, Math.round(info.window.w)));
  if (info.window?.h) project.window.height = Math.max(240, Math.min(1200, Math.round(info.window.h)));
  project.window.title = name;
  project.titlebar.title = name;
  if (info.palette?.length >= 2) {
    project.style.accent = info.palette[0];
    project.style.accent2 = info.palette[1] || project.style.accent2;
  }
  if (info.fonts?.length) project.style.font = info.fonts[0];

  const hasPages = (info.features || []).some((f) => f.page);
  const pageNames = hasPages && info.tabs?.length ? info.tabs : ['Main'];
  const used = new Set();
  project.pages = [];
  pageNames.forEach((pn, i) => {
    const page = createPage('page_' + (i + 1), pn);
    project.pages.push(page);
    let x = 20, y = 20;
    for (const f of info.features.filter((v) => !v.page || v.page === pn || pageNames.length === 1)) {
      const type = KIND_WIDGET[f.type] || 'text';
      let w;
      try { w = createWidget(type, safeId(f.label, type, used), x, y); } catch (e) { continue; }
      w.text = String(f.label || w.text).slice(0, 80);
      if (type === 'slider' && f.min !== undefined && f.max !== undefined && f.max > f.min) {
        w.props.min = Number(f.min); w.props.max = Number(f.max);
        w.props.value = Math.max(f.min, Math.min(f.max, Number(f.value ?? f.min)));
      }
      if (['combo', 'list', 'tabs'].includes(type) && f.options?.length) w.text = f.options.join('|');
      if (type === 'hotkey' && f.key) w.props.key = String(f.key);
      if (type === 'colorpicker' && f.color) w.props.value = f.color;
      if (type === 'text') w.props.fontSize = f.type === 'heading' ? 20 : 14;
      const isLink = /discord|support|link|website|url|invite/i.test(f.label) || /^https?:/i.test(f.url || '');
      if (type === 'button' && isLink) {
        const url = f.url || info.links?.find((u) => /discord/i.test(u)) || info.links?.[0];
        if (url) {
          w.actions.push({ type: 'open_url', url });
          w.text = /discord/i.test(f.label) ? 'Discord Support' : w.text;
        }
      }
      w.anim = { type: 'slideUp', delay: Math.min(0.4, (y % 120) / 300), duration: 0.4 };
      page.widgets.push(w);
      x += w.w + 16;
      if (x + 180 > project.window.width) { x = 20; y += w.h + 12; }
      if (y > project.window.height - 60) { x = 20; y = 20; }
    }
  });
  project.startPage = project.pages[0]?.id || 'page_1';
  if (info.images?.length) project.assets = info.images.map((file, i) => ({ id: 'img_' + (i + 1), file, type: 'image' }));
  return { project, info };
}

/** Human-readable summary used by the AI panel and reports. */
export function visionSummary(info) {
  const counts = {};
  for (const f of info.features || []) counts[f.type] = (counts[f.type] || 0) + 1;
  const parts = Object.entries(counts).map(([k, v]) => `${v} ${k}${v > 1 ? 's' : ''}`);
  return `Detected ${info.kind} menu "${info.title}": ${parts.join(', ') || 'no controls'}; `
    + `${(info.tabs || []).length} tab(s), ${(info.palette || []).length} colors, `
    + `${(info.fonts || []).length} fonts, ${(info.links || []).length} links, ${(info.images || []).length} images.`;
}
