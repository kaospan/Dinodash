export type SemanticTile =
  | { kind: 'void' }
  | { kind: 'floor' }
  | { kind: 'wall' }
  | { kind: 'stone'; height: number }
  | { kind: 'breakable'; height: number }
  | { kind: 'goal' }
  | { kind: 'start' }
  | { kind: 'arrow'; directions: Array<'up'|'right'|'down'|'left'> };

export type SemanticLevel = {
  id: number;
  width: number;
  height: number;
  tiles: SemanticTile[][];
  playerStart: { x: number; y: number };
  goal: { x: number; y: number };
};

const directions = ['up', 'right', 'down', 'left'] as const;

export function phoneageTileToSemantic(id: number): SemanticTile {
  switch (id) {
    case 0: return { kind: 'floor' };
    case 1: case 4: return { kind: 'wall' };
    case 2: return { kind: 'stone', height: 1 };
    case 3: return { kind: 'goal' };
    case 5: return { kind: 'void' };
    case 6: return { kind: 'breakable', height: 3 };
    case 7: case 8: case 9: case 10: return { kind: 'arrow', directions: [directions[id - 7]] };
    case 11: return { kind: 'arrow', directions: ['up', 'down'] };
    case 12: return { kind: 'arrow', directions: ['left', 'right'] };
    case 13: return { kind: 'arrow', directions: [...directions] };
    default: return { kind: 'floor' };
  }
}

export function convertPhoneageLevel(id: number, grid: number[][], playerStart: {x:number;y:number}, cavePos: {x:number;y:number}): SemanticLevel {
  const height = grid.length;
  const width = Math.max(0, ...grid.map(r => r.length));
  const tiles = grid.map(row => Array.from({length: width}, (_, x) => phoneageTileToSemantic(row[x] ?? 5)));
  if (tiles[playerStart.y]?.[playerStart.x]) tiles[playerStart.y][playerStart.x] = {kind:'start'};
  if (tiles[cavePos.y]?.[cavePos.x]) tiles[cavePos.y][cavePos.x] = {kind:'goal'};
  return { id, width, height, tiles, playerStart, goal: cavePos };
}

export function compressSemanticLevel(level: SemanticLevel, maxWidth = 16, maxHeight = 9): SemanticLevel {
  if (level.width <= maxWidth && level.height <= maxHeight) return level;
  const important = [level.playerStart, level.goal];
  for (let y=0;y<level.height;y++) for (let x=0;x<level.width;x++) {
    if (level.tiles[y][x].kind !== 'void') important.push({x,y});
  }
  const minX = Math.max(0, Math.min(...important.map(p=>p.x)));
  const minY = Math.max(0, Math.min(...important.map(p=>p.y)));
  const maxX = Math.min(level.width-1, minX + maxWidth - 1);
  const maxY = Math.min(level.height-1, minY + maxHeight - 1);
  const tiles = level.tiles.slice(minY,maxY+1).map(r=>r.slice(minX,maxX+1));
  return {...level,width:tiles[0]?.length ?? 0,height:tiles.length,tiles,
    playerStart:{x:level.playerStart.x-minX,y:level.playerStart.y-minY},
    goal:{x:level.goal.x-minX,y:level.goal.y-minY}};
}

export function validateSemanticLevel(level: SemanticLevel): string[] {
  const errors:string[]=[];
  if (!level.width || !level.height) errors.push('empty level');
  if (!level.tiles[level.playerStart.y]?.[level.playerStart.x]) errors.push('start outside map');
  if (!level.tiles[level.goal.y]?.[level.goal.x]) errors.push('goal outside map');
  let arrows=0, rocks=0;
  for (const row of level.tiles) for (const tile of row) {
    if (tile.kind==='arrow') arrows++;
    if (tile.kind==='stone'||tile.kind==='breakable') rocks++;
  }
  if (arrows < 0 || rocks < 0) errors.push('invalid object count');
  return errors;
}
