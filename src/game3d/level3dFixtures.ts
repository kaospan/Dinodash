import type { Level3D } from './level3d';

const fixture=(id:number,startHeight=1,goalX=6):Level3D=>({id,name:`3D fixture ${id}`,width:7,depth:7,maxHeight:4,cells:Array.from({length:49},(_,i)=>({x:i%7,y:Math.floor(i/7),height:1,type:'floor' as const})),playerStart:{x:0,y:0,height:startHeight},goal:{x:goalX,y:6,height:1}});

const climbFixture=fixture(2);
climbFixture.cells.find(c=>c.x===2&&c.y===3)!.height=2;

const blockedFixture=fixture(5);
blockedFixture.cells.find(c=>c.x===2&&c.y===3)!.height=3;

export const levels3DTestFixtures:Level3D[]=[fixture(1),climbFixture,fixture(3),fixture(4),blockedFixture,fixture(6),fixture(7),fixture(8),fixture(9),fixture(10)];
