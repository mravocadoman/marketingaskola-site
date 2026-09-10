/* Trace every motif the site shows from the ORIGINAL artwork.
 *
 * Owner, 9 Sep 2026: "you are not using the same images. I asked you to
 * repurpose existing headers - split them by pieces and animate, not invent
 * new. I like the old style so just use and animate it."
 *
 * So nothing here is drawn by hand. Page motifs are traced from the raster that
 * was already on the page, by tools/trace-motif.mjs - they are flat colour
 * blocking, which traces exactly. Blog posts are assembled from PIECES of their
 * OWN cover (see below), because half the covers are not flat colour blocking
 * and a trace of them finishes on a fragment.
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

/* PIECES - every post header is its own cover, split into its own objects.
 *
 * Owner, 10 Sep 2026, after a day of trace -> still -> trace -> tiles: "can we
 * make it fuller so full picture is rendered piece by piece?"
 *
 * The tracer quantises a cover to three flat colours and keeps only regions
 * above a minimum area, so anything that is not flat colour blocking - a
 * photograph, thin lines, a dot field - shreds or vanishes, and the build-up
 * finishes on a fragment. Tiles fixed the ending but cut the picture into
 * arbitrary squares.
 *
 * Pieces keep the tracer's idea - split the picture by colour and by connected
 * region, masses first and the cyan accent last - but fill every piece with the
 * REAL pixels of the cover instead of a flat colour. Each piece is a clipped
 * copy of one <image>, so a photograph stays a photograph and a hairline stays
 * a hairline. And because every pixel that is not ground belongs to exactly one
 * piece, the last frame IS the cover: nothing is approximated, nothing is lost.
 *
 * - A pixel is ground when it sits within 12/255 of #020d1c - match-ground's
 *   own tolerance, so on a matched cover everything outside the pieces is
 *   byte-for-byte the page canvas. The build verifies this by reassembling the
 *   pieces and comparing against the cover, and fails loudly if it does not
 *   match - an unmatched ground is the usual cause.
 * - Clips are the exact union of 4px cells, traced as a rectilinear outline.
 *   No simplification: a simplified clip would cut the artwork's own edge.
 * - A dot field or a grid is ONE connected region, so it would arrive in a
 *   single step. A piece that is sparse (under 35% of its box) and spans a lot
 *   of the frame is split through its emptiest line, repeatedly, so it spreads
 *   across the frame instead. Solid objects are never split. */
const CANVAS = [2, 13, 28];
const CELL = 4, GROUND = 12, MIN_CELLS = 24, MAX_PIECES = 24, WANT_PIECES = 12;
/* grey 0, white 1, cyan 2 - the tracer's order. Cyan is decided by CHROMA, as a
 * share of the pixel's own brightness, so it holds at any brightness: the dim
 * anti-aliased edge of a cyan line sits closer to grey in RGB, and both
 * nearest-colour and a fixed difference filed that edge with the grey masses -
 * a faint outline of every cyan element arrived early, before the accent
 * itself. Blue and green each far above red is cyan at any brightness; grey
 * blended into the navy ground never gets past ~0.35 on the blue ratio. */
