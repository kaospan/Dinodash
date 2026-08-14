import { CellType, GameState, Position } from './types';
import { isArrowCell, getArrowDirections } from './arrows';
import { computePlayerGlidePath, computeRemoteArrowGlidePath } from './glide';
import { TELEPORT_CELL } from './teleport';

const isKeyCell = (cell: CellType) => cell === 14 || cell === 15;
const isLockCell = (cell: CellType) => cell === 16 || cell === 17;
const isHourglassCell = (cell: CellType) => cell === 20;
const keyColorForCell = (cell: CellType) => (cell === 14 ? 'red' : cell === 15 ? 'green' : null);
const lockColorForCell = (cell: CellType) => (cell === 16 ? 'red' : cell === 17 ? 'green' : null);
const keyCount = (inventory: GameState['inventory'], color: 'red' | 'green') =>
  Math.max(0, Math.floor(Number(inventory[color]) || 0));

export interface PlayerMoveOutcome {
  glidePath?: { path: Position[]; arrowType: CellType };
  newPlayerPos?: Position;
  newGrid?: CellType[][];
  brokeRock?: boolean;
  consumedMove?: boolean;
  startGlide?: boolean;
  collectedKey?: 'red' | 'green';
  unlockedLock?: 'red' | 'green';
  collectedHourglass?: Position;
}

export function attemptPlayerMove(state: GameState, dx: number, dy: number): PlayerMoveOutcome {
  const { grid, playerPos, breakableRockStates, baseGrid, inventory } = state;
  const targetX = playerPos.x + dx;
  const targetY = playerPos.y + dy;
  if (targetY < 0 || targetY >= grid.length || targetX < 0 || targetX >= grid[0].length) return {};

  const playerCell = grid[playerPos.y][playerPos.x];
  const targetCell = grid[targetY][targetX];
  const targetKey = keyColorForCell(targetCell);
  const targetLock = lockColorForCell(targetCell);
  const targetHourglass = isHourglassCell(targetCell);

  // Arrow tiles have explicit movement semantics. When Dino is standing on an arrow and
  // swipes in an allowed direction, the glide interaction must win over ordinary walking.
  // The glide itself may cross VOID only and stops immediately before every non-VOID cell.
  if (isArrowCell(playerCell)) {
    if (targetLock && keyCount(inventory, targetLock) <= 0) return {};

    const dirs = getArrowDirections(playerCell);
    const isArrowDir = dirs.some(d => d.dx === dx && d.dy === dy);
    if (isArrowDir) {
      const glide = computePlayerGlidePath(grid, playerPos, dx, dy, playerCell);
      if (glide.path.length === 0) return {};
      return {
        glidePath: glide,
        newGrid: grid.map(r => [...r]),
        startGlide: true,
        consumedMove: true,
      };
    }

    // A direction that is not allowed by the arrow behaves as ordinary stepping only when
    // the destination is a directly walkable gameplay tile.
    if (targetCell === 0 || targetCell === 3 || targetCell === 18 || targetCell === TELEPORT_CELL || isArrowCell(targetCell) || isKeyCell(targetCell) || isLockCell(targetCell) || targetHourglass) {
      const outcome: PlayerMoveOutcome = { newPlayerPos: { x: targetX, y: targetY }, consumedMove: true };
      if (targetKey || targetLock || targetHourglass) {
        const newGrid = grid.map(r => [...r]);
        if (targetKey) {
          inventory[targetKey] = keyCount(inventory, targetKey) + 1;
          outcome.collectedKey = targetKey;
        } else if (targetLock) {
          inventory[targetLock] = keyCount(inventory, targetLock) - 1;
          outcome.unlockedLock = targetLock;
        } else {
          outcome.collectedHourglass = { x: targetX, y: targetY };
        }
        newGrid[targetY][targetX] = 0;
        baseGrid[targetY][targetX] = 0;
        outcome.newGrid = newGrid;
      }
      return outcome;
    }

    if (targetCell === 6) {
      const key = `${targetX},${targetY}`;
      if (!breakableRockStates.get(key)) {
        breakableRockStates.set(key, true);
        return { newPlayerPos: { x: targetX, y: targetY }, consumedMove: true };
      }
    }
    return {};
  }

  const currentCell = playerCell;
  let willBreakRock = false;
  if (currentCell === 6) {
    const key = `${playerPos.x},${playerPos.y}`;
    if (breakableRockStates.get(key) && (targetX !== playerPos.x || targetY !== playerPos.y)) willBreakRock = true;
  }

  if (targetCell === 2) return {};

  if (targetCell === 6) {
    const key = `${targetX},${targetY}`;
    if (!breakableRockStates.get(key)) {
      breakableRockStates.set(key, true);
      const outcome: PlayerMoveOutcome = { newPlayerPos: { x: targetX, y: targetY }, consumedMove: true };
      if (willBreakRock) {
        const newGrid = grid.map(r => [...r]);
        newGrid[playerPos.y][playerPos.x] = 5;
        baseGrid[playerPos.y][playerPos.x] = 5;
        outcome.newGrid = newGrid;
        outcome.brokeRock = true;
      }
      return outcome;
    }
    return {};
  }

  if (targetLock && keyCount(inventory, targetLock) <= 0) return {};
  if (targetCell === 1 || targetCell === 4 || targetCell === 5) return {};

  const outcome: PlayerMoveOutcome = { newPlayerPos: { x: targetX, y: targetY }, consumedMove: true };
  if (targetKey || targetLock || targetHourglass) {
    const newGrid = outcome.newGrid ?? grid.map(r => [...r]);
    if (targetKey) {
      inventory[targetKey] = keyCount(inventory, targetKey) + 1;
      outcome.collectedKey = targetKey;
    } else if (targetLock) {
      inventory[targetLock] = keyCount(inventory, targetLock) - 1;
      outcome.unlockedLock = targetLock;
    } else {
      outcome.collectedHourglass = { x: targetX, y: targetY };
    }
    newGrid[targetY][targetX] = 0;
    baseGrid[targetY][targetX] = 0;
    outcome.newGrid = newGrid;
  }
  if (willBreakRock) {
    const newGrid = outcome.newGrid ?? grid.map(r => [...r]);
    newGrid[playerPos.y][playerPos.x] = 5;
    baseGrid[playerPos.y][playerPos.x] = 5;
    outcome.newGrid = newGrid;
    outcome.brokeRock = true;
  }
  return outcome;
}

export interface RemoteArrowOutcome {
  glidePath?: { path: Position[]; arrowType: CellType };
  newGrid?: CellType[][];
  consumedMove?: boolean;
}

export function attemptRemoteArrowMove(state: GameState, dx: number, dy: number): RemoteArrowOutcome {
  const { grid, selectedArrow } = state;
  if (!selectedArrow) return {};
  const arrowCell = grid[selectedArrow.y][selectedArrow.x] as CellType;
  if (!isArrowCell(arrowCell)) return {};

  const dirs = getArrowDirections(arrowCell);
  if (!dirs.some(d => d.dx === dx && d.dy === dy)) return {};

  const glide = computeRemoteArrowGlidePath(grid, selectedArrow, dx, dy, arrowCell);
  if (glide.path.length === 0) return {};
  return { glidePath: glide, newGrid: grid.map(r => [...r]), consumedMove: true };
}
