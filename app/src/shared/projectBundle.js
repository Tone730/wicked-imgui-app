export const BUNDLE_FORMAT='wicked-project-bundle';
export const BUNDLE_VERSION=1;

function clone(value){return structuredClone(value);}

function encodeBytes(bytes){
  if(typeof Buffer!=='undefined'&&typeof Buffer.isBuffer==='function'&&Buffer.isBuffer(bytes))return bytes.toString('base64');
  if(typeof btoa!=='function')return '';
  let binary='';
  for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));
  return btoa(binary);
}

function assetData(value){
  if(value==null)return '';
  if(typeof Buffer!=='undefined'&&typeof Buffer.isBuffer==='function'&&Buffer.isBuffer(value))return value.toString('base64');
  if(value instanceof Uint8Array)return encodeBytes(value);
  return String(value);
}

/** Build an offline project bundle. Asset data may be base64, a data URL, or a Buffer-like object. */
export function createProjectBundle(project,assets=[]){
  const normalized=(assets||[]).map((a,index)=>{
    let data=assetData(a?.data);
    const comma=data.indexOf(',');
    if(data.startsWith('data:')&&comma>=0)data=data.slice(comma+1);
    return{
      index:Number(a?.index??index),
      file:String(a?.file||a?.name||('asset-'+index)),
      kind:String(a?.kind||'image'),
      mime:String(a?.mime||''),
      w:Number(a?.w)||0,
      h:Number(a?.h)||0,
      data,
    };
  });
  return{
    format:BUNDLE_FORMAT,
    version:BUNDLE_VERSION,
    exported:new Date().toISOString(),
    generator:'Wicked ImGui Maker (offline)',
    project:clone(project||{}),
    assets:normalized,
  };
}

export function serializeProjectBundle(project,assets=[]){
  return JSON.stringify(createProjectBundle(project,assets),null,2);
}

export function parseProjectBundle(input){
  let data=input;
  if(typeof data==='string')data=JSON.parse(data);
  if(!data||typeof data!=='object')throw new Error('Bundle must be a JSON object.');
  if(data.format!==BUNDLE_FORMAT)throw new Error('Not a Wicked project bundle.');
  if(!data.project||typeof data.project!=='object')throw new Error('Bundle has no project data.');
  if(!Array.isArray(data.assets))data.assets=[];
  return{project:clone(data.project),assets:data.assets.map((a)=>({...a}))};
}

export function bundleFileName(project){
  const base=String(project?.name||'wicked-project').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'wicked-project';
  return base+'.wickedbundle.json';
}
