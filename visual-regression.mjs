// visual-regression.mjs — deterministic PNG snapshots for every UI-kit board.
//
// Fully offline and dependency-free: a tiny RGBA framebuffer is encoded to PNG
// with Node's built-in zlib. Each kit screen ("board") is rendered from the
// same source-of-truth palette/control data the app uses, so any palette or
// control change alters that board's PNG. Baselines live in snapshots/ and are
// compared byte-for-byte.
//
//   node visual-regression.mjs            verify every board against baseline
//   node visual-regression.mjs --update   (re)write baselines, then verify
import { deflateSync } from 'zlib';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SNAP = join(ROOT, 'snapshots');
const UPDATE = process.argv.includes('--update');
const uikit = await import('file:///C:/Users/Wick/WickedImguiMaker/app/src/shared/uikit.js');
const { parseHex } = await import('file:///C:/Users/Wick/WickedImguiMaker/app/src/shared/colors.js');

// ---- minimal PNG encoder ----------------------------------------------------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePng(width, height, pixels) {
  const stride = width * 4;
  const raw = Buffer.alloc(height * (1 + stride));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + stride)] = 0; // filter: none
    pixels.copy(raw, y * (1 + stride) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---- framebuffer ------------------------------------------------------------
class Frame {
  constructor(w, h, bg) { this.w = w; this.h = h; this.buf = Buffer.alloc(w * h * 4); this.fill(0, 0, w, h, bg); }
  px(x, y, c) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const o = (y * this.w + x) * 4;
    this.buf[o] = c.r; this.buf[o + 1] = c.g; this.buf[o + 2] = c.b; this.buf[o + 3] = 0xff;
  }
  fill(x, y, w, h, c) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.px(i, j, c); }
}
const col = (hex, fallback = '#CCCCCC') => {
  const c = parseHex(typeof hex === 'string' && hex.trim() ? hex : fallback);
  return { r: c.r, g: c.g, b: c.b };
};
const hash = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
};

// Draw one kit screen as a board image. Text is represented by deterministic
// bars derived from each label so label/content changes are visible too.
function renderBoard(kit, screen) {
  const rows = Array.isArray(screen.controls) ? screen.controls.length : 0;
  const width = 512;
  const headerH = 26;
  const rowH = 22;
  const height = headerH + rows * rowH + 10;
  const bg = col(kit.palette?.windowBg || kit.palette?.base || '#11151E');
  const accent = col(kit.palette?.accent || kit.palette?.accentMain || '#00E0B8');
  const text = col(kit.palette?.text || '#E6E9F0');
  const border = col(kit.palette?.border || kit.palette?.line || '#2A3245');
  const f = new Frame(width, height, bg);
  f.fill(0, 0, width, headerH, accent);
  f.fill(0, height - 2, width, 2, border);
  for (let i = 0; i < rows; i++) {
    const c = screen.controls[i] || {};
    const y = headerH + i * rowH;
    const label = Array.isArray(c.label) ? c.label.join(' ') : String(c.label ?? c.text ?? '');
    const h = hash(label + '|' + (c.kind || ''));
    // colour swatch + value bar when the board carries an exact source colour
    if (typeof c.color === 'string' && c.color.trim()) {
      const sw = col(c.color);
      f.fill(8, y + 3, 16, 16, sw);
      f.fill(32, y + 8, 120 + (h % 60), 6, sw);
    } else {
      f.fill(8, y + 8, 16, 6, border);
    }
    // deterministic "text" bars: count and widths from the label hash
    const bars = 2 + (h % 4);
    let x = 170;
    for (let b = 0; b < bars; b++) {
      const w = 18 + ((h >>> (b * 4)) % 70);
      if (x + w > width - 8) break;
      f.fill(x, y + 8, w, 5, text);
      x += w + 10;
    }
    f.fill(8, y + rowH - 1, width - 16, 1, border);
  }
  return encodePng(width, height, f.buf);
}

// ---- run --------------------------------------------------------------------
if (UPDATE) mkdirSync(SNAP, { recursive: true });
const kits = uikit.listKits().map((k) => uikit.getKit(k.id));
let snaps = 0, failures = [];
const expected = [];
for (const kit of kits) {
  for (const screen of kit.screens) {
    const name = kit.id + '__' + screen.id + '.png';
    expected.push(name);
    const file = join(SNAP, name);
    const png = renderBoard(kit, screen);
    if (UPDATE || !existsSync(file)) {
      writeFileSync(file, png);
      snaps++;
      continue;
    }
    const baseline = readFileSync(file);
    if (!baseline.equals(png)) failures.push(name);
    snaps++;
  }
}
if (!UPDATE) {
  // remove stale baselines for boards that no longer exist
  for (const f of readdirSync(SNAP)) if (f.endsWith('.png') && !expected.includes(f)) failures.push('stale:' + f);
}
console.log(`visual-regression: ${snaps} kit boards, ${failures.length} mismatch(es)`);
if (failures.length) {
  for (const f of failures.slice(0, 30)) console.log('  FAIL ' + f);
  if (failures.length > 30) console.log('  ... and ' + (failures.length - 30) + ' more');
  console.log('visual-regression: MISMATCH — run with --update if the change is intentional');
  process.exitCode = 1;
} else {
  if (UPDATE) console.log('visual-regression: baselines updated');
  console.log('visual-regression: all green');
}
