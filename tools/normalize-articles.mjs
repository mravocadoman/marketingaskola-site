// Normalises the migrated blog posts so article typography comes from the
// design system instead of from whatever WordPress happened to emit.
//
// The core defect: every post carries raw `<h2 id="1">` HTML from the import,
// and markdown-it does not parse inline markdown inside a raw HTML block — so
// `**1.** **Iejuties lasitaja loma**` reached the reader as literal asterisks.
// Converting the headings to real markdown both fixes the bold and gives each
// section a meaningful slug anchor (withAnchors slugifies, toc follows).
//
//   node tools/normalize-articles.mjs [--dry]
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'src/posts');
const DRY = process.argv.includes('--dry');

// Inline emphasis that survived the import in a broken state.
const INLINE_FIXES = [
  // "**_epicentrs._**" -> "**epicentrs.**"  (doubled emphasis renders as noise)
  [/\*\*_([^_*]+)_\*\*/g, '**$1**'],
  // "**Piemers_:_**" -> "**Piemers:**"      (emphasis wrapped around punctuation)
  [/_([:;,.!?])_/g, '$1'],
  // "3\." -> "3."                          (escaped period from the exporter)
  [/(\d)\\\./g, '$1.'],
  // "**Instagram:**Attelu" -> "**Instagram:** Attelu".
  // CommonMark will not let a closing ** run that sits between punctuation and
  // a letter close the emphasis, so these reached the reader as literal
  // asterisks. The missing space is a real typo in the source either way.
  [/\*\*([^*\n]+[.:;!?])\*\*(?=[A-Za-zĀČĒĢĪĶĻŅŠŪŽāčēģīķļņšūž0-9])/g, '**$1** '],
];

const stats = { headings: 0, inline: 0, files: 0 };
const report = [];

for (const f of readdirSync(DIR).filter((x) => x.endsWith('.md'))) {
  const path = join(DIR, f);
  const src = readFileSync(path, 'utf8');
  const fmEnd = src.indexOf('---', 3) + 3;
  const fm = src.slice(0, fmEnd);
  let body = src.slice(fmEnd);
  const before = body;
  const changes = [];

  // 1. raw heading tags -> markdown headings.
  //    Only when the inner content is inline-level; a heading containing block
  //    markup is left alone rather than mangled.
  body = body.replace(/<h([234])(\s[^>]*)?>([\s\S]*?)<\/h\1>/g, (m, level, _attrs, inner) => {
    if (/<(?:div|p|ul|ol|table|figure|h[1-6])\b/i.test(inner)) return m;
    let text = inner
      .replace(/\*\*/g, '')          // headings are already bold; markers are noise
      .replace(/(^|\s)_([^_]+)_(\s|$)/g, '$1$2$3')
      .replace(/\\\./g, '.')
      .replace(/\s+/g, ' ')
      .trim();
    if (!text) return m;
    stats.headings++;
    changes.push(`h${level}: ${text.slice(0, 58)}`);
    return `${'#'.repeat(Number(level))} ${text}`;
  });

  // 2. inline emphasis artifacts
  for (const [re, to] of INLINE_FIXES) {
    body = body.replace(re, (...a) => { stats.inline++; return to.replace(/\$(\d)/g, (_, n) => a[Number(n)]); });
  }

  // 3. Headings must be surrounded by blank lines or markdown-it treats the
  //    following text as part of the same block.
  body = body.replace(/([^\n])\n(#{2,4} )/g, '$1\n\n$2').replace(/(#{2,4} [^\n]+)\n([^\n#])/g, '$1\n\n$2');

  if (body !== before) {
    stats.files++;
    report.push({ f, n: changes.length, changes: changes.slice(0, 3) });
    if (!DRY) writeFileSync(path, fm + body, 'utf8');
  }
}

for (const r of report) {
  console.log(`${String(r.n).padStart(3)} headings  ${r.f}`);
  r.changes.forEach((c) => console.log(`              ${c}`));
}
console.log(`\n${stats.headings} headings converted, ${stats.inline} inline fixes, ${stats.files} files${DRY ? ' (dry run)' : ''}`);
