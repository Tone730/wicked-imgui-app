// menus.js - reusable overlay-menu system for Wicked ImGui Maker.
//
// A "menu" is a structured definition (title, toggle key, style, categories and
// items) that can be applied to any project. Applying a menu creates real pages
// and widgets using the existing widget/codegen pipeline, so exported C++/C#/Rust
// projects stay buildable without any new runtime dependency. Menus can also be
// saved to a local library and reused across projects.
import { createProject, createPage, createWidget, uid, clone } from './model.js';

export const MENU_FORMAT = 'wicked-menu';
export const MENU_VERSION = 1;

// Preset menu layouts. Each preset describes default categories and the widget
// type used for each item kind, so menus feel different but stay compatible.
export const MENU_TYPES = {
  trainer: {
    label: 'Trainer', icon: 'zap',
    description: 'Grouped toggles and sliders — the classic in-game trainer layout.',
    layout: 'tabbed', itemWidgets: { toggle: 'switch', slider: 'slider', button: 'button', combo: 'combo', label: 'text' },
    categories: [
      { id: 'player', name: 'Player', items: [
        { id: 'godmode', label: 'God Mode', type: 'toggle' },
        { id: 'speed', label: 'Move Speed', type: 'slider', value: 1, min: 0.5, max: 5 },
        { id: 'health', label: 'Infinite Health', type: 'toggle' },
      ] },
      { id: 'weapons', name: 'Weapons', items: [
        { id: 'ammo', label: 'Infinite Ammo', type: 'toggle' },
        { id: 'damage', label: 'Damage Multiplier', type: 'slider', value: 1, min: 1, max: 10 },
      ] },
      { id: 'teleport', name: 'Teleport', items: [
        { id: 'tp_save', label: 'Save Position', type: 'button' },
        { id: 'tp_load', label: 'Load Position', type: 'button' },
      ] },
    ],
  },
  dashboard: {
    label: 'Dashboard', icon: 'layout-dashboard',
    description: 'Stat cards and lists — good for status and telemetry overlays.',
    layout: 'grid', itemWidgets: { toggle: 'checkbox', slider: 'progress', button: 'button', combo: 'combo', label: 'stat' },
    categories: [
      { id: 'status', name: 'Status', items: [
        { id: 'fps', label: 'FPS', type: 'label', value: '60' },
        { id: 'ping', label: 'Ping', type: 'label', value: '24 ms' },
        { id: 'session', label: 'Session', type: 'label', value: 'Active' },
      ] },
      { id: 'controls', name: 'Controls', items: [
        { id: 'overlay', label: 'Show Overlay', type: 'toggle' },
        { id: 'opacity', label: 'Opacity', type: 'slider', value: 80, min: 10, max: 100 },
      ] },
    ],
  },
  sidebar: {
    label: 'Sidebar', icon: 'layout-sidebar',
    description: 'Vertical navigation with a content panel per category.',
    layout: 'sidebar', itemWidgets: { toggle: 'switch', slider: 'slider', button: 'button', combo: 'combo', label: 'text' },
    categories: [
      { id: 'general', name: 'General', items: [
        { id: 'enabled', label: 'Enabled', type: 'toggle' },
        { id: 'theme', label: 'Accent', type: 'combo', value: 'Wicked' },
      ] },
      { id: 'visuals', name: 'Visuals', items: [
        { id: 'esp', label: 'ESP', type: 'toggle' },
        { id: 'glow', label: 'Glow Strength', type: 'slider', value: 50, min: 0, max: 100 },
      ] },
    ],
  },
  tabbed: {
    label: 'Tabbed', icon: 'tabs',
    description: 'Horizontal tabs with a page of options per tab.',
    layout: 'tabbed', itemWidgets: { toggle: 'checkbox', slider: 'slider', button: 'button', combo: 'combo', label: 'text' },
    categories: [
      { id: 'main', name: 'Main', items: [
        { id: 'on', label: 'Enabled', type: 'toggle' },
        { id: 'level', label: 'Level', type: 'slider', value: 3, min: 1, max: 10 },
      ] },
      { id: 'misc', name: 'Misc', items: [
        { id: 'note', label: 'Notes', type: 'label', value: 'Configure me' },
      ] },
    ],
  },
  hud: {
    label: 'HUD', icon: 'monitor',
    description: 'Compact always-on readout with minimal controls.',
    layout: 'hud', itemWidgets: { toggle: 'checkbox', slider: 'progress', button: 'button', combo: 'combo', label: 'stat' },
    categories: [
      { id: 'readout', name: 'Readout', items: [
        { id: 'status', label: 'Status', type: 'label', value: 'Online' },
        { id: 'uptime', label: 'Uptime', type: 'label', value: '00:00' },
        { id: 'load', label: 'Load', type: 'slider', value: 25, min: 0, max: 100 },
      ] },
    ],
  },
  settings: {
    label: 'Settings', icon: 'settings',
    description: 'Organised settings groups with toggles, sliders and dropdowns.',
    layout: 'sidebar', itemWidgets: { toggle: 'switch', slider: 'slider', button: 'button', combo: 'combo', label: 'text' },
    categories: [
      { id: 'display', name: 'Display', items: [
        { id: 'vsync', label: 'VSync', type: 'toggle' },
        { id: 'quality', label: 'Quality', type: 'combo', value: 'High' },
      ] },
      { id: 'audio', name: 'Audio', items: [
        { id: 'sound', label: 'Sound', type: 'toggle' },
        { id: 'volume', label: 'Volume', type: 'slider', value: 70, min: 0, max: 100 },
      ] },
    ],
  },
  combat: {
    label: 'Combat', icon: 'zap',
    description: 'Combat-focused categories with aim and visual toggles.',
    layout: 'tabbed', itemWidgets: { toggle: 'switch', slider: 'slider', button: 'button', combo: 'combo', label: 'text' },
    categories: [
      { id: 'aim', name: 'Aim', items: [
        { id: 'aimbot', label: 'Aimbot', type: 'toggle' },
        { id: 'fov', label: 'FOV', type: 'slider', value: 30, min: 1, max: 180 },
      ] },
      { id: 'visuals', name: 'Visuals', items: [
        { id: 'esp', label: 'ESP', type: 'toggle' },
        { id: 'team', label: 'Team Check', type: 'toggle' },
      ] },
    ],
  },
  minimal: {
    label: 'Minimal', icon: 'square',
    description: 'A clean single-page menu with just the essentials.',
    layout: 'hud', itemWidgets: { toggle: 'checkbox', slider: 'slider', button: 'button', combo: 'combo', label: 'text' },
    categories: [
      { id: 'main', name: 'Menu', items: [
        { id: 'enabled', label: 'Enabled', type: 'toggle' },
        { id: 'close', label: 'Close', type: 'button' },
      ] },
    ],
  },
};

