import type { Level3D, Cell3D, Rock3D, Platform3D } from './level3d';
import { convertPhoneageLevel, compressSemanticLevel, validateSemanticLevel } from './semanticLevel';

export type PipelineResult = { level: Level3D; warnings: string[] };

export function build3DLevel(id:number, grid:number[][], playerStart:{x:number;y:number}, cavePos:{x:number;y:number}): PipelineResult {
  const source = convertPhoneageLevel(id, grid, playerStart, cavePos);
  const compressed = compressSemanticLevel(source);
  const warnings = validateSemanticLevel(compressed);
  const cells:Cell3D[]=[]; const rocks:Rock3D[]=[]; const platforms:Platform3D[]=[];
  for(let y=0;y<compressed.height;y++) for(let x=0;x<compressed.width;x++) {
    const t=compressed.tiles[y][x];
    if(t.kind==='void') cells.push({x,y,height:0,type:'void'});
    else if(t.kind==='wall') cells.push({x,y,height:3,type:'wall'});
    else if(t.kind==='stone') {cells.push({x,y,height:t.height,type:'rock'}); rocks.push({x,y,height:t.height});}
    else if(t.kind==='breakable') {cells.push({x,y,height:t.height,type:'rock'}); rocks.push({x,y,height:t.height});}
    else if(t.kind==='goal') cells.push({x,y,height:1,type:'goal'});
    else if(t.kind==='start') cells.push({x,y,height:1,type:'start'});
    else cells.push({x,y,height:1,type:'floor'});
  }
  return { warnings, level:{id,width:compressed.width,depth:compressed.height,maxHeight:3,cells,playerStart:{x:compressed.playerStart.x,y:compressed.playerStart.y,height:1},goal:{x:compressed.goal.x,y:compressed.goal.y,height:1},rocks,platforms} };
}
