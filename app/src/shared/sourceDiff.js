import{lineDiff}from'./integrate.js';

function normalize(value){return String(value??'').replace(/\r\n?/g,'\n');}

/** Compare generated export files against files already on disk. */
export function previewExportDiff(files,readExisting){
  return(files||[]).map((file)=>{
    const path=String(file.path||'');
    if(!path)return{path,action:'skip',added:0,removed:0,diff:null};
    let before=null;
    try{before=typeof readExisting==='function'?readExisting(path):(readExisting||{})[path];}
    catch{before=null;}
    const after=normalize(file.content);
    if(before==null)return{path,action:'new',added:after.split('\n').length,removed:0,diff:null};
    const previous=normalize(before);
    if(previous===after)return{path,action:'unchanged',added:0,removed:0,diff:null};
    const d=lineDiff(previous,after,2);
    return{path,action:'changed',added:d.added,removed:d.removed,diff:d.rows};
  });
}

export function diffSummary(changes){
  const list=changes||[];
  return{
    new:list.filter((c)=>c.action==='new').length,
    changed:list.filter((c)=>c.action==='changed').length,
    unchanged:list.filter((c)=>c.action==='unchanged').length,
    added:list.reduce((n,c)=>n+(c.added||0),0),
    removed:list.reduce((n,c)=>n+(c.removed||0),0),
    needsReview:list.some((c)=>c.action==='changed'),
  };
}

export function formatDiffRow(row){
  if(!row)return '';
  if(row.k==='…')return '  …';
  return String(row.k||' ')+' '+String(row.t??'');
}
