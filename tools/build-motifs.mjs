/* Trace every motif the site shows from the ORIGINAL artwork.
 *
 * Owner, 9 Sep 2026: "you are not using the same images. I asked you to
 * repurpose existing headers - split them by pieces and animate, not invent
 * new. I like the old style so just use and animate it."
 *
 * So nothing here is drawn by hand. Each include is traced from the raster that
 * was already on the page, by tools/trace-motif.mjs, and the shapes it animates
 * are the artwork's own. Blog posts trace their OWN cover, so every post keeps
 * the picture it already had.
 *
 * usage: node tools/build-motifs.mjs [--posts-only|--pages-only]
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';

const GEN = 'src/img/gen';
const OUT = 'src/_includes/motifs';
const imagery = JSON.parse(fs.readFileSync('src/_data/imagery.json', 'utf8')).slots;
const altOf = (id) => (imagery.find((s) => s.id === id) || {}).alt || '';
const only = process.argv.find((a) => a.startsWith('--'));

// page motifs: [source id, include name]
// band-meta-targeting, band-smm-orbit and band-smm-cadence are NOT here: those
// three covers are anti-aliased line work on a 96% dark ground, they scored
// 0.15-0.78 retained ink, and their pages went back to the raster on 9 Sep
// 2026. Tracing them again only produced three files nothing includes.
const PAGES = [
  ['hero-pakalpojumi', 'pakalpojumi'], ['hero-meta-reklama', 'meta'],
  ['hero-seo-pakalpojumi', 'seo'], ['hero-video-reklama', 'video'],
  ['hero-ai-automatizacijas', 'ai'], ['hero-konsultacijas', 'konsultacijas'],
  ['meta-reklamas-motivs', 'kurss-meta'], ['google-ads-motivs', 'kurss-google'],
  ['seo-mekletaja-motivs', 'kurss-seo'], ['tiktok-video-motivs', 'kurss-tiktok'],
  ['kursi-programmas-motivs', 'kurss-hub'],
  ['video-formats-band', 'band-video-formats'],
  ['ai-flow-band', 'band-ai-flow'], ['konsultacijas-saruna', 'band-konsultacijas-saruna'],
  ['services-module-band', 'band-services-module'],
];

/* THE FIDELITY GATE, and why it lives here rather than in a separate pass.
 *
 * A trace is only worth shipping if it still IS the artwork. Some covers do
 * not survive quantisation to three flat colours - a cut-out PHOTOGRAPH is the
 * worst case, because continuous tone shreds into thousands of 2px staircase
 * steps full of holes. The build-up then never resolves into the picture it
 * came from. Owner, 10 Sep 2026, naming two of them: "some animations like
 * these dont animate until the end."
 *
 * tools/verify-motifs.mjs measured exactly this and reported it - but it only
 * REPORTED, so every trace shipped anyway and its "(keeps X.webp)" line was a
 * wish rather than a fact. The decision belongs where the map is written.
 *
 * Same two tests and same thresholds as the verifier, because pixel agreement
 * alone lies on a sparse drawing: a cover that is 95% dark ground "matches" a
 * trace that lost the picture entirely. So retained INK is checked too.
 * sharp rasterises the SVG here instead of headless Chrome - no browser, and
 * the gate cannot be skipped by forgetting to run a second command.
 */
const W = 640, H = 427;
const ink = (buf) => { let k = 0; for (let i = 0; i < buf.length; i += 3) {
  if ((0.2126 * buf[i] + 0.7152 * buf[i + 1] + 0.0722 * buf[i + 2]) / 255 > 0.20) k++; } return k; };

