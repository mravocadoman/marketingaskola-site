// Headless screenshots of the local preview via system Chrome (puppeteer-core).
// Usage: node tools/screenshot.mjs <outDir> [pageSpec...]
//   pageSpec: name=path[@width]   e.g. home=/@1440  home-m=/@390  post=/kas-ir-seo/
// Defaults capture the key pages at 1440px plus the homepage at 390px.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const outDir = process.argv[2] || 'shots';
mkdirSync(outDir, { recursive: true });
const BASE = 'http://localhost:8385';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const specs = process.argv.slice(3);
const defaults = [
  'home=/@1440', 'home-m=/@390',
  'pakalpojumi=/pakalpojumi/@1440',
  'konsultacijas=/marketinga-konsultacijas/@1440',
  'post=/kas-ir-seo/@1440',
  'sazinies=/sazinies/@1440',
  'fb-kursi=/facebook-kursi/@1440',
  'blogs=/blogs/@1440',
];
const list = (specs.length ? specs : defaults).map((s) => {
  const [name, rest] = s.split('=');
  const [p, w] = rest.split('@');
  return { name, path: p, width: Number(w || 1440) };
});

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
const page = await browser.newPage();
for (const { name, path, width } of list) {
  await page.setViewport({ width, height: 940, deviceScaleFactor: width < 500 ? 2 : 1 });
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await page.goto(BASE + path, { waitUntil: 'load', timeout: 25000 });
      break;
    } catch (e) {
      console.log('  goto attempt ' + attempt + ' failed: ' + String(e).split('\n')[0]);
      if (attempt === 3) console.log('  GIVING UP on ' + path);
      else await new Promise((r) => setTimeout(r, 1500));
    }
  }
  await page.evaluate(async () => {
    await document.fonts.ready;
    document.querySelectorAll('.reveal').forEach((e) => e.classList.add('in'));
    document.querySelectorAll('.marquee-track').forEach((e) => (e.style.animationPlayState = 'paused'));
    // force-load lazy images so full-page shots don't show gray boxes
    document.querySelectorAll('img[loading="lazy"]').forEach((i) => { i.loading = 'eager'; });
    await Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; })));
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 500));
  // Resize the viewport to the document height and capture that — far more
  // reliable than fullPage for long pages, which Chrome can return blank.
  const h = await page.evaluate(() => document.body.scrollHeight);
  console.log('  docHeight=' + h + ' url=' + page.url() + ' imgs=' + (await page.evaluate(() => document.images.length)));
  const capH = Math.min(h, 15000);
  await page.setViewport({ width, height: capH, deviceScaleFactor: width < 500 ? 2 : 1 });
  await new Promise((r) => setTimeout(r, 350));
  await page.evaluate(() => {
    document.querySelectorAll('.reveal').forEach((e) => e.classList.add('in'));
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 250));
  await page.screenshot({ path: join(outDir, name + '.png') });
  if (h > capH) console.log('  (clipped from ' + h + 'px)');
  console.log('shot', name);
}
await browser.close();
