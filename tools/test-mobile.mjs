// No page may be wider than a phone. Loads every sitemap URL at 390px and
// reports any element that sticks out of the viewport (fixed elements and
// off-screen accessibility helpers excluded) or any page whose scrollWidth
// exceeds the viewport. Usage: BASE=http://localhost:8385 npm run test:mobile
import puppeteer from 'puppeteer-core';
import { chromePath } from './_chrome.mjs';
import { readFileSync } from 'node:fs';
const BASE = (process.env.BASE || 'http://localhost:8385').replace(/\/$/, '');
const WIDTH = Number(process.env.WIDTH || 390);
const locs = [...readFileSync('_site/sitemap.xml', 'utf8').matchAll(/<loc>https:\/\/marketingaskola\.lv([^<]+)<\/loc>/g)].map((m) => m[1]);
const b = await puppeteer.launch({ executablePath: chromePath(), headless: 'new' });
const p = await b.newPage();
await p.setViewport({ width: WIDTH, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const bad = {};
for (const path of locs) {
  await p.goto(BASE + path, { waitUntil: 'load' });
  const r = await p.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const out = [];
    for (const el of document.querySelectorAll('body *')) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.right <= vw + 1) continue;
      const s = getComputedStyle(el);
      if (s.position === 'fixed') continue;
      // inside a scroll container or a clipped ancestor? then it is not a page overflow
      let a = el.parentElement, clipped = false;
      while (a && a !== document.body) { const o = getComputedStyle(a).overflowX; if (o === 'hidden' || o === 'auto' || o === 'scroll' || o === 'clip') { clipped = true; break; } a = a.parentElement; }
      if (clipped) continue;
      out.push(`${el.tagName.toLowerCase()}${typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''} right=${Math.round(rect.right)}`);
    }
    return { sw: document.documentElement.scrollWidth, vw, out: out.slice(0, 5) };
  });
  if (r.sw > r.vw || r.out.length) bad[path] = r;
}
await b.close();
const n = Object.keys(bad).length;
console.log(`${locs.length} pages at ${WIDTH}px: ${n ? n + ' overflow' : 'none wider than the viewport'}`);
for (const [k, v] of Object.entries(bad)) console.log(`  FAIL ${k} scrollWidth=${v.sw}\n     ${v.out.join('\n     ')}`);
process.exit(n ? 1 : 0);