const fidelity = async (srcId, name) => {
  const svg = fs.readFileSync(path.join(OUT, `${name}.njk`), 'utf8').replace(/^\{#[\s\S]*?#\}\n/, '');
  const a = await sharp(path.join(GEN, `${srcId}.webp`))
    .resize(W, H, { fit: 'fill' }).removeAlpha().raw().toBuffer();
  const c = await sharp(Buffer.from(svg), { density: 96 })
    .resize(W, H, { fit: 'fill' }).flatten({ background: '#020d1c' }).removeAlpha().raw().toBuffer();
  let big = 0;
  for (let i = 0; i < a.length; i += 3) {
    if (Math.max(Math.abs(a[i] - c[i]), Math.abs(a[i + 1] - c[i + 1]), Math.abs(a[i + 2] - c[i + 2])) > 60) big++;
  }
  const inkA = ink(a);
  return { pct: (300 * big) / a.length, kept: inkA ? ink(c) / inkA : 1 };
};

/* The manifest is the authority on what a cover contains. */
const photographic = (id) => {
  const slot = imagery.find((x) => x.id === id);
  return !!slot && !slot.style && /photograph|photo of/i.test(slot.prompt || '');
};

const pairs = [];
const trace = (srcId, name, alt) => {
  const src = path.join(GEN, `${srcId}.webp`);
  if (!fs.existsSync(src)) { console.log(`  MISSING ${srcId}.webp`); return false; }
  try {
    execFileSync('node', ['tools/trace-motif.mjs', src, path.join(OUT, `${name}.njk`)],
      { env: { ...process.env, MOTIF_ALT: alt }, stdio: 'inherit' });
    pairs.push([srcId, name]);
    return true;
  } catch { console.log(`  FAILED ${srcId}`); return false; }
};

/* TILES - for a cover the tracer cannot keep.
 *
 * Thin anti-aliased lines and dot fields do not survive quantisation: the
 * area threshold drops them, so a network of lines comes back as a face and two
 * dots. Owner, 10 Sep 2026, after seeing those: the header "is not animating".
 * A still is not the answer either ("it was better than just plain image").
 *
 * So the real cover is assembled from its own pixels: square tiles of the
 * picture, each a clipped copy of one <image>, rising into place in a diagonal
 * sweep. It ends on the COMPLETE artwork, because it is the artwork.
 *
 * With the ground matched to #020d1c (tools/match-ground.mjs), only tiles that
 * hold ARTWORK are emitted - a pixel further from the canvas than the matcher's
 * own 12/255 tolerance - so the picture materialises out of the page. Exact
 * equality is the wrong test: the q90 WebP re-encode leaves 1-3/255 of ringing
 * across the ground, which flagged all 96 tiles on every cover. Unmatched, every
 * tile is emitted - the picture is still complete, never holed, but its
 * off-canvas ground shows as a faint rectangle, so the build warns. */
const T = 128;          // tile edge in source px; square, like everything else
const CANVAS = [2, 13, 28];
const tiles = async (srcId, name, alt) => {
  const src = path.join(GEN, `${srcId}.webp`);
  const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const delta = (x, y) => { const i = (y * w + x) * 3;
    return Math.max(Math.abs(data[i] - CANVAS[0]), Math.abs(data[i + 1] - CANVAS[1]), Math.abs(data[i + 2] - CANVAS[2])); };
  // Corners within 6/255: WebP noise, not an unmatched ground (those sit at 4-12).
  const matched = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]].every(([x, y]) => delta(x, y) <= 6);
  const off = (x, y) => delta(x, y) > (matched ? 12 : 0);
  const cols = Math.ceil(w / T), rows = Math.ceil(h / T), cells = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    let hit = false;
    for (let y = r * T; y < Math.min(h, (r + 1) * T) && !hit; y++)
      for (let x = c * T; x < Math.min(w, (c + 1) * T); x++) if (off(x, y)) { hit = true; break; }
    // Bottom-left to top-right, most compositions here rise that way. A small
    // fixed jitter so the tiles arrive as pieces rather than as a clean wipe.
    if (hit) cells.push({ c, r, band: c + (rows - 1 - r) + (((c * 7 + r * 13) % 5) - 2) * 0.35 });
  }
  cells.sort((a, b) => a.band - b.band);
  const lo = cells.length ? cells[0].band : 0, hi = cells.length ? cells[cells.length - 1].band : 1;
  const id = name.replace(/[^a-z0-9-]/gi, '');
  const P = 2;           // clip overlap in px, so no hairline seam between tiles
  const defs = [], parts = [];
  cells.forEach(({ c, r, band }, k) => {
    // --i spans 0-20 whatever the tile count, so the assembly takes as long as
    // a 20-part trace (about 2s) instead of growing with the picture.
    const i = hi > lo ? ((band - lo) / (hi - lo)) * 20 : 0;
    defs.push(`<clipPath id="${id}-${k}"><rect x="${c * T - P}" y="${r * T - P}" width="${T + 2 * P}" height="${T + 2 * P}"/></clipPath>`);
    parts.push(`  <g class="m" style="--i:${i.toFixed(2)}"><image href="/img/gen/${srcId}.webp" width="${w}" height="${h}" clip-path="url(#${id}-${k})"/></g>`);
  });
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  fs.writeFileSync(path.join(OUT, `${name}.njk`),
    `{# Tiles of ${srcId}.webp - the tracer could not keep this artwork, so the real picture\n` +
    `   assembles from its own pixels. Regenerate with tools/build-motifs.mjs; do not hand-edit. #}\n` +
    `<svg class="motif motif--tiles" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(alt)}" xmlns="http://www.w3.org/2000/svg">\n` +
    `  <defs>${defs.join('')}</defs>\n${parts.join('\n')}\n</svg>\n`);
  return { n: cells.length, of: cols * rows, matched };
};

let ok = 0;
const rejected = [];
const photo = [];
const tiled = [];
if (only !== '--posts-only') {
  console.log('page motifs:');
  for (const [srcId, name] of PAGES) if (trace(srcId, name, altOf(srcId))) ok++;
}