const tone = (r, g, b) => ((b - r) > 0.6 * b && (g - r) > 0.5 * g ? 2
  : (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.8 ? 1 : 0);

async function segment(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const cw = Math.ceil(w / CELL), ch = Math.ceil(h / CELL);
  const votes = new Uint32Array(cw * ch * 3);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 3;
    if (Math.max(Math.abs(data[i] - CANVAS[0]), Math.abs(data[i + 1] - CANVAS[1]), Math.abs(data[i + 2] - CANVAS[2])) <= GROUND) continue;
    votes[((y / CELL | 0) * cw + (x / CELL | 0)) * 3 + tone(data[i], data[i + 1], data[i + 2])]++;
  }
  // a cell takes the class most of its artwork pixels vote for; -1 is ground
  const cls = new Int8Array(cw * ch).fill(-1);
  for (let c = 0; c < cw * ch; c++) {
    const g = votes[c * 3], wh = votes[c * 3 + 1], cy = votes[c * 3 + 2];
    if (g + wh + cy) cls[c] = cy > g && cy > wh ? 2 : wh > g ? 1 : 0;
  }
  // 8-connected regions per class
  const owner = new Int32Array(cw * ch).fill(-1), regions = [];
  for (let c = 0; c < cw * ch; c++) {
    if (cls[c] < 0 || owner[c] >= 0) continue;
    const k = cls[c], cells = [c]; owner[c] = regions.length;
    for (let s = 0; s < cells.length; s++) {
      const qx = cells[s] % cw, qy = cells[s] / cw | 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = qx + dx, ny = qy + dy;
        if (nx < 0 || ny < 0 || nx >= cw || ny >= ch) continue;
        const n = ny * cw + nx;
        if (owner[n] < 0 && cls[n] === k) { owner[n] = regions.length; cells.push(n); }
      }
    }
    regions.push(box({ k, cells }, cw));
  }
  let live = regions;
  // specks join their nearest region of the same colour; then cap the count
  const gap = (a, b) => Math.max(0, a.x0 - b.x1, b.x0 - a.x1) + Math.max(0, a.y0 - b.y1, b.y0 - a.y1);
  const nearest = (a) => live.reduce((best, b) => b === a ? best
    : (!best || gap(a, b) + (b.k === a.k ? 0 : 1e6) < gap(a, best) + (best.k === a.k ? 0 : 1e6)) ? b : best, null);
  const absorb = (a) => { const b = nearest(a); if (!b) return; b.cells.push(...a.cells); box(b, cw); live = live.filter((x) => x !== a); };
  for (const a of live.slice().sort((p, q) => p.cells.length - q.cells.length))
    if (a.cells.length < MIN_CELLS && live.length > 1) absorb(a);
  while (live.length > MAX_PIECES) absorb(live.reduce((m, p) => (p.cells.length < m.cells.length ? p : m)));
  live.forEach((p) => { p.root = p.cells.length; });
  // a sparse region spanning the frame is split through its emptiest line
  const frame = cw * ch;
  const area = (p) => (p.x1 - p.x0 + 1) * (p.y1 - p.y0 + 1);
  for (let guard = 0; live.length < WANT_PIECES && guard < 64; guard++) {
    const cand = live.filter((p) => !p.solid && p.cells.length >= 4 * MIN_CELLS && area(p) > 0.03 * frame && p.cells.length / area(p) < 0.35)
      .sort((a, b) => area(b) - area(a))[0];
    if (!cand) break;
    const horiz = cand.x1 - cand.x0 >= cand.y1 - cand.y0;          // cut across the longer side
    const lo = horiz ? cand.x0 : cand.y0, hi = horiz ? cand.x1 : cand.y1, span = hi - lo;
    const hist = new Uint32Array(span + 2);
    for (const c of cand.cells) hist[(horiz ? c % cw : c / cw | 0) - lo]++;
    /* Cut where the cells BALANCE - each side keeps at least a quarter - and
     * within that, through the emptiest gap, so the cut runs between objects
     * rather than through them. Cutting at the middle of the box instead left
     * one side nearly empty whenever the artwork crowded into one corner. */
    let cut = -1, fewest = Infinity, acc = 0;
    for (let t = 0; t < span; t++) {
      acc += hist[t];
      if (acc < cand.cells.length / 4 || acc > (cand.cells.length * 3) / 4) continue;
      if (hist[t] + hist[t + 1] < fewest) { fewest = hist[t] + hist[t + 1]; cut = t; }
    }
    if (cut < 0) { cand.solid = true; continue; }
    const a = [], b = [];
    for (const c of cand.cells) ((horiz ? c % cw : c / cw | 0) - lo <= cut ? a : b).push(c);
    if (a.length < MIN_CELLS || b.length < MIN_CELLS) { cand.solid = true; continue; }
    live = live.filter((x) => x !== cand).concat([a, b].map((cells) => box({ k: cand.k, cells, root: cand.root }, cw)));
  }
  // masses first, the cyan accent last; pieces cut from one region sweep bottom-left to top-right
  live.sort((p, q) => p.k - q.k || q.root - p.root || (p.x0 + (ch - p.y1)) - (q.x0 + (ch - q.y1)));
  return { w, h, cw, ch, pieces: live };
}