export const MENU_ITEM_TYPES = ['toggle', 'slider', 'button', 'combo', 'label'];
export const MENU_LAYOUTS = ['tabbed', 'sidebar', 'grid', 'hud'];
export const MENU_TOGGLE_KEYS = ['Insert', 'Home', 'F1', 'F2', 'F5', 'F8', 'F9', 'F11', 'Tab', 'Backquote'];

/** Build a menu definition from a preset id or a partial definition. */
export function createMenu({ type = 'trainer', name, title, key = 'Insert', style = 'modern', categories } = {}) {
  const preset = MENU_TYPES[type] || MENU_TYPES.trainer;
  return {
    format: MENU_FORMAT,
    version: MENU_VERSION,
    id: uid('menu_'),
    type: MENU_TYPES[type] ? type : 'trainer',
    name: name || preset.label + ' Menu',
    title: title || preset.label,
    key,
    style,
    layout: preset.layout,
    categories: clone(categories || preset.categories),
  };
}

/** Validate/normalize a menu definition loaded from disk or the library. */
export function normalizeMenu(menu) {
  const m = menu && typeof menu === 'object' ? clone(menu) : createMenu();
  m.format = MENU_FORMAT;
  m.version = MENU_VERSION;
  m.id = m.id || uid('menu_');
  m.type = MENU_TYPES[m.type] ? m.type : 'trainer';
  m.name = String(m.name || m.title || 'Menu');
  m.title = String(m.title || m.name);
  m.key = String(m.key || 'Insert');
  m.style = String(m.style || 'modern');
  const preset = MENU_TYPES[m.type];
  m.layout = MENU_LAYOUTS.includes(m.layout) ? m.layout : preset.layout;
  const cats = Array.isArray(m.categories) ? m.categories : preset.categories;
  m.categories = cats.map((c, ci) => ({
    id: String(c.id || 'cat' + ci),
    name: String(c.name || 'Category ' + (ci + 1)),
    items: (Array.isArray(c.items) ? c.items : []).map((it, ii) => ({
      id: String(it.id || 'item' + ii),
      label: String(it.label || it.id || 'Item ' + (ii + 1)),
      type: MENU_ITEM_TYPES.includes(it.type) ? it.type : 'toggle',
      ...(it.value !== undefined ? { value: it.value } : {}),
      ...(it.min !== undefined ? { min: it.min } : {}),
      ...(it.max !== undefined ? { max: it.max } : {}),
      ...(it.action ? { action: it.action } : {}),
    })),
  }));
  return m;
}

