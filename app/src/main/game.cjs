// game.cjs - OFFLINE game/target analysis for loader compatibility.
//
// Reads a Windows PE file's import tables as bytes only: the target is NEVER
// executed, injected into, or opened. Used to recommend the ImGui backend and
// pre-fill loader configuration for the game a loader project targets.
'use strict';

const fs = require('fs');

function u16(b, o) { return b.readUInt16LE(o); }
function u32(b, o) { return b.readUInt32LE(o); }

/** Parse PE headers and return architecture + imported DLL names. */
function parsePe(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 0x40 || buf.toString('ascii', 0, 2) !== 'MZ') {
    throw new Error('Not a Windows PE file (missing MZ header).');
  }
  const pe = u32(buf, 0x3c);
  if (pe + 24 > buf.length || buf.toString('ascii', pe, pe + 4) !== 'PE\0\0') {
    throw new Error('Not a Windows PE file (missing PE signature).');
  }
  const machine = u16(buf, pe + 4);
  const sectionCount = u16(buf, pe + 6);
  const optSize = u16(buf, pe + 20);
  const opt = pe + 24;
  const magic = u16(buf, opt);
  if (magic !== 0x10b && magic !== 0x20b) {
    throw new Error('Unsupported PE format (0x' + magic.toString(16) + ').');
  }
  const dd = magic === 0x20b ? opt + 112 : opt + 96; // PE32+ vs PE32 data directories
  const sections = [];
  for (let i = 0; i < sectionCount; i++) {
    const s = pe + 24 + optSize + i * 40;
    if (s + 40 > buf.length) break;
    sections.push({
      virtualSize: u32(buf, s + 8),
      virtualAddress: u32(buf, s + 12),
      rawSize: u32(buf, s + 16),
      rawOffset: u32(buf, s + 20),
    });
  }
  function rvaToOffset(rva) {
    for (const s of sections) {
      const span = Math.max(s.virtualSize, s.rawSize);
      if (rva >= s.virtualAddress && rva < s.virtualAddress + span) {
        const off = s.rawOffset + (rva - s.virtualAddress);
        if (off >= 0 && off < buf.length) return off;
      }
    }
    return -1;
  }
  function cstr(rva, cap) {
    const off = rvaToOffset(rva);
    if (off < 0) return '';
    let end = off;
    while (end < buf.length && end < off + (cap || 512) && buf[end] !== 0) end++;
    return buf.toString('ascii', off, end);
  }
  function readImports(dirIndex, stride) {
    const found = [];
    const rva = u32(buf, dd + dirIndex * 8);
    if (!rva) return found;
    let off = rvaToOffset(rva);
    for (let i = 0; off > 0 && off + stride <= buf.length && i < 512; i++) {
      const nameRva = u32(buf, off + 12);
      if (!nameRva) break;
      const name = cstr(nameRva);
      if (name && /\.dll$/i.test(name)) found.push(name);
      off += stride;
    }
    return found;
  }
  const imports = [...new Set([...readImports(1, 20), ...readImports(13, 32)])]; // import + delay-load
  const arch = machine === 0x8664 ? 'x64' : machine === 0x14c ? 'x86' : null;
  return { arch, machine: '0x' + machine.toString(16), sectionCount: sections.length, imports };
}

const RENDERERS = [
  { id: 'dx12', label: 'DirectX 12', dlls: ['d3d12.dll'], score: 5 },
  { id: 'dx11', label: 'DirectX 11', dlls: ['d3d11.dll'], score: 4 },
  { id: 'dx9', label: 'DirectX 9', dlls: ['d3d9.dll'], score: 2 },
  { id: 'vulkan', label: 'Vulkan', dlls: ['vulkan-1.dll'], score: 3 },
  { id: 'opengl3', label: 'OpenGL 3', dlls: ['opengl32.dll'], score: 1 },
];
const ENGINES = [
  { id: 'unity-il2cpp', label: 'Unity (IL2CPP)', all: ['gameassembly.dll', 'unityplayer.dll'] },
  { id: 'unity', label: 'Unity', any: ['unityplayer.dll'], exclude: ['gameassembly.dll'] },
  { id: 'unreal', label: 'Unreal Engine', any: ['unrealengine.dll', 'ue4editor-core.dll', 'ue5editor-core.dll'] },
  { id: 'source', label: 'Source Engine', all: ['tier0.dll', 'vstdlib.dll'] },
  { id: 'godot', label: 'Godot', any: ['godot.dll', 'libgodot.dll'] },
];
const INPUT = {
  xinput: ['xinput1_4.dll', 'xinput1_3.dll', 'xinput9_1_0.dll', 'xinput1_2.dll', 'xinput1_1.dll'],
  directinput: ['dinput8.dll', 'dinput.dll'],
};

/** Recommend renderer/engine from a list of imported DLL names. */
function detect(imports) {
  const lower = (imports || []).map(s => String(s).toLowerCase());
  const has = arr => arr.some(d => lower.includes(d));
  const all = arr => arr.every(d => lower.includes(d));
  const renderers = RENDERERS.filter(r => has(r.dlls))
    .map(r => ({ id: r.id, label: r.label, score: r.score }))
    .sort((a, b) => b.score - a.score);
  const engines = ENGINES.filter(e => (e.all && all(e.all)) || (e.any && has(e.any) && !(e.exclude && has(e.exclude))))
    .map(e => ({ id: e.id, label: e.label }));
  return {
    renderer: renderers.length ? renderers[0].id : null,
    rendererLabel: renderers.length ? renderers[0].label : null,
    renderers: renderers.map(({ id, label }) => ({ id, label })),
    engine: engines.length ? engines[0].id : null,
    engineLabel: engines.length ? engines[0].label : null,
    engines,
    input: {
      xinput: has(INPUT.xinput),
      directinput: has(INPUT.directinput),
    },
    confidence: renderers.length ? (renderers.length > 1 ? 'multiple' : 'high') : 'unknown',
  };
}

/** Analyze a target file on disk. Never executes it. */
function analyzeTarget(filePath) {
  const buf = fs.readFileSync(filePath);
  const pe = parsePe(buf);
  const detection = detect(pe.imports);
  const name = String(filePath).split(/[\\/]/).pop() || 'target.exe';
  const warnings = [];
  if (!detection.renderer) warnings.push('No graphics API detected from imports — choose the backend manually.');
  if (detection.renderers.length > 1) warnings.push('Several renderers detected — confirm the one the game actually uses.');
  if (!pe.arch) warnings.push('Unknown CPU architecture — loader must match the target (x86/x64).');
  return {
    file: filePath,
    processName: name,
    arch: pe.arch,
    machine: pe.machine,
    imports: pe.imports,
    importCount: pe.imports.length,
    ...detection,
    warnings,
  };
}

/** Build loader configuration from an analysis result (manual overrides win). */
function loaderConfig(analysis, overrides) {
  const o = overrides || {};
  const renderer = o.renderer || analysis.renderer || 'dx11';
  return {
    target: analysis.processName,
    targetPath: analysis.file,
    processName: o.processName || analysis.processName,
    windowClass: o.windowClass || '',
    arch: o.arch || analysis.arch || 'x64',
    renderer,
    engine: o.engine || analysis.engine || 'unknown',
    input: { ...(analysis.input || {}), ...(o.input || {}) },
    attachMode: o.attachMode || 'inject',
    launch: o.launch || { enabled: false, path: '', args: '' },
    note: 'Generated from offline import analysis. Verify against the running game.',
  };
}

module.exports = { parsePe, detect, analyzeTarget, loaderConfig, RENDERERS, ENGINES };
