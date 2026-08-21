// Brands the team portraits WITHOUT letting a generative model touch a face.
//
// Why this exists: the OpenAI images/edits endpoint re-draws the entire image,
// including the person, so every run subtly (or badly) changed how the team
// looked. It is a generation call, not a compositing call — no prompt fixes
// that. So the person is never regenerated here:
//
//   1. a local ONNX matting model produces an alpha cutout of the subject
//   2. the ORIGINAL photo pixels are kept, only masked
//   3. the navy backdrop, the cyan disc and the white arc are drawn in code
//   4. the cutout is composited on top
//
// The face that ships is therefore the photographed face, pixel for pixel
// (optionally desaturated, which does not move a single edge).
//
//   node tools/brand-portraits.mjs [--only=<id>] [--no-grey]
//
// Output: src/img/team/<id>-brand.webp
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { removeBackground } from '@imgly/background-removal-node';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src', 'img', 'team');
mkdirSync(OUT, { recursive: true });

const arg = (k, d) => {
  const hit = process.argv.find((a) => a.startsWith(`--${k}=`));
  return hit ? hit.split('=').slice(1).join('=') : d;
};
const ONLY = arg('only', null);
const GREY = !process.argv.includes('--no-grey');

const SIZE = 900;                 // square output
const NAVY = '#020d1c';
const CYAN = '#03c3f8';

// Source photographs — the originals, never a processed file.
const PORTRAITS = [
  { id: 'rihards',      src: 'src/img/2024/07/Untitled-design-3.webp',              disc: { cx: 0.50, cy: 0.42, r: 0.30 } },
  { id: 'rihards-wide', src: 'src/img/2024/07/Untitled-design-4.webp',              disc: { cx: 0.54, cy: 0.40, r: 0.32 } },
  { id: 'roberts',      src: 'src/img/2025/09/Screenshot-2025-09-28-132933.webp',   disc: { cx: 0.52, cy: 0.40, r: 0.30 } },
  { id: 'kristaps',     src: 'src/img/2020/12/b-w.webp',                            disc: { cx: 0.50, cy: 0.40, r: 0.30 } },
  { id: 'matiss',       src: 'src/img/2024/04/Untitled-design-2.webp',              disc: { cx: 0.50, cy: 0.40, r: 0.30 } },
  { id: 'matiss-seo',   src: 'src/img/2025/03/Untitled-design-2.webp',              disc: { cx: 0.50, cy: 0.40, r: 0.30 } },
  { id: 'katrina',      src: 'src/img/2021/09/FullSizeRender-1.webp',               disc: { cx: 0.50, cy: 0.40, r: 0.30 } },
  { id: 'madara',       src: 'src/img/2025/03/Untitled-design-3.webp',              disc: { cx: 0.50, cy: 0.40, r: 0.30 } },
];

// Flat brand backdrop: solid navy, one cyan disc, one thin white arc.
// Pure geometry — no gradients, matching the house style.
const backdrop = ({ cx, cy, r }) => Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
  <rect width="${SIZE}" height="${SIZE}" fill="${NAVY}"/>
  <circle cx="${cx * SIZE}" cy="${cy * SIZE}" r="${r * SIZE}" fill="${CYAN}"/>
  <path d="M ${0.14 * SIZE} ${0.60 * SIZE}
           A ${0.30 * SIZE} ${0.30 * SIZE} 0 0 0 ${0.44 * SIZE} ${0.90 * SIZE}"
        fill="none" stroke="#ffffff" stroke-width="3" opacity="0.9"/>
</svg>`);

let done = 0, failed = [];
const queue = PORTRAITS.filter((p) => (ONLY ? p.id === ONLY : true));
console.log(`local matting (no generative model) → ${queue.length} portrait(s)`);

for (const p of queue) {
  const src = join(ROOT, p.src.replace(/\//g, '\\'));
  if (!existsSync(src)) { failed.push(`${p.id}: missing ${p.src}`); continue; }
  try {
    // 1. square-crop the ORIGINAL, biased to the top so heads are not cut
    const squared = await sharp(src)
      .resize(SIZE, SIZE, { fit: 'cover', position: 'top' })
      .png()
      .toBuffer();

    // 2. local matting → subject with transparent background (original pixels)
    const blob = await removeBackground(new Blob([squared], { type: 'image/png' }));
    const cut = Buffer.from(await blob.arrayBuffer());

    // 3. optional desaturation — a channel operation, geometry untouched
    const subject = GREY
      ? await sharp(cut).greyscale().png().toBuffer()
      : cut;

    // 4. composite the untouched subject over the drawn backdrop
    await sharp(backdrop(p.disc))
      .composite([{ input: subject, blend: 'over' }])
      .webp({ quality: 90, effort: 5 })
      .toFile(join(OUT, `${p.id}-brand.webp`));

    done++;
    console.log(`  ok  ${p.id}`);
  } catch (e) {
    failed.push(`${p.id}: ${e.message}`);
    console.log(`  FAIL ${p.id}: ${e.message}`);
  }
}

console.log(`\ndone: ${done} ok, ${failed.length} failed`);
failed.forEach((f) => console.log('  ', f));
