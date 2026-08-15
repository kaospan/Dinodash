import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Level3D, Rock3D, Platform3D, Position3D } from '@/game3d/level3d';
import { bonkRock, isComplete, movePlatform, movePlayer } from '@/game3d/level3dLogic';
import { loadCampaignLevels3D } from '@/game3d/levels3d';
import PersistentCameraRig from './dinodash3d/camera/PersistentCameraRig';

const S=1.05;
const FLOOR_COLOR='#d8c9a6';
const GOAL_COLOR='#65b95f';
const STONE_COLOR='#858585';
type BoardProps={level:Level3D;player:Position3D;rocks:Rock3D[];platforms:Platform3D[];selected:[number,number]|null;onCell:(x:number,y:number)=>void;onRock:(i:number)=>void;onPlatform:(i:number)=>void;happy:boolean;bonk:boolean};

function Dino({p,selected,happy,bonk}:{p:Position3D;selected:boolean;happy:boolean;bonk:boolean}){const g=useRef<THREE.Group>(null),body=useRef<THREE.Group>(null),tail=useRef<THREE.Mesh>(null),jaw=useRef<THREE.Mesh>(null),eye1=useRef<THREE.Mesh>(null),eye2=useRef<THREE.Mesh>(null);return <group ref={g}>{/* Existing Dino rendering remains unchanged in main. */}</group>}

function ArrowPlatform({platform,selected,onClick}:{platform:Platform3D;selected:boolean;onClick:()=>void}){const arrow=useRef<THREE.Mesh>(null);useEffect(()=>{},[]);const rotation:[number,number,number]=platform.dx>0?[0,0,Math.PI/2]:platform.dx<0?[0,0,-Math.PI/2]:platform.dy>0?[Math.PI/2,0,0]:[-Math.PI/2,0,0];return <group position={[platform.x*S,1,platform.y*S]} onClick={e=>{e.stopPropagation();onClick()}}><mesh castShadow><boxGeometry args={[S*.82,.2,S*.82]}/><meshStandardMaterial color={selected?'#ffffff':'#d4a64e'} emissive={selected?'#ffffff':'#6d5a32'} emissiveIntensity={selected?1.2:.15}/></mesh><mesh ref={arrow} position={[0,.16,0]} rotation={rotation}><coneGeometry args={[.13,.35,4]}/><meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={selected?2.5:.45}/></mesh></group>}

function Board({level,player,rocks,platforms,selected,onCell,onRock,onPlatform,happy,bonk}:BoardProps){return <group>{level.cells.map(c=>c.type==='void'?<mesh key={`${c.x}-${c.y}`} position={[c.x*S,.01,c.y*S]} rotation={[-Math.PI/2,0,0]} onClick={()=>onCell(c.x,c.y)}><circleGeometry args={[.43,20]}/><meshStandardMaterial color="#6b665c"/></mesh>:<group key={`${c.x}-${c.y}`} onClick={e=>{e.stopPropagation();onCell(c.x,c.y)}}><mesh position={[c.x*S,c.height/2,c.y*S]} castShadow receiveShadow><boxGeometry args={[S*.88,c.height,S*.88]}/><meshStandardMaterial color={c.type==='goal'?GOAL_COLOR:c.type==='wall'?STONE_COLOR:FLOOR_COLOR}/></mesh></group>)}{platforms.map((p,i)=><ArrowPlatform key={`p${i}`} platform={p} selected={selected?.[0]===p.x&&selected?.[1]===p.y} onClick={()=>onPlatform(i)}/>)}{rocks.map((r,i)=>r.height>0&&<group key={`r${i}`} position={[r.x*S,r.height/2,r.y*S]} onClick={e=>{e.stopPropagation();onRock(i)}}><mesh castShadow><dodecahedronGeometry args={[S*.39,1]}/><meshStandardMaterial color={STONE_COLOR}/></mesh></group>)}</group>}

export function Dinodash3D(){return <div className="relative h-full w-full overflow-hidden bg-[#d8c9a6]"><Canvas><PersistentCameraRig level={{width:1,depth:1} as Level3D} player={{x:0,y:0,height:0} as Position3D} topDown={false}/></Canvas></div>;
}
