import type { Cell3D, Level3D, Platform3D, Rock3D } from './level3d';

const grid = (rows: number[][]): Cell3D[] => rows.flatMap((row, y) => row.map((height, x) => ({ x, y, height, type: 'floor' as const })));
const make = (rows: number[][], start: [number, number], goal: [number, number]): Level3D => {
  const cells = grid(rows);
  const heightAt = (x: number, y: number) => rows[y][x];
  const playerStart = { x: start[0], y: start[1], height: heightAt(start[0], start[1]) };
  const goalPos = { x: goal[0], y: goal[1], height: heightAt(goal[0], goal[1]) };
  cells.find((c) => c.x === goal[0] && c.y === goal[1])!.type = 'goal';
  cells.find((c) => c.x === start[0] && c.y === start[1])!.type = 'start';
  return { width: rows[0].length, depth: rows.length, maxHeight: Math.max(...rows.flat()), cells, playerStart, goal: goalPos };
};
const flat = (h = 1) => Array.from({ length: 7 }, () => Array(7).fill(h));
const withCells = (edits: Record<string, number>) => {
  const r = flat();
  for (const [key, h] of Object.entries(edits)) { const [x, y] = key.split(',').map(Number); r[y][x] = h; }
  return r;
};

/** Bonus/tutorial 3D set. The original 100-level campaign is now the default. */
export const levels3D: Level3D[] = [
  make(flat(), [0, 3], [6, 3]),
  make(withCells({ '2,3': 2, '3,3': 2, '4,3': 3 }), [0, 3], [6, 3]),
  make(withCells({ '2,3': 2, '3,3': 2, '4,3': 1 }), [0, 3], [6, 3]),
  make(withCells({ '2,3': 3, '2,4': 2, '3,4': 2, '4,4': 1 }), [0, 3], [6, 4]),
  make(withCells({ '2,2': 3, '2,3': 3, '2,4': 3, '4,2': 2, '4,3': 2, '4,4': 2 }), [0, 3], [6, 3]),
  make(withCells({ '1,2': 2, '1,3': 2, '1,4': 2, '3,1': 3, '3,2': 3, '3,3': 3, '5,2': 2, '5,3': 2, '5,4': 2 }), [0, 3], [6, 3]),
  make(withCells({ '1,3': 2, '2,3': 3, '3,3': 2, '4,3': 3, '5,3': 2 }), [0, 3], [6, 3]),
  make(withCells({ '1,3': 2, '2,3': 3, '3,2': 2, '3,3': 3, '3,4': 2, '4,3': 3, '5,3': 2 }), [0, 3], [6, 3]),
  make(withCells({ '1,3': 2, '2,3': 3, '2,2': 2, '3,2': 3, '4,2': 2, '4,3': 3, '5,3': 2, '5,4': 3 }), [0, 3], [6, 4]),
  make(withCells({ '1,3': 2, '2,3': 3, '2,2': 2, '3,2': 3, '3,1': 2, '4,1': 3, '4,2': 3, '5,2': 2, '5,3': 3, '6,3': 3 }), [0, 3], [6, 3]),
];

const SOURCE = 'https://raw.githubusercontent.com/kaospan/phoneagev3/main/src/data/promoted-levels.json';
type OriginalLevel = { id: number; grid: number[][]; playerStart: { x: number; y: number }; cavePos: { x: number; y: number } };
const arrowFor = (tile: number): { dx: number; dy: number } | null => ({
  7: { dx: 0, dy: -1 }, 8: { dx: 1, dy: 0 }, 9: { dx: 0, dy: 1 }, 10: { dx: -1, dy: 0 },
  11: { dx: 0, dy: 1 }, 12: { dx: 1, dy: 0 }, 13: { dx: 1, dy: 0 },
}[tile] ?? null);
const isArrow = (tile: number) => tile >= 7 && tile <= 13;

