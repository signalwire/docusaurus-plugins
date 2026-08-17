/**
 * Pins react / react-dom and their types to one major via pnpm overrides, so a
 * CI matrix leg exercises that version everywhere. Overrides apply tree-wide;
 * adding at the root would leave the packages' own @types/react ranges in place
 * and tsc would keep type-checking against the other major.
 *
 * Usage: node scripts/pinReact.js 18
 */
import { readFile, writeFile } from 'fs/promises';

import { parseDocument } from 'yaml';

const major = process.argv[2];
if (!major) {
  throw new Error('usage: pinReact.js <major>');
}

const range = `^${major}`;
const file = 'pnpm-workspace.yaml';

// parseDocument rather than parse: it keeps the comments on the existing
// overrides, which explain why each one is there.
const doc = parseDocument(await readFile(file, 'utf8'));

for (const name of ['react', 'react-dom', '@types/react', '@types/react-dom']) {
  doc.setIn(['overrides', name], range);
}

await writeFile(file, doc.toString());
console.log(`pinned react/react-dom and types to ${range}`);
