// Restyles the REAL team photographs so they share one brand treatment:
// a uniform dark-navy studio backdrop and a consistent monochrome grade.
//
// This uses the OpenAI image EDIT endpoint (not generation) so the actual
// person in the photo is preserved — we are restyling a portrait the owner
// already has, never inventing a likeness. Always eyeball the result against
// the source before shipping; if a face drifts, keep the original.
//
//   node tools/restyle-portraits.mjs                # all portraits missing output
//   node tools/restyle-portraits.mjs --only=rihards --force
//
// Output: src/img/gen/team-<id>.webp (square)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src', 'img', 'gen');
mkdirSync(OUT, { recursive: true });

const arg = (k, d) => {
  const hit = process.argv.find((a) => a.startsWith(`--${k}=`));
  return hit ? hit.split('=').slice(1).join('=') : d;
};
const FORCE = process.argv.includes('--force');
const ONLY = arg('only', null);
const MODEL = arg('model', 'gpt-image-1');

if (existsSync(join(ROOT, '.env'))) {
  for (const line of readFileSync(join(ROOT, '.env'), 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('OPENAI_API_KEY missing'); process.exit(1); }

// The people. `src` is the existing photograph in the repo.
const PORTRAITS = [
  { id: 'rihards',  src: 'src/img/2024/07/Untitled-design-3.webp' },
  { id: 'roberts',  src: 'src/img/2025/09/Screenshot-2025-09-28-132933.webp' },
  { id: 'kristaps', src: 'src/img/2020/12/b-w.webp' },
  { id: 'matiss',   src: 'src/img/2024/04/Untitled-design-2.webp' },
  { id: 'katrina',  src: 'src/img/2021/09/FullSizeRender-1.webp', note: ' Her hair is LIGHT BLONDE with a straight fringe — keep the blonde colour and the fringe exactly; do not darken her hair.' },
  { id: 'madara',   src: 'src/img/2025/03/Untitled-design-3.webp' },
  { id: 'rihards-wide', src: 'src/img/2024/07/Untitled-design-4.webp' },
];

const PROMPT =
  'Restyle this photograph as a premium editorial team portrait for a dark website. ' +
  'CRITICAL: keep the same person — preserve their face, facial features, expression, ' +
  'hairstyle, beard and clothing exactly as photographed. Do not beautify, do not change ' +
  'age, do not alter identity. Only change the environment and grade: replace the ' +
  'background with a completely plain, even, solid very dark navy backdrop (#020d1c) with ' +
  'no props, no window, no texture and no visible room; relight the subject with soft, ' +
  'directional studio light from one side so the silhouette separates cleanly from the ' +
  'dark background; grade the image to a refined desaturated near-monochrome with cool ' +
  'shadows and clean highlights. Flat and photographic — no gradients painted into the ' +
  'backdrop, no glow, no vignette, no text, no logos, no borders.';

let queue = PORTRAITS.filter((p) => (ONLY ? p.id === ONLY : true));
if (!FORCE) queue = queue.filter((p) => !existsSync(join(OUT, `team-${p.id}.webp`)));

console.log(`model=${MODEL} → ${queue.length} portrait(s)`);

for (const p of queue) {
  const abs = join(ROOT, p.src.replace(/\//g, '\\'));
  if (!existsSync(abs)) { console.log(`  SKIP ${p.id}: source missing (${p.src})`); continue; }
  try {
    // the edit endpoint wants png; square it first so the crop is predictable
    const png = await sharp(abs).resize({ width: 1024, height: 1024, fit: 'cover' }).png().toBuffer();

    const form = new FormData();
    form.append('model', MODEL);
    form.append('prompt', PROMPT + (p.note || ''));
    form.append('size', '1024x1024');
    form.append('image', new Blob([png], { type: 'image/png' }), `${p.id}.png`);

    const res = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}` },
      body: form,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const json = await res.json();
    const b64 = json.data?.[0]?.b64_json;
    const url = json.data?.[0]?.url;
    const buf = b64 ? Buffer.from(b64, 'base64') : Buffer.from(await (await fetch(url)).arrayBuffer());

    await sharp(buf).resize({ width: 1000 }).webp({ quality: 82, effort: 5 }).toFile(join(OUT, `team-${p.id}.webp`));
    console.log(`  ok  ${p.id} → src/img/gen/team-${p.id}.webp`);
  } catch (e) {
    console.log(`  FAIL ${p.id}: ${e.message}`);
  }
}
console.log('done');
