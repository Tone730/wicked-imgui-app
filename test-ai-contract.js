'use strict';
// Structural guard for the minified AI artifacts.
//
// regression.mjs tests AI *behaviour*. This script tests that the load-bearing
// strings and required test coverage documented in AI_CONTRACT.md are still
// present — an edit that silently drops a batch intent, an offline provider or
// a kit-knowledge hook fails here before it can ship.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = __dirname;
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const artifacts = {
  provider: 'app/src/main/ai.cjs',
  prompts: 'app/src/shared/ai.js',
  catalog: 'app/src/shared/uikit.js',
  suite: 'regression.mjs',
};

// Keep in sync with AI_CONTRACT.md.
const needles = {
  provider: [
    'pLocal', '"wicked-local"',
    'function localAiEdit', 'function localAiAnswer',
    'kitPatchFromRequest', 'kitAnswerFromRequest', 'lexiconPatchFromRequest',
    'Batch requests work too: rename text across all pages',
    'restyle every page with a named theme',
    'convert widget types project-wide',
    'No API key or internet connection is required.',
  ],
  prompts: [
    'Batch\\x20requests:', 'rename\\x20text\\x20across\\x20all\\x20pages',
    'restyle\\x20all\\x20pages', 'convert\\x20widget\\x20types',
    'editSystemPrompt', 'applyAiResult', 'parseAiJson',
  ],
  catalog: [
    'findKitControl', 'lexiconPatchFromRequest', 'kitPatchFromRequest',
    'kitAnswerFromRequest', 'KIT_CREDITS', 'listKits',
  ],
  suite: [
    'batch AI ', 'rename across pages', 'restyle all pages', 'convert widget types',
    'lexicon patch inserts a new-kit sampled control', 'UI kit knowledge in AI prompts',
    'local AI add widget', 'advanced AI ',
  ],
};

let checked = 0;
for (const [name, rel] of Object.entries(artifacts)) {
  const source = read(rel);
  for (const needle of needles[name]) {
    assert.ok(source.includes(needle), `${rel} is missing required string: ${needle}`);
    checked++;
  }
}

// The provider is CommonJS; vm.Script parses it without executing any code or
// network call, catching the missing-paren / unbalanced-bracket class of bug.
const provider = read(artifacts.provider);
new vm.Script(provider, { filename: artifacts.provider });
checked++;

// The documented contract itself must ship with the code it describes.
assert.ok(fs.existsSync(path.join(root, 'AI_CONTRACT.md')), 'AI_CONTRACT.md is missing');
checked++;

console.log(`ai-contract: ${checked} checks passed`);
console.log('ai-contract: all green');
