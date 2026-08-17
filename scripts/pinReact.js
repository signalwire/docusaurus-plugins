/**
 * Pins react / react-dom and their types to one major via pnpm overrides, so
 * the CI matrix leg exercises that version everywhere. Overrides apply
 * tree-wide; adding at the root would leave the packages' own @types/react
 * ranges in place and tsc would keep type-checking against the other major.
 *
 * Usage: node scripts/pinReact.js 18
 */
import { readFile, writeFile } from 'fs/promises';

const major = process.argv[2];
if (!major) {
  throw new Error('usage: pinReact.js <major>');
}

const range = `^${major}`;
const pkg = JSON.parse(await readFile('package.json', 'utf8'));

pkg.pnpm.overrides = {
  ...pkg.pnpm.overrides,
  react: range,
  'react-dom': range,
  '@types/react': range,
  '@types/react-dom': range,
};

await writeFile('package.json', `${JSON.stringify(pkg, null, 2)}\n`);
console.log(`pinned react/react-dom and types to ${range}`);
