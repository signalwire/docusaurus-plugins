/**
 * Fails if pnpm-lock.yaml resolved any copy of react / @types/react off the
 * requested major. pnpm overrides apply tree-wide, so a stray copy means the
 * override did not take and the CI matrix leg is testing the wrong version.
 *
 * Reads the lockfile rather than shelling out to pnpm, so it does not depend
 * on which pnpm happens to be on PATH.
 *
 * Usage: node scripts/checkReactVersions.js 18
 */
import { readFile } from 'fs/promises';

const major = process.argv[2];
if (!major) {
  throw new Error('usage: checkReactVersions.js <major>');
}

const lock = await readFile('pnpm-lock.yaml', 'utf8');

// Lockfile entries look like `  react@18.3.1:` and
// `  '@types/react-dom@18.3.7':`. Scoped names are quoted by pnpm.
const pattern =
  /^\s+'?(?<name>@types\/react(?:-dom)?|react(?:-dom)?)@(?<version>[^:'(\s]+)/gm;

const versions = new Map([
  ['react', new Set()],
  ['react-dom', new Set()],
  ['@types/react', new Set()],
  ['@types/react-dom', new Set()],
]);

for (const {
  groups: { name, version },
} of lock.matchAll(pattern)) {
  versions.get(name).add(version);
}

let failed = false;
for (const [name, found] of versions) {
  const list = [...found].sort();
  console.log(`${name} -> ${list.join(', ') || '(none resolved)'}`);
  if (!list.length) {
    console.error(`  ${name} not found in the lockfile`);
    failed = true;
  }
  const offMatrix = list.filter((v) => !v.startsWith(`${major}.`));
  if (offMatrix.length) {
    console.error(`  off-matrix ${name}: ${offMatrix.join(', ')}`);
    failed = true;
  }
}

if (failed) {
  throw new Error(`expected only React ${major}.x across the workspace`);
}
