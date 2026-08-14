import fs from 'node:fs/promises';

const PROMOTED_SOURCE='https://raw.githubusercontent.com/kaospan/phoneagev3/main/src/data/promoted-levels.json';
const TARGET='src/game3d/levels3d.ts';
const ORIGINAL_LEVEL_COUNT=100;

async function fetchJson(url){
  const response=await fetch(url,{cache:'no-store'});
  if(!response.ok) throw new Error(`HTTP ${response.status} from ${url}`);
  return response.json();
}

function normalizeGrid(grid){
  if(grid.length===12 && grid[11]?.length===20 && grid[11].every(cell=>cell===5)) return grid.slice(0,-1);
  return grid;
}

function validateLevels(levels){
  if(!Array.isArray(levels)) throw new Error('Phoneage source is not an array');
  const originals=levels.filter(level=>Number.isInteger(level?.id)&&level.id>=1&&level.id<=ORIGINAL_LEVEL_COUNT).sort((a,b)=>a.id-b.id);
  if(originals.length!==ORIGINAL_LEVEL_COUNT) throw new Error(`Expected exactly ${ORIGINAL_LEVEL_COUNT} original Phoneage levels, got ${originals.length}`);
  const ids=new Set();
  for(const level of originals){
    if(ids.has(level.id)) throw new Error(`Duplicate Phoneage level ${level.id}`);
    ids.add(level.id);
    level.grid=normalizeGrid(level.grid);
    if(level.grid.length!==11||level.grid.some(row=>!Array.isArray(row)||row.length!==20)) throw new Error(`Level ${level.id} is not 11x20`);
    for(const row of level.grid) for(const tile of row) if(!Number.isInteger(tile)||tile<0||tile>20) throw new Error(`Level ${level.id} has invalid tile ${tile}`);
    if(!level.playerStart||!level.cavePos) throw new Error(`Level ${level.id} missing start/goal`);
  }
  return originals;
}

const levels=validateLevels(await fetchJson(PROMOTED_SOURCE));
const payload=JSON.stringify(levels,null,2);
const output=`// GENERATED FROM kaospan/phoneagev3 original 100-level snapshot. DO NOT HAND EDIT.\nimport { build3DLevel } from './levelPipeline';\n\nconst SOURCE_LEVELS = ${payload} as const;\n\nexport const levels3D = SOURCE_LEVELS.map(source => {\n  const result = build3DLevel(source.id, source.grid as number[][], source.playerStart, source.cavePos);\n  if (result.warnings.length) throw new Error(\`Level ${'${source.id}'} rejected: ${'${result.warnings.join("; ")}' }\`);\n  return { ...result.level, name: \`Original Level ${'${source.id}'} · Compressed ${'${result.level.width}'}×${'${result.level.depth}'}\` };\n});\n\nexport const level3DCount = levels3D.length;\nexport async function loadCampaignLevels3D(){ return levels3D; }\nif (level3DCount !== ${ORIGINAL_LEVEL_COUNT}) throw new Error(\`Dinodash requires ${ORIGINAL_LEVEL_COUNT} source levels, got ${'${level3DCount}'}\`);\n`;
await fs.writeFile(TARGET,output);
console.log(`Synced ${levels.length} original Phoneage levels from stable snapshot into ${TARGET}`);
