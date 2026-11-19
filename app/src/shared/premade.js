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
  if (!Array.isArray(w.actions)) w.actions = [];
  // Template code chains `W(...).actions.push(action)`. Array#push returns the
  // new length, which would turn the widget into a number in the widget array.
  // Return the widget instead; non-enumerable keeps JSON/structuredClone clean.
  Object.defineProperty(w.actions, 'push', {
    value: function (...items) { Array.prototype.push.apply(this, items); return w; },
    configurable: true, writable: true, enumerable: false,
  });
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

/* ------------------------------ Kali.dev Loader --------------------------- */
function kaliLoader() {
  const p = base('Kali.dev Loader', {
    accent: '#FFFFFF', accent2: '#F6F6F9', bg: '#131318',
    frame: '#16161D', text: '#ECECF1', border: '#FFFFFF14',
  }, 'segoe', 760, 560);
  applyPreset(p, 'kali-dark');
  p.pages = [];
  const chrome = (suffix) => [
    W('text', `kc_brand${suffix}`, 'KALI.DEV OR UR BRAND', 30, 26, { fontSize: 30, bold: true, color: '#15151B' }, { w: 360 }),
    W('text', `kc_sub${suffix}`, 'YOUR TXT ', 31, 64, { fontSize: 12, color: '#4A4A56', letterSpacing: 2.2 }, { w: 300 }),
    W('text', `kc_foot${suffix}`, 'UR TXT', 26, 522, { fontSize: 12, color: '#4A4A56' }, { w: 200 }),
    W('text', `kc_ver${suffix}`, 'SECURE // KALI.DEV v2.0.1', 470, 520, { fontSize: 12, color: '#4A4A56', align: 'right' }, { w: 264 }),
    W('iconbutton', `kc_min${suffix}`, '─', 676, 8, { glyph: 'circle', fontSize: 18 }, { w: 34, h: 28 }).actions.push({ type: 'minimize' }),
    W('iconbutton', `kc_close${suffix}`, '✕', 714, 8, { glyph: 'circle', fontSize: 16 }, { w: 34, h: 28 }).actions.push({ type: 'close' }),
  ];
  addPage(p, 'kali_signin', 'Sign In', [
    ...chrome('_si'),
    W('tabs', 'kc_tabs_si', 'SIGN IN|SIGN UP', 226, 146, { selected: 0, fontSize: 13, bold: true, letterSpacing: 1.6 }, { w: 308, h: 44 }),
    W('panel', 'kc_card_si', 'Sign In', 200, 120, {}, { w: 360, h: 412 }),
    W('input', 'kc_user', 'Username', 226, 216, { placeholder: 'Username', fontSize: 17 }, { w: 308, h: 40, anim: fade(0) }),
    W('password', 'kc_pass', 'Password', 226, 272, { placeholder: 'Password', showToggle: true, fontSize: 17 }, { w: 308, h: 40, anim: fade(1) }),
    W('button', 'kc_login', 'LOGIN', 226, 332, { fontSize: 13, bold: true, letterSpacing: 1.6, variant: 'filled' }, { w: 308, h: 48, anim: fade(2) }).actions.push(
      { type: 'login', user: 'demo', pass: 'demo', error: 'Invalid username or password.', page: 'kali_dashboard' }),
    W('button', 'kc_forgot', 'Forgot password? Contact support', 226, 464,
      { variant: 'link', fontSize: 12, color: '#8A8A98' }, { w: 308, h: 20 }).actions.push(
      { type: 'toast', text: 'Kali.dev support: support@kali.dev', kind: 'info' }),
    W('text', 'kc_msg', '', 226, 412, { fontSize: 12, align: 'center', color: '#8A8A98' }, { w: 308 }),
    W('button', 'kc_goto_su', 'SIGN UP', 226, 190, { variant: 'ghost', fontSize: 11 }, { w: 308, h: 24 }).actions.push({ type: 'goto', page: 'kali_signup' }),
  ]);
  addPage(p, 'kali_signup', 'Sign Up', [
    ...chrome('_su'),
    W('tabs', 'kc_tabs_su', 'SIGN IN|SIGN UP', 226, 146, { selected: 1, fontSize: 13, bold: true, letterSpacing: 1.6 }, { w: 308, h: 44 }),
    W('panel', 'kc_card_su', 'Sign Up', 200, 120, {}, { w: 360, h: 412 }),
    W('input', 'kc_su_key', 'KALI-XXXX-XXXX-XXXX', 226, 216, { placeholder: 'KALI-XXXX-XXXX-XXXX', fontSize: 17 }, { w: 308, h: 40, anim: fade(0) }),
    W('input', 'kc_su_user', 'Username', 226, 270, { placeholder: 'Username', fontSize: 17 }, { w: 308, h: 40, anim: fade(1) }),
    W('password', 'kc_su_pass', 'Password (min 6 chars)', 226, 324, { placeholder: 'Password (min 6 chars)', showToggle: true, fontSize: 17 }, { w: 308, h: 40, anim: fade(2) }),
    W('password', 'kc_su_pass2', 'Repeat the password', 226, 378, { placeholder: 'Repeat the password', showToggle: true, fontSize: 17 }, { w: 308, h: 40, anim: fade(3) }),
    W('button', 'kc_su_btn', 'CREATE ACCOUNT', 226, 432, { fontSize: 13, bold: true, letterSpacing: 1.6, variant: 'filled' }, { w: 308, h: 48, anim: fade(4) }).actions.push(
      { type: 'toast', text: 'Account created! Please sign in.', kind: 'success' }),
    W('text', 'kc_su_msg', '', 226, 498, { fontSize: 12, align: 'center', color: '#57E396' }, { w: 308 }),
    W('button', 'kc_goto_si', 'SIGN IN', 226, 190, { variant: 'ghost', fontSize: 11 }, { w: 308, h: 24 }).actions.push({ type: 'goto', page: 'kali_signin' }),
  ]);
  addPage(p, 'kali_dashboard', 'Dashboard', [
    ...chrome('_db'),
    W('panel', 'kc_card_db', 'Dashboard', 200, 120, {}, { w: 360, h: 412 }),
    W('avatar', 'kc_avatar', 'W', 226, 146, { shape: 'circle', bg: '#FFFFFF', textColor: '#15151B', fontSize: 22 }, { w: 46, h: 46 }),
    W('text', 'kc_welcome', 'WELCOME BACK', 284, 152, { fontSize: 16, bold: true, letterSpacing: 2.4 }, { w: 260 }),
    W('button', 'kc_logout', 'LOG OUT', 462, 146, { variant: 'link', fontSize: 12, letterSpacing: 1.4, color: '#8A8A98' }, { w: 72, h: 30 }).actions.push({ type: 'goto', page: 'kali_signin' }),
    W('text', 'kc_plan_l', 'PLAN', 226, 212, { fontSize: 12, color: '#8A8A98' }, { w: 120 }),
    W('text', 'kc_plan_v', 'LIFETIME', 414, 212, { fontSize: 12, color: '#ECECF1', align: 'right' }, { w: 120 }),
    W('text', 'kc_key_l', 'KEY', 226, 246, { fontSize: 12, color: '#8A8A98' }, { w: 120 }),
    W('text', 'kc_key_v', 'KALI-****-****-****', 354, 246, { fontSize: 12, align: 'right' }, { w: 180 }),
    W('text', 'kc_exp_l', 'EXPIRES', 226, 280, { fontSize: 12, color: '#8A8A98' }, { w: 120 }),
    W('text', 'kc_exp_v', 'NEVER', 414, 280, { fontSize: 12, color: '#57E396', align: 'right' }, { w: 120 }),
    W('button', 'kc_launch', 'LAUNCH', 226, 366, { fontSize: 13, bold: true, letterSpacing: 1.6, variant: 'filled' }, { w: 308, h: 48, anim: fade(0) }).actions.push(
      { type: 'load', seconds: 3, page: 'kali_dashboard' }),
    W('text', 'kc_loading', 'LOADING', 226, 424, { fontSize: 12, letterSpacing: 2 }, { w: 200 }),
    W('text', 'kc_pct', '0%', 444, 424, { fontSize: 12, align: 'right' }, { w: 90 }),
    W('progress', 'kc_bar', 'Progress', 226, 442, { value: 0, rounding: 4, fill: '#FFFFFF', track: '#FFFFFF14', showText: false }, { w: 308, h: 8 }),
    W('text', 'kc_status', 'Press LAUNCH to start the demo loader', 226, 460, { fontSize: 12, letterSpacing: 2, color: '#8A8A98' }, { w: 308 }),
  ]);
  p.startPage = 'kali_signin';
  p.fonts = [
    { name: 'Segoe UI', source: 'C:/Windows/Fonts/segoeui.ttf', license: 'system' },
    { name: 'Segoe UI Semibold', source: 'C:/Windows/Fonts/seguisb.ttf', license: 'system' },
  ];
  return p;
}

