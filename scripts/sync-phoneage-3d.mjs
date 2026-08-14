import fs from 'node:fs/promises';

const SOURCE='https://raw.githubusercontent.com/kaospan/phoneage/main/src/data/levels.ts';
const TARGET='src/game3d/levels3d.ts';

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

const source=await (await fetch(SOURCE)).text();
if(!source.includes('Legend:')) throw new Error('Phoneage source validation failed');
const expression=extractArray(source,'const baseManualLevels: Level[] =');
let levels;
try{levels=Function(`"use strict"; return (${expression});`)();}
catch(error){throw new Error(`Could not evaluate Phoneage level data: ${error.message}`)}
if(!Array.isArray(levels)||levels.length!==100)throw new Error(`Expected exactly 100 original Phoneage levels, got ${levels?.length??0}`);
for(const level of levels){
  if(!Number.isInteger(level.id)||level.id<1||level.id>100)throw new Error(`Invalid level id ${level.id}`);
  if(!Array.isArray(level.grid)||level.grid.length!==11||level.grid.some(r=>!Array.isArray(r)||r.length!==20))throw new Error(`Level ${level.id} is not 11x20`);
  for(const row of level.grid)for(const cell of row)if(!Number.isInteger(cell)||cell<0||cell>20)throw new Error(`Level ${level.id} has invalid tile ${cell}`);
  if(!level.playerStart||!level.cavePos)throw new Error(`Level ${level.id} missing start/goal`);
}
levels.sort((a,b)=>a.id-b.id);
const payload=JSON.stringify(levels,null,2);
const output=`// GENERATED FROM kaospan/phoneage/src/data/levels.ts. DO NOT HAND EDIT.\nimport { build3DLevel } from './levelPipeline';\n\nconst SOURCE_LEVELS = ${payload} as const;\n\nexport const levels3D = SOURCE_LEVELS.map(source => {\n  const result = build3DLevel(source.id, source.grid as number[][], source.playerStart, source.cavePos);\n  if (result.warnings.length) throw new Error(\`Level ${'${source.id}'} rejected: ${'${result.warnings.join("; ")}' }\`);\n  return { ...result.level, name: \`Level ${'${source.id}'}\` };\n});\n\nexport const level3DCount = levels3D.length;\nif (level3DCount !== 100) throw new Error(\`Dinodash requires 100 source levels, got ${'${level3DCount}'}\`);\n`;
await fs.writeFile(TARGET,output);
console.log(`Synced ${levels.length} authoritative Phoneage levels into ${TARGET}`);
