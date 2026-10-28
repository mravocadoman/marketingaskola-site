// Turn a lead magnet into a full blog post on marketingaskola.lv.
//
//   node tools/magnet-post.mjs social/magnets/<slug>.json [--model=gpt-6-astra]
//
// A social post with a keyword ("Komentē META") sends the commenter a link by
// DM. That link is a blog post built here: the guide itself, in Latvian, with
// the house cover, an in-article infographic, the animated header built from
// the cover's pieces, and a fixed closing section that sells the automation
// service. Owner, 13 Oct 2026: the magnet should be "a blog post with all
// sections, guides, graphics in the current style, headers, animations ...
// and then CTA to our automation services at the end".
//
// Every step is skipped when its output already exists, so the tool is safe to
// run again after each human step:
//   1. text     - no src/posts/<slug>.md yet: an OpenAI model writes the body
//                 from the spec's source and facts under the shared Latvian
//                 rules (_lv-rules.mjs), lv-review reads it, and the tool STOPS
//                 with a review report. The latvian-writing skill says every
//                 finding is decided by a person; run the tool again after.
//   2. frame    - the infographic shortcode, the automation CTA and the gate
//                 markers are put in if missing (all fixed, never model-written).
//   3. graphics - cover and infographic slots go into imagery.json and are
//                 generated in the house style; the cover is ground-matched,
//                 the infographic whitened, og:image twins derived.
//   4. header   - build-motifs turns the cover into the animated header.
//   5. wiring   - the post joins its blog categories, and calendar posts with
//                 this keyword point their magnet at the post.
// Then proofread the infographic's Latvian (it is text in pixels), build, check.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { LV_RULES } from './_lv-rules.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const MODEL = arg('model', 'gpt-6-astra');
const specPath = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!specPath) { console.error('usage: node tools/magnet-post.mjs social/magnets/<slug>.json'); process.exit(1); }
const spec = JSON.parse(fs.readFileSync(path.join(ROOT, specPath), 'utf8'));
const rel = (p) => path.join(ROOT, p);
const readJson = (p) => JSON.parse(fs.readFileSync(rel(p), 'utf8'));
const writeJson = (p, o) => fs.writeFileSync(rel(p), JSON.stringify(o, null, 2) + '\n');
// A failed step stops the run and says how to finish it by hand: the next run
// skips work whose output exists, so a half-done step would otherwise be lost.
const run = (cmd, args) => {
  try { execFileSync(cmd, args, { cwd: ROOT, stdio: 'inherit' }); }
  catch { console.error(`\nStep failed: ${cmd} ${args.join(' ')}\nFix the cause, run that command by hand, then run this tool again.`); process.exit(1); }
};
const postFile = `src/posts/${spec.slug}.md`;
const coverId = `cover-${spec.slug}`;
const infoId = spec.infographic && `info-${spec.slug}`;

// The closing section is the same on every magnet post and nobody's model
// writes it: it points at the automation service and the quiz.
const CTA = `## Gribi, lai šādu sistēmu sakārtojam Tavā uzņēmumā?

Šādas sistēmas būvējam klientiem: [mārketinga automatizācija](/marketinga-automatizacija/) no pieteikumu plūsmas līdz atskaitēm, kurās pirmie ir klienti, nevis klikšķi. Ja vēl nezini, ar ko sākt, aizpildi [automatizācijas testu](/automatizacijas-tests/): četri jautājumi, un rezultātu redzi uzreiz.
`;

