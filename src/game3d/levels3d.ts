import type { Level3D } from './level3d';
import { build3DLevel } from './levelPipeline';

const SOURCE='https://raw.githubusercontent.com/kaospan/phoneage/main/src/data/levels.ts';
type OriginalLevel={id:number;grid:number[][];playerStart:{x:number;y:number};cavePos:{x:number;y:number}};

function extractArray(source:string,marker:string):string{
  const start=source.indexOf(marker);
  if(start<0)throw new Error(`Phoneage source missing ${marker}`);
  const open=source.indexOf('[',start);
  let depth=0,quote:string|null=null,escape=false,lineComment=false,blockComment=false;
  for(let i=open;i<source.length;i++){
    const c=source[i],n=source[i+1];
    if(lineComment){if(c==='\n')lineComment=false;continue}
    if(blockComment){if(c==='*'&&n==='/'){blockComment=false;i++}continue}
    if(quote){if(escape){escape=false;continue}if(c==='\\'){escape=true;continue}if(c===quote)quote=null;continue}
    if(c==='/'&&n==='/'){lineComment=true;i++;continue}
    if(c==='/'&&n==='*'){blockComment=true;i++;continue}
    if(c==='"'||c==="'"||c==='`'){quote=c;continue}
    if(c==='[')depth++;
    if(c===']'){depth--;if(depth===0)return source.slice(open,i+1)}
  }
  throw new Error('Phoneage level array is unterminated');
}

async function loadOriginalLevels3D():Promise<Level3D[]>{
  const response=await fetch(SOURCE,{cache:'no-store'});
  if(!response.ok)throw new Error(`Unable to load authoritative Phoneage levels (${response.status})`);
  const source=await response.text();
  const expression=extractArray(source,'const baseManualLevels: Level[] =');
  const data=Function(`"use strict"; return (${expression});`)() as OriginalLevel[];
  const originals=data.filter(level=>Number.isInteger(level?.id)&&level.id>=1&&level.id<=100).sort((a,b)=>a.id-b.id);
  if(originals.length!==100)throw new Error(`Authoritative Phoneage source contains ${originals.length} original levels; refusing to fabricate missing levels`);
  const converted=originals.map(src=>{
    if(!Array.isArray(src.grid)||src.grid.length!==11||src.grid.some(row=>!Array.isArray(row)||row.length!==20))throw new Error(`Phoneage level ${src.id} is not the original 20x11 map`);
    const result=build3DLevel(src.id,src.grid,src.playerStart,src.cavePos);
    if(result.warnings.length)throw new Error(`Level ${src.id} rejected: ${result.warnings.join('; ')}`);
    return result.level;
  });
  return converted;
}

let cached:Level3D[]|null=null;
export async function loadCampaignLevels3D():Promise<Level3D[]>{
  if(!cached)cached=await loadOriginalLevels3D();
  return cached;
}

/** Synchronous fixtures for the movement unit tests. They are never used as campaign content. */
const fixture=(id:number,startHeight=1,goalX=6):Level3D=>({id,name:`3D fixture ${id}`,width:7,depth:7,maxHeight:4,cells:Array.from({length:49},(_,i)=>({x:i%7,y:Math.floor(i/7),height:1,type:'floor' as const})),playerStart:{x:0,y:0,height:startHeight},goal:{x:goalX,y:6,height:1}});
const climbFixture=fixture(2);climbFixture.cells.find(c=>c.x===2&&c.y===3)!.height=2;
const blockedFixture=fixture(5);blockedFixture.cells.find(c=>c.x===2&&c.y===3)!.height=3;
export const levels3D:Level3D[]=[fixture(1),climbFixture,fixture(3),fixture(4),blockedFixture,fixture(6),fixture(7),fixture(8),fixture(9),fixture(10)];
