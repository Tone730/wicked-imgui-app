'use strict';
// Runtime check for the self-hosted generic-feed updater.
// Uses the website's generated downloads/latest.json and the attached ZIP.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createUpdater, cmpVersion } = require('./app/src/main/updater.cjs');

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

    console.log('updater runtime tests passed');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
