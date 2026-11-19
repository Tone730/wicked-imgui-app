// uikit.js — source-derived UI design systems and control recipes.
//
// Every value below was transcribed from STATIC analysis of the attached
// sources (KaliLoader/SRC/main.cpp, cloudy-ui/main.cpp, Givenchy/overlay/gui.cpp
// and their headers). Nothing from those archives was executed or imported.
//
// This module is the single source of truth for:
//   * exact palettes / fonts / geometry of each sampled menu,
//   * the tabs, sliders, buttons and other controls each menu actually uses,
//   * recipes that map a sampled control onto a Wicked widget + props,
//   * compact text summaries used to augment the offline AI's knowledge.
//
// It is data-only: no DOM, no IPC, no side effects. Safe to import anywhere
// (renderer, main process and Node-based regression suite).

import { createProject, createPage, createWidget, applyPreset, PRESETS } from './model.js';

/** Map a sampled control onto the closest Wicked widget + starting props. */
export const CONTROL_RECIPES = {
  // Generic control kinds shared by every sampled menu.
  'input': {
    widget: 'input', props: {},
    desc: 'Text input with a placeholder. Used for usernames, license keys, config names.',
  },
  'checkbox': {
    widget: 'checkbox', props: {},
    desc: 'Boolean toggle row. ESP/feature flags in every sampled menu.',
  },
  'combo': {
    widget: 'combo', props: {},
    desc: 'Dropdown with the exact options sampled from the source.',
  },
  'text': {
    widget: 'text', props: {},
    desc: 'Static label, heading, status line or stat readout.',
  },
  'divider': {
    widget: 'divider', props: {},
    desc: 'Thin separator line between control groups.',
  },
  'colorpicker': {
    widget: 'colorpicker', props: {},
    desc: 'Colour swatch that opens a picker (HAT, Random Remake, Hackermarket).',
  },
  'button': {
    widget: 'button', props: {},
    desc: 'Generic flat action button.',
  },
  'switch': {
    widget: 'switch', props: {},
    desc: 'Capsule switch with sub-caption (free-imgui / LazyUI switches).',
  },
  'segmented': {
    widget: 'combo', props: {},
    desc: 'Segmented single-select control (FOV/Distance/Threat, Hold/Toggle/Always).',
  },
  'color-swatch': {
    widget: 'colorpicker', props: {},
    desc: 'Small colour swatch beside a feature row.',
  },
  'stat-readout': {
    widget: 'text', props: { bold: true },
    desc: 'Label/value telemetry readout (TRACE CONFIDENCE 94%, SCAN WINDOW 16.7 MS).',
  },
  'config-list': {
    widget: 'list', props: {},
    desc: 'Selectable config/backup list with create/save/load/delete actions.',
  },
  'thin-slider': {
    widget: 'slider', props: {},
    desc: 'Thin track slider with a round knob (Eon, Fortnite External, HAT, Loader).',
  },
  'keybind-button': {
    widget: 'hotkey', props: {},
    desc: 'Click-to-capture key button, Escape clears (all sampled menus).',
  },
  'multicombo': {
    widget: 'combo', props: {},
    desc: 'Multi-select dropdown for bone/target lists (Hackermarket, Loader).',
  },
  'checkbox-colorpicker': {
    widget: 'colorpicker', props: {},
    desc: 'Checkbox row with an inline colour swatch (Fortnite External FOV).',
  },
  'filled-button': {
    widget: 'button', props: { variant: 'filled' },
    desc: 'Solid primary button. Set bg/bgHover/bgActive and rounding for pill shape.',
  },
  'pill-button': {
    widget: 'button', props: { variant: 'filled', rounding: 28 },
    desc: 'Fully rounded pill CTA (Cloudy sign in / SPOOF / CLEAN).',
  },
  'outline-button': {
    widget: 'button', props: { variant: 'outline' },
    desc: 'Border-only secondary button (Givenchy Refresh / Load / Save).',
  },
  'link-button': {
    widget: 'button', props: { variant: 'link' },
    desc: 'Flat text link (Kali LOG OUT, Forgot password, Contact support).',
  },
  'ghost-button': {
    widget: 'button', props: { variant: 'ghost' },
    desc: 'Low-emphasis tab-switch button.',
  },
  'password-reveal': {
    widget: 'password', props: { showToggle: true },
    desc: 'Masked field with SHOW/HIDE toggle (Kali) or eye icon (Cloudy).',
  },
  'keybind-button': {
    widget: 'hotkey', props: { listenText: 'Press the Key' },
    desc: 'Click-to-capture key button. Givenchy defaults: Aimbot key (press), Silent Aim Key (press), Noclip key (press), Menu Keybind.',
  },
  'mode-button': {
    widget: 'combo', props: { options: 'Hold|Toggle|Always' },
    desc: 'Keybind mode selector. Kali/Givenchy use Hold / Toggle / Always.',
  },
  'multicombo': {
    widget: 'list', props: {},
    desc: 'Multi-select list, e.g. Aimbot Checks: Team Check|Wall Check|FOV Check|KO Check.',
  },
  'checkbox-colorpicker': {
    widget: 'colorpicker', props: {},
    desc: 'Toggle plus colour swatch. Givenchy Visuals: Box, Filled Box, Tracers, Skeleton, Chams, Sonar, Crosshair, Fog.',
  },
  'value-chip': {
    widget: 'badge', props: { bg: '#FFFFFF', border: '#DCE0E4' },
    desc: 'Rounded read-only value chip (Cloudy hardware IDs).',
  },
  'tab-dropdown': {
    widget: 'tabs', props: {},
    desc: 'Top tab that opens an animated sub-tab dropdown (Givenchy Combat/Visuals/Exploits/Misc).',
  },
  'thin-slider': {
    widget: 'slider', props: {},
    desc: 'Compact slider. Givenchy track is 5px high with a 4px knob; value label sits above.',
  },
  'progress-bar': {
    widget: 'progress', props: {},
    desc: 'Thin progress bar (Kali bar_w=308, h=8, rounding=4).',
  },
  'toast': {
    action: 'toast', props: { kind: 'info' },
    desc: 'Bottom-centre transient notification (Cloudy SPOOF/CLEAN demo-only toasts).',
  },
  'keybind-list': {
    widget: 'table', props: {},
    desc: 'Flyout table with columns Features | Key | Mode | Show | Value.',
  },
  'stat-row': {
    widget: 'text', props: {},
    desc: 'Label/value row (Kali PLAN/LIFETIME, KEY/masked, EXPIRES/NEVER).',
  },
};

/** Exact design systems transcribed from each source. */
/** Compact palette board: [label, exact hex] -> coloured editable readouts.
 *  Used by the style-library kits whose source defines colours but no menu UI. */
const paletteRows = (pairs) => pairs.map(([label, color]) => ({ kind: 'stat-readout', label, color }));
const nameRows = (names) => names.map((label) => ({ kind: 'text', label }));

