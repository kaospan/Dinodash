import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useMemo, useState } from "react";
import * as THREE from "three";

interface Level3D {
  id: number;
  name: string;
  heights: number[][];
  start: [number, number];
  goal: [number, number];
}

const LEVELS: Level3D[] = [
  { id: 1, name: "First Step", heights: [[1,1,1],[1,1,1],[1,1,1]], start:[0,0], goal:[2,2] },
  { id: 2, name: "The Rise", heights: [[1,1,1],[1,2,2],[1,1,1]], start:[0,0], goal:[2,2] },
  { id: 3, name: "Crossing", heights: [[1,2,1],[1,2,1],[1,2,2]], start:[0,0], goal:[2,2] },
  { id: 4, name: "Stairway", heights: [[1,2,3],[1,2,3],[1,1,3]], start:[0,0], goal:[2,2] },
  { id: 5, name: "High Ground", heights: [[2,1,2],[2,2,3],[1,2,3]], start:[0,0], goal:[2,2] },
  { id: 6, name: "The Valley", heights: [[3,2,1],[3,1,1],[2,2,3]], start:[0,0], goal:[2,2] },
  { id: 7, name: "Twin Peaks", heights: [[1,2,3],[2,1,2],[3,2,3]], start:[0,0], goal:[2,2] },
  { id: 8, name: "Mekorama", heights: [[1,3,2],[2,2,3],[3,1,3]], start:[0,0], goal:[2,2] },
  { id: 9, name: "Overlook", heights: [[2,3,3,2],[1,2,3,1],[1,1,2,2],[2,2,3,3]], start:[0,0], goal:[3,3] },
  { id: 10, name: "Dino Citadel", heights: [[1,2,3,2],[2,3,2,3],[3,2,3,2],[2,3,2,3]], start:[0,0], goal:[3,3] },
];

const CELL = 1.15;

function heightAt(level: Level3D, x: number, z: number) {
  return level.heights[z]?.[x] ?? 0;
}

function isWalkable(level: Level3D, from: [number, number], to: [number, number]) {
  const w = level.heights[0].length;
  const h = level.heights.length;
  if (to[0] < 0 || to[0] >= w || to[1] < 0 || to[1] >= h) return false;
  return Math.abs(heightAt(level, from[0], from[1]) - heightAt(level, to[0], to[1])) <= 1;
}

function Block({ x, z, height, goal, start }: { x:number; z:number; height:number; goal:boolean; start:boolean }) {
  const y = height * 0.5 - 0.04;
  return (
    <group position={[x * CELL, y, z * CELL]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[CELL * 0.92, height, CELL * 0.92]} />
        <meshStandardMaterial color={goal ? "#e6b84f" : start ? "#78a86f" : "#7b8178"} roughness={0.82} />
      </mesh>
      <mesh position={[0, height * 0.5 + 0.012, 0]} receiveShadow>
        <boxGeometry args={[CELL * 0.78, 0.025, CELL * 0.78]} />
        <meshStandardMaterial color={goal ? "#ffe69a" : "#9aa18f"} roughness={0.9} />
      </mesh>
      {goal && <mesh position={[0, height * 0.5 + 0.18, 0]} rotation={[-Math.PI / 2,0,0]}>
        <ringGeometry args={[0.2,0.29,32]} />
        <meshBasicMaterial color="#fff0a6" transparent opacity={0.9} />
      </mesh>}
    </group>
  );
}

function Player({ position, height }: { position:[number,number]; height:number }) {
  const ref = THREE.Object3D ? undefined : undefined;
  return (
    <group position={[position[0] * CELL, height + 0.28, position[1] * CELL]}>
      <mesh castShadow position={[0,0.18,0]}>
        <sphereGeometry args={[0.22,18,12]} />
        <meshStandardMaterial color="#7de38d" roughness={0.55} />
      </mesh>
      <mesh castShadow position={[0,0.43,0]}>
        <sphereGeometry args={[0.16,16,10]} />
        <meshStandardMaterial color="#5ac46d" roughness={0.55} />
      </mesh>
      <mesh castShadow position={[0.11,0.49,-0.03]}>
        <sphereGeometry args={[0.035,8,8]} />
        <meshStandardMaterial color="#101511" />
      </mesh>
      <mesh castShadow position={[-0.11,0.49,-0.03]}>
        <sphereGeometry args={[0.035,8,8]} />
        <meshStandardMaterial color="#101511" />
      </mesh>
    </group>
  );
}

