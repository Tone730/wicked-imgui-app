const ESC={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};
export function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,(c)=>ESC[c]);}

function style(w){
  return ['position:absolute',`left:${Number(w.x)||0}px`,`top:${Number(w.y)||0}px`,
    `width:${Math.max(1,Number(w.w)||80)}px`,`height:${Math.max(1,Number(w.h)||28)}px`,
    `opacity:${w.opacity??1}`,`z-index:${w.locked?1:2}`].join(';');
}

function content(w){
  const text=escapeHtml(w.text??''),id=escapeHtml(w.id||'');
  switch(w.type){
    case 'button':case 'iconbutton':case 'stepper':case 'toggle':
      return `<button class="mock-control" type="button" data-widget="${id}">${text||'Button'}</button>`;
    case 'input':case 'password':case 'searchbox':case 'taginput':
      return `<input class="mock-control" data-widget="${id}" placeholder="${text||'Input'}" />`;
    case 'textarea':
      return `<textarea class="mock-control" data-widget="${id}" placeholder="${text||'Notes'}"></textarea>`;
    case 'checkbox':case 'switch':case 'radio':
      return `<label class="mock-check"><input type="${w.type==='radio'?'radio':'checkbox'}" data-widget="${id}" /> <span>${text||w.type}</span></label>`;
    case 'slider':case 'progress':case 'progressring':case 'sparkline':
      return `<div class="mock-meter" data-widget="${id}"><i style="width:${Math.min(100,Math.max(4,Number(w.props?.value)||68))}%"></i><span>${text||''}</span></div>`;
    case 'image':
      return `<div class="mock-image" data-widget="${id}"><span>${text||'Image'}</span></div>`;
    case 'panel':case 'header':
      return `<div class="mock-panel" data-widget="${id}"><b>${text||'Panel'}</b></div>`;
    case 'separator':case 'divider':
      return `<div class="mock-line" data-widget="${id}"></div>`;
    case 'shape':
      return `<div class="mock-shape" data-widget="${id}"></div>`;
    default:
      return `<div class="mock-text" data-widget="${id}">${text||escapeHtml(w.type||'Widget')}</div>`;
  }
}

function pageHtml(page,index){
  const widgets=(page.widgets||[]).map((w)=>`<div class="mock-widget" style="${style(w)}">${content(w)}</div>`).join('\n');
  return `<section class="mock-page${index===0?' active':''}" data-page="${escapeHtml(page.id)}">
    <div class="mock-stage">${widgets}</div>
  </section>`;
}

