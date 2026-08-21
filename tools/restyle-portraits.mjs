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
const OUT = join(ROOT, 'src', 'img', 'team');
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
  { id: 'matiss-seo', src: 'src/img/2025/03/Untitled-design-2.webp' },
  { id: 'katrina',  src: 'src/img/2021/09/FullSizeRender-1.webp', note: ' Her hair is LIGHT BLONDE with a straight fringe — keep the blonde colour and the fringe exactly; do not darken her hair.' },
  { id: 'madara',   src: 'src/img/2025/03/Untitled-design-3.webp' },
  { id: 'rihards-wide', src: 'src/img/2024/07/Untitled-design-4.webp' },
];

// Likeness first, and ONLY the background is up for edit. Earlier versions
// buried the likeness rule under "cut out / convert to B&W / add shapes", which
// invites the model to re-render the person — and it did. Greyscale is applied
// locally afterwards instead, so it can never move a facial feature.

// Desaturate everything except brand-cyan pixels. Pure channel maths — it
// cannot shift geometry, so the face stays exactly as photographed.
async function selectiveGrey(buf) {
  const img = sharp(buf).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  for (let i = 0; i < data.length; i += ch) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const cyanish = b > 90 && b > r * 1.45 && g > r * 1.2;
    if (cyanish) continue;
    const y = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
    data[i] = y; data[i + 1] = y; data[i + 2] = y;
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: ch } })
    .png()
    .toBuffer();
}

const PROMPT =
  'KEEP THE LIKENESS OF THE PERSON PERFECTLY. This is a real, specific person and they must ' +
  'remain perfectly identical and immediately recognisable: exactly the same face, the same ' +
  'facial proportions, eyes, nose, mouth, jawline and ears, the same skin, the same expression ' +
  'and gaze, the same age, the same hairstyle, the same HAIR COLOUR, the same facial hair and ' +
  'the same clothing. Do not redraw, restyle, beautify, smooth, slim, age or youthen the person. ' +
  'Do not swap the face. The person must look exactly as they do in the original photograph. ' +
  'EDIT ONLY THE BACKGROUND BEHIND THEM. Replace whatever is behind the person with a plain, ' +
  'solid dark navy field (hex #020d1c) — no room, no window, no furniture, no texture. ' +
  'On that navy field, behind the person, place ONE large flat cyan (hex #03c3f8) circle, ' +
  'positioned so the person overlaps and partly hides it. Add one thin white quarter-arc ' +
  'outline near a lower corner. ' +
  'Keep it a real photograph with real photographic detail — do not illustrate, vectorise, ' +
  'posterise or cartoon it. No gradients, no glow, no drop shadow, no text, no logos.';

let queue = PORTRAITS.filter((p) => (ONLY ? p.id === ONLY : true));
if (!FORCE) queue = queue.filter((p) => !existsSync(join(OUT, `${p.id}-brand.webp`)));

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

    const toned = await selectiveGrey(buf);
      await sharp(toned).resize({ width: 1000 }).webp({ quality: 82, effort: 5 }).toFile(join(OUT, `${p.id}-brand.webp`));
    console.log(`  ok  ${p.id} → src/img/gen/${p.id}-brand.webp`);
  } catch (e) {
    console.log(`  FAIL ${p.id}: ${e.message}`);
  }
}
console.log('done');
