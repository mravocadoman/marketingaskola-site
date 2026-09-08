// On-page SEO audit for the built site. `npm run seo`
//
// WHY THIS IS NOT YOSAT-STYLE KEYWORD DENSITY.
// This site's own article `seo-optimizacija-tavam-biznesam` used to teach
// keyword density (1-2,5%) as a ranking factor; that was corrected on 5 Sep
// 2026 because it is an obsolete myth, and the same article was corrected for
// crediting Google with scoring transition words and passive voice, which are
// Yoast plugin criteria and not Google's. Optimising toward a density target
// would put the site in contradiction with its own advice.
//
// So density is REPORTED as information and flagged only above 4%, which is
// the one density fact that is real: stuffing is a spam signal. There is no
// lower bound and no "green light" to chase.
//
// What is scored instead is what actually moved this site in September 2026:
//   - titles Google truncates (five were 78-101 chars and losing the click)
//   - the focus phrase appearing where crawlers weight it: title, h1, opening,
//     a subheading, the slug
//   - CANNIBALISATION - two documents targeting one phrase. This is the check
//     that matters most here: three URLs were bidding for "digitālā mārketinga
//     aģentūra" and the money page had the weakest signals of the three.
//   - internal links out, and whether a post routes to a page that sells
//
// Reads _site, not src, because the rendered <title> comes from `seoTitle` and
// the focus phrase comes from the `keywords` meta - both only exist after a
// build. Run `npm run build` first.
//
//   node tools/seo-audit.mjs            every post
//   node tools/seo-audit.mjs --pages    include the marketing pages
//   node tools/seo-audit.mjs <slug>…    named documents only
//   node tools/seo-audit.mjs --quiet    errors only
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';

const ROOT = path.resolve(import.meta.dirname, '..');
const SITE = path.join(ROOT, '_site');
const argv = process.argv.slice(2);
const FLAG = (n) => argv.includes(`--${n}`);
const QUIET = FLAG('quiet');
const only = argv.filter((a) => !a.startsWith('--'));

if (!fs.existsSync(SITE)) { console.error('No _site. Run `npm run build` first.'); process.exit(1); }

// Latvian inflects heavily: "konversiju uzskaite" appears as "konversiju
// uzskaiti", "atslēgvārds" as "atslēgvārdus". Exact substring matching would
// report false misses on almost every post, so compare on a crude stem and a
// prefix test. This over-matches slightly, which is the right direction for a
// checker that must not cry wolf.
const stem = (w) => (w.length > 5 ? w.slice(0, -3) : w);
const words = (t) => t.toLowerCase().normalize('NFC').match(/[\p{L}\p{N}]+/gu) || [];
// Latvian endings run 1-3 characters ("reklāma" / "reklāmas" / "reklāmām"), so a
// fixed-length chop makes forms of one word disagree. Compare on prefix: two
// words match when either stem starts the other.
const kin = (a, b) => a.startsWith(b) || b.startsWith(a);
const has = (text, phrase) => {
  const t = words(text).map(stem);
  return words(phrase).map(stem).every((w) => t.some((x) => kin(x, w)));
};

const MONEY = ['/pakalpojumi/', '/facebook-reklama/', '/video-reklama/', '/ai-un-automatizacijas/',
  '/marketinga-konsultacijas/', '/digitala-marketinga-kursi/', '/meta-reklamas-kurss/',
  '/google-ads-kurss/', '/seo-kursi/', '/sazinies/', '/'];

// ---- collect documents -----------------------------------------------------
const docs = [];
for (const entry of fs.readdirSync(SITE, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const file = path.join(SITE, entry.name, 'index.html');
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  // Not : the privacy policy uses that layout too. The BlogPosting
  // node in the JSON-LD graph is emitted for articles and nothing else.
  const isPost = html.includes('\"BlogPosting\"');
  if (!isPost && !FLAG('pages')) continue;
  if (only.length && !only.includes(entry.name)) continue;
  docs.push({ slug: entry.name, url: `/${entry.name}/`, html, isPost, root: parse(html) });
}
if (!docs.length) { console.error('nothing to audit'); process.exit(1); }

// Inbound internal links need every page, not just the audited ones.
const inbound = new Map();
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) {
      const from = '/' + path.relative(SITE, p).replace(/index\.html$/, '').replace(/\\/g, '/');
      const body = fs.readFileSync(p, 'utf8');
      const main = body.slice(body.indexOf('<main') > -1 ? body.indexOf('<main') : 0);
      for (const m of main.matchAll(/href="(\/[a-z0-9/-]*\/)"/g)) {
        if (m[1] === from) continue;
        if (!inbound.has(m[1])) inbound.set(m[1], new Set());
        inbound.get(m[1]).add(from);
      }
    }
  }
})(SITE);

// ---- audit -----------------------------------------------------------------
const focusMap = new Map();   // focus phrase -> [slugs]  (cannibalisation)
const results = [];

