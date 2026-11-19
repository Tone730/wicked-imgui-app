// premade.js — editable templates derived from the attached archives.
// Every template is a normal Wicked project: open it, edit any control, change
// any colour, export it. Sources were analysed statically only; nothing from
// the archives was executed. The Eon entry is an *approximation* built from the
// structurally-identical sibling projects because its archive is password
// protected (see `approximate` / `note`).
import { createProject, createPage, createWidget, applyPreset } from './model.js';

const W = (type, id, text, x, y, props = {}, extra = {}) => {
  const w = createWidget(type, id, x, y);
  w.text = text;
  if (props && Object.keys(props).length) w.props = { ...w.props, ...props };
  if (extra.anim) w.anim = extra.anim;
  if (extra.w) w.w = extra.w;
  if (extra.h) w.h = extra.h;
  return w;
};
const fade = (i) => ({ type: 'slideUp', delay: Math.min(0.6, i * 0.035), duration: 0.45 });

function base(name, palette, font, w, h, language = 'cpp') {
  const p = createProject({ name, type: 'loader', language, backend: 'dx11' });
  applyPreset(p, 'wicked');
  p.window.width = w; p.window.height = h;
  p.window.title = name; p.titlebar.title = name;
  p.style = {
    ...p.style,
    accent: palette.accent, accent2: palette.accent2 || palette.accent,
    bg: palette.bg, frame: palette.frame, text: palette.text,
    border: palette.border, font, fontSize: 16,
  };
  p.background = { ...p.background, effect: 'none' };
  return p;
}

function addPage(p, id, name, widgets) {
  const page = createPage(id, name);
  page.widgets = widgets;
  p.pages.push(page);
  return page;
}

