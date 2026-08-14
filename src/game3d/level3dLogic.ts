import type { Level3D, Position3D, Platform3D, Rock3D } from './level3d';
export type Move3D='up'|'down'|'left'|'right';
const DELTAS:Record<Move3D,{x:number;y:number}> = {up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};

export function cellAt(level:Level3D,x:number,y:number){return level.cells.find(c=>c.x===x&&c.y===y)}
export function effectiveHeight(level:Level3D,rocks:Rock3D[],platforms:Platform3D[],x:number,y:number){const r=rocks.find(v=>v.x===x&&v.y===y);if(r&&r.height>0)return r.height;if(platforms.some(p=>p.x===x&&p.y===y))return 1;return cellAt(level,x,y)?.height??0}

const isGlidable = (level:Level3D,x:number,y:number) => {
  const cell = cellAt(level,x,y);
  return cell?.type === 'void' || cell?.type === 'water';
};

export function movePlayer(level:Level3D,player:Position3D,move:Move3D,rocks:Rock3D[]=[],platforms:Platform3D[]=[]):Position3D|null{
  const d=DELTAS[move],x=player.x+d.x,y=player.y+d.y;
  if(x<0||y<0||x>=level.width||y>=level.depth)return null;

  // Arrow/platform blocks are rideable: when the player leaves an arrow in one of
  // its permitted directions and enters a void/water gap, keep gliding until the
  // gap ends. This mirrors the 2D arrow semantics instead of treating the arrow
  // as an ordinary one-cell platform.
  const currentPlatform = platforms.find(p=>p.x===player.x&&p.y===player.y);
  if(currentPlatform && currentPlatform.directions?.includes(move) && isGlidable(level,x,y)){
    let gx=x, gy=y;
    while(true){
      const nx=gx+d.x, ny=gy+d.y;
      if(nx<0||ny<0||nx>=level.width||ny>=level.depth)break;
      if(!isGlidable(level,nx,ny))break;
      gx=nx; gy=ny;
    }
    return {x:gx,y:gy,height:player.height};
  }

  const target=cellAt(level,x,y);
  if(target?.type==='void'&&!platforms.some(p=>p.x===x&&p.y===y))return null;
  const h=effectiveHeight(level,rocks,platforms,x,y);
  if(h<=0||h>player.height+1)return null;
  return{x,y,height:h};
}

export function movePlatform(level:Level3D,platforms:Platform3D[],index:number):Platform3D[]|null{const p=platforms[index];if(!p)return null;const x=p.x+p.dx,y=p.y+p.dy;if(x<0||y<0||x>=level.width||y>=level.depth)return null;if(platforms.some((q,i)=>i!==index&&q.x===x&&q.y===y))return null;const target=cellAt(level,x,y);if(!target||target.type==='wall')return null;return platforms.map((q,i)=>i===index?{...q,x,y}:q)}
export function bonkRock(rocks:Rock3D[],index:number):Rock3D[]{return rocks.map((r,i)=>i===index?{...r,height:Math.max(0,r.height-1)}:r)}
export function isComplete(level:Level3D,player:Position3D){return player.x===level.goal.x&&player.y===level.goal.y&&player.height===level.goal.height}
