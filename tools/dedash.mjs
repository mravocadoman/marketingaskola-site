#!/usr/bin/env node
// Replace punctuation dashes in visible Latvian copy with natural punctuation.
//
// Owner, 9 Oct 2026: "remove most of the em dashes everywhere, which is an AI
// content giveaway." Latvian uses the dash legitimately, but at the density it
// had reached on this site it read as machine writing.
//
//   node tools/dedash.mjs            # dry run: proposals + report, nothing written
//   node tools/dedash.mjs --write    # applies the proposals the LAST dry run saved
// --write never asks the model again: what gets written is exactly what was
// reviewed in the report, not a fresh and unreviewed set of proposals.
//   node tools/dedash.mjs --check    # counts dashes still in visible copy, exits 1 if any
//
// An OpenAI model proposes the minimal fix for each line (a comma, colon, full
// stop or parentheses). A guard then REJECTS any proposal that changed
// anything except punctuation: the words, the HTML tags, the template code
// ({{ }} {% %} {# #}), markdown link targets and unspaced number ranges (1–2)
// must all come back identical, and no punctuation dash may remain. Rejected
// lines are listed for a human.
//
// Left alone on purpose: testimonials (verbatim from the original site), the
// actors' own bios, the privacy policy and the EU funding notice (legal text),
// the four retired noindex pages, image-generation prompts and alts, and any
// untracked draft post.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// fileURLToPath, not .pathname: the repo path has spaces, which .pathname
// leaves as %20 - and git then has no directory to run in.
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const WRITE = process.argv.includes('--write');
const CHECK = process.argv.includes('--check');
const MODEL = (process.argv.find((a) => a.startsWith('--model=')) || '--model=gpt-5.5').slice(8);
const REPORT = process.env.DEDASH_REPORT || '/tmp/dedash-report.md';
const SAVED = REPORT.replace(/\.md$/, '') + '.json';

const SKIP_PAGES = new Set(['privatuma-politika.html', 'produkti.html', 'bezmaksas-e-gramata.html',
  '100-instagram-stories-veidnes.html', 'socialo-mediju-marketings.html']);

const tracked = new Set(execSync('git ls-files src', { cwd: ROOT, encoding: 'utf8' }).split('\n'));
const files = execSync('git ls-files src/pages src/_includes src/posts', { cwd: ROOT, encoding: 'utf8' })
  .split('\n').filter((f) => /\.(html|njk|md)$/.test(f))
  .filter((f) => !SKIP_PAGES.has(f.split('/').pop()))
  .filter((f) => tracked.has(f));