/* ------------------------------ Hackermarket ----------------------------- */
function hackermarket() {
  const p = base('Hackermarket UI', {
    accent: '#BE352D', accent2: '#CC4239', bg: '#19151D',
    frame: '#201D24', text: '#BAB8BB', border: '#211D25',
  }, 'outfit', 700, 500);
  p.pages = [];
  addPage(p, 'hm_weapon', 'Weapon', [
    W('tabs', 'hm_wtabs', 'Shotgun|Assault Rifle|SMG|Sniper|Pistol', 20, 14, {}, { w: 660 }),
    W('panel', 'hm_aim', 'Aimbot', 20, 58, {}, { w: 316, h: 210 }),
    W('checkbox', 'hm_aim_en', 'Aimbot Enabled', 36, 88, {}, { anim: fade(0) }),
    W('checkbox', 'hm_aim_pred', 'Aimbot Prediction', 36, 118, {}, { anim: fade(1) }),
    W('slider', 'hm_smooth', 'Aimbot Smoothing', 36, 148, { min: 5, max: 100, value: 5.8, decimals: 1 }, { w: 280, anim: fade(2) }),
    W('slider', 'hm_fov', 'Weapon Aim Fov', 36, 198, { min: 0, max: 800, value: 648.9, decimals: 1 }, { w: 280, anim: fade(3) }),
    W('slider', 'hm_dist', 'Aimbot Max Distance', 36, 248, { min: 0, max: 400, value: 20.6 }, { w: 280, anim: fade(4) }),
    W('checkbox', 'hm_trig', 'Triggerbot Enabled', 364, 88, {}, { anim: fade(5) }),
    W('slider', 'hm_trig_dly', 'Triggerbot Delay', 364, 148, { min: 0, max: 600, value: 10 }, { w: 280, anim: fade(6) }),
    W('checkbox', 'hm_vis', 'Visible Check', 364, 198, {}, { anim: fade(7) }),
    W('checkbox', 'hm_dyn', 'Dynamic FOV', 364, 228, {}, { anim: fade(8) }),
    W('hotkey', 'hm_key', 'Aimbot Key', 364, 268, { key: 'Mouse4' }, { anim: fade(9) }),
    W('panel', 'hm_gun', 'Weapon', 20, 282, {}, { w: 660, h: 190 }),
    W('combo', 'hm_gun_slot', 'Weapon Slot', 36, 312, {}, { w: 280 }),
    W('colorpicker', 'hm_fov_col', 'FOV Colour', 364, 312, { value: '#FFFFFF' }),
    W('text', 'hm_note', 'UI remake — placeholder controls only.', 36, 372, { fontSize: 12 }),
  ]);
  addPage(p, 'hm_visuals', 'Visuals', [
    W('tabs', 'hm_vtabs', 'Players|Radar|World|Settings', 20, 14, {}, { w: 660 }),
    W('panel', 'hm_player', 'Players', 20, 58, {}, { w: 316, h: 300 }),
    W('checkbox', 'hm_box', 'Player Box', 36, 88, {}, { anim: fade(0) }),
    W('combo', 'hm_box_type', 'Box Type', 36, 118, {}, { w: 280 }),
    W('checkbox', 'hm_skel', 'Player Skeleton', 36, 168, { value: true }, { anim: fade(1) }),
    W('checkbox', 'hm_name', 'Player Name', 36, 198, { value: true }),
    W('checkbox', 'hm_dist', 'Player Distance', 36, 228, { value: true }),
    W('colorpicker', 'hm_vis_col', 'Visible Color', 36, 268, { value: '#53CEFC' }),
    W('colorpicker', 'hm_hid_col', 'Hidden Color', 36, 308, { value: '#FFFFFF' }),
    W('panel', 'hm_radar', 'Radar / World', 352, 58, {}, { w: 328, h: 300 }),
    W('checkbox', 'hm_radar_en', 'Enable Radar', 368, 88, { value: true }),
    W('combo', 'hm_radar_shape', 'Radar Shape', 368, 118, {}, { w: 296 }),
    W('slider', 'hm_radar_size', 'Radar Size', 368, 168, { min: 100, max: 500, value: 250 }, { w: 296 }),
    W('slider', 'hm_radar_range', 'Radar Range', 368, 218, { min: 50, max: 500, value: 150 }, { w: 296 }),
    W('checkbox', 'hm_chests', 'Show Chests', 368, 268, { value: true }),
    W('colorpicker', 'hm_world_col', 'World Text Color', 368, 308, { value: '#F7BD31' }),
  ]);
  addPage(p, 'hm_settings', 'Settings', [
    W('tabs', 'hm_stabs', 'Menu|Configs|About', 20, 14, {}, { w: 660 }),
    W('panel', 'hm_menu', 'Menu', 20, 58, {}, { w: 660, h: 180 }),
    W('slider', 'hm_scale', 'Menu Scale', 36, 88, { min: 80, max: 150, value: 100, suffix: '%' }, { w: 620 }),
    W('checkbox', 'hm_anim', 'Animations', 36, 138, { value: true }),
    W('checkbox', 'hm_top', 'Keep On Top', 36, 168),
    W('checkbox', 'hm_fps', 'Show FPS', 360, 138),
    W('panel', 'hm_colours', 'Colours', 20, 252, {}, { w: 660, h: 160 }),
    W('colorpicker', 'hm_accent', 'Accent Color', 36, 282, { value: '#BE352D' }),
    W('colorpicker', 'hm_text', 'Text Color', 260, 282, { value: '#BAB8BB' }),
    W('colorpicker', 'hm_bg', 'Background Color', 484, 282, { value: '#19151D' }),
    W('button', 'hm_reset', 'Reset Colors', 36, 344),
    W('button', 'hm_close', 'Close Menu', 484, 344),
    W('button', 'hm_discord', 'Discord Support', 260, 344),
  ]);
  p.startPage = 'hm_weapon';
  p.fonts = [
    { name: 'Outfit Medium', file: 'assets/fonts/Outfit-Medium.ttf', license: 'OFL-1.1' },
    { name: 'Outfit SemiBold', file: 'assets/fonts/Outfit-SemiBold.ttf', license: 'OFL-1.1' },
    { name: 'Material Icons', file: 'assets/fonts/MaterialIcons-Regular.ttf', license: 'Apache-2.0' },
  ];
  return p;
}

