import type { Level } from '../data/phoneageSource';
import type { ArrowDirection, SemanticCell, SemanticLevel, SemanticTile } from './semanticLevel';

/**
 * PhoneAge's numeric legend is the only numeric-to-semantic contract.
 * Do not infer tile meaning from rendering IDs.
 */
export const PHONEAGE_TILE = {
  FLOOR: 0, WALL: 1, STONE: 2, GOAL: 3, WATER: 4, VOID: 5, BREAKABLE: 6,
  ARROW_UP: 7, ARROW_RIGHT: 8, ARROW_DOWN: 9, ARROW_LEFT: 10,
  ARROW_VERTICAL: 11, ARROW_HORIZONTAL: 12, ARROW_ALL: 13,
  RED_KEY: 14, GREEN_KEY: 15, RED_LOCK: 16, GREEN_LOCK: 17,
  START: 18, TELEPORT: 19, BONUS_TIME: 20,
} as const;

function arrowDirections(value: number): ArrowDirection[] | undefined {
  switch (value) {
    case PHONEAGE_TILE.ARROW_UP: return ['up'];
    case PHONEAGE_TILE.ARROW_RIGHT: return ['right'];
    case PHONEAGE_TILE.ARROW_DOWN: return ['down'];
    case PHONEAGE_TILE.ARROW_LEFT: return ['left'];
    case PHONEAGE_TILE.ARROW_VERTICAL: return ['up', 'down'];
    case PHONEAGE_TILE.ARROW_HORIZONTAL: return ['left', 'right'];
    case PHONEAGE_TILE.ARROW_ALL: return ['up', 'right', 'down', 'left'];
    default: return undefined;
  }
}

function semanticTile(value: number): SemanticTile {
  switch (value) {
    case PHONEAGE_TILE.FLOOR: return 'floor';
    case PHONEAGE_TILE.WALL: return 'wall';
    case PHONEAGE_TILE.STONE: return 'stone';
    case PHONEAGE_TILE.GOAL: return 'goal';
    case PHONEAGE_TILE.WATER: return 'water';
    case PHONEAGE_TILE.VOID: return 'void';
    case PHONEAGE_TILE.BREAKABLE: return 'breakable';
    case PHONEAGE_TILE.RED_KEY: return 'redKey';
    case PHONEAGE_TILE.GREEN_KEY: return 'greenKey';
    case PHONEAGE_TILE.RED_LOCK: return 'redLock';
    case PHONEAGE_TILE.GREEN_LOCK: return 'greenLock';
    case PHONEAGE_TILE.START: return 'start';
    case PHONEAGE_TILE.TELEPORT: return 'teleport';
    case PHONEAGE_TILE.BONUS_TIME: return 'bonusTime';
    default:
      if (arrowDirections(value)) return 'arrow';
      throw new Error(`Unknown PhoneAge tile id: ${value}`);
  }
}

export function toSemanticLevel(level: Level): SemanticLevel {
  const cells: SemanticCell[] = [];
  for (let y = 0; y < level.grid.length; y += 1) {
    for (let x = 0; x < level.grid[y].length; x += 1) {
      const value = level.grid[y][x];
      const tile = semanticTile(value);
      const directions = arrowDirections(value);
      cells.push({ x, y, tile, arrowDirections: directions });
    }
  }

  return {
    id: level.id,
    sourceWidth: level.grid[0]?.length ?? 0,
    sourceHeight: level.grid.length,
    cells,
    playerStart: { ...level.playerStart },
    goal: { ...level.cavePos },
  };
}