for (const line of fs.readFileSync(rel('.env'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
}

// ---------- 1. text ----------
if (!fs.existsSync(rel(postFile))) {
  if (!process.env.OPENAI_API_KEY) { console.error('No OPENAI_API_KEY in .env'); process.exit(1); }
  const source = spec.source ? fs.readFileSync(rel(spec.source), 'utf8') : '';
  const SYSTEM = [
    'Tu raksti Mārketinga Skolas (Latvijas digitālā mārketinga aģentūra) bloga rakstu, kas ir bezmaksas materiāls: praktisks ceļvedis, ko lasītājs saņem, kad sociālajos tīklos komentē atslēgvārdu.',
    ...LV_RULES,
    'Formāts: Markdown bez virsraksta H1 (virsraksts ir atsevišķi). Ievads 2-3 teikumos, tad 5 līdz 8 sadaļas ar "## " virsrakstiem, īsas rindkopas, saraksti, kur ir soļi. Instrukcijas, ko lasītājs kopēs modelim, ieliec ```text blokos un raksti tās latviski. Tabulas Markdown formātā, ja salīdzina. Nebeidz ar aicinājumu pirkt pakalpojumu: to pievienosim paši. 900 līdz 1600 vārdu.',
  ].join('\n');
  const user = [
    `Virsraksts: ${spec.title}`,
    `Atslēgvārds: ${spec.keyword}`,
    spec.brief ? `Ideja: ${spec.brief}` : '',
    'Fakti (drīkst izmantot tikai tos):', ...(spec.facts || []).map((f) => `- ${f}`),
    source ? `\nAvots (var būt angliski; pārņem saturu, ne teikumu uzbūvi):\n${source}` : '',
  ].filter(Boolean).join('\n');
  const allowed = new Set(((user).match(/\d+(?:[.,]\d+)?/g) || []).map((n) => n.replace(',', '.')));
  const problems = (t) => {
    const bad = [];
    if (/[—–]|[ \t]-[ \t]/.test(t.replace(/```[\s\S]*?```/g, ''))) bad.push('punctuation dash');
    if ((t.match(/^## /gm) || []).length < 4) bad.push('fewer than 4 sections');
    if (/kreatīv(s|u|i|am|iem)\b/i.test(t)) bad.push('"kreatīvs" as a noun');
    for (const n of t.match(/\d+(?:[.,]\d+)?/g) || []) if (!allowed.has(n.replace(',', '.'))) bad.push(`number ${n} not in the source`);
    return [...new Set(bad)];
  };
  const ask = async (note) => {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: MODEL, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: user + (note ? `\n\nIepriekšējā versija neder: ${note}. Uzraksti no jauna.` : '') }] }),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(`${r.status} ${JSON.stringify(j).slice(0, 300)}`);
    return j.choices[0].message.content.trim().replace(/^#\s.*\n+/, '');
  };
  let body = await ask();
  let bad = problems(body);
  if (bad.length) { body = await ask(bad.join('; ')); bad = problems(body); }
  const fm = [
    // a number stays on the line of the word it counts ("7 noteikumi")
    '---', 'layout: post.njk', `title: ${JSON.stringify(spec.title.replace(/(\d) /g, '$1\u00a0'))}`, `seoTitle: ${JSON.stringify(spec.seoTitle || `${spec.title} | Mārketinga Skola`)}`,
    `description: ${JSON.stringify(spec.description)}`, `date: ${spec.date}`, `image: "/img/gen/${coverId}.webp"`,
    `categories: ${JSON.stringify(spec.categories)}`, `permalink: "/${spec.slug}/"`, `keywords: ${JSON.stringify(spec.keywords || [])}`,
    `magnet: ${JSON.stringify(spec.keyword)}`, '---', '',
  ].join('\n');
  fs.writeFileSync(rel(postFile), fm + body + '\n');
  const report = path.join('social/out/magnets', `${spec.slug}-review.txt`);
  fs.mkdirSync(rel('social/out/magnets'), { recursive: true });
  let review = '';
  try { review = execFileSync('node', ['tools/lv-review.mjs', postFile], { cwd: ROOT, encoding: 'utf8' }); } catch (e) { review = String(e.stdout || e.message); }
  fs.writeFileSync(rel(report), (bad.length ? `GUARDS: ${bad.join('; ')}\n\n` : '') + review);
  console.log(`Drafted ${postFile} with ${MODEL}${bad.length ? ` (CHECK: ${bad.join('; ')})` : ''}.`);
  console.log(`Latvian review: ${report}. Decide each finding (latvian-writing skill), then run this again.`);
  process.exit(0);
}

// ---------- 2. frame ----------
let post = fs.readFileSync(rel(postFile), 'utf8');
if (infoId && !post.includes(`id: "${infoId}"`)) {
  const block = `{% infographic { id: "${infoId}", title: ${JSON.stringify(spec.infographic.title)}, items: [\n` +
    spec.infographic.items.map((i) => `  { label: ${JSON.stringify(i.label)}, text: ${JSON.stringify(i.text || '')} }`).join(',\n') + '\n] } %}\n\n';
  const heads = [...post.matchAll(/^## /gm)];
  const at = heads.length > 1 ? heads[1].index : post.length;
  post = post.slice(0, at) + block + post.slice(at);
}
if (!post.includes('](/marketinga-automatizacija/)')) post = post.trimEnd() + '\n\n' + CTA;
// The gate (13 Oct 2026): the copyable part opens after an e-mail sign-up.
// It starts at the first section holding a ```text prompt (the third section
// if there is none) and ends before the CTA, which stays public. post.njk does
// the rest; the leads workflow saves the sign-up for the newsletter.
if (!post.includes('<!-- gate -->')) {
  const heads = [...post.matchAll(/^## /gm)].map((m) => m.index);
  const fence = post.indexOf('```text');
  const before = heads.filter((h) => fence >= 0 && h < fence);
  const at = before.length ? before[before.length - 1] : heads[2];
  const end = post.indexOf(CTA.split('\n')[0]);
  if (at !== undefined && end > at) post = post.slice(0, at) + '<!-- gate -->\n\n' + post.slice(at, end) + '<!-- /gate -->\n\n' + post.slice(end);
}
fs.writeFileSync(rel(postFile), post);

// ---------- 3. graphics ----------
const imagery = readJson('src/_data/imagery.json');
const want = [{ id: coverId, page: spec.slug, placement: 'post cover (front matter image)', aspect: 'landscape', ...spec.cover }];
if (infoId) want.push({ id: infoId, page: spec.slug, placement: 'in-article infographic', aspect: 'landscape', style: 'paper', quality: 'high', alt: spec.infographic.alt, prompt: spec.infographic.prompt });
let added = 0;
for (const w of want) if (!imagery.slots.find((s) => s.id === w.id)) { imagery.slots.push(w); added++; }
if (added) writeJson('src/_data/imagery.json', imagery);
const missing = want.filter((w) => !fs.existsSync(rel(`src/img/gen/${w.id}.webp`)));
if (missing.length) {
  run('node', ['tools/generate-images.mjs', `--only=${missing.map((w) => w.id).join(',')}`]);
  if (missing.find((w) => w.id === coverId)) run('node', ['tools/match-ground.mjs', `src/img/gen/${coverId}.webp`]);
  if (infoId && missing.find((w) => w.id === infoId)) run('node', ['tools/whiten-paper.mjs', infoId]);
}
run('node', ['tools/derived-images.mjs']);

// ---------- 4. header ----------
run('node', ['tools/build-motifs.mjs', '--posts-only']);

// ---------- 5. wiring ----------
const cats = readJson('src/_data/categoryList.json');
for (const c of cats) if (spec.categories.includes(c.slug) && !c.posts.includes(spec.slug)) c.posts.push(spec.slug);
writeJson('src/_data/categoryList.json', cats);
const cal = readJson('social/calendar.json');
for (const p of cal.posts) if (p.magnet && p.magnet.keyword === spec.keyword) { p.magnet.slug = spec.slug; p.magnet.url = `/${spec.slug}/`; delete p.magnet.status; }
writeJson('social/calendar.json', cal);

console.log(`\n${postFile} is assembled. Before shipping:`);
if (infoId) console.log(`  - proofread the Latvian in src/img/gen/${infoId}.webp; on a misspelling: node tools/generate-images.mjs --only=${infoId} --force, then whiten again`);
console.log('  - npm run build && npm run check, and look at the post');