/* ------------------------------- Fragment -------------------------------- */
function fragment() {
  const p = base('Fragment Remake', {
    accent: '#3C6ECD', accent2: '#5A8BE0', bg: '#151515',
    frame: '#1F1F1F', text: '#EBF0F7', border: '#252525',
  }, 'verdana', 600, 640);
  p.pages = [];
  addPage(p, 'fr_aim', 'Aimbot', [
    W('panel', 'fr_p1', 'Aimbot', 16, 16, {}, { w: 274, h: 180 }),
    W('checkbox', 'fr_enable', 'Enable', 30, 48, { value: true }, { anim: fade(0) }),
    W('hotkey', 'fr_key', 'Keybind', 30, 88, { key: 'Insert' }, { anim: fade(1) }),
    W('panel', 'fr_p2', 'Smoothness', 302, 16, {}, { w: 282, h: 180 }),
    W('slider', 'fr_str', 'Strength', 316, 48, { min: 0, max: 100, value: 40, decimals: 1 }, { w: 254, anim: fade(2) }),
    W('panel', 'fr_p3', 'Hitparts', 16, 208, {}, { w: 274, h: 200 }),
    W('combo', 'fr_body', 'Bodypart', 30, 240, {}, { w: 246 }),
    W('list', 'fr_multi', 'Multi bodyparts', 30, 280, {}, { w: 246 }),
    W('list', 'fr_cfg', 'Config list', 30, 330, {}, { w: 246, h: 68 }),
    W('panel', 'fr_p4', 'Hacks', 302, 208, {}, { w: 282, h: 200 }),
    W('button', 'fr_norecoil', 'No recoil', 316, 240, {}, { w: 254, anim: fade(3) }),
    W('button', 'fr_notify', 'Test notification', 316, 282, {}, { w: 254, anim: fade(4) }),
  ]);
  addPage(p, 'fr_vis', 'Visuals', [
    W('panel', 'fr_v1', 'Visuals Panel 1', 16, 16, {}, { w: 274, h: 180 }),
    W('text', 'fr_vt1', 'Visuals ready', 30, 48),
    W('panel', 'fr_v2', 'Visuals Panel 2', 302, 16, {}, { w: 282, h: 180 }),
    W('checkbox', 'fr_esp', 'Player ESP', 316, 48, { value: true }),
    W('panel', 'fr_v3', 'Visuals Panel 3', 16, 208, {}, { w: 274, h: 200 }),
    W('slider', 'fr_espd', 'ESP Distance', 30, 240, { min: 10, max: 300, value: 80 }, { w: 246 }),
    W('panel', 'fr_v4', 'Visuals Panel 4', 302, 208, {}, { w: 282, h: 200 }),
    W('colorpicker', 'fr_espc', 'ESP Color', 316, 240, { value: '#3C6ECD' }),
  ]);
  addPage(p, 'fr_misc', 'Misc', [
    W('panel', 'fr_m1', 'Widget previews', 16, 16, {}, { w: 274, h: 200 }),
    W('input', 'fr_inp', 'Preview input', 30, 48, {}, { w: 246 }),
    W('checkbox', 'fr_chk', 'Preview checkbox', 30, 88, { value: true }),
    W('colorpicker', 'fr_col', 'Colour', 30, 128),
    W('panel', 'fr_m2', 'Notifications', 302, 16, {}, { w: 282, h: 200 }),
    W('button', 'fr_push', 'Push notification', 316, 48, {}, { w: 254 }),
    W('progress', 'fr_prog', 'Progress', 316, 100, { value: 0.65 }, { w: 254 }),
  ]);
  addPage(p, 'fr_settings', 'Settings', [
    W('panel', 'fr_s1', 'Window Styling', 16, 16, {}, { w: 568, h: 200 }),
    W('colorpicker', 'fr_accent', 'Accent color', 30, 48, { value: '#3C6ECD' }),
    W('combo', 'fr_font', 'Font', 300, 48, {}, { w: 260 }),
    W('checkbox', 'fr_outline', 'Text outline', 30, 108, { value: true }),
    W('slider', 'fr_tsize', 'Text Size', 300, 108, { min: 10, max: 24, value: 16 }, { w: 260 }),
    W('text', 'fr_footer', 'welcome back, kito | [ roblox ]', 30, 160, { fontSize: 12 }),
  ]);
  p.startPage = 'fr_aim';
  p.fonts = [
    { name: 'Verdana Regular', embedded: 'font_verdana_regular', size: 16, license: 'bundled' },
    { name: 'Verdana Bold', embedded: 'font_verdana_bold', size: 16, license: 'bundled' },
  ];
  return p;
}

