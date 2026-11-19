'use strict';
// Wicked ImGui Maker — self-hosted generic-feed updater.
//
// Reads the free update manifest written by tools\attach-release.ps1:
//   downloads\latest.json  {version, file, url, bytes, sha256, sha512, notes, channel, kind}
//
// Portable ZIP releases are verified locally, then the folder is opened so the
// user can extract them. Signed installer releases can still use the legacy
// WickedUpdate.exe launcher. If no feed is configured the app stays fully
// offline and reports that honestly instead of making network calls.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const VERSION = /^\d{1,4}\.\d{1,4}\.\d{1,4}$/;
const MAX_BYTES = 2 * 1024 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 9000;

const releaseMessage = (r) =>
  'wicked-release-v2\n' + r.version + '\n' + r.sha256 + '\n' + r.size;

function cmpVersion(a, b) {
  const x = String(a || '0').split('.').map(Number);
  const y = String(b || '0').split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const d = (x[i] || 0) - (y[i] || 0);
    if (d) return d > 0 ? 1 : -1;
  }
  return 0;
}

function isLocalUrl(value) {
  try {
    const u = new URL(String(value || ''));
    return ['localhost', '127.0.0.1', '::1'].includes(u.hostname);
  } catch { return false; }
}

function safeFile(value, fallback) {
  const base = path.basename(String(value || '')).replace(/[^A-Za-z0-9._-]+/g, '-');
  return base || fallback;
}

