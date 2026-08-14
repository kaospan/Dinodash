import { describe, expect, it } from 'vitest';
import { levels3D } from './levels3d';
import { bonkRock, isComplete, movePlayer } from './level3dLogic';
describe('Dinodash 3D movement',()=>{
  it('has ten separate 7x7 levels',()=>{expect(levels3D).toHaveLength(10);expect(levels3D[0].width).toBe(7);expect(levels3D[0].depth).toBe(7);});
  it('allows a one-level climb',()=>{expect(movePlayer(levels3D[1],{x:1,y:3,height:1},'right')).toEqual({x:2,y:3,height:2});});
  it('blocks terrain more than one level higher',()=>{expect(movePlayer(levels3D[4],{x:1,y:3,height:1},'right')).toBeNull();});
  it('recognizes the goal',()=>{expect(isComplete(levels3D[0],levels3D[0].goal)).toBe(true);});
  it('reduces breakable rocks one level per bonk',()=>{const r=[{x:0,y:0,height:3}];expect(bonkRock(r,0)[0].height).toBe(2);expect(bonkRock(bonkRock(r,0),0)[0].height).toBe(1);expect(bonkRock(bonkRock(bonkRock(r,0),0),0)[0].height).toBe(0);});
});
