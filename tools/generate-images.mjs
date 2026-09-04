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
  ' Flat editorial vector artwork on one solid uniform dark navy #020d1c background, edge to edge, the same colour in every corner. ' +
  'The visual language is a PRECISION TECHNICAL SCHEMATIC - an engineer\'s construction drawing or a ledger diagram: measured, calm, exact. It is never a friendly corporate illustration, never clip art, never an icon. ' +
  'Build the image from thin 1px hairlines, small open squares used as nodes or plot points, short measurement ticks, and long straight rules that run off the edge of the frame. Right angles and straight diagonals only; no rounded corners anywhere; curves only where a single perfect thin circle outline is itself the subject. ' +
  'Depth comes from LINE WEIGHT and spacing, never from fill, shadow or colour: most construction lines are very faint #1d3550, the lines that carry meaning are cool grey #8ba3bd, and one or two elements step up to white. ' +
  'Exactly ONE small element is cyan #03c3f8 - a single filled square, a node, or one short rule - and it must read as the single signal in an otherwise quiet frame. Cyan covers well under three percent of the image and never fills a large shape. ' +
  'Composition is asymmetric and weighted to one side, with a large deliberately empty quiet zone; the drawing occupies about two thirds of the frame and is cropped by the edge rather than floating politely in the middle. ' +
  'Strictly flat: no gradients, no glow, no bloom, no neon, no 3D, no perspective, no glossy reflections, no drop shadows, no vignette. ' +
  'Recognisable subject matter is welcome where it makes the idea clearer - a browser frame, a search field, a cursor, a simple human figure at a screen - as long as it is drafted in the same thin geometric line work, square-cornered and flat, never soft rounded clip art and never a photographic or portrait-like face standing in for a real person. ' +
  'No text, no letters, no numbers, no words, no logos, no watermarks. Subtle fine film grain over the whole image.';

// Artwork for the white "paper" reading surface: in-article infographics WITH
// Latvian text. Owner (3 Sep 2026): gpt-image-2 renders Latvian well, so the
// infographics carry their own headline and labels; the exact strings are in
// each slot's prompt and a text version sits in the HTML for accessibility.
// (Covers and page artwork stay text-free - see STYLE_SUFFIX.)
const PAPER_SUFFIX =
  ' A flat editorial diagram on one solid pure white #ffffff background, edge to edge, in the visual language of a technical dossier - measured, precise, editorial, NOT a friendly corporate infographic. ' +
  'LAYOUT: everything left-aligned on a strict grid, never centred. The headline sits top-left, large and bold in deep navy #00152c, ending in a small cyan #03c3f8 full stop. Items are separated ONLY by single 1px hairline rules in pale grey #dbe4ee; there are NO boxes, NO cards, NO panels, NO rounded corners, NO outlines around anything, NO drop shadows - the white ground runs straight through. ' +
  'Each item begins with a small two-digit index number in cyan #03c3f8 followed by a short thin cyan horizontal rule, then a bold navy #00152c label, then a note in slate grey #33475b. ' +
  'DIAGRAMS: every item carries ONE small drawing that makes its subject IMMEDIATELY CLEAR, drawn in thin 1px navy and slate line work with small open squares as nodes. Recognisable icons and simple human figures are welcome and encouraged wherever they clarify the idea - a magnifying glass, a browser frame, a cursor, a person at a screen - but they must be drafted from the same thin geometric strokes, square-cornered and flat, never soft rounded cartoon clip art, never a photographic or portrait-like face. The drawings must be clearly DIFFERENT from one another. ' +
  'COLOUR: cyan #03c3f8 is strictly rationed to the index numbers, their short rules, the headline full stop and at most one highlighted detail per drawing. Everything else is navy #00152c and slate #33475b on white. Never fill a large shape with cyan. ' +
  'Typography: one clean geometric sans-serif (like Inter), large and highly legible at 600 pixels wide; generous margins and real empty white space. ' +
  'Strictly flat: no gradients, no glow, no 3D, no shadows, no texture, no photographs. ' +
  'Spell every Latvian word exactly as given, with correct diacritics; add no other words, no logos, no watermarks. ' +
  'The guillemets in this prompt only mark where a string starts and ends - never draw quotation marks, guillemets or any other punctuation around the text itself.';

const DARK_INFO_SUFFIX =
  ' A flat editorial diagram in the visual language of a financial ledger or a technical dossier - restrained, precise, editorial, NOT a generic corporate infographic. ' +
  'Background: one single uniform very dark navy #020d1c, edge to edge, the same colour in every corner. ' +
  'LAYOUT: everything left-aligned on a strict grid, never centred, never symmetrical. The headline sits top-left, large and bold in pure white #ffffff, ending in a small cyan #03c3f8 full stop. Columns are separated ONLY by single hairline vertical rules of 1px in faint grey; there are NO boxes, NO cards, NO panels, NO rounded corners, NO outlines around anything, NO drop shadows, NO container of any kind - the dark background runs straight through. ' +
  'Each column begins with a small two-digit index number in cyan #03c3f8 followed by a short thin cyan horizontal rule, then a bold white label, then a note in cool grey #8ba3bd. ' +
  'DIAGRAMS: under each column sits ONE small drawing that makes that column subject IMMEDIATELY CLEAR, drawn in the house line language - thin 1px strokes, small open squares as nodes, short measurement ticks, in cool grey #8ba3bd with at most one cyan detail. Recognisable icons and simple human figures are welcome and encouraged wherever they make the subject clearer - a magnifying glass for search, a cursor, a browser frame, a person at a screen - but they must be built from the same thin geometric line work, square-cornered and flat, as if drafted rather than illustrated. The three drawings must be clearly DIFFERENT from one another and each readable as its own idea. Never repeat one abstract mark across columns, never a decorative grid of random crossing lines, never soft rounded cartoon clip art, never a photographic or portrait-like face. ' +
  'COLOUR DISCIPLINE: cyan #03c3f8 is strictly rationed and must cover under five percent of the image - it appears only on the index numbers, the short rules beside them and the headline full stop. Everything else is white, #c9d8e8 and #8ba3bd on the dark ground. Never fill a large shape with cyan. ' +
  'Typography: one clean geometric sans-serif (like Inter), tight and confident, large enough to read at 600 pixels wide; generous margins and a lot of empty dark space, especially at the bottom. ' +
  'Strictly flat: no gradients, no glow, no bloom, no neon, no 3D, no vignette, no texture beyond a subtle fine film grain. ' +
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
