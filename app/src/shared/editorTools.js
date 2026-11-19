import{createWidget}from'./model.js';import{childrenOf,descendantsOf,ancestorsOf,isContainer,normalizeHierarchy}from'./hierarchy.js';

export const ZOOM_PRESETS=[0.25,0.5,0.75,1,1.5,2];

function uniqueId(widgets,prefix){
  const taken=new Set(widgets.map((w)=>String(w.id)));
  let n=1;
  while(true){
    const id=prefix+'_'+n.toString(36);
    if(!taken.has(id))return id;
    n++;
  }
}

function box(widgets){
  if(!widgets.length)return{x:0,y:0,w:240,h:120};
  const x=Math.min(...widgets.map((w)=>Number(w.x)||0));
  const y=Math.min(...widgets.map((w)=>Number(w.y)||0));
  const r=Math.max(...widgets.map((w)=>(Number(w.x)||0)+(Number(w.w)||0)));
  const b=Math.max(...widgets.map((w)=>(Number(w.y)||0)+(Number(w.h)||0)));
  return{x,y,w:Math.max(24,r-x),h:Math.max(24,b-y)};
}

/** Group selected widgets into a new panel. Children of selected containers travel with them. */
export function groupWidgets(widgets,ids,label='Group',id){
  const selected=new Set(ids||[]);
  if(!selected.size)return{widgets,groupId:null,count:0};
  const all=[...widgets];
  const selectedWidgets=all.filter((w)=>selected.has(w.id));
  if(!selectedWidgets.length)return{widgets:all,groupId:null,count:0};
  const included=new Set();
  for(const w of selectedWidgets){
    included.add(w.id);
    if(isContainer(w))for(const d of descendantsOf(all,w.id))included.add(d.id);
  }
  const roots=selectedWidgets.filter((w)=>!ancestorsOf(all,w).some((a)=>selected.has(a.id)));
  const b=box(roots);
  const groupId=id||uniqueId(all,'grp');
  const group=createWidget('panel',groupId,b.x,b.y,{text:label||'Group',w:b.w+24,h:b.h+32});
  const next=[group,...all];
  for(const w of next){
    if(!included.has(w.id)||w.id===groupId)continue;
    if(roots.some((r)=>r.id===w.id))w.parent=groupId;
  }
  return{widgets:normalizeHierarchy(next),groupId,count:roots.length};
}

/** Dissolve a group while keeping its direct children in place. */
export function ungroupWidgets(widgets,groupId){
  const group=(widgets||[]).find((w)=>w.id===groupId);
  if(!group)return{widgets,count:0};
  const parent=group.parent||'';
  const next=widgets.filter((w)=>w.id!==groupId).map((w)=>w.parent===groupId?{...w,parent}:w);
  return{widgets:normalizeHierarchy(next),count:1};
}

export function bulkOffset(widgets,ids,dx,dy){
  const set=new Set(ids||[]);
  return(widgets||[]).map((w)=>set.has(w.id)?{...w,x:(Number(w.x)||0)+(Number(dx)||0),y:(Number(w.y)||0)+(Number(dy)||0)}:w);
}

const BULKEYS=new Set(['x','y','w','h','opacity','locked','hidden','text']);
export function bulkPatch(widgets,ids,patch){
  const set=new Set(ids||[]);
  const safe={};
  for(const [k,v] of Object.entries(patch||{}))if(BULKEYS.has(k))safe[k]=v;
  if(!set.size||!Object.keys(safe).length)return widgets;
  return(widgets||[]).map((w)=>set.has(w.id)?{...w,...safe}:w);
}

/** Draw-friendly ruler ticks with stable major intervals. */
export function rulerTicks(zoom,gridSize,length,maxTicks=160){
  const step=Math.max(8,(Number(gridSize)||8)*(Number(zoom)||1));
  const major=step*5;
  const out=[];
  const count=Math.min(maxTicks,Math.floor((Number(length)||0)/step)+1);
  for(let i=0;i<count;i++){
    const px=i*step;
    out.push({px,value:i*(Number(gridSize)||8),major:Math.abs(px%major)<0.5});
  }
  return out;
}

export function snapshotName(projectName){
  return(String(projectName||'wicked-ui').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60)||'wicked-ui')+'.png';
}
