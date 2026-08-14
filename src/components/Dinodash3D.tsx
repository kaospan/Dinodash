import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as THREE from "three";

interface Level3D { id:number; name:string; heights:number[][]; start:[number,number]; goal:[number,number]; }
const LEVELS:Level3D[]=[
{id:1,name:"First Step",heights:[[1,1,1],[1,1,1],[1,1,1]],start:[0,0],goal:[2,2]},
{id:2,name:"The Rise",heights:[[1,1,1],[1,2,2],[1,1,1]],start:[0,0],goal:[2,2]},
{id:3,name:"Crossing",heights:[[1,2,1],[1,2,1],[1,2,2]],start:[0,0],goal:[2,2]},
{id:4,name:"Stairway",heights:[[1,2,3],[1,2,3],[1,1,3]],start:[0,0],goal:[2,2]},
{id:5,name:"High Ground",heights:[[2,1,2],[2,2,3],[1,2,3]],start:[0,0],goal:[2,2]},
{id:6,name:"The Valley",heights:[[3,2,1],[3,1,1],[2,2,3]],start:[0,0],goal:[2,2]},
{id:7,name:"Twin Peaks",heights:[[1,2,3],[2,1,2],[3,2,3]],start:[0,0],goal:[2,2]},
{id:8,name:"Mekorama",heights:[[1,3,2],[2,2,3],[3,1,3]],start:[0,0],goal:[2,2]},
{id:9,name:"Overlook",heights:[[2,3,3,2],[1,2,3,1],[1,1,2,2],[2,2,3,3]],start:[0,0],goal:[3,3]},
{id:10,name:"Dino Citadel",heights:[[1,2,3,2],[2,3,2,3],[3,2,3,2],[2,3,2,3]],start:[0,0],goal:[3,3]}
];
const CELL=1.18;
const heightAt=(l:Level3D,x:number,z:number)=>l.heights[z]?.[x]??0;
const walkable=(l:Level3D,a:[number,number],b:[number,number])=>b[0]>=0&&b[0]<l.heights[0].length&&b[1]>=0&&b[1]<l.heights.length&&Math.abs(heightAt(l,a[0],a[1])-heightAt(l,b[0],b[1]))<=1;

function Block({x,z,height,goal,start}:{x:number;z:number;height:number;goal:boolean;start:boolean}){
 const side=goal?"#d59d2a":start?"#5d8d5c":"#59645e";
 const top=goal?"#f4c95d":start?"#7da66e":"#7b887f";
 return <group position={[x*CELL,height/2-.06,z*CELL]}>
  <mesh castShadow receiveShadow><boxGeometry args={[CELL*.9,height,CELL*.9]}/><meshStandardMaterial color={side} roughness={.9}/></mesh>
  <mesh position={[0,height/2+.012,0]} receiveShadow><boxGeometry args={[CELL*.78,.035,CELL*.78]}/><meshStandardMaterial color={top} roughness={.8}/></mesh>
  <mesh position={[0,height/2+.035,0]}><boxGeometry args={[CELL*.7,.012,CELL*.7]}/><meshStandardMaterial color="#aab29f" roughness={1}/></mesh>
  {goal&&<><mesh position={[0,height/2+.12,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.22,.34,32]}/><meshBasicMaterial color="#ffe79a" transparent opacity={.95}/></mesh><mesh position={[0,height/2+.18,0]}><cylinderGeometry args={[.045,.045,.35,10]}/><meshStandardMaterial color="#e6b84b"/></mesh></>}
  {start&&<mesh position={[0,height/2+.08,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.14,.2,20]}/><meshBasicMaterial color="#b5e29a" transparent opacity={.8}/></mesh>}
 </group>;
}

function Bush({x,z,y}:{x:number;z:number;y:number}){return <group position={[x*CELL,y+.06,z*CELL]}><mesh castShadow position={[0,.12,0]}><dodecahedronGeometry args={[.14,1]}/><meshStandardMaterial color="#557b51" roughness={1}/></mesh><mesh castShadow position={[.08,.21,.02]}><dodecahedronGeometry args={[.11,1]}/><meshStandardMaterial color="#6e965c" roughness={1}/></mesh></group>}