const PROTECT = /<[^>]+>|\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}|\{#[\s\S]*?#\}|\]\([^)]*\)/g;
const visible = (line) => line.replace(PROTECT, ' ');
const hasDash = (text) => /—| – /.test(text);
const skeleton = (line) => visible(line).replace(/[—–,:;.()!?]/g, '').replace(/\s+/g, '').toLowerCase();
const protectedSeq = (line) => (line.match(PROTECT) || []).join('\u0000');
const ranges = (line) => (visible(line).match(/\d–\d/g) || []).length;

// Collect candidate lines, skipping the protected zones.
const units = [];
for (const f of files) {
  const lines = readFileSync(join(ROOT, f), 'utf8').split('\n');
  let inActors = false, inQuote = false, inFunding = false;
  lines.forEach((line, i) => {
    if (/img--actor/.test(line)) inActors = true;
    if (inActors && /^\s*<\/section>/.test(line)) { inActors = false; return; }
    if (/<blockquote/.test(line)) inQuote = true;
    const quoteLine = inQuote;
    if (/<\/blockquote>/.test(line)) inQuote = false;
    if (/class="funding/.test(line)) inFunding = true;
    const fundingLine = inFunding;
    if (inFunding && /^\s*<\/(div|section)>/.test(line)) inFunding = false;
    if (inActors || quoteLine || fundingLine) return;
    if (hasDash(visible(line))) units.push({ f, i, line });
  });
}

if (CHECK) {
  for (const u of units) console.log(`${u.f}:${u.i + 1}  ${visible(u.line).trim().slice(0, 110)}`);
  console.log(`${units.length} line(s) with a punctuation dash in visible copy`);
  process.exit(units.length ? 1 : 0);
}

if (WRITE) {
  if (!existsSync(SAVED)) { console.error(`No saved proposals at ${SAVED}; run a dry run first.`); process.exit(1); }
  const accepted = JSON.parse(readFileSync(SAVED, 'utf8'));
  const byFile = {};
  for (const a of accepted) (byFile[a.f] ||= []).push(a);
  for (const [f, list] of Object.entries(byFile)) {
    const path = join(ROOT, f);
    const lines = readFileSync(path, 'utf8').split('\n');
    for (const a of list) {
      if (lines[a.i] !== a.line) { console.log(`skipped ${f}:${a.i + 1}, it changed underneath`); continue; }
      lines[a.i] = a.nu;
    }
    writeFileSync(path, lines.join('\n'));
  }
  console.log(`${accepted.length} reviewed change(s) written to ${Object.keys(byFile).length} file(s)`);
  process.exit(0);
}

const env = existsSync(join(ROOT, '.env')) ? readFileSync(join(ROOT, '.env'), 'utf8') : '';
const KEY = process.env.OPENAI_API_KEY || (env.match(/^OPENAI_API_KEY=(.+)$/m) || [])[1];
if (!KEY) { console.error('No OPENAI_API_KEY'); process.exit(1); }

const SYSTEM = `You fix punctuation in Latvian website copy. Each input line contains one or more punctuation dashes: an em dash (—) or a spaced en dash ( – ). Replace EVERY such dash with the most natural Latvian punctuation:
- an explanation, list or elaboration after the dash: a colon;
- a contrast or continuation: a comma;
- a pair of dashes around an aside: two commas, or parentheses;
- a new thought: a full stop, and capitalise the next word;
- a heading of the form "Title — subtitle": a colon.
Change NOTHING else. Not a word, not a letter, not the word order. Do not touch HTML tags or attributes, template code ({{ }}, {% %}, {# #}), markdown link targets, quotes or spacing elsewhere. Unspaced number ranges like 1–2 or 3–6 stay exactly as they are. Reply with JSON only: {"lines": [ ...each input line fixed, same order, same count... ]}`;

async function propose(batch) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${KEY}` },
    body: JSON.stringify({
      model: MODEL,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: JSON.stringify({ lines: batch.map((u) => u.line) }) }],
    }),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const out = JSON.parse((await res.json()).choices[0].message.content).lines;
  if (!Array.isArray(out) || out.length !== batch.length) throw new Error('line count mismatch');
  return out;
}

const accepted = [], rejected = [];
for (let b = 0; b < units.length; b += 15) {
  const batch = units.slice(b, b + 15);
  let out;
  try { out = await propose(batch); } catch (e) { batch.forEach((u) => rejected.push({ ...u, why: `api: ${e.message}` })); continue; }
  batch.forEach((u, k) => {
    // No quote normalising here: these pages use typographic quotes, and
    // straightening them made the guard reject correct proposals.
    const nu = String(out[k]);
    const why = skeleton(nu) !== skeleton(u.line) ? 'words changed'
      : protectedSeq(nu) !== protectedSeq(u.line) ? 'tags or template code changed'
      : ranges(nu) !== ranges(u.line) ? 'a number range changed'
      : hasDash(visible(nu)) ? 'a dash remains' : '';
    (why ? rejected : accepted).push({ ...u, nu, why });
  });
  process.stdout.write(`\r${Math.min(b + 15, units.length)}/${units.length} lines proposed`);
}
console.log();

const md = ['# dedash report', '', `${accepted.length} accepted, ${rejected.length} rejected`, ''];
for (const a of accepted) md.push(`## ${a.f}:${a.i + 1}`, '', `- ${visible(a.line).trim()}`, `+ ${visible(a.nu).trim()}`, '');
md.push('# Rejected', '');
for (const r of rejected) md.push(`## ${r.f}:${r.i + 1} (${r.why})`, '', `  ${visible(r.line).trim()}`, '');
writeFileSync(REPORT, md.join('\n'));
console.log(`${accepted.length} accepted, ${rejected.length} rejected; report: ${REPORT}`);

writeFileSync(SAVED, JSON.stringify(accepted.map(({ f, i, line, nu }) => ({ f, i, line, nu })), null, 1));
console.log(`proposals saved for --write: ${SAVED}`);
