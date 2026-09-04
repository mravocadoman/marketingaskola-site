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
  ' An elegant flat line drawing on one solid uniform dark navy #020d1c background, edge to edge. Fine, confident, evenly weighted line work is the whole character of the image - keep it. ' +
  'EVERY LINE MUST MEAN SOMETHING. Every stroke belongs to the subject and helps explain it. Do NOT add decorative technical-drawing filler: no dashed guide lines, no registration marks, no crop marks, no measurement tick scales, no background grid, no scattered stray squares floating in the space. If a line does not describe the subject, delete it. ' +
  'Weave recognisable iconography INTO the line work, subtly rather than as a stuck-on symbol - a browser frame, a search field, a cursor, a cart, an envelope, a simple human figure - drawn with the same fine geometric strokes so it reads as part of one continuous drawing. Never soft rounded clip art, never a portrait-like face standing in for a real person. ' +
  'Composition: one clear idea, large and confident, asymmetric and weighted to one side, often cropped by an edge of the frame; at least a third of the frame stays calm and empty. Square corners; curves only where a circle or arc genuinely belongs to the subject. ' +
  'Palette: white and cool grey #8ba3bd line work on the dark ground, plus exactly ONE shape filled solid cyan #03c3f8 as the focal point. Nothing else is cyan. ' +
  'Strictly flat: no gradients, no glow, no bloom, no 3D, no perspective, no shadows, no vignette. ' +
  'No text, no letters, no numbers, no words, no logos, no watermarks. Subtle fine film grain.';

const PAPER_SUFFIX =
  ' A flat editorial infographic on one solid pure white #ffffff background, edge to edge. ' +
  'TYPOGRAPHY AND LAYOUT ARE SETTLED - keep them exactly: the headline sits top-left, large and bold in deep navy #00152c, ending in a small cyan #03c3f8 full stop. Each item carries a small two-digit index in cyan with a short cyan rule beside it, then a bold navy label, then a note in slate grey #33475b. Items are divided only by single 1px hairlines in pale grey #dbe4ee - no boxes, no cards, no panels, no rounded corners, no shadows. ' +
  'THE DRAWINGS NEED REAL CRAFT - a few bare strokes look unfinished. Each item carries ONE properly drawn line illustration of its subject: enough considered detail to be satisfying and unmistakable, built from fine even navy #00152c strokes with ONE element filled solid cyan. Weave recognisable iconography into the drawing - a magnifying glass over a page, a funnel with items falling through it, a browser window with a cursor, a person at a desk with a screen - and give each one a little specificity rather than a generic symbol. Keep them clean and geometric, never soft rounded cartoon clip art, never a portrait-like face, and never decorative filler such as dashed guides, tick scales or background grids. The drawings must be clearly DIFFERENT from one another and sized large enough to read at a glance. ' +
  'Generous white space and even margins; the layout breathes. Strictly flat: no gradients, no glow, no 3D, no shadows, no texture, no photographs. ' +
  'Spell every Latvian word exactly as given, with correct diacritics; add no other words, no logos, no watermarks. ' +
  'The guillemets in this prompt only mark where a string starts and ends - never draw quotation marks, guillemets or any other punctuation around the text itself.';

const DARK_INFO_SUFFIX =
  ' A flat editorial diagram on one solid uniform very dark navy #020d1c background, edge to edge. It must look designed and confident, not like documentation. ' +
  'LAYERING - this is what gives the image depth: BEHIND everything runs a large faint construction layer in #16283f - long straight rules, dashed guides, small registration squares and tick scales - drawn at a much bigger scale than the content and running off all four edges of the frame, as if the diagram were cropped out of a larger technical drawing. It is clearly subordinate, never competing with the content. ' +
  'TYPOGRAPHY: the headline sits top-left, large and bold in pure white #ffffff, ending in a small cyan #03c3f8 full stop. Each column carries a small two-digit index in cyan with a short cyan rule, a bold white label, and a note in cool grey #8ba3bd. Columns are divided only by single 1px hairlines - no boxes, no cards, no panels, no rounded corners. ' +
  'THE DRAWINGS ARE THE MAIN EVENT: under each column sits ONE bold diagram that makes that subject immediately clear, drawn LARGE - each one fills its column and is the biggest thing in the frame after the headline. Strong weight contrast: the subject is drawn in confident heavy white strokes with solid filled shapes, against the faint construction layer. Exactly one shape per column is filled SOLID cyan #03c3f8 - a real filled block, not an outline. Recognisable icons and simple human figures are welcome wherever they make the subject clearer, drafted from the same geometric strokes, square-cornered and flat, never soft rounded clip art and never a portrait-like face standing in for a real person. The three drawings must be clearly DIFFERENT from one another. ' +
  'COMPOSITION: the artwork fills the whole frame top to bottom. There is no empty dead band at the bottom - the construction layer and the diagrams carry all the way to the edges. ' +
  'Strictly flat: no gradients, no glow, no bloom, no 3D, no perspective, no drop shadows, no vignette. Subtle fine film grain. ' +
  'Spell every Latvian word exactly as given, with correct diacritics; add no other words, no logos, no watermarks. ' +
  'The guillemets in this prompt only mark where a string starts and ends - never draw quotation marks, guillemets or any other punctuation around the text itself.';

const styleSuffix = (slot) =>
  slot.style === 'paper' ? PAPER_SUFFIX : slot.style === 'dark-info' ? DARK_INFO_SUFFIX : STYLE_SUFFIX;

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
