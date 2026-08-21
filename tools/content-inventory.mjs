// Dumps what the site actually says, page by page, so positioning and IA can be
// judged against the real copy instead of from memory.
//
//   node tools/content-inventory.mjs [--full]
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FULL = process.argv.includes('--full');
const strip = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();

function frontMatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

console.log('# NAV\n');
const site = JSON.parse(readFileSync(join(ROOT, 'src/_data/site.json'), 'utf8'));
const walk = (items, d = 0) => (items || []).forEach((i) => {
  console.log('  '.repeat(d) + `- ${i.label || i.title || i.name} -> ${i.url || i.href || ''}`);
  walk(i.children || i.items, d + 1);
});
walk(site.nav || site.navigation);

console.log('\n# PAGES\n');
for (const f of readdirSync(join(ROOT, 'src/pages')).sort()) {
  const src = readFileSync(join(ROOT, 'src/pages', f), 'utf8');
  const fm = frontMatter(src);
  const body = src.replace(/^---[\s\S]*?---/, '');
  const h1 = [...body.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => strip(m[1]));
  const h2 = [...body.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => strip(m[1]));
  const eyebrow = [...body.matchAll(/class="eyebrow"[^>]*>([\s\S]*?)<\/span>\s*(?:<\/span>)?/g)]
    .map((m) => strip(m[1])).filter(Boolean);
  const words = strip(body).split(' ').length;
  const ctas = [...new Set([...body.matchAll(/class="btn[^"]*"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => strip(m[1])))];

  console.log(`## ${f}  (${fm.permalink || '?'})  ~${words} words`);
  console.log(`   title: ${fm.title || ''}`);
  console.log(`   desc : ${(fm.description || '').slice(0, 190)}`);
  if (fm.heroTitle) console.log(`   hero : ${fm.heroTitle} | ${(fm.heroSub || '').slice(0, 120)}`);
  if (h1.length) console.log(`   h1   : ${h1.join(' || ')}`);
  console.log(`   h2   : ${h2.join(' | ')}`);
  if (ctas.length) console.log(`   ctas : ${ctas.join(' | ')}`);
  if (FULL && eyebrow.length) console.log(`   secs : ${eyebrow.join(' | ')}`);
  console.log('');
}

console.log('\n# BLOG POSTS\n');
const cats = {};
for (const f of readdirSync(join(ROOT, 'src/posts')).sort()) {
  if (!f.endsWith('.md')) continue;
  const src = readFileSync(join(ROOT, 'src/posts', f), 'utf8');
  const fm = frontMatter(src);
  const raw = src.replace(/^---[\s\S]*?---/, '');
  const words = strip(raw).split(' ').length;
  // Front matter carries inline JSON arrays: categories: ["slug", "slug"]
  let list = [];
  try { list = JSON.parse(fm.categories || '[]'); } catch { list = []; }
  list.forEach((c) => { cats[c] = (cats[c] || 0) + 1; });
  console.log(`- ${fm.date || '????'}  ${String(words).padStart(5)}w  [${list.join(', ')}]  ${fm.title || f}`);
}
console.log('\n# CATEGORY COUNTS');
Object.entries(cats).sort((a, b) => b[1] - a[1]).forEach(([c, n]) => console.log(`  ${String(n).padStart(3)}  ${c}`));