function box(p, cw) {
  p.x0 = Infinity; p.x1 = -1; p.y0 = Infinity; p.y1 = -1;
  for (const c of p.cells) { const x = c % cw, y = c / cw | 0;
    if (x < p.x0) p.x0 = x; if (x > p.x1) p.x1 = x; if (y < p.y0) p.y0 = y; if (y > p.y1) p.y1 = y; }
  return p;
}

/* The exact boundary of a set of cells, as compact relative h/v moves. */
function clipPath(p, cw, ch) {
  const set = new Set(p.cells);
  const has = (x, y) => x >= 0 && y >= 0 && x < cw && y < ch && set.has(y * cw + x);
  const edges = new Map();
  const add = (ax, ay, bx, by) => { const k = ax + ',' + ay; (edges.get(k) || edges.set(k, []).get(k)).push([bx, by]); };
  for (const c of p.cells) {
    const x = c % cw, y = c / cw | 0;
    if (!has(x, y - 1)) add(x, y, x + 1, y);
    if (!has(x + 1, y)) add(x + 1, y, x + 1, y + 1);
    if (!has(x, y + 1)) add(x + 1, y + 1, x, y + 1);
    if (!has(x - 1, y)) add(x, y + 1, x, y);
  }
  let d = '';
  while (edges.size) {
    let [cx, cy] = edges.keys().next().value.split(',').map(Number);
    const pts = [[cx, cy]];
    for (;;) {
      const k = cx + ',' + cy, next = edges.get(k);
      if (!next || !next.length) { edges.delete(k); break; }
      [cx, cy] = next.pop(); if (!next.length) edges.delete(k);
      pts.push([cx, cy]);
      if (cx === pts[0][0] && cy === pts[0][1]) break;
    }
    const keep = [pts[0]];              // corners only: drop points on a straight run
    for (let i = 1; i < pts.length - 1; i++) {
      const [ax, ay] = keep[keep.length - 1], [bx, by] = pts[i], [qx, qy] = pts[i + 1];
      if ((bx - ax) * (qy - by) !== (by - ay) * (qx - bx)) keep.push(pts[i]);
    }
    d += `M${keep[0][0] * CELL} ${keep[0][1] * CELL}` + keep.slice(1).map((q, i) =>
      q[0] !== keep[i][0] ? `h${(q[0] - keep[i][0]) * CELL}` : `v${(q[1] - keep[i][1]) * CELL}`).join('') + 'z';
  }
  return d;
}

