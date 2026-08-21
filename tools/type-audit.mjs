// Inventories every font-size in the stylesheet and resolves what it actually
// renders as at three viewport widths, so the type scale can be judged on real
// numbers instead of on the clamp() expressions.
//
//   node tools/type-audit.mjs [--widths=390,768,1440]
import { readFileSync } from 'node:fs';

const CSS = readFileSync(new URL('../src/css/style.css', import.meta.url), 'utf8');
const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || `=${d}`).split('=').pop();
const WIDTHS = arg('widths', '390,768,1440').split(',').map(Number);
const ROOT = 16;

// Evaluates a CSS length against a viewport width. Handles rem, px, vw, and
// calc-free sums of those, which is everything this stylesheet uses.
// Token definitions from :root, so var(--t-x) resolves to a real number
// instead of silently reading as zero.
const TOKENS = {};
for (const m of CSS.matchAll(/(--t-[a-z0-9-]+):\s*([^;]+);/g)) TOKENS[m[1]] = m[2].trim();

function len(expr, vw) {
  expr = expr.trim();
  const v = expr.match(/^var\((--[a-z0-9-]+)\)$/);
  if (v) return TOKENS[v[1]] ? len(TOKENS[v[1]], vw) : NaN;
  const clamp = expr.match(/^clamp\((.*)\)$/s);
  if (clamp) {
    const [min, pref, max] = splitArgs(clamp[1]).map((p) => len(p, vw));
    return Math.min(Math.max(min, pref), max);
  }
  let total = 0;
  for (const m of expr.matchAll(/([+-]?\s*[\d.]+)\s*(rem|px|vw|em)?/g)) {
    const n = parseFloat(m[1].replace(/\s+/g, ''));
    if (Number.isNaN(n)) continue;
    const unit = m[2] || 'px';
    total += unit === 'rem' || unit === 'em' ? n * ROOT : unit === 'vw' ? (n * vw) / 100 : n;
  }
  return total;
}
function splitArgs(s) {
  const out = []; let depth = 0, cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { out.push(cur); cur = ''; continue; }
    cur += ch;
  }
  out.push(cur);
  return out;
}

// Pull selector -> font-size pairs. Good enough for a hand-written stylesheet:
// it walks rule blocks and keeps the last font-size in each.
const rules = [];
for (const m of CSS.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  // A rule preceded by a comment captures that comment into the selector group.
  // Strip it, or the guard below skips the whole rule — which is exactly how six
  // declarations escaped the first pass and made this audit report a clean scale.
  const sel = m[1].replace(/\/\*[\s\S]*?\*\//g, '').trim().replace(/\s+/g, ' ');
  if (sel.startsWith('@') || sel.startsWith('/*')) continue;
  const fs = [...m[2].matchAll(/(?:^|;)\s*font-size:\s*([^;]+)/g)].pop();
  if (fs) rules.push({ sel, expr: fs[1].trim() });
}

const rows = rules.map((r) => ({
  ...r,
  px: WIDTHS.map((w) => len(r.expr, w)),
}));

console.log(`selector`.padEnd(46) + WIDTHS.map((w) => `${w}px`.padStart(9)).join('') + '   declared');
console.log('-'.repeat(46 + WIDTHS.length * 9 + 12));
for (const r of rows) {
  console.log(
    r.sel.slice(0, 45).padEnd(46) +
    r.px.map((p) => p.toFixed(1).padStart(9)).join('') +
    '   ' + r.expr.replace(/\s+/g, ' ').slice(0, 44)
  );
}

// The point of the audit: how many distinct sizes exist, and how many are
// near-duplicates that no reader could tell apart.
const desktop = rows.map((r) => +r.px[r.px.length - 1].toFixed(1));
const uniq = [...new Set(desktop)].sort((a, b) => a - b);
console.log(`\n${rows.length} font-size declarations, ${uniq.length} distinct desktop sizes:`);
console.log('  ' + uniq.join(', '));

let clusters = 0;
for (let i = 1; i < uniq.length; i++) {
  if (uniq[i] - uniq[i - 1] < 1.0 && uniq[i] < 30) clusters++;
}
console.log(`\n${clusters} pairs sit within 1px of each other below 30px - indistinguishable in use.`);
const body = rows.find((r) => r.sel === 'body');
if (body) {
  const max = Math.max(...desktop);
  console.log(`Desktop range: ${Math.min(...desktop).toFixed(1)}px - ${max.toFixed(1)}px ` +
    `(ratio ${(max / body.px[body.px.length - 1]).toFixed(1)}x body)`);
}
