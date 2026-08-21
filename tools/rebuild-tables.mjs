// Rebuilds tables that collapsed into loose paragraphs during the WordPress
// import. The signature is a run of consecutive bold-only paragraphs (the
// header row) followed by plain short paragraphs (the cells, in row-major
// order). Rendered as-is they read as a wall of disconnected lines.
//
// Safety: the number of cell paragraphs must divide evenly by the number of
// headers. If it does not, the block is left alone and reported — a wrong guess
// would silently scramble the owner's pricing data.
//
//   node tools/rebuild-tables.mjs [--write]
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'src/posts');
const WRITE = process.argv.includes('--write');
const MAX_CELL = 90;   // a real table cell is short; longer means it is prose

let rebuilt = 0, skipped = 0;

for (const f of readdirSync(DIR).filter((x) => x.endsWith('.md'))) {
  const path = join(DIR, f);
  const src = readFileSync(path, 'utf8');
  const fmEnd = src.indexOf('---', 3) + 3;
  const fm = src.slice(0, fmEnd);
  const blocks = src.slice(fmEnd).split(/\n{2,}/);

  const out = [];
  for (let i = 0; i < blocks.length; i++) {
    const isBoldOnly = (b) => /^\*\*[^*\n]{2,60}\*\*$/.test(b.trim());
    if (!isBoldOnly(blocks[i])) { out.push(blocks[i]); continue; }

    // collect the consecutive bold run = header row
    let j = i;
    const headers = [];
    while (j < blocks.length && isBoldOnly(blocks[j])) { headers.push(blocks[j].trim().replace(/^\*\*|\*\*$/g, '')); j++; }
    if (headers.length < 2) { out.push(blocks[i]); continue; }

    // collect following plain short paragraphs = cells
    const cells = [];
    let k = j;
    while (k < blocks.length) {
      const b = blocks[k].trim();
      if (!b || b.length > MAX_CELL || /^[#\-*|>]|\n/.test(b) || isBoldOnly(b)) break;
      cells.push(b);
      k++;
    }

    if (cells.length < headers.length || cells.length % headers.length !== 0) {
      console.log(`  skip ${f}: ${headers.length} headers but ${cells.length} cells — does not divide evenly`);
      skipped++;
      out.push(blocks[i]);
      continue;
    }

    const rows = [];
    for (let r = 0; r < cells.length; r += headers.length) rows.push(cells.slice(r, r + headers.length));
    const table = [
      `| ${headers.join(' | ')} |`,
      `| ${headers.map(() => '---').join(' | ')} |`,
      ...rows.map((r) => `| ${r.join(' | ')} |`),
    ].join('\n');

    console.log(`  ok   ${f}: ${headers.length} columns x ${rows.length} rows`);
    rebuilt++;
    out.push(table);
    i = k - 1;
  }

  const body = out.join('\n\n');
  if (WRITE && body !== src.slice(fmEnd)) writeFileSync(path, fm + body, 'utf8');
}

console.log(`\n${rebuilt} table(s) rebuilt, ${skipped} skipped${WRITE ? '' : ' (dry run — pass --write)'}`);
