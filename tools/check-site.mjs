// Sitewide integrity check over the built _site/:
//  - every internal href/src must resolve to a real file
//  - flags pages whose <main> text is suspiciously thin
//  - with a mirror dir argument: compares text volume per page against the
//    original WordPress render (coverage %) to catch silently dropped content
// Usage: node tools/check-site.mjs [mirror-dir]
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = join(dirname(fileURLToPath(import.meta.url)), '..', '_site');
const MIRROR = process.argv[2];

function textOf(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ').trim();
}

const htmlFiles = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.html')) htmlFiles.push(p);
  }
})(SITE);

let broken = [], thin = [];
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const rel = file.slice(SITE.length).replace(/\\/g, '/');
  for (const m of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    let u = decodeURIComponent(m[1].split('#')[0].split('?')[0]);
    if (!u || u === '/') u = '/index.html';
    let target = join(SITE, u.replace(/\//g, '\\'));
    if (u.endsWith('/')) target = join(target, 'index.html');
    if (!existsSync(target) && !existsSync(target + '.html') && !existsSync(join(target, 'index.html'))) {
      broken.push(`${rel} -> ${m[1]}`);
    }
  }
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1] || '';
  const text = main.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length < 200) thin.push(`${rel} (${text.length} chars)`);
}

console.log(`checked ${htmlFiles.length} pages`);
console.log(`broken internal refs: ${broken.length}`);
[...new Set(broken)].slice(0, 40).forEach(b => console.log('  BROKEN', b));
console.log(`thin pages: ${thin.length}`);
thin.forEach(t => console.log('  THIN', t));

if (MIRROR) {
  console.log('--- coverage vs WordPress mirror (built main text / original main text) ---');
  const report = [];
  for (const mf of readdirSync(MIRROR).filter(f => f.endsWith('.html'))) {
    const slug = mf.replace(/\.html$/, '');
    if (slug.startsWith('category_')) continue;
    const builtPath = slug === 'index' ? join(SITE, 'index.html') : join(SITE, slug, 'index.html');
    if (!existsSync(builtPath)) { report.push([slug, 'MISSING', 0]); continue; }
    const orig = readFileSync(join(MIRROR, mf), 'utf8');
    const mainStart = orig.indexOf('id="main-content"');
    const mainEnd = orig.lastIndexOf('</article>');
    const origText = textOf(mainStart !== -1 && mainEnd > mainStart ? orig.slice(mainStart, mainEnd) : orig);
    const built = readFileSync(builtPath, 'utf8');
    const builtText = textOf(built.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1] || '');
    const pct = origText.length ? Math.round(100 * builtText.length / origText.length) : 100;
    report.push([slug, pct, origText.length]);
  }
  report.sort((a, b) => (a[1] === 'MISSING' ? -1 : b[1] === 'MISSING' ? 1 : a[1] - b[1]));
  for (const [slug, pct, len] of report) {
    const flag = pct === 'MISSING' || pct < 70 ? ' <<<' : '';
    console.log(`  ${String(pct).padStart(4)}%  ${slug} (orig ${len} chars)${flag}`);
  }
}
