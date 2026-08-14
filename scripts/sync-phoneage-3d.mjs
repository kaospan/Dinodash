import fs from 'node:fs/promises';

const LEVELS_SOURCE='https://raw.githubusercontent.com/kaospan/phoneage/main/src/data/levels.ts';
const TARGET='src/game3d/levels3d.ts';
const ORIGINAL_LEVEL_COUNT=100;

function extractArray(source, marker){
  const start=source.indexOf(marker);
  if(start<0) throw new Error(`Could not find ${marker}`);
  const open=source.indexOf('[',start);
  let depth=0,quote=null,escape=false,lineComment=false,blockComment=false;
  for(let i=open;i<source.length;i++){
    const c=source[i],n=source[i+1];
    if(lineComment){if(c==='\n')lineComment=false;continue}
    if(blockComment){if(c==='*'&&n==='/'){blockComment=false;i++}continue}
    if(quote){if(escape){escape=false;continue}if(c==='\\'){escape=true;continue}if(c===quote)quote=null;continue}
    if(c==='/'&&n==='/'){lineComment=true;i++;continue}
    if(c==='/'&&n==='*'){blockComment=true;i++;continue}
    if(c==='"'||c==="'"||c==='`'){quote=c;continue}
    if(c==='[')depth++;
    if(c===']'){depth--;if(depth===0)return source.slice(open,i+1)}
  }
  throw new Error('Unterminated level array');
}

function normalizeGrid(grid){
  if(!Array.isArray(grid)) return grid;
  if(grid.length===12 && Array.isArray(grid[11]) && grid[11].length===20 && grid[11].every(cell=>cell===5)) return grid.slice(0,-1);
  return grid;
}

function validateLevels(levels){
  if(!Array.isArray(levels)||levels.length!==ORIGINAL_LEVEL_COUNT) throw new Error(`Expected exactly ${ORIGINAL_LEVEL_COUNT} original Phoneage levels, got ${levels?.length??0}`);
  const ids=new Set();
  for(const level of levels){
    if(!Number.isInteger(level.id)||level.id<1||level.id>ORIGINAL_LEVEL_COUNT) throw new Error(`Invalid original level id ${level.id}`);
    if(ids.has(level.id)) throw new Error(`Duplicate original level id ${level.id}`);
    ids.add(level.id);
    level.grid=normalizeGrid(level.grid);
    if(!Array.isArray(level.grid)||level.grid.length!==11||level.grid.some(r=>!Array.isArray(r)||r.length!==20)) throw new Error(`Level ${level.id} is not 11x20`);
    for(const row of level.grid) for(const cell of row) if(!Number.isInteger(cell)||cell<0||cell>20) throw new Error(`Level ${level.id} has invalid tile ${cell}`);
    if(!level.playerStart||!level.cavePos) throw new Error(`Level ${level.id} missing start/goal`);
  }
  return levels.sort((a,b)=>a.id-b.id);
}

async function fetchText(url){
  const response=await fetch(url,{cache:'no-store'});
  if(!response.ok) throw new Error(`HTTP ${response.status} from ${url}`);
  return response.text();
}

const source=await fetchText(LEVELS_SOURCE);
if(!source.includes('Legend:')) throw new Error('Phoneage source validation failed: missing tile legend');
const expression=extractArray(source,'const baseManualLevels: Level[] =');
const levels=validateLevels(Function(`"use strict"; return (${expression});`)());

const payload=JSON.stringify(levels,null,2);
const output=`// GENERATED FROM kaospan/phoneage authoritative original campaign data. DO NOT HAND EDIT.\nimport { build3DLevel } from './levelPipeline';\n\nconst SOURCE_LEVELS = ${payload} as const;\n\nexport const levels3D = SOURCE_LEVELS.map(source => {\n  const result = build3DLevel(source.id, source.grid as number[][], source.playerStart, source.cavePos);\n  if (result.warnings.length) throw new Error(\`Level ${'${source.id}'} rejected: ${'${result.warnings.join("; ")}' }\`);\n  return { ...result.level, name: \`Level ${'${source.id}'}\` };\n});\n\nexport const level3DCount = levels3D.length;\nexport async function loadCampaignLevels3D(){ return levels3D; }\nif (level3DCount !== ${ORIGINAL_LEVEL_COUNT}) throw new Error(\`Dinodash requires ${ORIGINAL_LEVEL_COUNT} source levels, got ${'${level3DCount}'}\`);\n`;
await fs.writeFile(TARGET,output);
console.log(`Synced ${levels.length} authoritative Phoneage original levels into ${TARGET}`);
