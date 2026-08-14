import type { Level3D, Position3D } from './level3d';
export type Move3D = 'up' | 'down' | 'left' | 'right';
const DELTAS: Record<Move3D, { x: number; y: number }> = {
  up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
};
export function cellAt(level: Level3D, x: number, y: number) {
  return level.cells.find((cell) => cell.x === x && cell.y === y);
}
export function movePlayer(level: Level3D, player: Position3D, move: Move3D): Position3D | null {
  const delta = DELTAS[move];
  const nextX = player.x + delta.x;
  const nextY = player.y + delta.y;
  if (nextX < 0 || nextY < 0 || nextX >= level.width || nextY >= level.depth) return null;
  const target = cellAt(level, nextX, nextY);
  if (!target || target.height > player.height + 1) return null;
  return { x: nextX, y: nextY, height: target.height };
}
export function isComplete(level: Level3D, player: Position3D) {
  return player.x === level.goal.x && player.y === level.goal.y && player.height === level.goal.height;
}
