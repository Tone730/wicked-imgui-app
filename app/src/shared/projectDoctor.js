import{allWidgets,ACTIONS,assetIndex,ID_RE,WIDGETS,PRESETS,EFFECTS}from'./model.js';import{UI_KITS}from'./uikit.js';
const WIDGET_REFS=new Set(['target','userField','passField','keyField','widget','widgetId']),PAGE_REFS=new Set(['page','pageId','targetPage']),RANK={'error':0x0,'warning':0x1,'info':0x2},label=w=>w?.['id']?('"'+w['id']+'"'):'(unnamed)',markerCount=(s,re)=>(String(s??'')['match'](re)||[])['length'];
export function checkProject(project){
 const out=[];
 if(!project||!Array['isArray'](project['pages']))return[{severity:'error',message:'Project has no pages array.'}];
 const pages=project['pages'],entries=allWidgets(project),pageIds=new Set(pages['map'](p=>p['id'])),ids=new Map(),incoming=new Set(),win=project['window']||{},ww=Number(win['width']),wh=Number(win['height']);
 for(const pg of pages)for(const w of pg['widgets']||[]){
  const id=w['id'],where=' on page "'+(pg['name']||pg['id'])+'"';
  if(!id||typeof id!=='string'||!ID_RE['test'](id)){
   if(w['type']!=='raw')out.push({severity:'error',message:'Widget '+label(w)+where+' has an invalid ID (letters, digits and _, not starting with a digit).',pageId:pg['id'],widgetId:id,fix:'Rename the widget ID in the Inspector.'});
   continue;
  }
  if(ids['has'](id)){
   out.push({severity:'error',message:'Duplicate widget ID "'+id+'"'+where+' (also used on page "'+ids['get'](id)+'").',pageId:pg['id'],widgetId:id,fix:'Give each widget a unique ID.'});
   if(pg['id']!=null&&ids['get'](id)===pg['id'])out.push({severity:'warning',message:'Duplicate widget ID "'+id+'"'+where+' is shared by two widgets on the same page.',pageId:pg['id'],widgetId:id,fix:'Rename one of the two widgets so the ID is unique on the page.'});
  }else ids['set'](id,pg['id']);
 }
 for(const pg of pages)for(const w of pg['widgets']||[])if(w['type']==='raw'){
  const code=String(w['code']??w['props']?.['code']??''),opens=markerCount(code,/@widget\b/g),closes=markerCount(code,/@endwidget\b/g);
  if(opens!==closes)out.push({severity:'warning',message:'Raw widget '+label(w)+' on page "'+(pg['name']||pg['id'])+'" has unbalanced @widget / @endwidget markers ('+opens+' open, '+closes+' close).','pageId':pg['id'],'widgetId':w['id'],fix:'Add the missing @widget or @endwidget marker.'});
 }
 const widgetIds=new Set(ids['keys']()),widgetByKey=new Map();
 for(const e of entries)widgetByKey['set'](e['page']['id']+'|'+e['w']['id'],e['w']);
 for(const {page:pg,w}of entries){
  const base={'pageId':pg['id'],'widgetId':w['id']},where=' on page "'+(pg['name']||pg['id'])+'"';
  for(const a of w['actions']||[]){
   const def=ACTIONS[a?.['type']];
   if(!def){out.push({severity:'warning',message:'Widget '+label(w)+' has an unknown action type "'+String(a?.['type'])+'".',...base,fix:'Remove or replace the action.'});continue;}
   const keys=[...new Set([...def['args']['map'](([k])=>k),...Object['keys'](a)])];
   for(const key of keys){
    const val=a[key];
    if(PAGE_REFS['has'](key)){
     if(val){if(!pageIds['has'](val))out.push({severity:'error',message:'Action '+a['type']+' on widget '+label(w)+' points to missing page "'+val+'".',...base,fix:'Choose an existing page in the action settings.'});else incoming['add'](val);}
     else if(a['type']==='goto')out.push({severity:'warning',message:'Go-to-page action on widget '+label(w)+' has no target page.',...base,fix:'Choose a target page.'});
    }else if(WIDGET_REFS['has'](key)){
     if(!val)out.push({severity:'warning',message:'Action '+a['type']+' on widget '+label(w)+' has no "'+key+'" widget selected.',...base,fix:'Pick the widget this action should use.'});
     else if(!widgetIds['has'](val))out.push({severity:'error',message:'Action '+a['type']+' on widget '+label(w)+' points to missing widget "'+val+'" ('+key+').',...base,fix:'Pick an existing widget or create it.'});
    }
   }
  }
  for(const field of ['visibleIf','enabledIf']){
   const expr=String(w[field]||'')['trim']();if(!expr)continue;
   const ref=expr['split']('=')[0x0]['trim']()['replace'](/^!+/,'').trim();
   if(!ID_RE['test'](ref)||widgetIds['has'](ref))continue;
   out.push({severity:'warning',message:field+' on widget '+label(w)+' references missing widget "'+ref+'".',...base,fix:'Update the condition to use an existing widget ID.'});
  }
  if(w['parent']&&!widgetIds['has'](w['parent']))out.push({severity:'error',message:'Widget '+label(w)+' has parent "'+w['parent']+'" which does not exist.',...base,fix:'Clear the parent or point it to an existing widget.'});
  if(w['parent']){
   const par=widgetByKey['get'](pg['id']+'|'+w['parent']);
   if(par){
    const px=Number(par['x']),py=Number(par['y']),pw=Number(par['w']),ph=Number(par['h']);
    const x=Number(w['x']),y=Number(w['y']),cw=Number(w['w']),ch=Number(w['h']);
    if([px,py,pw,ph,x,y,cw,ch]['every'](Number['isFinite'])&&pw>0x0&&ph>0x0&&cw>0x0&&ch>0x0){
     const scrollable=!!par['props']?.['scrollable'];
     if(x<px||x+cw>px+pw||y<py||(!scrollable&&y+ch>py+ph))
      out.push({severity:'warning',message:'Widget '+label(w)+' extends outside its parent "'+w['parent']+'" rectangle.',...base,fix:'Move or resize the widget so it fits inside the parent, or make the parent scrollable.'});
    }
   }
  }
  if(!(Number(w['w'])>0x0)||!(Number(w['h'])>0x0))out.push({severity:'error',message:'Widget '+label(w)+' has a zero or negative size ('+String(w['w'])+' x '+String(w['h'])+').',...base,fix:'Set both width and height to positive values.'});
  if(w['type']==='custom'&&!String(w['code']||'')['trim']())out.push({severity:'error',message:'Custom widget '+label(w)+' has no code.',...base,fix:'Write code for the custom widget.'});
  if(ww>0x0&&wh>0x0){
   const x=Number(w['x']),y=Number(w['y']),cw=Number(w['w']),ch=Number(w['h']);
   if(!Number['isFinite'](x)||!Number['isFinite'](y)||!Number['isFinite'](cw)||!Number['isFinite'](ch))
    out.push({severity:'warning',message:'Widget '+label(w)+where+' has non-finite geometry (x, y, width or height).',...base,fix:'Enter finite numeric values for position and size.'});
   else if(cw>0x0&&ch>0x0){
    const ox=Math['max'](0x0,Math['min'](x+cw,ww)-Math['max'](x,0x0)),oy=Math['max'](0x0,Math['min'](y+ch,wh)-Math['max'](y,0x0));
    if(ox*oy<cw*ch*0.25)out.push({severity:'warning',message:'Widget '+label(w)+where+' is positioned mostly outside the window bounds.',...base,fix:'Move the widget inside the window or enlarge the window.'});
    else if(ox*oy<cw*ch)out.push({severity:'warning',message:'Widget '+label(w)+where+' is partially clipped by the window edge.',...base,fix:'Move the widget fully inside the window or enlarge the window.'});
   }
  }
  if(Number['isFinite'](Number(w['x']))&&Number(w['x'])<0x0||Number['isFinite'](Number(w['y']))&&Number(w['y'])<0x0)
   out.push({severity:'warning',message:'Widget '+label(w)+where+' has a negative x or y position.',...base,fix:'Use non-negative coordinates so the widget starts on-screen.'});
  if(Number(w['w'])>0x0&&Number(w['w'])<0x8||Number(w['h'])>0x0&&Number(w['h'])<0x8)
   out.push({severity:'warning',message:'Widget '+label(w)+where+' is smaller than 8px in one dimension and may be hard to use.',...base,fix:'Increase the widget width and height.'});
 }
 for(const {page:pg,w}of entries){
  if(w['type']&&!WIDGETS[w['type']]&&w['type']!=='custom'&&w['type']!=='raw')out.push({severity:'warning',message:'Widget '+label(w)+' has unknown type "'+String(w['type'])+'".',pageId:pg['id'],widgetId:w['id'],fix:'Replace it with a supported widget.'});
 }
 const pageSeen=new Set();
 for(const pg of pages){
  if(pageSeen['has'](pg['id']))out.push({severity:'error',message:'Duplicate page ID "'+String(pg['id'])+'".',pageId:pg['id'],fix:'Give each page a unique ID.'});
  pageSeen['add'](pg['id']);
 }
 if(project['preset']&&!PRESETS[project['preset']])out.push({severity:'warning',message:'Project uses unknown theme "'+String(project['preset'])+'".',fix:'Choose a theme from the Visual tab.'});
 if(project['style']?.['preset']&&!PRESETS[project['style']['preset']])out.push({severity:'warning',message:'Project style references unknown preset "'+String(project['style']['preset'])+'".',fix:'Reapply a theme preset from the Visual tab.'});
 if(project['kit']&&!UI_KITS[project['kit']])out.push({severity:'warning',message:'Project references unknown UI kit "'+String(project['kit'])+'".',fix:'Rebuild from an available UI kit or clear the kit reference.'});
 if(project['background']?.['effect']&&!EFFECTS['includes'](project['background']['effect']))out.push({severity:'warning',message:'Project uses unknown background effect "'+String(project['background']['effect'])+'".',fix:'Choose an effect from the Visual tab.'});
 const assets=Array['isArray'](project['assets'])?project['assets']:[],assetCheck=(id,kind,where,ref)=>{
  if(!id)return;
  const ix=assetIndex({'assets':assets},id),a=assets[ix],extra=ref?{'pageId':ref['pageId'],'widgetId':ref['widgetId']}:{};
  if(ix<0x0||!a){out.push({severity:'error',message:where+' references missing '+kind+' asset "'+String(id)+'".',...extra,fix:'Re-import the asset or select an existing one.'});return;}
  if(a['kind']&&kind==='image'&&a['kind']!=='image'||a['kind']&&kind==='font'&&a['kind']!=='font')out.push({severity:'warning',message:where+' uses asset "'+String(id)+'" of kind "'+a['kind']+'" where '+kind+' is expected.',...extra,fix:'Pick an asset of the right kind.'});
 };
 for(const {page:pg,w}of entries)for(const [k,v]of Object['entries'](w['props']||{}))if((k==='asset'||k==='fontAsset')&&v)assetCheck(v,k==='asset'?'image':'font','Widget '+label(w)+' prop "'+k+'"',{'pageId':pg['id'],'widgetId':w['id']});
 if(project['window']?.['bgType']==='image')assetCheck(project['window']['bgImage'],'image','Window background image');
 if(project['style']?.['font']==='custom')assetCheck(project['style']['fontAsset'],'font','Project font');
 assetCheck(project['titlebar']?.['icon'],'image','Titlebar icon');
 const hotkeys=new Map();
 for(const {page:pg,w}of entries){
  if(w['type']!=='hotkey')continue;
  const key=String(w['props']?.['key']||'').trim();if(!key||key==='None')continue;
  const norm=key['toLowerCase']()['replace'](/\s+/g,'');
  if(hotkeys['has'](norm))out.push({severity:'warning',message:'Hotkey "'+key+'" is assigned to both "'+hotkeys['get'](norm)+'" and '+label(w)+'.','pageId':pg['id'],'widgetId':w['id'],fix:'Give one of the hotkey widgets a different key.'});
  else hotkeys['set'](norm,w['id']);
 }
 const start=pages['find'](p=>p['id']===project['startPage'])||pages[0x0];
 if(!start)out.push({severity:'error',message:'Project has no start page.',fix:'Add a page and set it as the start page.'});
 else if(!(start['widgets']||[])['some'](w=>w['type']!=='raw'))out.push({severity:'warning',message:'Start page "'+(start['name']||start['id'])+'" has no widgets.','pageId':start['id'],fix:'Add at least one widget to the start page.'});
 if(!project['startPage']||typeof project['startPage']!=='string'||!project['startPage']['trim']())out.push({severity:'warning',message:'Project has no start page set; the first page is used instead.',fix:'Choose a start page in the project settings.'});
 for(const pg of pages){
  if(start&&pg['id']===start['id'])continue;
  if(!(pg['widgets']||[])['some'](w=>w['type']!=='raw'))out.push({severity:'info',message:'Page "'+(pg['name']||pg['id'])+'" has no widgets.',pageId:pg['id'],fix:'Add widgets to the page or remove it.'});
 }
 if(pages['length']>0x1)for(const pg of pages){
  if(start&&pg['id']===start['id']||incoming['has'](pg['id']))continue;
  out.push({severity:'warning',message:'Page "'+(pg['name']||pg['id'])+'" has no incoming goto action and is not the start page.','pageId':pg['id'],fix:'Add a Go to page action targeting this page, or make it the start page.'});
 }
 return out['sort']((a,b)=>RANK[a['severity']]-RANK[b['severity']]);
}