if (only !== '--pages-only') {
  console.log('post motifs (each post traces its own cover):');
  const map = {};
  for (const f of fs.readdirSync('src/posts').filter((f) => f.endsWith('.md'))) {
    const head = fs.readFileSync(path.join('src/posts', f), 'utf8').slice(0, 1200);
    const slug = (head.match(/permalink:\s*"\/([^/"]+)\//) || [])[1] || f.replace(/\.md$/, '');
    /* `_` belongs in this class: cover-epasta_marketings.webp is the one cover
     * with an underscore, and without it that post was silently skipped as
     * "no generated cover" and was the site's only still hero. */
    const img = (head.match(/^image:\s*"\/img\/gen\/([a-z0-9_-]+)\.webp"/m) || [])[1];
    const title = (head.match(/^title:\s*"([^"]+)"/m) || [])[1] || '';
    if (!img) { console.log(`  no generated cover: ${slug}`); continue; }

    /* A COVER WITH A PHOTOGRAPH IN IT IS NEVER TRACED, whatever it scores.
     *
     * Continuous tone cannot survive quantisation to three flat colours: the
     * figure shreds into a smear of specks. And when the person is small - one
     * standing figure on a wide band - the damage is INVISIBLE to the gate
     * below, because both of its tests are frame-global. The worst example
     * measured diff 0.27% and ink kept 1.01, a near-perfect score, with the
     * person completely destroyed. Owner reported that page as one that
     * "dont animate until the end".
     *
     * So this is decided from the source, not the score. The manifest already
     * says which covers are photographic; that is the authority.
     *
     * NOTE (10 Sep 2026): this no longer SKIPS. Owner, shown three of the
     * stills: "well it was better than just plain image that's there now."
     * A rough assembly beats a still, so a photographic cover traces and ships
     * like any other and is only listed at the end, so the damage stays
     * visible. Put the `continue` back to return to stills. */
    if (photographic(img)) photo.push(slug);

    if (!trace(img, `post-${slug}`, `Raksta motīvs: ${title.slice(0, 60)}`)) continue;

    /* The gate REPORTS, it does not exclude - owner's call the same day, after
     * seeing what the fallback actually looks like on the page. Every trace
     * ships; the numbers below say which finish on a rough picture, so a bad
     * one gets redrawn as flat-block art rather than quietly hidden. */
    const { pct, kept } = await fidelity(img, `post-${slug}`);
    /* Retained ink is the test that means "the picture is gone" - a diff over 3%
     * on its own is usually just many small shapes sitting a pixel off, and
     * those traces look right. Under 0.8 of the ink, the trace lost the artwork:
     * build the real cover from tiles instead. */
    if (kept < 0.8) {
      const t = await tiles(img, `post-${slug}`, `Raksta motīvs: ${title.slice(0, 60)}`);
      tiled.push({ slug, img, kept, ...t });
    } else if (pct > 3 || kept > 1.3) rejected.push({ slug, img, pct, kept });
    map[slug] = `post-${slug}`; ok++;
  }
  /* MERGE, never replace. A checkout that cannot see every post - a worktree,
   * or an unpublished draft that lives only in the main working tree - would
   * otherwise silently drop that post's motif from the map. */
  const prev = fs.existsSync('src/_data/postMotifs.json')
    ? (JSON.parse(fs.readFileSync('src/_data/postMotifs.json', 'utf8')).bySlug || {}) : {};
  const merged = Object.fromEntries(Object.entries({ ...prev, ...map }).sort());
  fs.writeFileSync('src/_data/postMotifs.json',
    JSON.stringify({ _comment: 'Generated by tools/build-motifs.mjs — each post traces its own cover.', bySlug: merged }, null, 2) + '\n');
  console.log(`  mapped ${Object.keys(merged).length} posts`);
  if (photo.length) {
    console.log(`  ${photo.length} traced from a photographic cover (the figure will be rough):`);
    for (const sl of photo) console.log(`    ${sl}`);
  }
  if (tiled.length) {
    console.log(`  ${tiled.length} assembled from tiles of the real cover (the trace lost the artwork):`);
    for (const t of tiled) console.log(`    ${t.slug.padEnd(52)} ink kept ${t.kept.toFixed(2)}  ${String(t.n).padStart(3)}/${t.of} tiles` +
      (t.matched ? '' : `  WARNING ground not #020d1c - run: node tools/match-ground.mjs src/img/gen/${t.img}.webp`));
  }
  if (rejected.length) {
    console.log(`  ${rejected.length} traced with a loose fit (diff over 3%, artwork kept - check by eye):`);
    for (const r of rejected)
      console.log(`    ${r.slug.padEnd(52)} diff ${r.pct.toFixed(2).padStart(5)}%  ink kept ${r.kept.toFixed(2)}`);
  }
}

/* Page motifs are included by NAME in the templates, so one cannot silently
 * fall back - deleting the file would break the build. Report instead, and
 * swap the include for the raster by hand if one ever fails. */
for (const [srcId, name] of pairs.filter(([, n]) => !n.startsWith('post-'))) {
  const { pct, kept } = await fidelity(srcId, name);
  if (pct > 3 || kept < 0.8 || kept > 1.3)
    console.log(`  PAGE MOTIF BELOW THRESHOLD ${name} — diff ${pct.toFixed(2)}%, ink kept ${kept.toFixed(2)}`);
}

fs.writeFileSync('/tmp/motif-pairs.json', JSON.stringify(pairs));
console.log(`done: ${ok} motifs traced from the original artwork`);
