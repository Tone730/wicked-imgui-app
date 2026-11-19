// qa.mjs — run every local QA gate in one command, fully offline.
//
//   node qa.mjs
//
// Runs: functional regression (which now also verifies all 118 kit-board PNG
// baselines), static validation, updater tests, server tests, and generated-export
// compile checks. The standalone visual gate remains for a clear separate signal
// and for --update baseline regeneration.
import { spawnSync } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const root = dirname(fileURLToPath(import.meta.url));
const steps = [
  ['functional regression', 'node', ['regression.mjs']],
  ['AI intent contract', 'node', ['test-ai-contract.js']],
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
