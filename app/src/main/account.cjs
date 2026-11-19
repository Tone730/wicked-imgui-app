'use strict';
/*
 * Wicked ImGui Maker — local full-access account provider.
 *
 * This file intentionally replaces the original license/account client.  The
 * portable build has no backend dependency: every account action resolves to
 * a local Wicked Local Pro identity, and usage is tracked in a local JSON file
 * instead of being sent to a remote licensing service.  No license keys are
 * forged and no network requests are made by any method on the returned object.
 */
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

/* Validation and renderer code look for these exact literal shapes. */
const LOCAL_PROFILE = {
'signedIn':!![],
'email':'full.access@wicked.local',
'name':'Wicked Local',
'plan':'pro',
'expired':![],
'validUntil':'9999-12-31T23:59:59.999Z',
'updatesUntil':null,
'proUntil':null,
'renewsAt':null,
'interval':null,
};

const DAY = 86400000;
const dateKey = d => new Date(d).toISOString().slice(0, 10);

async function machineId(dir) {
  let id = '';
  try {
    if (process.platform === 'win32') {
      id = await new Promise(resolve => {
        try {
          require('child_process').execFile(
            'reg',
            ['query', 'HKLM\\SOFTWARE\\Microsoft\\Cryptography', '/v', 'MachineGuid'],
            { windowsHide: true },
            (err, out) => resolve(err ? '' : (/\sREG_SZ\s+(\S+)/.exec(out || '') || [])[1] || '')
          );
        } catch { resolve(''); }
      });
    } else if (fs.existsSync('/etc/machine-id')) {
      id = fs.readFileSync('/etc/machine-id', 'utf8').trim();
    }
  } catch { /* offline: ignore */ }
  if (!id) {
    try {
      const file = path.join(dir || os.tmpdir(), 'device-id');
      try {
        id = fs.readFileSync(file, 'utf8').trim();
      } catch {
        id = crypto.randomUUID();
        fs.mkdirSync(dir || os.tmpdir(), { recursive: true });
        fs.writeFileSync(file, id);
      }
    } catch { id = crypto.randomUUID(); }
  }
  return crypto.createHash('sha256').update('wicked-machine:' + id).digest('hex');
}

function createAccount(V) {
  const opts = V || {};
  const dataDir = opts.dataDir || path.join(os.homedir(), '.wicked-imgui-maker');
  const usageFile = path.join(dataDir, 'local-usage.json');
  const listeners = new Set();
  let state = loadState();

  function blankState() {
    return { days: {} };
  }

  function loadState() {
    try {
      const parsed = JSON.parse(fs.readFileSync(usageFile, 'utf8'));
      if (parsed && parsed.days && typeof parsed.days === 'object') return parsed;
    } catch { /* first run */ }
    return blankState();
  }

  function saveState() {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
      fs.writeFileSync(usageFile, JSON.stringify(state), { mode: 0o600 });
    } catch { /* best effort: usage is a convenience, never a blocker */ }
  }

  function stats() {
    const keys = Object.keys(state.days).sort();
    const sum = list => list.reduce((n, k) => n + (Number(state.days[k]) || 0), 0);
    const todayKey = dateKey(Date.now());
    const monthFloor = dateKey(Date.now() - 30 * DAY);
    return {
      today: Number(state.days[todayKey]) || 0,
      week: sum(keys.slice(-7)),
      month: sum(keys.filter(k => k >= monthFloor)),
      total: sum(keys),
      days: Array.from({ length: 7 }, (_, i) => {
        const key = dateKey(Date.now() - (6 - i) * DAY);
        return { day: key, minutes: Number(state.days[key]) || 0 };
      }),
    };
  }

  function emit() {
    const snapshot = { ...LOCAL_PROFILE };
    for (const cb of listeners) {
      try { cb(snapshot); } catch { /* listener error must not break account */ }
    }
  }

  const status = () => ({ ...LOCAL_PROFILE });
  const isPro = () => true;

  return {
    async init() {
      emit();
      return status();
    },
    status,
    isPro,
    async runtimeKey() {
      /* Offline runtime sources are shipped directly; no decryption key needed. */
      return null;
    },
    onChange(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    async login() {
      emit();
      return status();
    },
    async refresh() {
      return status();
    },
    async redeem() {
      emit();
      return status();
    },
    async ping(data) {
      /* createUsage() reports elapsed active minutes here. Keep them local. */
      const minutes = data && Number(data.minutes);
      if (minutes > 0) {
        const key = dateKey(Date.now());
        state.days[key] = (Number(state.days[key]) || 0) + minutes;
        saveState();
        emit();
      }
      return null;
    },
    async usage() {
      return { ok: true, usage: stats() };
    },
    async clearUsage() {
      state = blankState();
      saveState();
      emit();
      return { ok: true };
    },
    async logout() {
      emit();
      return status();
    },
  };
}

module.exports = { createAccount, machineId };
