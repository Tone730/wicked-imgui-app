// library.js — offline community/template library.
// A local, portable library of shared projects. "Posting" publishes into this
// local library and produces a pack file the user can share by any channel they
// choose. No account, key, sign-in or remote backend is required or contacted.
// Users may also register their own sources (local folders or URLs they trust);
// nothing is fetched automatically.
import { uid } from './model.js';

export const LIBRARY_FORMAT = 'wicked-community-library';
export const LIBRARY_VERSION = 1;
export const PACK_FORMAT = 'wicked-template-pack';

export function createLibrary(name = 'My library') {
  return {
    format: LIBRARY_FORMAT, version: LIBRARY_VERSION,
    id: uid('lib_'), name: String(name || 'My library'),
    created: Date.now(), modified: Date.now(),
    entries: [], sources: [],
  };
}

/** Publish a project into the local library ("post"). */
export function publishLocal(library, project, meta = {}) {
  if (!library || !project) throw new Error('Library and project required');
  if (!Array.isArray(library.entries)) library.entries = [];
  const entry = {
    id: String(meta.id || uid('entry_')),
    name: String(meta.name || project.name || 'Untitled template').slice(0, 80),
    description: String(meta.description || '').slice(0, 500),
    author: String(meta.author || 'You').slice(0, 60),
    tags: [...new Set((meta.tags || []).map((t) => String(t).trim().toLowerCase()).filter(Boolean))].slice(0, 16),
    language: project.language || 'cpp',
    backend: project.backend || 'dx11',
    widgetCount: (project.pages || []).reduce((n, p) => n + (p.widgets?.length || 0), 0),
    created: Date.now(),
    local: true,
    project: JSON.parse(JSON.stringify(project)),
  };
  const i = library.entries.findIndex((e) => e.id === entry.id);
  if (i >= 0) library.entries[i] = entry; else library.entries.unshift(entry);
  library.modified = Date.now();
  return entry;
}

export function removeEntry(library, id) {
  if (!library) return library;
  library.entries = (library.entries || []).filter((e) => e.id !== id);
  library.modified = Date.now();
  return library;
}

export function searchEntries(library, query = '', tag = '') {
  const q = String(query || '').trim().toLowerCase();
  const t = String(tag || '').trim().toLowerCase();
  return (library?.entries || []).filter((e) => {
    if (t && !(e.tags || []).includes(t)) return false;
    if (!q) return true;
    return [e.name, e.description, e.author, ...(e.tags || [])].join(' ').toLowerCase().includes(q);
  });
}

export function allTags(library) {
  const m = new Map();
  for (const e of library?.entries || []) for (const t of e.tags || []) m.set(t, (m.get(t) || 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({ tag, count }));
}

/** Register a user-supplied source. Nothing is downloaded or executed. */
export function addSource(library, source) {
  if (!library || !source) throw new Error('Library and source required');
  if (!Array.isArray(library.sources)) library.sources = [];
  const type = ['folder', 'url'].includes(source.type) ? source.type : 'folder';
  const location = String(source.location || '').trim();
  if (!location) throw new Error('Source location required');
  const existing = library.sources.find((s) => s.location === location);
  if (existing) return existing;
  const rec = {
    id: uid('src_'), name: String(source.name || location).slice(0, 80),
    type, location, note: String(source.note || '').slice(0, 300), added: Date.now(),
  };
  library.sources.push(rec);
  return rec;
}

export function removeSource(library, id) {
  if (!library) return library;
  library.sources = (library.sources || []).filter((s) => s.id !== id);
  return library;
}

/** Export a shareable pack containing one, several, or all entries. */
export function exportPack(library, { ids, name = 'Wicked template pack' } = {}) {
  const entries = (library?.entries || []).filter((e) => !ids?.length || ids.includes(e.id));
  return JSON.stringify({
    format: PACK_FORMAT, version: LIBRARY_VERSION,
    name: String(name).slice(0, 80), exported: Date.now(),
    entries: JSON.parse(JSON.stringify(entries)),
  }, null, 2);
}

/** Import a pack into a library, replacing entries with matching ids. */
export function importPack(library, text) {
  let pack;
  try { pack = JSON.parse(String(text)); } catch { throw new Error('Invalid pack JSON'); }
  if (pack?.format !== PACK_FORMAT || !Array.isArray(pack.entries)) throw new Error('Not a Wicked template pack');
  if (!library) library = createLibrary(pack.name || 'Imported library');
  if (!Array.isArray(library.entries)) library.entries = [];
  let added = 0;
  for (const raw of pack.entries) {
    if (!raw?.project) continue;
    const entry = {
      ...raw, id: String(raw.id || uid('entry_')),
      local: false, importedAt: Date.now(),
      project: JSON.parse(JSON.stringify(raw.project)),
    };
    const i = library.entries.findIndex((e) => e.id === entry.id);
    if (i >= 0) library.entries[i] = entry; else library.entries.unshift(entry);
    added++;
  }
  library.modified = Date.now();
  return { library, added, name: pack.name || 'Imported library' };
}

/** Serialise / restore an entire local library. */
export function serializeLibrary(library) { return JSON.stringify(library, null, 2); }
export function parseLibrary(text) {
  let lib;
  try { lib = JSON.parse(String(text)); } catch { throw new Error('Invalid library JSON'); }
  if (lib?.format !== LIBRARY_FORMAT || !Array.isArray(lib.entries)) throw new Error('Not a Wicked library');
  return lib;
}

/** Turn a library entry into an editable project copy. */
export function instantiateEntry(entry) {
  if (!entry?.project) throw new Error('Entry has no project');
  const p = JSON.parse(JSON.stringify(entry.project));
  p.id = uid('p'); p.created = Date.now(); p.modified = Date.now();
  p.name = `${entry.name} (copy)`;
  if (p.window) p.window.title = p.name;
  if (p.titlebar) p.titlebar.title = p.name;
  return p;
}
