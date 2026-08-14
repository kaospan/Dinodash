export type TileType = 'floor' | 'wall' | 'goal' | 'start' | 'void' | 'rock' | 'platform';
export type Position3D = { x: number; y: number; height: number };
export type Cell3D = { x: number; y: number; height: number; type: TileType };
export type Rock3D = { x: number; y: number; height: number };
export type Platform3D = { x: number; y: number; dx: number; dy: number };
export type Level3D = {
  id: number;
  name?: string;
  width: number;
  depth: number;
  maxHeight: number;
  cells: Cell3D[];
  playerStart: Position3D;
  goal: Position3D;
  rocks?: Rock3D[];
  platforms?: Platform3D[];
  hint?: string;
};
