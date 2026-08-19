// Generates .webp versions of every raster image in src/img (max 1600px wide,
// q78) and rewrites BODY references in src/pages + src/posts to the .webp.
// Front-matter `image:` lines are left on the original file on purpose —
// og:image previews (WhatsApp etc.) are safest with png/jpg.
// Originals stay in the repo. Idempotent: skips webp files that already exist.
// Usage: node tools/optimize-images.mjs

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IMG = join(ROOT, 'src', 'img');

const files = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(png|jpe?g)$/i.test(f) && !/^favicon/.test(f)) files.push(p);
  }
})(IMG);

let inTotal = 0, outTotal = 0, converted = 0;
for (const p of files) {
  const out = p.replace(/\.(png|jpe?g)$/i, '.webp');
  const inSize = statSync(p).size;
  inTotal += inSize;
  if (!existsSync(out)) {
    try {
      await sharp(p).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 78, effort: 5 }).toFile(out);
      converted++;
    } catch (e) { console.log('SKIP (sharp failed):', p, e.message); continue; }
  }
  outTotal += statSync(out).size;
}
console.log(`images: ${files.length}, converted now: ${converted}`);
console.log(`原 ${(inTotal / 1048576).toFixed(1)} MB -> webp ${(outTotal / 1048576).toFixed(1)} MB`);

// ---- rewrite body references (skip front matter) ----
const IMG_RE = /(\/img\/[^"'()\s]+?)\.(png|jpe?g)\b/gi;
function rewriteBody(file) {
  const raw = readFileSync(file, 'utf8');
  const fmEnd = raw.startsWith('---') ? raw.indexOf('---', 3) + 3 : 0;
  const fm = raw.slice(0, fmEnd);
  let body = raw.slice(fmEnd);
  let changed = 0;
  body = body.replace(IMG_RE, (m, base, ext) => {
    const webpDisk = join(ROOT, 'src', ...(base + '.webp').split('/').filter(Boolean));
    if (existsSync(webpDisk)) { changed++; return base + '.webp'; }
    return m;
  });
  if (changed) { writeFileSync(file, fm + body); console.log(`rewrote ${changed} refs in`, file.split(/[\\/]/).pop()); }
}
for (const d of ['pages', 'posts']) {
  const dir = join(ROOT, 'src', d);
  for (const f of readdirSync(dir)) rewriteBody(join(dir, f));
}
console.log('done');
