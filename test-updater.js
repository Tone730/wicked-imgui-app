'use strict';
// Runtime check for the self-hosted generic-feed updater.
// Uses the website's generated downloads/latest.json and the attached ZIP.

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createUpdater, cmpVersion, signedMessage } = require('./app/src/main/updater.cjs');

const site = path.join(__dirname, '..', 'wicked-imgui');
const manifestPath = path.join(site, 'downloads', 'latest.json');

async function main() {
  assert.equal(cmpVersion('2.0.1', '2.0.0'), 1);
  assert.equal(cmpVersion('1.9.0', '2.0.0'), -1);
  assert.equal(cmpVersion('2.0.0', '2.0.0'), 0);

  if (!fs.existsSync(manifestPath)) {
    console.log('SKIP: downloads/latest.json not found');
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const artifact = path.join(site, 'downloads', manifest.file);
  if (!fs.existsSync(artifact)) {
    console.log('SKIP: attached release ZIP not found');
    return;
  }

  const feedUrl = 'http://127.0.0.1:8124/downloads/latest.json';
  const fetchMock = async (url) => {
    const u = String(url);
    if (u.includes('latest.json')) return { ok: true, json: async () => manifest };
    if (u.endsWith(manifest.file)) return { ok: true, body: fs.createReadStream(artifact) };
    throw new Error('unexpected URL ' + u);
  };

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wim-update-'));
  try {
    const opened = [];
    const updater = createUpdater({
      feedUrl,
      currentVersion: '1.9.0',
      dataDir: path.join(tmp, 'update'),
      fetch: fetchMock,
      openPath: async (folder) => opened.push(folder),
      packaged: true,
    });

    let state = await updater.check();
    assert.equal(state.status, 'available', 'newer release is offered');
    assert.equal(state.version, manifest.version);
    assert.equal(state.external, true, 'portable ZIP uses manual extraction');
    assert.equal(state.size, manifest.bytes);

    await updater.download();
    state = updater.state();
    assert.equal(state.status, 'ready', 'ZIP downloaded and verified');
    assert.equal(state.progress, 1);

    const result = await updater.install();
    assert.equal(result.ok, true);
    assert.equal(opened.length, 1, 'verified ZIP folder is opened');

    const current = createUpdater({
      feedUrl,
      currentVersion: manifest.version,
      dataDir: path.join(tmp, 'current'),
      fetch: fetchMock,
    });
    state = await current.check();
    assert.equal(state.status, 'latest');

    const offline = createUpdater({
      currentVersion: '1.0.0',
      dataDir: path.join(tmp, 'offline'),
      fetch: fetchMock,
    });
    state = await offline.check();
    assert.equal(state.status, 'offline', 'no feed means honest offline status');

    const insecureFeed = createUpdater({
      feedUrl: 'http://example.com/downloads/latest.json',
      currentVersion: '1.0.0',
      dataDir: path.join(tmp, 'insecure-feed'),
      fetch: fetchMock,
    });
    state = await insecureFeed.check();
    assert.equal(state.status, 'error', 'plaintext remote feed is rejected');
    assert.equal(state.error, 'insecure_url');

    const insecureAsset = createUpdater({
      feedUrl,
      currentVersion: '1.0.0',
      dataDir: path.join(tmp, 'insecure-asset'),
      fetch: async (u) => ({ ok: true, json: async () => ({ ...manifest, url: 'http://example.com/pkg.zip' }) }),
    });
    state = await insecureAsset.check();
    assert.equal(state.status, 'error', 'plaintext remote download URL is rejected');
    assert.equal(state.error, 'insecure_url');

    // Feed authenticity: a pinned build requires a valid signatureV2.
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
    const pin = publicKey.export({ format: 'jwk' }).x;
    const baseFeed = { ...manifest };
    delete baseFeed.signatureV2;
    const signFeed = (feed) => ({ ...feed,
      signatureV2: crypto.sign(null, Buffer.from(signedMessage(feed)), privateKey).toString('base64url'),
    });
    const signedFeed = signFeed(baseFeed);
    const feedFetch = (feed) => async () => ({ ok: true, json: async () => feed });
    const pinned = (feed, dir) => createUpdater({
      feedUrl, currentVersion: '1.0.0', dataDir: path.join(tmp, dir),
      publicKey: pin, fetch: feedFetch(feed),
    });

    state = await pinned(signedFeed, 'signed').check();
    assert.equal(state.status, 'available', 'valid signed feed is accepted');
    state = await pinned(baseFeed, 'unsigned').check();
    assert.equal(state.error, 'bad_signature', 'pinned build rejects an unsigned feed');
    state = await pinned({ ...signedFeed, sha256: '0'.repeat(64) }, 'tampered').check();
    assert.equal(state.error, 'bad_signature', 'pinned build rejects a tampered feed');
    state = await createUpdater({
      feedUrl, currentVersion: '1.0.0', dataDir: path.join(tmp, 'legacy'),
      fetch: feedFetch(baseFeed),
    }).check();
    assert.equal(state.status, 'available', 'unpinned legacy build still accepts an unsigned feed');

    console.log('updater runtime tests passed');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
