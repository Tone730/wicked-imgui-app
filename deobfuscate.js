// Decode the custom string-obfuscation layer used by the extracted app.
// Rewrites helper calls such as pM('h6lX',0x50e) into plain string literals,
// then removes the now-unused rotation/decoder machinery.
const fs = require('fs');
const vm = require('vm');

const file = process.argv[2];
let text = fs.readFileSync(file, 'utf8');

function balanced(src, start) {
  let i = src.indexOf('{', start);
  if (i < 0) throw new Error('no opening brace');
  let depth = 0;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return { src: src.slice(start, i + 1), end: i + 1 };
    }
  }
  throw new Error('unbalanced braces');
}

function findFunction(name) {
  const re = new RegExp('function\\s+' + name + '\\s*\\(');
  const m = re.exec(text);
  if (!m) return null;
  const b = balanced(text, m.index);
  return { name, src: b.src, start: m.index, end: b.end };
}

const pFn = findFunction('p');
const yFn = findFunction('y');
const rotStart = text.indexOf('(function(');
const rotRe = text.slice(rotStart).match(/\}\s*\(\s*p\s*,\s*(?:0x[0-9a-f]+|\d+)\s*\)\s*\)\s*;/);
if (!pFn || !yFn || rotStart < 0 || !rotRe) {
  console.log(`SKIP ${file}: no obfuscation layer`);
  process.exit(0);
}
const rotEnd = rotStart + rotRe.index + rotRe[0].length;
const rotSrc = text.slice(rotStart, rotEnd);
const rotSpan = [rotStart, rotEnd];

function newCtx(yImpl) {
  const ctx = { console, parseInt, decodeURIComponent, encodeURIComponent, String, Math, Number, JSON };
  vm.createContext(ctx);
  ctx.y = yImpl;
  vm.runInContext(pFn.src, ctx);
  if (typeof yImpl === 'function') {
    // keep provided y
  } else {
    vm.runInContext(yFn.src, ctx);
  }
  return ctx;
}

// Real decoder context: execute the rotation so p() returns the final array.
const decodeCtx = newCtx(undefined);
vm.runInContext(rotSrc, decodeCtx);

// Recorder context: y records the final index/key instead of decoding.
const traceCtx = newCtx((X, K) => ({ __y: X, __k: K }));

// Collect candidate helper declarations (possibly exported).
const candidates = [];
const helperRe = /(?:export\s+)?function\s+(\w+)\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)\s*\{\s*return\s+(\w+)\s*\(([^;]+)\)\s*;?\s*\}/g;
let hm;
while ((hm = helperRe.exec(text))) {
  const name = hm[1];
  const fnStart = text.indexOf('function', hm.index);
  const b = balanced(text, fnStart);
  candidates.push({ name, fnSrc: b.src, src: text.slice(hm.index, b.end), start: hm.index, end: b.end, base: hm[4] });
}
// Keep only helpers whose return chain ultimately reaches the decoder y().
const byName = new Map();
for (const c of candidates) if (!byName.has(c.name)) byName.set(c.name, c);
function reachesY(name, seen = new Set()) {
  if (name === 'y') return true;
  const c = byName.get(name);
  if (!c || seen.has(name)) return false;
  seen.add(name);
  return reachesY(c.base, seen);
}
const helpers = candidates.filter(c => reachesY(c.name));
for (const h of helpers) {
  const fn = vm.runInContext('(' + h.fnSrc + ')', traceCtx);
  traceCtx[h.name] = fn;
  decodeCtx[h.name] = vm.runInContext('(' + h.fnSrc + ')', decodeCtx);
}
const helperNames = [...new Set(helpers.map(h => h.name))].sort((a, b) => b.length - a.length);
const traceFns = {};
for (const h of helpers) if (!traceFns[h.name]) traceFns[h.name] = traceCtx[h.name];

const ySubMatch = /function\s+y\s*\(\s*X\s*,\s*K\s*\)\s*\{\s*X\s*=\s*X\s*-\s*(0x[0-9a-f]+|\d+)/.exec(text);
const ySub = ySubMatch ? parseInt(ySubMatch[1], 0) : 0;

const ARG = String.raw`(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[+-]?(?:0[xX][0-9a-fA-F]+|\d+))`;
const callRe = new RegExp('\\b(' + helperNames.join('|') + ')\\s*\\(\\s*(' + ARG + ')\\s*,\\s*(' + ARG + ')\\s*\\)', 'g');

// Remove unused obfuscation machinery first, while offsets are still valid.
const removals = [];
const addRemoval = (s, e) => {
  if (s === undefined || e === undefined) return;
  if (removals.some(r => (s >= r[0] && s < r[1]) || (r[0] >= s && r[0] < e))) return;
  removals.push([s, e]);
};
addRemoval(rotSpan[0], rotSpan[1]);
addRemoval(pFn.start, pFn.end);
addRemoval(yFn.start, yFn.end);
for (const h of helpers) {
  if (h.start >= rotSpan[0] && h.end <= rotSpan[1]) continue;
  addRemoval(h.start, h.end);
}
removals.sort((a, b) => b[0] - a[0]);
for (const [s, e] of removals) text = text.slice(0, s) + text.slice(e);

let replaced = 0;
let failed = 0;
text = text.replace(callRe, (full, name, a1, a2, offset) => {
  try {
    const args = [vm.runInContext(a1, traceCtx), vm.runInContext(a2, traceCtx)];
    const marker = traceFns[name](args[0], args[1]);
    if (!marker || marker.__y === undefined) throw new Error('no marker');
    const value = decodeCtx.y(marker.__y, marker.__k);
    if (typeof value !== 'string') throw new Error('not a string');
    replaced++;
    return JSON.stringify(value);
  } catch (e) {
    failed++;
    if (process.env.WICKED_DEOB_DEBUG && failed < 6) console.log('FAIL', file, full, e.message);
    return full;
  }
});

fs.writeFileSync(file, text, 'utf8');
console.log(`${file}: decoded ${replaced} strings, ${failed} failed, removed ${removals.length} blocks`);