function Scene({ level, player, onMove }: { level:Level3D; player:[number,number]; onMove:(dx:number,dz:number)=>void }) {
  const target = useMemo(() => new THREE.Vector3(((level.heights[0].length-1)*CELL)/2, 0, ((level.heights.length-1)*CELL)/2), [level]);
  useFrame((_, dt) => { void dt; });
  return (
    <>
      <PerspectiveCamera makeDefault position={[5.5,6.5,7.5]} fov={42} />
      <ambientLight intensity={1.4} />
      <directionalLight position={[4,9,5]} intensity={2.4} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <pointLight position={[-3,5,-3]} intensity={10} distance={14} color="#b7d6ff" />
      <group position={[-target.x,-0.02,-target.z]}>
        {level.heights.map((row,z) => row.map((height,x) => (
          <Block key={`${x}-${z}`} x={x} z={z} height={height} goal={x===level.goal[0]&&z===level.goal[1]} start={x===level.start[0]&&z===level.start[1]} />
        )))}
        <Player position={player} height={heightAt(level,player[0],player[1])} />
      </group>
      <OrbitControls target={[0,0,0]} enablePan={false} minDistance={5} maxDistance={13} minPolarAngle={0.55} maxPolarAngle={1.35} />
      <KeyboardController onMove={onMove} />
    </>
  );
}

function KeyboardController({ onMove }: { onMove:(dx:number,dz:number)=>void }) {
  useMemo(() => undefined, []);
  return null;
}

export function Dinodash3D() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [player, setPlayer] = useState<[number,number]>(LEVELS[0].start);
  const [moves, setMoves] = useState(0);
  const [complete, setComplete] = useState(false);
  const level = LEVELS[levelIndex];

  const loadLevel = (index:number) => {
    const next = LEVELS[Math.max(0, Math.min(LEVELS.length-1,index))];
    setLevelIndex(Math.max(0, Math.min(LEVELS.length-1,index)));
    setPlayer(next.start);
    setMoves(0);
    setComplete(false);
  };

  const move = (dx:number,dz:number) => {
    if (complete) return;
    const next:[number,number] = [player[0]+dx,player[1]+dz];
    if (!isWalkable(level, player, next)) return;
    setPlayer(next);
    setMoves(v=>v+1);
    if (next[0]===level.goal[0] && next[1]===level.goal[1]) setComplete(true);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#101612] text-stone-100">
      <Canvas shadows dpr={[1,2]} gl={{ antialias:true }}>
        <color attach="background" args={["#101612"]} />
        <fog attach="fog" args={["#101612", 8, 18]} />
        <Scene level={level} player={player} onMove={move} />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-3 md:p-5">
        <div className="pointer-events-auto rounded-2xl border border-white/10 bg-black/55 px-4 py-3 backdrop-blur-xl">
          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">DINODASH 3D</div>
          <div className="mt-1 text-lg font-black">Level {level.id} · {level.name}</div>
          <div className="text-xs text-stone-400">{moves} moves · {level.heights[0].length}×{level.heights.length}×3</div>
        </div>
        <div className="pointer-events-auto flex gap-2">
          <button className="rounded-xl border border-white/10 bg-black/55 px-3 py-2 text-xs font-bold backdrop-blur-xl" onClick={()=>loadLevel(levelIndex-1)} disabled={levelIndex===0}>←</button>
          <button className="rounded-xl border border-white/10 bg-black/55 px-3 py-2 text-xs font-bold backdrop-blur-xl" onClick={()=>loadLevel(levelIndex+1)} disabled={levelIndex===LEVELS.length-1}>→</button>
          <a className="rounded-xl border border-white/10 bg-black/55 px-3 py-2 text-xs font-bold backdrop-blur-xl" href="?2d">2D</a>
        </div>
      </div>

      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2">
        <div className="grid grid-cols-3 gap-1.5">
          <span />
          <button aria-label="Move up" className="h-12 w-12 rounded-xl border border-white/10 bg-black/60 text-xl backdrop-blur-xl" onClick={()=>move(0,-1)}>↑</button>
          <span />
          <button aria-label="Move left" className="h-12 w-12 rounded-xl border border-white/10 bg-black/60 text-xl backdrop-blur-xl" onClick={()=>move(-1,0)}>←</button>
          <button aria-label="Move down" className="h-12 w-12 rounded-xl border border-white/10 bg-black/60 text-xl backdrop-blur-xl" onClick={()=>move(0,1)}>↓</button>
          <button aria-label="Move right" className="h-12 w-12 rounded-xl border border-white/10 bg-black/60 text-xl backdrop-blur-xl" onClick={()=>move(1,0)}>→</button>
        </div>
      </div>

      {complete && <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/35 backdrop-blur-[2px]">
        <div className="rounded-3xl border border-amber-200/30 bg-[#171b15]/95 p-7 text-center shadow-2xl">
          <div className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">Level Complete</div>
          <div className="mt-2 text-3xl font-black">Great climb.</div>
          <div className="mt-1 text-sm text-stone-400">{moves} moves</div>
          <button className="mt-5 rounded-xl bg-amber-300 px-5 py-3 text-sm font-black text-stone-950" onClick={()=>loadLevel(levelIndex+1)} disabled={levelIndex===LEVELS.length-1}>
            {levelIndex===LEVELS.length-1 ? "Campaign Complete" : "Next Level →"}
          </button>
        </div>
      </div>}
    </div>
  );
}
