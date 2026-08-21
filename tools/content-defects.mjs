// Scans the migrated posts for content that is visibly broken on the live page.
// Found because one AI article had a FAQ block about "marketinga plans" spliced
// into it, which also swallowed the first half of its opening sentence.
//
//   node tools/content-defects.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'src/posts');
const findings = [];

const files = readdirSync(DIR).filter((f) => f.endsWith('.md'));
const bodies = {};

for (const f of files) {
  const src = readFileSync(join(DIR, f), 'utf8');
  const fm = (src.match(/^---([\s\S]*?)---/) || ['', ''])[1];
  const title = (fm.match(/title:\s*"?(.*?)"?\s*$/m) || [, ''])[1];
  const body = src.replace(/^---[\s\S]*?---/, '');
  bodies[f] = { title, body };

  const firstH2 = body.search(/<h2|^##\s/m);
  const intro = firstH2 > 0 ? body.slice(0, firstH2) : body;

  // 1. A FAQ block sitting ABOVE the article's first heading is misplaced —
  //    FAQs belong at the end.
  if (/Bie[žz]āk uzdotie jaut[āa]jumi/i.test(intro)) {
    findings.push({ file: f, kind: 'faq-before-intro', detail: 'FAQ block appears before the first heading' });
  }

  // 2. Words fused by a lost line break: lowercase run straight into an
  //    unrelated word with no space, e.g. "sociālo medijuintelekts".
  for (const m of body.matchAll(/[a-zāčēģīķļņšūž]{6,}(intelekts|mārketing|reklāma|uzņēmum|stratēģij)[a-zāčēģīķļņšūž]*/gi)) {
    const w = m[0];
    // ignore legitimate Latvian compounds that genuinely exist
    if (/^(digitālais|sociālo|interneta|satura)$/i.test(w)) continue;
    findings.push({ file: f, kind: 'fused-words', detail: `"${w}" — looks like a lost line break` });
  }

  // 3. FAQ answers that name a topic the article is not about.
  const topicWords = title.toLowerCase().match(/[a-zāčēģīķļņšūž]{5,}/g) || [];
  for (const m of intro.matchAll(/\*\*Kas ir ([^*?]{3,40})\?\*\*/g)) {
    const subject = m[1].toLowerCase();
    const overlap = topicWords.some((t) => subject.includes(t.slice(0, 6)));
    if (!overlap) {
      findings.push({ file: f, kind: 'foreign-faq', detail: `FAQ asks "Kas ir ${m[1]}?" but the article is "${title}"` });
    }
  }
}

// 4. Paragraphs duplicated verbatim across different posts.
const seen = new Map();
for (const [f, { body }] of Object.entries(bodies)) {
  for (const para of body.split(/\n{2,}/)) {
    const p = para.trim();
    if (p.length < 180 || p.startsWith('<')) continue;
    const key = p.slice(0, 180);
    if (seen.has(key) && seen.get(key) !== f) {
      findings.push({ file: f, kind: 'duplicate-paragraph', detail: `shares a paragraph with ${seen.get(key)}: "${p.slice(0, 70)}..."` });
    } else seen.set(key, f);
  }
}

const byKind = {};
for (const f of findings) (byKind[f.kind] ||= []).push(f);
for (const [kind, list] of Object.entries(byKind)) {
  console.log(`\n## ${kind} (${list.length})`);
  for (const f of list) console.log(`  ${f.file}\n     ${f.detail}`);
}
console.log(`\n${findings.length} finding(s) across ${files.length} posts`);
