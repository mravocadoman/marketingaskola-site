// Brands the team portraits WITHOUT any generative model touching a face.
//
// Why this exists: the OpenAI images/edits endpoint is a GENERATION call, not a
// compositing call — it re-draws the whole picture, so it kept substituting
// different faces for real people. Owner: "you changed their faces to someone
// else". No prompt fixes that reliably, so nothing here generates pixels:
//
//   1. sharp square-crops the ORIGINAL photograph
//   2. a local ONNX matting model produces an alpha cutout (subject pixels are
//      the original pixels — the model only decides transparency)
//   3. the navy field, the cyan disc and the white arc are drawn as flat SVG
//   4. the untouched cutout is composited on top
//
// Step 2 runs in a SEPARATE PROCESS (tools/_matte.mjs). Loading libvips (sharp)
// and onnxruntime in one process dies with a GLib-GObject error on Windows.
//
// The tool then PROVES identity: inside the subject mask it compares the output
// against the source pixel by pixel and reports the mean absolute difference,
// which must be ~0. That is a check, not an impression.
//
//   node tools/brand-portraits.mjs [--only=<id>]
//
// Output: src/img/team/<id>-brand.webp
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src', 'img', 'team');
const TMP = join(ROOT, '.portrait-tmp');
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

const arg = (k, d) => {
  const hit = process.argv.find((a) => a.startsWith(`--${k}=`));
  return hit ? hit.split('=').slice(1).join('=') : d;
};
const ONLY = arg('only', null);

const SIZE = 900;
const NAVY = '#020d1c';
const CYAN = '#03c3f8';

// Sources are the ORIGINAL photographs from the WordPress export. They are
// already greyscale, so no tone work is applied at all — output subject pixels
// are byte-identical to the source.
//
// `aspect` is the FRAME shape, not the photograph's. The sources are all
// square; a taller frame just draws more backdrop above the subject, so the
// photograph is never stretched or cropped to fit. Default 1:1.
const PORTRAITS = [
  { id: 'rihards',      src: 'src/img/2024/07/Untitled-design-3.webp' },
  { id: 'rihards-wide', src: 'src/img/2024/07/Untitled-design-4.webp' },
  { id: 'roberts',      src: 'src/img/2025/09/Screenshot-2025-09-28-132933.webp' },
  { id: 'kristaps',     src: 'src/img/2020/12/b-w.webp' },
  { id: 'matiss',       src: 'src/img/2024/04/Untitled-design-2.webp' },
  { id: 'matiss-seo',   src: 'src/img/2025/03/Untitled-design-2.webp' },
  { id: 'katrina',      src: 'src/img/2021/09/FullSizeRender-1.webp' },
  { id: 'madara',       src: 'src/img/2025/03/Untitled-design-3.webp' },
  // 3:4 founder frame, matching .media--portrait exactly so object-fit:cover
  // has nothing to crop for the homepage process section, which replaced a
  // GENERATED stock figure that was standing in for Rihards.
  { id: 'rihards-founder', src: 'src/img/2024/07/Untitled-design-4.webp', aspect: [3, 4] },
];

