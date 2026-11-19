// v24panel.js — v2.4.0 offline expansion tools, rendered into the left panel.
// Every action here is local/offline: no account, key or remote service is used.
// Pasted menu source is parsed as TEXT ONLY — nothing is ever executed.
import { h, clear } from '../dom.js';
import { icon } from '../icons.js';
import { section, fieldRow, textField, selectField, boolField } from './fields.js';
import { api } from '../api.js';
import { modal, toast, promptDialog } from '../ui.js';
import { t } from '../i18n.js';
import { applyProfile, LOADER_TYPES, GRAPHICS_APIS, COMPAT_FLAGS } from '../../../shared/loaders.js';
import { listKits, getKit, buildKitProject, kitSuggestions, CONTROL_RECIPES, kitCreditsText } from '../../../shared/uikit.js';
import { kitLicenseText } from '../../../shared/kitLicenses.js';

const KINDS = [
  ['cpp', 'C++'], ['csharp', 'C#'], ['rust', 'Rust'], ['web', 'Web / JS'],
  ['js', 'JavaScript'], ['json', 'JSON'], ['text', 'Plain text'],
];
let premadeCache = null;
let libCache = null;
let libEntries = null;
let libTags = [];
let libQuery = '';
let libTag = '';
let learnedProfile = null;
let loaderState = { loader: 'external', api: 'dx11', flags: [] };
let loaderProfile = null;
let loaderChecklist = null;

