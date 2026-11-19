// qa.mjs — run every local QA gate in one command, fully offline.
//
//   node qa.mjs
//
// Runs: functional regression, static validation, updater tests, server tests,
// generated-export compile checks, and kit-board visual regression.
import { spawnSync } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const root = dirname(fileURLToPath(import.meta.url));
const steps = [
  ['functional regression', 'node', ['regression.mjs']],
  ['static validation', 'python', ['validate.py']],
  ['updater runtime', 'node', ['test-updater.js']],
  ['server API', 'node', ['C:/Users/Wick/wicked-imgui/server/test.js']],
  ['export compile', 'node', ['compile-exports.mjs']],
  ['visual regression', 'node', ['visual-regression.mjs']],
];
let failed = 0;
for (const [label, cmd, args] of steps) {
  console.log('\n==> ' + label);
  const r = spawnSync(cmd, args, { cwd: root, stdio: 'inherit' });
  if (r.status !== 0) {
    console.log('FAILED: ' + label);
    failed++;
  }
}
console.log('\nqa: ' + steps.length + ' gates, ' + failed + ' failed');
process.exitCode = failed ? 1 : 0;
