// assets.js — offline image/asset support for Wicked ImGui Maker.
// Images are stored as data URLs inside the project so every project stays a
// single, portable, offline JSON file. Helpers also emit compact byte-array
// source snippets for the C++/C#/Rust exporters.
import { uid } from './model.js';

export const ASSET_FORMAT = 'wicked-asset-pack';
export const ASSET_VERSION = 1;
export const MAX_ASSET_BYTES = 8 * 1024 * 1024; // 8 MB per embedded image

const MIME_EXT = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg',
  'image/webp': 'webp', 'image/gif': 'gif', 'image/bmp': 'bmp',
};
const EXT_MIME = Object.fromEntries(Object.entries(MIME_EXT).map(([k, v]) => [v, k]));

/** Convert a base64 string or data URL into a normalised data URL. */
export function normaliseImage(input, fallbackMime = 'image/png') {
  const s = String(input || '').trim();
  if (!s) return '';
  if (/^data:image\//i.test(s)) return s;
  if (/^[A-Za-z0-9+/=\r\n]{40,}$/.test(s)) return `data:${fallbackMime};base64,${s.replace(/\s/g, '')}`;
  return s; // remote URL or relative file — kept as-is for user-supplied sources
}

export function mimeFromDataUrl(url) {
  const m = String(url || '').match(/^data:(image\/[\w.+-]+)/i);
  return m ? m[1].toLowerCase() : '';
}

export function extFromMime(mime) {
  return MIME_EXT[String(mime || '').toLowerCase()] || 'png';
}

export function mimeFromExt(ext) {
  return EXT_MIME[String(ext || '').replace(/^\./, '').toLowerCase()] || 'image/png';
}

/** Build a project asset record from a data URL / base64 string. */
export function createImageAsset(data, name = 'image', options = {}) {
  const url = normaliseImage(data, options.mime || mimeFromExt(name));
  if (!url) throw new Error('No image data');
  const mime = mimeFromDataUrl(url) || options.mime || 'image/png';
  if (url.length > MAX_ASSET_BYTES * 1.4) throw new Error('Image too large (max 8 MB)');
  return {
    id: String(options.id || uid('img_')),
    type: 'image',
    name: String(name || 'image').slice(0, 80),
    file: url,
    url,
    mime,
    ext: extFromMime(mime),
    created: Date.now(),
    ...(options.meta || {}),
  };
}

/** Return the raw base64 payload of an asset (if embedded). */
export function assetBase64(asset) {
  const u = String(asset?.file || asset?.data || '');
  const i = u.indexOf(',');
  return i >= 0 && /^data:/i.test(u) ? u.slice(i + 1) : u;
}

/** Estimate decoded byte length of a base64 payload. */
export function assetSize(asset) {
  const b64 = assetBase64(asset);
  return Math.floor((b64.length * 3) / 4);
}

/** Replace an asset in a project, keeping widget `assetId` references intact. */
export function addAsset(project, asset) {
  if (!project || !asset) return project;
  if (!Array.isArray(project.assets)) project.assets = [];
  const i = project.assets.findIndex((a) => a.id === asset.id);
  if (i >= 0) project.assets[i] = asset; else project.assets.push(asset);
  return project;
}

export function removeAsset(project, id) {
  if (!project || !Array.isArray(project.assets)) return project;
  project.assets = project.assets.filter((a) => a.id !== id);
  for (const page of project.pages || []) for (const w of page.widgets || []) {
    if (w.assetId === id) { delete w.assetId; if (w.type === 'image') w.props = { ...(w.props || {}), texture: '' }; }
  }
  return project;
}

/** Emit a compact C++ byte array for an embedded image. */
export function assetCpp(asset, symbol) {
  const b64 = assetBase64(asset);
  let bytes;
  try { bytes = atob(b64); } catch { return `// ${asset.name}: invalid base64\n`; }
  const name = String(symbol || asset.id || 'image').replace(/[^A-Za-z0-9_]/g, '_');
  const rows = [];
  for (let i = 0; i < bytes.length; i += 20) {
    rows.push('  ' + [...bytes.slice(i, i + 20)].map((c) => `0x${c.charCodeAt(0).toString(16).padStart(2, '0')}`).join(', '));
  }
  return `// ${asset.name} (${asset.mime})\nstatic const unsigned char ${name}_data[] = {\n${rows.join(',\n')}\n};\n`;
}

/** Emit a C# byte array for an embedded image. */
export function assetCsharp(asset, symbol) {
  const b64 = assetBase64(asset);
  let bytes;
  try { bytes = atob(b64); } catch { return `// ${asset.name}: invalid base64\n`; }
  const name = String(symbol || asset.id || 'image').replace(/[^A-Za-z0-9_]/g, '_');
  const hex = [...bytes].map((c) => c.charCodeAt(0).toString('X2')).join('');
  return `// ${asset.name} (${asset.mime})\ninternal static readonly byte[] ${name}_data = Convert.FromHexString("${hex}");\n`;
}

/** Emit a Rust byte array for an embedded image. */
export function assetRust(asset, symbol) {
  const b64 = assetBase64(asset);
  let bytes;
  try { bytes = atob(b64); } catch { return `// ${asset.name}: invalid base64\n`; }
  const name = String(symbol || asset.id || 'image').replace(/[^A-Za-z0-9_]/g, '_').toUpperCase();
  const hex = [...bytes].map((c) => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
  return `// ${asset.name} (${asset.mime})\npub const ${name}_DATA: &[u8] = &[\n  ${hex.match(/.{1,80}/g)?.join('\n  ') || ''}\n];\n`;
}

export function emitAssetSource(project, language = 'cpp') {
  const assets = (project?.assets || []).filter((a) => a.type === 'image' && /^data:/i.test(a.file || ''));
  const fn = language === 'csharp' ? assetCsharp : language === 'rust' ? assetRust : assetCpp;
  return assets.map((a) => fn(a)).join('\n');
}

/** Serialise / parse an offline asset pack for sharing. */
export function exportAssetPack(project, name = 'assets') {
  return JSON.stringify({
    format: ASSET_FORMAT, version: ASSET_VERSION, name,
    exported: Date.now(),
    assets: (project?.assets || []).filter((a) => a.type === 'image'),
  }, null, 2);
}

export function importAssetPack(text) {
  let pack;
  try { pack = JSON.parse(String(text)); } catch { throw new Error('Invalid asset pack JSON'); }
  if (pack?.format !== ASSET_FORMAT || !Array.isArray(pack.assets)) throw new Error('Not a Wicked asset pack');
  const assets = pack.assets.map((a, i) => createImageAsset(a.file || a.data, a.name || `image_${i + 1}`, {
    id: a.id, mime: a.mime, meta: { imported: true },
  }));
  return { name: String(pack.name || 'Imported assets'), assets };
}
