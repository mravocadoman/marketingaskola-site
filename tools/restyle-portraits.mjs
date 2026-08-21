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

const PROMPT =
  'Keep this PHOTOGRAPH a photograph and place it on a branded background. ' +
  'It must stay photographic: real skin texture, real hair, real fabric, natural photographic ' +
  'detail and depth. Do NOT illustrate it, do NOT vectorise, posterise, cel-shade, cartoon, ' +
  'stencil or turn it into line art or a drawing. ' +
  'ABSOLUTE REQUIREMENT — the person must stay the same real person: keep the face, facial ' +
  'features, bone structure, expression, gaze direction, skin, hairstyle, HAIR COLOUR, facial ' +
  'hair and clothing exactly as photographed. Do not replace the person, do not swap the face, ' +
  'do not change their age, build, hair colour or hair length, do not beautify or smooth the ' +
  'skin. They must remain immediately recognisable to colleagues. ' +
  'Change ONLY the surroundings and the grade: cut the subject out of their original background ' +
  'and place them on a solid dark navy field (#020d1c) with no room, props or texture behind ' +
  'them. Behind the subject place ONE large flat cyan (#03c3f8) circle, positioned off-centre ' +
  'so the person partly eclipses it. Add one thin white quarter-arc outline as a secondary ' +
  'accent near a lower corner. Render the person in high-contrast black and white so only the ' +
  'circle and arc carry colour. ' +
  'The circle and arc are flat graphic shapes behind a real photographic subject — like a studio ' +
  'portrait shot against a navy backdrop with a painted cyan disc on it. ' +
  'No gradients, no glow, no bloom, no drop shadow, no vignette, no 3D, no text, no letters, ' +
  'no logos, no borders, no frames.';

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

    await sharp(buf).resize({ width: 1000 }).webp({ quality: 82, effort: 5 }).toFile(join(OUT, `${p.id}-brand.webp`));
    console.log(`  ok  ${p.id} → src/img/gen/${p.id}-brand.webp`);
  } catch (e) {
    console.log(`  FAIL ${p.id}: ${e.message}`);
  }
}
console.log('done');
