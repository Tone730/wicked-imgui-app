export const THEME_FORMAT='wicked-theme';
export const THEME_SECTIONS=['style','window','titlebar','background','toast'];

function sectionOf(project,key){return project&&typeof project[key]==='object'&&project[key]?project[key]:{};}

/** Extract a portable, secret-free theme object from a project. */
export function exportTheme(project,name){
  const p=project||{};
  const theme={format:THEME_FORMAT,version:1,name:name||p.style?.preset||p.name||'Wicked theme',exported:new Date().toISOString()};
  for(const key of THEME_SECTIONS)theme[key]={...sectionOf(p,key)};
  return theme;
}

export function serializeTheme(project,name){
  return JSON.stringify(exportTheme(project,name),null,2);
}

/** Validate and merge an imported theme into a project without touching pages, assets or overrides. */
export function importTheme(project,input){
  let data=input;
  if(typeof data==='string')data=JSON.parse(data);
  if(!data||typeof data!=='object')throw new Error('Theme file must contain a JSON object.');
  if(data.format&&data.format!==THEME_FORMAT)throw new Error('Not a Wicked theme file.');
  const hasSection=THEME_SECTIONS.some((k)=>data[k]&&typeof data[k]==='object');
  if(!hasSection)throw new Error('Theme file has no theme sections.');
  const next=project&&typeof project==='object'?structuredClone(project):{};
  for(const key of THEME_SECTIONS){
    if(!data[key]||typeof data[key]!=='object')continue;
    next[key]={...sectionOf(next,key)};
    for(const [k,v] of Object.entries(data[key])){
      if(k==='__proto__'||k==='constructor'||k==='prototype')continue;
      next[key][k]=v;
    }
  }
  next.modified=Date.now();
  return next;
}

export function themeFileName(name){
  return String(name||'wicked-theme').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')+'.wicked-theme.json';
}
