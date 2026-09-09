/* Check every traced motif against the raster it came from.
 *
 * A trace is only worth shipping if it still IS the artwork. This renders each
 * include and counts pixels that differ strongly from the original; anything
 * over the threshold is reported so it can keep its raster instead. Cheaper
 * than eyeballing 59 drawings, and it does not get tired.
 */
import puppeteer from 'puppeteer-core';
import { chromePath } from './_chrome.mjs';
import sharp from 'sharp';
import fs from 'node:fs';

const LIMIT = Number((process.argv.find((a) => a.startsWith('--limit=')) || '--limit=3').split('=')[1]);
const pairs = JSON.parse(fs.readFileSync('/tmp/motif-pairs.json', 'utf8'));
const b = await puppeteer.launch({ executablePath: chromePath(), headless: 'new', args: ['--no-sandbox'] });
const bad = [];
for (const [src, name] of pairs) {
  const f = `src/_includes/motifs/${name}.njk`;
  if (!fs.existsSync(f) || !fs.existsSync(`src/img/gen/${src}.webp`)) continue;
  const svg = fs.readFileSync(f, 'utf8').replace(/^\{#[\s\S]*?#\}\n/, '');
  const p = await b.newPage();
  await p.setViewport({ width: 640, height: 427 });
  await p.setContent(`<style>html,body{margin:0;background:#020d1c}svg{display:block;width:640px;height:427px}</style>${svg}`);
  await new Promise((r) => setTimeout(r, 160));
  const shot = await p.screenshot();
  await p.close();
  const a = await sharp(`src/img/gen/${src}.webp`).resize(640, 427, { fit: 'fill' }).removeAlpha().raw().toBuffer();
  const c = await sharp(shot).resize(640, 427, { fit: 'fill' }).removeAlpha().raw().toBuffer();
  /* Two tests, because pixel agreement alone lies on a sparse drawing: a cover
   * that is 95% dark ground "matches" a trace that lost the picture entirely.
   * So also compare how much INK each carries - if the trace kept well under
   * the original's, the artwork did not survive quantisation. */
  const ink = (buf) => { let k = 0; for (let i = 0; i < buf.length; i += 3) {
    if ((0.2126 * buf[i] + 0.7152 * buf[i + 1] + 0.0722 * buf[i + 2]) / 255 > 0.20) k++; } return k; };
  let big = 0; const n = a.length / 3;
  for (let i = 0; i < a.length; i += 3) {
    if (Math.max(Math.abs(a[i] - c[i]), Math.abs(a[i + 1] - c[i + 1]), Math.abs(a[i + 2] - c[i + 2])) > 60) big++;
  }
  const pct = (100 * big) / n;
  const inkA = ink(a), inkB = ink(c);
  const kept = inkA ? inkB / inkA : 1;
  if (pct > LIMIT || kept < 0.8 || kept > 1.3) {
    bad.push({ name, src, pct: pct.toFixed(2), kept: kept.toFixed(2) });
  }
}
await b.close();
console.log(`checked ${pairs.length}, over ${LIMIT}%: ${bad.length}`);
bad.forEach((x) => console.log(`  ${x.name.padEnd(48)} diff ${String(x.pct).padStart(5)}%  ink kept ${x.kept}  (keeps ${x.src}.webp)`));
fs.writeFileSync('/tmp/motif-bad.json', JSON.stringify(bad, null, 2));