function Dino({position,height,moving}:{position:[number,number];height:number;moving:boolean}){
 const ref=useMemo(()=>new THREE.Group(),[]);
 useFrame(({clock})=>{ref.position.y=height+.25+Math.sin(clock.getElapsedTime()*5)*.025;ref.rotation.z=moving?Math.sin(clock.getElapsedTime()*12)*.06:0;});
 return <group ref={ref} position={[position[0]*CELL,0,position[1]*CELL]}>
  <mesh castShadow position={[0,.18,0]}><capsuleGeometry args={[.18,.28,6,12]}/><meshStandardMaterial color="#72c86b" roughness={.7}/></mesh>
  <mesh castShadow position={[0,.48,-.03]}><sphereGeometry args={[.19,20,14]}/><meshStandardMaterial color="#8bdb76" roughness={.65}/></mesh>
  <mesh castShadow position={[0,.54,.12]} rotation={[Math.PI/2,0,0]}><coneGeometry args={[.11,.2,8]}/><meshStandardMaterial color="#63b85f"/></mesh>
  <mesh position={[.065,.52,-.19]}><sphereGeometry args={[.032,10,8]}/><meshStandardMaterial color="#172017"/></mesh>
  <mesh position={[-.065,.52,-.19]}><sphereGeometry args={[.032,10,8]}/><meshStandardMaterial color="#172017"/></mesh>
  <mesh castShadow position={[.18,.25,.02]} rotation={[0,0,-.7]}><capsuleGeometry args={[.045,.18,4,8]}/><meshStandardMaterial color="#63b85f"/></mesh>
  <mesh castShadow position={[-.18,.25,.02]} rotation={[0,0,.7]}><capsuleGeometry args={[.045,.18,4,8]}/><meshStandardMaterial color="#63b85f"/></mesh>
 </group>;
}

function Scene({level,player,onMove,moving}:{level:Level3D;player:[number,number];onMove:(dx:number,dz:number)=>void;moving:boolean}){
 const target=useMemo(()=>new THREE.Vector3((level.heights[0].length-1)*CELL/2,0,(level.heights.length-1)*CELL/2),[level]);
 const bushes=useMemo(()=>{const out:{x:number;z:number;y:number}[]=[];level.heights.forEach((row,z)=>row.forEach((h,x)=>{if((x+z)%3===0&&!((x===level.goal[0]&&z===level.goal[1])||(x===level.start[0]&&z===level.start[1])))out.push({x,z,y:h})}));return out},[level]);
 return <>
  <PerspectiveCamera makeDefault position={[5.8,6.6,7.8]} fov={39}/>
  <ambientLight intensity={1.2}/><hemisphereLight intensity={1.1} color="#d8edff" groundColor="#273126"/>
  <directionalLight position={[4,9,5]} intensity={3.1} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-near={1} shadow-camera-far={20}/>
  <pointLight position={[-3,5,-3]} intensity={12} distance={12} color="#b9d7ff"/>
  <group position={[-target.x,-.02,-target.z]}>
   <mesh position={[target.x,-.13,target.z]} receiveShadow><boxGeometry args={[(level.heights[0].length+1)*CELL,.18,(level.heights.length+1)*CELL]}/><meshStandardMaterial color="#303b32" roughness={1}/></mesh>
   {level.heights.map((row,z)=>row.map((h,x)=><Block key={`${x}-${z}`} x={x} z={z} height={h} goal={x===level.goal[0]&&z===level.goal[1]} start={x===level.start[0]&&z===level.start[1]}/>))}
   {bushes.map((b,i)=><Bush key={i}{...b}/>)}
   <Dino position={player} height={heightAt(level,player[0],player[1])} moving={moving}/>
  </group>
  <OrbitControls target={[0,.4,0]} enablePan={false} minDistance={5} maxDistance={13} minPolarAngle={.55} maxPolarAngle={1.38} enableDamping dampingFactor={.08}/>
 </>;
}
function Keyboard({onMove}:{onMove:(dx:number,dz:number)=>void}){useEffect(()=>{const h=(e:KeyboardEvent)=>{const m:Record<string,[number,number]>={arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1],arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0]};const v=m[e.key.toLowerCase()];if(v){e.preventDefault();onMove(...v)}};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h)},[onMove]);return null}

