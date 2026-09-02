// Derived images - everything that is computed from a source image rather
// than authored. Idempotent; re-run after adding a page image or a cover.
//   npm run derived
//
//  1. src/img/og-default.jpg       1200x630 site-wide social image (logo on
//                                  the navy canvas) - used when a page has no
//                                  `image:` of its own.
//  2. <image>-og.jpg               a 1200x630 JPEG twin for every front-matter
//                                  `image:` (pages + posts). WhatsApp/LinkedIn
//                                  previews still choke on WebP, and the
//                                  generated covers only exist as WebP. The
//                                  `ogImage` filter in eleventy.config.js picks
//                                  the twin up automatically.
//  3. src/favicon.ico              old crawlers and some tools request
//                                  /favicon.ico unconditionally; it is the
//                                  32px PNG wrapped in an ICO container.
//  4. src/img/team/rihards-brand-160.webp  the author-box thumbnail. The
//                                  full portrait is 900px and was loaded on
//                                  every article to render at 56px.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const onDisk = (p) => join(SRC, ...p.split('/').filter(Boolean));
const force = process.argv.includes('--force');
const kb = (p) => Math.round(statSync(p).size / 1024);
const fresh = (out, ...sources) =>
  !force && existsSync(out) && sources.every((s) => statSync(out).mtimeMs >= statSync(s).mtimeMs);

// ---- 1. default social image ---------------------------------------------
{
  const out = join(SRC, 'img', 'og-default.jpg');
  const logoSrc = join(SRC, 'img', 'logo.png');
  if (!fresh(out, logoSrc)) {
    const logo = await sharp(logoSrc).resize({ width: 520 }).png().toBuffer();
    const m = await sharp(logo).metadata();
    const left = Math.round((1200 - m.width) / 2);
    const top = Math.round((630 - m.height) / 2) - 14;
    // One cyan tick under the mark - the same device the eyebrows use.
    const tick = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><rect x="${left}" y="${top + m.height + 34}" width="56" height="3" fill="#03c3f8"/></svg>`);
    await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#020d1c' } })
      .composite([{ input: logo, left, top }, { input: tick, left: 0, top: 0 }])
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(out);
    console.log('og-default.jpg', kb(out) + 'KB');
  }
}

// ---- 2. og twins for every front-matter image -----------------------------
const images = new Set();
for (const d of ['pages', 'posts']) {
  for (const f of readdirSync(join(SRC, d))) {
    const raw = readFileSync(join(SRC, d, f), 'utf8');
    const fm = raw.startsWith('---') ? raw.slice(3, raw.indexOf('---', 3)) : '';
    const m = fm.match(/^image:\s*["']?([^"'\n]+)["']?\s*$/m);
    if (m) images.add(m[1].trim());
  }
}
let made = 0;
for (const img of images) {
  if (/-og\.jpg$/.test(img)) continue;
  const out = onDisk(img.replace(/\.(webp|png|jpe?g)$/i, '-og.jpg'));
  // Prefer the webp twin as the source when the original is a huge PNG.
  const candidates = [onDisk(img.replace(/\.(png|jpe?g)$/i, '.webp')), onDisk(img)].filter(existsSync);
  if (!candidates.length) { console.log('MISSING source for', img); continue; }
  const src = candidates[0];
  if (fresh(out, src)) continue;
  mkdirSync(dirname(out), { recursive: true });
  await sharp(src)
    .resize({ width: 1200, height: 630, fit: 'cover', position: 'centre', withoutEnlargement: false })
    .flatten({ background: '#020d1c' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);
  made++;
  console.log('og twin', basename(out), kb(out) + 'KB');
}
console.log(`og twins: ${images.size} images, ${made} (re)generated`);

// ---- 3. favicon.ico --------------------------------------------------------
{
  const out = join(SRC, 'favicon.ico');
  const src = join(SRC, 'img', 'favicon-32.png');
  if (!fresh(out, src)) {
    const png = await sharp(src).resize(32, 32).png().toBuffer();
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
    const entry = Buffer.alloc(16);
    entry[0] = 32; entry[1] = 32; entry[2] = 0; entry[3] = 0;
    entry.writeUInt16LE(1, 4); entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8); entry.writeUInt32LE(22, 12);
    writeFileSync(out, Buffer.concat([header, entry, png]));
    console.log('favicon.ico', kb(out) + 'KB');
  }
}

// ---- 4. author thumbnail --------------------------------------------------
{
  const src = join(SRC, 'img', 'team', 'rihards-brand.webp');
  const out = join(SRC, 'img', 'team', 'rihards-brand-160.webp');
  if (existsSync(src) && !fresh(out, src)) {
    await sharp(src).resize(160, 160, { fit: 'cover' }).webp({ quality: 84, effort: 6 }).toFile(out);
    console.log('rihards-brand-160.webp', kb(out) + 'KB');
  }
}
console.log('done');
