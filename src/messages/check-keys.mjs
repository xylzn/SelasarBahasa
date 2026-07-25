/**
 * Deep key comparison for i18n JSON files.
 * Compares id.json, en.json, de.json and prints any missing keys.
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function getDeepKeys(obj, prefix = '') {
  let keys = [];
  for (const k of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      keys = keys.concat(getDeepKeys(obj[k], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const files = ['id.json', 'en.json', 'de.json'];
const data = {};
for (const f of files) {
  data[f] = JSON.parse(readFileSync(join(__dirname, f), 'utf8'));
}

const keySets = {};
for (const f of files) {
  keySets[f] = new Set(getDeepKeys(data[f]));
}

let hasError = false;

for (const a of files) {
  for (const b of files) {
    if (a >= b) continue;
    const onlyA = [...keySets[a]].filter(k => !keySets[b].has(k)).sort();
    const onlyB = [...keySets[b]].filter(k => !keySets[a].has(k)).sort();
    if (onlyA.length > 0) {
      console.log(`\n❌ Keys in ${a} but NOT in ${b} (${onlyA.length}):`);
      onlyA.forEach(k => console.log(`   + ${k}`));
      hasError = true;
    }
    if (onlyB.length > 0) {
      console.log(`\n❌ Keys in ${b} but NOT in ${a} (${onlyB.length}):`);
      onlyB.forEach(k => console.log(`   + ${k}`));
      hasError = true;
    }
  }
}

if (!hasError) {
  const count = keySets['id.json'].size;
  console.log(`✅ All 3 files have identical key sets (${count} keys each). No diff found.`);
} else {
  process.exit(1);
}
