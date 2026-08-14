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

/** The original small procedural 3D tutorial/puzzle set. Keep this intact. */
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

function convert(src: OriginalLevel): Level3D {
  const depth = src.grid.length;
  const width = Math.max(...src.grid.map(r => r.length));
  const cells: Cell3D[] = [];
  const rocks: Rock3D[] = [];
  const platforms: Platform3D[] = [];

  for (let y = 0; y < depth; y++) for (let x = 0; x < width; x++) {
    const tile = src.grid[y]?.[x] ?? 5;
    if (tile === 5) { cells.push({ x, y, height: 0, type: 'void' }); continue; }
    if (tile === 6) { cells.push({ x, y, height: 1, type: 'floor' }); rocks.push({ x, y, height: 3 }); continue; }
    const a = arrowFor(tile);
    if (a) { cells.push({ x, y, height: 1, type: 'floor' }); platforms.push({ x, y, dx: a.dx, dy: a.dy }); continue; }
    const type = tile === 3 ? 'goal' : tile === 18 ? 'start' : tile === 1 ? 'wall' : 'floor';
    cells.push({ x, y, height: tile === 1 ? 2 : 1, type });
  }

  const ps = src.playerStart;
  const g = src.cavePos;
  const start = { x: ps.x, y: ps.y, height: Math.max(1, cells.find(c => c.x === ps.x && c.y === ps.y)?.height ?? 1) };
  const goal = { x: g.x, y: g.y, height: Math.max(1, cells.find(c => c.x === g.x && c.y === g.y)?.height ?? 1) };
  return { id: src.id + 10, name: `Dino Quest ${src.id}`, width, depth, maxHeight: 3, cells, playerStart: start, goal, rocks, platforms, hint: 'Original Phoneage level adapted to 3D. Arrow platforms can be moved before you commit Dino.' };
}

let cachedOriginal: Level3D[] | null = null;

/** Original Phoneage 100-level campaign, kept separate so the 10 procedural levels remain intact. */
export async function loadOriginalLevels3D(): Promise<Level3D[]> {
  if (cachedOriginal) return cachedOriginal;
  const response = await fetch(SOURCE, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Unable to load original campaign: ${response.status}`);
  const data = await response.json() as OriginalLevel[];
  if (!Array.isArray(data) || data.length < 100) throw new Error('Original campaign data is incomplete');
  cachedOriginal = data.sort((a, b) => a.id - b.id).slice(0, 100).map(convert);
  return cachedOriginal;
}

/** Complete campaign: 10 procedural levels followed by the original 100-level adaptation. */
export async function loadCampaignLevels3D(): Promise<Level3D[]> {
  const original = await loadOriginalLevels3D();
  return [...levels3D, ...original];
}