/* ------------------------------- Cloudy UI -------------------------------- */
function cloudyUi() {
  const p = base('Cloudy UI', {
    accent: '#0A9BF5', accent2: '#13967C', bg: '#FCFDFD',
    frame: '#FFFFFF', text: '#181A1D', border: '#E9ECEF',
  }, 'poppins', 900, 580);
  applyPreset(p, 'cloudy-light');
  p.pages = [];
  addPage(p, 'cloudy_welcome', 'welcome back', [
    W('text', 'cy_title', 'cloudyspoofer.cc', 26, 12, { fontSize: 19, bold: true, color: '#1C1E22' }, { w: 300, h: 30 }),
    W('iconbutton', 'cy_close', '✕', 850, 5, { glyph: 'circle', fontSize: 16 }, { w: 36, h: 36 }).actions.push({ type: 'close' }),
    W('panel', 'cy_art', 'no artwork yet', 20, 45, { bg: '#F8F9FB', border: '#EBEEF1' }, { w: 410, h: 535 }),
    W('text', 'cy_art_hint', 'drop a png/jpg on the window, or save it as assets\\miku.png', 44, 500, { fontSize: 12, color: '#ACB4BE' }, { w: 370 }),
    W('text', 'cy_heading', 'welcome back', 460, 105, { fontSize: 43, bold: true }, { w: 420, h: 60 }),
    W('text', 'cy_sub', 'Please sing in to continue', 460, 160, { fontSize: 18, color: '#6B7280' }, { w: 420 }),
    W('text', 'cy_user_l', 'USERNAME', 460, 250, { fontSize: 13, letterSpacing: 0.7, align: 'right', color: '#9CA3AF' }, { w: 380 }),
    W('input', 'cy_user', 'Enter your username', 460, 272, { placeholder: 'Enter your username', fontSize: 20, bg: 'transparent', border: '#E2E6E9' }, { w: 380, h: 52, anim: fade(0) }),
    W('text', 'cy_pass_l', 'PASSWORD', 460, 340, { fontSize: 13, letterSpacing: 0.7, align: 'right', color: '#9CA3AF' }, { w: 380 }),
    W('password', 'cy_pass', 'Enter your password', 460, 362, { placeholder: 'Enter your password', showToggle: true, fontSize: 20, bg: 'transparent', border: '#E2E6E9' }, { w: 380, h: 68, anim: fade(1) }),
    W('checkbox', 'cy_remember', 'Remember me', 460, 448, { value: true, fontSize: 18, color: '#6B7280' }, { anim: fade(2) }),
    W('button', 'cy_signin', 'sign in', 460, 486, { variant: 'filled', fontSize: 21, bold: true, bg: '#0A9BF5', rounding: 28 }, { w: 380, h: 56, anim: fade(3) }).actions.push({ type: 'goto', page: 'cloudy_spoofer' }),
  ]);
  addPage(p, 'cloudy_spoofer', 'spoofer', [
    W('text', 'cy_title2', 'cloudyspoofer.cc', 26, 12, { fontSize: 19, bold: true, color: '#1C1E22' }, { w: 300, h: 30 }),
    W('iconbutton', 'cy_close2', '✕', 850, 5, { glyph: 'circle', fontSize: 16 }, { w: 36, h: 36 }).actions.push({ type: 'close' }),
    W('text', 'cy_heading2', 'spoofer', 40, 63, { fontSize: 42, bold: true }, { w: 400, h: 58 }),
    W('text', 'cy_sub2', 'Hardware Identifiers & Protection', 44, 122, { fontSize: 18, color: '#6B7280' }, { w: 520 }),
    W('text', 'cy_user2', 'User: smaxy', 660, 69, { fontSize: 18, align: 'right' }, { w: 200 }),
    W('text', 'cy_lic', 'License: Lifetime Unlimited', 560, 103, { fontSize: 18, color: '#13967C', align: 'right' }, { w: 300 }),
    W('panel', 'cy_card', 'Hardware IDs', 40, 178, { bg: '#FCFDFD', border: '#E8EBEE' }, { w: 820, h: 250 }),
    W('text', 'cy_r1l', 'Board Serial', 72, 200, { fontSize: 19 }, { w: 240 }),
    W('badge', 'cy_r1v', 'Not read yet', 470, 196, { bg: '#FFFFFF', border: '#DCE0E4' }, { w: 356, h: 40 }),
    W('text', 'cy_r2l', 'Volume Serial', 72, 258, { fontSize: 19 }, { w: 240 }),
    W('badge', 'cy_r2v', '5BC2-F2D7', 470, 254, { bg: '#FFFFFF', border: '#DCE0E4' }, { w: 356, h: 40 }),
    W('text', 'cy_r3l', 'MAC Address', 72, 316, { fontSize: 19 }, { w: 240 }),
    W('badge', 'cy_r3v', '02-8E-72-3B-36-C9', 470, 312, { bg: '#FFFFFF', border: '#DCE0E4' }, { w: 356, h: 40 }),
    W('text', 'cy_r4l', 'System UUID', 72, 374, { fontSize: 19 }, { w: 240 }),
    W('badge', 'cy_r4v', 'Not read yet', 470, 370, { bg: '#FFFFFF', border: '#DCE0E4' }, { w: 356, h: 40 }),
    W('button', 'cy_spoof', 'SPOOF', 40, 470, { variant: 'filled', fontSize: 21, bold: true, bg: '#0A9BF5', rounding: 28 }, { w: 396, h: 58, anim: fade(0) }).actions.push(
      { type: 'toast', text: 'SPOOF clicked - UI demo only, nothing on this machine is touched', kind: 'info' }),
    W('button', 'cy_clean', 'CLEAN', 464, 470, { variant: 'filled', fontSize: 21, bold: true, bg: '#0A9BF5', rounding: 28 }, { w: 396, h: 58, anim: fade(1) }).actions.push(
      { type: 'toast', text: 'CLEAN clicked - UI demo only, nothing on this machine is touched', kind: 'info' }),
  ]);
  p.startPage = 'cloudy_welcome';
  p.fonts = [
    { name: 'Poppins Regular', file: 'assets/fonts/Poppins-Regular.ttf', license: 'OFL-1.1' },
    { name: 'Poppins Medium', file: 'assets/fonts/Poppins-Medium.ttf', license: 'OFL-1.1' },
    { name: 'Poppins Bold', file: 'assets/fonts/Poppins-Bold.ttf', license: 'OFL-1.1' },
  ];
  return p;
}