export const UI_KITS = {
  'kali-dark': {
    id: 'kali-dark',
    name: 'Kali.dev Loader',
    source: 'KaliLoader/SRC/main.cpp',
    summary: 'Monochrome frameless auth loader. Vertical dark gradient, white filled buttons, corner triangles, Segoe UI, letter-spaced labels.',
    preset: 'kali-dark',
    premade: 'kali-loader',
    window: { width: 760, height: 560, rounding: 10, fixed: true, frameless: true },
    palette: {
      bgTop: '#131318', bgBottom: '#0A0A0E', card: '#16161D',
      cardBorder: '#FFFFFF14', inputBg: '#0E0E13', inputHover: '#121219',
      inputFocus: '#15151E', inputBorder: '#FFFFFF12', inputFocusBorder: '#FFFFFF66',
      text: '#ECECF1', muted: '#8A8A98', faint: '#5E5E6C',
      darkText: '#15151B', darkMuted: '#4A4A56', white: '#FFFFFF',
      button: '#FFFFFF', buttonHover: '#E9E9EF', buttonActive: '#D9D9E2',
      buttonDisabled: '#494953', error: '#FF5C5C', success: '#57E396',
      triangle: '#F6F6F9', triangleEdge: '#C4C4CF', clearColor: '#121217',
    },
    fonts: [
      { role: 'ui-small', file: 'C:/Windows/Fonts/segoeui.ttf', size: 12 },
      { role: 'ui', file: 'C:/Windows/Fonts/segoeui.ttf', size: 17 },
      { role: 'bold-small', file: 'C:/Windows/Fonts/seguisb.ttf', size: 13 },
      { role: 'bold', file: 'C:/Windows/Fonts/seguisb.ttf', size: 22 },
      { role: 'brand', file: 'C:/Windows/Fonts/seguisb.ttf', size: 30 },
    ],
    layout: {
      cardWidth: 360, cardHeight: 412, cardY: 120, cardPadding: 26,
      fieldWidth: 308, fieldHeight: 40, buttonHeight: 48, tabHeight: 44,
      cornerTriangle: 300, tabLetterSpacing: 1.6, headingLetterSpacing: 2.4,
      spinnerArcs: 3, spinnerSpeed: 5,
    },
    screens: [
      {
        id: 'kali_signin', name: 'Sign In',
        tabs: ['SIGN IN', 'SIGN UP'],
        controls: [
          { kind: 'input', label: 'Username', placeholder: 'Username', w: 308, h: 40 },
          { kind: 'password-reveal', label: 'Password', placeholder: 'Password', w: 308, h: 40 },
          { kind: 'filled-button', label: 'LOGIN', busyLabel: 'AUTHENTICATING', w: 308, h: 48, action: 'login' },
          { kind: 'link-button', label: 'Forgot password? Contact support', message: 'Kali.dev support: support@kali.dev' },
        ],
        messages: ['Invalid username or password.', 'Please enter your username.', 'Please enter your password.', 'No account yet? Create one in SIGN UP.'],
      },
      {
        id: 'kali_signup', name: 'Sign Up',
        tabs: ['SIGN IN', 'SIGN UP'],
        controls: [
          { kind: 'input', label: 'KALI-XXXX-XXXX-XXXX', placeholder: 'KALI-XXXX-XXXX-XXXX' },
          { kind: 'input', label: 'Username', placeholder: 'Username' },
          { kind: 'password-reveal', label: 'Password (min 6 chars)' },
          { kind: 'password-reveal', label: 'Repeat the password' },
          { kind: 'filled-button', label: 'CREATE ACCOUNT', busyLabel: 'Authenticating', w: 308, h: 48 },
        ],
        messages: ['Username already taken.', 'Account created! Please sign in.', 'Invalid key. Format: KALI-XXXX-XXXX-XXXX', 'Passwords do not match.'],
      },
      {
        id: 'kali_dashboard', name: 'Dashboard',
        controls: [
          { kind: 'stat-row', label: 'PLAN', value: 'LIFETIME' },
          { kind: 'stat-row', label: 'KEY', value: 'KALI-****-****-****' },
          { kind: 'stat-row', label: 'EXPIRES', value: 'NEVER' },
          { kind: 'filled-button', label: 'LAUNCH', states: ['LOADING...', 'RELAUNCH'], w: 308, h: 48 },
          { kind: 'progress-bar', label: 'LOADING', w: 308, h: 8 },
          { kind: 'link-button', label: 'LOG OUT' },
        ],
        messages: ['Injecting (demo build)...', 'Ready — loaded (demo build)', 'Press LAUNCH to start the demo loader'],
      },
    ],
    chrome: ['KALI.DEV OR UR BRAND', 'YOUR TXT ', 'UR TXT', 'SECURE // KALI.DEV v2.0.1'],
  },

  'cloudy-light': {
    id: 'cloudy-light',
    name: 'Cloudy UI',
    source: 'cloudy-ui/cloudy-ui/main.cpp',
    summary: 'Light minimal spoofer UI. White card, blue pill buttons, teal license text, hardware-ID chips, fading toasts, Poppins.',
    preset: 'cloudy-light',
    premade: 'cloudy-ui',
    window: { width: 900, height: 580, titleHeight: 45, radius: 15, shadowPadding: 26, fixed: true, frameless: true },
    palette: {
      text: '#181A1D', textSoft: '#6B7280', label: '#9CA3AF', line: '#E2E6E9',
      cardBg: '#FCFDFD', cardLine: '#E9ECEF', chipBg: '#FFFFFF', chipLine: '#DCE0E4',
      blue: '#0A9BF5', blueHover: '#22A7F8', blueDown: '#0889DB', teal: '#13967C',
      white: '#FFFFFF', titleText: '#1C1E22', toastBg: '#181A1E',
    },
    fonts: [
      { role: 'micro', file: 'assets/fonts/Poppins-Regular.ttf', size: 13, fallback: 'segoeui.ttf', tracking: 0.7 },
      { role: 'body', file: 'assets/fonts/Poppins-Regular.ttf', size: 18 },
      { role: 'label', file: 'assets/fonts/Poppins-Regular.ttf', size: 19 },
      { role: 'input', file: 'assets/fonts/Poppins-Regular.ttf', size: 20 },
      { role: 'medium', file: 'assets/fonts/Poppins-Medium.ttf', size: 18 },
      { role: 'title', file: 'assets/fonts/Poppins-Medium.ttf', size: 19 },
      { role: 'pill', file: 'assets/fonts/Poppins-Bold.ttf', size: 21 },
      { role: 'brand', file: 'assets/fonts/Poppins-Bold.ttf', size: 43 },
    ],
    layout: {
      artworkWidthRatio: 0.48, fieldLeftRatio: 0.48, fieldGap: 22,
      pillHeightRatio: 0.12, cardRadius: 16, chipHeightRatio: 0.068,
      toastDuration: 2.4, pageFade: 0.26, shadowLayers: 16, defaultScale: 0.9,
    },
    screens: [
      {
        id: 'cloudy_welcome', name: 'welcome back',
        chrome: ['cloudyspoofer.cc'],
        artwork: ["no artwork yet", 'drop a png/jpg on the window, or save it as assets\\miku.png'],
        controls: [
          { kind: 'text', label: 'welcome back', fontSize: 43, bold: true },
          { kind: 'text', label: 'Please sing in to continue', fontSize: 18 },
          { kind: 'input', label: 'USERNAME', placeholder: 'Enter your username' },
          { kind: 'password-reveal', label: 'PASSWORD', placeholder: 'Enter your password' },
          { kind: 'checkbox', label: 'Remember me', value: true },
          { kind: 'pill-button', label: 'sign in', action: 'goto:cloudy_spoofer' },
        ],
      },
      {
        id: 'cloudy_spoofer', name: 'spoofer',
        chrome: ['cloudyspoofer.cc'],
        controls: [
          { kind: 'text', label: 'spoofer', fontSize: 42, bold: true },
          { kind: 'text', label: 'Hardware Identifiers & Protection', fontSize: 18 },
          { kind: 'text', label: 'User: smaxy' },
          { kind: 'text', label: 'License: Lifetime Unlimited', color: '#13967C' },
          { kind: 'value-chip', label: 'Board Serial', value: 'Not read yet' },
          { kind: 'value-chip', label: 'Volume Serial', value: '5BC2-F2D7' },
          { kind: 'value-chip', label: 'MAC Address', value: '02-8E-72-3B-36-C9' },
          { kind: 'value-chip', label: 'System UUID', value: 'Not read yet' },
          { kind: 'pill-button', label: 'SPOOF', action: 'toast:SPOOF clicked - UI demo only, nothing on this machine is touched' },
          { kind: 'pill-button', label: 'CLEAN', action: 'toast:CLEAN clicked - UI demo only, nothing on this machine is touched' },
        ],
      },
    ],
    keybinds: ['Ctrl+Tab (switch pages)', 'Enter (sign in)', 'X / title button (close)'],
  },

  'givenchy-gold': {
    id: 'givenchy-gold',
    name: 'Givenchy Standalone Menu',
    source: 'Givenchy/.../overlay/gui.cpp + gui/settings/*',
    summary: 'Gold-on-charcoal 720×445 menu. Top tab dropdowns, tab-info bar, two-column control grid, embedded sans + icon fonts, animated tabs.',
    preset: 'givenchy-gold',
    premade: 'givenchy',
    window: { width: 720, height: 445, rounding: 6, frameless: true, titleHeight: 50, tabInfoHeight: 50, featuresHeight: 344 },
    palette: {
      accentMain: '#FFD700', accentAlpha: '#D8C06F26', accentInvisible: '#D8C06F00',
      textActive: '#FFFFFF', textHover: '#FFFFFF9B', textInactive: '#72718A',
      border: '#1E1D25', body: '#141418', titlebar: '#15141A',
      tabInfo: '#17161B', tabActive: '#17161B', subTabSelected: '#1B1A21',
      subTabHover: '#19181D', notificationTrack: '#1D1D26',
    },
    fonts: [
      { role: 'medium-15', embedded: 'font_medium_binary', size: 17.5, ranges: 'Cyrillic' },
      { role: 'medium-12', embedded: 'font_medium_binary', size: 14.5 },
      { role: 'medium-11', embedded: 'font_medium_binary', size: 13.5 },
      { role: 'medium-10', embedded: 'font_medium_binary', size: 12.5 },
      { role: 'medium-9', embedded: 'font_medium_binary', size: 11.5 },
      { role: 'icon-15', embedded: 'icon_font_binary', size: 15, glyphs: { crosshair: 'A', gear: 'B', arrow: 'C', check: 'D', pencil: 'E', trash: 'F' } },
    ],
    layout: {
      columnWidth: 337.5, childSpacing: 15, contentPadding: 15,
      checkboxHeight: 30, buttonHeight: 25, sliderHeight: 45, sliderTrack: 5,
      comboHeight: 65, subTabWidth: 194, subTabHeight: 30,
      animationSpeed: 12, scrollbarWidth: 10, rounding: 2,
    },
    tabs: [
      { label: 'COMBAT', subTabs: ['Aimbot', 'Silent'] },
      { label: 'VISUALS', subTabs: ['Visuals'] },
      { label: 'EXPLOITS', subTabs: ['Exploits', 'Movement', 'Client Sided'] },
      { label: 'MISC', subTabs: ['Settings'] },
      { label: 'PLAYER LIST', note: 'ID 4 branch exists in source but is unreachable from the tab bar' },
    ],
    screens: [
      {
        id: 'gv_combat', name: 'Combat / Aimbot', parentTab: 'COMBAT', subTab: 'Aimbot',
        controls: [
          { kind: 'checkbox', label: 'Enable Aimbot', value: true },
          { kind: 'combo', label: 'Aimbot Type', options: ['Mouse Aim', 'Camera'] },
          { kind: 'checkbox', label: 'Sticky Aim' },
          { kind: 'checkbox', label: 'Draw FOV' },
          { kind: 'keybind-button', label: 'Aimbot key (press)', default: 'Insert' },
          { kind: 'multicombo', label: 'Aimbot Checks', options: ['Team Check', 'Wall Check', 'FOV Check', 'KO Check'] },
          { kind: 'combo', label: 'Target Hitbox', options: ['Head', 'HumanoidRootPart', 'UpperTorso', 'LowerTorso', 'Left Hand', 'Right Hand', 'Left Upper Arm', 'Right Upper Arm', 'Left Upper Leg', 'Right Upper Leg', 'Left Foot', 'Right Foot'] },
          { kind: 'thin-slider', label: 'FOV Size', min: 1, max: 1000 },
          { kind: 'thin-slider', label: 'Mouse Smooth', min: 1, max: 100 },
          { kind: 'thin-slider', label: 'Mouse Sensitivity', min: 0.1, max: 10 },
          { kind: 'thin-slider', label: 'Mouse Prediction X', min: 1, max: 20 },
          { kind: 'thin-slider', label: 'Mouse Prediction Y', min: 1, max: 20 },
          { kind: 'checkbox', label: 'Enable Shake' },
          { kind: 'thin-slider', label: 'Shake X Axis', min: -5, max: 5 },
          { kind: 'thin-slider', label: 'Shake Y Axis', min: -5, max: 5 },
        ],
      },
      {
        id: 'gv_silent', name: 'Combat / Silent', parentTab: 'COMBAT', subTab: 'Silent',
        controls: [
          { kind: 'checkbox', label: 'Enable Silent Aim' },
          { kind: 'keybind-button', label: 'Silent Aim Key (press)', mode: ['Hold', 'Toggle', 'Always'] },
          { kind: 'checkbox', label: 'Use FOV', value: true },
          { kind: 'checkbox', label: 'Draw FOV' },
          { kind: 'thin-slider', label: 'FOV Size', min: 1, max: 1000 },
        ],
      },
      {
        id: 'gv_visuals', name: 'Visuals', parentTab: 'VISUALS', subTab: 'Visuals',
        controls: [
          { kind: 'combo', label: 'Player Filter', options: ['Everyone Except Local', 'Local Player', 'Team Check'] },
          { kind: 'checkbox-colorpicker', label: ['Box', 'Filled Box', 'Display Username', 'Distance', 'Tool', 'Weapon Icon', 'Health Bar', 'Tracers', 'Chams', 'Skeleton', 'Sonar', 'Crosshair', 'Fog'] },
          { kind: 'checkbox', label: 'Gradient' },
          { kind: 'checkbox', label: 'Health Text' },
          { kind: 'thin-slider', label: 'Box Thickness', min: 1, max: 10 },
          { kind: 'combo', label: 'Box Style', options: ['Box', 'Corner Box'] },
          { kind: 'combo', label: 'Tracer Type', options: ['Bottom', 'Top', 'Normal', 'Spiderweb'] },
          { kind: 'combo', label: 'SnapLine Mode', options: ['Crosshair', 'Bottom', 'Top'] },
          { kind: 'thin-slider', label: 'Skeleton Thickness', min: 0.5, max: 5 },
          { kind: 'checkbox-colorpicker', label: ['Gradient Color 1', 'Gradient Color 2'] },
          { kind: 'thin-slider', label: 'Sonar Range', min: 10, max: 200 },
          { kind: 'thin-slider', label: 'Sonar Thickness', min: 0.1, max: 5 },
          { kind: 'combo', label: 'Style', options: ['Static', 'Pulse'] },
          { kind: 'thin-slider', label: 'Fog Start', min: 0, max: 1000 },
          { kind: 'thin-slider', label: 'Fog End', min: 1, max: 2000 },
        ],
      },
      {
        id: 'gv_exploits', name: 'Exploits', parentTab: 'EXPLOITS', subTab: 'Exploits',
        controls: [
          { kind: 'checkbox', label: 'Bypass Jump Cooldown' },
          { kind: 'checkbox', label: 'Hitbox Expander' },
          { kind: 'checkbox', label: 'Custom Models' },
          { kind: 'checkbox', label: 'Spinbot' },
          { kind: 'thin-slider', label: 'Size X', min: 0.1, max: 30 },
          { kind: 'thin-slider', label: 'Size Y', min: 0.1, max: 30 },
          { kind: 'thin-slider', label: 'Size Z', min: 0.1, max: 30 },
          { kind: 'checkbox', label: 'CanCollide' },
          { kind: 'checkbox', label: 'Visualize Hitbox' },
        ],
      },
      {
        id: 'gv_movement', name: 'Movement', parentTab: 'EXPLOITS', subTab: 'Movement',
        controls: [
          { kind: 'checkbox', label: 'Walkspeed' },
          { kind: 'checkbox', label: 'Jump Power' },
          { kind: 'checkbox', label: 'Noclip' },
          { kind: 'combo', label: 'Speed Type', options: ['WalkSpeed'] },
          { kind: 'thin-slider', label: 'Speed Hack', min: 1, max: 1000 },
          { kind: 'thin-slider', label: 'Power', min: 1, max: 1000 },
          { kind: 'keybind-button', label: 'Noclip key (press)' },
        ],
      },
      {
        id: 'gv_clientsided', name: 'Client Sided', parentTab: 'EXPLOITS', subTab: 'Client Sided',
        controls: [
          { kind: 'checkbox', label: 'Headless' },
          { kind: 'checkbox', label: 'Korblox' },
          { kind: 'checkbox', label: 'Emote Changer' },
          { kind: 'checkbox', label: 'Animation Changer' },
          { kind: 'checkbox', label: 'Skin Changer [DH]', note: 'game-id gated in source' },
          { kind: 'combo', label: 'Emote Type', options: ['cha cha', 'team usa breaking emote', 'd4vd - backflip', '/e hidden', 'gangnam style', 'No animation'] },
          { kind: 'combo', label: 'Idle Animation', options: ['Default Idle 1', 'Zombie Idle 1', 'Ninja Idle 1', 'Robot Idle 1', 'Levitation Idle 1', 'Stylish Idle 1', 'Cartoony Idle 1', 'Super Hero Idle 1', 'Elder Idle 1', 'Toy Idle 1', 'Old School Idle 1'] },
          { kind: 'combo', label: 'Run Animation', options: ['Default Run', 'Zombie Run', 'Ninja Run', 'Robot Run', 'Levitation Run', 'Stylish Run', 'Cartoony Run', 'Super Hero Run', 'Elder Run', 'Toy Run', 'Old School Run'] },
          { kind: 'combo', label: 'Walk Animation', options: ['Default Walk', 'Zombie Walk', 'Ninja Walk', 'Robot Walk', 'Levitation Walk', 'Stylish Walk', 'Cartoony Walk', 'Super Hero Walk', 'Elder Walk', 'Toy Walk', 'Old School Walk'] },
        ],
      },
      {
        id: 'gv_settings', name: 'Settings', parentTab: 'MISC', subTab: 'Settings',
        controls: [
          { kind: 'checkbox', label: 'Vsync', value: true },
          { kind: 'checkbox', label: 'Streamproof' },
          { kind: 'checkbox', label: 'DEX Explorer' },
          { kind: 'checkbox', label: 'Watermark' },
          { kind: 'keybind-button', label: 'Menu Keybind', default: 'Insert' },
          { kind: 'combo', label: 'Performance', options: ['High', 'Potato'] },
          { kind: 'combo', label: 'Select Config' },
          { kind: 'input', label: 'Config Name', placeholder: 'Config Name' },
          { kind: 'outline-button', label: 'Load' },
          { kind: 'outline-button', label: 'Save' },
          { kind: 'outline-button', label: 'Refresh' },
        ],
      },
    ],
    keybinds: ['Insert (menu toggle)', 'Right-click modes: Hold / Toggle / Always'],
    flyoutColumns: ['Features', 'Key', 'Mode', 'Show', 'Value'],
  },

  /* ---------------- Second mining round (archives unlocked with `123`) ----- */

  'eon-wtf': {
    id: 'eon-wtf',
    name: 'Eon.WTF Menu (exact)',
    source: 'Eon_Fortnite_External_Remake.zip / ship/Fortnite_Menu_2_Syntax / main.cpp + ui/themes/eon_wtf.h',
    summary: 'EXACT white-on-charcoal Eon remake. 728x568, 4 tabs / 11 pages, Inter + Font Awesome, monochrome toggle rows, measured card grid. Replaces the earlier approximation.',
    preset: 'eon-wtf', premade: 'eon-style',
    window: { width: 728, height: 568, rounding: 8, frameless: true, titleHeight: 60 },
    palette: {
      bg: '#151515', bgDark: '#111111', frame: '#141414', line: '#1C1C1C',
      border: '#1E1E1E', popup: '#171717', popupHover: '#202020',
      text: '#F2F2F2', textBright: '#FFFFFF', textSub: '#B4B4B4', textDim: '#5E5E5E',
      trackOff: '#35373B', trackOn: '#DDDDDD', fill: '#DFDFDF', knob: '#FAFAFA',
      accent: '#FFFFFF', scroll: '#111111',
    },
    fonts: [
      { role: 'label', file: 'Inter-SemiBold.ttf', size: 16 },
      { role: 'subtitle', file: 'Inter-Medium.ttf', size: 16 },
      { role: 'title', file: 'InterDisplay-Bold.ttf', size: 25 },
      { role: 'icon', file: 'fa-solid-900.ttf', size: 16 },
    ],
    layout: { sidebarWidth: 159, cardWidth: 262, cardGap: 12, togglePitch: 26, sliderPitch: 48, footerY: 533, scrollbarWidth: 2 },
    tabs: [
      { label: 'Aimbot', subTabs: ['General', 'Triggerbot', 'Weapon Config'] },
      { label: 'Visuals', subTabs: ['General', 'Radar', 'Counter', 'Color'] },
      { label: 'Miscellaneous', subTabs: ['General', 'Overlay'] },
      { label: 'Configuration', subTabs: ['Configs', 'Backups'] },
    ],
    screens: [
      {
        id: 'eon_aim_general', name: 'Aimbot / General', parentTab: 'Aimbot', subTab: 'General',
        controls: [
          { kind: 'checkbox', label: ['Enable Aimbot', 'Save Target', 'Ignore Downed', 'Ignore Teammates', 'Lock Target'], value: true },
          { kind: 'checkbox', label: ['Controller Support', 'Use Secondary Keybind', 'Visible Only', 'Prediction', 'Draw FOV Circle', 'Dynamic FOV', 'Humanize', 'Aim At Vehicles', 'Target Line', 'Auto Fire', 'Show FOV Value', 'Aim At Knocked'] },
          { kind: 'combo', label: 'Primary Keybind', options: ['Right Mouse', 'Left Mouse', 'Mouse 4', 'Mouse 5', 'Left Shift', 'Left Alt', 'Left Ctrl', 'None'] },
          { kind: 'combo', label: 'Secondary Keybind', options: ['Right Mouse', 'Left Mouse', 'Mouse 4', 'Mouse 5', 'Left Shift', 'Left Alt', 'Left Ctrl', 'None'] },
          { kind: 'combo', label: 'Aimbot Hitbox', options: ['Head', 'Neck', 'Chest', 'Pelvis', 'Closest'], selected: 1 },
          { kind: 'combo', label: 'Target Priority', options: ['Closest Crosshair', 'Closest Distance', 'Lowest Health'] },
          { kind: 'thin-slider', label: 'Aim FOV', min: 0, max: 500, value: 150 },
          { kind: 'thin-slider', label: 'Max Distance', min: 0, max: 500, value: 288 },
          { kind: 'thin-slider', label: 'Aim Smooth', min: 0, max: 4, value: 2.8 },
        ],
      },
      {
        id: 'eon_aim_trigger', name: 'Aimbot / Triggerbot', parentTab: 'Aimbot', subTab: 'Triggerbot',
        controls: [
          { kind: 'checkbox', label: ['Visible Only', 'Ignore Downed'], value: true },
          { kind: 'checkbox', label: ['Enable Triggerbot', 'Scoped Only', 'Shotguns Only'] },
          { kind: 'combo', label: 'Trigger Keybind', options: ['Right Mouse', 'Left Mouse', 'Mouse 4', 'Mouse 5', 'Left Shift', 'Left Alt', 'Left Ctrl', 'None'] },
          { kind: 'thin-slider', label: 'Trigger Delay', min: 0, max: 300, value: 45 },
          { kind: 'thin-slider', label: 'Max Distance', min: 0, max: 500, value: 150 },
          { kind: 'thin-slider', label: 'Hitchance', min: 0, max: 100, value: 70 },
        ],
      },
      {
        id: 'eon_aim_weapon', name: 'Aimbot / Weapon Config', parentTab: 'Aimbot', subTab: 'Weapon Config',
        controls: [
          { kind: 'checkbox', label: ['Per-Weapon Config', 'Override Aimbot', 'Override FOV', 'Override Smoothing'] },
          { kind: 'combo', label: 'Weapon Type', options: ['Assault Rifle', 'Shotgun', 'SMG', 'Sniper', 'Pistol'] },
          { kind: 'thin-slider', label: 'Weapon FOV', min: 0, max: 500, value: 120 },
          { kind: 'thin-slider', label: 'Weapon Smooth', min: 0.5, max: 4, value: 2 },
          { kind: 'thin-slider', label: 'Max Distance', min: 0, max: 500, value: 200 },
        ],
      },
      {
        id: 'eon_vis_general', name: 'Visuals / General', parentTab: 'Visuals', subTab: 'General',
        controls: [
          { kind: 'checkbox', label: ['Outlined ESP', 'Skeleton ESP', 'Name ESP', 'Distance ESP', 'Weapon ESP', 'Platform ESP', 'Rank ESP', 'Team ID', 'Health Bar', 'Shield Bar', 'Distance Units'], value: true },
          { kind: 'checkbox', label: ['Box ESP', 'Player Status', 'Player Kills', 'Glow', 'Chams', 'Vehicle ESP', 'Loot ESP', 'Streamer Mode', 'Show Visible', 'Show Invisible', 'Ignore BOTs'] },
          { kind: 'combo', label: 'Skeleton Type', options: ['Default', 'Thin', 'Rounded'], selected: -1 },
          { kind: 'thin-slider', label: 'Max Distance', min: 0, max: 500, value: 300 },
          { kind: 'thin-slider', label: 'Box Thickness', min: 1, max: 10, value: 1 },
          { kind: 'thin-slider', label: 'Skeleton Thickness', min: 1, max: 5, value: 2 },
          { kind: 'thin-slider', label: 'Snapline Thickness', min: 0, max: 5, value: 0 },
          { kind: 'thin-slider', label: 'Text Size', min: 8, max: 24, value: 12 },
          { kind: 'thin-slider', label: 'Glow Strength', min: 0, max: 100, value: 50 },
        ],
      },
      {
        id: 'eon_vis_radar', name: 'Visuals / Radar', parentTab: 'Visuals', subTab: 'Radar',
        controls: [
          { kind: 'checkbox', label: ['Enable Radar', 'Show Enemies'], value: true },
          { kind: 'checkbox', label: ['Show BOTs', 'Show Teammates'] },
          { kind: 'combo', label: 'Radar Position', options: ['Top Left', 'Top Right', 'Bottom Left', 'Bottom Right'] },
          { kind: 'thin-slider', label: 'Radar Size', min: 100, max: 400, value: 150 },
          { kind: 'thin-slider', label: 'Radar Range', min: 50, max: 500, value: 200 },
          { kind: 'thin-slider', label: 'Radar Opacity', min: 0, max: 100, value: 80 },
        ],
      },
      {
        id: 'eon_vis_counter', name: 'Visuals / Counter', parentTab: 'Visuals', subTab: 'Counter',
        controls: [
          { kind: 'checkbox', label: ['Kill Counter', 'Spectator Counter'], value: true },
          { kind: 'checkbox', label: ['Damage Counter', 'Match Timer'] },
          { kind: 'combo', label: 'Counter Position', options: ['Top Left', 'Top Right', 'Bottom Left', 'Bottom Right'], selected: 1 },
          { kind: 'thin-slider', label: 'Counter Scale', min: 0.5, max: 2, value: 1 },
          { kind: 'thin-slider', label: 'Max Entries', min: 1, max: 10, value: 5 },
        ],
      },
      {
        id: 'eon_vis_color', name: 'Visuals / Color', parentTab: 'Visuals', subTab: 'Color',
        controls: [
          { kind: 'checkbox', label: ['Fade By Distance', 'Outline Text'], value: true },
          { kind: 'checkbox', label: ['Rainbow Mode'] },
          { kind: 'combo', label: 'Color Preset', options: ['Default', 'Pastel', 'Neon', 'Mono'] },
          { kind: 'combo', label: 'Visible Color', options: ['White', 'Grey', 'Red', 'Green', 'Blue', 'Yellow'] },
          { kind: 'combo', label: 'Invisible Color', options: ['White', 'Grey', 'Red', 'Green', 'Blue', 'Yellow'], selected: 1 },
          { kind: 'combo', label: 'Skeleton Color', options: ['White', 'Grey', 'Red', 'Green', 'Blue', 'Yellow'] },
          { kind: 'combo', label: 'Box Color', options: ['White', 'Grey', 'Red', 'Green', 'Blue', 'Yellow'] },
        ],
      },
      {
        id: 'eon_misc_general', name: 'Miscellaneous / General', parentTab: 'Miscellaneous', subTab: 'General',
        controls: [
          { kind: 'checkbox', label: ['Stream Proof', 'Show Watermark'], value: true },
          { kind: 'checkbox', label: ['FPS Limiter', 'Hide From Screenshots', 'Auto Accept Match'] },
          { kind: 'combo', label: 'Menu Key', options: ['Insert', 'Home', 'Delete', 'F1', 'F2'] },
          { kind: 'thin-slider', label: 'FPS Limit', min: 30, max: 360, value: 240 },
          { kind: 'thin-slider', label: 'Menu Opacity', min: 20, max: 100, value: 100 },
          { kind: 'thin-slider', label: 'Overlay Scale', min: 0.5, max: 2, value: 1 },
        ],
      },
      {
        id: 'eon_misc_overlay', name: 'Miscellaneous / Overlay', parentTab: 'Miscellaneous', subTab: 'Overlay',
        controls: [
          { kind: 'checkbox', label: ['Spectator List', 'Watermark'], value: true },
          { kind: 'checkbox', label: ['Keybind List'] },
          { kind: 'combo', label: 'Watermark Position', options: ['Top Left', 'Top Right', 'Bottom Left', 'Bottom Right'] },
          { kind: 'thin-slider', label: 'Overlay Opacity', min: 0, max: 100, value: 90 },
        ],
      },
      {
        id: 'eon_cfg_configs', name: 'Configuration / Configs', parentTab: 'Configuration', subTab: 'Configs',
        controls: [
          { kind: 'config-list', label: ['Default', 'Legit', 'Rage', 'Streaming'] },
          { kind: 'input', label: 'Config Name', placeholder: 'New config name' },
          { kind: 'filled-button', label: ['Create Config', 'Save Config', 'Load Config', 'Delete Config'] },
          { kind: 'checkbox', label: ['Auto Load On Start'], value: true },
          { kind: 'checkbox', label: ['Auto Save', 'Cloud Sync'] },
          { kind: 'combo', label: 'Config Folder', options: ['Documents', 'AppData', 'Custom'] },
        ],
      },
      {
        id: 'eon_cfg_backups', name: 'Configuration / Backups', parentTab: 'Configuration', subTab: 'Backups',
        controls: [
          { kind: 'config-list', label: ['Backup 05.05.2026', 'Backup 01.05.2026'] },
          { kind: 'filled-button', label: ['Restore Backup', 'Delete Backup'] },
          { kind: 'checkbox', label: ['Daily Backups'], value: true },
          { kind: 'thin-slider', label: 'Keep Backups', min: 1, max: 20, value: 5 },
        ],
      },
    ],
    chrome: ['status:undetected', 'expiry:May 09,2026(4 days left)', 'Syntax / Customer'],
    keybinds: ['No global hotkeys in source (Menu Key is display-only)', 'Launch: menu.exe <tab> <subtab>'],
  },

  'fortnite-external': {
    id: 'fortnite-external',
    name: 'Fortnite External (purple)',
    source: 'Random_Remake.zip / ship/Fortnite_External_Remake / main.cpp + ui/themes/fortnite_external.h',
    summary: 'Purple-gradient flat-card menu. 718x578, 3 tabs / 6 pages, Poppins + Font Awesome, thin white-knob sliders, search box, gradient checkboxes.',
    preset: 'fortnite-external', premade: 'fortnite-external',
    window: { width: 718, height: 578, rounding: 8, frameless: true, titleHeight: 85 },
    palette: {
      bg: '#0E0E12', card: '#131218', border: '#2A2930', line: '#2A2930',
      accent: '#E54DFA', accentStart: '#F962FA', accentEnd: '#CC36FA', accentSoft: '#A054AA',
      text: '#FFFFFF', textLabel: '#E6E6EE', textMuted: '#9E9EA5', textDim: '#8A8A91',
      frame: '#221628', frameBorder: '#423A3F', popup: '#16151B', list: '#0E0D11',
      red: '#FF4B3B', blue: '#52B8E8', green: '#4ED250', gold: '#F0BC66',
    },
    fonts: [
      { role: 'label', file: 'Poppins-SemiBold.ttf', size: 16 },
      { role: 'value', file: 'Poppins-Medium.ttf', size: 16 },
      { role: 'brand', file: 'Poppins-Bold.ttf', size: 18 },
      { role: 'icon', file: 'fa-solid-900.ttf', size: 16 },
    ],
    layout: { columnWidth: 333, columnGap: 14, cardRounding: 5, rowPitch: 26, pillHeight: 26, sliderTrack: 3, knobRadius: 4, searchWidth: 160 },
    tabs: [
      { label: 'Aimbot', subTabs: ['General'] },
      { label: 'Visuals', subTabs: ['Players', 'Filters', 'Radar'] },
      { label: 'Misc', subTabs: ['General', 'Configs'] },
    ],
    screens: [
      {
        id: 'fe_aim_general', name: 'Aimbot / General', parentTab: 'Aimbot', subTab: 'General',
        controls: [
          { kind: 'checkbox', label: ['Enabled', 'Visible only', 'Ignore dead', 'Ignore DBNO'], value: true },
          { kind: 'checkbox', label: ['Per-weapon settings', 'Triggerbot > Enabled', 'Draw FOV circle', 'Dynamic FOV', 'Prediction', 'Humanize', 'Shoot through walls', 'Only when keybind'] },
          { kind: 'keybind-button', label: 'Aim key' },
          { kind: 'keybind-button', label: 'Trigger key' },
          { kind: 'keybind-button', label: 'Walls key' },
          { kind: 'combo', label: 'Aim method', options: ['Memory Aim', 'Mouse Aim'] },
          { kind: 'combo', label: 'Target bone', options: ['Head', 'Neck', 'Chest'] },
          { kind: 'thin-slider', label: 'Field of view', min: 0, max: 560, value: 240 },
          { kind: 'thin-slider', label: 'Smoothness', min: 0, max: 40, value: 2 },
          { kind: 'checkbox-colorpicker', label: ['Draw FOV circle'] },
        ],
      },
      {
        id: 'fe_vis_players', name: 'Visuals / Players', parentTab: 'Visuals', subTab: 'Players',
        controls: [
          { kind: 'checkbox', label: ['Bounding box', 'Box outline', 'Skeleton', 'View line', 'Knocked color', 'Glow skeleton'], value: true },
          { kind: 'checkbox', label: ['Show username', 'Show weapon', 'Show ammo', 'Show rank', 'Show distance', 'Show team size', 'Show platform', 'Snaplines', 'Streamproof', 'Snapline outline', 'Self ESP'] },
          { kind: 'color-swatch', label: ['Bounding box', 'Skeleton', 'Snaplines', 'Knocked color'], color: '#FF4B3B' },
          { kind: 'thin-slider', label: 'Box thickness', min: 0.5, max: 4, value: 1.5 },
          { kind: 'thin-slider', label: 'Skeleton thickness', min: 0.5, max: 4, value: 1 },
          { kind: 'thin-slider', label: 'Snap thickness', min: 0.5, max: 4, value: 0.5 },
          { kind: 'thin-slider', label: 'Font size', min: 10, max: 32, value: 11 },
        ],
      },
      {
        id: 'fe_vis_filters', name: 'Visuals / Filters', parentTab: 'Visuals', subTab: 'Filters',
        controls: [
          { kind: 'checkbox', label: ['Enemies only'], value: true },
          { kind: 'checkbox', label: ['Visible only', 'Standing only', 'Ignore bots', 'Ignore NPC'] },
        ],
      },
      {
        id: 'fe_vis_radar', name: 'Visuals / Radar', parentTab: 'Visuals', subTab: 'Radar',
        controls: [
          { kind: 'checkbox', label: ['Enable radar'], value: true },
          { kind: 'thin-slider', label: 'Radar size', min: 50, max: 400, value: 100 },
          { kind: 'thin-slider', label: 'Radar range', min: 50, max: 350, value: 100 },
          { kind: 'thin-slider', label: 'Radar opacity', min: 0, max: 100, value: 50 },
        ],
      },
      {
        id: 'fe_misc_general', name: 'Misc / General', parentTab: 'Misc', subTab: 'General',
        controls: [
          { kind: 'checkbox', label: ['FPS limiter', 'Show spectators'], value: true },
          { kind: 'thin-slider', label: 'FPS limit', min: 30, max: 360, value: 240 },
          { kind: 'button', label: 'Unload cheat', action: 'toast:UI demo only - the menu closes, no game process is touched' },
        ],
      },
      {
        id: 'fe_misc_configs', name: 'Misc / Configs', parentTab: 'Misc', subTab: 'Configs',
        controls: [
          { kind: 'config-list', label: ['Default'] },
          { kind: 'input', label: 'New config name...', placeholder: 'New config name...' },
          { kind: 'button', label: ['Create config', 'Save config', 'Load config', 'Delete config'] },
        ],
      },
    ],
    chrome: ['Fortnite External', 'Search...', 'GUI OPEN KEY'],
    keybinds: ['Keybind capture: Escape or Delete clears', 'Launch: menu.exe <tab> <subtab>'],
  },

  'fn-external': {
    id: 'fn-external',
    name: 'FN External (Hackermarket)',
    source: '7prwqxn (1).rar / hackermarket_ui / ui/pages.cpp + ui/theme.h',
    summary: 'Red-accent measured remake. 700x500, 3 top tabs / 12 screens, Outfit + Material Icons, weapon/visuals/settings columns, many named sliders and combos.',
    preset: 'fn-external', premade: 'fn-external',
    window: { width: 700, height: 500, rounding: 3, frameless: true, titleHeight: 35 },
    palette: {
      base: '#19151D', surface: '#1C1820', line: '#211D25', border: '#201D24',
      accent: '#BE352D', accentHover: '#CC4239', title: '#FFFFFF',
      text: '#BAB8BB', dim: '#47444A', popup: '#242029',
      white: '#FFFFFF', black: '#000000', grey: '#5E5E5E',
      cyan: '#53CEFC', yellow: '#F7BD31', green: '#5CFB38', lightBlue: '#A2DDEF',
    },
    fonts: [
      { role: 'text', file: 'Outfit-Medium.ttf', size: 17 },
      { role: 'nav', file: 'Outfit-Medium.ttf', size: 18 },
      { role: 'strong', file: 'Outfit-SemiBold.ttf', size: 17 },
      { role: 'title', file: 'Outfit-SemiBold.ttf', size: 18 },
      { role: 'icon', file: 'MaterialIcons-Regular.ttf', size: 24 },
    ],
    layout: { sidebarWidth: 150, sidebarRow: 40, sidebarPitch: 50, panelLeftX: 158, panelRightX: 429, panelGap: 8, sliderTrack: 247, comboWidth: 170, keyboxHeight: 20 },
    tabs: [
      { label: 'Weapon', subTabs: ['Shotgun', 'Assault Rifle', 'SMG', 'Sniper', 'Pistol'] },
      { label: 'Visuals', subTabs: ['Players', 'Radar', 'World', 'Settings'] },
      { label: 'Settings', subTabs: ['Menu', 'Configs', 'About'] },
    ],
    screens: [
      {
        id: 'fm_weapon', name: 'Weapon / Shotgun', parentTab: 'Weapon', subTab: 'Shotgun',
        controls: [
          { kind: 'checkbox', label: ['Aimbot Enabled', 'Aimbot Prediction', 'Ignore Knocked', 'Ignore Team', 'Lock Target', 'Dynamic FOV'], value: true },
          { kind: 'checkbox', label: ['Triggerbot Enabled', 'Draw FOV', 'Filled FOV', 'Visible Check'] },
          { kind: 'multicombo', label: 'Aimbot Bones', options: ['Head', 'Neck', 'Chest', 'Pelvis'] },
          { kind: 'multicombo', label: 'Trigger Bones', options: ['Head', 'Neck', 'Chest', 'Pelvis'] },
          { kind: 'thin-slider', label: 'Aimbot Smoothing', min: 5, max: 100, value: 5.8 },
          { kind: 'thin-slider', label: 'Weapon Aim Fov', min: 0, max: 800, value: 648.9 },
          { kind: 'thin-slider', label: 'Aimbot Max Distance', min: 0, max: 400, value: 20.6 },
          { kind: 'thin-slider', label: 'Triggerbot Delay', min: 0, max: 600, value: 10 },
          { kind: 'thin-slider', label: 'Aimbot Deadzone', min: 0, max: 40, value: 2 },
          { kind: 'keybind-button', label: 'Aimbot Key', default: 'Mouse 4' },
          { kind: 'keybind-button', label: 'Aimbot Key 2', default: 'B' },
          { kind: 'keybind-button', label: 'Triggerbot Key', default: 'B' },
          { kind: 'keybind-button', label: 'Battlemode Toggle', default: 'P' },
        ],
      },
      {
        id: 'fm_players', name: 'Visuals / Players', parentTab: 'Visuals', subTab: 'Players',
        controls: [
          { kind: 'checkbox', label: ['Player Skeleton', 'Show Spectators', 'Player Name', 'Player Team ID', 'Player Distance', 'Show Held Weapon', 'Show Team', 'Show NPC', 'Show Kills', 'Seperate TeamID Colors', 'Dynamic FOV'], value: true },
          { kind: 'checkbox', label: ['Player Box', 'Filled Box', 'Show Platform'] },
          { kind: 'combo', label: 'Box Type', options: ['Corner', 'Full'] },
          { kind: 'combo', label: 'Skeleton Type', options: ['Sharp', 'Smooth'] },
          { kind: 'thin-slider', label: 'Spectator List Opacity', min: 0, max: 100, value: 90 },
          { kind: 'colorpicker', label: ['Visible Color', 'Hidden Color', 'Knocked Color', 'Team Color', 'NPC Color', 'Text Color', 'Skeleton Color', 'Hidden Skeleton Color'], color: '#53CEFC' },
        ],
      },
      {
        id: 'fm_radar', name: 'Visuals / Radar', parentTab: 'Visuals', subTab: 'Radar',
        controls: [
          { kind: 'checkbox', label: ['Enable Radar', 'Show Players', 'Show Local Player', 'Rotate With Camera', 'Show Team', 'Show Knocked', 'Show Direction', 'Show Grid'], value: true },
          { kind: 'checkbox', label: ['Show NPC', 'Show Distance', 'Show Names'] },
          { kind: 'combo', label: 'Radar Shape', options: ['Circle', 'Square'] },
          { kind: 'thin-slider', label: 'Radar Size', min: 100, max: 500, value: 250 },
          { kind: 'thin-slider', label: 'Radar Range', min: 50, max: 500, value: 150 },
          { kind: 'thin-slider', label: 'Radar Zoom', min: 0.5, max: 3, value: 1 },
          { kind: 'thin-slider', label: 'Background Opacity', min: 0, max: 100, value: 70 },
          { kind: 'colorpicker', label: ['Background Color', 'Border Color', 'Local Player Color', 'Enemy Color', 'Team Color', 'NPC Color'] },
        ],
      },
      {
        id: 'fm_world', name: 'Visuals / World', parentTab: 'Visuals', subTab: 'World',
        controls: [
          { kind: 'checkbox', label: ['Show Chests', 'Show Ammo Boxes', 'Show Supply Drops', 'Show Llamas', 'Show Floor Loot', 'Show Item Names', 'Show Distance', 'Show Names'], value: true },
          { kind: 'checkbox', label: ['Show Vehicles', 'Hide Looted'] },
          { kind: 'combo', label: 'Loot Rarity', options: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'], selected: 2 },
          { kind: 'thin-slider', label: 'Loot Distance', min: 10, max: 300, value: 80 },
          { kind: 'thin-slider', label: 'Loot Text Size', min: 10, max: 24, value: 13 },
          { kind: 'thin-slider', label: 'World Render Distance', min: 50, max: 1000, value: 400 },
          { kind: 'colorpicker', label: ['Chest Color', 'Ammo Box Color', 'Supply Drop Color', 'Vehicle Color', 'Llama Color', 'Floor Loot Color', 'World Text Color', 'Outline Color'] },
        ],
      },
      {
        id: 'fm_vis_settings', name: 'Visuals / Settings', parentTab: 'Visuals', subTab: 'Settings',
        controls: [
          { kind: 'checkbox', label: ['Enable Visuals', 'Text Outline', 'Short Distance', 'Show Units'], value: true },
          { kind: 'checkbox', label: ['Only Visible Players', 'Hide Bots', 'Show Crosshair', 'Uppercase Names', 'Compact Labels'] },
          { kind: 'combo', label: 'Vis Font', options: ['Outfit', 'Inter', 'Consolas'] },
          { kind: 'thin-slider', label: 'Box Thickness', min: 1, max: 5, value: 1.5 },
          { kind: 'thin-slider', label: 'Skeleton Thickness', min: 1, max: 5, value: 1.5 },
          { kind: 'thin-slider', label: 'Text Size', min: 10, max: 24, value: 13 },
          { kind: 'thin-slider', label: 'Corner Length', min: 5, max: 50, value: 25 },
          { kind: 'thin-slider', label: 'Max Player Distance', min: 50, max: 1000, value: 300 },
          { kind: 'thin-slider', label: 'Max Box Distance', min: 50, max: 1000, value: 250 },
          { kind: 'thin-slider', label: 'Max Skeleton Distance', min: 50, max: 1000, value: 150 },
          { kind: 'thin-slider', label: 'Max Text Distance', min: 50, max: 1000, value: 200 },
        ],
      },
      {
        id: 'fm_menu', name: 'Settings / Menu', parentTab: 'Settings', subTab: 'Menu',
        controls: [
          { kind: 'checkbox', label: ['Animations', 'Show Version', 'Remember Last Page', 'Tooltips'], value: true },
          { kind: 'checkbox', label: ['Keep On Top', 'Show FPS'] },
          { kind: 'thin-slider', label: 'Menu Scale', min: 80, max: 150, value: 100 },
          { kind: 'keybind-button', label: 'Menu Key', default: 'Insert' },
          { kind: 'keybind-button', label: 'Next Page', default: 'PageDown' },
          { kind: 'keybind-button', label: 'Previous Page', default: 'PageUp' },
          { kind: 'colorpicker', label: ['Accent Color', 'Text Color', 'Background Color', 'Panel Color'] },
          { kind: 'button', label: ['Reset Colors', 'Close Menu'] },
        ],
      },
      {
        id: 'fm_configs', name: 'Settings / Configs', parentTab: 'Settings', subTab: 'Configs',
        controls: [
          { kind: 'config-list', label: ['default', 'shotgun only', 'visuals only'] },
          { kind: 'input', label: 'Config Name', placeholder: 'new config' },
          { kind: 'button', label: ['Create', 'Rename', 'Save', 'Load', 'Delete'] },
          { kind: 'stat-readout', label: ['Selected: none', 'Last Action: Nothing yet', 'Configs stay in this session:', 'nothing is written to disk.'] },
        ],
      },
      {
        id: 'fm_about', name: 'Settings / About', parentTab: 'Settings', subTab: 'About',
        controls: [
          { kind: 'stat-readout', label: ['Menu: FN External', 'Version: Fortnite v2.0', 'Type: UI remake', 'Remade By: Syntax', 'Built With: Dear ImGui 1.91.9b'] },
          { kind: 'stat-readout', label: ['Text: Outfit (OFL)', 'Icons: Material Icons', 'Design: 700 x 500', 'Measured: Weapon, Players', 'By Feel: Radar, World, Settings'] },
          { kind: 'text', label: ['Own remakes and custom UI work', 'on request:', 'discord.gg/KYSn7q45j3'] },
          { kind: 'text', label: ['This is a UI remake, not the original.', 'Every control only changes local placeholder values: no game logic, no login, no network.'] },
        ],
      },
    ],
    chrome: ['FN External', 'Fortnite v2.0', '(G)', '(?)', '(CPU)', '(Rarity)', '(Font)'],
    keybinds: ['Menu Key: Insert', 'Next Page: PageDown', 'Previous Page: PageUp'],
  },

  'loader-template': {
    id: 'loader-template',
    name: 'Orange Loader Template',
    source: 'project name.rar / project name / examples/example_win32_directx9/main.cpp + main.h',
    summary: 'Orange-on-black loader skeleton. 620x470, PROJECT/NAME header, 8 sidebar tabs, GROUP panels, Multi Combo and keybind scaffold. Great starter template.',
    preset: 'loader-template', premade: 'loader-template',
    window: { width: 620, height: 470, rounding: 5, frameless: true, titleHeight: 50 },
    palette: {
      windowBg: '#0C0C0C', childBg: '#090909', header: '#090909', divider: '#121212',
      accent: '#FA793A', accentDim: '#6E75FF', text: '#FFFFFF', idle: '#474749',
      section: '#8C8C8C', tabActive: '#141414', tabHover: '#161616', checkOff: '#191919',
      sliderTrack: '#141414', keybox: '#18191B', clear: '#94288E',
    },
    fonts: [
      { role: 'brand', file: 'embedded Font', size: 24 },
      { role: 'ui', file: 'embedded Font', size: 18 },
      { role: 'group', file: 'embedded Font', size: 18 },
      { role: 'icon', file: 'icon2 glyph K', size: 18 },
    ],
    layout: { headerHeight: 50, sidebarWidth: 140, childWidth: 224, childHeight: 435, tabHit: [50, 35], checkboxSize: 16, sliderKnobRadius: 8 },
    tabs: [
      { label: 'Self', note: 'GENERAL' }, { label: 'Players', note: 'GENERAL' },
      { label: 'Vehicle', note: 'GENERAL' }, { label: 'Chams', note: 'VISUALS' },
      { label: 'Effects', note: 'VISUALS' }, { label: 'Aimming', note: 'COMBAT (source typo)' },
      { label: 'Weapons', note: 'COMBAT' }, { label: 'Config', note: 'OTHER' },
    ],
    screens: [
      {
        id: 'lt_self', name: 'Self', controls: [
          { kind: 'text', label: ['PROJECT', 'NAME'], fontSize: 24, bold: true },
          { kind: 'checkbox', label: ['Checkbox1', 'Checkbox2'] },
          { kind: 'thin-slider', label: 'Slider float', min: 0, max: 360, value: 60 },
          { kind: 'combo', label: 'Combo', options: ['One', 'Two', 'Three'] },
          { kind: 'multicombo', label: 'Multi Combo', options: ['One', 'Two', 'Three', 'Four', 'Five'] },
          { kind: 'text', label: ['GROUP 1', 'GROUP 2'] },
        ],
      },
      {
        id: 'lt_players', name: 'Players', controls: [
          { kind: 'checkbox', label: ['Checkbox3', 'Checkbox4', 'Checkbox5', 'Checkbox6', 'Checkbox7'] },
          { kind: 'thin-slider', label: 'Slider int', min: 0, max: 180, value: 90 },
          { kind: 'colorpicker', label: 'Accent color', color: '#FA793A' },
          { kind: 'text', label: ['GROUP 3', 'GROUP 4'] },
        ],
      },
      { id: 'lt_vehicle', name: 'Vehicle', controls: [{ kind: 'text', label: ['GROUP 5', 'GROUP 6'] }] },
      { id: 'lt_chams', name: 'Chams', controls: [{ kind: 'text', label: ['GROUP 7', 'GROUP 8'] }] },
      { id: 'lt_effects', name: 'Effects', controls: [{ kind: 'text', label: ['GROUP 9', 'GROUP 10'] }] },
      { id: 'lt_aimming', name: 'Aimming', controls: [{ kind: 'text', label: ['GROUP 11', 'GROUP 12'] }] },
      { id: 'lt_weapons', name: 'Weapons', controls: [{ kind: 'text', label: ['GROUP 13', 'GROUP 14'] }] },
      { id: 'lt_config', name: 'Config', controls: [{ kind: 'text', label: ['GROUP 15', 'GROUP 16'] }] },
    ],
    chrome: ['GENERAL', 'VISUALS', 'COMBAT', 'OTHER', 'PROJECT NAME'],
    keybinds: ['Keybind widget: Escape cancels, displays NONE (not instantiated in the template UI)'],
  },

  'hat-ui': {
    id: 'hat-ui',
    name: 'HAT UI Kit',
    source: '7505bf9.zip / hat / examples/example_win32_directx11/main.cpp + menu_i.cpp + menu/defs/colors.h',
    summary: 'Periwinkle categorised UI kit. 784x768, 5 tabs, collapsible CATEGORY > MODULE groups, animated widgets, ESP Preview window, INSERT toggle, blur background.',
    preset: 'hat-ui', premade: 'hat-ui',
    window: { width: 784, height: 768, rounding: 16, frameless: true, titleHeight: 44 },
    palette: {
      bg: '#0A0B0D', panel: '#131217', popup: '#070812', primary: '#839CFF',
      accent: '#839CFF', secondary: '#DFBBFF', error: '#FF9D9D', highlight: '#C7FF8C',
      text: '#FFFFFF', gray: '#ADADAD', gray2: '#6F6F6F', skeleton: '#3D3D3D',
    },
    fonts: [
      { role: 'semibold', file: 'embedded semibold ttf', size: 12 },
      { role: 'medium', file: 'embedded medium ttf', size: 18 },
      { role: 'icons', file: 'embedded icon ttf', size: 14 },
    ],
    layout: { logo: 60, tabHeight: 44, categoryWidth: 379, moduleWidth: 363, checkbox: [14, 16], comboHeight: 56, sliderHeight: 24, popupWidth: 320, espPreview: [280, 620] },
    tabs: [
      { label: 'Aimbot', subTabs: ['General', 'Radar', 'Players', 'Configuration'] },
      { label: 'Visuals', subTabs: ['Skeletons'] },
      { label: 'World' }, { label: 'Misc' }, { label: 'Settings' },
    ],
    screens: [
      {
        id: 'hat_general', name: 'Aimbot / General', parentTab: 'Aimbot', subTab: 'General',
        controls: [
          { kind: 'checkbox', label: ['Esp', 'Corner Box', 'Rotating Box', 'Skeletons', 'Skeletons Joints', 'Head Dot', 'Fill', 'Outline', 'Username', 'Distance', 'Held Item', 'Player Flags', 'Team ID', 'Player Belt'], value: true },
          { kind: 'colorpicker', label: ['Esp', 'Slider', 'Materials'], color: '#FF0000' },
          { kind: 'thin-slider', label: 'Slider', min: 0, max: 100, value: 0 },
          { kind: 'combo', label: 'Materials', options: ['Flat', 'Glow', 'Wireframe'] },
          { kind: 'keybind-button', label: 'Esp', default: 'INS' },
          { kind: 'button', label: 'Category' },
          { kind: 'text', label: ['BOXES', 'SKELETONS', 'HEAD', 'CHAMS', 'VISUALS'] },
        ],
      },
      {
        id: 'hat_radar', name: 'Aimbot / Radar', parentTab: 'Aimbot', subTab: 'Radar',
        controls: [
          { kind: 'checkbox', label: ['Enable Display', 'Lock Position', 'Show Border', 'Rotate With Player', 'Show Enemies', 'Show Teammates', 'Show Vehicles', 'Color By Health', 'Fade With Distance', 'Pulse On Aim'], value: true },
          { kind: 'thin-slider', label: ['Display Scale', 'Scan Radius', 'Background Opacity', 'Marker Size', 'Border Thickness'], min: 0, max: 100 },
          { kind: 'text', label: ['WINDOW SETTINGS', 'DIMENSIONS & RANGE', 'TARGET FILTERS', 'CUSTOMIZATION'] },
        ],
      },
      {
        id: 'hat_players', name: 'Aimbot / Players', parentTab: 'Aimbot', subTab: 'Players',
        controls: [
          { kind: 'checkbox', label: ['Enable Boxes', 'Dynamic Frame', 'Enable Skeleton', 'Show On-Screen', 'Filters', 'Show Teammate'], value: true },
          { kind: 'thin-slider', label: ['Line Thickness', 'Fill Opacity', 'Max Render Distance'], min: 0, max: 100 },
          { kind: 'combo', label: 'Health Bar Style', options: ['Default', 'Line', 'Solid'] },
          { kind: 'combo', label: 'Aim FOV', options: ['Max', 'Min', 'Dynamic'] },
          { kind: 'text', label: ['FRAMES', 'DETAILS', 'ARMOR BAR POSITION', 'TARGETING'] },
        ],
      },
      {
        id: 'hat_visuals', name: 'Visuals', parentTab: 'Visuals', subTab: 'Skeletons',
        controls: [
          { kind: 'checkbox', label: ['SkeletonsTTTTT', 'Skeletons JointsTTTT'] },
          { kind: 'text', label: ['TEST', 'SKELETONS', 'Esp Preview'] },
        ],
      },
    ],
    chrome: ['HAT', 'GUI OPEN KEY', 'INS', 'Aimbot', 'Visuals', 'World', 'Misc', 'Settings'],
    keybinds: ['VK_INSERT toggles the menu', 'Keybind capture: Escape resets to n/a'],
  },

  'lazyui-combat': {
    id: 'lazyui-combat',
    name: 'LazyUI Combat Dashboard',
    source: 'free-imgui-fw.iannis-main (1).zip / free-imgui / Menu/generated/generated_ui.cpp + generated_theme.hpp',
    summary: 'Green Figma-generated 1440x960 dashboard. MN3Y brand, sidebar categories, 4 sub-tabs, 3-column cards, segmented controls, switches and status readouts.',
    preset: 'lazyui-combat', premade: 'lazyui-combat',
    window: { width: 1440, height: 960, rounding: 0, frameless: true, titleHeight: 70 },
    palette: {
      bg: '#050607', frame: '#080A0D', sidebar: '#0B0E12', card: '#11151A',
      hover: '#171D23', fieldFocus: '#181C20', buttonHover: '#1D2124',
      green: '#A7F542', greenSoft: '#BDF871', accent: '#A7F542', blue: '#54C7FF', orange: '#FFB454',
      text: '#EDF2F5', textAlt: '#A0AAB4', muted: '#66717C', border: '#343E48',
    },
    fonts: [
      { role: 'body', file: 'Inter', size: 15 },
      { role: 'title', file: 'Inter Bold', size: 20 },
      { role: 'mono', file: 'Roboto Mono', size: 9 },
      { role: 'icon', file: 'embedded icon font', size: 14 },
    ],
    layout: { header: 70, sidebar: 230, footer: 42, columnWidth: 377, columnGap: 16, cardRounding: 8, controlRounding: 5, pillRounding: 999 },
    tabs: [
      { label: 'Combat', subTabs: ['Aim assist', 'Trigger logic', 'Weapon profiles', 'Advanced'] },
      { label: 'Visuals' }, { label: 'Movement' }, { label: 'World' },
      { label: 'Profiles' }, { label: 'Settings' },
    ],
    screens: [
      {
        id: 'lz_aim_assist', name: 'Combat / Aim assist', parentTab: 'Combat', subTab: 'Aim assist',
        controls: [
          { kind: 'switch', label: ['Enable target acquisition', 'Visibility trace', 'Ignore incapacitated', 'Team validation', 'Recoil compensation', 'Velocity prediction', 'Input blending', 'Require direct visibility', 'Release outside cone', 'Automatic fire gate'], value: true },
          { kind: 'switch', label: ['Smoke obstruction', 'Track target switch'] },
          { kind: 'segmented', label: 'Selection mode', options: ['FOV', 'Distance', 'Threat'], selected: 2 },
          { kind: 'segmented', label: 'Compensation model', options: ['Off', 'Static', 'Adaptive'], selected: 2 },
          { kind: 'segmented', label: 'Activation behavior', options: ['Hold', 'Toggle', 'Always'] },
          { kind: 'segmented', label: 'Burst discipline', options: ['Single', 'Short', 'Full'], selected: 1 },
          { kind: 'combo', label: 'Target point', options: ['Upper chest · dynamic', 'Center mass'] },
          { kind: 'combo', label: 'Fallback point', options: ['Center mass'] },
          { kind: 'combo', label: 'Interpolation curve', options: ['Cubic ease · precision'] },
          { kind: 'combo', label: 'Active mapping', options: ['Automatic · AR / SMG'] },
          { kind: 'thin-slider', label: 'Field of view', min: 1, max: 180, value: 42 },
          { kind: 'thin-slider', label: 'Horizontal smoothing', min: 0, max: 100, value: 18 },
          { kind: 'thin-slider', label: 'Vertical smoothing', min: 0, max: 100, value: 24 },
          { kind: 'thin-slider', label: 'Reaction delay', min: 0, max: 300, value: 96 },
          { kind: 'thin-slider', label: 'Maximum range', min: 5, max: 300, value: 185 },
          { kind: 'keybind-button', label: 'Activation key', default: 'MOUSE 5' },
          { kind: 'button', label: ['Reset', 'Save profile'] },
          { kind: 'stat-readout', label: ['3 UNSAVED CHANGES', 'SCAN WINDOW 16.7 MS / 03 TRACKED', 'DEVIATION 0.18° / STABLE', 'TRACE CONFIDENCE 94% / INPUT VARIANCE LOW'] },
          { kind: 'text', label: ['Target acquisition', 'Candidate filters', 'Aim processing', 'Stabilization', 'Engagement rules', 'Weapon response', 'MODULES / COMBAT', 'MN3Y / DEV', 'OVERLAY ACTIVE / CONFIG TEST / BUILD 2026.09.30'] },
        ],
      },
    ],
    chrome: ['MN3Y', 'MODULES / COMBAT', 'Combat assistance', 'ARMED', 'LAST SYNC 14:32:08', 'OVERLAY ACTIVE'],
    keybinds: ['Keybind pill: ARMED / ... / captured name', 'Escape cancels capture'],
  },

  'imjson-demo': {
    id: 'imjson-demo',
    name: 'ImJson Theme Demo',
    source: 'moleium/imjson (MIT, 2023 Mole) / example/main.cpp + include/imjson.cpp + include/imjson.h',
    summary: 'Neutral-grey theme defined entirely in JSON at runtime. GLFW window 1280x720, ImGui window "Theme Demo", Basic Controls (Float slider, Button, Counter text, Checkbox) plus a Style Editor. All colours and rounding values are transcribed from the example JSON; no font file is hardcoded.',
    preset: 'imjson-demo', premade: 'imjson-demo',
    window: { width: 1280, height: 720, rounding: 4, frameless: false, titleHeight: 34 },
    palette: {
      base: '#1F1F1F', surface: '#262626', line: '#6E6E80', border: '#6E6E80',
      accent: '#4A4A4A', accentHover: '#595959', accentActive: '#6B6B6B',
      title: '#F2F2F2', text: '#F2F2F2', dim: '#808080', popup: '#141414',
      frame: '#404040', frameHover: '#545454', frameActive: '#6B6B6B',
      header: '#595959', headerHover: '#636363', headerActive: '#787878',
      check: '#DBDBDB', scroll: '#4F4F4F', menuBar: '#242424', clear: '#1A1A1A',
    },
    fonts: [],
    fontNote: 'Font path and pixel size are supplied by the JSON theme (Fonts.Default.Path / SizePixels); imjson does not hardcode a font file.',
    geometry: { windowRounding: 4, frameRounding: 2, scrollbarRounding: 3, grabRounding: 2, tabRounding: 2, windowPadding: [8, 8], framePadding: [4, 3], itemSpacing: [8, 4], scrollbarSize: 14, grabMinSize: 10 },
    screens: [
      {
        id: 'imjson_basic', name: 'Theme Demo / Basic Controls',
        controls: [
          { kind: 'thin-slider', label: 'Float', min: 0, max: 1, value: 0 },
          { kind: 'button', label: 'Button', action: 'toast:Counter incremented (demo only)' },
          { kind: 'stat-readout', label: 'Counter = 0' },
          { kind: 'checkbox', label: 'Checkbox', value: false },
          { kind: 'text', label: 'CollapsingHeader: Basic Controls' },
          { kind: 'text', label: 'CollapsingHeader: Style Editor (ImGui::ShowStyleEditor)' },
        ],
      },
      {
        id: 'imjson_stylevars', name: 'Theme JSON / Style Variables',
        controls: [
          { kind: 'stat-readout', label: ['WindowRounding = 4.0', 'FrameRounding = 2.0', 'ScrollbarRounding = 3.0', 'GrabRounding = 2.0', 'TabRounding = 2.0', 'WindowPadding = 8,8', 'FramePadding = 4,3', 'ItemSpacing = 8,4', 'ScrollbarSize = 14.0', 'GrabMinSize = 10.0'] },
        ],
      },
      {
        id: 'imjson_colors', name: 'Theme JSON / Recognized Keys',
        controls: [
          { kind: 'config-list', label: ['Text', 'TextDisabled', 'WindowBg', 'ChildBg', 'PopupBg', 'Border', 'FrameBg', 'FrameBgHovered', 'FrameBgActive', 'TitleBg', 'MenuBarBg', 'CheckMark', 'Button', 'Header', 'Tab', 'ScrollbarGrab'] },
          { kind: 'stat-readout', label: ['Text = #F2F2F2', 'WindowBg = #1F1F1F', 'PopupBg = #141414', 'Button = #4A4A4A', 'ButtonHovered = #595959', 'FrameBg = #404040', 'Header = #595959', 'CheckMark = #DBDBDB'] },
        ],
      },
    ],
    chrome: ['ImJson Demo (GLFW 1280x720)', 'Theme Demo (ImGui window)'],
  },

  'vision-menu': {
    id: 'vision-menu',
    name: 'Vision Menu (imgui-menu-clone)',
    source: 'SharimAli/imgui-menu-clone (MIT, 2026 Sharim / GHX4T) / assets/template/main.cpp + ui/theme.h + ui/themes/vision.h + ui/widgets.cpp',
    summary: 'Purple-accent overlay menu. 800x405, VISION title in Bungee, Poppins controls with Font Awesome 6 icons, 4 sidebar tabs (Recoil/Misc/Settings/Configs), custom toggle/slider/keybind/colour-picker widgets; accent recolours live from the picker. Misc/Settings/Configs are Empty stubs in the source.',
    preset: 'vision-menu', premade: 'vision-menu',
    window: { width: 800, height: 405, rounding: 5, frameless: true, titleHeight: 60 },
    palette: {
      base: '#141414', surface: '#1A191C', line: '#212023', border: '#212023',
      accent: '#E663F0', accentDim: '#E663F082', accentOff: '#E663F000',
      title: '#FFFFFF', text: '#FFFFFF', hover: '#AAAAAA', idle: '#787878', faint: '#FFFFFF64',
      textActive: '#FFFFFF', textInactive: '#8C8C8C', frame: '#1A191C', frameHover: '#201F23',
      track: '#1A191C', knob: '#212023', ringOff: '#343434',
      popup: '#151417', popupHover: '#201F23', separator: '#1E1D20', shadow: '#0000005A',
    },
    fonts: [
      { role: 'text', file: 'Poppins-Medium.ttf', size: 20 },
      { role: 'icon', file: 'fa-solid-900.ttf', size: 17 },
      { role: 'title', file: 'Bungee-Regular.ttf', size: 25 },
    ],
    layout: { sidebarWidth: 155, headerHeight: 60, contentPad: 10, tabHeight: 40, childHeader: 31, frameHeight: 35, toggleTrackW: 58, toggleTrackH: 15, knobW: 38, knobH: 21, sliderTrackH: 10, sliderKnobW: 32, sliderKnobH: 19, swatch: 26, scrollbar: 7, separator: 14, shadow: 18 },
    tabs: [
      { label: 'Recoil', icon: 'crosshairs' },
      { label: 'Misc', icon: 'sliders' },
      { label: 'Settings', icon: 'gear' },
      { label: 'Configs', icon: 'file' },
    ],
    screens: [
      {
        id: 'vision_recoil', name: 'Recoil', parentTab: 'Recoil',
        controls: [
          { kind: 'text', label: 'GroupBox: Recoil' },
          { kind: 'switch', label: 'Checkbox', value: false },
          { kind: 'keybind-button', label: 'KeyBind', default: 'None', listenText: '...' },
          { kind: 'divider', label: '' },
          { kind: 'thin-slider', label: 'Slider Integer', min: 1, max: 100, value: 1 },
          { kind: 'thin-slider', label: 'Slider Float', min: 1, max: 100, value: 1 },
          { kind: 'divider', label: '' },
          { kind: 'input', label: 'InputText', placeholder: 'InputText' },
          { kind: 'text', label: 'GroupBox: Settings' },
          { kind: 'colorpicker', label: 'Color Picker', color: '#E663F0' },
          { kind: 'multicombo', label: 'MultiCombo', options: ['One', 'Two', 'Three', 'Four', 'Five'] },
          { kind: 'combo', label: 'Combo', options: ['One', 'Two', 'Three'] },
          { kind: 'divider', label: '' },
          { kind: 'button', label: 'Button' },
        ],
      },
      { id: 'vision_misc', name: 'Misc', parentTab: 'Misc', controls: [{ kind: 'text', label: 'Empty' }, { kind: 'text', label: 'Nothing here yet.' }] },
      { id: 'vision_settings', name: 'Settings', parentTab: 'Settings', controls: [{ kind: 'text', label: 'Empty' }, { kind: 'text', label: 'Nothing here yet.' }] },
      { id: 'vision_configs', name: 'Configs', parentTab: 'Configs', controls: [{ kind: 'text', label: 'Empty' }, { kind: 'text', label: 'Nothing here yet.' }] },
    ],
    chrome: ['VISION', 'menu', 'ui_menu_window', 'crosshairs', 'sliders', 'gear', 'file'],
    keybinds: ['KeyBind: None (Esc/Delete clears)', 'Window drag: title bar'],
  },

  'dear-imgui-styles': {
    id: 'dear-imgui-styles',
    name: 'Dear ImGui Styles Collection',
    source: 'GraphicsProgramming/dear-imgui-styles (MIT, 2022 Graphics Programming) / README.md style snippets',
    summary: 'Five community ImGui styles transcribed from the source snippets: Cinder darkTheme (pink #EB2E4A on #21242B), Adobe Spectrum (symbolic GRAY/BLUE roles), enemymouse (cyan on black), ledSynthmaster (cream + green #40FF00) and dougblinks (light blue). The repo defines palettes only, so each screen is an editable colour board; no menu UI or hardcoded window size exists in the source.',
    preset: 'dear-imgui-styles', premade: 'dear-imgui-styles',
    window: { width: 900, height: 620, rounding: 3, frameless: false, titleHeight: 32 },
    palette: {
      base: '#21242B', surface: '#333845', line: '#242930', border: '#242930',
      accent: '#EB2E4A', accentHover: '#EB2E4ADB', title: '#DBEDE3', text: '#DBEDE3',
      dim: '#999999', frame: '#333845', frameHover: '#EB2E4AC7', popup: '#333845E6',
    },
    fonts: [
      { role: 'text', file: 'OpenSans-Light.ttf', size: 16 },
      { role: 'display', file: 'OpenSans-Light.ttf', size: 32 },
      { role: 'regular', file: 'OpenSans-Regular.ttf', size: 16 },
      { role: 'small', file: 'OpenSans-Regular.ttf', size: 11 },
      { role: 'bold', file: 'OpenSans-Bold.ttf', size: 11 },
    ],
    board: true,
    screens: [
      {
        id: 'dg_cinder', name: 'Cinder / darkTheme',
        controls: paletteRows([
          ['Text = #DBEDE3C7', '#DBEDE3C7'], ['WindowBg = #21242BFF', '#21242BFF'],
          ['FrameBg = #333845FF', '#333845FF'], ['FrameBgHovered = #EB2E4AC7', '#EB2E4AC7'],
          ['TitleBgActive = #EB2E4AFF', '#EB2E4AFF'], ['Button = #78C4D424', '#78C4D424'],
          ['ButtonHovered = #EB2E4ADB', '#EB2E4ADB'], ['Header = #EB2E4AC2', '#EB2E4AC2'],
          ['CheckMark = #B53845FF', '#B53845FF'], ['SliderGrab = #78C4D424', '#78C4D424'],
          ['Separator = #242930FF', '#242930FF'], ['PopupBg = #333845E6', '#333845E6'],
        ]),
      },
      {
        id: 'dg_adobe', name: 'Adobe Spectrum',
        controls: paletteRows([
          ['Text -> Spectrum::GRAY800', '#3B3B3B'], ['TextDisabled -> GRAY500', '#8E8E8E'],
          ['WindowBg -> GRAY100', '#F5F5F5'], ['PopupBg -> GRAY50', '#FAFAFA'],
          ['Border -> GRAY300', '#D5D5D5'], ['FrameBg -> GRAY75', '#E6E6E6'],
          ['TitleBgActive -> GRAY200', '#E1E1E1'], ['Header -> BLUE400', '#2680EB'],
          ['HeaderHovered -> BLUE500', '#1473E6'], ['CheckMark -> BLUE500', '#1473E6'],
          ['DragDropTarget = #FFFF00E6', '#FFFF00E6'], ['NavWindowingHighlight = #FFFFFFB3', '#FFFFFFB3'],
        ]),
      },
      {
        id: 'dg_enemymouse', name: 'enemymouse',
        controls: paletteRows([
          ['Text = #00FFFFFF', '#00FFFFFF'], ['WindowBg = #000000FF', '#000000FF'],
          ['Border = #00FFFFA6', '#00FFFFA6'], ['FrameBg = #70CCCC2E', '#70CCCC2E'],
          ['FrameBgActive = #70CFDBA8', '#70CFDBA8'], ['TitleBg = #242E36BA', '#242E36BA'],
          ['TitleBgActive = #00FFFF45', '#00FFFF45'], ['ScrollbarGrab = #00FFFF70', '#00FFFF70'],
          ['Button = #00A6A675', '#00A6A675'], ['Header = #00FFFF54', '#00FFFF54'],
          ['CloseButtonHovered = #00C7C778', '#00C7C778'], ['TooltipBg = #002121E6', '#002121E6'],
        ]),
      },
      {
        id: 'dg_led', name: 'ledSynthmaster',
        controls: paletteRows([
          ['Text = #66633DFF', '#66633DFF'], ['WindowBg = #EBE8E0B3', '#EBE8E0B3'],
          ['PopupBg = #EBE8E0EB', '#EBE8E0EB'], ['Border = #D6D4CCA6', '#D6D4CCA6'],
          ['FrameBg = #FFFAF2FF', '#FFFAF2FF'], ['FrameBgHovered = #FCFF66C7', '#FCFF66C7'],
          ['FrameBgActive = #42FF00FF', '#42FF00FF'], ['TitleBgActive = #40FF00FF', '#40FF00FF'],
          ['CheckMark = #40FF00CC', '#40FF00CC'], ['ButtonHovered = #FCFF38DB', '#FCFF38DB'],
          ['Header = #40FF00C2', '#40FF00C2'], ['ModalWindowDarkening = #FFFAF2BA', '#FFFAF2BA'],
        ]),
      },
      {
        id: 'dg_dougblinks', name: 'dougblinks',
        controls: paletteRows([
          ['Text = #000000FF', '#000000FF'], ['WindowBg = #F0F0F0F0', '#F0F0F0F0'],
          ['PopupBg = #FFFFFFF0', '#FFFFFFF0'], ['FrameBgHovered = #4296FA66', '#4296FA66'],
          ['FrameBgActive = #4296FAAB', '#4296FAAB'], ['TitleBgActive = #D1D1D1FF', '#D1D1D1FF'],
          ['CheckMark = #4296FAFF', '#4296FAFF'], ['Button = #4296FA66', '#4296FA66'],
          ['ButtonHovered = #4296FAFF', '#4296FAFF'], ['Header = #4296FA4F', '#4296FA4F'],
          ['PlotHistogram = #E6B300FF', '#E6B300FF'], ['CloseButtonHovered = #FA635CFF', '#FA635CFF'],
        ]),
      },
    ],
    chrome: ['StyleColorsSpectrum', 'darkTheme', 'enemymouse', 'ledSynthmaster', 'dougblinks'],
  },

  'imgui-candy': {
    id: 'imgui-candy',
    name: 'ImguiCandy Themes',
    source: 'Raais/ImguiCandy (MIT, 2021 Raais N.) / ImCandy/candy.h + README.md',
    summary: 'Three themes plus 24 brand colour constants. Theme_Blender (steel blue #4773B3 on #383838), Theme_Cyberpunk (electric violet #9C00FF / cyan #00D1FF on #000A1F) and Theme_Nord (#2E3340 with #8FBDBA). All themes reset to StyleColorsDark first; no fonts or window sizes are hardcoded.',
    preset: 'imgui-candy', premade: 'imgui-candy',
    window: { width: 900, height: 620, rounding: 4, frameless: false, titleHeight: 32 },
    palette: {
      base: '#000A1F', surface: '#080A38', line: '#9C00FF', border: '#9C00FF',
      accent: '#9C00FF', accentHover: '#5700FF', title: '#00D1FF', text: '#00D1FF',
      dim: '#005CA1', frame: '#00BFFF33', frameHover: '#5700FF', popup: '#1F0F45',
    },
    fonts: [],
    fontNote: 'ImguiCandy defines colours, gradient helpers and themes only; no font file, font size or window dimension is hardcoded.',
    board: true,
    geometry: { windowRounding: 0, frameRounding: 0, scrollbarRounding: 0, grabRounding: 0, blenderRounding: 8, blenderFrameRounding: 4, nordBorderSize: 1 },
    screens: [
      {
        id: 'candy_blender', name: 'Theme_Blender',
        controls: paletteRows([
          ['Text = #D6D6D6FF', '#D6D6D6FF'], ['WindowBg = #383838FF', '#383838FF'],
          ['ChildBg = #303030FF', '#303030FF'], ['PopupBg = #171717FF', '#171717FF'],
          ['Border = #2B2B2BFF', '#2B2B2BFF'], ['FrameBg = #545454FF', '#545454FF'],
          ['TitleBgActive = #4773B3FF', '#4773B3FF'], ['CheckMark = #4773B3FF', '#4773B3FF'],
          ['Button = #545454FF', '#545454FF'], ['ButtonHovered = #666666FF', '#666666FF'],
          ['ButtonActive = #4773B3FF', '#4773B3FF'], ['Header = #454545FF', '#454545FF'],
          ['Separator = #2E2E2EFF', '#2E2E2EFF'], ['TextSelectedBg = #4773B3FF', '#4773B3FF'],
        ]),
      },
      {
        id: 'candy_cyberpunk', name: 'Theme_Cyberpunk',
        controls: paletteRows([
          ['Text = #00D1FFFF', '#00D1FFFF'], ['WindowBg = #000A1FFF', '#000A1FFF'],
          ['ChildBg = #080A38FF', '#080A38FF'], ['PopupBg = #1F0F45FF', '#1F0F45FF'],
          ['Border = #9C00FFFF', '#9C00FFFF'], ['FrameBg = #00BFFF33', '#00BFFF33'],
          ['TitleBg = #00CFF2FF', '#00CFF2FF'], ['CheckMark = #F230EBFF', '#F230EBFF'],
          ['SliderGrab = #00FFF2FF', '#00FFF2FF'], ['Button = #00FAFF85', '#00FAFF85'],
          ['ButtonHovered = #F000FFCC', '#F000FFCC'], ['Header = #00F2FF66', '#00F2FF66'],
          ['Tab = #5C00FFFF', '#5C00FFFF'], ['PlotHistogram = #00FFE0FF', '#00FFE0FF'],
        ]),
      },
      {
        id: 'candy_nord', name: 'Theme_Nord',
        controls: paletteRows([
          ['Text = #D9DEE8E0', '#D9DEE8E0'], ['WindowBg = #2E3340FF', '#2E3340FF'],
          ['ChildBg = #292B33FF', '#292B33FF'], ['PopupBg = #3B4252FF', '#3B4252FF'],
          ['Border = #242930FF', '#242930FF'], ['FrameBg = #3B4252FF', '#3B4252FF'],
          ['FrameBgHovered = #8FBDBAFF', '#8FBDBAFF'], ['TitleBg = #292933FF', '#292933FF'],
          ['CheckMark = #5E82ABFF', '#5E82ABFF'], ['SliderGrab = #82A1C2FF', '#82A1C2FF'],
          ['ButtonHovered = #82A1C2FF', '#82A1C2FF'], ['Header = #82A1C2FF', '#82A1C2FF'],
          ['TabActive = #3B4252FF', '#3B4252FF'], ['NavHighlight = #87BFD1DB', '#87BFD1DB'],
        ]),
      },
      {
        id: 'candy_constants', name: 'IV4 Colour Constants',
        controls: paletteRows([
          ['IV4_CRIMSON = #D31027', '#D31027'], ['IV4_SKYBLUE = #20BDFF', '#20BDFF'],
          ['IV4_AZURE = #0072FF', '#0072FF'], ['IV4_HOTPINK = #FF0099', '#FF0099'],
          ['IV4_CHARTREUSE = #ADD100', '#ADD100'], ['IV4_EMERALD = #38EF7D', '#38EF7D'],
          ['IV4_BUBBLEGUM = #FC67FA', '#FC67FA'], ['IV4_TWITCH = #9146FF', '#9146FF'],
          ['IV4_DISCORD = #5865F2', '#5865F2'], ['IV4_TWITTER = #1DA1F2', '#1DA1F2'],
          ['IV4_SPOTIFY = #1DB954', '#1DB954'], ['IV4_GOOGLEBLUE = #4285F4', '#4285F4'],
          ['IV4_MANGO = #FFC837', '#FFC837'], ['IV4_VIOLET = #9500FF', '#9500FF'],
          ['IV4_COSMICLATTE = #FFF8E7', '#FFF8E7'], ['IV4_TEAL = #50C9C3', '#50C9C3'],
          ['IV4_DRACULA = #282A36', '#282A36'], ['IV4_2077YELLOW = #FDF500', '#FDF500'],
          ['IV4_CPNBLUE = #00E0FF', '#00E0FF'], ['IV4_CPNVIOLET = #9C00FF', '#9C00FF'],
          ['IV4_CPNPURPLE = #5D00FF', '#5D00FF'], ['IV4_CPNDEEP = #000A1F', '#000A1F'],
        ]),
      },
    ],
    chrome: ['Theme_Blender', 'Theme_Cyberpunk', 'Theme_Nord', 'Rainbow', 'Gradient2'],
  },

  'untitled-theme-editor': {
    id: 'untitled-theme-editor',
    name: 'Untitled ImGui Theme Editor',
    source: 'MadLadSquad/UntitledImGuiTheme (MIT, 2023-2026 Heapforge Ltd.) / UTheme.hpp + UTheme.cpp + Common.h',
    summary: 'YAML theme serialiser and built-in editor. No bundled palette exists in the repo, so this editable kit documents the exact 60+ colour keys, the full ImGui style-variable list, the six semantic colours and the None/Left/Right/Up/Down direction combo from the editor source.',
    preset: 'untitled-theme-editor', premade: 'untitled-theme-editor',
    window: { width: 900, height: 620, rounding: 3, frameless: false, titleHeight: 32 },
    palette: {
      base: '#1E1E1E', surface: '#252526', line: '#3C3C3C', border: '#3C3C3C',
      accent: '#4F9FEE', accentHover: '#2A7BD4', title: '#E6E6E6', text: '#D4D4D4',
      dim: '#858585', frame: '#333333', frameHover: '#3C3C3C', popup: '#252526',
    },
    fonts: [],
    fontNote: 'The repo serialises FontSizeBase / FontScaleMain / FontScaleDpi but ships no TTF, OTF or numeric size.',
    board: true,
    screens: [
      {
        id: 'ut_editor', name: 'UntitledImGuiTheme Theme Editor',
        controls: [
          { kind: 'text', label: 'UntitledImGuiTheme Theme Editor' },
          { kind: 'text', label: 'Load / save a full ImGuiStyle to YAML' },
          { kind: 'combo', label: 'WindowMenuButtonPosition', options: ['None', 'Left', 'Right', 'Up', 'Down'] },
          { kind: 'combo', label: 'ColorButtonPosition', options: ['None', 'Left', 'Right', 'Up', 'Down'] },
          { kind: 'input', label: 'themeLocation', placeholder: '<configDir>/Theme/<name>.theme.yaml' },
          { kind: 'button', label: 'Theme::load', action: 'toast:Theme::load(<configDir>/Theme/...)' },
          { kind: 'button', label: 'Theme::save', action: 'toast:Theme::save(...)' },
          { kind: 'button', label: 'showThemeEditor', action: 'toast:showThemeEditor' },
          { kind: 'button', label: 'showThemeEditorInline', action: 'toast:showThemeEditorInline' },
          { kind: 'stat-readout', label: 'ColourEdit4 row per ImGuiCol name', color: '#4F9FEE' },
        ],
      },
      {
        id: 'ut_colors', name: 'Colour Keys',
        controls: nameRows([
          'Text', 'TextDisabled', 'WindowBg', 'ChildBg', 'PopupBg', 'Border',
          'FrameBg', 'FrameBgHovered', 'FrameBgActive', 'TitleBg', 'TitleBgActive', 'MenuBarBg',
          'ScrollbarGrab', 'CheckMark', 'SliderGrab', 'Button', 'ButtonHovered', 'ButtonActive',
          'Header', 'TabSelected', 'TabDimmed', 'TableHeaderBg', 'TextSelectedBg', 'NavCursor',
        ]),
      },
      {
        id: 'ut_vars', name: 'Style Variables',
        controls: nameRows([
          'FontSizeBase', 'FontScaleMain', 'FontScaleDpi', 'Alpha', 'DisabledAlpha', 'WindowPadding',
          'WindowRounding', 'WindowBorderSize', 'ChildRounding', 'PopupRounding', 'FramePadding',
          'FrameRounding', 'ItemSpacing', 'ItemInnerSpacing', 'CellPadding', 'IndentSpacing',
          'ScrollbarSize', 'ScrollbarRounding', 'GrabMinSize', 'GrabRounding', 'TabRounding',
          'TabBorderSize', 'ImageRounding', 'SeparatorTextPadding',
        ]),
      },
      {
        id: 'ut_semantic', name: 'Semantic Colours',
        controls: nameRows([
          'DestructiveColor', 'DestructiveColorActive', 'SuccessColor', 'SuccessColorActive',
          'WarningColor', 'WarningColorActive', 'TextLink', 'TreeLines', 'DragDropTarget', 'UnsavedMarker',
        ]),
      },
    ],
    chrome: ['UntitledImGuiTheme Theme Editor', 'Theme::load', 'Theme::save', 'showThemeEditor', 'showThemeEditorInline'],
  },

  'clean-menu': {
    id: 'clean-menu',
    name: 'Clean ImGui Menu (Evicted)',
    source: 'vayn1337/Clean-imgui-menu (MIT, upstream Dear ImGui 2014-2022 Omar Cornut) / examples/example_win32_directx9/main.cpp + imgui_draw.cpp + segue_font.h + ico_font.h',
    summary: 'Red-accent overlay titled "Hola!" at 905x624 with 9 icon tabs (LegitBot/RageBot/AntiAim/Visuals/Misc/PlayerList/Skins/Lua/Config). Dark #0F0F0F background, blue #4296FA buttons, embedded Segoe UI (22/40) and icon (19/24/25/40) fonts. Exact labels: Checkbox_0, Slider Intager 1-400, Slider Float 0-5, Aimbot Mode Always/Toggle, Aimbot Keybind, InputText.',
    preset: 'clean-menu', premade: 'clean-menu',
    window: { width: 905, height: 624, rounding: 15, frameless: true, titleHeight: 40 },
    palette: {
      base: '#0F0F0F', surface: '#141414', line: '#171717', border: '#17171766',
      accent: '#BE2727', accentHover: '#4296FAFF', accentActive: '#0F87FAFF',
      title: '#FFFFFF', text: '#FFFFFF', dim: '#808080', popup: '#0F0F0FFF',
      frame: '#171717FF', frameHover: '#4296FA66', frameActive: '#4296FAAB',
      button: '#4296FA66', buttonHover: '#4296FAFF', check: '#302B2BFF',
      tab: '#264168E0', tabActive: '#3369ADFF', titleActive: '#294A7AFF',
    },
    fonts: [
      { role: 'text', file: 'seguoe (embedded Segoe UI)', size: 22 },
      { role: 'heading', file: 'segu (embedded Segoe UI)', size: 40 },
      { role: 'bold', file: 'bold_segue (embedded)', size: 40 },
      { role: 'icon', file: 'ico (embedded)', size: 24 },
      { role: 'iconSmall', file: 'ico_combo (embedded)', size: 19 },
      { role: 'iconButton', file: 'ico_button (embedded)', size: 25 },
      { role: 'iconLarge', file: 'ico_grande (embedded)', size: 40 },
    ],
    fontNote: 'All fonts are embedded byte arrays in segue_font.h / ico_font.h with the Cyrillic glyph range; no TTF file is loaded from disk.',
    geometry: { windowRounding: 15, windowPadding: [0, 0], childRounding: 14, itemSpacing: [0, 3], scrollbarSize: 0.1, frameRounding: 5, popupRounding: 7, tabWidth: 190, tabHeight: 40, optButton: 30, childEditor: [339, 253], childBackground: [339, 210], childAimbot: [339, 258], childKeybinds: [339, 298] },
    tabs: [
      { label: 'P / LegitBot', note: 'P' },
      { label: 'N / RageBot', note: 'N' },
      { label: 'Q / AntiAim', note: 'Q' },
      { label: 'I / Visuals', note: 'I' },
      { label: 'O / Misc', note: 'O' },
      { label: 'R / PlayerList', note: 'R' },
      { label: 'T / Skins', note: 'T' },
      { label: 'J / Lua', note: 'J' },
      { label: 'S / Config', note: 'S' },
    ],
    screens: [
      {
        id: 'clean_legitbot', name: 'LegitBot', parentTab: 'P / LegitBot',
        controls: [
          { kind: 'text', label: 'Child: Editor (339x253)' },
          { kind: 'checkbox', label: 'Checkbox_0', value: false },
          { kind: 'thin-slider', label: 'Slider Intager', min: 1, max: 400, value: 50 },
          { kind: 'thin-slider', label: 'Slider Float', min: 0, max: 5, value: 0 },
          { kind: 'combo', label: 'Aimbot Mode', options: ['Always', 'Toggle'] },
          { kind: 'keybind-button', label: 'Aimbot Keybind', default: 'None', listenText: 'Press a key' },
          { kind: 'text', label: 'Child: Aimbot (339x258)' },
          { kind: 'colorpicker', label: 'Background Color', color: '#BE2727' },
          { kind: 'colorpicker', label: 'Widget Color', color: '#BE2727' },
          { kind: 'button', label: 'L', action: 'toast:L opt button (default false)' },
          { kind: 'button', label: 'B', action: 'toast:B opt button (default true)' },
        ],
      },
      {
        id: 'clean_ragebot', name: 'RageBot', parentTab: 'N / RageBot',
        controls: [
          { kind: 'checkbox', label: 'Checkbox_1' },
          { kind: 'thin-slider', label: 'Slider Float', min: 0, max: 5, value: 0 },
          { kind: 'keybind-button', label: 'Aimbot Keybind', listenText: 'Press a key' },
          { kind: 'combo', label: 'Aimbot Mode', options: ['Always', 'Toggle'] },
        ],
      },
      {
        id: 'clean_visuals', name: 'Visuals', parentTab: 'I / Visuals',
        controls: [
          { kind: 'text', label: 'Child: Background (339x210)' },
          { kind: 'checkbox-colorpicker', label: ['Esp', 'Slider', 'Materials'] },
          { kind: 'combo', label: 'Materials', options: ['Flat', 'Glow', 'Wireframe'] },
          { kind: 'thin-slider', label: 'Slider Intager', min: 1, max: 400, value: 50 },
          { kind: 'stat-readout', label: ['Evicted', 'Benjy Lifetime', 'U', '?'] },
        ],
      },
      {
        id: 'clean_keybinds', name: 'Keybinds', parentTab: 'O / Misc',
        controls: [
          { kind: 'text', label: 'Child: Keybinds (339x298)' },
          { kind: 'keybind-button', label: 'Aimbot Keybind', default: 'None', listenText: 'Press a key' },
          { kind: 'combo', label: 'Bind list', options: ['None', 'Mouse 1', 'Mouse 2', 'Mouse 3', 'Mouse 4', 'Mouse 5', 'Back', 'Tab', 'Enter', 'Shift', 'CTL', 'Space', 'Escape', 'Left', 'Up', 'Right', 'Down'] },
        ],
      },
      {
        id: 'clean_config', name: 'Config', parentTab: 'S / Config',
        controls: [
          { kind: 'text', label: 'Child: Configuration (339x253)' },
          { kind: 'input', label: 'InputText', placeholder: 'InputText' },
          { kind: 'button', label: ['Create', 'Load', 'Save'] },
          { kind: 'stat-readout', label: 'Config UI is a local demo; nothing is written to disk.' },
        ],
      },
    ],
    chrome: ['Hola!', 'Evicted', 'Benjy\nLifetime', 'U', '?', 'Checkbox_0', 'Checkbox_1', 'Slider Intager', 'Slider Float', 'Aimbot Mode', 'Aimbot Keybind', 'InputText', 'None', 'Press a key'],
    keybinds: ['9 tabs, each 190x40, key hints P/N/Q/I/O/R/T/J/S', 'OptButtons L (false) / B (true), 30x30', 'Keybind list: None, Mouse 1-5, Back, Tab, Enter, Shift, CTL, Space, Escape, arrows'],
  },

  'lumin-menu': {
    id: 'lumin-menu',
    name: 'Lumin Free ImGui Menu',
    source: 'poncippg-spec/Lumin-Free-Imgui-Menu (MIT, 2026 Lumin contributors) / framework/gui.cpp + settings/colors.h + widgets/widgets.cpp + data/fonts.h',
    summary: 'Periwinkle-accented #B0B4FF control panel titled "Lumin", 570x354, with a demo license gate and 10 right-side tabs (Player/Shapes/World/Polish/Combat/Aim/Loot/Movement/Visuals/HUD) plus 5 sub-tabs. Feature panels cover Player identity, Weapon row, Skeleton/Line/Vehicle ESP, Radar and text polish. Exact slider ranges and combo options are transcribed from gui.cpp.',
    preset: 'lumin-menu', premade: 'lumin-menu',
    window: { width: 570, height: 354, rounding: 12, frameless: true, titleHeight: 32 },
    palette: {
      base: '#19191C', surface: '#1C1C21', line: '#23232C', border: '#23232C',
      accent: '#B0B4FF', accentHover: '#8471C6', accentActive: '#60588E',
      title: '#FFFFFF', text: '#FFFFFF', dim: '#6E6E81', frame: '#212128',
      frameHover: '#262532', popup: '#121216A0', success: '#4BDC91',
      danger: '#F54656', warning: '#FFBE4B', knob: '#60588E', toggleOn: '#262532',
    },
    fonts: [
      { role: 'text', file: 'inter_semibold (embedded)', size: 12 },
      { role: 'medium', file: 'inter_medium (embedded)', size: 11 },
      { role: 'icon', file: 'icon_font (embedded)', size: 14 },
      { role: 'chevron', file: 'segmdl2.ttf', size: 11 },
      { role: 'uicons', file: 'flaticon_uicons_regular_rounded.ttf', size: 12 },
    ],
    fontNote: 'Embedded Inter/UIcons byte vectors via FreeType, Segoe MDL2 chevrons at size 11; all sizes scaled by DPI 1.5 via s_().',
    geometry: { windowRounding: 12, padding: [10, 10], scrollbar: 10, tabHeight: 32, iconSlot: 32, subTabHeight: 12, checkboxRow: 40, switch: [36.3, 20.9], sliderHeight: 12, knob: 6, panelScale: 1.0, sidebarWidth: 162.5, dpi: 1.5 },
    tabs: [
      { label: 'Player', note: 'player', subTabs: ['Profile', 'Loadout', 'Match', 'Squad', 'Stats'] },
      { label: 'Shapes', note: 'shapes' },
      { label: 'World', note: 'world' },
      { label: 'Polish', note: 'polish' },
      { label: 'Combat', note: 'combat' },
      { label: 'Aim', note: 'aim' },
      { label: 'Loot', note: 'loot' },
      { label: 'Movement', note: 'movement' },
      { label: 'Visuals', note: 'visuals' },
      { label: 'HUD', note: 'hud' },
    ],
    screens: [
      {
        id: 'lumin_login', name: 'Login / License access',
        controls: [
          { kind: 'text', label: 'Lumin', fontSize: 24, bold: true },
          { kind: 'text', label: 'License access' },
          { kind: 'input', label: 'License key', placeholder: 'key' },
          { kind: 'filled-button', label: 'Activate', action: 'toast:Please wait, account verification' },
          { kind: 'stat-readout', label: ['License key required', 'Invalid license key'] },
          { kind: 'text', label: 'Demo license key: demo (sample UI gate, not real authentication)' },
        ],
      },
      {
        id: 'lumin_profile', name: 'Player identity / Profile', parentTab: 'Player', subTab: true,
        controls: [
          { kind: 'switch', label: 'Player labels', value: true },
          { kind: 'switch', label: 'Use keybind' },
          { kind: 'keybind-button', label: 'Toggle key', default: 'Unbound', listenText: 'Press key' },
          { kind: 'combo', label: 'Label layout', options: ['Compact', 'Stacked', 'Detailed', 'Tournament'] },
          { kind: 'thin-slider', label: 'Label scale', min: 70, max: 150, value: 100 },
          { kind: 'thin-slider', label: 'Label X offset', min: -80, max: 80, value: 0 },
          { kind: 'thin-slider', label: 'Label Y offset', min: -80, max: 80, value: 0 },
          { kind: 'thin-slider', label: 'Label spacing', min: 0, max: 12, value: 0 },
          { kind: 'thin-slider', label: 'Label opacity', min: 0, max: 100, value: 100 },
          { kind: 'colorpicker', label: ['Name color', 'Nation color', 'UID color', 'Team color', 'Bot badge color'], color: '#B0B4FF' },
          { kind: 'checkbox', label: ['Name + nation', 'Player UID', 'Team ID', 'Team color coding', 'Bot detection'] },
          { kind: 'button', label: ['Activate profile', 'Copy profile ID', 'Reset profile'] },
          { kind: 'button', label: 'Tournament preset', action: 'toast:Preset applied: Tournament profile' },
          { kind: 'thin-slider', label: 'GUI scale', min: 100, max: 200, value: 100 },
        ],
      },
      {
        id: 'lumin_weapon', name: 'Weapon row', parentTab: 'Player',
        controls: [
          { kind: 'switch', label: 'Weapon name', value: true },
          { kind: 'combo', label: 'Weapon layout', options: ['Text only', 'Icon + text', 'Ammo focused', 'Full row'] },
          { kind: 'thin-slider', label: 'Weapon Y offset', min: -20, max: 80, value: 0 },
          { kind: 'thin-slider', label: 'Weapon opacity', min: 0, max: 100, value: 100 },
          { kind: 'thin-slider', label: 'Icon size', min: 70, max: 140, value: 100 },
          { kind: 'thin-slider', label: 'Ammo spacing', min: 0, max: 14, value: 0 },
          { kind: 'checkbox', label: ['Weapon icon', 'Ammo clip/reserve', 'Fire mode', 'ADS indicator', 'Firing indicator'] },
          { kind: 'colorpicker', label: ['Weapon text color', 'Weapon icon color', 'Ammo color', 'Fire mode color'], color: '#F5F5FF' },
        ],
      },
      {
        id: 'lumin_skeleton', name: 'Skeleton / Line ESP', parentTab: 'Visuals',
        controls: [
          { kind: 'switch', label: 'Skeleton master', value: true },
          { kind: 'thin-slider', label: 'Bone thickness', min: 0.5, max: 5, value: 1 },
          { kind: 'thin-slider', label: 'Skeleton alpha', min: 0, max: 100, value: 100 },
          { kind: 'thin-slider', label: 'Joint size', min: 0, max: 8, value: 0 },
          { kind: 'thin-slider', label: 'Head radius', min: 2, max: 22, value: 4 },
          { kind: 'checkbox', label: ['Full bone skeleton', 'Distance thickness', 'Health coloring', 'Visible only', 'Head/neck circle', 'Predicted bones'] },
          { kind: 'switch', label: 'Snaplines master' },
          { kind: 'thin-slider', label: 'Line thickness', min: 0.5, max: 4, value: 1 },
          { kind: 'thin-slider', label: 'Line alpha', min: 0, max: 100, value: 100 },
          { kind: 'thin-slider', label: 'Origin offset', min: -120, max: 120, value: 0 },
          { kind: 'checkbox', label: ['Bottom snaplines', 'Crosshair snaplines', 'Local player lines', 'Head-only lines', 'Line stats'] },
          { kind: 'colorpicker', label: ['Skeleton color', 'Head circle color', 'Predicted bone color', 'Line color', 'Line shadow color', 'Line text color'], color: '#EBEBFF' },
        ],
      },
      {
        id: 'lumin_radar', name: 'Radar visuals', parentTab: 'Visuals',
        controls: [
          { kind: 'switch', label: 'Radar/minimap', value: true },
          { kind: 'thin-slider', label: 'Radar radius', min: 60, max: 220, value: 100 },
          { kind: 'thin-slider', label: 'Radar scale', min: 20, max: 160, value: 100 },
          { kind: 'thin-slider', label: 'Point size', min: 2, max: 12, value: 4 },
          { kind: 'thin-slider', label: 'Radar opacity', min: 0, max: 100, value: 100 },
          { kind: 'thin-slider', label: 'Radar border', min: 0, max: 5, value: 1 },
          { kind: 'checkbox', label: ['3D head spheres', 'Velocity lines', 'Aim point spheres'] },
          { kind: 'colorpicker', label: ['Radar color', 'Radar background', 'Radar enemy color', 'Radar team color'], color: '#B0B4FF' },
        ],
      },
      {
        id: 'lumin_search', name: 'Search / status', parentTab: 'HUD',
        controls: [
          { kind: 'input', label: 'Search', placeholder: 'Search' },
          { kind: 'stat-readout', label: ['ENABLED', 'DISABLED', 'ERROR', 'DANGER', 'WARNING', 'SAFE', 'STATUS'] },
          { kind: 'stat-readout', label: ['Function enabled', 'Function disabled', 'Profile activated', 'Copied to clipboard', 'Profile reset queued', 'Preset applied'] },
          { kind: 'text', label: ['High signal item. Use only when this detail is worth the extra exposure.', 'Medium signal item. Useful, but it can add visual noise fast.', 'Low signal item. Stable for normal use and clean defaults.'] },
          { kind: 'keybind-button', label: 'Toggle key', default: 'Unbound', listenText: 'Press key' },
        ],
      },
    ],
    chrome: ['Lumin', 'License access', 'License key', 'Activate', 'Control panel', 'Active user', 'Search', 'Player', 'Shapes', 'World', 'Polish', 'Combat', 'Aim', 'Loot', 'Movement', 'Visuals', 'HUD', 'Quick settings'],
    keybinds: ['Keybind widget: Unbound / Press key, Ctrl + / Shift + / Alt + / Super + / Key N', 'Demo license key: demo'],
  },

  'hello-imgui-themes': {
    id: 'hello-imgui-themes',
    name: 'hello_imgui Theme Library',
    source: 'pthom/hello_imgui (MIT, 2019-2020 Pascal Thomet) / src/hello_imgui/impl/imgui_theme.cpp + imgui_theme.h + demos',
    summary: '17 named themes (plus a Count sentinel) from hello_imgui, with readability overrides applied. Exact palettes are boarded for MaterialFlat, PhotoshopStyle, GrayVariations, Cherry, Darcula, SoDark, LightRounded and the classic/dark/light families. The Theme Tweaks window exposes exact checkboxes and sliders; classic demo strings and DroidSans/Akronim/NotoEmoji/Playbox fonts are preserved.',
    preset: 'hello-imgui-themes', premade: 'hello-imgui-themes',
    window: { width: 900, height: 620, rounding: 3, frameless: false, titleHeight: 32 },
    palette: {
      base: '#2C313C', surface: '#1B1D23', line: '#3C5686', border: '#3C5686',
      accent: '#4F9FEE', accentHover: '#4F9FEE40', title: '#D4D8E0', text: '#D4D8E0',
      dim: '#808080', frame: '#1B1D2380', frameHover: '#4F9FEE40', popup: '#2C313C',
      check: '#4F9FEE', header: '#404859', tabSelected: '#3871A9',
    },
    fonts: [
      { role: 'text', file: 'fonts/DroidSans.ttf', size: 15 },
      { role: 'title', file: 'fonts/DroidSans.ttf', size: 18 },
      { role: 'icon', file: 'fonts/fontawesome-webfont.ttf', size: 24 },
      { role: 'display', file: 'fonts/Akronim-Regular.ttf', size: 40 },
      { role: 'emoji', file: 'fonts/NotoEmoji-Regular.ttf', size: 24 },
      { role: 'color', file: 'fonts/Playbox/Playbox-FREE.otf', size: 24 },
    ],
    fontNote: 'Theme file grants reuse with attribution; attributions: Material Flat by ImJC1C, Photoshop by Derydoca, Cherry by r-lyeh, Darcula by ice1000, LightRounded from ImThemes.',
    board: true,
    screens: [
      {
        id: 'hi_selector', name: 'Theme Tweaks / Available Themes',
        controls: [
          { kind: 'text', label: 'Available Themes' },
          { kind: 'config-list', label: ['ImGuiColorsClassic', 'ImGuiColorsLight', 'ImGuiColorsDark', 'MaterialFlat', 'PhotoshopStyle', 'GrayVariations', 'GrayVariations_Darker', 'MicrosoftStyle', 'Cherry', 'Darcula', 'DarculaDarker', 'LightRounded', 'SoDark_AccentBlue', 'SoDark_AccentYellow', 'SoDark_AccentRed', 'BlackIsBlack', 'WhiteIsWhite'] },
          { kind: 'text', label: 'Main tweaks' },
          { kind: 'text', label: 'Color theme' },
          { kind: 'checkbox', label: ['Alpha Multiplier / Background transparency', 'Rounding / all widgets', 'Hue / all widgets', 'Saturation multiplier / all widgets', 'Value multiplier / widgets', 'Value multiplier / backgrounds', 'Value multiplier / texts', 'Value multiplier / FrameBg', 'Test on ImGui Demo Window'] },
          { kind: 'thin-slider', label: 'Alpha multiplier', min: 0, max: 2, value: 1 },
          { kind: 'thin-slider', label: 'Rounding', min: 0, max: 20, value: 3 },
          { kind: 'thin-slider', label: 'Rounding scrollbar ratio', min: 0, max: 20, value: 4 },
          { kind: 'thin-slider', label: 'Hue', min: 0, max: 1, value: 0 },
          { kind: 'thin-slider', label: 'Saturation multiplier', min: 0, max: 3, value: 1 },
          { kind: 'thin-slider', label: 'Value multiplier Front', min: 0, max: 3, value: 1 },
          { kind: 'thin-slider', label: 'Value multiplier Bg', min: 0, max: 10, value: 1 },
          { kind: 'thin-slider', label: 'Value multiplier texts', min: 0, max: 10, value: 1 },
          { kind: 'thin-slider', label: 'Value multiplier FrameBg', min: 0, max: 10, value: 1 },
        ],
      },
      {
        id: 'hi_material', name: 'MaterialFlat',
        controls: paletteRows([
          ['Text = #D4D8E0', '#D4D8E0'], ['WindowBg = #2C313C', '#2C313C'],
          ['FrameBg = #1B1D2380', '#1B1D2380'], ['FrameBgActive = #4F9FEE', '#4F9FEE'],
          ['Button = #5A6B7180', '#5A6B7180'], ['ButtonHovered = #272D36', '#272D36'],
          ['CheckMark = #4F9FEE', '#4F9FEE'], ['Header = #404859', '#404859'],
          ['TabSelected = #3871A9', '#3871A9'], ['Border = #3C5686', '#3C5686'],
          ['ScrollbarGrab = #888888', '#888888'], ['Separator = #6D6D7F80', '#6D6D7F80'],
        ]),
      },
      {
        id: 'hi_photoshop', name: 'PhotoshopStyle',
        controls: paletteRows([
          ['Text = #FFFFFF', '#FFFFFF'], ['TextDisabled = #7F7F7F', '#7F7F7F'],
          ['WindowBg = #2D2D2D', '#2D2D2D'], ['PopupBg = #4F4F4F', '#4F4F4F'],
          ['FrameBg = #3C3C3C', '#3C3C3C'], ['Button = #FFFFFF23', '#FFFFFF23'],
          ['Header = #4F4F4F', '#4F4F4F'], ['CheckMark = #FFFFFF', '#FFFFFF'],
          ['Separator = #4D4D4D', '#4D4D4D'], ['Border = #5C5C5CA8', '#5C5C5CA8'],
          ['TabSelected = #393939', '#393939'], ['ScrollbarGrab = #585858', '#585858'],
        ]),
      },
      {
        id: 'hi_gray', name: 'GrayVariations / MicrosoftStyle',
        controls: paletteRows([
          ['Text = #191919', '#191919'], ['WindowBg = #F2F2F2', '#F2F2F2'],
          ['FrameBg = #FFFFFF', '#FFFFFF'], ['Button = #DBDBDB', '#DBDBDB'],
          ['Header = #DBDBDB', '#DBDBDB'], ['CheckMark = #191919', '#191919'],
          ['TitleBgActive = #3268AD', '#3268AD'], ['ScrollbarGrab = #AFAFAF', '#AFAFAF'],
          ['Border = #999999', '#999999'], ['MenuBarBg = #DBDBDB', '#DBDBDB'],
          ['TabSelected = #96B3D6', '#96B3D6'], ['Tab = #C7C9CFDB', '#C7C9CFDB'],
        ]),
      },
      {
        id: 'hi_cherry', name: 'Cherry',
        controls: paletteRows([
          ['Text = #DBEDE3E0', '#DBEDE3E0'], ['WindowBg = #21232B', '#21232B'],
          ['FrameBg = #333844', '#333844'], ['FrameBgHovered = #74324CC7', '#74324CC7'],
          ['Button = #CD73C247', '#CD73C247'], ['Header = #74324CC2', '#74324CC2'],
          ['CheckMark = #B53844', '#B53844'], ['Border = #853F7D9E', '#853F7D9E'],
          ['TabSelected = #A02E93', '#A02E93'], ['ScrollbarGrab = #8D4D85', '#8D4D85'],
          ['SliderGrab = #77C4D3C7', '#77C4D3C7'], ['TitleBgActive = #801341', '#801341'],
        ]),
      },
      {
        id: 'hi_darcula', name: 'Darcula / DarculaDarker',
        controls: paletteRows([
          ['Text = #BBBBBB', '#BBBBBB'], ['WindowBg = #3C3F41F0', '#3C3F41F0'],
          ['FrameBg = #2B2B2B8A', '#2B2B2B8A'], ['Button = #555A5CDE', '#555A5CDE'],
          ['Header = #555A5CB5', '#555A5CB5'], ['CheckMark = #E5E5E5D4', '#E5E5E5D4'],
          ['TabSelected = #2C5C99', '#2C5C99'], ['ScrollbarGrab = #716E8C', '#716E8C'],
          ['Border = #88888880', '#88888880'], ['MenuBarBg = #45494ACC', '#45494ACC'],
          ['FrameBgActive = #787878AB', '#787878AB'], ['TextSelectedBg = #2F65CAE6', '#2F65CAE6'],
        ]),
      },
      {
        id: 'hi_sodark', name: 'SoDark accents / BlackIsBlack / WhiteIsWhite',
        controls: paletteRows([
          ['Text = #FFFFFF', '#FFFFFF'], ['WindowBg = #1A1A1A', '#1A1A1A'],
          ['PopupBg = #303030EB', '#303030EB'], ['FrameBg = #4040408A', '#4040408A'],
          ['Button = #4D4D4D9E', '#4D4D4D9E'], ['Header = #363636', '#363636'],
          ['CheckMark = #54ABDB', '#54ABDB'], ['TabSelected = #333333F5', '#333333F5'],
          ['ScrollbarGrab = #575757C7', '#575757C7'], ['Border = #63636396', '#63636396'],
          ['Button (black accent) = #1E1E1E', '#1E1E1E'], ['WindowBg (white) = #FFFFFF', '#FFFFFF'],
        ]),
      },
      {
        id: 'hi_light', name: 'LightRounded',
        controls: paletteRows([
          ['Text = #000000', '#000000'], ['WindowBg = #F5F3F3', '#F5F3F3'],
          ['PopupBg = #FFFFFFFA', '#FFFFFFFA'], ['FrameBg = #FFFFFF', '#FFFFFF'],
          ['Button = #4296FA66', '#4296FA66'], ['Header = #4296FA4F', '#4296FA4F'],
          ['CheckMark = #4296FA', '#4296FA'], ['TabSelected = #97B9E1', '#97B9E1'],
          ['ScrollbarGrab = #AFAFAFCC', '#AFAFAFCC'], ['Border = #0000004D', '#0000004D'],
          ['TitleBgActive = #D1D1D1', '#D1D1D1'], ['TableHeaderBg = #C6DDF9', '#C6DDF9'],
        ]),
      },
      {
        id: 'hi_demo', name: 'Classic / Docking demo widgets',
        controls: [
          { kind: 'text', label: 'Hello, world!', fontSize: 24, bold: true },
          { kind: 'text', label: 'Another Window' },
          { kind: 'text', label: ['An icon from fontawesome', 'Custom font', 'This is some useful text.', 'Application average %.3f ms/frame (%.1f FPS)', 'Hello from another window!'] },
          { kind: 'checkbox', label: ['Demo Window', 'Another Window'] },
          { kind: 'thin-slider', label: 'float', min: 0, max: 1, value: 0 },
          { kind: 'colorpicker', label: 'clear color', color: '#4F9FEE' },
          { kind: 'button', label: ['Button', 'Quit', 'Close Me'] },
          { kind: 'text', label: 'counter = %d' },
          { kind: 'combo', label: 'Switch between layouts', options: ['Default', 'Alternative Layout', 'Tabs Layout'] },
          { kind: 'input', label: 'Motto', placeholder: 'Input text' },
          { kind: 'thin-slider', label: 'Value', min: 0, max: 100, value: 0 },
          { kind: 'stat-readout', label: ['Cherry', 'DarculaDarker', 'Theme Tweaks', 'Style Editor'] },
        ],
      },
    ],
    chrome: ['ImGuiColorsClassic', 'ImGuiColorsLight', 'ImGuiColorsDark', 'MaterialFlat', 'PhotoshopStyle', 'GrayVariations', 'GrayVariations_Darker', 'MicrosoftStyle', 'Cherry', 'Darcula', 'DarculaDarker', 'LightRounded', 'SoDark_AccentBlue', 'SoDark_AccentYellow', 'SoDark_AccentRed', 'BlackIsBlack', 'WhiteIsWhite', 'Theme Tweaks', 'Available Themes', 'Style Editor'],
    keybinds: ['17 themes + ImGuiTheme_Count sentinel', 'Theme selector cycles i % nbThemes starting at index 3'],
  },
};

export const UI_KIT_IDS = Object.keys(UI_KITS);

export function listKits() {
  return UI_KIT_IDS.map((id) => ({
    id, name: UI_KITS[id].name, summary: UI_KITS[id].summary,
    preset: UI_KITS[id].preset, premade: UI_KITS[id].premade,
    screens: UI_KITS[id].screens.length,
  }));
}

export function getKit(id) {
  return UI_KITS[id] || null;
}

/** All controls across every kit, optionally filtered by text/kind. */
export function searchKitControls(query = '', kitId = null) {
  const q = String(query || '').toLowerCase().trim();
  const out = [];
  for (const kit of (kitId ? [UI_KITS[kitId]].filter(Boolean) : Object.values(UI_KITS))) {
    for (const screen of kit.screens) {
      for (const control of screen.controls) {
        const labels = Array.isArray(control.label) ? control.label : [control.label];
        const haystack = labels.join(' ');
        if (!q || haystack.toLowerCase().includes(q) || String(control.kind).includes(q)) {
          out.push({ kit: kit.id, screen: screen.id, screenName: screen.name, ...control });
        }
      }
    }
  }
  return out;
}

/** Compact single-line-per-fact summary for prompt injection. */
export function kitKnowledgeText(kitId = null) {
  const kits = kitId ? [UI_KITS[kitId]].filter(Boolean) : Object.values(UI_KITS);
  const lines = [];
  for (const kit of kits) {
    lines.push(`DESIGN SYSTEM ${kit.id}: ${kit.summary}`);
    lines.push(`  window ${kit.window.width}x${kit.window.height}${kit.window.titleHeight ? `, title ${kit.window.titleHeight}px` : ''}`);
    lines.push(`  palette ${Object.entries(kit.palette).map(([k, v]) => `${k}=${v}`).join(' ')}`);
    lines.push(`  fonts ${kit.fonts.map((f) => `${f.role}:${f.size}`).join(' ')}`);
    if (kit.fontNote) lines.push(`  font note ${kit.fontNote}`);
    if (kit.tabs) lines.push(`  tabs ${kit.tabs.map((t) => `${t.label}(${(t.subTabs || []).join(',') || t.note || 'no sub-tabs'})`).join(' | ')}`);
    for (const screen of kit.screens) {
      lines.push(`  screen ${screen.name}: ${screen.controls.map((c) => (Array.isArray(c.label) ? c.label[0] + '+n' : c.label)).join(', ')}`);
    }
  }
  lines.push('CONTROL RECIPES: ' + Object.entries(CONTROL_RECIPES)
    .map(([name, r]) => `${name}->${r.widget || r.action}`).join(', '));
  return lines.join('\n');
}

/** Quick prompts shown in the AI panel, derived from real source capabilities. */
export function kitSuggestions() {
  return [
    'Recreate the Kali.dev auth loader with SIGN IN / SIGN UP and a dashboard',
    'Build a Cloudy-style light sign-in screen with blue pill buttons and hardware ID chips',
    'Make a Givenchy-style gold top-tab menu with sliders, hotkeys and a config section',
    'Recreate the exact Eon.WTF white-on-charcoal menu with 4 tabs and 11 pages',
    'Build the purple Fortnite External menu with Poppins, thin sliders and a search box',
    'Rebuild the red Hackermarket FN External menu with Outfit icons and weapon configs',
    'Start from the orange loader template with 8 sidebar tabs and GROUP panels',
    'Create a HAT-style categorised kit with collapsible CATEGORY > MODULE groups',
    'Design a LazyUI-style green 3-column combat dashboard with switches and segmented controls',
    'Recreate the neutral grey ImJson JSON theme demo with a Float slider, Button, Counter and Checkbox',
    'Build the purple VISION overlay menu with Recoil/Misc/Settings/Configs tabs and a live colour picker',
    'Recreate the red Evicted Clean ImGui menu titled Hola with 9 icon tabs and Slider Intager',
    'Build the periwinkle Lumin control panel with a license gate and Player/Combat/Visuals tabs',
    'Showcase the 17 hello_imgui themes with the Theme Tweaks sliders and MaterialFlat palette',
    'Add a "Skeletons JointsTTTT" checkbox from the HAT kit',
    'Add a "Maximum range" slider from the LazyUI combat kit',
    'Add an "Aimbot Smoothing" slider from the Hackermarket kit',
    'Add a "Materials" combo with Flat / Glow / Wireframe options',
    'Add a keybind button with Hold / Toggle / Always modes',
    'Add a checkbox colour picker row for ESP options',
    'Add a value chip row for hardware identifiers',
    'Give the selected button a pill shape and blue accent',
    'Add a toast action that says this is a UI demo only',
  ];
}

/* ------------------------------------------------------------------ *
 * Turning the catalog back into editable projects / AI patches.
 * These helpers use the same project schema as model.js and premade.js,
 * so every generated control stays editable in the inspector.
 * ------------------------------------------------------------------ */

const safeId = (s) => String(s || '').replace(/[^A-Za-z0-9_]/g, '').toLowerCase();

function controlProps(control, kit, recipe) {
  const props = { ...(recipe.props || {}) };
  const accent = kit.palette.accentMain || kit.palette.accent || kit.palette.blue || kit.palette.button || '#00E0B8';
  const text = kit.palette.text || kit.palette.textActive || '#FFFFFF';
  const frame = kit.palette.card || kit.palette.cardBg || kit.palette.body || kit.palette.frame || '#16161D';
  const border = kit.palette.border || kit.palette.line || '#2A3245';
  if (recipe.widget === 'slider') {
    if (control.min !== undefined) props.min = control.min;
    if (control.max !== undefined) props.max = control.max;
    props.accent = accent;
    props.trackH = kit.id === 'givenchy-gold' ? 5 : 8;
    props.knobSize = kit.id === 'givenchy-gold' ? 12 : 16;
  }
  if (recipe.widget === 'button') {
    if (!props.bg && kit.id === 'cloudy-light') props.bg = accent;
    if (!props.textColor && kit.id === 'cloudy-light') props.textColor = '#FFFFFF';
    if (!props.bg && kit.id === 'givenchy-gold' && /refresh|load|save|create/i.test(String(control.label))) {
      props.variant = 'outline';
    }
  }
  if (recipe.widget === 'hotkey') {
    if (control.default) props.key = control.default;
    if (control.listenText) props.listenText = control.listenText;
    if (control.mode) props.modeNames = Array.isArray(control.mode) ? control.mode.join('|') : String(control.mode);
    props.accent = accent;
  }
  if (recipe.widget === 'password') props.showToggle = true;
  if (recipe.widget === 'checkbox') props.accent = accent;
  if (recipe.widget === 'colorpicker') props.value = accent;
  if (recipe.widget === 'progress') props.accent = accent;
  if (recipe.widget === 'badge' || recipe.widget === 'chip') {
    props.color = text;
    props.bg = frame;
    props.border = border;
  }
  if (recipe.widget === 'tabs') props.accent = accent;
  if (recipe.widget === 'combo' && Array.isArray(control.options)) props.selected = 0;
  if (recipe.widget === 'text' && control.fontSize) props.fontSize = control.fontSize;
  if (control.color && (recipe.widget === 'text' || recipe.widget === 'badge')) props.color = control.color;
  if (control.value !== undefined && recipe.widget === 'checkbox') props.checked = !!control.value;
  return props;
}

function controlActions(control) {
  const action = control.action;
  if (!action) return [];
  const [kind, ...rest] = String(action).split(':');
  const value = rest.join(':');
  if (kind === 'goto') return [{ type: 'goto', page: value }];
  if (kind === 'toast') return [{ type: 'toast', text: value, kind: 'info' }];
  if (kind === 'login') return [{ type: 'login' }];
  return [];
}

function widgetHeight(kind) {
  if (kind === 'slider' || kind === 'combo' || kind === 'colorpicker') return 44;
  if (kind === 'table' || kind === 'list') return 70;
  if (kind === 'panel') return 60;
  return 34;
}

/** Build a normal, fully editable Wicked project from a sampled design system. */
export function buildKitProject(kitId, options = {}) {
  const kit = UI_KITS[kitId];
  if (!kit) return null;
  const name = options.name || `${kit.name} (UI kit)`;
  const type = options.type || (kit.id === 'givenchy-gold' ? 'window' : 'loader');
  const project = createProject({ name, type, language: options.language || 'cpp', backend: options.backend || 'dx11' });
  applyPreset(project, kit.preset);
  const preset = PRESETS[kit.preset];
  if (preset) {
    project.style = { ...project.style, ...preset.style };
    project.window = { ...project.window, ...preset.window };
    project.titlebar = { ...project.titlebar, ...preset.titlebar };
    project.background = { ...project.background, ...preset.background };
  }
  project.window.width = options.width || kit.window.width;
  project.window.height = options.height || kit.window.height;
  project.window.title = name;
  project.titlebar.title = name;
  project.background.effect = 'none';

  const columns = kit.id === 'givenchy-gold' ? 2 : 1;
  const margin = kit.id === 'givenchy-gold' ? 15 : 26;
  const top = (kit.window.titleHeight || 0) + (kit.tabs ? 76 : 46);
  const colWidth = (project.window.width - margin * 2 - (columns - 1) * 15) / columns;
  const bottom = project.window.height - 24;

  project.pages = kit.screens.map((screen, pageIndex) => {
    const page = createPage(screen.id, screen.name);
    const widgets = [];
    let counter = 0;
    const put = (type, text, x, y, w, h, props = {}, extra = {}) => {
      const id = `${type}_${safeId(kit.id)}_${pageIndex}_${counter++}`;
      const widget = createWidget(type, id, Math.round(x), Math.round(y));
      widget.text = String(text);
      widget.w = Math.round(w);
      widget.h = Math.round(h);
      widget.props = { ...widget.props, ...props };
      if (extra.visibleIf) widget.visibleIf = extra.visibleIf;
      if (extra.actions) widget.actions = [...widget.actions, ...extra.actions];
      if (extra.anim) widget.anim = extra.anim;
      widgets.push(widget);
      return widget;
    };

    if (kit.tabs && kit.tabs.length) {
      put('tabs', kit.tabs.map((tab) => tab.label).join('|'), margin, (kit.window.titleHeight || 0) + 10,
        project.window.width - margin * 2, 30, { accent: kit.palette.accentMain || kit.palette.accent, variant: 'line' });
    }
    let subTabId = '';
    if (screen.subTab && kit.tabs) {
      const parent = kit.tabs.find((tab) => tab.label === screen.parentTab);
      const subs = parent?.subTabs || [];
      if (subs.length) {
        subTabId = `tabs_sub_${safeId(screen.id)}`;
        const widget = put('tabs', subs.join('|'), margin, (kit.window.titleHeight || 0) + 46,
          project.window.width - margin * 2, 26, { accent: kit.palette.accentMain || kit.palette.accent });
        widget.id = subTabId;
      }
    }

    const cursors = Array.from({ length: columns }, () => top);
    for (const control of screen.controls) {
      const recipe = CONTROL_RECIPES[control.kind] || { widget: 'text', props: {} };
      const labels = Array.isArray(control.label) ? control.label : [control.label];
      for (const label of labels) {
        let col = cursors.indexOf(Math.min(...cursors));
        if (cursors[col] > bottom - 40) {
          col = (col + 1) % columns;
          if (cursors[col] > bottom - 40) cursors[col] = top;
        }
        const x = margin + col * (colWidth + 15);
        const y = cursors[col];
        const h = widgetHeight(recipe.widget);
        let text = label == null ? '' : String(label);
        if (recipe.widget === 'combo' || recipe.widget === 'list') {
          const options = Array.isArray(control.options) ? control.options
            : typeof control.options === 'string' ? control.options.split('|') : [];
          if (options.length) text = `${text ? text + ': ' : ''}${options.join('|')}`;
        }
        const props = controlProps(control, kit, recipe);
        const visibleIf = subTabId && screen.subTab && (kit.tabs.find((t) => t.label === screen.parentTab)?.subTabs || [])
          .indexOf(screen.subTab) >= 0
          ? `${subTabId}=${kit.tabs.find((t) => t.label === screen.parentTab).subTabs.indexOf(screen.subTab)}`
          : '';
        put(recipe.widget || 'text', text, x, y, colWidth, h, props, {
          visibleIf, actions: controlActions(control), anim: { type: 'slideUp', delay: Math.min(0.6, counter * 0.03), duration: 0.4 },
        });
        cursors[col] += h + 10;
      }
    }
    page.widgets = widgets;
    return page;
  });
  project.startPage = project.pages[0]?.id || 'main';
  return project;
}

/** Deduplicated, reusable names from every sampled control.
 *  Array labels are expanded so the AI can insert any single named control
 *  (e.g. "Skeletons JointsTTTT") without dragging the whole group along. */
export function controlLexicon() {
  const seen = new Map();
  for (const item of searchKitControls()) {
    const labels = Array.isArray(item.label) ? item.label : [item.label];
    for (const raw of labels) {
      const label = String(raw || '').trim();
      if (!label) continue;
      const key = label.toLowerCase() + '|' + item.kind;
      if (!seen.has(key)) {
        seen.set(key, {
          label, kind: item.kind,
          widget: CONTROL_RECIPES[item.kind]?.widget || 'text',
          kit: item.kit, screen: item.screen, screenName: item.screenName,
          options: item.options || null, min: item.min, max: item.max,
          value: item.value, color: item.color, default: item.default, action: item.action,
        });
      }
    }
  }
  return [...seen.values()];
}

/** Find a sampled control by its visible name (exact match wins). */
export function findKitControl(query, kitId = null) {
  const q = String(query || '').toLowerCase().trim();
  if (q.length < 3) return null;
  const all = controlLexicon().filter((item) => !kitId || item.kit === kitId);
  return all.find((item) => String(item.label || '').toLowerCase().trim() === q)
    || all.find((item) => String(item.label || '').toLowerCase().includes(q))
    || null;
}

/** Turn a lexicon entry (or search hit) into a normal editable widget. */
export function createKitWidget(ref, options = {}) {
  if (!ref) return null;
  const kit = UI_KITS[ref.kit];
  if (!kit) return null;
  const recipe = CONTROL_RECIPES[ref.kind] || { widget: 'text', props: {} };
  const type = recipe.widget || 'text';
  const id = options.id || `${type}_kit_${safeId(ref.label).slice(0, 24) || 'control'}`;
  const widget = createWidget(type, id, Math.round(options.x || 24), Math.round(options.y || 24));
  widget.text = String(ref.label || '');
  widget.w = Math.round(options.w || widget.w);
  widget.h = Math.round(options.h || widgetHeight(type));
  widget.props = { ...widget.props, ...controlProps(ref, kit, recipe) };
  widget.actions = controlActions(ref);
  if (options.anim) widget.anim = options.anim;
  return widget;
}

/** Split a local-AI request into its compact project header and request text. */
function parseAiInput(input) {
  const raw = typeof input === 'string' ? input
    : String(input?.messages?.[Math.max(0, (input.messages?.length || 1) - 1)]?.content || '');
  const split = raw.indexOf('\n\nRequest:');
  const header = split >= 0 ? raw.slice(0, split) : raw;
  const request = split >= 0 ? raw.slice(split + 10) : raw;
  let project = null;
  try {
    const at = header.indexOf('{');
    if (at >= 0) project = JSON.parse(header.slice(at));
  } catch { /* not a project request */ }
  return { project, request };
}

/** Offline patch that reuses a sampled control name in the current project. */
export function lexiconPatchFromRequest(input) {
  const { project, request } = parseAiInput(input);
  if (!project || !Array.isArray(project.pages) || !project.pages.length) return null;
  if (!/\b(add|insert|reuse|create|make|put)\b/i.test(request)) return null;
  const page = project.pages.find((pg) => pg.id === project.startPage) || project.pages[0];
  const existing = Array.isArray(page.widgets) ? page.widgets : [];
  const lex = controlLexicon();
  const exact = (s) => lex.find((item) => item.label.toLowerCase() === String(s || '').toLowerCase().trim()) || null;
  const quoted = [...request.matchAll(/(['"`])([^'"`\n]{3,80})\1/g)].map((m) => m[2]);
  let ref = null;
  // 1. An explicitly quoted name is always the user's intent.
  for (const name of quoted) { ref = exact(name); if (ref) break; }
  // 2. Otherwise an exact multi-word phrase from the request. This is strict so
  //    generic requests ("add an icon button") still reach the base AI.
  if (!ref) {
    const phrase = request
      .replace(/^\s*(please\s+)?(add|insert|reuse|create|make|put|give\s+me|place)\s+(a|an|the)?\s*/i, '')
      .replace(/\s+(control|widget|row|field|here)(?:\s+(to|on|in)\s+(the|my)\s+\w+)?[^.]*$/i, '')
      .replace(/[.!?].*$/, '')
      .trim();
    if (phrase.length >= 5) ref = exact(phrase);
  }
  // 3. Single-token fallback only when the request names a sampled design system.
  if (!ref && detectKitRequests(request).length) {
    const words = request.split(/[^A-Za-z0-9]+/).map((s) => s.trim()).filter((s) => s.length > 4);
    for (const word of words) { ref = exact(word); if (ref) break; }
  }
  if (!ref) return null;
  const maxY = existing.reduce((n, w) => Math.max(n, Number(w.y) + Number(w.h) || 0), 24);
  const widget = createKitWidget(ref, { x: 24, y: Math.min(maxY + 12, 720) });
  if (!widget) return null;
  return JSON.stringify({
    summary: `Added the sampled ${ref.label} control (${CONTROL_RECIPES[ref.kind]?.widget || 'text'}) from ${UI_KITS[ref.kit].name}; it stays fully editable.`,
    pages: [{ id: page.id, name: page.name, widgets: [...existing, widget] }],
  });
}

/** Which sampled design systems does a request ask for? */
export function detectKitRequests(text) {
  const raw = typeof text === 'string' ? text : String(text?.messages?.[text.messages.length - 1]?.content || '');
  const request = raw.includes('\n\nRequest:') ? raw.slice(raw.lastIndexOf('\n\nRequest:') + 10) : raw;
  const q = request.toLowerCase();
  const found = [];
  for (const kit of Object.values(UI_KITS)) {
    const aliases = [kit.id, kit.name.toLowerCase(), kit.id.split('-')[0]];
    if (aliases.some((alias) => alias && q.includes(alias))) found.push(kit.id);
  }
  return [...new Set(found)];
}

/** Build an AI patch (the JSON contract from shared/ai.js) from a request. */
export function kitPatchFromRequest(input) {
  const ids = detectKitRequests(input);
  if (!ids.length) return null;
  const pages = [];
  let project = null;
  for (const id of ids) {
    const built = buildKitProject(id);
    if (!built) continue;
    project = project || built;
    for (const page of built.pages) pages.push({ id: page.id, name: page.name, widgets: page.widgets });
  }
  if (!pages.length || !project) return null;
  const names = ids.map((id) => UI_KITS[id].name).join(' + ');
  return JSON.stringify({
    summary: `Recreated ${names} from the source-derived UI kit catalog. Every control is editable; colours and tabs follow the sampled design system.`,
    newPages: pages,
    style: project.style,
    window: project.window,
    titlebar: project.titlebar,
    background: project.background,
    startPage: pages[0].id,
  });
}

/** Offline "Ask" answer grounded in the same catalog. */
export function kitAnswerFromRequest(input) {
  const ids = detectKitRequests(input);
  if (!ids.length) return null;
  const lines = ids.map((id) => {
    const kit = UI_KITS[id];
    const controls = kit.screens.reduce((n, screen) => n + screen.controls.length, 0);
    return `${kit.name}: ${kit.summary} Window ${kit.window.width}x${kit.window.height}; ` +
      `${kit.screens.length} screen(s), ${controls} sampled control(s), ` +
      `palette ${Object.values(kit.palette).slice(0, 6).join(', ')}. ` +
      `Open it from the "UI design systems" panel or ask Wicked Local to recreate it.`;
  });
  return lines.join('\n\n') + '\n\n' + kitKnowledgeText(ids[0]);
}
