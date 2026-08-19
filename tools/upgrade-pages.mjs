// One-shot upgrade of generated pages to the v2 design system (Aug 2026):
//  - adds page-hero front matter (heroTitle/heroSub/heroChip) to inner pages
//  - removes the first in-body heading when it duplicates the hero title
//    (the longer of the two texts wins and becomes heroTitle)
//  - drops the first section entirely if that leaves it empty
//  - gives the first Tally-form section id="piesakies" (CTA anchors target it)
//  - repoints links that 404 on the live WordPress site to sensible pages
// Safe to re-run (idempotent-ish): pages that already have heroTitle are skipped.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PAGES = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'pages');
const POSTS = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'posts');

const SKIP = new Set(['index.html', 'sazinies.html', 'pakalpojumi.html']);
const OWN_HERO = new Set(['100-instagram-stories-veidnes.html', 'facebook-kurss-landing.html']);

const CHIPS = {
  'facebook-reklama': 'Pakalpojumi', 'video-reklama': 'Pakalpojumi',
  'socialo-mediju-marketings': 'Pakalpojumi', 'marketinga-konsultacijas': 'Pakalpojumi',
  'digitala-marketinga-kursi': 'Kursi', 'meta-reklamas-kurss': 'Kursi',
  'seo-kursi': 'Kursi', 'tiktok-kursi': 'Kursi', 'facebook-kursi': 'Kursi',
  'portfolio': 'Portfolio', 'produkti': 'Produkti',
  'bezmaksas-e-gramata': 'Bezmaksas e-grāmata', 'vebinars-paldies': 'Paldies',
};
const SPECIAL_TITLES = { 'vebinars-paldies': 'Paldies, vieta rezervēta!' };

const DEAD_LINKS = {
  '/padzilinats-seo-kurss/': '/digitala-marketinga-kursi/',
  '/digitala-marketinga-strategija-vaditajiem/': '/digitala-marketinga-kursi/',
  '/seo-pakalpojumi/': '/pakalpojumi/',
  '/improvizacija-un-izklaide/': '/video-reklama/',
};

const norm = (s) => (s || '').toLowerCase().replace(/<[^>]+>/g, '').replace(/[^\p{L}\p{N} ]/gu, '').replace(/\s+/g, ' ').trim();

for (const f of readdirSync(PAGES).filter((f) => f.endsWith('.html'))) {
  let html = readFileSync(join(PAGES, f), 'utf8');
  const before = html;
  const slug = f.replace(/\.html$/, '');

  for (const [from, to] of Object.entries(DEAD_LINKS)) html = html.split(`"${from}"`).join(`"${to}"`);

  // anchor the first Tally form section
  if (html.includes('tally.so') && !html.includes('id="piesakies"')) {
    const secRe = /<section class="sec[^"]*"/g;
    let m, target = null;
    while ((m = secRe.exec(html))) {
      const secEnd = html.indexOf('</section>', m.index);
      if (html.slice(m.index, secEnd).includes('tally.so')) { target = m; break; }
    }
    if (target) html = html.slice(0, target.index) + target[0].replace('<section ', '<section id="piesakies" ') + html.slice(target.index + target[0].length);
  }

  if (!SKIP.has(f) && !OWN_HERO.has(f) && !/^heroTitle:/m.test(html)) {
    const fmEnd = html.indexOf('---', 4);
    const fm = html.slice(0, fmEnd);
    const title = fm.match(/^title:\s*"(.*)"\s*$/m)?.[1] || '';
    const desc = fm.match(/^description:\s*"(.*)"\s*$/m)?.[1] || '';
    let heroTitle = SPECIAL_TITLES[slug] || title.replace(/\s*[-|–]\s*Mārketinga Skola\s*$/i, '').trim();

    // first heading inside the first section
    const body = html.slice(fmEnd + 4);
    const secStart = body.indexOf('<section');
    const secEnd = body.indexOf('</section>', secStart);
    let newBody = body;
    if (secStart !== -1 && secEnd > secStart) {
      let sec = body.slice(secStart, secEnd);
      const hm = sec.match(/<(h1|h2)>([\s\S]*?)<\/\1>/);
      if (hm) {
        const hText = hm[2].replace(/<[^>]+>/g, '').trim();
        const a = norm(hText), b = norm(heroTitle);
        if (a && b && (a === b || a.startsWith(b) || b.startsWith(a))) {
          if (hText.length > heroTitle.length && !SPECIAL_TITLES[slug]) heroTitle = hText;
          sec = sec.replace(hm[0], '');
          sec = sec.replace(/^(\s*)<div class="divider"><\/div>/m, '$1');
          const inner = sec.replace(/<section[^>]*>/, '');
          const hasContent = /<(img|iframe|details|blockquote|h\d|ul|ol)\b/.test(inner) || norm(inner).length > 0;
          if (!hasContent) {
            newBody = body.slice(0, secStart) + body.slice(secEnd + '</section>'.length);
          } else {
            newBody = body.slice(0, secStart) + sec + body.slice(secEnd);
          }
        }
      }
    }

    const heroLines = [
      `heroTitle: ${JSON.stringify(heroTitle)}`,
      ...(desc ? [`heroSub: ${JSON.stringify(desc)}`] : []),
      ...(CHIPS[slug] ? [`heroChip: ${JSON.stringify(CHIPS[slug])}`] : []),
    ].join('\n');
    html = fm + heroLines + '\n---' + newBody;
  }

  if (html !== before) { writeFileSync(join(PAGES, f), html); console.log('upgraded', f); }
}

for (const f of readdirSync(POSTS).filter((f) => f.endsWith('.md'))) {
  let md = readFileSync(join(POSTS, f), 'utf8');
  const before = md;
  for (const [from, to] of Object.entries(DEAD_LINKS)) md = md.split(`(${from})`).join(`(${to})`).split(`"${from}"`).join(`"${to}"`);
  if (md !== before) { writeFileSync(join(POSTS, f), md); console.log('fixed links in', f); }
}
console.log('done');
