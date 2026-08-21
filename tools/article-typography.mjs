// A second, wider pass over article typography — the things the defect scanner
// was not told to look for.
//
// tools/article-defects.mjs checks the built HTML for markdown that failed to
// parse. This one checks the SOURCE for structure that parses fine but is still
// typographically inconsistent: fake headings, skipped heading levels, mixed
// list markers, leftover escapes and stray whitespace.
//
//   node tools/article-typography.mjs [--fix]
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'src/posts');
const FIX = process.argv.includes('--fix');

const findings = {};
const note = (kind, file, detail) => ((findings[kind] ||= []).push({ file, detail }));

for (const f of readdirSync(DIR).filter((x) => x.endsWith('.md'))) {
  const path = join(DIR, f);
  const src = readFileSync(path, 'utf8');
  const fmEnd = src.indexOf('---', 3) + 3;
  const fm = src.slice(0, fmEnd);
  let body = src.slice(fmEnd);
  const before = body;

  // 1. A paragraph that is entirely bold is a heading wearing a disguise.
  //    WordPress exports are full of these and they break the type hierarchy.
  for (const m of body.matchAll(/(^|\n\n)\*\*([^*\n]{3,80})\*\*(?=\n\n|\n*$)/g)) {
    note('fake-heading', f, `"${m[2].slice(0, 60)}" is a bold paragraph, not a heading`);
  }

  // 2. Heading levels that skip a rung (h2 -> h4) read as a hierarchy error.
  const levels = [...body.matchAll(/^(#{2,6}) /gm)].map((m) => m[1].length);
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] > levels[i - 1] + 1) note('heading-skip', f, `h${levels[i - 1]} followed by h${levels[i]}`);
  }
  if (levels.length && levels[0] !== 2) note('heading-start', f, `first heading is h${levels[0]}, expected h2`);

  // 3. Mixed list markers inside one file.
  const markers = new Set([...body.matchAll(/^(\s*)([-*+])\s/gm)].map((m) => m[2]));
  if (markers.size > 1) note('mixed-list-markers', f, `uses ${[...markers].join(' and ')}`);

  // 4. Leftover exporter escapes that render as visible backslashes.
  for (const m of body.matchAll(/\\([.\-*_[\]()#+!])/g)) {
    note('leftover-escape', f, `\\${m[1]}`);
  }

  // 5. Non-breaking spaces and other invisible whitespace.
  if (/ /.test(body)) note('nbsp', f, `${(body.match(/ /g) || []).length} non-breaking space(s)`);
  if (/[ \t]+$/m.test(body)) note('trailing-space', f, 'lines with trailing whitespace');

  // 6. Three or more blank lines in a row.
  if (/\n{4,}/.test(body)) note('blank-run', f, 'run of blank lines');

  // 7. A bare URL used as its own link text.
  for (const m of body.matchAll(/\[(https?:\/\/[^\]]+)\]\(/g)) note('raw-url-text', f, m[1].slice(0, 50));

  // 8. Emphasis markers inside a markdown heading. A heading is already bold,
  //    so the ** is redundant and renders as a nested <strong>.
  for (const m of body.matchAll(/^#{2,6} .*(\*\*|__).*$/gm)) {
    note('heading-with-emphasis', f, m[0].slice(0, 62));
  }

  // 9. Bold opened on one line and closed on the next. CommonMark will not
  //    match across the break, so the asterisks show.
  for (const m of body.matchAll(/\*\*[^*\n]{2,80}\n\*\*/g)) {
    note('bold-across-linebreak', f, m[0].replace(/\n/g, '\\n').slice(0, 62));
  }

  // 10. A whole sentence used as a heading — usually a paragraph that was
  //     accidentally given a # prefix during the import.
  for (const m of body.matchAll(/^#{2,6} (.{75,})$/gm)) {
    note('sentence-heading', f, m[1].slice(0, 62) + '…');
  }

  if (FIX) {
    // A bold-only paragraph becomes an h3 ONLY when it reads as a section
    // title. One ending in a colon is a lead-in to the list underneath it, not
    // a heading, and promoting it would break the sentence it starts.
    body = body.replace(/(^|\n\n)\*\*([^*\n]{3,80})\*\*(?=\n\n|\n*$)/g,
      (m, pre, text) => (text.trim().endsWith(':') ? m : `${pre}### ${text.trim()}`));

    // An h4 directly under an h2, with no h3 between them, is a skipped rung.
    let last = 2;
    body = body.replace(/^(#{2,6}) /gm, (m, hashes) => {
      let lvl = hashes.length;
      if (lvl > last + 1) lvl = last + 1;
      last = lvl;
      return `${'#'.repeat(lvl)} `;
    });

    // Bold opened on one line and closed on the next — join it so the
    // emphasis can actually match.
    body = body.replace(/\*\*([^*\n]{2,80})\n\*\*/g, '**$1** ');

    // A heading is already bold; the ** inside is redundant and renders as a
    // nested <strong>. Some had drifted to eight asterisks.
    body = body.replace(/^(#{2,6} )(.*)$/gm, (m, hashes, text) =>
      hashes + text.replace(/\*+/g, '').replace(/__/g, '').replace(/\s{2,}/g, ' ').trim());

    // A long heading that ends in a full stop is a paragraph that picked up a
    // "#" during the import. Long headings WITHOUT a full stop are left alone,
    // because Latvian headings are legitimately long.
    body = body.replace(/^#{2,6} (.{75,}\.)$/gm, '$1');

    body = body.replace(/\\([.\-*_[\]()#+!])/g, '$1');
    body = body.replace(/ /g, ' ');
    body = body.replace(/[ \t]+$/gm, '');
    body = body.replace(/\n{4,}/g, '\n\n\n');
    body = body.replace(/^(\s*)\*\s/gm, '$1- ');
    if (body !== before) writeFileSync(path, fm + body, 'utf8');
  }
}

let total = 0;
for (const [kind, list] of Object.entries(findings)) {
  total += list.length;
  const files = new Set(list.map((x) => x.file));
  console.log(`\n## ${kind} — ${list.length} in ${files.size} file(s)`);
  const byFile = {};
  for (const x of list) (byFile[x.file] ||= []).push(x.detail);
  for (const [file, details] of Object.entries(byFile).sort((a, b) => b[1].length - a[1].length).slice(0, 8)) {
    console.log(`  ${String(details.length).padStart(3)}x  ${file}`);
    [...new Set(details)].slice(0, 2).forEach((d) => console.log(`         ${d}`));
  }
}
console.log(`\n${total} finding(s)${FIX ? ' (fixed where safe)' : ''}`);
