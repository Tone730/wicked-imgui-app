// generate-notices.mjs — regenerate third-party licence artifacts.
//
// Source of truth: the verbatim upstream texts in `licenses/<kit-id>.txt` and
// the kit metadata exported by `app/src/shared/uikit.js`. Running this script
// rewrites two derived files:
//
//   app/src/shared/kitLicenses.js  — in-app full-text lookup for the Credits panel
//   THIRD-PARTY-NOTICES.txt        — distributable notice shipped in the ZIP
//
// Usage: node generate-notices.mjs
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = dirname(fileURLToPath(import.meta.url));
const uikit = await import('file:///C:/Users/Wick/WickedImguiMaker/app/src/shared/uikit.js');
const kits = uikit.listKits();
const licenseDir = join(root, 'licenses');

const texts = {};
for (const kit of kits) {
  const file = join(licenseDir, kit.id + '.txt');
  if (existsSync(file)) texts[kit.id] = readFileSync(file, 'utf8').replace(/\r\n/g, '\n').trimEnd() + '\n';
}

// ---- in-app lookup module ---------------------------------------------------
const moduleLines = [
  '// GENERATED FILE — run `node generate-notices.mjs` after changing licenses/.',
  '// Verbatim upstream licence texts for the bundled kits that ship one.',
  'export const KIT_LICENSE_TEXTS = {',
  ...Object.entries(texts).map(([id, text]) => '  ' + JSON.stringify(id) + ': ' + JSON.stringify(text) + ','),
  '};',
  'export function kitLicenseText(id) { return KIT_LICENSE_TEXTS[id] || null; }',
  '',
];
writeFileSync(join(root, 'app/src/shared/kitLicenses.js'), moduleLines.join('\n'));

// ---- distributable notice --------------------------------------------------
const RULE = '-'.repeat(79);
const withText = kits.filter((k) => texts[k.id]);
const withoutText = kits.filter((k) => !texts[k.id]);
const lines = [
  'WICKED IMGUI MAKER - THIRD-PARTY NOTICES',
  '='.repeat(79),
  '',
  'This build bundles palettes, font roles, control strings and style data',
  'transcribed from the design systems listed below. Every upstream source was',
  'examined statically: no downloaded archive, template or binary was executed.',
  '',
  'Bundled kits: ' + kits.length,
  '  ' + withText.length + ' ship an MIT licence (full verbatim text reproduced below)',
  '  ' + withoutText.length + ' are source samples with no licence in the upstream archive',
  '',
  'A machine-readable copy of each text is also in licenses/<kit-id>.txt.',
  '',
];

let n = 0;
for (const kit of kits) {
  n++;
  const meta = [
    RULE,
    '[' + n + '/' + kits.length + '] ' + kit.name + ' (' + kit.id + ')',
    'Author:  ' + (kit.author || 'Not stated in source'),
    'Licence: ' + (kit.license || 'Unspecified'),
    'Source:  ' + (kit.repo || 'Local archive'),
  ];
  if (kit.attribution) meta.push('Note:    ' + kit.attribution);
  meta.push(RULE);
  lines.push(...meta);
  if (texts[kit.id]) {
    lines.push(texts[kit.id].trimEnd(), '');
  } else {
    lines.push(
      'No licence file was present in this upstream archive. The transcribed',
      'palette and control strings are included as a source sample only; no',
      'licence text is asserted on behalf of the upstream author.',
      ''
    );
  }
}

writeFileSync(join(root, 'THIRD-PARTY-NOTICES.txt'), lines.join('\n'));

// Ensure the licenses directory has no orphan files for kits we no longer ship.
const expected = new Set(kits.filter((k) => texts[k.id]).map((k) => k.id + '.txt'));
for (const f of readdirSync(licenseDir)) {
  if (f.endsWith('.txt') && !expected.has(f)) console.log('WARNING orphan licence file: ' + f);
}
console.log('generate-notices: ' + withText.length + ' licence texts, ' + withoutText.length + ' unlicensed source samples, ' + kits.length + ' kits total');