/** Compress the original canvas into a portrait 9x16 board while preserving special cells and arrows. */
function compressGrid(src: OriginalLevel) {
  const h = src.grid.length, w = Math.max(...src.grid.map(r => r.length));
  let minX=w,maxX=-1,minY=h,maxY=-1;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if((src.grid[y]?.[x]??5)!==5){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
  if(maxX<0)return{rows:Array.from({length:16},()=>Array(9).fill(5)),start:[4,8] as [number,number],goal:[4,8] as [number,number]};
  const bw=maxX-minX+1,bh=maxY-minY+1;
  const tx=(x:number)=>Math.max(0,Math.min(8,Math.round((x-minX)*8/Math.max(1,bw-1))));
  const ty=(y:number)=>Math.max(0,Math.min(15,Math.round((y-minY)*15/Math.max(1,bh-1))));
  const rows=Array.from({length:16},()=>Array(9).fill(5));
  const used=new Set<string>();
  const special=(t:number)=>t===3||t===18||t===19||t===20||t===6||isArrow(t);
  const cells=Array.from({length:h},(_,y)=>Array.from({length:w},(_,x)=>({x,y,t:src.grid[y]?.[x]??5}))).flat().filter(c=>c.t!==5);
  cells.sort((a,b)=>Number(special(b.t))-Number(special(a.t)));
  for(const c of cells){const x0=tx(c.x),y0=ty(c.y);let pos:[number,number]=[x0,y0];if(used.has(`${x0},${y0}`)){let found:[number,number]|null=null;for(let r=1;r<12&&!found;r++)for(let dy=-r;dy<=r&&!found;dy++)for(let dx=-r;dx<=r;dx++){const x=x0+dx,y=y0+dy;if(x>=0&&x<9&&y>=0&&y<16&&!used.has(`${x},${y}`)){found=[x,y];break;}}if(found)pos=found;else continue;}rows[pos[1]][pos[0]]=c.t;used.add(`${pos[0]},${pos[1]}`);}
  const start=[tx(src.playerStart.x),ty(src.playerStart.y)] as [number,number],goal=[tx(src.cavePos.x),ty(src.cavePos.y)] as [number,number];rows[start[1]][start[0]]=18;rows[goal[1]][goal[0]]=3;return{rows,start,goal};
}

function convert(src: OriginalLevel): Level3D {
  const {rows,start,goal}=compressGrid(src),depth=16,width=9;const cells:Cell3D[]=[],rocks:Rock3D[]=[],platforms:Platform3D[]=[];
  for(let y=0;y<depth;y++)for(let x=0;x<width;x++){const tile=rows[y][x];if(tile===5){cells.push({x,y,height:0,type:'void'});continue;}if(tile===6){cells.push({x,y,height:1,type:'floor'});rocks.push({x,y,height:3});continue;}const a=arrowFor(tile);if(a){cells.push({x,y,height:1,type:'platform'});platforms.push({x,y,dx:a.dx,dy:a.dy});continue;}const type=tile===3?'goal':tile===18?'start':tile===1?'wall':'floor';cells.push({x,y,height:tile===1?2:1,type});}
  const heightAt=(x:number,y:number)=>cells.find(c=>c.x===x&&c.y===y)?.height??1;
  return{id:src.id,name:`Original Level ${src.id} · Compressed 9×16`,width,depth,maxHeight:3,cells,playerStart:{x:start[0],y:start[1],height:Math.max(1,heightAt(start[0],start[1]))},goal:{x:goal[0],y:goal[1],height:Math.max(1,heightAt(goal[0],goal[1]))},rocks,platforms,hint:'Original Phoneage level compressed for portrait 9×16. Arrow blocks are preserved for planning and gliding.'};
}

let cachedOriginal:Level3D[]|null=null;
export async function loadOriginalLevels3D():Promise<Level3D[]>{if(cachedOriginal)return cachedOriginal;const response=await fetch(SOURCE,{cache:'no-store'});if(!response.ok)throw new Error(`Unable to load original campaign: ${response.status}`);const data=await response.json() as OriginalLevel[];if(!Array.isArray(data)||data.length<100)throw new Error('Original campaign data is incomplete');cachedOriginal=data.sort((a,b)=>a.id-b.id).slice(0,100).map(convert);return cachedOriginal;}
export async function loadCampaignLevels3D():Promise<Level3D[]>{const original=await loadOriginalLevels3D();return[...original,...levels3D.map((l,i)=>({...l,id:101+i,name:`Bonus 3D ${i+1}`}))];}
