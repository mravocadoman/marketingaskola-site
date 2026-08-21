// Normalises the client/partner logos into one consistent set.
//
// The originals are a mess: aspect ratios from 1.0 (square mark) to 8.95 (wide
// wordmark), mixed tones, and different amounts of built-in padding. A fixed
// CSS height therefore makes square marks look tiny and wordmarks look huge.
// This trims each logo, recolours it to a single brand tone, and scales it so
// every logo occupies roughly the same OPTICAL AREA (with height/width caps),
// then centres it on one uniform canvas so the markup can use a single size.
//
//   node tools/normalize-logos.mjs
//
// Output: src/img/logos/<name>.webp  (400x120, transparent, tone #c9d8e8)
import { readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src', 'img', 'logos');
mkdirSync(OUT, { recursive: true });

const CANVAS_W = 320;
const CANVAS_H = 64;
// Pure area-matching shrinks wide wordmarks to nothing and blows up square
// marks; pure height-matching does the opposite. Use the geometric mean of the
// two, which is what reads as "same size" on a real logo wall.
const NOMINAL_H = 48;           // the height a mid-ratio logo lands on
const NOMINAL_RATIO = 3;        // ratio considered "typical" for this set
const MAX_H = 60;
const MIN_H = 34;
const MAX_W = 290;
const TONE = { r: 201, g: 216, b: 232 }; // --body #c9d8e8

const LOGOS = [
  ['src/img/2020/12/lsua-grey.webp', 'lsua'],
  ['src/img/2020/12/Tiny-Grey.webp', 'tiny-house'],
  ['src/img/2020/12/Excel-Know-How-logo-RGB_-grey.webp', 'excel-know-how'],
  ['src/img/2020/12/ciedru-grey.webp', 'ciedru-sauna'],
  ['src/img/2020/12/pin-grey.webp', 'pin'],
  ['src/img/2020/12/IC-Grey.webp', 'instant-change'],
  ['src/img/2020/12/Sophia-grey.webp', 'sophia'],
  ['src/img/2020/12/waxful-grey.webp', 'waxful'],
  ['src/img/2020/12/growthbond-Grey.webp', 'growthbond'],
  ['src/img/2025/02/Untitled-design-9.webp', 'partner-9'],
  ['src/img/2025/02/Untitled-design-10.webp', 'partner-10'],
  ['src/img/2025/02/Untitled-design-11.webp', 'partner-11'],
];

for (const [rel, name] of LOGOS) {
  const src = join(ROOT, rel.replace(/\//g, '\\'));
  if (!existsSync(src)) { console.log(`SKIP ${name}: missing ${rel}`); continue; }

  const base = sharp(src).ensureAlpha();
  const meta = await base.metadata();

  // Build a single-channel mask of the artwork's shape.
  // Prefer the alpha channel; if the file is fully opaque, derive the mask from
  // luminance instead (works for both light-on-dark and dark-on-light art).
  const alphaBuf = await base.clone().extractChannel('alpha').raw().toBuffer();
  let alphaMin = 255, alphaMax = 0;
  for (let i = 0; i < alphaBuf.length; i += 97) {
    const v = alphaBuf[i];
    if (v < alphaMin) alphaMin = v;
    if (v > alphaMax) alphaMax = v;
  }
  let mask, how;
  if (alphaMax - alphaMin > 40) {
    mask = await base.clone().extractChannel('alpha').toColourspace('b-w').png().toBuffer();
    how = 'alpha';
  } else {
    const grey = base.clone().flatten({ background: '#ffffff' }).greyscale();
    const st = await grey.clone().stats();
    // if the art is dark on white, invert so ink = white in the mask
    mask = st.channels[0].mean > 127
      ? await grey.clone().negate().png().toBuffer()
      : await grey.clone().png().toBuffer();
    how = 'luminance';
  }

  // Recolour: solid brand tone, masked to the artwork shape.
  const toned = await sharp({
    create: { width: meta.width, height: meta.height, channels: 3, background: TONE },
  })
    .joinChannel(mask)
    .png()
    .toBuffer();

  // Trim the transparent margin so the optical size is measured on real ink.
  const trimmed = await sharp(toned).trim({ threshold: 8 }).toBuffer();
  const tm = await sharp(trimmed).metadata();

  // Blend equal-area and equal-height targets, then clamp so nothing dominates.
  const ratio = tm.width / tm.height;
  const area = NOMINAL_H * NOMINAL_H * NOMINAL_RATIO;
  const hArea = Math.sqrt(area / ratio);
  let h = Math.round(Math.sqrt(hArea * NOMINAL_H));
  let w = Math.round(h * ratio);
  if (h > MAX_H) { const k = MAX_H / h; w = Math.round(w * k); h = MAX_H; }
  if (h < MIN_H) { const k = MIN_H / h; w = Math.round(w * k); h = MIN_H; }
  if (w > MAX_W) { const k = MAX_W / w; h = Math.round(h * k); w = MAX_W; }

  const resized = await sharp(trimmed).resize(w, h, { fit: 'inside' }).png().toBuffer();

  await sharp({
    create: { width: CANVAS_W, height: CANVAS_H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: resized, gravity: 'center' }])
    .webp({ quality: 92, effort: 6 })
    .toFile(join(OUT, `${name}.webp`));

  console.log(`  ${name.padEnd(16)} ${String(meta.width).padStart(4)}x${String(meta.height).padEnd(4)} → ${w}x${h}  (mask: ${how})`);
}

console.log(`\ndone → src/img/logos/ (${CANVAS_W}x${CANVAS_H}, tone #c9d8e8)`);