for (const d of docs) {
  const f = [];
  const add = (level, check, detail) => f.push({ level, check, detail });

  const meta = (n) => d.root.querySelector(`meta[name="${n}"]`)?.getAttribute('content') || '';
  const title = (d.root.querySelector('title')?.text || '').trim();
  const desc = meta('description');
  const kw = meta('keywords').split(',').map((s) => s.trim()).filter(Boolean);
  const focus = kw[0] || '';

  const body = d.root.querySelector('.article-body') || d.root.querySelector('main') || d.root;
  const h1 = (d.root.querySelector('h1')?.text || '').trim();
  const h2s = body.querySelectorAll('h2').map((n) => n.text.trim());
  const prose = body.text.replace(/\s+/g, ' ').trim();
  const wc = words(prose).length;

  // A legal or utility page has no phrase to rank for; only articles must declare one.
  if (!focus) add(d.isPost ? 'error' : 'info', 'focus', 'no `keywords` in front matter, so nothing can be checked against');
  else {
    focusMap.set(focus.toLowerCase(), [...(focusMap.get(focus.toLowerCase()) || []), d.slug]);
    if (!has(title, focus)) add('error', 'focus in title', `"${focus}" missing from <title>`);
    if (!has(h1, focus)) add('warn', 'focus in h1', `"${focus}" missing from the h1`);
    if (!has(prose.slice(0, 900), focus)) add('warn', 'focus in opening', 'not in roughly the first 150 words');
    if (!h2s.some((h) => has(h, focus))) add('info', 'focus in a subheading', 'no h2 carries it');
    if (!has(d.slug.replace(/-/g, ' '), focus)) add('info', 'focus in slug', d.url);
    if (desc && !has(desc, focus)) add('warn', 'focus in description', 'meta description does not carry it');
  }

  // Titles Google truncates. Proven this session: five pages were losing the
  // distinguishing half of their title before the reader ever saw it.
  if (title.length > 60) add('error', 'title length', `${title.length} chars, Google truncates near 60`);
  else if (title.length < 30) add('warn', 'title length', `${title.length} chars, thin`);
  if (!desc) add('error', 'description', 'missing');
  else if (desc.length > 160) add('error', 'description length', `${desc.length} chars, truncated`);
  else if (desc.length < 70) add('warn', 'description length', `${desc.length} chars, under-used`);

  if (wc < 300) add('error', 'thin content', `${wc} words`);

  // Density: reported, never targeted. Only stuffing is a real signal.
  if (focus && wc) {
    const fw = words(focus).map(stem);
    const tw = words(prose).map(stem);
    let hits = 0;
    for (let i = 0; i <= tw.length - fw.length; i++) if (fw.every((w, k) => tw[i + k] === w)) hits++;
    const density = (hits * fw.length) / tw.length * 100;
    add(density > 4 ? 'error' : 'info', 'phrase density',
      `${density.toFixed(2)}% (${hits}×)${density > 4 ? ' — stuffing' : ' — informational, not a target'}`);
  }

  const hrefs = body.querySelectorAll('a').map((a) => a.getAttribute('href') || '');
  const internal = hrefs.filter((h) => h.startsWith('/'));
  if (internal.length < 2) add('warn', 'internal links out', `${internal.length}`);
  if (!internal.some((h) => MONEY.includes(h))) add('warn', 'routes to an offer', 'links no service, course or contact page');
  const inb = inbound.get(d.url)?.size || 0;
  if (inb < 2) add('warn', 'inbound links', `${inb} other pages link here (house rule: 2)`);

  const imgs = body.querySelectorAll('img');
  const noAlt = imgs.filter((i) => !(i.getAttribute('alt') || '').trim()).length;
  if (noAlt) add('warn', 'image alt', `${noAlt} of ${imgs.length} images have none`);

  results.push({ ...d, title, focus, wc, findings: f });
}

// Cannibalisation runs across documents, so it is added after the loop.
for (const [phrase, slugs] of focusMap) {
  if (slugs.length < 2) continue;
  for (const s of slugs) {
    results.find((r) => r.slug === s).findings.push({
      level: 'error', check: 'cannibalisation',
      detail: `"${phrase}" is also targeted by ${slugs.filter((x) => x !== s).join(', ')}`,
    });
  }
}

// ---- report ----------------------------------------------------------------
const ICON = { error: 'ERR ', warn: 'warn', info: 'note' };
let errs = 0, warns = 0;
for (const r of results.sort((a, b) => a.slug.localeCompare(b.slug))) {
  const shown = r.findings.filter((x) => (QUIET ? x.level === 'error' : true));
  errs += r.findings.filter((x) => x.level === 'error').length;
  warns += r.findings.filter((x) => x.level === 'warn').length;
  if (!shown.length) continue;
  console.log(`\n${r.url}${r.focus ? `  ·  focus: "${r.focus}"` : ''}  ·  ${r.wc} words`);
  for (const x of shown) console.log(`  ${ICON[x.level]}  ${x.check.padEnd(22)} ${x.detail}`);
}
console.log(`\n${results.length} documents · ${errs} error(s) · ${warns} warning(s)`);
console.log('Density is reported, never targeted: there is no optimal figure, only stuffing above ~4%.');
process.exit(errs ? 1 : 0);
