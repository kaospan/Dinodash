import type { Level3D } from './level3d';
import { build3DLevel } from './levelPipeline';

const SOURCE='https://raw.githubusercontent.com/kaospan/phoneage/main/src/data/promoted-levels.json';
type OriginalLevel={id:number;grid:number[][];playerStart:{x:number;y:number};cavePos:{x:number;y:number}};

let cached:Level3D[]|null=null;
export async function loadOriginalLevels3D():Promise<Level3D[]>{
  if(cached)return cached;
  const response=await fetch(SOURCE,{cache:'no-store'});
  if(!response.ok)throw new Error(`Unable to load original Phoneage levels (${response.status})`);
  const data=await response.json() as OriginalLevel[];
  if(!Array.isArray(data)||data.length<100)throw new Error(`Original campaign contains ${Array.isArray(data)?data.length:0} levels; refusing to fabricate missing levels`);
  const converted=data.sort((a,b)=>a.id-b.id).slice(0,100).map(src=>{
    const result=build3DLevel(src.id,src.grid,src.playerStart,src.cavePos);
    if(result.warnings.length)throw new Error(`Level ${src.id} rejected: ${result.warnings.join('; ')}`);
    return result.level;
  });
  cached=converted;
  return cached;
}

/** The original 100-level campaign is the canonical 3D campaign. */
export async function loadCampaignLevels3D():Promise<Level3D[]>{return loadOriginalLevels3D();}

/**
 * Small deterministic fixtures retained for the synchronous 3D movement tests.
 * These are not the campaign; the campaign is loaded through loadCampaignLevels3D().
 */
const fixture = (id:number, startHeight=1, goalX=6):Level3D => {
  const cells=Array.from({length:49},(_,i)=>{
    const x=i%7,y=Math.floor(i/7);
    return {x,y,height:1,type:'floor' as const};
  });
  return {
    id,
    name:`3D fixture ${id}`,
    width:7,
    depth:7,
    maxHeight:4,
    cells,
    playerStart:{x:0,y:0,height:startHeight},
    goal:{x:goalX,y:6,height:1},
  };
};

const climbFixture=fixture(2);
climbFixture.cells.find(c=>c.x===2&&c.y===3)!.height=2;
const blockedFixture=fixture(5);
blockedFixture.cells.find(c=>c.x===2&&c.y===3)!.height=3;

export const levels3D:Level3D[]=[
  fixture(1),
  climbFixture,
  fixture(3),
  fixture(4),
  blockedFixture,
  fixture(6),
  fixture(7),
  fixture(8),
  fixture(9),
  fixture(10),
];
