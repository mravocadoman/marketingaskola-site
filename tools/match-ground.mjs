/* Snap a dark motif's background to EXACTLY the site canvas (#020d1c).
 *
 * Why this exists: the hero artwork sits frameless, so the picture's ground has
 * to be the page's ground or a faint rectangle shows at the image edge. The
 * model returns grounds 3-6/255 off however firmly the prompt states the hex,
 * and re-rolling returns a different near-miss rather than a hit. So fix it
 * deterministically instead of arguing with the model - exactly the reasoning
 * behind tools/whiten-paper.mjs, which does this for the white paper ground.
 *
 * Only pixels already within TOL of the canvas are moved, so every cool-grey,
 * off-white and cyan shape is untouched; the thin dark separations between
 * shapes snap too, which is wanted.
 *
 * It REFUSES to write when the matched share is implausible, because that means
 * the tolerance is wrong for this image rather than that the image needs fixing.
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const CANVAS = [2, 13, 28];
const TOL = 12;          // max per-channel distance still counted as "ground"
// MAX was 0.95, set for hero motifs (35-45% ink, so 55-65% ground). A sparse
// blog cover is legitimately ~97-99% ground - that refused 4 of 9 covers on
// 10 Sep 2026 while still exiting 0. 0.995 still refuses an image whose
// ARTWORK falls inside the tolerance, which is what the ceiling is for.
const MIN = 0.15, MAX = 0.995;

const files = process.argv.slice(2);
if (!files.length) { console.error('usage: node tools/match-ground.mjs <file.webp…>'); process.exit(1); }

let changed = 0, skipped = 0;
for (const file of files) {
  if (!fs.existsSync(file)) { console.log(`  MISSING ${file}`); continue; }
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let hit = 0;
  for (let i = 0; i < data.length; i += 3) {
    if (Math.abs(data[i] - CANVAS[0]) <= TOL &&
        Math.abs(data[i + 1] - CANVAS[1]) <= TOL &&
        Math.abs(data[i + 2] - CANVAS[2]) <= TOL) {
      data[i] = CANVAS[0]; data[i + 1] = CANVAS[1]; data[i + 2] = CANVAS[2]; hit++;
    }
  }
  const share = hit / (info.width * info.height);
  const name = path.basename(file);
  if (share < MIN || share > MAX) {
    console.log(`  SKIP ${name} — ${(share * 100).toFixed(1)}% matched, outside ${MIN * 100}-${MAX * 100}%`);
    skipped++; continue;
  }
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } })
    .webp({ quality: 90 }).toFile(file + '.tmp');
  fs.renameSync(file + '.tmp', file);
  console.log(`  ${name} — ${(share * 100).toFixed(1)}% of pixels snapped to #020d1c`);
  changed++;
}
console.log(`done: ${changed} rewritten, ${skipped} skipped`);
