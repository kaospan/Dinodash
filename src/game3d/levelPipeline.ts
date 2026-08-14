import type {Level3D,Cell3D,Rock3D,Platform3D,Move3DDirection} from './level3d';
import type {Direction} from './semanticLevel';
import {convertPhoneageLevel,compressSemanticLevel,validateSemanticLevel} from './semanticLevel';
export type PipelineResult={level:Level3D;warnings:string[]};
const delta=(d:Direction)=>d==='up'?{dx:0,dy:-1}:d==='right'?{dx:1,dy:0}:d==='down'?{dx:0,dy:1}:{dx:-1,dy:0};
const dirs=(ds:Direction[]):Move3DDirection[]=>ds;
export function build3DLevel(id:number,grid:number[][],playerStart:{x:number;y:number},cavePos:{x:number;y:number}):PipelineResult{
 const source=convertPhoneageLevel(id,grid,playerStart,cavePos),compressed=compressSemanticLevel(source),warnings=validateSemanticLevel(source,compressed);
 const cells:Cell3D[]=[],rocks:Rock3D[]=[],platforms:Platform3D[]=[];
 for(let y=0;y<compressed.height;y++)for(let x=0;x<compressed.width;x++){
  const t=compressed.tiles[y][x];
  if(t.kind==='void')cells.push({x,y,height:0,type:'void'});
  else if(t.kind==='wall')cells.push({x,y,height:3,type:'wall'});
  else if(t.kind==='stone'){cells.push({x,y,height:t.height,type:'rock'});rocks.push({x,y,height:t.height,breakable:false});}
  else if(t.kind==='breakable'){cells.push({x,y,height:t.height,type:'rock'});rocks.push({x,y,height:t.height,breakable:true});}
  else if(t.kind==='goal')cells.push({x,y,height:1,type:'goal'});
  else if(t.kind==='start-marker')cells.push({x,y,height:1,type:'start'});
  else if(t.kind==='arrow'){cells.push({x,y,height:1,type:'platform'});const d=delta(t.directions[0]??'up');platforms.push({x,y,dx:d.dx,dy:d.dy,directions:dirs(t.directions)});}
  else if(t.kind==='key')cells.push({x,y,height:1,type:t.color==='red'?'key-red':'key-green'});
  else if(t.kind==='lock')cells.push({x,y,height:1,type:t.color==='red'?'lock-red':'lock-green'});
  else if(t.kind==='teleport')cells.push({x,y,height:1,type:'teleport'});
  else if(t.kind==='bonus-time')cells.push({x,y,height:1,type:'bonus-time'});
  else cells.push({x,y,height:1,type:'floor'});
 }
 return{warnings,level:{id,width:compressed.width,depth:compressed.height,maxHeight:3,cells,playerStart:{x:compressed.playerStart.x,y:compressed.playerStart.y,height:1},goal:{x:compressed.goal.x,y:compressed.goal.y,height:1},rocks,platforms}};
}
