// Scans the BUILT article pages for typography that escaped the design system:
// literal markdown that never got parsed, inline WordPress styles, and headings
// authored as raw HTML instead of markdown.
//
// Scans _site (what a reader actually receives), not src, because the failure
// mode is markdown-it declining to parse inline syntax inside a raw HTML block —
// which only shows up after the build.
//
//   node tools/article-defects.mjs [--fix-list]
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = join(ROOT, '_site');
const SRC = join(ROOT, 'src/posts');
if (!existsSync(SITE)) { console.error('run the build first'); process.exit(1); }

// map permalink dir -> source file
const bySlug = {};
for (const f of readdirSync(SRC).filter((f) => f.endsWith('.md'))) {
  const s = readFileSync(join(SRC, f), 'utf8');
  const p = (s.match(/permalink:\s*"([^"]+)"/) || [, ''])[1];
  if (p) bySlug[p.replace(/^\/|\/$/g, '')] = f;
}

const CHECKS = [
  { kind: 'literal-bold', re: /\*\*[^*\n]{2,90}\*\*/g, note: 'markdown bold rendered as literal asterisks' },
  { kind: 'literal-italic', re: /(?<![*\w])\*[^*\n]{2,60}\*(?![*\w])/g, note: 'markdown italic rendered literally' },
  { kind: 'inline-font-size', re: /style="[^"]*font-size[^"]*"/gi, note: 'hard-coded font-size in article content' },
  { kind: 'inline-color', re: /style="[^"]*(?<!background-)color\s*:[^"]*"/gi, note: 'hard-coded colour in article content' },
  { kind: 'wp-span-class', re: /<span[^>]+class="[^"]*(?:has-|wp-)[^"]*"/gi, note: 'leftover WordPress span class' },
  { kind: 'literal-heading', re: /(?:^|\n)#{2,4}\s+\S/g, note: 'markdown heading rendered literally' },
];

const results = {};
let total = 0;

for (const dir of readdirSync(SITE, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  const idx = join(SITE, dir.name, 'index.html');
  if (!existsSync(idx) || !bySlug[dir.name]) continue;

  const html = readFileSync(idx, 'utf8');
  // only look inside the article body — nav and footer are not the concern
  const m = html.match(/<div class="prose">([\s\S]*?)<div class="author-strip"/);
  const body = m ? m[1] : '';
  if (!body) continue;

  for (const c of CHECKS) {
    const hits = [...body.matchAll(c.re)].map((x) => x[0].replace(/\s+/g, ' ').slice(0, 72));
    if (!hits.length) continue;
    (results[c.kind] ||= []).push({ slug: dir.name, file: bySlug[dir.name], n: hits.length, sample: hits.slice(0, 3) });
    total += hits.length;
  }
}

for (const [kind, list] of Object.entries(results)) {
  const check = CHECKS.find((c) => c.kind === kind);
  const n = list.reduce((a, r) => a + r.n, 0);
  console.log(`\n## ${kind} — ${n} occurrence(s) in ${list.length} article(s)`);
  console.log(`   ${check.note}`);
  for (const r of list.sort((a, b) => b.n - a.n)) {
    console.log(`   ${String(r.n).padStart(3)}x  ${r.file}`);
    if (process.argv.includes('--fix-list')) r.sample.forEach((s) => console.log(`         ${s}`));
  }
}
console.log(`\n${total} occurrence(s) total across ${Object.keys(bySlug).length} articles`);
