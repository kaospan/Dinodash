import type { Level3D, Position3D, Platform3D, Rock3D } from './level3d';
export type Move3D='up'|'down'|'left'|'right';
const DELTAS:Record<Move3D,{x:number;y:number}> = {up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};

export function cellAt(level:Level3D,x:number,y:number){return level.cells.find(c=>c.x===x&&c.y===y)}
export function effectiveHeight(level:Level3D,rocks:Rock3D[],platforms:Platform3D[],x:number,y:number){const r=rocks.find(v=>v.x===x&&v.y===y);if(r&&r.height>0)return r.height;if(platforms.some(p=>p.x===x&&p.y===y))return 1;return cellAt(level,x,y)?.height??0}

const isVoid=(level:Level3D,x:number,y:number)=>cellAt(level,x,y)?.type==='void';
const isPlatformAt=(platforms:Platform3D[],x:number,y:number)=>platforms.some(p=>p.x===x&&p.y===y);
const isBlockingRockAt=(rocks:Rock3D[],x:number,y:number)=>rocks.some(r=>r.x===x&&r.y===y&&r.height>0);

function glideDestination(level:Level3D,x0:number,y0:number,move:Move3D,rocks:Rock3D[],platforms:Platform3D[]){
  const d=DELTAS[move]; let x=x0+d.x; let y=y0+d.y; let lastVoid={x:x0,y:y0};
  while(x>=0&&y>=0&&x<level.width&&y<level.depth){
    if(!isVoid(level,x,y)||isBlockingRockAt(rocks,x,y)||isPlatformAt(platforms,x,y))return lastVoid;
    lastVoid={x,y}; x+=d.x; y+=d.y;
  }
  return lastVoid;
}

export function glidePlatform(level:Level3D,platforms:Platform3D[],index:number,move:Move3D):Platform3D[]|null{
  const platform=platforms[index];
  if(!platform||!platform.directions?.includes(move))return null;
  const destination=glideDestination(level,platform.x,platform.y,move,[],platforms.filter((_,i)=>i!==index));
  if(destination.x===platform.x&&destination.y===platform.y)return null;
  return platforms.map((p,i)=>i===index?{...p,x:destination.x,y:destination.y}:p);
}

/** Returns the exact destination when Dino is standing on an arrow platform. */
export function glideFromPlatform(level:Level3D,player:Position3D,move:Move3D,rocks:Rock3D[],platforms:Platform3D[]):Position3D|null{
  const platform=platforms.find(p=>p.x===player.x&&p.y===player.y);
  if(!platform||!platform.directions?.includes(move))return null;
  const destination=glideDestination(level,player.x,player.y,move,rocks,platforms.filter(p=>p!==platform));
  if(destination.x===player.x&&destination.y===player.y)return null;
  return {...destination,height:1};
}

export function movePlayer(level:Level3D,player:Position3D,move:Move3D,rocks:Rock3D[]=[],platforms:Platform3D[]=[]):Position3D|null{
  const glide=glideFromPlatform(level,player,move,rocks,platforms);
  if(glide)return glide;
  const d=DELTAS[move]; const x=player.x+d.x,y=player.y+d.y;
  if(x<0||y<0||x>=level.width||y>=level.depth)return null;
  const target=cellAt(level,x,y);
  if(target?.type==='void'&&!isPlatformAt(platforms,x,y))return null;
  if(target?.type==='wall'||isBlockingRockAt(rocks,x,y))return null;
  const h=effectiveHeight(level,rocks,platforms,x,y); if(h<=0||h>player.height+1)return null;
  return{x,y,height:h};
}

export function movePlatform(level:Level3D,platforms:Platform3D[],index:number):Platform3D[]|null{const p=platforms[index];if(!p)return null;const x=p.x+p.dx,y=p.y+p.dy;if(x<0||y<0||x>=level.width||y>=level.depth)return null;if(platforms.some((q,i)=>i!==index&&q.x===x&&q.y===y))return null;const target=cellAt(level,x,y);if(!target||target.type==='wall')return null;return platforms.map((q,i)=>i===index?{...q,x,y}:q)}
export function bonkRock(rocks:Rock3D[],index:number):Rock3D[]{return rocks.map((r,i)=>i===index?{...r,height:Math.max(0,r.height-1)}:r)}
export function isComplete(level:Level3D,player:Position3D){return player.x===level.goal.x&&player.y===level.goal.y&&player.height===level.goal.height}
