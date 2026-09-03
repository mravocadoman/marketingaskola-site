// Generates brand artwork for every slot in src/_data/imagery.json via the
// OpenAI images API, then converts to webp (the project's image format).
//
//   node tools/generate-images.mjs                 # all missing slots
//   node tools/generate-images.mjs --only=cover-kas-ir-seo
//   node tools/generate-images.mjs --force         # regenerate existing
//   node tools/generate-images.mjs --limit=5 --quality=high
//
// Needs OPENAI_API_KEY (read from .env, which is gitignored).
// Output: src/img/gen/<id>.webp — referenced from markup as /img/gen/<id>.webp
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src', 'img', 'gen');
mkdirSync(OUT, { recursive: true });

// --- config -----------------------------------------------------------------
const arg = (k, d) => {
  const hit = process.argv.find((a) => a.startsWith(`--${k}=`));
  return hit ? hit.split('=').slice(1).join('=') : d;
};
const FORCE = process.argv.includes('--force');
const ONLY = arg('only', null);
const LIMIT = Number(arg('limit', 0));
const MODEL = arg('model', 'gpt-image-2');
const QUALITY = arg('quality', 'medium');
const CONCURRENCY = Number(arg('concurrency', 4));

// The house style is appended to every prompt so a single edit re-tunes the set.
const STYLE_SUFFIX =
  ' Flat editorial vector artwork on a solid dark navy background (#020d1c). ' +
  'Strictly flat colour blocking: absolutely no gradients, no glow, no bloom, no neon, ' +
  'no 3D rendering, no glossy reflections, no drop shadows, no vignette. ' +
  'Single accent colour cyan #03c3f8 used sparingly, plus white and cool grey #8ba3bd. ' +
  'No text, no letters, no numbers, no words, no logos, no watermarks, no user-interface elements. ' +
  'Generous negative space, asymmetric composition, subtle fine film grain, premium editorial restraint.';

// Artwork for the white "paper" reading surface: in-article infographics WITH
// Latvian text. Owner (3 Sep 2026): gpt-image-2 renders Latvian well, so the
// infographics carry their own headline and labels; the exact strings are in
// each slot's prompt and a text version sits in the HTML for accessibility.
// (Covers and page artwork stay text-free - see STYLE_SUFFIX.)
const PAPER_SUFFIX =
  ' Flat editorial vector infographic on a pure white background (#ffffff), like a diagram in a premium business magazine. ' +
  'Typography: one clean geometric sans-serif typeface (like Inter), headline bold in deep navy #00152c, labels bold navy, notes regular in slate grey #33475b; all type large and highly legible even when the image is shown at 600 pixels wide. ' +
  'Strictly flat colour blocking: no gradients, no glow, no 3D, no shadows, no texture, no photographs. Ink deep navy #00152c, one accent colour cyan #03c3f8 used sparingly (the step numbers or one highlight per group), cool grey #8ba3bd for secondary shapes. ' +
  'Simple square-cornered geometric icons, generous margins, even spacing, clear reading order. ' +
  'Spell every Latvian word exactly as given, with correct diacritics (ā č ē ģ ī ķ ļ ņ š ū ž); add no other words, no logos, no watermarks. ' +
  'The guillemets in this prompt only mark where a string starts and ends - never draw quotation marks, guillemets or any other punctuation around the text itself.';
const styleSuffix = (slot) => (slot.style === 'paper' ? PAPER_SUFFIX : STYLE_SUFFIX);

const SIZES = { landscape: '1536x1024', square: '1024x1024', portrait: '1024x1536' };

if (!existsSync(join(ROOT, '.env')) && !process.env.OPENAI_API_KEY) {
  console.error('No .env and no OPENAI_API_KEY in env.');
  process.exit(1);
}
if (existsSync(join(ROOT, '.env'))) {
  for (const line of readFileSync(join(ROOT, '.env'), 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('OPENAI_API_KEY missing'); process.exit(1); }

// --- work list --------------------------------------------------------------
const { slots } = JSON.parse(readFileSync(join(ROOT, 'src', '_data', 'imagery.json'), 'utf8'));
let queue = slots.filter((s) => (ONLY ? s.id === ONLY : true));
if (!FORCE) queue = queue.filter((s) => !existsSync(join(OUT, s.id + '.webp')));
if (LIMIT) queue = queue.slice(0, LIMIT);

console.log(`model=${MODEL} quality=${QUALITY} → ${queue.length} image(s) to generate`);
if (!queue.length) process.exit(0);

// --- generate ---------------------------------------------------------------
let done = 0, failed = [];

async function one(slot) {
  const size = SIZES[slot.aspect] || SIZES.landscape;
  const body = {
    model: MODEL,
    prompt: slot.prompt + styleSuffix(slot),
    size,
    quality: slot.quality || QUALITY,
    n: 1,
  };
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const txt = await res.text();
        if (res.status === 429 || res.status >= 500) {
          await new Promise((r) => setTimeout(r, 4000 * attempt));
          continue;
        }
        throw new Error(`HTTP ${res.status}: ${txt.slice(0, 300)}`);
      }
      const json = await res.json();
      const b64 = json.data?.[0]?.b64_json;
      const url = json.data?.[0]?.url;
      let buf;
      if (b64) buf = Buffer.from(b64, 'base64');
      else if (url) buf = Buffer.from(await (await fetch(url)).arrayBuffer());
      else throw new Error('no image payload: ' + JSON.stringify(json).slice(0, 300));

      await sharp(buf).resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 80, effort: 5 })
        .toFile(join(OUT, slot.id + '.webp'));
      done++;
      console.log(`  ok  [${done}/${queue.length}] ${slot.id} (${size})`);
      return;
    } catch (e) {
      if (attempt === 3) { failed.push(`${slot.id}: ${e.message}`); console.log(`  FAIL ${slot.id}: ${e.message}`); }
      else await new Promise((r) => setTimeout(r, 2500 * attempt));
    }
  }
}

const pool = [...queue];
await Promise.all(Array.from({ length: Math.min(CONCURRENCY, pool.length) }, async () => {
  while (pool.length) await one(pool.shift());
}));

console.log(`\ndone: ${done} ok, ${failed.length} failed`);
failed.forEach((f) => console.log('  ', f));
