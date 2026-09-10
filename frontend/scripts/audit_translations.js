import { TRANSLATIONS } from '../src/utils/translations.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== MULTILINGUAL PARITY AND CODEBASE AUDIT ===');

function flattenObject(obj, prefix = '') {
  let result = {};
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(result, flattenObject(obj[key], fullKey));
    } else {
      result[fullKey] = obj[key];
    }
  }
  return result;
}

const enFlat = flattenObject(TRANSLATIONS.en);
const knFlat = flattenObject(TRANSLATIONS.kn);
const hiFlat = flattenObject(TRANSLATIONS.hi);

const enKeys = Object.keys(enFlat);
const knKeys = Object.keys(knFlat);
const hiKeys = Object.keys(hiFlat);

console.log(`Total English Keys: ${enKeys.length}`);
console.log(`Total Kannada Keys: ${knKeys.length}`);
console.log(`Total Hindi Keys: ${hiKeys.length}`);

// 1. Check missing keys in Kannada
const missingInKn = enKeys.filter(k => !knFlat[k]);
// 2. Check missing keys in Hindi
const missingInHi = enKeys.filter(k => !hiFlat[k]);

console.log(`\nMissing in Kannada (${missingInKn.length}):`, missingInKn);
console.log(`Missing in Hindi (${missingInHi.length}):`, missingInHi);

// 3. Check for untranslated (empty or pure English where it shouldn't be)
let knUntranslated = 0;
let hiUntranslated = 0;

for (const k of enKeys) {
  if (!knFlat[k] || knFlat[k].trim() === '') knUntranslated++;
  if (!hiFlat[k] || hiFlat[k].trim() === '') hiUntranslated++;
}

console.log(`\nEmpty / Undefined in Kannada: ${knUntranslated}`);
console.log(`Empty / Undefined in Hindi: ${hiUntranslated}`);

if (missingInKn.length === 0 && missingInHi.length === 0 && knUntranslated === 0 && hiUntranslated === 0) {
  console.log('\n>>> SUCCESS: Perfect 100% translation key parity across English, Kannada, and Hindi! <<<');
} else {
  console.error('\n>>> FAILED: Discrepancies found in translation keys! <<<');
  process.exit(1);
}
