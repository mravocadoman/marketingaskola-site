// Report unnatural Latvian. Does not rewrite anything.
//
// `lv-polish.mjs` rewrites a post wholesale, which means it silently decides
// what to change and never tells you what it left alone. Over this session the
// owner caught three constructions it had passed over ("Esi pārāk tuvu savam
// biznesam", "ar sveša cilvēka acīm", "svešs skatiens"), all of them calques
// that read fine to a non-native writer.
//
// So this tool does the opposite: it only REPORTS, with the offending sentence
// quoted, and a human decides. It also reads pages, which lv-polish cannot —
// the worst offender of the three was in src/pages.
//
// Usage:
//   node tools/lv-review.mjs <slug|path…>       one or more posts/pages
//   node tools/lv-review.mjs --posts            every post
//   node tools/lv-review.mjs --pages            every page
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const arg = (n, d) => (process.argv.find((a) => a.startsWith(`--${n}=`)) || `=${d}`).split('=').slice(1).join('=');
const MODEL = arg('model', 'gpt-5.5');

for (const line of fs.existsSync(path.join(ROOT, '.env')) ? fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n') : []) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
if (!process.env.OPENAI_API_KEY) { console.error('No OPENAI_API_KEY in .env'); process.exit(1); }

// --- what to review -------------------------------------------------------
const listDir = (d, ext) => fs.readdirSync(path.join(ROOT, d)).filter((f) => f.endsWith(ext)).map((f) => path.join(d, f));
let targets = [];
if (process.argv.includes('--posts')) targets = listDir('src/posts', '.md');
else if (process.argv.includes('--pages')) targets = listDir('src/pages', '.html');
else {
  targets = process.argv.slice(2).filter((a) => !a.startsWith('--')).map((a) => {
    if (fs.existsSync(path.join(ROOT, a))) return a;
    for (const c of [`src/posts/${a}.md`, `src/pages/${a}.html`]) if (fs.existsSync(path.join(ROOT, c))) return c;
    console.error('not found:', a); process.exit(1);
  });
}
if (!targets.length) { console.error('usage: node tools/lv-review.mjs <slug|path…> | --posts | --pages'); process.exit(1); }

// Strip front matter, markup and shortcodes so the model only reads prose.
const prose = (file, raw) => {
  let t = raw;
  if (file.endsWith('.md')) t = raw.split(/^---$/m).slice(2).join('---');
  t = t.replace(/\{%[\s\S]*?%\}/g, ' ').replace(/<[^>]+>/g, ' ');
  return t.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
};

const SYSTEM = `Tu esi latviešu valodas redaktors. Tavs uzdevums ir ATRAST un NOSAUKT vietas, kas latviski neskan dabiski. Neko nepārraksti veselu tekstu.

Meklē:
- kalkus, t.i. burtiski no angļu valodas tulkotas frāzes un idiomas;
- angļu teikuma uzbūvi latviešu vārdos;
- amerikāņu mārketinga žargonu;
- gramatikas kļūdas, īpaši locījumus un darbības vārdu formas;
- vārdus, ko latvietis šajā nozīmē nelietotu.

NEZIŅO par: terminiem, kas latviski tiešām tiek lietoti (piemēram, atslēgvārdi, konversija, remārketings), par zīmolu nosaukumiem, par stila izvēlēm, kas ir pareizas.

Atbildi TIKAI kā JSON masīvs, bez cita teksta:
[{"citats":"<precīzs teikums vai frāze no teksta>","kapec":"<īss paskaidrojums latviski>","ieteikums":"<dabiskāks variants>"}]

Ja viss ir kārtībā, atbildi ar tukšu masīvu [].`;

let total = 0;
for (const rel of targets) {
  const raw = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const text = prose(rel, raw);
  if (text.length < 200) continue;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: text }] }),
  });
  if (!res.ok) { console.error(`  ${rel} -> ${res.status}`); continue; }
  const out = (await res.json()).choices?.[0]?.message?.content?.trim() || '[]';

  let items;
  try { items = JSON.parse(out.replace(/^```(?:json)?|```$/gm, '').trim()); }
  catch { console.error(`  ${rel}: unparsable reply`); continue; }
  if (!Array.isArray(items) || !items.length) continue;

  // Only report quotes that are actually in the file — the model paraphrases.
  const real = items.filter((i) => i.citats && raw.includes(i.citats.trim()));
  const drifted = items.length - real.length;
  if (!real.length) continue;

  console.log(`\n${rel}${drifted ? `  (${drifted} paraphrased, dropped)` : ''}`);
  for (const i of real) {
    console.log(`  · ${i.citats.trim()}`);
    console.log(`      ${i.kapec}`);
    if (i.ieteikums) console.log(`      -> ${i.ieteikums}`);
    total++;
  }
}
console.log(`\n${total} finding(s) across ${targets.length} file(s). Nothing was changed.`);
