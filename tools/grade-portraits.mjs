// Applies a subtle brand grade to the REAL team photographs.
//
// Pure colour maths with sharp — no AI, no generation, no retouching. The
// photograph, the person and every facial detail are untouched; only the tone
// curve changes: a light cool/cyan cast blended back over the original at
// partial strength so it reads as a grade, not a filter.
//
//   node tools/grade-portraits.mjs [--strength=0.7] [--tint=#cfe4f5]
//
// Output: src/img/team/<name>.webp
import { existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src', 'img', 'team');
mkdirSync(OUT, { recursive: true });

const arg = (k, d) => {
  const hit = process.argv.find((a) => a.startsWith(`--${k}=`));
  return hit ? hit.split('=').slice(1).join('=') : d;
};
const STRENGTH = Number(arg('strength', 0.7)); // how much of the graded layer shows
const TINT = arg('tint', '#cfe4f5');           // the cool cast

const PEOPLE = [
  ['src/img/2024/07/Untitled-design-3.webp', 'rihards'],
  ['src/img/2024/07/Untitled-design-4.webp', 'rihards-wide'],
  ['src/img/2025/09/Screenshot-2025-09-28-132933.webp', 'roberts'],
  ['src/img/2020/12/b-w.webp', 'kristaps'],
  ['src/img/2024/04/Untitled-design-2.webp', 'matiss'],
  ['src/img/2025/03/Untitled-design-2.webp', 'matiss-seo'],
  ['src/img/2021/09/FullSizeRender-1.webp', 'katrina'],
  ['src/img/2025/03/Untitled-design-3.webp', 'madara'],
];

for (const [rel, name] of PEOPLE) {
  const src = join(ROOT, rel.replace(/\//g, '\\'));
  if (!existsSync(src)) { console.log(`SKIP ${name}: missing ${rel}`); continue; }

  // Resize FIRST: sharp applies resize before composite, so the graded layer
  // must be generated at the final dimensions or the composite is rejected.
  const resized = await sharp(src).removeAlpha()
    .resize({ width: 1000, withoutEnlargement: true })
    .png()
    .toBuffer();
  const meta = await sharp(resized).metadata();

  // The graded layer: near-monochrome with a cool cyan cast, gently contrasted.
  const graded = await sharp(resized)
    .modulate({ saturation: 0.12 })
    .tint(TINT)
    .linear(1.06, -8)          // a touch more contrast, slightly deeper blacks
    .ensureAlpha(STRENGTH)     // blended back over the untouched original
    .png()
    .toBuffer();

  await sharp(resized)
    .composite([{ input: graded, blend: 'over' }])
    .webp({ quality: 86, effort: 5 })
    .toFile(join(OUT, `${name}.webp`));

  console.log(`  graded ${name.padEnd(14)} ${meta.width}x${meta.height}`);
}

console.log(`\ndone → src/img/team/ (tint ${TINT}, strength ${STRENGTH}) — photographs unmodified, tone only`);
