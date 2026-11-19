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