/* --------------------------------- Nexus --------------------------------- */
function nexus() {
  const p = base('Nexus Menu', {
    accent: '#E74C3C', accent2: '#FF6B5B', bg: '#141414',
    frame: '#1E1E1E', text: '#FFFFFF', border: '#333333',
  }, 'inter', 760, 560, 'cpp');
  p.pages = [];
  const pages = [
    ['nx_player', 'Player', [
      ['checkbox', 'Godmode', { value: true }], ['checkbox', 'Invisible'],
      ['checkbox', 'Infinite Stamina', { value: true }], ['checkbox', 'Super Jump'],
      ['checkbox', 'Fast Run'], ['checkbox', 'Never Wanted', { value: true }],
      ['header', 'Stats'], ['combo', 'Movement Speed', {}, 'Normal (1.0x)|Fast (1.5x)|Super (2.0x)|Flash (5.0x)'],
      ['button', 'Heal Player'], ['button', 'Max Armor'], ['button', 'Suicide'],
    ]],
    ['nx_server', 'Server', [
      ['header', 'World'], ['combo', 'Weather', {}, 'Clear|Rain|Thunder|Snow|Fog'],
      ['combo', 'Time Of Day', {}, 'Morning|Noon|Evening|Night'],
      ['checkbox', 'Freeze Time'], ['header', 'Session'],
      ['button', 'Players Online'], ['button', 'Announce Message'], ['button', 'Server Info'],
    ]],
    ['nx_weapon', 'Weapon', [
      ['checkbox', 'Infinite Ammo', { value: true }], ['checkbox', 'No Recoil', { value: true }],
      ['checkbox', 'No Spread'], ['checkbox', 'Rapid Fire'], ['header', 'Damage'],
      ['combo', 'Damage Multiplier', {}, '1x (Normal)|2x Damage|5x Damage|10x Instakill'],
      ['checkbox', 'Explosive Bullets'], ['button', 'Give All Weapons'], ['button', 'Remove Weapons'],
    ]],
    ['nx_dyn', 'Dynamic Triggers', [
      ['checkbox', 'Enable Triggers', { value: true }], ['checkbox', 'Auto Trigger'],
      ['header', 'Config'], ['combo', 'Trigger Delay', {}, '0.5 Seconds|1 Second|2 Seconds|5 Seconds'],
      ['combo', 'Trigger Radius', {}, 'Small|Medium|Large'],
      ['button', 'Fire Trigger'], ['button', 'Reset Triggers'],
    ]],
    ['nx_vehicle', 'Vehicle', [
      ['checkbox', 'Vehicle Godmode', { value: true }], ['checkbox', 'Auto Flip Over', { value: true }],
      ['checkbox', 'Horn Boost'], ['header', 'Performance'],
      ['combo', 'Engine Multiplier', {}, 'Normal (100%)|Sport (150%)|Race (250%)|Insane (500%)'],
      ['button', 'Repair Vehicle'], ['button', 'Clean Vehicle'], ['button', 'Change Plate Text'], ['button', 'Delete Vehicle'],
    ]],
    ['nx_misc', 'Miscellaneous', [
      ['checkbox', 'Player ESP (Box)', { value: true }], ['checkbox', 'Player Skeleton', { value: true }],
      ['checkbox', 'Distance Info', { value: true }], ['checkbox', 'Health / Armor Bars', { value: true }],
      ['checkbox', 'Snaplines'], ['header', 'Movement'], ['checkbox', 'Noclip'],
      ['checkbox', 'Custom Crosshair', { value: true }], ['button', 'Teleport to Waypoint'],
    ]],
    ['nx_settings', 'Settings', [
      ['combo', 'Theme Color', {}, 'Red|Blue|Green|Purple|Gold'],
      ['checkbox', 'Play Audio Clicks', { value: true }], ['checkbox', 'Show Keybinds', { value: true }],
      ['hotkey', 'Menu Keybind', { key: 'Insert' }], ['header', 'Data'],
      ['button', 'Reset All Configs'], ['button', 'Save Config'], ['button', 'Discord Support'],
    ]],
    ['nx_vip', 'VIP Features', [
      ['checkbox', 'VIP Godmode', { value: true }], ['checkbox', 'Priority Queue', { value: true }],
      ['button', 'Money Drop'], ['button', 'Spawn Super Car'], ['header', 'Exclusive'],
      ['combo', 'VIP Vehicle', {}, 'Adder|Zentorno|T20|Nero'], ['button', 'Set Crew Tag'],
    ]],
  ];
  pages.forEach(([id, name, defs], pi) => {
    const widgets = defs.map((d, i) => {
      const [type, label, props = {}, text] = d;
      const w = W(type, `nx_${pi}_${i}`, text || label, 20, 20 + i * 42, props, { anim: fade(i), w: type === 'header' ? 700 : 700 });
      if (type === 'button' && /discord/i.test(label)) w.actions.push({ type: 'open_url', url: 'https://discord.gg/example' });
      return w;
    });
    addPage(p, id, name, widgets);
  });
  p.startPage = 'nx_player';
  p.assets = [
    { id: 'nx_banner', type: 'image', name: 'banner.png', file: 'https://iili.io/K0WlPlR.png', mime: 'image/png' },
  ];
  p.fonts = [
    { name: 'Inter', source: 'Google Fonts', license: 'OFL-1.1' },
    { name: 'Poppins', source: 'Google Fonts', license: 'OFL-1.1' },
  ];
  return p;
}

