// Separates real photographs from flat vector artwork across src/img.
//
// The site's "robotic" feel comes from every non-portrait image being generated
// flat vector. Before proposing anything human, this establishes what actual
// photography the project already owns.
//
// Heuristic: flat brand artwork uses a handful of colours and has very low local
// detail; a photograph has thousands of distinct colours and high edge energy.
//
//   node tools/photo-inventory.mjs [--min=0]
import { readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IMG = join(ROOT, 'src', 'img');

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(webp|png|jpe?g)$/i.test(e)) out.push(p);
  }
  return out;
}

const rows = [];
for (const file of walk(IMG)) {
  const rel = relative(IMG, file).replace(/\\/g, '/');
  if (rel.endsWith('.png') || rel.endsWith('.jpg') || rel.endsWith('.jpeg')) {
    // originals sit beside their .webp twins; judge the webp only
    const twin = rel.replace(/\.(png|jpe?g)$/i, '.webp');
    if (walk(IMG).some((f) => relative(IMG, f).replace(/\\/g, '/') === twin)) continue;
  }
  try {
    const im = sharp(file);
    const meta = await im.metadata();
    // small sample is enough to characterise the image
    const { data, info } = await im.resize(64, 64, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });

    const seen = new Set();
    let edge = 0;
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const i = (y * info.width + x) * 3;
        // quantise so near-identical gradients do not inflate the count
        seen.add(((data[i] >> 3) << 10) | ((data[i + 1] >> 3) << 5) | (data[i + 2] >> 3));
        if (x + 1 < info.width) {
          const j = i + 3;
          edge += Math.abs(data[i] - data[j]) + Math.abs(data[i + 1] - data[j + 1]) + Math.abs(data[i + 2] - data[j + 2]);
        }
      }
    }
    const colours = seen.size;
    const detail = Math.round(edge / (info.width * info.height));
    const photo = colours > 300 && detail > 12;
    rows.push({ rel, w: meta.width, h: meta.height, colours, detail, photo });
  } catch { /* unreadable, skip */ }
}

const photos = rows.filter((r) => r.photo).sort((a, b) => b.colours - a.colours);
const flat = rows.filter((r) => !r.photo);

console.log(`## Likely PHOTOGRAPHS (${photos.length})\n`);
for (const r of photos) console.log(`  ${String(r.colours).padStart(4)} colours  detail ${String(r.detail).padStart(3)}  ${r.w}x${r.h}  ${r.rel}`);
console.log(`\n## Flat / generated artwork (${flat.length}) — the "robotic" half`);
const byDir = {};
for (const r of flat) { const d = r.rel.split('/').slice(0, -1).join('/') || '.'; byDir[d] = (byDir[d] || 0) + 1; }
Object.entries(byDir).sort((a, b) => b[1] - a[1]).forEach(([d, n]) => console.log(`  ${String(n).padStart(3)}  ${d}/`));
console.log(`\n${rows.length} images scanned`);
