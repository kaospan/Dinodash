import { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import { levels3D } from '@/game3d/levels3d';
import { isComplete, movePlayer, type Move3D } from '@/game3d/level3dLogic';
import type { Level3D, Position3D } from '@/game3d/level3d';
import './Dinodash3D.css';

const D = 11;
const cameras = [[D,D,D],[-D,D,D],[-D,D,-D],[D,D,-D]] as const;
function Diorama({ level, player }: { level: Level3D; player: Position3D }) {
  const blocks = useMemo(() => {
    const geometry = new THREE.BoxGeometry(0.92, 1, 0.92);
    const material = new THREE.MeshStandardMaterial({ roughness: 0.78, metalness: 0.06 });
    const mesh = new THREE.InstancedMesh(geometry, material, level.cells.length * 3);
    const matrix = new THREE.Matrix4(); let index = 0;
    for (const cell of level.cells) for (let h = 0; h < cell.height; h += 1) {
      matrix.makeTranslation(cell.x - 3, h * 0.5, cell.y - 3); matrix.scale(new THREE.Vector3(1, 0.5, 1)); mesh.setMatrixAt(index++, matrix);
    }
    mesh.count = index; mesh.instanceMatrix.needsUpdate = true; return mesh;
  }, [level]);
  return <>
    <ambientLight intensity={1.7} /><directionalLight position={[6,10,8]} intensity={3.5} />
    <primitive object={blocks} />
    <mesh position={[player.x - 3, player.height * 0.5 + 0.5, player.y - 3]} castShadow><capsuleGeometry args={[0.22,0.45,4,10]} /><meshStandardMaterial roughness={0.5} /></mesh>
    <mesh position={[level.goal.x - 3, level.goal.height * 0.5 + 0.58, level.goal.y - 3]}><cylinderGeometry args={[0.28,0.34,0.12,24]} /><meshStandardMaterial emissive="white" emissiveIntensity={0.8} /></mesh>
  </>;
}
const moves: Array<[string, Move3D]> = [['↑','up'],['↓','down'],['←','left'],['→','right']];
export default function Dinodash3D() {
  const [levelIndex,setLevelIndex]=useState(0); const [player,setPlayer]=useState(levels3D[0].playerStart); const [rotation,setRotation]=useState(0); const [zoom,setZoom]=useState(7);
  const level=levels3D[levelIndex]; const complete=isComplete(level,player);
  const loadLevel=(next:number)=>{const i=(next+levels3D.length)%levels3D.length;setLevelIndex(i);setPlayer(levels3D[i].playerStart);};
  const tryMove=(move:Move3D)=>{const next=movePlayer(level,player,move);if(next)setPlayer(next);};
  return <main className="dinodash3d"><header className="dinodash3d__header"><div><strong>DINODASH</strong><span> / 3D</span></div><div>LEVEL {levelIndex+1} / {levels3D.length}</div></header>
    <section className="dinodash3d__stage"><Canvas dpr={[1,2]}><OrthographicCamera makeDefault position={cameras[rotation]} zoom={zoom} onUpdate={(camera)=>camera.lookAt(0,0,0)} /><color attach="background" args={['#d9d2c3']} /><Diorama level={level} player={player}/></Canvas>{complete&&<div className="dinodash3d__complete">LEVEL COMPLETE</div>}</section>
    <section className="dinodash3d__controls"><div className="dinodash3d__row"><button onClick={()=>setRotation(r=>(r+1)%4)}>ROTATE ↻</button><button onClick={()=>setZoom(z=>Math.min(10,z+1))}>+</button><button onClick={()=>setZoom(z=>Math.max(4,z-1))}>−</button></div>
      <div className="dinodash3d__dpad">{moves.map(([label,move])=><button key={move} onClick={()=>tryMove(move)} aria-label={move}>{label}</button>)}</div>
      <div className="dinodash3d__row"><button onClick={()=>loadLevel(levelIndex-1)}>PREV</button><button onClick={()=>setPlayer(level.playerStart)}>RESET</button><button onClick={()=>loadLevel(levelIndex+1)}>NEXT</button></div></section>
  </main>;
}
