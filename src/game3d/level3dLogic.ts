import type { Level3D, Position3D, Platform3D, Rock3D } from './level3d';
export type Move3D='up'|'down'|'left'|'right';
const DELTAS:Record<Move3D,{x:number;y:number}> = {up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};

export function cellAt(level:Level3D,x:number,y:number){return level.cells.find(c=>c.x===x&&c.y===y)}
export function effectiveHeight(level:Level3D,rocks:Rock3D[],platforms:Platform3D[],x:number,y:number){const r=rocks.find(v=>v.x===x&&v.y===y);if(r&&r.height>0)return r.height;if(platforms.some(p=>p.x===x&&p.y===y))return 1;return cellAt(level,x,y)?.height??0}

const isVoid=(level:Level3D,x:number,y:number)=>cellAt(level,x,y)?.type==='void';
const isPlatformAt=(platforms:Platform3D[],x:number,y:number)=>platforms.some(p=>p.x===x&&p.y===y);
const isBlockingRockAt=(rocks:Rock3D[],x:number,y:number)=>rocks.some(r=>r.x===x&&r.y===y&&r.height>0);
const isHardStop=(level:Level3D,rocks:Rock3D[],x:number,y:number)=>{const cell=cellAt(level,x,y);return cell?.type==='wall'||cell?.type==='rock'||isBlockingRockAt(rocks,x,y)};

function glideDestination(level:Level3D,x0:number,y0:number,move:Move3D,rocks:Rock3D[],platforms:Platform3D[]){
  const d=DELTAS[move];let x=x0+d.x,y=y0+d.y;let lastVoid={x:x0,y:y0};
  while(x>=0&&y>=0&&x<level.width&&y<level.depth){
    if(isHardStop(level,rocks,x,y))return {x:lastVoid.x,y:lastVoid.y,blocked:true};
    if(!isVoid(level,x,y))return {x,y,blocked:false};
    if(isPlatformAt(platforms,x,y))return {x,y,blocked:false};
    lastVoid={x,y};x+=d.x;y+=d.y;
  }
  return lastVoid.x===x0&&lastVoid.y===y0?null:{x:lastVoid.x,y:lastVoid.y,blocked:false};
}

/** Move a selected arrow platform continuously through void until the first non-void cell. */
export function glidePlatform(level:Level3D,platforms:Platform3D[],index:number,move:Move3D):Platform3D[]|null{
  const platform=platforms[index];
  if(!platform||!platform.directions?.includes(move))return null;
  const destination=glideDestination(level,platform.x,platform.y,move,[],platforms.filter((_,i)=>i!==index));
  if(!destination)return null;
  if(destination.x===platform.x&&destination.y===platform.y)return null;
  if(isHardStop(level,[],destination.x,destination.y))return null;
  const target=cellAt(level,destination.x,destination.y);
  if(target&&target.type==='wall')return null;
  return platforms.map((p,i)=>i===index?{...p,x:destination.x,y:destination.y}:p);
}

/** Launch from an arrow platform. The Dino glides with it through continuous void. */
function glideFromPlatform(level:Level3D,player:Position3D,move:Move3D,rocks:Rock3D[],platforms:Platform3D[]):Position3D|null{
  const platform=platforms.find(p=>p.x===player.x&&p.y===player.y);
  if(!platform||!platform.directions?.includes(move))return null;
  const d=DELTAS[move];let x=player.x+d.x,y=player.y+d.y;let lastVoid={x:player.x,y:player.y};
  while(x>=0&&y>=0&&x<level.width&&y<level.depth){
    if(isHardStop(level,rocks,x,y))return lastVoid.x===player.x&&lastVoid.y===player.y?null:{...lastVoid,height:player.height};
    if(!isVoid(level,x,y)){
      const h=effectiveHeight(level,rocks,platforms,x,y);
      return h>0&&h<=player.height+1?{x,y,height:h}:{...lastVoid,height:player.height};
    }
    lastVoid={x,y};x+=d.x;y+=d.y;
  }
  return lastVoid.x===player.x&&lastVoid.y===player.y?null:{...lastVoid,height:player.height};
}

export function movePlayer(level:Level3D,player:Position3D,move:Move3D,rocks:Rock3D[]=[],platforms:Platform3D[]=[]):Position3D|null{
  const glide=glideFromPlatform(level,player,move,rocks,platforms);if(glide)return glide;
  const d=DELTAS[move];const x=player.x+d.x,y=player.y+d.y;
  if(x<0||y<0||x>=level.width||y>=level.depth)return null;
  const target=cellAt(level,x,y);
  if(target?.type==='void'&&!isPlatformAt(platforms,x,y))return null;
  if(target?.type==='wall'||isBlockingRockAt(rocks,x,y))return null;
  const h=effectiveHeight(level,rocks,platforms,x,y);if(h<=0||h>player.height+1)return null;
  return{x,y,height:h};
}

export function movePlatform(level:Level3D,platforms:Platform3D[],index:number):Platform3D[]|null{const p=platforms[index];if(!p)return null;const x=p.x+p.dx,y=p.y+p.dy;if(x<0||y<0||x>=level.width||y>=level.depth)return null;if(platforms.some((q,i)=>i!==index&&q.x===x&&q.y===y))return null;const target=cellAt(level,x,y);if(!target||target.type==='wall')return null;return platforms.map((q,i)=>i===index?{...q,x,y}:q)}
export function bonkRock(rocks:Rock3D[],index:number):Rock3D[]{return rocks.map((r,i)=>i===index?{...r,height:Math.max(0,r.height-1)}:r)}
export function isComplete(level:Level3D,player:Position3D){return player.x===level.goal.x&&player.y===level.goal.y&&player.height===level.goal.height}
