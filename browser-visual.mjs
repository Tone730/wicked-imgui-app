// browser-visual.mjs — OPTIONAL real-browser screenshot regression layer.
//
// This is deliberately NOT part of `npm test`. It needs Playwright + a Chromium
// browser, which are NOT build dependencies of the app. When either is missing
// the script prints SKIP and exits 0, so it can never break an offline build.
//
//   npm run test:browser              verify representative boards (SKIP if no browser)
//   npm run test:browser -- --update   (re)write browser baselines
//
// Setup (one-off, opt-in):
//   npm i -D playwright
//   npx playwright install chromium
//
// Or drive a system browser without downloading one:
//   BROWSER_EXECUTABLE=/path/to/chrome npm run test:browser -- --update
//
// Each board is rendered as real DOM/CSS from the same kit palette/control data
// the app uses, then screenshotted in headless Chromium and compared to a PNG
// baseline in snapshots/browser/. This complements the dependency-free 118-board
// PNG gate (visual-regression.mjs), which stays the primary check. Because fonts
// can differ between machines, baselines are machine-specific: regenerate them
// with --update on the machine that will run the comparison.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SNAP = join(ROOT, 'snapshots', 'browser');
const UPDATE = process.argv.includes('--update');

const uikit = await import('file:///C:/Users/Wick/WickedImguiMaker/app/src/shared/uikit.js');
const { parseHex } = await import('file:///C:/Users/Wick/WickedImguiMaker/app/src/shared/colors.js');

// Representative spread: dark, light, gold, combat, clean and candy palettes.
const PICK = [
  'kali-dark', 'cloudy-light', 'givenchy-gold',
  'eon-wtf', 'clean-menu', 'imgui-candy',
];

const hex = (value, fallback) => {
  const raw = typeof value === 'string' && value.trim() ? value : fallback;
  const c = parseHex(raw);
  return '#' + [c.r, c.g, c.b].map((n) => (n & 0xff).toString(16).padStart(2, '0')).join('');
};

// Build a self-contained HTML board. Colored geometry is deterministic; text
// uses a plain monospace stack. No external fonts, images or network.
function boardHtml(kit, screen) {
  const p = kit.palette || {};
  const bg = hex(p.windowBg || p.base, '#11151E');
  const accent = hex(p.accent || p.accentMain, '#00E0B8');
  const text = hex(p.text, '#E6E9F0');
  const border = hex(p.border || p.line, '#2A3245');
  const rows = Array.isArray(screen.controls) ? screen.controls : [];
  const rowH = 24;
  const height = 30 + rows.length * rowH + 8;
  const escape = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const parts = rows.map((c, i) => {
    const y = 30 + i * rowH;
    const label = Array.isArray(c.label) ? c.label.join(' ') : String(c.label ?? c.text ?? '');
    const swatch = typeof c.color === 'string' && c.color.trim()
      ? `<div style="position:absolute;left:10px;top:${y + 4}px;width:16px;height:16px;background:${hex(c.color, accent)}"></div>`
      : `<div style="position:absolute;left:10px;top:${y + 9}px;width:16px;height:6px;background:${border}"></div>`;
    return `<div style="position:absolute;left:0;top:${y}px;width:100%;height:${rowH}px;border-bottom:1px solid ${border}">
        ${swatch}
        <span style="position:absolute;left:34px;top:${y + 4}px;font:13px monospace;color:${text}">${escape(label)}</span>
        <span style="position:absolute;right:12px;top:${y + 4}px;font:11px monospace;color:${border}">${escape(c.kind || '')}</span>
      </div>`;
  }).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
      html,body{margin:0;padding:0;background:${bg}}
      #board{position:relative;width:520px;height:${height}px;background:${bg};overflow:hidden}
    </style></head><body><div id="board">
      <div style="position:absolute;left:0;top:0;width:100%;height:30px;background:${accent};display:flex;align-items:center;padding-left:10px;font:bold 14px monospace;color:#08131A">${escape(kit.name || kit.id)}</div>
      ${parts}
    </div></body></html>`;
}

async function main() {
  const boards = [];
  for (const id of PICK) {
    let kit;
    try { kit = uikit.getKit(id); } catch { /* missing kit is fine */ }
    if (kit && Array.isArray(kit.screens) && kit.screens.length) {
      boards.push({ name: id + '__' + kit.screens[0].id + '.png', html: boardHtml(kit, kit.screens[0]) });
    }
  }

  // --- dependency / browser detection: SKIP cleanly, never fail ---------------
  let chromium = null;
  try {
    const mod = await import('playwright').catch(() => import('playwright-core'));
    chromium = mod?.chromium;
  } catch { /* not installed */ }
  if (!chromium) {
    console.log('browser-visual: SKIP — Playwright is not installed (optional layer)');
    return 0;
  }

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}),
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
  } catch (e) {
    console.log('browser-visual: SKIP — no Chromium available (' + String(e.message).split('\n')[0] + ')');
    return 0;
  }

  if (UPDATE) mkdirSync(SNAP, { recursive: true });
  const failures = [];
  try {
    const page = await browser.newPage({ viewport: { width: 560, height: 900 }, deviceScaleFactor: 1 });
    for (const board of boards) {
      await page.setContent(board.html, { waitUntil: 'load' });
      const png = await page.locator('#board').screenshot();
      const file = join(SNAP, board.name);
      if (UPDATE || !existsSync(file)) {
        writeFileSync(file, png);
        continue;
      }
      if (!readFileSync(file).equals(png)) failures.push(board.name);
    }
  } finally {
    await browser.close();
  }

  console.log(`browser-visual: ${boards.length} browser boards, ${failures.length} mismatch(es)`);
  if (failures.length) {
    for (const f of failures) console.log('  FAIL ' + f);
    console.log('browser-visual: MISMATCH — run with --update if the change is intentional');
    return 1;
  }
  console.log(UPDATE ? 'browser-visual: baselines updated' : 'browser-visual: all green');
  return 0;
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) process.exitCode = await main();