const pieces = async (srcId, name, alt) => {
  const file = path.join(GEN, `${srcId}.webp`);
  const { w, h, cw, ch, pieces: parts } = await segment(file);
  /* Each clip reaches one cell PAST its piece - into ground, and into pieces
   * drawn before it - never into a later one. An anti-aliased clip edge takes
   * coverage from the pixels it crosses; drawn tight, that thinned a white
   * hairline lying along a piece's edge, and left a faint seam wherever two
   * pieces met. With the margin, every edge falls on pixels that are already
   * on screen and identical (canvas, or the earlier piece's own pixels), so
   * it has nothing to take. No later piece is ever revealed early. */
  const owner = new Int32Array(cw * ch).fill(-1);
  parts.forEach((p, j) => { for (const c of p.cells) owner[c] = j; });
  const clips = parts.map((p, j) => {
    const cells = new Set(p.cells);
    for (const c of p.cells) {
      const x = c % cw, y = c / cw | 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= cw || ny >= ch) continue;
        const n = ny * cw + nx;
        if (owner[n] < j) cells.add(n);        // ground (-1) or an earlier piece
      }
    }
    return clipPath({ cells: [...cells] }, cw, ch);
  });

  // Reassemble and compare. The pieces must BE the cover: worst 32px block
  // within 3/255. An unmatched ground is what breaks this, and says so.
  const uri = 'data:image/png;base64,' + (await sharp(file).png().toBuffer()).toString('base64');
  const probe = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#020d1c"/>` +
    `<defs>${clips.map((d, k) => `<clipPath id="p${k}"><path d="${d}"/></clipPath>`).join('')}</defs>` +
    clips.map((_, k) => `<image xlink:href="${uri}" width="${w}" height="${h}" clip-path="url(#p${k})"/>`).join('') + '</svg>';
  const a = await sharp(file).removeAlpha().raw().toBuffer();
  const b = await sharp(Buffer.from(probe)).removeAlpha().raw().toBuffer();
  let worst = 0;
  for (let by = 0; by < h; by += 32) for (let bx = 0; bx < w; bx += 32) {
    let s = 0, n = 0;
    for (let y = by; y < Math.min(h, by + 32); y++) for (let x = bx; x < Math.min(w, bx + 32); x++) {
      const i = (y * w + x) * 3; n++;
      s += Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2]));
    }
    worst = Math.max(worst, s / n);
  }
  if (worst > 3) throw new Error(`${srcId}: pieces differ from the cover by ${worst.toFixed(1)}/255 in one block - ` +
    `is its ground #020d1c? run: node tools/match-ground.mjs ${file}`);

  const id = name.replace(/[^a-z0-9-]/gi, '');
  // --i spans 0-20 at most, so a busy cover takes as long as a 20-part motif (~2s)
  const step = parts.length > 21 ? 20 / (parts.length - 1) : 1;
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const body = parts.map((p, k) => {
    // each piece settles around its OWN centre - see .motif--pieces in style.css
    const ox = ((p.x0 + p.x1 + 1) / 2) * CELL, oy = ((p.y0 + p.y1 + 1) / 2) * CELL;
    return `  <g class="m" style="--i:${+(k * step).toFixed(2)};transform-origin:${ox}px ${oy}px">` +
      `<image href="/img/gen/${srcId}.webp" width="${w}" height="${h}" clip-path="url(#${id}-${k})"/></g>`;
  }).join('\n');
  fs.writeFileSync(path.join(OUT, `${name}.njk`),
    `{# Pieces of ${srcId}.webp - the real cover, split into its own objects and reassembled\n` +
    `   in place, so it ends on the complete picture. Regenerate with tools/build-motifs.mjs;\n` +
    `   do not hand-edit. #}\n` +
    `<svg class="motif motif--pieces" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(alt)}" xmlns="http://www.w3.org/2000/svg">\n` +
    `  <defs>${clips.map((d, k) => `<clipPath id="${id}-${k}"><path d="${d}"/></clipPath>`).join('')}</defs>\n${body}\n</svg>\n`);
  return { n: parts.length, worst, kb: fs.statSync(path.join(OUT, `${name}.njk`)).size / 1024 };
};

let ok = 0;
const built = [];
if (only !== '--posts-only') {
  console.log('page motifs:');
  for (const [srcId, name] of PAGES) if (trace(srcId, name, altOf(srcId))) ok++;
}

if (only !== '--pages-only') {
  console.log('post motifs (each post is assembled from pieces of its own cover):');
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

    const r = await pieces(img, `post-${slug}`, `Raksta motīvs: ${title.slice(0, 60)}`);
    built.push({ slug, ...r });
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
  const kb = built.reduce((n, b) => n + b.kb, 0);
  console.log(`  ${built.length} posts assembled from pieces of their own cover - ` +
    `${Math.min(...built.map((b) => b.n))}-${Math.max(...built.map((b) => b.n))} pieces each, ` +
    `worst reassembly ${Math.max(...built.map((b) => b.worst)).toFixed(1)}/255, ${kb.toFixed(0)} KB of markup in total`);
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
