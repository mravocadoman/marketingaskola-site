// Drives the homepage hero backdrop in a real browser.
// The lattice sits behind the headline, so the things worth asserting are that
// it stays out of the way: no motion under prefers-reduced-motion, fewer moving
// parts on a phone, pointer-inert, and hidden from assistive tech.
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE || 'http://localhost:8385';
const R = []; const ok = (n, c, d = '') => R.push({ n, c, d });

const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });

const p1 = await b.newPage();
await p1.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await p1.setViewport({ width: 1440, height: 780 });
await p1.goto(BASE + '/', { waitUntil: 'load' });
const anim = await p1.evaluate(() => [...document.querySelectorAll('.hero-fx *')]
  .filter((e) => getComputedStyle(e).animationName !== 'none').length);
ok('reduced motion: nothing animates', anim === 0, `${anim} animated`);
ok('reduced motion: lattice still drawn', await p1.$eval('.hero-fx', (e) => getComputedStyle(e).opacity) === '1');

const p2 = await b.newPage();
await p2.setViewport({ width: 1440, height: 780 });
await p2.goto(BASE + '/', { waitUntil: 'load' });
const perf = await p2.evaluate(() => new Promise((res) => {
  const f = []; let last = performance.now(); const t0 = last;
  (function tick(now) { f.push(now - last); last = now;
    if (now - t0 < 3000) requestAnimationFrame(tick);
    else res({ fps: Math.round(f.length / 3), long: f.filter((x) => x > 20).length }); })(last);
}));
ok('smooth (no long frames)', perf.long === 0, `${perf.fps}fps, ${perf.long} long`);

const z = await p2.evaluate(() => {
  const fx = document.querySelector('.hero-fx');
  const btn = document.querySelector('.sec--hero .btn').getBoundingClientRect();
  const top = document.elementFromPoint(btn.x + btn.width / 2, btn.y + btn.height / 2);
  return { pe: getComputedStyle(fx).pointerEvents, hit: top?.className || top?.tagName };
});
ok('lattice is pointer-inert', z.pe === 'none', z.pe);
ok('hero CTA clickable through it', String(z.hit).includes('btn'), String(z.hit));
ok('hidden from assistive tech', await p2.$eval('.hero-fx', (e) => e.getAttribute('aria-hidden')) === 'true');

const p3 = await b.newPage();
await p3.setViewport({ width: 390, height: 800 });
await p3.goto(BASE + '/', { waitUntil: 'load' });
const m = await p3.evaluate(() => ({
  edges: getComputedStyle(document.querySelector('.fx-edge')).display,
  sweep: getComputedStyle(document.querySelector('.fx-sweep')).display,
  signals: [...document.querySelectorAll('.fx-signals rect')].filter((e) => getComputedStyle(e).display !== 'none').length,
  overflow: document.documentElement.scrollWidth > window.innerWidth,
}));
ok('mobile: edges hidden', m.edges === 'none', m.edges);
ok('mobile: sweep hidden', m.sweep === 'none', m.sweep);
ok('mobile: fewer signals', m.signals <= 3, `${m.signals} visible`);
ok('mobile: no horizontal overflow', !m.overflow);

await b.close();
let bad = 0;
for (const r of R) { if (!r.c) bad++; console.log(`  ${r.c ? 'ok  ' : 'FAIL'} ${r.n.padEnd(34)} ${r.d}`); }
console.log(`\n${R.length - bad}/${R.length} passed`);
process.exit(bad ? 1 : 0);