/* -------------------------------- Givenchy -------------------------------- */
function givenchy() {
  const p = base('Givenchy Standalone Menu', {
    accent: '#FFD700', accent2: '#D8C06F', bg: '#141418',
    frame: '#17161B', text: '#FFFFFF', border: '#1E1D25',
  }, 'inter', 720, 445);
  applyPreset(p, 'givenchy-gold');
  p.pages = [];
  const topTabs = (sel) => W('tabs', `gv_tabs${sel}`, 'COMBAT|VISUALS|EXPLOITS|MISC', 0, 0,
    { selected: sel, fontSize: 12, letterSpacing: 0.5 }, { w: 720, h: 50 });
  const info = (tag, sub) => [
    W('text', `gv_dot${tag}`, '✛', 15, 58, { fontSize: 14, color: '#FFD700' }, { w: 20 }),
    W('text', `gv_tab${tag}`, tag, 38, 57, { fontSize: 15, bold: true }, { w: 160 }),
    W('text', `gv_sep${tag}`, '•', 158, 57, { fontSize: 14, color: '#FFD700' }, { w: 12 }),
    W('text', `gv_sub${tag}`, sub, 174, 57, { fontSize: 14, color: '#FFD700' }, { w: 260 }),
    W('iconbutton', `gv_gear${tag}`, '⚙', 682, 55, { glyph: 'circle', fontSize: 14 }, { w: 24, h: 24 }),
  ];
  addPage(p, 'gv_combat', 'Combat / Aimbot', [
    topTabs(0), ...info('Combat', 'Aimbot'),
    W('panel', 'gv_a1', 'Aimbot', 15, 95, {}, { w: 337, h: 176 }),
    W('checkbox', 'gv_aim_en', 'Enable Aimbot', 25, 120, { value: true }),
    W('combo', 'gv_aim_type', 'Aimbot Type', 25, 152, {}, { w: 310 }),
    W('checkbox', 'gv_sticky', 'Sticky Aim', 25, 190, {}),
    W('checkbox', 'gv_drawfov', 'Draw FOV', 25, 220, {}),
    W('hotkey', 'gv_aim_key', 'Aimbot key (press)', 25, 250, { key: 'Insert' }, { w: 310 }),
    W('panel', 'gv_a2', 'Aimbot Settings', 368, 95, {}, { w: 337, h: 176 }),
    W('combo', 'gv_hitbox', 'Target Hitbox', 378, 120, {}, { w: 310 }),
    W('slider', 'gv_fov', 'FOV Size', 378, 186, { min: 1, max: 1000, value: 180 }, { w: 310 }),
    W('slider', 'gv_smooth', 'Mouse Smooth', 378, 231, { min: 1, max: 100, value: 20 }, { w: 310 }),
    W('panel', 'gv_a3', 'Aimbot Checks', 15, 281, {}, { w: 337, h: 150 }),
    W('checkbox', 'gv_team', 'Team Check', 25, 306, { value: true }),
    W('checkbox', 'gv_wall', 'Wall Check', 25, 336, { value: true }),
    W('checkbox', 'gv_fovchk', 'FOV Check', 25, 366, { value: true }),
    W('checkbox', 'gv_ko', 'KO Check', 25, 396, { value: true }),
    W('panel', 'gv_a4', 'Prediction & Shake', 368, 281, {}, { w: 337, h: 150 }),
    W('slider', 'gv_predx', 'Mouse Prediction X', 378, 306, { min: 1, max: 20, value: 5 }, { w: 310 }),
    W('slider', 'gv_predy', 'Mouse Prediction Y', 378, 351, { min: 1, max: 20, value: 5 }, { w: 310 }),
    W('checkbox', 'gv_shake', 'Enable Shake', 378, 396, {}),
  ]);
  addPage(p, 'gv_silent', 'Combat / Silent', [
    topTabs(0), ...info('Combat', 'Silent'),
    W('panel', 'gv_s1', 'Silent', 15, 95, {}, { w: 690, h: 130 }),
    W('checkbox', 'gv_silent_en', 'Enable Silent Aim', 25, 120, {}),
    W('hotkey', 'gv_silent_key', 'Silent Aim Key (press)', 25, 152, { key: 'Insert' }, { w: 300 }),
    W('panel', 'gv_s2', 'Settings', 15, 235, {}, { w: 690, h: 190 }),
    W('checkbox', 'gv_use_fov', 'Use FOV', 25, 260, { value: true }),
    W('checkbox', 'gv_draw_fov2', 'Draw FOV', 25, 290, {}),
    W('slider', 'gv_fov2', 'FOV Size', 25, 330, { min: 1, max: 1000, value: 180 }, { w: 300 }),
  ]);
  addPage(p, 'gv_visuals', 'Visuals', [
    topTabs(1), ...info('Visuals', 'Visuals'),
    W('panel', 'gv_v1', 'Visuals', 15, 95, {}, { w: 337, h: 280 }),
    W('combo', 'gv_filter', 'Player Filter', 25, 120, {}, { w: 310 }),
    W('checkbox', 'gv_box', 'Box', 25, 162, { value: true }),
    W('colorpicker', 'gv_box_col', 'Box Color', 25, 192, { value: '#FFD700' }),
    W('checkbox', 'gv_skel', 'Skeleton', 25, 232, { value: true }),
    W('checkbox', 'gv_tracers', 'Tracers', 25, 262, {}),
    W('checkbox', 'gv_health', 'Health Bar', 25, 292, { value: true }),
    W('checkbox', 'gv_name', 'Display Username', 25, 322, {}),
    W('panel', 'gv_v2', 'Visuals Settings', 368, 95, {}, { w: 337, h: 280 }),
    W('slider', 'gv_box_thick', 'Box Thickness', 378, 120, { min: 1, max: 10, value: 2 }, { w: 310 }),
    W('combo', 'gv_box_style', 'Box Style', 378, 165, {}, { w: 310 }),
    W('combo', 'gv_tracer', 'Tracer Type', 378, 230, {}, { w: 310 }),
    W('slider', 'gv_skel_thick', 'Skeleton Thickness', 378, 295, { min: 0.5, max: 5, value: 1.5, decimals: 1 }, { w: 310 }),
    W('colorpicker', 'gv_grad1', 'Gradient Color 1', 378, 340, { value: '#FFD700' }),
  ]);
  addPage(p, 'gv_exploits', 'Exploits', [
    topTabs(2), ...info('Exploits', 'Exploits'),
    W('panel', 'gv_e1', 'Exploits', 15, 95, {}, { w: 337, h: 200 }),
    W('checkbox', 'gv_bypass', 'Bypass Jump Cooldown', 25, 120, {}),
    W('checkbox', 'gv_hitbox', 'Hitbox Expander', 25, 150, {}),
    W('checkbox', 'gv_models', 'Custom Models', 25, 180, {}),
    W('checkbox', 'gv_spin', 'Spinbot', 25, 210, {}),
    W('panel', 'gv_e2', 'Exploits Settings', 368, 95, {}, { w: 337, h: 200 }),
    W('slider', 'gv_sizex', 'Size X', 378, 120, { min: 0.1, max: 30, value: 1, decimals: 1 }, { w: 310 }),
    W('slider', 'gv_sizey', 'Size Y', 378, 165, { min: 0.1, max: 30, value: 1, decimals: 1 }, { w: 310 }),
    W('slider', 'gv_sizez', 'Size Z', 378, 210, { min: 0.1, max: 30, value: 1, decimals: 1 }, { w: 310 }),
    W('checkbox', 'gv_visualize', 'Visualize Hitbox', 378, 255, {}),
  ]);
  addPage(p, 'gv_movement', 'Movement', [
    topTabs(2), ...info('Exploits', 'Movement'),
    W('panel', 'gv_m1', 'Movement', 15, 95, {}, { w: 337, h: 160 }),
    W('checkbox', 'gv_walk', 'Walkspeed', 25, 120, {}),
    W('checkbox', 'gv_jump', 'Jump Power', 25, 150, {}),
    W('checkbox', 'gv_noclip', 'Noclip', 25, 180, {}),
    W('panel', 'gv_m2', 'Movement Settings', 368, 95, {}, { w: 337, h: 300 }),
    W('combo', 'gv_speedtype', 'Speed Type', 378, 120, {}, { w: 310 }),
    W('slider', 'gv_speed', 'Speed Hack', 378, 185, { min: 1, max: 1000, value: 100 }, { w: 310 }),
    W('hotkey', 'gv_speed_key', 'TriggerBot key (press)', 378, 230, { key: 'Insert' }, { w: 310 }),
    W('slider', 'gv_power', 'Power', 378, 282, { min: 1, max: 1000, value: 100 }, { w: 310 }),
    W('hotkey', 'gv_noclip_key', 'Noclip key (press)', 378, 327, { key: 'Insert' }, { w: 310 }),
  ]);
  addPage(p, 'gv_clientsided', 'Client Sided', [
    topTabs(2), ...info('Exploits', 'Client Sided'),
    W('panel', 'gv_c1', 'Client Sided', 15, 95, {}, { w: 337, h: 180 }),
    W('checkbox', 'gv_headless', 'Headless', 25, 120, {}),
    W('checkbox', 'gv_korblox', 'Korblox', 25, 150, {}),
    W('checkbox', 'gv_emote', 'Emote Changer', 25, 180, {}),
    W('checkbox', 'gv_anim', 'Animation Changer', 25, 210, {}),
    W('panel', 'gv_c2', 'Client Sided Settings', 368, 95, {}, { w: 337, h: 300 }),
    W('combo', 'gv_emote_type', 'Emote Type', 378, 120, {}, { w: 310 }),
    W('combo', 'gv_idle', 'Idle Animation', 378, 185, {}, { w: 310 }),
    W('combo', 'gv_run', 'Run Animation', 378, 250, {}, { w: 310 }),
    W('combo', 'gv_walkanim', 'Walk Animation', 378, 315, {}, { w: 310 }),
  ]);
  addPage(p, 'gv_settings', 'Settings', [
    topTabs(3), ...info('Misc', 'Settings'),
    W('panel', 'gv_s3', 'Settings', 15, 95, {}, { w: 337, h: 220 }),
    W('checkbox', 'gv_vsync', 'Vsync', 25, 120, { value: true }),
    W('checkbox', 'gv_streamproof', 'Streamproof', 25, 150, {}),
    W('checkbox', 'gv_dex', 'DEX Explorer', 25, 180, {}),
    W('checkbox', 'gv_watermark', 'Watermark', 25, 210, {}),
    W('hotkey', 'gv_menu_key', 'Menu Keybind', 25, 240, { key: 'Insert' }, { w: 300 }),
    W('combo', 'gv_perf', 'Performance', 25, 285, {}, { w: 300 }),
    W('panel', 'gv_cfg', 'Configs', 368, 95, {}, { w: 337, h: 220 }),
    W('combo', 'gv_sel_cfg', 'Select Config', 378, 120, {}, { w: 310 }),
    W('input', 'gv_cfg_name', 'Config Name', 378, 185, { placeholder: 'Config Name' }, { w: 310 }),
    W('button', 'gv_load', 'Load', 378, 235, { variant: 'filled' }, { w: 96, h: 28 }),
    W('button', 'gv_save', 'Save', 482, 235, { variant: 'filled' }, { w: 96, h: 28 }),
    W('button', 'gv_refresh', 'Refresh', 586, 235, { variant: 'outline' }, { w: 102, h: 28 }),
  ]);
  p.startPage = 'gv_combat';
  p.fonts = [
    { name: 'Embedded Sans (medium)', embedded: 'font_medium_binary', license: 'bundled' },
    { name: 'Icon Font (icomoon)', embedded: 'icon_font_binary', license: 'bundled' },
  ];
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
  {
    id: 'kali-loader', name: 'Kali.dev Loader', author: 'Kali.dev (UI remake)',
    description: 'Monochrome auth loader: Sign In / Sign Up / Dashboard, white filled buttons, Segoe UI, letter-spaced labels, spinner/progress and masked license key. Editable.',
    tags: ['dark', 'monochrome', 'auth', 'loader', 'segoe'], size: [760, 560],
    approximate: false, build: kaliLoader,
  },
  {
    id: 'cloudy-ui', name: 'Cloudy UI', author: 'cloudyspoofer.cc (UI remake)',
    description: 'Light minimal spoofer UI: welcome/sign-in artwork pane, blue pill buttons, hardware-ID chips, teal license text and toast actions. Poppins font. Editable.',
    tags: ['light', 'blue', 'pill', 'chips', 'poppins'], size: [900, 580],
    approximate: false, build: cloudyUi,
  },
  {
    id: 'givenchy', name: 'Givenchy Standalone Menu', author: 'Givenchy (UI remake)',
    description: 'Gold-on-charcoal 720×445 menu: Combat / Visuals / Exploits / Misc top tabs with sub-tabs, two-column controls, checkboxes, sliders, combos, hotkeys, color pickers and configs. Editable.',
    tags: ['dark', 'gold', 'tabs', 'two-column', 'overlay'], size: [720, 445],
    approximate: false, build: givenchy,
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
