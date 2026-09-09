/* Turn an existing flat-colour motif into an SVG made of its OWN shapes.
 *
 * Why this exists: the owner wanted the existing artwork taken apart and
 * animated - "repurpose existing headers, split them by pieces and animate,
 * not invent new". Hand-drawing replacements changed the look, which was the
 * whole objection. This traces the real pixels instead, so the result IS the
 * original picture, just made of parts that can animate independently.
 *
 * The art is flat colour blocking on one ground, so the method is simple and
 * exact: quantise to the house palette, find connected regions per colour,
 * walk each region's boundary, simplify the staircase into straight edges.
 *
 * Draw order is grey, then off-white, then cyan, largest first. That is both
 * the correct z-order (a light bar sits ON its darker slab, and tracing the
 * slab fills the hole underneath) and a natural build-up: masses first,
 * details last.
 *
 * usage: node tools/trace-motif.mjs <in.webp> <out.njk> [--w=760] [--min=40]
 */
import sharp from 'sharp';
import fs from 'node:fs';

const args = process.argv.slice(2);
const [input, output] = args.filter((a) => !a.startsWith('--'));
const flag = (k, d) => { const h = args.find((a) => a.startsWith(`--${k}=`)); return h ? Number(h.split('=')[1]) : d; };
const TRACE_W = flag('w', 760);       // trace resolution; shapes are large, so half size is plenty
const MIN_AREA = flag('min', 40);     // drop specks at trace resolution
if (!input || !output) { console.error('usage: node tools/trace-motif.mjs <in.webp> <out.njk>'); process.exit(1); }

const PALETTE = [
  { name: 'bg',    rgb: [2, 13, 28],    skip: true },
  { name: 'grey',  rgb: [139, 163, 189] },
  { name: 'white', rgb: [242, 245, 248] },
  { name: 'cyan',  rgb: [3, 195, 248] },
];
const HEX = { grey: '#8ba3bd', white: '#f2f5f8', cyan: '#03c3f8' };
const ORDER = ['grey', 'white', 'cyan'];

const img = sharp(input).removeAlpha();
const meta = await img.metadata();
const H = Math.round((meta.height / meta.width) * TRACE_W);
const { data } = await img.resize({ width: TRACE_W, height: H, fit: 'fill', kernel: 'nearest' })
  .raw().toBuffer({ resolveWithObject: true });

// nearest palette colour per pixel
const lab = new Uint8Array(TRACE_W * H);
for (let i = 0, p = 0; i < data.length; i += 3, p++) {
  let best = 0, bd = Infinity;
  for (let c = 0; c < PALETTE.length; c++) {
    const [r, g, b] = PALETTE[c].rgb;
    const d = (data[i] - r) ** 2 + (data[i + 1] - g) ** 2 + (data[i + 2] - b) ** 2;
    if (d < bd) { bd = d; best = c; }
  }
  lab[p] = best;
}

// connected components, 4-neighbour, per colour
const seen = new Uint8Array(TRACE_W * H);
const comps = [];
for (let y = 0; y < H; y++) for (let x = 0; x < TRACE_W; x++) {
  const p = y * TRACE_W + x;
  if (seen[p] || PALETTE[lab[p]].skip) continue;
  const colour = lab[p];
  const stack = [p]; seen[p] = 1;
  const px = [];
  let minX = x, maxX = x, minY = y, maxY = y;
  while (stack.length) {
    const q = stack.pop(); px.push(q);
    const qx = q % TRACE_W, qy = (q / TRACE_W) | 0;
    if (qx < minX) minX = qx; if (qx > maxX) maxX = qx;
    if (qy < minY) minY = qy; if (qy > maxY) maxY = qy;
    if (qx > 0 && !seen[q - 1] && lab[q - 1] === colour) { seen[q - 1] = 1; stack.push(q - 1); }
    if (qx < TRACE_W - 1 && !seen[q + 1] && lab[q + 1] === colour) { seen[q + 1] = 1; stack.push(q + 1); }
    if (qy > 0 && !seen[q - TRACE_W] && lab[q - TRACE_W] === colour) { seen[q - TRACE_W] = 1; stack.push(q - TRACE_W); }
    if (qy < H - 1 && !seen[q + TRACE_W] && lab[q + TRACE_W] === colour) { seen[q + TRACE_W] = 1; stack.push(q + TRACE_W); }
  }
  if (px.length < MIN_AREA) continue;
  comps.push({ colour: PALETTE[colour].name, px: new Set(px), area: px.length, minX, maxX, minY, maxY });
}

/* Boundary as a rectilinear outline: walk the pixel edges that separate inside
 * from outside. Rectilinear rather than a smoothed contour on purpose - this
 * artwork is square-cornered, and a curve fitter would round the very corners
 * the design system insists on. */
function outline(c) {
  const has = (x, y) => x >= 0 && y >= 0 && x < TRACE_W && y < H && c.px.has(y * TRACE_W + x);
  const edges = new Map();          // "x,y" -> list of next points
  const add = (a, b) => { const k = `${a[0]},${a[1]}`; (edges.get(k) || edges.set(k, []).get(k)).push(b); };
  for (let y = c.minY; y <= c.maxY; y++) for (let x = c.minX; x <= c.maxX; x++) {
    if (!has(x, y)) continue;
    if (!has(x, y - 1)) add([x, y], [x + 1, y]);
    if (!has(x + 1, y)) add([x + 1, y], [x + 1, y + 1]);
    if (!has(x, y + 1)) add([x + 1, y + 1], [x, y + 1]);
    if (!has(x - 1, y)) add([x, y + 1], [x, y]);
  }
  const loops = [];
  while (edges.size) {
    const startK = edges.keys().next().value;
    let cur = startK.split(',').map(Number);
    const loop = [cur];
    while (true) {
      const k = `${cur[0]},${cur[1]}`;
      const nexts = edges.get(k);
      if (!nexts || !nexts.length) { edges.delete(k); break; }
      const nxt = nexts.pop();
      if (!nexts.length) edges.delete(k);
      cur = nxt; loop.push(cur);
      if (cur[0] === loop[0][0] && cur[1] === loop[0][1]) break;
    }
    if (loop.length > 4) loops.push(loop);
  }
  return loops;
}

