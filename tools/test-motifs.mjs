// Every motif on the site, in a real browser.
// A motif is the real picture split into its own pieces (tools/build-motifs.mjs).
// What matters: header pieces animate on load, in-page ones wait until they are
// scrolled to, every one ENDS on the picture it came from, and nothing is left
// invisible with JS off or under reduced motion.
//
// Pages come from the built output, so a new page with a motif is covered
// without touching this file. Usage:
//   npm run build && npm run serve   (then)   npm run test:motifs
//   BASE=https://marketingaskola.lv npm run test:motifs
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { chromePath } from './_chrome.mjs';

const BASE = (process.env.BASE || 'http://localhost:8385').replace(/\/$/, '');
const R = []; const ok = (n, c, d = '') => R.push({ n, c, d });

const pages = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f === 'index.html' && fs.readFileSync(p, 'utf8').includes('motif--pieces')) {
      const rel = path.relative('_site', d).split(path.sep).join('/');
      pages.push(rel ? `/${rel}/` : '/');
    }
  }
})('_site');

const b = await puppeteer.launch({ executablePath: chromePath(), headless: 'new', args: ['--no-sandbox'] });
// Sticky chrome and floating widgets would sit on top of a screenshot.
const CALM = '.topbar,.header{position:static!important}.wa-float,.consent,.lm,.back-to-top{display:none!important}';

/* Worst 16px block, pieces against ONE unclipped copy of the same image in the
   SAME svg - only the clipping differs, so this measures the pieces and nothing
   else (an <img> resamples at a different sub-pixel phase and reads 10-25/255
   "off" when nothing is wrong). */
const worstBlock = async (a, c) => {
  const { width: w, height: h } = await sharp(a).metadata();
  const A = await sharp(a).removeAlpha().raw().toBuffer(), C = await sharp(c).removeAlpha().raw().toBuffer();
  let worst = 0;
  for (let by = 0; by < h; by += 16) for (let bx = 0; bx < w; bx += 16) {
    let s = 0, k = 0;
    for (let y = by; y < Math.min(h, by + 16); y++) for (let x = bx; x < Math.min(w, bx + 16); x++) {
      const i = (y * w + x) * 3; k++;
      s += Math.max(Math.abs(A[i] - C[i]), Math.abs(A[i + 1] - C[i + 1]), Math.abs(A[i + 2] - C[i + 2]));
    }
    worst = Math.max(worst, s / k);
  }
  return worst;
};

let checked = 0, motifs = 0, skipped = [];
for (const url of pages) {
  for (const [view, vp] of [['desktop', { width: 1360, height: 900 }], ['phone', { width: 375, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]]) {
    const p = await b.newPage();
    await p.setViewport(vp);
    const res = await p.goto(BASE + url, { waitUntil: 'domcontentloaded' });
    if (res.status() !== 200) { skipped.push(`${url} (${res.status()})`); await p.close(); break; }
    // First frame: every header piece holds a running motif-in; every in-page
    // piece below the fold is held invisible until its card is revealed.
    const first = await p.evaluate(() => new Promise((done) => requestAnimationFrame(() => {
      const hero = document.querySelector('.hero-media svg.motif--pieces');
      const heroParts = hero ? hero.querySelectorAll('.m').length : 0;
      const heroAnims = hero ? document.getAnimations().filter((a) => a.animationName === 'motif-in' && hero.contains(a.effect.target)).length : 0;
      const below = [...document.querySelectorAll('.motif--scroll svg.motif--pieces, svg.motif--pieces.motif--scroll')]
        .filter((s) => s.getBoundingClientRect().top > innerHeight);
      const leaked = below.filter((s) => [...s.querySelectorAll('.m')].some((g) => getComputedStyle(g).opacity !== '0')).length;
      const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
      const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
      done({ heroParts, heroAnims, below: below.length, leaked, dup });
    })));
    if (first.heroParts) ok(`${view} ${url} header pieces animate`, first.heroAnims === first.heroParts, `${first.heroAnims}/${first.heroParts}`);
    if (view === 'phone') { await p.close(); continue; }
    ok(`${url} in-page motifs wait for the scroll`, first.leaked === 0, `${first.leaked}/${first.below} visible early`);
    ok(`${url} ids unique`, first.dup.length === 0, first.dup.slice(0, 3).join(' '));

    // Reveal every motif, finish every animation, then compare each finished
    // frame with its own picture.
    await p.addStyleTag({ content: CALM });
    const n = await p.$$eval('svg.motif--pieces', (s) => s.length);
    for (let i = 0; i < n; i++) {
      await p.evaluate((i) => document.querySelectorAll('svg.motif--pieces')[i].scrollIntoView({ block: 'center', behavior: 'instant' }), i);
      await p.waitForFunction((i) => { const r = document.querySelectorAll('svg.motif--pieces')[i].closest('.reveal'); return !r || r.classList.contains('in'); }, { timeout: 5000 }, i).catch(() => {});
    }
    await p.waitForNetworkIdle({ idleTime: 300 }).catch(() => {});
    await p.evaluate(() => document.getAnimations().forEach((a) => { try { a.finish(); } catch { a.cancel(); } }));
    const els = await p.$$('svg.motif--pieces');
    const piecesShots = [];
    for (const el of els) piecesShots.push(await el.screenshot());
    await p.evaluate(() => document.querySelectorAll('svg.motif--pieces').forEach((s) => {
      const im = s.querySelector('image').cloneNode(); im.removeAttribute('clip-path');
      s.querySelectorAll('.m').forEach((g) => g.remove()); s.appendChild(im);
    }));
    await p.waitForNetworkIdle({ idleTime: 300 }).catch(() => {});
    for (const [k, el] of els.entries()) {
      const w = await worstBlock(await el.screenshot(), piecesShots[k]);
      ok(`${url} motif ${k + 1} ends on its picture`, w <= 4, `${w.toFixed(1)}/255`);
    }
    motifs += els.length; checked++;
    await p.close();
  }
}

/* With JS off nothing may stay held, and under reduced motion nothing moves. */
const hub = '/pakalpojumi/';
const nojs = await b.newPage(); await nojs.setJavaScriptEnabled(false); await nojs.setViewport({ width: 1360, height: 900 });
await nojs.goto(BASE + hub, { waitUntil: 'load' }); await new Promise((r) => setTimeout(r, 3000));
ok('JS off: every piece visible', await nojs.evaluate(() => [...document.querySelectorAll('svg.motif--pieces .m')].every((g) => getComputedStyle(g).opacity === '1')));
const rm = await b.newPage(); await rm.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]); await rm.setViewport({ width: 1360, height: 900 });
await rm.goto(BASE + hub, { waitUntil: 'load' });
ok('reduced motion: every piece visible, none animating', await rm.evaluate(() =>
  [...document.querySelectorAll('svg.motif--pieces .m')].every((g) => getComputedStyle(g).opacity === '1')
  && !document.getAnimations().some((a) => a.effect?.target?.closest?.('svg.motif--pieces'))));
await b.close();

const bad = R.filter((r) => !r.c);
console.log(`${checked} pages, ${motifs} motifs, ${R.length} checks against ${BASE}` + (skipped.length ? ` - not served there: ${skipped.join(', ')}` : ''));
for (const r of bad) console.log(`  FAIL ${r.n}${r.d ? ` - ${r.d}` : ''}`);
console.log(bad.length ? `${bad.length} failed` : 'all passed');
process.exit(bad.length ? 1 : 0);
