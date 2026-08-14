export type TileType='floor'|'wall'|'water'|'goal'|'start'|'void'|'rock'|'platform'|'key-red'|'key-green'|'lock-red'|'lock-green'|'teleport'|'bonus-time';
export type Move3DDirection='up'|'right'|'down'|'left';
export type Position3D={x:number;y:number;height:number};
export type Cell3D={x:number;y:number;height:number;type:TileType;sourceTile?:number};
export type Rock3D={x:number;y:number;height:number;breakable?:boolean};
export type Platform3D={x:number;y:number;dx:number;dy:number;directions?:Move3DDirection[];selected?:boolean};
export type Level3D={id:number;name?:string;width:number;depth:number;maxHeight:number;cells:Cell3D[];playerStart:Position3D;goal:Position3D;rocks?:Rock3D[];platforms?:Platform3D[];hint?:string};
