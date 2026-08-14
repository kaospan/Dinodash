#!/usr/bin/env node
/**
 * Dinodash build diagnostic helper.
 * Fails with an actionable file/import location instead of a generic build error.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const src = path.join(root, 'src');

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const files = walk(src);
const aliases = { '@': src };
const importRe = /(?:from\s*|import\s*\(\s*)["']([^"']+)["']/g;
const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
const missing = [];

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(importRe)) {
    const spec = match[1];
    if (!spec.startsWith('@/') && !spec.startsWith('./') && !spec.startsWith('../')) continue;
    const base = spec.startsWith('@/')
      ? path.join(aliases['@'], spec.slice(2))
      : path.resolve(path.dirname(file), spec);
    if (!extensions.some(ext => fs.existsSync(base + ext))) {
      const line = text.slice(0, match.index).split('\n').length;
      missing.push({ file: path.relative(root, file), line, spec });
    }
  }
}

if (missing.length) {
  console.error('\n=== DINODASH DIAGNOSTIC: MISSING IMPORTS ===');
  for (const item of missing) {
    console.error(`ERROR: ${item.file}:${item.line}`);
    console.error(`  Missing module: ${item.spec}`);
    console.error('  Trace: imported by the file above; add/sync the referenced phoneagev3 dependency or correct the import path.\n');
  }
  process.exit(1);
}

console.log(`Dinodash diagnostic: checked ${files.length} source files; no missing local imports found.`);

try {
  execFileSync('npx', ['tsc', '--noEmit'], { stdio: 'inherit', cwd: root });
} catch {
  console.error('\n=== DINODASH DIAGNOSTIC: TYPESCRIPT FAILURE ===');
  console.error('The TypeScript compiler reported the exact source file/line above.');
  process.exit(1);
}