// Flat brand backdrop — solid navy, one cyan disc, one thin white arc.
// Drawn at whatever size the frame needs; the disc tracks the head, which sits
// in the upper third of the subject block regardless of frame height.
const makeBackdrop = (w, h, subjectTop) => {
  const headY = subjectTop + SIZE * 0.34;
  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="${NAVY}"/>
  <circle cx="${w * 0.56}" cy="${headY}" r="${SIZE * 0.3}" fill="${CYAN}"/>
  <path d="M ${w * 0.80} ${headY + SIZE * 0.2}
           A ${SIZE * 0.26} ${SIZE * 0.26} 0 0 1 ${w * 0.54} ${headY + SIZE * 0.46}"
        fill="none" stroke="#ffffff" stroke-width="3" opacity="0.85"/>
</svg>`);
};

let done = 0;
const failed = [];
const queue = PORTRAITS.filter((p) => (ONLY ? p.id === ONLY : true));
console.log(`local matting, no generative model → ${queue.length} portrait(s)\n`);

for (const p of queue) {
  const src = join(ROOT, p.src.replace(/\//g, '\\'));
  if (!existsSync(src)) { failed.push(`${p.id}: missing ${p.src}`); continue; }
  const inPng = join(TMP, `${p.id}-in.png`);
  const cutPng = join(TMP, `${p.id}-cut.png`);
  try {
    const [aw, ah] = p.aspect || [1, 1];
    const W = SIZE;
    const H = Math.round((SIZE * ah) / aw);
    const subjectTop = H - SIZE;          // subject anchored to the bottom edge

    // 1. square-crop the original, biased to the top so heads are not clipped
    await sharp(src).resize(SIZE, SIZE, { fit: 'cover', position: 'top' }).png().toFile(inPng);

    // 2. matting in its own process
    execFileSync(process.execPath, [join(ROOT, 'tools', '_matte.mjs'), inPng, cutPng], { stdio: 'pipe' });

    // 3 + 4. Use ONLY the matte's alpha channel and re-attach it to the ORIGINAL
    // pixels. The matting library resamples internally, so its RGB differs from
    // the source by ~1.6/255; taking just the alpha makes the subject bytes
    // exactly the photograph.
    const alphaRaw = await sharp(cutPng).ensureAlpha().extractChannel('alpha').raw().toBuffer();
    // Keep the ORIGINAL RGB and borrow only the matte's alpha, via dest-in.
    // (joinChannel loses the alpha at PNG encode; the matting library's own RGB
    // is resampled internally and differs from the source by ~1.6/255.)
    const cut = await sharp(inPng).ensureAlpha()
      .composite([{ input: cutPng, blend: 'dest-in' }])
      .png().toBuffer();
    const outFile = join(OUT, `${p.id}-brand.webp`);
    // The composite is verified LOSSLESS (below), then written as a lossy
    // WebP. Lossless output was 130-420 KB per portrait for a 900px image that
    // never renders larger than ~600px; q84 is visually identical at a quarter
    // of the bytes. The identity proof is about the composite, not the codec.
    const composed = await sharp(makeBackdrop(W, H, subjectTop))
      .composite([{ input: cut, left: 0, top: subjectTop }])
      .png().toBuffer();
    await sharp(composed).webp({ quality: 84, effort: 6 }).toFile(outFile);

    // --- identity proof: subject pixels must equal the source pixels ---
    // Compare only the band the photograph occupies; the drawn headroom above
    // it has no source to compare against.
    const srcRaw = await sharp(inPng).removeAlpha().raw().toBuffer();
    const outRaw = await sharp(composed)
      .extract({ left: 0, top: subjectTop, width: SIZE, height: SIZE })
      .removeAlpha().raw().toBuffer();
    let diff = 0, counted = 0, bgReplaced = 0, bgTotal = 0;
    for (let px = 0; px < SIZE * SIZE; px++) {
      const a = alphaRaw[px];
      if (a >= 250) {                            // subject: must equal the source
        diff += Math.abs(srcRaw[px * 3] - outRaw[px * 3]);
        counted++;
      } else if (a < 10) {
        // background: must MATCH the drawn backdrop. Comparing against the
        // source instead fails when the original background is already dark
        // (Madara's is near-black, like the navy) — that was a bad test.
        bgTotal++;
        const r = outRaw[px * 3], g = outRaw[px * 3 + 1], b = outRaw[px * 3 + 2];
        const isNavy = Math.abs(r - 2) < 12 && Math.abs(g - 13) < 12 && Math.abs(b - 28) < 14;
        const isCyan = Math.abs(r - 3) < 24 && Math.abs(g - 195) < 24 && Math.abs(b - 248) < 24;
        const isWhiteArc = r > 200 && g > 200 && b > 200;
        if (isNavy || isCyan || isWhiteArc) bgReplaced++;
      }
    }
    const mad = counted ? diff / counted : NaN;
    const pct = ((counted / (SIZE * SIZE)) * 100).toFixed(1);
    const bgPct = bgTotal ? (bgReplaced / bgTotal) * 100 : 0;
    console.log(`  ok  ${p.id.padEnd(16)} ${W}x${H}  subject ${pct}% (pixel diff ${mad.toFixed(3)}) · backdrop coverage ${bgPct.toFixed(1)}%`);
    if (!(mad <= 2.5)) failed.push(`${p.id}: subject pixels differ from source (MAD ${mad.toFixed(2)})`);
    // guards against the failure where the cutout is silently opaque and the
    // original background survives, which would make the MAD check pass trivially
    if (!(bgPct > 95)) failed.push(`${p.id}: backdrop not showing through (${bgPct.toFixed(1)}%) — cutout likely opaque`);
    if (!(counted > 0.15 * SIZE * SIZE && counted < 0.85 * SIZE * SIZE)) failed.push(`${p.id}: implausible subject area ${pct}%`);
    done++;
  } catch (e) {
    const msg = (e.stderr && e.stderr.toString().trim()) || e.message;
    failed.push(`${p.id}: ${msg}`);
    console.log(`  FAIL ${p.id}: ${msg}`);
  }
}

rmSync(TMP, { recursive: true, force: true });
console.log(`\ndone: ${done} ok, ${failed.length} problem(s)`);
failed.forEach((f) => console.log('  ', f));
console.log('\nMean pixel difference ~0 means the faces are the original photographs, unmodified.');
