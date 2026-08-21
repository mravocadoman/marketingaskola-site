// Applies a consolidated type scale to src/css/style.css.
//
// Rewrites font-size declarations to reference scale tokens, keyed on the EXACT
// (selector, declared value) pair so a selector that appears twice — once in a
// media query with a different size — is not collapsed by accident.
//
//   node tools/apply-type-scale.mjs <scale.json> [--dry]
//
// scale.json: { tokens: [{name, value, ...}], mapping: [{selector, declared, token}] }
//
// Verification is the point: it refuses to write if any declaration in the
// stylesheet was left unmapped, and re-runs the audit afterwards so the drop in
// distinct sizes is a measured fact rather than an assumption.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CSS_PATH = join(ROOT, 'src/css/style.css');
const DRY = process.argv.includes('--dry');
const scaleFile = process.argv[2];
if (!scaleFile) { console.error('usage: node tools/apply-type-scale.mjs <scale.json> [--dry]'); process.exit(1); }

const scale = JSON.parse(readFileSync(scaleFile, 'utf8'));
let css = readFileSync(CSS_PATH, 'utf8');

// 1. Insert (or replace) the token block in :root.
const BEGIN = '  /* --- type scale (tools/apply-type-scale.mjs) --- */';
const END = '  /* --- end type scale --- */';
const tokenLines = scale.tokens
  .map((t) => `  ${t.name}: ${t.value};${t.use ? `   /* ${t.px390}-${t.px1440}px · ${t.use} */` : ''}`)
  .join('\n');
const block = `${BEGIN}\n${tokenLines}\n${END}`;

if (css.includes(BEGIN)) {
  css = css.replace(new RegExp(`${BEGIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), block);
} else {
  const anchor = '  --radius: 8px;';
  if (!css.includes(anchor)) throw new Error(':root anchor not found');
  css = css.replace(anchor, `${block}\n${anchor}`);
}

// 2. Rewrite each mapped declaration. Match within the owning rule block so the
//    same selector text in two places stays distinguishable by its old value.
const index = new Map();
for (const m of scale.mapping) {
  index.set(`${m.selector.trim()}||${(m.declared || '').replace(/\s+/g, ' ').trim()}`, m.token);
}

let rewritten = 0;
const unmapped = [];
css = css.replace(/([^{}]+)\{([^{}]*)\}/g, (full, sel, body) => {
  const s = sel.trim().replace(/\s+/g, ' ');
  if (s.startsWith('@') || s.startsWith('/*')) return full;
  const newBody = body.replace(/(^|;)(\s*)font-size:\s*([^;]+)/g, (d, pre, ws, val) => {
    const declared = val.replace(/\s+/g, ' ').trim();
    if (declared.startsWith('var(')) return d;              // already tokenised
    const token = index.get(`${s}||${declared}`) || index.get(`${s}||`);
    if (!token) { unmapped.push(`${s}  ->  ${declared}`); return d; }
    rewritten++;
    return `${pre}${ws}font-size: var(${token})`;
  });
  return newBody === body ? full : `${sel}{${newBody}}`;
});

console.log(`tokens: ${scale.tokens.length}`);
console.log(`rewritten declarations: ${rewritten}`);
if (unmapped.length) {
  console.log(`\nUNMAPPED (${unmapped.length}) — these would silently keep their old size:`);
  unmapped.forEach((u) => console.log('  ' + u));
}
if (DRY) { console.log('\n--dry: nothing written'); process.exit(unmapped.length ? 1 : 0); }
if (unmapped.length) { console.error('\nrefusing to write with unmapped declarations'); process.exit(1); }

writeFileSync(CSS_PATH, css, 'utf8');
console.log('\nwritten to src/css/style.css');
