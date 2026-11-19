// loaders.js — generic loader/compatibility profiles.
// Describes HOW a menu is hosted (injected DLL, external overlay, standalone
// window, script host, web overlay) and WHICH graphics API it draws through.
// No specific game, title or engine is named anywhere: profiles are building
// blocks the user combines for whatever target they are working with.

export const LOADER_TYPES = {
  internal: {
    label: 'Internal module', icon: 'plug',
    desc: 'Runs inside the target process (DLL/module entry).',
    hooks: ['Present', 'SwapBuffers', 'wndProc'],
    recommended: ['dx11', 'dx12', 'opengl', 'vulkan'],
  },
  external: {
    label: 'External overlay', icon: 'layers',
    desc: 'Separate transparent window over the target.',
    hooks: ['wndProc', 'timer'],
    recommended: ['dx11', 'gdi', 'win32'],
  },
  standalone: {
    label: 'Standalone app', icon: 'monitor',
    desc: 'Normal window, no target attachment.',
    hooks: ['main-loop'],
    recommended: ['dx11', 'opengl', 'vulkan', 'web'],
  },
  manualmap: {
    label: 'Manual map', icon: 'shield',
    desc: 'Manually mapped module with no loader bookkeeping.',
    hooks: ['Present', 'SwapBuffers'],
    recommended: ['dx11', 'dx12', 'opengl'],
  },
  script: {
    label: 'Script host', icon: 'code',
    desc: 'Hosted by a scripting runtime; UI is data-driven.',
    hooks: ['tick', 'event'],
    recommended: ['web', 'gdi'],
  },
  web: {
    label: 'Web overlay', icon: 'globe',
    desc: 'Browser/webview overlay driven by messages.',
    hooks: ['message', 'dom'],
    recommended: ['web'],
  },
};

export const GRAPHICS_APIS = {
  dx9: { label: 'DirectX 9', backend: 'dx9', header: 'imgui_impl_dx9.h', note: 'Legacy; ImGui DX9 backend.' },
  dx10: { label: 'DirectX 10', backend: 'dx10', header: 'imgui_impl_dx10.h', note: 'ImGui DX10 backend.' },
  dx11: { label: 'DirectX 11', backend: 'dx11', header: 'imgui_impl_dx11.h', note: 'Most common desktop backend.' },
  dx12: { label: 'DirectX 12', backend: 'dx12', header: 'imgui_impl_dx12.h', note: 'Needs descriptor heap setup.' },
  opengl: { label: 'OpenGL', backend: 'opengl', header: 'imgui_impl_opengl3.h', note: 'GL 3.x / ES 3.x context.' },
  vulkan: { label: 'Vulkan', backend: 'vulkan', header: 'imgui_impl_vulkan.h', note: 'Needs render pass + descriptor pool.' },
  gdi: { label: 'Win32 GDI', backend: 'gdi', header: 'kavro_win32.h', note: 'Software overlay, no GPU hook.' },
  win32: { label: 'Win32 window', backend: 'win32', header: 'kavro_win32.h', note: 'Plain HWND window and message loop.' },
  web: { label: 'Web / WebView', backend: 'web', header: '', note: 'HTML/CSS/JS overlay, no native backend.' },
};

export const COMPAT_FLAGS = {
  unicode: 'Unicode (UTF-16) window/text APIs',
  dpiAware: 'Per-monitor DPI aware scaling',
  borderless: 'Borderless / layered transparent window',
  clickThrough: 'Optional click-through overlay mode',
  noFocus: 'Do not steal keyboard focus',
  rawInput: 'Raw input / low-level key capture',
  highFps: 'Frame-rate independent animation',
  portableFonts: 'Embed fonts (no system font dependency)',
};

/** Build a compatibility profile for a chosen loader + API. */
export function makeProfile({ loader = 'external', api = 'dx11', flags = [], language = 'cpp', name = '' } = {}) {
  const L = LOADER_TYPES[loader] || LOADER_TYPES.external;
  const A = GRAPHICS_APIS[api] || GRAPHICS_APIS.dx11;
  const warnings = [];
  if (!(A.backend === (L.recommended || []).find((r) => r === A.backend) || (L.recommended || []).includes(api))) {
    warnings.push(`${L.label} is not typically paired with ${A.label}; check your host integration.`);
  }
  return {
    id: `profile_${loader}_${api}`,
    name: String(name || `${L.label} / ${A.label}`),
    loader, api,
    backend: A.backend,
    hooks: [...(L.hooks || [])],
    header: A.header,
    flags: [...new Set(flags)],
    language,
    note: A.note,
    warnings,
  };
}