/**
 * Apply a menu to a project. Replaces pages with one page per category and
 * creates widgets from the menu items using the preset's item-widget mapping.
 * The menu definition is stored on project.menu so save/export round-trips it.
 */
export function applyMenuToProject(project, menu) {
  const m = normalizeMenu(menu);
  const preset = MENU_TYPES[m.type];
  const map = preset.itemWidgets;
  const p = project && typeof project === 'object' ? project : createProject({ name: m.name, type: 'loader' });
  if (!p.window || !p.titlebar) {
    const base = createProject({ name: m.name, type: p.type || 'loader' });
    if (!p.window) p.window = base.window;
    if (!p.titlebar) p.titlebar = base.titlebar;
  }
  p.type = p.type || 'loader';
  p.menu = m;
  p.pages = m.categories.map((c, ci) => {
    const page = createPage(c.id, c.name);
    if (m.layout === 'hud' || m.layout === 'grid') {
      const cols = m.layout === 'grid' ? 3 : 1;
      c.items.forEach((it, ii) => {
        const type = it.type === 'label' && map.label === 'stat' ? 'stat' : (map[it.type] || 'text');
        const w = createWidget(type, 'mi_' + it.id, 20 + (ii % cols) * 180, 40 + Math.floor(ii / cols) * 56, { text: it.label });
        if (type === 'slider' && typeof it.value === 'number') w.props.value = it.value;
        if (type === 'stat' && it.value !== undefined) w.text = String(it.value);
        page.widgets.push(w);
      });
    } else {
      const y0 = m.layout === 'sidebar' ? 56 : 44;
      c.items.forEach((it, ii) => {
        const type = map[it.type] || 'text';
        const w = createWidget(type, 'mi_' + it.id, m.layout === 'sidebar' ? 150 : 24, y0 + ii * 54, { text: it.label });
        if (type === 'slider' && typeof it.value === 'number') w.props.value = it.value;
        if (type === 'combo' && it.value !== undefined) w.text = String(it.value);
        page.widgets.push(w);
      });
      if (m.layout === 'sidebar' || m.layout === 'tabbed') {
        c.items.forEach((it, ii) => {
          const tab = createWidget('button', 'mt_' + c.id + '_' + ii, 16 + ii * 104, 12, { text: c.name + (c.items.length > 1 ? ' ' + (ii + 1) : '') });
          page.widgets.push(tab);
        });
      }
    }
    return page;
  });
  if (!p.pages.length) p.pages = [createPage('main', 'Menu')];
  p.startPage = p.pages[0].id;
  p.window.title = m.title;
  if (p.titlebar) p.titlebar.title = m.title;
  p.modified = Date.now();
  return p;
}

