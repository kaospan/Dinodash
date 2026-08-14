import { describe, expect, it } from 'vitest';
import { levels3DTestFixtures } from './level3dFixtures';
import { bonkRock, isComplete, movePlayer } from './level3dLogic';
import type { Level3D } from './level3d';

describe('Dinodash 3D movement',()=>{
  it('has ten separate 7x7 test fixtures',()=>{expect(levels3DTestFixtures).toHaveLength(10);expect(levels3DTestFixtures[0].width).toBe(7);expect(levels3DTestFixtures[0].depth).toBe(7);});
  it('allows a one-level climb',()=>{expect(movePlayer(levels3DTestFixtures[1],{x:1,y:3,height:1},'right')).toEqual({x:2,y:3,height:2});});
  it('blocks terrain more than one level higher',()=>{expect(movePlayer(levels3DTestFixtures[4],{x:1,y:3,height:1},'right')).toBeNull();});
  it('glides a player across a void gap from a directional arrow platform',()=>{
    const level:Level3D={id:999,name:'arrow glide test',width:5,depth:1,maxHeight:3,cells:[{x:0,y:0,height:1,type:'platform'},{x:1,y:0,height:0,type:'void'},{x:2,y:0,height:0,type:'void'},{x:3,y:0,height:1,type:'floor'},{x:4,y:0,height:1,type:'goal'}],playerStart:{x:0,y:0,height:1},goal:{x:4,y:0,height:1}};
    const platforms=[{x:0,y:0,dx:1,dy:0,directions:['right' as const]}];
    expect(movePlayer(level,{x:0,y:0,height:1},'right',[],platforms)).toEqual({x:2,y:0,height:1});
  });
  it('does not glide in a direction not permitted by the arrow',()=>{
    const level:Level3D={id:1000,width:3,depth:1,maxHeight:3,cells:[{x:0,y:0,height:1,type:'platform'},{x:1,y:0,height:0,type:'void'},{x:2,y:0,height:1,type:'floor'}],playerStart:{x:0,y:0,height:1},goal:{x:2,y:0,height:1}};
    const platforms=[{x:0,y:0,dx:1,dy:0,directions:['right' as const]}];
    expect(movePlayer(level,{x:0,y:0,height:1},'left',[],platforms)).toBeNull();
  });
  it('recognizes the goal',()=>{expect(isComplete(levels3DTestFixtures[0],levels3DTestFixtures[0].goal)).toBe(true);});
  it('reduces breakable rocks one level per bonk',()=>{const r=[{x:0,y:0,height:3}];expect(bonkRock(r,0)[0].height).toBe(2);expect(bonkRock(bonkRock(r,0),0)[0].height).toBe(1);expect(bonkRock(bonkRock(bonkRock(r,0),0),0)[0].height).toBe(0);});
});
