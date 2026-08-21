// Recolours transparent-background MARK artwork (funding lockups, certification
// badges) to the site's light body tone so it can sit directly on the dark
// canvas — no white card behind it.
//
// Why: these files already ship with an alpha channel; the artwork is dark grey
// ink meant for white paper. The old markup faked that paper with
// `.img--card { background:#fff }`, which punched a white slab into the dark
// page. Recolouring via the alpha mask is the same trick tools/normalize-logos
// uses on client logos, and it keeps the official artwork intact — only its
// tone changes, which the EU emblem guidelines allow for single-colour
// reproduction on a dark ground.
//
//   node tools/tone-marks.mjs
// Output: src/img/marks/<id>.webp
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src', 'img', 'marks');
mkdirSync(OUT, { recursive: true });

const TONE = { r: 0xc9, g: 0xd8, b: 0xe8 };   // --body

// The Meta certification badges are NOT here on purpose: they are already
// brand-coloured (blue disc, white field) on transparent, so they read fine on
// navy as-is. Flattening them to one tone would destroy an official badge.
const MARKS = [
  { id: 'eu-funding',       src: 'src/img/2025/06/Untitled-design.webp', width: 900 },
];

for (const m of MARKS) {
  const src = join(ROOT, m.src);
  const meta = await sharp(src).metadata();
  if (!meta.hasAlpha) { console.log(`  skip ${m.id}: no alpha channel`); continue; }

  // Trim the transparent margin so the artwork fills its box, then rebuild the
  // image as a flat TONE-coloured rectangle wearing the original alpha as its
  // mask. Nothing of the original RGB survives — that is the point, the ink is
  // grey-for-paper and would vanish on navy.
  const trimmed = await sharp(src).trim({ threshold: 1 }).resize({ width: m.width, withoutEnlargement: true }).png().toBuffer();
  const { width, height } = await sharp(trimmed).metadata();

  // The mask MUST be an image that still carries its alpha channel. Extracting
  // the alpha into a greyscale buffer and using that instead silently keeps
  // everything - a b-w PNG is fully opaque, so dest-in masks nothing and the
  // output is a solid light slab, the exact artifact this tool exists to remove.
  await sharp({ create: { width, height, channels: 4, background: { ...TONE, alpha: 1 } } })
    .composite([{ input: trimmed, blend: 'dest-in' }])
    .webp({ quality: 92, effort: 5 })
    .toFile(join(OUT, `${m.id}.webp`));

  // verify: every opaque pixel must now BE the tone, and the image must still
  // have real coverage (a mask that trimmed to nothing would silently "pass")
  const { data, info } = await sharp(join(OUT, `${m.id}.webp`)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let ink = 0, wrong = 0;
  for (let i = 0; i < info.width * info.height; i++) {
    if (data[i * 4 + 3] > 200) {
      ink++;
      if (Math.abs(data[i*4] - TONE.r) > 6 || Math.abs(data[i*4+1] - TONE.g) > 6 || Math.abs(data[i*4+2] - TONE.b) > 6) wrong++;
    }
  }
  const cov = (ink / (info.width * info.height)) * 100;
  const bad = ink ? (wrong / ink) * 100 : 100;
  // The upper bound matters as much as the lower one: 100% coverage means the
  // mask never applied and the output is a solid rectangle, not artwork.
  const ok = cov > 3 && cov < 70 && bad < 1;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${m.id.padEnd(19)} ${info.width}x${info.height} · ink ${cov.toFixed(1)}% · off-tone ${bad.toFixed(2)}%`);
}