/* ---------------------------- Eon-style (approx) -------------------------- */
function eonStyle() {
  const p = base('Eon-style Remake', {
    accent: '#8B5CF6', accent2: '#A78BFA', bg: '#121016',
    frame: '#1B1722', text: '#E8E6EC', border: '#2A2432',
  }, 'outfit', 700, 500);
  p.pages = [];
  addPage(p, 'eon_main', 'Main', [
    W('tabs', 'eon_tabs', 'Combat|Visuals|Player|Settings', 20, 14, {}, { w: 660 }),
    W('panel', 'eon_p1', 'Combat', 20, 58, {}, { w: 316, h: 300 }),
    W('checkbox', 'eon_aim', 'Aimbot', 36, 88, { value: true }, { anim: fade(0) }),
    W('slider', 'eon_smooth', 'Smoothing', 36, 128, { min: 1, max: 20, value: 5 }, { w: 280, anim: fade(1) }),
    W('slider', 'eon_fov', 'FOV', 36, 178, { min: 0, max: 800, value: 180 }, { w: 280, anim: fade(2) }),
    W('checkbox', 'eon_trigger', 'Triggerbot', 36, 228, {}, { anim: fade(3) }),
    W('hotkey', 'eon_key', 'Aimbot Key', 36, 268, { key: 'Insert' }),
    W('panel', 'eon_p2', 'Visuals', 352, 58, {}, { w: 328, h: 300 }),
    W('checkbox', 'eon_esp', 'ESP', 368, 88, { value: true }),
    W('combo', 'eon_box', 'Box Type', 368, 128, {}, { w: 296 }),
    W('colorpicker', 'eon_col', 'Accent', 368, 178, { value: '#8B5CF6' }),
    W('slider', 'eon_dist', 'Render Distance', 368, 228, { min: 10, max: 500, value: 200 }, { w: 296 }),
    W('panel', 'eon_p3', 'Settings', 20, 372, {}, { w: 660, h: 108 }),
    W('slider', 'eon_scale', 'Menu Scale', 36, 400, { min: 80, max: 150, value: 100, suffix: '%' }, { w: 620 }),
    W('button', 'eon_discord', 'Support', 520, 448),
  ]);
  p.startPage = 'eon_main';
  return p;
}

export const PREMADE_TEMPLATES = [
  {
    id: 'hackermarket', name: 'Hackermarket UI', author: 'Syntax (UI remake)',
    description: 'Dark 700×500 external menu with red accent, Outfit + Material Icons, Weapon/Visuals/Settings tabs. Editable.',
    tags: ['dark', 'red', 'external', 'outfit', 'icons'], size: [700, 500],
    approximate: false, build: hackermarket,
  },
  {
    id: 'fragment', name: 'Fragment Remake', author: 'kito (UI remake)',
    description: 'Dark charcoal overlay with blue accent, Verdana fonts, 2×2 panel grid, Aimbot/Visuals/Misc/Settings tabs.',
    tags: ['dark', 'blue', 'verdana', 'grid', 'overlay'], size: [600, 640],
    approximate: false, build: fragment,
  },
  {
    id: 'nexus', name: 'Nexus Menu', author: 'Nexus (UI preview)',
    description: 'Translucent dark game-style menu with 8 submenus, discrete sliders, Inter font, banner and live-list styling.',
    tags: ['dark', 'red', 'inter', 'submenus', 'web'], size: [760, 560],
    approximate: false, build: nexus,
  },
  {
    id: 'eon-style', name: 'Eon-style Remake', author: 'Wicked (approximation)',
    description: 'Violet-accent external menu inspired by the sibling Fortnite UI Syntax projects. Exact Eon assets were unavailable (archive password protected).',
    tags: ['dark', 'violet', 'external', 'approximate'], size: [700, 500],
    approximate: true,
    note: 'The supplied Eon archive is encrypted. This is an approximation from structurally-identical sibling projects; supply the password for exact fidelity.',
    build: eonStyle,
  },
];

export function buildPremade(id) {
  const t = PREMADE_TEMPLATES.find((x) => x.id === id);
  if (!t) throw new Error('Unknown premade template: ' + id);
  return t.build();
}

export function premadeInfo() {
  return PREMADE_TEMPLATES.map(({ build, ...meta }) => meta);
}
