// Drives the homepage hero backdrop in a real browser.
// It is decoration, so what matters is that it stays out of the way: never over
// the headline, inside the hero box, gone under reduced motion and on phones,
// pointer-inert, and hidden from assistive tech.
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE || 'http://localhost:8385';
const R = []; const ok = (n, c, d = '') => R.push({ n, c, d });

const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });

/* --- reduced motion: the layer goes entirely --- */
const p1 = await b.newPage();
await p1.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await p1.setViewport({ width: 1440, height: 900 });
await p1.goto(BASE + '/', { waitUntil: 'load' });
ok('reduced motion: layer removed', await p1.$eval('.hero-fx', (e) => getComputedStyle(e).display) === 'none');

/* --- desktop --- */
const p2 = await b.newPage();
await p2.setViewport({ width: 1440, height: 900 });
await p2.goto(BASE + '/', { waitUntil: 'load' });

const dots = await p2.$$eval('.fx-dot', (n) => n.length);
ok('dots present', dots === 7, `${dots}`);

/* Sampled over time: every visible dot must stay inside the hero and clear of
   the headline, at every point on its path. */
const hero = await p2.$eval('.sec--hero', (e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
let samples = 0, outside = 0, onHeadline = 0, moved = 0;
let prev = null;
for (let t = 0; t < 8; t++) {
  await new Promise((r) => setTimeout(r, 800));
  const s = await p2.evaluate(() => {
    const h1 = document.querySelector('.sec--hero h1').getBoundingClientRect();
    return [...document.querySelectorAll('.fx-dot')].map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, vis: +getComputedStyle(el).opacity > 0.15,
               clash: r.right > h1.left && r.left < h1.right && r.bottom > h1.top && r.top < h1.bottom };
    });
  });
  s.forEach((d, i) => {
    if (!d.vis) return;
    samples++;
    if (d.x < hero.x - 12 || d.x > hero.x + hero.w + 12 || d.y < hero.y - 12 || d.y > hero.y + hero.h + 12) outside++;
    if (d.clash) onHeadline++;
    if (prev && prev[i] && Math.hypot(d.x - prev[i].x, d.y - prev[i].y) > 2) moved++;
  });
  prev = s;
}
ok('dots stay inside the hero', outside === 0, `${outside}/${samples} outside`);
ok('never over the headline', onHeadline === 0, `${onHeadline} clashes`);
ok('dots are actually moving', moved > samples * 0.6, `${moved}/${samples} samples moved`);

const perf = await p2.evaluate(() => new Promise((res) => {
  const f = []; let last = performance.now(); const t0 = last;
  (function tick(now) { f.push(now - last); last = now;
    if (now - t0 < 3000) requestAnimationFrame(tick);
    else res({ fps: Math.round(f.length / 3), long: f.filter((x) => x > 20).length }); })(last);
}));
ok('smooth, no long frames', perf.long === 0, `${perf.fps}fps, ${perf.long} long`);

const z = await p2.evaluate(() => {
  const fx = document.querySelector('.hero-fx');
  const btn = document.querySelector('.sec--hero .btn').getBoundingClientRect();
  const top = document.elementFromPoint(btn.x + btn.width / 2, btn.y + btn.height / 2);
  return { pe: getComputedStyle(fx).pointerEvents, hit: top?.className || top?.tagName };
});
ok('pointer-inert', z.pe === 'none', z.pe);
ok('hero CTA clickable through it', String(z.hit).includes('btn'), String(z.hit));
ok('hidden from assistive tech', await p2.$eval('.hero-fx', (e) => e.getAttribute('aria-hidden')) === 'true');

/* --- mobile: dropped, because slice crops all but a narrow window there --- */
const p3 = await b.newPage();
await p3.setViewport({ width: 390, height: 800 });
await p3.goto(BASE + '/', { waitUntil: 'load' });
ok('mobile: layer removed', await p3.$eval('.hero-fx', (e) => getComputedStyle(e).display) === 'none');
ok('mobile: no horizontal overflow', !(await p3.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)));

await b.close();
let bad = 0;
for (const r of R) { if (!r.c) bad++; console.log(`  ${r.c ? 'ok  ' : 'FAIL'} ${r.n.padEnd(32)} ${r.d}`); }
console.log(`\n${R.length - bad}/${R.length} passed`);
process.exit(bad ? 1 : 0);
