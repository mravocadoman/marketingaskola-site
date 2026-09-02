// Drives the header in a real browser. Two specificity traps were hit while
// building it, and both were invisible without measuring: the dropdown is a
// <ul> so `.nav ul` outranks `.dropdown`, and the caret already owns a::after.
import puppeteer from 'puppeteer-core';
import { chromePath } from './_chrome.mjs';

const CHROME = chromePath();
const BASE = process.env.BASE || 'http://localhost:8385';
const R = []; const ok = (n, c, d = '') => R.push({ n, c, d });

const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
const p = await b.newPage();

await p.setViewport({ width: 1440, height: 900 });
await p.goto(BASE + '/', { waitUntil: 'load' });
ok('logo 148px on desktop', await p.$eval('.brand img', e => Math.round(e.getBoundingClientRect().width)) === 148);
ok('topbar is a thin strip', await p.$eval('.topbar-inner', e => Math.round(e.getBoundingClientRect().height)) <= 34);
ok('dropdown hidden at rest', await p.$eval('.nav .dropdown', e => getComputedStyle(e).visibility) === 'hidden');
ok('dropdown keeps its padding', await p.$eval('.nav .dropdown', e => getComputedStyle(e).padding) === '8px');

await p.hover('.nav li.has-children > a');
await new Promise(r => setTimeout(r, 400));
const h = await p.$eval('.nav .dropdown', e => ({ v: getComputedStyle(e).visibility, o: +getComputedStyle(e).opacity }));
ok('hover opens it', h.v === 'visible' && h.o > 0.9, `${h.v}/${h.o}`);

await p.mouse.move(20, 700);
await new Promise(r => setTimeout(r, 450));
ok('closes when the pointer leaves', await p.$eval('.nav .dropdown', e => getComputedStyle(e).visibility) === 'hidden');

await p.evaluate(() => document.querySelector('.nav li.has-children > a').focus());
await new Promise(r => setTimeout(r, 350));
ok('keyboard focus opens it', await p.$eval('.nav .dropdown', e => getComputedStyle(e).visibility) === 'visible');

/* the underline and the caret must be SEPARATE pseudo-elements */
const pseudo = await p.evaluate(() => {
  const a = document.querySelector('.nav li.has-children > a');
  return { before: getComputedStyle(a, '::before').backgroundColor, after: getComputedStyle(a, '::after').borderRightWidth };
});
ok('underline and caret do not collide', pseudo.before.includes('3, 195, 248') && pseudo.after !== '0px', `${pseudo.before} / ${pseudo.after}`);

await p.setViewport({ width: 390, height: 800 });
await p.goto(BASE + '/', { waitUntil: 'load' });
ok('logo 132px on mobile', await p.$eval('.brand img', e => Math.round(e.getBoundingClientRect().width)) === 132);
await p.click('.nav-toggle');
await new Promise(r => setTimeout(r, 250));
const dc = await p.$eval('.nav .dropdown', e => ({ d: getComputedStyle(e).display, h: Math.round(e.getBoundingClientRect().height) }));
ok('mobile submenu starts collapsed', dc.d === 'none' && dc.h === 0, `${dc.d}/${dc.h}px`);
await p.click('.nav li.has-children > a');
await new Promise(r => setTimeout(r, 250));
ok('mobile submenu opens on tap', await p.$eval('.nav .dropdown', e => getComputedStyle(e).display) === 'flex');
ok('mobile indent preserved', await p.$eval('.nav .dropdown', e => getComputedStyle(e).marginLeft) === '16px');
ok('no horizontal overflow', !(await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)));

await b.close();
let bad = 0;
for (const r of R) { if (!r.c) bad++; console.log(`  ${r.c ? 'ok  ' : 'FAIL'} ${r.n.padEnd(36)} ${r.d}`); }
console.log(`\n${R.length - bad}/${R.length} passed`);
process.exit(bad ? 1 : 0);
