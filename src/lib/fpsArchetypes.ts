// Pure, framework-free CellType -> visual-archetype mapping for FPS mode.
// Kept in sync with phoneagev3 so GameFPS has no hidden dependency on the reference repo.

import { getArrowDirections, isArrowCell } from "@/game/arrows";

export type FpsGroundArchetype = "void" | "floor" | "wall" | "water";
export type FpsArrowPropArchetype = "arrowUp" | "arrowRight" | "arrowDown" | "arrowLeft";
export type FpsPropArchetype =
  | "stone" | "breakable" | FpsArrowPropArchetype
  | "keyRed" | "keyGreen" | "lockRed" | "lockGreen" | "bonusTime" | "teleport";

export const FLOOR_THICKNESS = 0.12;
export const WALL_HEIGHT = 1.6;
export const WATER_DEPTH = 0.15;

const VOID_CELL = 5;
const WALL_CELL = 1;
const WATER_CELL = 4;

const SIMPLE_PROP_ARCHETYPE_BY_CELL: Partial<Record<number, FpsPropArchetype>> = {
  2: "stone", 6: "breakable", 19: "teleport", 14: "keyRed", 15: "keyGreen",
  16: "lockRed", 17: "lockGreen", 20: "bonusTime",
};

export function groundArchetypeForCell(cell: number): FpsGroundArchetype {
  if (cell === VOID_CELL) return "void";
  if (cell === WALL_CELL) return "wall";
  if (cell === WATER_CELL) return "water";
  return "floor";
}

export function propArchetypeForCell(cell: number): FpsPropArchetype | null {
  return SIMPLE_PROP_ARCHETYPE_BY_CELL[cell] ?? null;
}

const arrowBucketForDelta = (dx: number, dy: number): FpsArrowPropArchetype => {
  if (dy === -1) return "arrowUp";
  if (dy === 1) return "arrowDown";
  return dx === 1 ? "arrowRight" : "arrowLeft";
};

export function arrowPropArchetypesForCell(cell: number): FpsArrowPropArchetype[] {
  if (!isArrowCell(cell)) return [];
  return getArrowDirections(cell).map((d) => arrowBucketForDelta(d.dx, d.dy));
}

export interface FpsGridBuckets {
  ground: {
    floor: Array<[number, number, number]>;
    wall: Array<[number, number, number]>;
    water: Array<[number, number, number]>;
  };
  props: Partial<Record<FpsPropArchetype, Array<[number, number, number]>>>;
}

export function bucketGridForFps(grid: number[][], offsetX: number, offsetZ: number): FpsGridBuckets {
  const buckets: FpsGridBuckets = {
    ground: { floor: [], wall: [], water: [] },
    props: {},
  };
  const pushProp = (archetype: FpsPropArchetype, pos: [number, number, number]) => {
    (buckets.props[archetype] ??= []).push(pos);
  };

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const cell = grid[y][x];
      const ground = groundArchetypeForCell(cell);
      if (ground === "void") continue;
      const worldX = x + offsetX;
      const worldZ = y + offsetZ;

      if (ground === "wall") buckets.ground.wall.push([worldX, WALL_HEIGHT / 2, worldZ]);
      else if (ground === "water") buckets.ground.water.push([worldX, -WATER_DEPTH, worldZ]);
      else buckets.ground.floor.push([worldX, -FLOOR_THICKNESS / 2, worldZ]);

      const prop = propArchetypeForCell(cell);
      if (prop) pushProp(prop, [worldX, 0, worldZ]);
      for (const arrowProp of arrowPropArchetypesForCell(cell)) {
        pushProp(arrowProp, [worldX, 0, worldZ]);
      }
    }
  }
  return buckets;
}