/** Build a completely offline, single-file HTML representation of a project. */
export function generateHtmlMockup(project){
  const p=project||{},style=p.style||{},windowCfg=p.window||{},title=p.titlebar||{},bg=p.background||{};
  const pages=Array.isArray(p.pages)&&p.pages.length?p.pages:[{id:'main',name:'Main',widgets:[]}];
  const accent=style.accent||'#00E0B8',accent2=style.accent2||'#8B5CF6';
  const titleText=escapeHtml(windowCfg.title||p.name||'Wicked UI');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${titleText} — Wicked mockup</title>
<style>
:root{--accent:${escapeHtml(accent)};--accent2:${escapeHtml(accent2)};--text:${escapeHtml(style.text||'#E6E9F0')};--dim:${escapeHtml(style.textDim||'#8B93A7')};--frame:${escapeHtml(style.frame||'#1C2230')};--bg:${escapeHtml(windowCfg.bg||bg.color||'#11151E')};--title:${escapeHtml(title.bg||'#141924')};}
*{box-sizing:border-box}body{margin:0;min-height:100vh;background:#0B0E14;color:var(--text);font:14px/1.4 "Segoe UI",system-ui,sans-serif;display:grid;place-items:center;padding:24px}
.mock-app{width:min(100%,${Math.max(320,Number(windowCfg.width)||960)}px);border:1px solid rgba(255,255,255,.1);border-radius:12px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.55);background:var(--bg)}
.mock-titlebar{height:${Math.max(24,Number(title.height)||36)}px;background:var(--title);display:flex;align-items:center;gap:8px;padding:0 14px;border-bottom:1px solid rgba(255,255,255,.07)}
.mock-titlebar b{font-size:13px;font-weight:600}.mock-dots{display:flex;gap:6px;margin-left:auto}.mock-dots i{width:9px;height:9px;border-radius:50%;background:#3d4558}.mock-dots i:first-child{background:#ff6b6b}.mock-dots i:nth-child(2){background:#ffd166}.mock-dots i:last-child{background:#51cf66}
.mock-nav{display:flex;gap:6px;padding:10px 14px;background:rgba(0,0,0,.18);overflow:auto}.mock-nav button{border:1px solid transparent;background:transparent;color:var(--dim);padding:6px 11px;border-radius:7px;cursor:pointer;font:inherit}.mock-nav button.on{color:var(--text);background:var(--frame);border-color:color-mix(in srgb,var(--accent) 45%,transparent)}
.mock-wrap{position:relative;height:${Math.max(240,Number(windowCfg.height)||600)}px;overflow:auto;background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 8%,var(--bg)),var(--bg) 60%)}
.mock-page{display:none;height:100%}.mock-page.active{display:block}.mock-stage{position:relative;width:${Math.max(320,Number(windowCfg.width)||960)}px;min-height:100%;margin:0 auto}
.mock-widget{color:var(--text)}.mock-text,.mock-check,.mock-panel b{font-size:13px}.mock-control{width:100%;height:100%;border:1px solid rgba(255,255,255,.12);border-radius:8px;background:var(--frame);color:var(--text);padding:0 10px;font:inherit;display:flex;align-items:center;justify-content:center;cursor:pointer}.mock-control:hover{border-color:var(--accent)}input.mock-control,textarea.mock-control{justify-content:flex-start;background:rgba(0,0,0,.2);resize:none}.mock-check{display:flex;align-items:center;gap:8px;height:100%}.mock-meter{height:100%;display:flex;align-items:center;gap:8px}.mock-meter i{display:block;height:8px;min-width:4px;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:99px}.mock-meter span{font-size:11px;color:var(--dim)}.mock-image{height:100%;border:1px dashed rgba(255,255,255,.18);border-radius:8px;display:grid;place-items:center;color:var(--dim);background:rgba(255,255,255,.03)}.mock-panel{height:100%;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(255,255,255,.03);padding:10px}.mock-line{height:1px;background:rgba(255,255,255,.15)}.mock-shape{height:100%;border-radius:10px;background:linear-gradient(135deg,var(--accent),var(--accent2));opacity:.75}
.mock-toast{position:fixed;right:24px;bottom:24px;padding:12px 16px;border-radius:10px;background:var(--frame);border:1px solid var(--accent);box-shadow:var(--shadow);opacity:0;transform:translateY(10px);transition:.2s;pointer-events:none}.mock-toast.show{opacity:1;transform:none}
@media(max-width:640px){body{padding:0}.mock-app{border-radius:0}.mock-stage{transform-origin:0 0}}
</style></head><body>
<div class="mock-app">
  <div class="mock-titlebar"><b>${titleText}</b><span class="mock-dots"><i></i><i></i><i></i></span></div>
  <nav class="mock-nav">${pages.map((pg,i)=>`<button type="button" class="${i===0?'on':''}" data-goto="${escapeHtml(pg.id)}">${escapeHtml(pg.name||pg.id)}</button>`).join('')}</nav>
  <div class="mock-wrap">${pages.map(pageHtml).join('\n')}</div>
</div>
<div class="mock-toast">Interactive mockup — buttons and navigation are simulated.</div>
<script>
(()=>{const nav=[...document.querySelectorAll('[data-goto]')],pages=[...document.querySelectorAll('.mock-page')],toast=document.querySelector('.mock-toast');let timer;
function show(id){pages.forEach(p=>p.classList.toggle('active',p.dataset.page===id));nav.forEach(b=>b.classList.toggle('on',b.dataset.goto===id));}
function ping(el){toast.textContent=(el.textContent||el.getAttribute('placeholder')||'Action')+' — simulated in this offline mockup.';toast.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>toast.classList.remove('show'),1800);}
nav.forEach(b=>b.addEventListener('click',()=>show(b.dataset.goto)));
document.querySelectorAll('button[data-widget]').forEach(b=>b.addEventListener('click',()=>ping(b)));
})();
</script>
</body></html>`;
}