export function renderV24(V, X) {
  const call = async (name, payload) => {
    const fn = api.v24 && api.v24[name];
    if (!fn) throw new Error('v2.4 bridge unavailable in this build');
    const res = await fn(payload || {});
    if (!res || res.ok === false) throw new Error((res && res.error) || 'Request failed');
    return res;
  };
  const apply = (project, label) => {
    if (!project || !Array.isArray(project.pages) || !project.pages.length) {
      toast('Nothing to apply — the generator returned no pages', 'warning');
      return;
    }
    const snap = X.snapshot();
    X.replaceProject(project, 'v24');
    X.history.push(snap, 'v2.4: ' + label);
    X.setDirty(true);
    X.emit('history');
    toast(label + ' applied to the editor', 'success');
  };
  const err = (e, what) => toast(what + ': ' + (e && e.message ? e.message : String(e)), 'error');
  const btn = (label, ico, run, cls) => h('button.' + (cls || 'btn sm'), {
    type: 'button', onclick: run,
  }, icon(ico, 0xd), h('span', label));
  const sub = (text) => h('p.muted.small', text);
  const row = (label, ctl, full) => fieldRow(label, ctl, { full: !!full, stack: true });
  const sel = (value, pairs, onChange) => selectField(value, pairs.map(([v, l]) => ({ value: v, label: l })), onChange);

  /* ------------------------- Menu understanding ------------------------- */
  function openVision() {
    let kind = 'cpp';
    const kindSel = sel('cpp', KINDS, (v) => { kind = v; });
    const nameIn = textField('Imported menu', () => {}, { placeholder: 'Project name' });
    const src = textField('', () => {}, {
      multiline: true, rows: 12, placeholder: 'Paste C++ / C# / Rust / JS / JSON menu source here…',
    });
    const body = h('div.v24-form',
      row('Source type', kindSel), row('Name', nameIn), row('Source', src, true));
    const mod = modal({
      title: 'Understand menu source', subtitle: 'Static analysis only — your code is never run.',
      body, width: 640,
      footer: h('div.row', { style: { gap: '6px', justifyContent: 'flex-end' } },
        btn('Cancel', 'x', () => mod.close(), 'btn sm ghost'),
        btn('Generate editable mockup', 'wand', async () => {
          try {
            if (!String(src.value || '').trim()) { toast('Paste some menu source first', 'warning'); return; }
            const r = await call('vision', { text: src.value, kind, name: nameIn.value || 'Imported menu' });
            mod.close();
            apply(r.project, 'Menu mockup');
            if (r.summary) toast(r.summary, 'info');
          } catch (e) { err(e, 'Could not read the menu'); }
        }, 'btn sm primary')),
    });
  }

  function visionSection() {
    return section('Menu understanding', [
      sub('Paste menu source and get a normal, fully editable project. Controls, tabs, colours and fonts are recognised from text only.'),
      btn('Paste menu source → mockup', 'wand', openVision, 'btn sm primary'),
      btn('Auto-generate a prebuild', 'sparkles', async () => {
        try {
          const r = await call('learn', { action: 'prebuild', projects: [X.project], options: { name: (X.project.name || 'Menu') + ' prebuild' } });
          apply(r.project, 'Smart prebuild');
        } catch (e) { err(e, 'Could not generate a prebuild'); }
      }),
      btn('Learn style from this project', 'brain', async () => {
        try {
          const r = await call('learn', { projects: [X.project] });
          learnedProfile = r.profile;
          toast(r.summary || 'Style learned', 'success');
        } catch (e) { err(e, 'Could not learn the style'); }
      }),
      learnedProfile ? sub((learnedProfile.favouriteWidgets || []).slice(0, 3).map((w) => w.count + '× ' + w.type).join(', ') || 'Style profile ready') : null,
    ]);
  }

  /* -------------------------- Premade templates ------------------------- */
  function premadeSection() {
    const kids = [sub('Editable templates rebuilt from the attached menu projects. Open one, then change any control, colour or action. Archive sources were analysed statically — never executed.')];
    if (!premadeCache) {
      kids.push(btn('Load templates', 'refresh', async () => {
        try { const r = await call('premade', { action: 'list' }); premadeCache = r.templates || []; build(); }
        catch (e) { err(e, 'Could not load templates'); }
      }));
    } else {
      for (const item of premadeCache) {
        kids.push(h('div.v24-item',
          h('div.grow',
            h('b', item.name + (item.approximate ? '  (approximate)' : '')),
            h('p.muted.small', item.description || ''),
            item.note ? h('p.muted.small', item.note) : null,
            h('div.v24-tags', (item.tags || []).map((tg) => h('span.tag', tg))),
          ),
          btn('Open', 'folder', async () => {
            try { const r = await call('premade', { action: 'build', id: item.id }); apply(r.project, 'Template: ' + item.name); }
            catch (e) { err(e, 'Could not open the template'); }
          })));
      }
    }
    return section('Premade templates', kids);
  }

  /* -------------------------- Community library ------------------------- */
  function refreshLibrary() {
    return call('library', { action: 'load', query: libQuery, tag: libTag }).then((r) => {
      libCache = r.library; libEntries = r.entries || []; libTags = r.tags || [];
      build();
    });
  }

  async function publishCurrent() {
    try {
      const name = await promptDialog({ title: 'Publish to local library', label: 'Template name', value: X.project.name || 'My template' });
      if (!name) return;
      const description = await promptDialog({ title: 'Publish to local library', label: 'Short description', value: '' });
      await call('library', { action: 'publish', project: X.project, meta: { name, description: description || '' } });
      await refreshLibrary();
      toast('Published to your local library', 'success');
    } catch (e) { err(e, 'Could not publish'); }
  }

  function librarySection() {
    const kids = [
      sub('A local, offline community library. “Publish” saves here; export/import packs to share with other people. No account, sign-in or server is contacted.'),
      h('div.row', { style: { gap: '4px' } },
        (() => {
          const s = textField(libQuery, (v) => { libQuery = v; }, { placeholder: 'Search templates…' });
          s.addEventListener('change', () => refreshLibrary().catch((e) => err(e, 'Search failed')));
          return s;
        })(),
        (() => {
          const s = sel(libTag, [['', 'All tags'], ...libTags.map((x) => [x, x])], (v) => { libTag = v; refreshLibrary().catch(() => {}); });
          return s;
        })()),
      h('div.row', { style: { gap: '4px', flexWrap: 'wrap' } },
        btn('Publish current', 'upload', publishCurrent, 'btn sm primary'),
        btn('Import pack', 'download', async () => {
          try {
            const r = await call('library', { action: 'importPack' });
            if (r.canceled) return;
            await refreshLibrary();
            toast('Imported ' + (r.added || 0) + ' template(s)', 'success');
          } catch (e) { err(e, 'Could not import the pack'); }
        }),
        btn('Export pack', 'upload', async () => {
          try { await call('library', { action: 'exportPack' }); toast('Template pack saved', 'success'); }
          catch (e) { err(e, 'Could not export the pack'); }
        })),
    ];
    if (libEntries === null) kids.push(btn('Refresh library', 'refresh', () => refreshLibrary().catch((e) => err(e, 'Could not load the library'))));
    else if (!libEntries.length) kids.push(sub('Library is empty. Publish the current project or import a pack.'));
    else for (const e of libEntries) {
      kids.push(h('div.v24-item',
        h('div.grow', h('b', e.name), h('p.muted.small', e.description || ('by ' + (e.author || 'You'))),
          h('div.v24-tags', (e.tags || []).map((tg) => h('span.tag', tg)))),
        btn('Open', 'folder', async () => {
          try { const r = await call('library', { action: 'instantiate', id: e.id }); apply(r.project, 'Library: ' + e.name); }
          catch (ex) { err(ex, 'Could not open the template'); }
        }),
        btn('Remove', 'trash', async () => {
          const yes = await promptDialog({ title: 'Remove from library', label: 'Type “remove” to confirm', value: '' });
          if (yes !== 'remove') return;
          try { await call('library', { action: 'remove', id: e.id }); await refreshLibrary(); }
          catch (ex) { err(ex, 'Could not remove the template'); }
        }, 'btn sm ghost')));
    }
    return section('Community library (offline)', kids);
  }

  /* -------------------------- Loader profiles --------------------------- */
  function openDetect() {
    const src = textField('', () => {}, { multiline: true, rows: 10, placeholder: 'Paste loader / host source or build output…' });
    const out = h('div.v24-hints', sub('Hints will appear here.'));
    const mod = modal({
      title: 'Detect loader hints', subtitle: 'Generic detection — no specific game or engine is assumed.',
      body: h('div.v24-form', row('Source', src, true), out), width: 620,
      footer: h('div.row', { style: { gap: '6px', justifyContent: 'flex-end' } },
        btn('Cancel', 'x', () => mod.close(), 'btn sm ghost'),
        btn('Detect', 'search', async () => {
          try {
            const r = await call('loaders', { action: 'detect', text: src.value });
            clear(out);
            const hints = r.hints || [];
            out.appendChild(h('b', hints.length ? 'Detected hints' : 'No loader hints found'));
            for (const hint of hints) {
              out.appendChild(sub((hint.type || 'generic') + (hint.api ? ' / ' + hint.api : '') + ' — ' + (hint.why || '')));
              out.appendChild(btn('Use this', 'check', () => {
                loaderState = { ...loaderState, loader: hint.type || loaderState.loader, api: hint.api || loaderState.api };
                mod.close(); build();
              }, 'btn sm ghost'));
            }
          } catch (e) { err(e, 'Detection failed'); }
        }, 'btn sm primary')),
    });
  }

  function loaderSection() {
    const kids = [
      sub('Pick a generic loader type and graphics API. Profiles only add compatibility notes and settings to your project — nothing is tied to one game.'),
      row('Loader', sel(loaderState.loader, Object.keys(LOADER_TYPES).map((k) => [k, LOADER_TYPES[k].label || k]), (v) => { loaderState.loader = v; loaderProfile = null; build(); })),
      row('Graphics API', sel(loaderState.api, Object.keys(GRAPHICS_APIS).map((k) => [k, GRAPHICS_APIS[k].label || k]), (v) => { loaderState.api = v; loaderProfile = null; build(); })),
      h('div.v24-flags', Object.keys(COMPAT_FLAGS).map((k) => h('label.v24-flag',
        boolField(!!loaderState.flags.includes(k), (on) => {
          loaderState.flags = on ? [...loaderState.flags, k] : loaderState.flags.filter((x) => x !== k);
          loaderProfile = null;
        }), h('span', COMPAT_FLAGS[k].label || k)))),
      h('div.row', { style: { gap: '4px', flexWrap: 'wrap' } },
        btn('Detect from source', 'search', openDetect),
        btn('Build profile', 'shield', async () => {
          try {
            const r = await call('loaders', { action: 'profile', ...loaderState });
            loaderProfile = r.profile; loaderChecklist = r.checklist || [];
            build();
            toast('Compatibility profile ready', 'success');
          } catch (e) { err(e, 'Could not build the profile'); }
        })),
    ];
    if (loaderChecklist) kids.push(h('pre.v24-checklist', loaderChecklist.join('\n')));
    if (loaderProfile) kids.push(btn('Apply profile to project', 'check', () => {
      X.change((p) => applyProfile(p, loaderProfile), { label: 'Loader profile', structural: true, source: 'v24' });
      toast('Loader profile applied', 'success');
    }, 'btn sm primary'));
    return section('Loader compatibility', kids);
  }

  /* --------------------------- Image assets ----------------------------- */
  function assetSection() {
    const kids = [
      sub('Import images as embedded assets. They travel inside the project and export into C++, C# and Rust byte arrays.'),
      h('div.row', { style: { gap: '4px', flexWrap: 'wrap' } },
        btn('Import image', 'image', async () => {
          try {
            const r = await call('assets', { action: 'import' });
            if (r.canceled) return;
            X.change((p) => { p.assets = p.assets || []; p.assets.push(r.asset); },
              { label: 'Import image', structural: true, source: 'v24' });
            build();
            toast('Image embedded', 'success');
          } catch (e) { err(e, 'Could not import the image'); }
        }, 'btn sm primary'),
        btn('Export asset pack', 'download', async () => {
          try { await call('assets', { action: 'exportPack', assets: X.project.assets || [] }); toast('Asset pack saved', 'success'); }
          catch (e) { err(e, 'Could not export the asset pack'); }
        })),
    ];
    const imgs = (X.project.assets || []).filter((a) => a.type === 'image' || a.file);
    if (!imgs.length) kids.push(sub('No images yet.'));
    else {
      const grid = h('div.v24-assets');
      for (const a of imgs) {
        grid.appendChild(h('div.v24-asset',
          h('img', { src: a.url || a.file, alt: a.name || 'image' }),
          h('span.small', a.name || 'image'),
          btn('×', 'x', () => {
            X.change((p) => { p.assets = (p.assets || []).filter((x) => x.id !== a.id); },
              { label: 'Remove image', structural: true, source: 'v24' });
            build();
          }, 'btn icon sm ghost')));
      }
      kids.push(grid);
    }
    return section('Image assets', kids);
  }

  /* --------------------------- UI design systems ------------------------ */
  function uiKitSection() {
    const kids = [sub('Design systems and control recipes transcribed from the sampled menus. Static analysis only — no archive code is run.')];
    const kits = listKits();
    if (!kits.length) kids.push(sub('No UI kits are bundled in this build.'));
    for (const kit of kits) {
      const full = getKit(kit.id);
      const controls = full.screens.reduce((n, s) => n + s.controls.length, 0);
      const swatches = h('div.row', { style: { gap: '4px', flexWrap: 'wrap', margin: '4px 0' } });
      for (const color of Object.values(full.palette).slice(0, 10)) {
        swatches.appendChild(h('span', {
          title: color,
          style: { width: '14px', height: '14px', borderRadius: '3px', background: color, border: '1px solid #8888' },
        }));
      }
      kids.push(h('div.v24-kit', { style: { borderTop: '1px solid #ffffff18', padding: '8px 0' } },
        h('strong', kit.name),
        h('p.muted.small', kit.summary),
        h('p.small', `${full.window.width}x${full.window.height} · ${kit.screens} screen(s) · ${controls} control(s) · preset: ${kit.preset}`),
        swatches,
        btn('Open as editable project', 'layout', () => {
          try { apply(buildKitProject(kit.id), 'UI kit: ' + kit.name); }
          catch (e) { err(e, 'Could not open the UI kit'); }
        }, 'btn sm primary')));
    }
    const recipes = h('div.small', { style: { marginTop: '6px' } },
      h('strong', 'Control recipes'),
      h('div.muted', Object.entries(CONTROL_RECIPES).map(([name, r]) => `${name} → ${r.widget || r.action}`).join(' · ')));
    kids.push(recipes);
    const prompts = h('div.small', { style: { marginTop: '6px' } }, h('strong', 'AI prompts'));
    for (const text of kitSuggestions().slice(0, 3)) prompts.appendChild(h('div.muted', '“' + text + '”'));
    kids.push(prompts);
    return section('UI design systems', kids);
  }

  /* ------------------------------ Credits -------------------------------- */
  function creditsSection() {
    const kits = listKits();
    const kids = [sub('Attribution for every bundled design system. Palettes, fonts and control strings were transcribed by static analysis; no source archive was executed. Licences below are transcribed from each source where one was present.')];
    for (const kit of kits) {
      const meta = h('div.small', { style: { marginTop: '2px' } },
        h('span.muted', String(kit.author || 'Unknown author') + ' · ' + String(kit.license || 'Unspecified')));
      if (kit.repo) {
        const isUrl = /^https?:\/\//i.test(kit.repo);
        meta.appendChild(h('span.muted', ' · '));
        if (isUrl) {
          meta.appendChild(h('a', { href: kit.repo, target: '_blank', rel: 'noopener noreferrer' }, kit.repo));
        } else {
          meta.appendChild(h('span', kit.repo));
        }
      }
      const licence = kitLicenseText(kit.id);
      kids.push(h('div.v24-credit', { style: { borderTop: '1px solid #ffffff18', padding: '8px 0' } },
        h('strong', kit.name), meta,
        kit.attribution ? h('p.muted.small', kit.attribution) : null,
        licence ? h('details.small', { style: { marginTop: '4px' } },
          h('summary', 'Full licence text'),
          h('pre.muted', { style: { whiteSpace: 'pre-wrap', fontSize: '11px' } }, licence)) : null));
    }
    // Keep a plain-text form available for the generated credits.h and copy/paste.
    kids.push(h('details.small', { style: { marginTop: '8px' } },
      h('summary', 'Plain-text credits'),
      h('pre.muted', { style: { whiteSpace: 'pre-wrap', fontSize: '11px' } }, kitCreditsText())));
    return section('Credits & attribution', kids);
  }

  /* ------------------------------ Build --------------------------------- */
  function build() {
    clear(V);
    V.appendChild(visionSection());
    V.appendChild(uiKitSection());
    V.appendChild(creditsSection());
    V.appendChild(premadeSection());
    V.appendChild(librarySection());
    V.appendChild(loaderSection());
    V.appendChild(assetSection());
    V.appendChild(sub('v2.4.0 — all features run locally and work offline.'));
  }

  build();
  // Populate remote-free caches in the background; each refresh re-renders.
  call('premade', { action: 'list' }).then((r) => { premadeCache = r.templates || []; build(); }).catch(() => {});
  refreshLibrary().catch(() => {});
}