/** Static, read-only detection of loader/API hints in pasted source. */
export function detectLoaderHints(text) {
  const s = String(text || '');
  const hints = [];
  const add = (type, api, why) => hints.push({ type, api, why });
  if (/\bDllMain\b|\bBOOL\s+APIENTRY\s+DllMain/i.test(s)) add('internal', '', 'DllMain entry point');
  if (/\bManualMap\b|\bLoadLibraryW?\s*\(|\bNtMapViewOfSection\b/i.test(s)) add('manualmap', '', 'manual/module mapping');
  if (/\bCreateThread\b|\bCreateWindowEx\b|\bWS_EX_LAYERED\b|\bSetLayeredWindowAttributes\b/i.test(s)) add('external', '', 'external overlay window');
  if (/\bint\s+main\s*\(|\bWinMain\b|\bSDL_main\b/i.test(s)) add('standalone', '', 'standalone entry point');
  if (/\bpostMessage\s*\(|\bwindow\.addEventListener\s*\(\s*['"]message/i.test(s)) add('web', 'web', 'web message transport');
  if (/\b(job|tick|citizen|framework)\b/i.test(s)) add('script', '', 'script-host style tick');
  if (/Present\s*\(|IDXGISwapChain|DXGI_PRESENT/i.test(s)) add('', 'dx11', 'swapchain Present hook');
  if (/\bID3D12Device\b|\bD3D12_COMMAND_QUEUE/i.test(s)) add('', 'dx12', 'D3D12 device');
  if (/wglSwapBuffers|SwapBuffers\s*\(|ImGui_ImplOpenGL3/i.test(s)) add('', 'opengl', 'OpenGL swap');
  if (/vkQueuePresentKHR|ImGui_ImplVulkan/i.test(s)) add('', 'vulkan', 'Vulkan present');
  if (/IDirect3DDevice9|ImGui_ImplDX9/i.test(s)) add('', 'dx9', 'DX9 device');
  if (/\bGdi\b|BitBlt|UpdateLayeredWindow/i.test(s)) add('', 'gdi', 'GDI drawing');
  const loader = (hints.find((h) => h.type) || {}).type || 'external';
  const api = (hints.find((h) => h.api) || {}).api || 'dx11';
  return { loader, api, hints, profile: makeProfile({ loader, api }) };
}

/** Apply a compatibility profile to a project's export overrides. */
export function applyProfile(project, profile) {
  if (!project || !profile) return project;
  project.overrides = { ...(project.overrides || {}) };
  project.overrides.backend = profile.backend || project.backend;
  project.overrides.loader = profile.loader;
  project.overrides.compatFlags = profile.flags || [];
  project.overrides.hooks = profile.hooks || [];
  project.overrides.compatNote = profile.note || '';
  if (profile.header) project.overrides.renderHeader = profile.header;
  project.backend = profile.backend || project.backend;
  project.modified = Date.now();
  return project;
}

/** Human-readable checklist shown in the UI / export README. */
export function compatibilityChecklist(profile) {
  const p = profile || {};
  const lines = [
    `Target host: ${LOADER_TYPES[p.loader]?.label || p.loader || 'generic'}`,
    `Graphics API: ${GRAPHICS_APIS[p.api]?.label || p.api || 'generic'}`,
    `Backend: ${p.backend || 'dx11'}`,
  ];
  if (p.header) lines.push(`Include: ${p.header}`);
  for (const h of p.hooks || []) lines.push(`Hook/event: ${h}`);
  for (const f of p.flags || []) lines.push(`Feature: ${COMPAT_FLAGS[f] || f}`);
  for (const w of p.warnings || []) lines.push(`Warning: ${w}`);
  lines.push('Verify against the running target — generated runtime files are offline compatibility stubs.');
  return lines;
}
