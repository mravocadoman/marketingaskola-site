// Builds the type-scale mapping for tools/apply-type-scale.mjs.
//
// Ten steps: 12 / 14 / 16 / 18 / 22 / 28 / 36 / 48 / 60 / 80 at desktop.
// Arithmetic at the small end (2px apart — perceived difference at small sizes
// tracks absolute pixels, not ratio) and a widening geometric climb above the
// reading step, because display type appears once or twice per viewport and
// needs unmistakable separation.
//
// The display peak is measure-derived rather than ratio-derived: Latvian
// compounds are long, and the stylesheet already caps these headings at 17-18ch,
// so 80 / 60 / 48 are the largest sizes at which a real headline still resolves
// to two lines. That is why the hero comes down from 96 rather than staying.
//
//   node tools/build-type-scale.mjs > scale.json
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CSS = readFileSync(join(ROOT, 'src/css/style.css'), 'utf8');

const tokens = [
  { name: '--t-micro', value: '0.75rem',   px390: 12, px1440: 12, use: 'uppercase tracked micro-labels ONLY' },
  { name: '--t-sm',    value: '0.875rem',  px390: 14, px1440: 14, use: 'fine print, meta, nav, badges, compact UI' },
  { name: '--t-base',  value: '1rem',      px390: 16, px1440: 16, use: 'component body text, inputs, buttons' },
  { name: '--t-body',  value: 'clamp(1rem, 0.94rem + 0.28vw, 1.125rem)', px390: 16, px1440: 18, use: 'page and article reading text' },
  { name: '--t-lead',  value: 'clamp(1.125rem, 1.04rem + 0.35vw, 1.375rem)', px390: 18, px1440: 22, use: 'leads, hero subs, blockquotes' },
  { name: '--t-d1',    value: 'clamp(1.25rem, 1.1rem + 0.62vw, 1.75rem)', px390: 20, px1440: 28, use: 'h3, card and module titles' },
  { name: '--t-d2',    value: 'clamp(1.5rem, 1.27rem + 0.95vw, 2.25rem)', px390: 24, px1440: 36, use: 'article, course and prose h2' },
  { name: '--t-d3',    value: 'clamp(1.875rem, 1.5rem + 1.55vw, 3rem)', px390: 30, px1440: 48, use: 'section h2, cta band, stat numerals' },
  { name: '--t-d4',    value: 'clamp(2.25rem, 1.72rem + 2.15vw, 3.75rem)', px390: 36, px1440: 60, use: 'inner page hero h1' },
  { name: '--t-d5',    value: 'clamp(2.75rem, 1.97rem + 3.2vw, 5rem)', px390: 44, px1440: 80, use: 'home hero h1' },
];

