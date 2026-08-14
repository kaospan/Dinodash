export type SemanticTile =
  | 'floor' | 'wall' | 'stone' | 'goal' | 'water' | 'void'
  | 'breakable' | 'arrow' | 'start' | 'teleport' | 'redKey' | 'greenKey'
  | 'redLock' | 'greenLock' | 'bonusTime';

export type ArrowDirection = 'up' | 'right' | 'down' | 'left';

export interface SemanticCell {
  x: number;
  y: number;
  tile: SemanticTile;
  arrowDirections?: ArrowDirection[];
  height?: number;
}

export interface SemanticLevel {
  id: number;
  sourceWidth: number;
  sourceHeight: number;
  cells: SemanticCell[];
  playerStart: { x: number; y: number };
  goal: { x: number; y: number };
}

export const DIRECTIONS: ArrowDirection[] = ['up', 'right', 'down', 'left'];

export function cellKey(x: number, y: number): string {
  return `${x},${y}`;
}

export function cloneSemanticLevel(level: SemanticLevel): SemanticLevel {
  return {
    ...level,
    cells: level.cells.map((cell) => ({
      ...cell,
      arrowDirections: cell.arrowDirections ? [...cell.arrowDirections] : undefined,
    })),
    playerStart: { ...level.playerStart },
    goal: { ...level.goal },
  };
}