/** Extract a menu definition from a project (or null if it has none). */
export function menuFromProject(project) {
  return project && project.menu ? normalizeMenu(project.menu) : null;
}

/** Serialize/deserialize for the menu library and .wickedmenu.json files. */
export function serializeMenu(menu) {
  return JSON.stringify(normalizeMenu(menu), null, 2);
}
export function parseMenu(text) {
  const m = JSON.parse(text);
  if (!m || m.format !== MENU_FORMAT) throw new Error('Not a Wicked menu file.');
  return normalizeMenu(m);
}
export function menuFileName(menu) {
  return (String(menu.name || 'menu').replace(/[^a-z0-9_-]+/gi, '-').toLowerCase() || 'menu') + '.wickedmenu.json';
}

/** Generate an overlay-menu source snippet for the given language. */
export function menuSource(menu, language = 'cpp') {
  const m = normalizeMenu(menu);
  const lines = [];
  const key = m.key.replace(/"/g, '\\"');
  if (language === 'cpp') {
    lines.push('// @menu ' + m.id);
    lines.push('// Wicked overlay menu — ' + m.name + ' (toggle: ' + m.key + ')');
    lines.push('#include "kavro.h"');
    lines.push('');
    lines.push('static bool wickedMenuOpen_' + sanitize(m.id) + ' = false;');
    lines.push('static void WickedMenuFrame_' + sanitize(m.id) + '() {');
    lines.push('  if (kv::Pressed("' + key + '")) wickedMenuOpen_' + sanitize(m.id) + ' = !wickedMenuOpen_' + sanitize(m.id) + ';');
    lines.push('  if (!wickedMenuOpen_' + sanitize(m.id) + ') return;');
    lines.push('  kv::BeginMenuWindow("' + escape(m.title) + '");');
    for (const c of m.categories) {
      lines.push('  if (kv::MenuTab("' + escape(c.name) + '")) {');
      for (const it of c.items) {
        if (it.type === 'toggle') lines.push('    kv::MenuToggle("' + escape(it.id) + '", "' + escape(it.label) + '");');
        else if (it.type === 'slider') lines.push('    kv::MenuSlider("' + escape(it.id) + '", "' + escape(it.label) + '", ' + (Number(it.min) || 0) + ', ' + (Number(it.max) || 100) + ');');
        else if (it.type === 'combo') lines.push('    kv::MenuCombo("' + escape(it.id) + '", "' + escape(it.label) + '");');
        else if (it.type === 'button') lines.push('    if (kv::MenuButton("' + escape(it.id) + '", "' + escape(it.label) + '")) { /* ' + escape(it.action || 'action') + ' */ }');
        else lines.push('    kv::MenuLabel("' + escape(it.label) + '");');
      }
      lines.push('  }');
    }
    lines.push('  kv::EndMenuWindow();');
    lines.push('}');
    lines.push('// @endmenu');
  } else if (language === 'csharp') {
    lines.push('// @menu ' + m.id);
    lines.push('// Wicked overlay menu — ' + m.name + ' (toggle: ' + m.key + ')');
    lines.push('namespace KavroApp;');
    lines.push('public static class WickedMenu_' + sanitize(m.id));
    lines.push('{');
    lines.push('  private static bool open = false;');
    lines.push('  public static void Frame() {');
    lines.push('    if (Kv.Pressed("' + key + '")) open = !open;');
    lines.push('    if (!open) return;');
    lines.push('    Kv.BeginMenuWindow("' + escape(m.title) + '");');
    for (const c of m.categories) {
      lines.push('    if (Kv.MenuTab("' + escape(c.name) + '")) {');
      for (const it of c.items) {
        if (it.type === 'toggle') lines.push('      Kv.MenuToggle("' + escape(it.id) + '", "' + escape(it.label) + '");');
        else if (it.type === 'slider') lines.push('      Kv.MenuSlider("' + escape(it.id) + '", "' + escape(it.label) + '", ' + (Number(it.min) || 0) + 'f, ' + (Number(it.max) || 100) + 'f);');
        else if (it.type === 'combo') lines.push('      Kv.MenuCombo("' + escape(it.id) + '", "' + escape(it.label) + '");');
        else if (it.type === 'button') lines.push('      if (Kv.MenuButton("' + escape(it.id) + '", "' + escape(it.label) + '")) { /* action */ }');
        else lines.push('      Kv.MenuLabel("' + escape(it.label) + '");');
      }
      lines.push('    }');
    }
    lines.push('    Kv.EndMenuWindow();');
    lines.push('  }');
    lines.push('}');
    lines.push('// @endmenu');
  } else {
    lines.push('// @menu ' + m.id);
    lines.push('// Wicked overlay menu — ' + m.name + ' (toggle: ' + m.key + ')');
    lines.push('use crate::kavro::Kavro;');
    lines.push('use imgui::Ui;');
    lines.push('use std::sync::atomic::{AtomicBool, Ordering};');
    lines.push('');
    lines.push('static WICKED_MENU_OPEN: AtomicBool = AtomicBool::new(false);');
    lines.push('pub fn wicked_menu_frame(k: &mut Kavro, ui: &Ui) {');
    lines.push('  if k.pressed("' + key + '") { let was = WICKED_MENU_OPEN.load(Ordering::Relaxed); WICKED_MENU_OPEN.store(!was, Ordering::Relaxed); }');
    lines.push('  if !WICKED_MENU_OPEN.load(Ordering::Relaxed) { return; }');
    lines.push('  k.begin_menu_window(ui, "' + escape(m.title) + '");');
    for (const c of m.categories) {
      lines.push('  if k.menu_tab(ui, "' + escape(c.name) + '") {');
      for (const it of c.items) {
        if (it.type === 'toggle') lines.push('    k.menu_toggle(ui, "' + escape(it.id) + '", "' + escape(it.label) + '");');
        else if (it.type === 'slider') lines.push('    k.menu_slider(ui, "' + escape(it.id) + '", "' + escape(it.label) + '", ' + (Number(it.min) || 0) + 'f32, ' + (Number(it.max) || 100) + 'f32);');
        else if (it.type === 'combo') lines.push('    k.menu_combo(ui, "' + escape(it.id) + '", "' + escape(it.label) + '");');
        else if (it.type === 'button') lines.push('    if k.menu_button(ui, "' + escape(it.id) + '", "' + escape(it.label) + '") { /* action */ }');
        else lines.push('    k.menu_label(ui, "' + escape(it.label) + '");');
      }
      lines.push('  }');
    }
    lines.push('  k.end_menu_window(ui);');
    lines.push('}');
    lines.push('// @endmenu');
  }
  return lines.join('\n');
}
/** Generate an extra source file for a project's attached menu (or null). */
export function menuFile(project, language = 'cpp') {
  const menu = project && project.menu;
  if (!menu) return null;
  const paths = { cpp: 'menu.cpp', csharp: 'Menu.cs', rust: 'src/menu.rs' };
  const lang = paths[language] ? language : 'cpp';
  const header = lang === 'cpp'
    ? '// menu.cpp — generated overlay menu. Call WickedMenuFrame_<id>() once per frame.\n'
    : lang === 'csharp'
      ? '// Menu.cs — generated overlay menu. Call WickedMenu_<id>.Frame() once per frame.\n'
      : '// menu.rs — generated overlay menu. Call wicked_menu_frame() once per frame.\n';
  return { path: paths[lang], content: header + menuSource(menu, lang) + '\n', lang };
}

const escape = s => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
const sanitize = s => String(s).replace(/[^A-Za-z0-9_]/g, '_');
