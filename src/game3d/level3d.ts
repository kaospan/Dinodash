export type TileType = 'floor' | 'wall' | 'goal' | 'start';
export type Position3D = { x: number; y: number; height: number };
export type Cell3D = { x: number; y: number; height: number; type: TileType };
export type Level3D = {
  width: number;
  depth: number;
  maxHeight: number;
  cells: Cell3D[];
  playerStart: Position3D;
  goal: Position3D;
};