export function Dinodash3D(){
 const[i,setI]=useState(0);const[p,setP]=useState<[number,number]>(LEVELS[0].start);const[moves,setMoves]=useState(0);const[complete,setComplete]=useState(false);const[moving,setMoving]=useState(false);const level=LEVELS[i];
 const load=useCallback((n:number)=>{const j=Math.max(0,Math.min(LEVELS.length-1,n));setI(j);setP(LEVELS[j].start);setMoves(0);setComplete(false)},[]);
 const move=useCallback((dx:number,dz:number)=>{if(complete)return;const n:[number,number]=[p[0]+dx,p[1]+dz];if(!walkable(level,p,n))return;setP(n);setMoves(v=>v+1);setMoving(true);window.setTimeout(()=>setMoving(false),180);if(n[0]===level.goal[0]&&n[1]===level.goal[1])setComplete(true)},[complete,level,p]);
 return <div className="relative h-full w-full overflow-hidden bg-[#172019] text-stone-100">
  <Canvas shadows dpr={[1,2]} gl={{antialias:true,powerPreference:"high-performance"}}><color attach="background" args={["#b7c6b2"]}/><fog attach="fog" args={["#b7c6b2",9,19]}/><Scene level={level} player={p} onMove={move} moving={moving}/></Canvas><Keyboard onMove={move}/>
  <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-3 md:p-5"><div className="pointer-events-auto rounded-2xl border border-white/30 bg-[#182019]/75 px-4 py-3 shadow-xl backdrop-blur-xl"><div className="text-[10px] font-black uppercase tracking-[.28em] text-amber-300">DINODASH · 3D</div><div className="mt-1 text-lg font-black">{level.name}</div><div className="text-xs text-stone-300">Level {level.id} · {moves} moves</div></div><div className="pointer-events-auto flex gap-2"><button className="rounded-xl border border-white/20 bg-[#182019]/75 px-3 py-2 text-xs font-bold shadow-lg backdrop-blur" onClick={()=>load(i-1)} disabled={i===0}>←</button><button className="rounded-xl border border-white/20 bg-[#182019]/75 px-3 py-2 text-xs font-bold shadow-lg backdrop-blur" onClick={()=>load(i+1)} disabled={i===LEVELS.length-1}>→</button><a className="rounded-xl border border-white/20 bg-[#182019]/75 px-3 py-2 text-xs font-bold shadow-lg backdrop-blur" href="?2d">2D</a></div></div>
  <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 text-center"><div className="mb-2 rounded-full border border-white/20 bg-[#182019]/60 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-stone-200 backdrop-blur">Reach the golden tile · climb one level at a time</div><div className="grid grid-cols-3 gap-1.5 pointer-events-auto"><span/><button aria-label="Move up" className="h-12 w-12 rounded-xl border border-white/20 bg-[#182019]/75 text-xl shadow-lg backdrop-blur" onClick={()=>move(0,-1)}>↑</button><span/><button aria-label="Move left" className="h-12 w-12 rounded-xl border border-white/20 bg-[#182019]/75 text-xl shadow-lg backdrop-blur" onClick={()=>move(-1,0)}>←</button><button aria-label="Move down" className="h-12 w-12 rounded-xl border border-white/20 bg-[#182019]/75 text-xl shadow-lg backdrop-blur" onClick={()=>move(0,1)}>↓</button><button aria-label="Move right" className="h-12 w-12 rounded-xl border border-white/20 bg-[#182019]/75 text-xl shadow-lg backdrop-blur" onClick={()=>move(1,0)}>→</button></div></div>
  {complete&&<div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"><div className="mx-4 rounded-3xl border border-amber-200/40 bg-[#182019]/95 p-7 text-center shadow-2xl"><div className="text-xs font-black uppercase tracking-[.25em] text-amber-300">Level Complete</div><div className="mt-2 text-3xl font-black">Dino made it.</div><div className="mt-1 text-sm text-stone-300">Solved in {moves} moves</div><button className="mt-5 rounded-xl bg-amber-300 px-5 py-3 text-sm font-black text-stone-950" onClick={()=>load(i+1)} disabled={i===LEVELS.length-1}>{i===LEVELS.length-1?"Campaign Complete":"Next Adventure →"}</button></div></div>}
 </div>;
}