/* Ramer-Douglas-Peucker. Rectilinear shapes survive untouched because their
 * corners are genuine direction changes; it is the traced curves and diagonals
 * that shed most of their points, and those are exactly what made a handful of
 * covers 40-90 KB of inline path data. */
const rdp = (pts, eps) => {
  if (pts.length < 3) return pts;
  let idx = 0, dmax = 0;
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  const len = Math.hypot(bx - ax, by - ay) || 1;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs((bx - ax) * (ay - pts[i][1]) - (ax - pts[i][0]) * (by - ay)) / len;
    if (d > dmax) { dmax = d; idx = i; }
  }
  if (dmax <= eps) return [pts[0], pts[pts.length - 1]];
  return rdp(pts.slice(0, idx + 1), eps).slice(0, -1).concat(rdp(pts.slice(idx), eps));
};

/* RDP cannot be run straight at a closed loop: its first and last point are the
 * same, so the perpendicular distance is measured against a zero-length line
 * and the whole ring collapses to two points - which is what silently emptied
 * seven covers. Split the ring at the vertex furthest from the start, simplify
 * the two open chains, then rejoin. */
const rdpClosed = (ring, eps) => {
  if (eps <= 0 || ring.length < 8) return ring;
  const pts = ring.slice(0, -1);
  let far = 0, fd = -1;
  for (let i = 1; i < pts.length; i++) {
    const d = (pts[i][0] - pts[0][0]) ** 2 + (pts[i][1] - pts[0][1]) ** 2;
    if (d > fd) { fd = d; far = i; }
  }
  const a = rdp(pts.slice(0, far + 1), eps);
  const b = rdp(pts.slice(far).concat([pts[0]]), eps);
  const out = a.slice(0, -1).concat(b);
  return out.length >= 4 ? out : ring;
};

// collapse runs of collinear points (the staircase) into single segments
const collapse = (pts) => {
  const out = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const a = out[out.length - 1], b = pts[i], c2 = pts[i + 1];
    const cross = (b[0] - a[0]) * (c2[1] - a[1]) - (b[1] - a[1]) * (c2[0] - a[0]);
    if (cross !== 0) out.push(b);
  }
  out.push(pts[pts.length - 1]);
  return out;
};

const SX = meta.width / TRACE_W, SY = meta.height / H;
/* Simplify only as much as the weight demands. These are inlined into the HTML,
 * so a 90 KB path set is a real cost on first paint; a 5 KB one is not worth
 * touching. Start exact, and only coarsen if the result is heavy. */
/* 26k of path data is roughly 26 KB inline, which is acceptable for one
 * drawing per page. 14k was too aggressive: it pushed two motifs to eps 2.25
 * and moved ~6% of their pixels, which is visible. Fidelity first; these
 * still weigh less than the raster they replace. */
const TARGET = flag('target', 26000);
const build = (eps) => {
  const paths = [];
  for (const name of ORDER) {
    for (const c of comps.filter((c) => c.colour === name).sort((a, b) => b.area - a.area)) {
      /* Never simplify a thin shape. RDP measures perpendicular distance, so a
       * 1px grid line is entirely "within tolerance" and collapses to a
       * zero-area sliver that renders as nothing - which is exactly how a
       * calendar grid came out as broken dashes. */
      const thin = Math.min(c.maxX - c.minX, c.maxY - c.minY) < 6;
      const loops = outline(c).map(collapse).map((pts) => rdpClosed(pts, thin ? 0 : eps))
        .filter((pts) => pts.length > 3)
        .map((pts) => 'M' + pts.map(([x, y]) => `${Math.round(x * SX)} ${Math.round(y * SY)}`).join('L') + 'Z');
      if (loops.length) paths.push({ d: loops.join(''), fill: HEX[name], area: c.area });
    }
  }
  return paths;
};
let eps = 0, paths = build(0);
const weight = (ps) => ps.reduce((n, p) => n + p.d.length, 0);
while (weight(paths) > TARGET && eps < 6) { eps += 0.75; paths = build(eps); }
if (eps) console.log(`     simplified at eps ${eps}`);

if (!paths.length) { console.error(`  ${input}: nothing traced`); process.exit(2); }
if (paths.length > 140) { console.error(`  ${input}: ${paths.length} shapes, refusing (not flat art?)`); process.exit(3); }

const body = paths.map((p, i) => `\n  <g class="m" style="--i:${i}"><path d="${p.d}" fill="${p.fill}"/></g>`).join('');
const alt = (process.env.MOTIF_ALT || '').replace(/"/g, '&quot;');
fs.writeFileSync(output,
  `{# Traced from ${input.split('/').pop()} — the original artwork, decomposed into its own\n` +
  `   shapes so each can animate. Regenerate with tools/trace-motif.mjs; do not hand-edit. #}\n` +
  `<svg class="motif" viewBox="0 0 ${meta.width} ${meta.height}" role="img" aria-label="${alt}" xmlns="http://www.w3.org/2000/svg">${body}\n</svg>\n`);
const kb = (fs.statSync(output).size / 1024).toFixed(1);
console.log(`  ${input.split('/').pop().padEnd(30)} -> ${paths.length} shapes, ${kb} KB`);