// Role rules, most specific first. Each entry is [matcher, token].
// The matcher sees the selector text and the declared value.
const RULES = [
  // --- display, top down -------------------------------------------------
  [(s) => s === 'h1', '--t-d5'],
  [(s) => s === '.page-hero h1', '--t-d4'],
  [(s) => s === 'h2', '--t-d3'],
  [(s) => s === '.cta-band h2', '--t-d3'],
  [(s) => s === '.stat .num', '--t-d3'],
  [(s) => s === '.counter .num', '--t-d3'],
  [(s) => s === '.course-card .price', '--t-d3'],
  [(s) => s === '.step .step-num', '--t-d3'],
  [(s) => s === '.testimonial::before', '--t-d3'],
  [(s) => /\.(article-body )?\.?prose h2|\.course-body h2/.test(s), '--t-d2'],
  [(s) => s === '.cta h3', '--t-d2'],
  [(s) => s === '.footer-brand .wordmark', '--t-d1'],

  // --- headings and titles ----------------------------------------------
  [(s) => s === 'h3' || s === 'h4', '--t-d1'],
  [(s) => /h3$/.test(s), '--t-d1'],                      // card/module/step/team titles
  [(s) => /prose h3$/.test(s), '--t-d1'],

  // --- reading ------------------------------------------------------------
  [(s) => s === 'body', '--t-body'],
  [(s) => s === '.prose' || s === '.article-body .prose', '--t-body'],
  [(s) => /first-of-type/.test(s), '--t-lead'],
  [(s) => s === '.lead' || s === '.sec--hero .sub' || s === '.page-hero .sub', '--t-lead'],
  [(s) => s === '.sec-head .lead', '--t-lead'],
  [(s) => /blockquote$/.test(s), '--t-lead'],

  // --- uppercase tracked micro-labels: ONE size, this is the big cleanup --
  [(_s, _v, body) => /text-transform:\s*uppercase/.test(body) && /letter-spacing/.test(body), '--t-micro'],
  [(s) => /(\.eyebrow|\.caption|\.marquee-label|\.post-card \.date|\.course-tag|\.price-label|figcaption|\.toc h4|\.footer h4|\.cell-idx|\.stat \.label|\.chip)$/.test(s), '--t-micro'],

  // --- component body -----------------------------------------------------
  [(s) => s === '.btn', '--t-base'],
  [(s) => /^\.form (input|select|textarea)/.test(s) || /^\.form input/.test(s), '--t-base'],
  [(s) => s === '.faq summary', '--t-base'],
  [(s) => /\.(cell|blurb|step|post-card|instructor-card) p$/.test(s), '--t-base'],
  [(s) => s === '.testimonial .t-body' || s === '.testimonial footer strong', '--t-base'],
  [(s) => s === '.course-card .price small', '--t-base'],
  [(s) => /(who strong)$/.test(s), '--t-base'],
  [(s) => /tick-list li$/.test(s), '--t-base'],
  [(s) => s === '.course-facts li', '--t-base'],

  // --- compact UI and fine print -----------------------------------------
  [(s) => /^\.nav a/.test(s), '--t-sm'],
  // These three sat behind a comment and were invisible to the first pass.
  [(s) => s === '.footer' || s === '.toc' || s === '.article-meta', '--t-sm'],
  [(s) => /(btn--sm|arrow-link|chip-link|chips li|chips span|badge)$/.test(s), '--t-sm'],
  [(s) => /(\.small|\.fine|\.hint|field-error|form-note|form-status|post-meta|footer-bottom|author-strip span|topbar|\.field > label|form-consent span)$/.test(s), '--t-sm'],
  [(s) => /(team-card p|funding p|blurb blockquote a|post-card \.more|instructor-card \.arrow-link)$/.test(s), '--t-sm'],
  [(s) => s === '.funding p strong', '--t-micro'],
  [(s) => s === 'h5', '--t-micro'],
  [(s) => s === '.divider', '--t-micro'],
];

// Extract every (selector, declared, body) triple exactly as the applier will.
const mapping = [];
const unresolved = [];
for (const m of CSS.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  // A rule preceded by a comment captures that comment into the selector group.
  // Strip it, or the guard below skips the whole rule.
  const sel = m[1].replace(/\/\*[\s\S]*?\*\//g, '').trim().replace(/\s+/g, ' ');
  if (sel.startsWith('@') || sel.startsWith('/*')) continue;
  const fs = [...m[2].matchAll(/(?:^|;)\s*font-size:\s*([^;]+)/g)].pop();
  if (!fs) continue;
  const declared = fs[1].replace(/\s+/g, ' ').trim();
  if (declared.startsWith('var(')) continue;

  let token = null;
  for (const [match, t] of RULES) {
    try { if (match(sel, declared, m[2])) { token = t; break; } } catch { /* rule not applicable */ }
  }
  if (!token) { unresolved.push({ sel, declared }); continue; }
  const old = parseFloat(declared) * (declared.includes('rem') ? 16 : 1);
  const now = tokens.find((t) => t.name === token).px1440;
  mapping.push({
    selector: sel, declared, token,
    change: Number.isNaN(old) ? 'unchanged' : now > old + 0.5 ? 'raised' : now < old - 0.5 ? 'lowered' : 'unchanged',
  });
}

if (unresolved.length) {
  console.error(`UNRESOLVED (${unresolved.length}):`);
  unresolved.forEach((u) => console.error(`  ${u.sel}  ->  ${u.declared}`));
  process.exit(1);
}

const counts = mapping.reduce((a, m) => ((a[m.change] = (a[m.change] || 0) + 1), a), {});
console.error(`${mapping.length} declarations mapped onto ${tokens.length} tokens: ` +
  Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', '));
console.log(JSON.stringify({ tokens, mapping }, null, 2));