async function hashFile(file, algorithm) {
  const hash = crypto.createHash(algorithm);
  for await (const chunk of fs.createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}

function sha512Hex(base64) {
  if (!base64) return '';
  try { return Buffer.from(String(base64), 'base64').toString('hex'); }
  catch { return ''; }
}

function createUpdater(options) {
  const opts = options || {};
  const feedUrl = String(opts.feedUrl || '');
  const currentVersion = String(opts.currentVersion || '0.0.0');
  const updatesDir = path.join(String(opts.dataDir || '.'), 'updates');
  const fetchFn = opts.fetch || ((u, init) => fetch(u, init));
  const listeners = new Set();

  let manifest = null;
  let downloaded = null;
  let inflightDownload = null;
  let inflightCheck = null;

  const state = {
    status: 'idle',
    external: false,
    current: currentVersion,
    version: null,
    notes: '',
    size: 0,
    progress: 0,
    required: false,
    error: null,
    announcement: null,
    checkedAt: null,
    channel: 'stable',
    kind: 'Portable build',
    feedUrl,
    url: null,
    sha256: null,
  };

  function set(patch) {
    Object.assign(state, patch);
    for (const listener of listeners) {
      try { listener({ ...state }); } catch { /* a broken listener must not break updates */ }
    }
  }

  function resolveUrl(value) {
    if (!value) return '';
    try { return new URL(String(value), feedUrl || 'http://localhost/').toString(); }
    catch { return ''; }
  }

  function candidateFile(release) {
    return path.join(updatesDir, safeFile(release.file || 'WickedImgui-' + release.version + '.zip', 'wicked-update.zip'));
  }

  function verifySignature(release) {
    if (!release.signature || !opts.publicKey) return true;
    try {
      const jwk = { kty: 'OKP', crv: 'Ed25519', x: opts.publicKey };
      const key = crypto.createPublicKey({ key: jwk, format: 'jwk' });
      return crypto.verify(null, Buffer.from(releaseMessage(release)), key, Buffer.from(String(release.signature), 'base64url'));
    } catch { return false; }
  }

  function parseFeed(data) {
    const raw = data && data.latest ? data.latest : data;
    if (!raw || typeof raw !== 'object') throw new Error('bad_feed');

    const version = String(raw.version || '').replace(/^v/, '');
    if (!VERSION.test(version)) throw new Error('bad_version');

    const bytes = Number(raw.bytes ?? raw.size ?? 0);
    if (!Number.isSafeInteger(bytes) || bytes <= 0 || bytes > MAX_BYTES) throw new Error('bad_size');

    const sha256 = String(raw.sha256 || '').toLowerCase();
    const sha512 = sha512Hex(raw.sha512);
    if (!/^[a-f0-9]{64}$/.test(sha256) && !/^[a-f0-9]{128}$/.test(sha512)) throw new Error('bad_checksum');

    const url = resolveUrl(raw.url || raw.path);
    let protocol = '';
    try { protocol = new URL(url).protocol; } catch { /* checked below */ }
    if (!url || (protocol !== 'https:' && protocol !== 'http:')) {
      const err = new Error('bad_url');
      err.code = 'bad_url';
      throw err;
    }

    const file = safeFile(raw.file || raw.path || url.split('/').pop(), 'wicked-update.zip');
    const release = {
      version,
      bytes,
      sha256: /^[a-f0-9]{64}$/.test(sha256) ? sha256 : '',
      sha512,
      url,
      file,
      notes: String(raw.notes || ''),
      channel: String(raw.channel || 'stable'),
      kind: String(raw.kind || (/\.zip$/i.test(file) ? 'Portable build' : 'Installer')),
      signature: raw.signature || '',
      required: !!(data && data.required) || !!raw.required,
      announcement: (data && data.announcement) || raw.announcement || null,
    };
    if (!verifySignature(release)) throw new Error('bad_signature');
    return release;
  }

  async function verifyFile(file, release) {
    try {
      const info = fs.statSync(file);
      if (!info.isFile() || info.size !== release.bytes) return false;
      if (release.sha256 && await hashFile(file, 'sha256') !== release.sha256) return false;
      if (release.sha512 && await hashFile(file, 'sha512') !== release.sha512) return false;
      return true;
    } catch { return false; }
  }

  async function findDownloaded(release) {
    if (!release) return null;
    const file = candidateFile(release);
    return (await verifyFile(file, release)) ? file : null;
  }

  function forgetOldDownloads(release) {
    try {
      for (const name of fs.readdirSync(updatesDir)) {
        if (name === safeFile(release.file)) continue;
        if (/^wicked-(imgui-)?(setup|portable|update)/i.test(name) || /\.(zip|exe)\.part$/i.test(name)) {
          fs.rmSync(path.join(updatesDir, name), { force: true });
        }
      }
    } catch { /* first run has no folder yet */ }
  }

  async function check({ download = false } = {}) {
    if (inflightCheck) return { ...state };
    inflightCheck = (async () => {
      set({ status: 'checking', error: null, checkedAt: new Date().toISOString() });
      try {
        if (!feedUrl) {
          const err = new Error('feed_not_configured');
          err.code = 'feed_not_configured';
          throw err;
        }
        const response = await fetchFn(feedUrl, { cache: 'no-store', signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
        if (!response.ok) throw new Error('http_' + response.status);
        const release = parseFeed(await response.json());
        manifest = release;

        const found = await findDownloaded(release);
        downloaded = found;
        const newer = cmpVersion(release.version, currentVersion) > 0;
        const portable = /zip|portable/i.test(release.kind + ' ' + path.extname(release.file));
        const canSilentInstall = !!opts.launch && !portable && !!release.signature && verifySignature(release);

        set({
          status: newer ? (found ? 'ready' : 'available') : 'latest',
          version: release.version,
          notes: release.notes,
          size: release.bytes,
          channel: release.channel,
          kind: release.kind,
          url: release.url,
          sha256: release.sha256,
          external: !canSilentInstall,
          required: release.required,
          announcement: release.announcement,
          progress: found ? 1 : 0,
          error: null,
          checkedAt: new Date().toISOString(),
        });

        if (found) forgetOldDownloads(release);
        if (download && newer && !found && canSilentInstall) downloadFile().catch(() => {});
        return { ...state };
      } catch (err) {
        const code = err.code || err.message || 'network';
        const localFeedOnly = code === 'feed_not_configured' || (isLocalUrl(feedUrl) && code !== 'bad_signature' && code !== 'bad_url');
        manifest = null;
        downloaded = null;
        set({
          status: localFeedOnly ? 'offline' : 'error',
          error: String(code),
          notes: localFeedOnly
            ? 'No update feed is published yet. This portable build stays fully offline.'
            : 'The update feed could not be verified.',
          version: null,
          announcement: null,
          required: false,
          progress: 0,
          checkedAt: new Date().toISOString(),
        });
        return { ...state };
      }
    })().finally(() => { inflightCheck = null; });
    return inflightCheck;
  }

  async function downloadFile() {
    if (inflightDownload) return inflightDownload;
    if (!manifest || ['latest', 'offline', 'error'].includes(state.status)) return { ...state };

    inflightDownload = (async () => {
      const release = manifest;
      const destination = candidateFile(release);
      const partial = destination + '.part';
      set({ status: 'downloading', progress: 0, error: null });
      try {
        fs.mkdirSync(updatesDir, { recursive: true });
        const existing = await findDownloaded(release);
        if (existing) {
          downloaded = existing;
          set({ status: 'ready', progress: 1 });
          return { ...state };
        }

        const response = await fetchFn(release.url, { signal: AbortSignal.timeout(120000) });
        if (!response.ok || !response.body) throw new Error('http_' + response.status);

        const hash256 = crypto.createHash('sha256');
        const hash512 = release.sha512 ? crypto.createHash('sha512') : null;
        const output = fs.createWriteStream(partial);
        let received = 0;
        let lastPaint = 0;

        for await (const chunk of response.body) {
          received += chunk.length;
          if (received > release.bytes) throw new Error('bad_size');
          hash256.update(chunk);
          if (hash512) hash512.update(chunk);
          if (!output.write(chunk)) await new Promise((resolve) => output.once('drain', resolve));
          if (Date.now() - lastPaint > 120) {
            lastPaint = Date.now();
            set({ progress: Math.min(1, received / release.bytes) });
          }
        }
        await new Promise((resolve, reject) => output.end((err) => err ? reject(err) : resolve()));

        if (received !== release.bytes) throw new Error('bad_size');
        if (release.sha256 && hash256.digest('hex') !== release.sha256) throw new Error('bad_checksum');
        if (hash512 && hash512.digest('hex') !== release.sha512) throw new Error('bad_checksum');

        fs.renameSync(partial, destination);
        downloaded = destination;
        forgetOldDownloads(release);
        set({ status: 'ready', progress: 1, error: null });
        return { ...state };
      } catch (err) {
        try { fs.rmSync(partial, { force: true }); } catch { /* ignore */ }
        const bad = ['bad_url', 'bad_checksum', 'bad_size', 'bad_signature'].includes(err.message);
        set({ status: 'error', error: bad ? err.message : 'network', progress: 0 });
        return { ...state };
      }
    })().finally(() => { inflightDownload = null; });
    return inflightDownload;
  }

  async function install() {
    if (!manifest) await check();
    if (!manifest) return { ok: false, error: 'not_ready' };
    if (state.status === 'latest' || state.status === 'offline') return { ok: false, error: 'not_ready' };

    if (state.external) {
      if (!downloaded || !(await verifyFile(downloaded, manifest))) {
        await downloadFile();
      }
      if (!downloaded) return { ok: false, error: 'not_ready' };
      try {
        if (opts.openPath) await opts.openPath(path.dirname(downloaded));
        else if (opts.openExternal) await opts.openExternal(manifest.url);
        else return { ok: false, error: 'open_failed' };
        return { ok: true, portable: true, file: downloaded };
      } catch { return { ok: false, error: 'open_failed' }; }
    }

    if (opts.launch && verifySignature(manifest)) {
      set({ status: 'installing' });
      try {
        await opts.launch({
          url: manifest.url,
          sha256: manifest.sha256,
          size: manifest.bytes,
          version: manifest.version,
          notes: manifest.notes,
        });
        return { ok: true };
      } catch {
        set({ status: 'available' });
        return { ok: false, error: 'launch_failed' };
      }
    }

    if (downloaded && opts.runInstaller) {
      set({ status: 'installing' });
      opts.runInstaller(downloaded);
      return { ok: true };
    }
    return { ok: false, error: 'not_ready' };
  }

  return {
    state: () => ({ ...state }),
    check,
    download: downloadFile,
    install,
    onChange(listener) {
      if (typeof listener !== 'function') return () => {};
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

module.exports = { createUpdater, cmpVersion, releaseMessage };
