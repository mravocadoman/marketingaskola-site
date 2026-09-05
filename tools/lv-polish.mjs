// Polish a post's Latvian with an OpenAI text model.
//
// Owner (5 Sep 2026): "please consider using a later OpenAI model for writing
// via API; their Latvian is actually quite good". The problem being solved is
// specific: prose written by translating English sentence-shapes produces
// calques that a Latvian reader spots instantly ("ja noņem burbuli", "sarkanie
// karogi", "bez sajūsmas un biedēšanas").
//
// This tool rewrites ONLY the language. It is told, and it is verified below,
// that the markdown structure must survive untouched: headings, links, the
// {% infographic %} shortcodes, bold markers and front matter. If any of those
// change, the result is rejected rather than written.
//
// Usage:
//   node tools/lv-polish.mjs <slug> [--model=gpt-5] [--write]
// Without --write it prints a diff-friendly preview and touches nothing.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const arg = (n, d) => (process.argv.find((a) => a.startsWith(`--${n}=`)) || `=${d}`).split('=').slice(1).join('=');
const WRITE = process.argv.includes('--write');
const MODEL = arg('model', 'gpt-5');
const slug = process.argv[2];
if (!slug) { console.error('usage: node tools/lv-polish.mjs <slug> [--model=…] [--write]'); process.exit(1); }

for (const line of fs.existsSync(path.join(ROOT, '.env')) ? fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n') : []) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
if (!process.env.OPENAI_API_KEY) { console.error('No OPENAI_API_KEY in .env'); process.exit(1); }

const file = path.join(ROOT, 'src', 'posts', `${slug}.md`);
if (!fs.existsSync(file)) { console.error('no such post:', slug); process.exit(1); }
const raw = fs.readFileSync(file, 'utf8');
const [, frontMatter, body] = raw.split(/^---$/m);

const SYSTEM = `Tu esi latviešu valodas redaktors, kas strādā ar digitālā mārketinga rakstiem.

UZDEVUMS: pārraksti tekstu dabiskā, plūstošā latviešu valodā. Teksts ir rakstīts, domājot angliski, tāpēc tajā ir kalki un konstrukcijas, kas latviski neskan.

LABO:
- burtiski tulkotus angļu idiomus un frāzes;
- angļu valodas teikuma uzbūvi;
- amerikāņu mārketinga žargonu; saki to pašu vienkāršā latviešu valodā;
- gramatikas kļūdas, īpaši darbības vārdu formas un locījumus.

NEMAINI:
- teksta nozīmi, faktus, skaitļus vai apgalvojumus;
- struktūru: virsrakstus, to secību un līmeņus;
- markdown formatējumu: saites [teksts](/celš/), treknrakstu, slīprakstu, sarakstus;
- {% infographic ... %} blokus; atstāj tos burtiski tādus, kādi tie ir;
- rakstu garumu; tas drīkst mainīties tikai nedaudz.

STILS: uzruna ar "Tu". Īsi teikumi. Konkrēti. Bez pārspīlējumiem un bez domuzīmēm (—).
PĒDIŅAS: izmanto tikai taisnās pēdiņas ("), nevis “ ” vai „ ".

Atbildi TIKAI ar pārrakstīto markdown tekstu, bez paskaidrojumiem.`;

const res = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
  body: JSON.stringify({ model: MODEL, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: body.trim() }] }),
});
if (!res.ok) { console.error(`${MODEL} -> ${res.status}: ${(await res.text()).slice(0, 300)}`); process.exit(1); }
// The model likes typographic quotes; the site uses straight ones everywhere.
const out = (await res.json()).choices?.[0]?.message?.content?.trim()
  ?.replace(/[\u201c\u201d\u201e]/g, '"').replace(/[\u2018\u2019]/g, "'");
if (!out) { console.error('empty response'); process.exit(1); }

// Raw HTML blocks (the YouTube embeds) are markup, not prose - restore them
// verbatim. The model rewrote an en dash inside an iframe's title attribute.
const HTML = /^<[a-z][^>]*>.*$/gim;
const originalHtml = body.match(HTML) || [];
let h = 0;
const restored = out.replace(HTML, () => originalHtml[h++] ?? '');

// The model must not have touched the load-bearing parts.
const shape = (t) => ({
  headings: (t.match(/^#{2,3} .+$/gm) || []).length,
  links: [...t.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]).sort(),
  shortcodes: (t.match(/\{%\s*infographic[\s\S]*?%\}/g) || []),
});
const a = shape(body), b = shape(restored);
const problems = [];
if (a.headings !== b.headings) problems.push(`headings ${a.headings} -> ${b.headings}`);
if (JSON.stringify(a.links) !== JSON.stringify(b.links)) {
  const lost = a.links.filter((l) => !b.links.includes(l));
  const added = b.links.filter((l) => !a.links.includes(l));
  problems.push(`links changed (lost ${lost.length}, added ${added.length})${lost.length ? ': ' + lost.slice(0, 3).join(', ') : ''}`);
}
if (JSON.stringify(a.shortcodes) !== JSON.stringify(b.shortcodes)) problems.push('infographic shortcodes altered');
if (/—/.test(restored)) problems.push('em dash reintroduced');

const words = (t) => t.replace(/\{%[\s\S]*?%\}/g, '').split(/\s+/).filter(Boolean).length;
console.log(`${slug}: ${words(body)} -> ${words(restored)} words, model ${MODEL}`);
if (problems.length) { console.error('REJECTED:\n  ' + problems.join('\n  ')); process.exit(2); }

if (WRITE) { fs.writeFileSync(file, `---${frontMatter}---\n\n${restored}\n`); console.log('written'); }
else { fs.writeFileSync(path.join(ROOT, `${slug}.polished.md`), restored); console.log(`preview -> ${slug}.polished.md (not applied; pass --write to apply)`); }
