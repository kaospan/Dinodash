import { CellType, Position, PlayerGlideResult, ArrowMoveResult } from './types';
import { isArrowCell } from './arrows';

// Arrow glides are strict: an arrow may cross contiguous VOID (cell 5) only.
// Every non-void cell is a hard stop and is never entered by the glide path.
const PLAYER_GLIDE_BLOCKERS = new Set<CellType>([0, 1, 2, 3, 4, 6, 18, 19, 20]);
const REMOTE_GLIDE_BLOCKERS = new Set<CellType>([0, 1, 2, 3, 4, 6, 18, 19, 20]);
const VOID_CELL: CellType = 5;

export function computePlayerGlidePath(grid: CellType[][], start: Position, dx: number, dy: number, arrowType: CellType): PlayerGlideResult {
  const path: Position[] = [];
  let x = start.x;
  let y = start.y;
  while (true) {
    const nx = x + dx;
    const ny = y + dy;
    if (ny < 0 || ny >= grid.length || nx < 0 || nx >= grid[0].length) break;
    const cell = grid[ny][nx];
    if (PLAYER_GLIDE_BLOCKERS.has(cell) || isArrowCell(cell)) break;
    if (cell !== VOID_CELL) break;
    x = nx;
    y = ny;
    path.push({ x, y });
  }
  return { path, arrowType };
}

export function computeRemoteArrowGlidePath(grid: CellType[][], start: Position, dx: number, dy: number, arrowType: CellType): ArrowMoveResult {
  const path: Position[] = [];
  let x = start.x;
  let y = start.y;
  while (true) {
    const nx = x + dx;
    const ny = y + dy;
    if (ny < 0 || ny >= grid.length || nx < 0 || nx >= grid[0].length) break;
    const cell = grid[ny][nx];
    if (REMOTE_GLIDE_BLOCKERS.has(cell) || isArrowCell(cell)) break;
    if (cell !== VOID_CELL) break;
    x = nx;
    y = ny;
    path.push({ x, y });
  }
  return { path, arrowType };
}
