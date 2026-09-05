// Neutralise the paper ground of a cut-paper infographic to pure white.
//
// The blog infographics sit flush on a white article page, so their ground has
// to be #ffffff or the image reads as a cream rectangle pasted onto the page.
// gpt-image-2 keeps a warm cast on some of them however firmly the prompt asks
// for white, so this is the deterministic fix rather than another re-roll.
//
// It only touches pixels that are already part of the ground: everything at or
// above the ground's own luminance, with a low channel spread (i.e. neutral or
// near-neutral light paper). The navy, cyan and pale grey cut-outs are all well
// below that threshold and come through untouched, so the shapes keep their
// texture and colour and only the backdrop is cleaned.
//
// Usage: node tools/whiten-paper.mjs <id…>   (ids are src/img/gen/<id>.webp)
import sharp from 'sharp';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const ids = process.argv.slice(2);
if (!ids.length) {
  console.error('usage: node tools/whiten-paper.mjs <id…>');
  process.exit(1);
}

// A pixel counts as ground when every channel sits at or above this much of the
// measured ground level. 12 points of slack absorbs the film grain without
// reaching down into the pale grey cut-outs.
const SLACK = 12;
// Refuse to run if the "ground" would swallow most of the picture or none of it.
const MIN_SHARE = 0.15;
const MAX_SHARE = 0.92;

let failed = 0;

for (const id of ids) {
  const file = path.join(ROOT, 'src', 'img', 'gen', `${id}.webp`);
  if (!existsSync(file)) { console.error(`  missing  ${id}`); failed++; continue; }

  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const at = (x, y) => { const i = (y * width + x) * channels; return [data[i], data[i + 1], data[i + 2]]; };

  // The ground is whatever fills the four corners.
  const corners = [at(6, 6), at(width - 7, 6), at(6, height - 7), at(width - 7, height - 7)];
  const ground = [0, 1, 2].map((c) => Math.round(corners.reduce((a, p) => a + p[c], 0) / corners.length));
  const floor = Math.min(...ground) - SLACK;

  // How far a pixel may drift from neutral and still count as paper. Derived from
  // the ground's OWN warmth rather than hard-coded: a cream ground is itself
  // several points off neutral, and a fixed cutoff simply refuses to match it.
  const maxSpread = Math.max(24, (Math.max(...ground) - Math.min(...ground)) + 8);

  let touched = 0;
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (r < floor || g < floor || b < floor) continue;              // a coloured cut-out
    if (Math.max(r, g, b) - Math.min(r, g, b) > maxSpread) continue; // saturated, not paper
    data[i] = data[i + 1] = data[i + 2] = 255;
    touched++;
  }

  const share = touched / (width * height);
  if (share < MIN_SHARE || share > MAX_SHARE) {
    console.error(`  REFUSED  ${id} — would repaint ${(share * 100).toFixed(1)}% of the image ` +
                  `(ground ${ground.join(',')}, floor ${floor}); that is not a background.`);
    failed++;
    continue;
  }

  await sharp(data, { raw: { width, height, channels } }).webp({ quality: 90 }).toFile(file);
  console.log(`  ok  ${id}  ground ${ground.join(',')} -> 255,255,255  (${(share * 100).toFixed(1)}% of pixels)`);
}

process.exit(failed ? 1 : 0);
