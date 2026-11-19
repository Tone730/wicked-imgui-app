// targetConfig.js - generic loader target configuration and generated config file.
// No game-specific knowledge is baked in: renderer/engine hints come from offline
// PE import analysis (see src/main/game.cjs) and every field can be overridden.
export const RENDERER_LABELS = {
  dx9: 'DirectX 9', dx11: 'DirectX 11', dx12: 'DirectX 12',
  opengl3: 'OpenGL 3', vulkan: 'Vulkan',
};
export const TARGET_FORMAT = 'wicked-loader-target';
export const TARGET_VERSION = 1;

export const TARGET_DEFAULTS = {
  format: TARGET_FORMAT,
  version: TARGET_VERSION,
  processName: '',
  targetPath: '',
  windowClass: '',
  arch: 'x64',
  renderer: 'dx11',
  engine: 'unknown',
  attachMode: 'inject',
  input: { xinput: false, directinput: false },
  launch: { enabled: false, path: '', args: '' },
  note: 'Verify these settings against the running game.',
};

/** Fill missing fields and clamp enum-like values. */
export function normalizeTarget(target) {
  const t = target && typeof target === 'object' ? target : {};
  return {
    ...TARGET_DEFAULTS,
    ...t,
    format: TARGET_FORMAT,
    version: TARGET_VERSION,
    processName: String(t.processName || t.target || ''),
    targetPath: String(t.targetPath || ''),
    windowClass: String(t.windowClass || ''),
    arch: ['x86', 'x64'].includes(t.arch) ? t.arch : 'x64',
    renderer: ['dx9', 'dx11', 'dx12', 'opengl3', 'vulkan'].includes(t.renderer) ? t.renderer : 'dx11',
    engine: String(t.engine || 'unknown'),
    attachMode: ['inject', 'launch', 'attach'].includes(t.attachMode) ? t.attachMode : 'inject',
    input: { ...TARGET_DEFAULTS.input, ...(t.input || {}) },
    launch: { ...TARGET_DEFAULTS.launch, ...(t.launch || {}) },
  };
}

/** Build a target config from an analysis result; manual overrides always win. */
export function configFromAnalysis(analysis, overrides) {
  const a = analysis || {};
  const o = overrides || {};
  return normalizeTarget({
    processName: o.processName || a.processName || '',
    targetPath: o.targetPath || a.file || '',
    windowClass: o.windowClass || '',
    arch: o.arch || a.arch || 'x64',
    renderer: o.renderer || a.renderer || 'dx11',
    engine: o.engine || a.engine || 'unknown',
    input: { ...(a.input || {}), ...(o.input || {}) },
    attachMode: o.attachMode || 'inject',
    launch: o.launch || { enabled: false, path: '', args: '' },
    note: o.note || 'Generated from offline import analysis. Verify against the running game.',
  });
}

/** One-line human-readable summary for tooltips / notes. */
export function targetSummary(target) {
  const t = normalizeTarget(target);
  return (t.processName || 'No target') + ' · ' + t.arch + ' · ' + t.renderer.toUpperCase() + ' · ' + t.engine;
}

/** Generated file for a loader project, or null for a plain window project. */
export function targetConfigFile(project) {
  if (!project || project.type !== 'loader') return null;
  const cfg = normalizeTarget(project.target);
  return {
    path: 'loader.config.json',
    lang: 'json',
    content: JSON.stringify({ ...cfg, project: project.name, backend: project.backend }, null, 2) + '\n',
  };
}
