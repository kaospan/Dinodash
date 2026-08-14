import type { Cell3D, Level3D } from './level3d';
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
