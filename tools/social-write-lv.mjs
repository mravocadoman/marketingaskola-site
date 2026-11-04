// Write the Latvian for the social calendar with an OpenAI model.
//
// Owner (11 Oct 2026): "for natural latvian use OPEN AI api, as it writes
// better." This fills `lv` on each post in social/calendar.json from the
// post's English `brief` and sourced `facts`, under the site's copy rules.
// At checkpoint 1 (the calendar) it writes a headline and a one-line
// description; the captions come later, at checkpoint 3.
//
//   node tools/social-write-lv.mjs [--model=gpt-6-astra] [--only=<id>] [--force]
//   node tools/social-write-lv.mjs --slides [--only=<id>] [--force]
//   node tools/social-write-lv.mjs --covers [--only=<id>]
//   node tools/social-write-lv.mjs --captions [--only=<id>] [--force]
//
// --slides (checkpoint 2, after the calendar is approved) writes what goes ON
// the visuals: three point slides and a closing slide for a carousel, one
// supporting line for a single image or a story, and the one word of the
// headline the template underlines. Review and result stories are built from
// data (reviews.json, the portfolio) and get no AI text.
//
// Carousel shape (13 Oct 2026, from the research in docs/social-pipeline.md):
// cover, a hook slide, 4-6 points, a closing slide - 7-9 slides, under the
// API's 10. Slide 2 is a hook of its own because Instagram re-shows a
// carousel someone scrolled past starting from slide 2. --covers then
// rewrites a carousel's headline from its finished slides: a number, a
// contrarian claim, a named mistake or a how-to rather than a bare question,
// with the search keyword early. The only number it may add is the count of
// points the post really has.
//
// --captions (checkpoint 3) writes the post text for feed posts (stories carry
// none): a hook line, a few short paragraphs that add to the slides rather than
// repeat them, one closing call to action, three hashtags. The tool, not the
// model, then adds what must be exact: the next course date and price from
// courseSessions.json, and the link with UTM tags, full on Facebook and as
// plain text on Instagram, where caption links do not click. Both finished
// texts are stored in lv.caption.facebook / .instagram.
//
// Guards, each because a model does it otherwise: no punctuation dashes, no
// number that is not in the brief or facts, headline length. A reply that
// breaks one is asked for again once, then left for a human with a note.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LV_RULES } from './_lv-rules.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CAL = path.join(ROOT, 'social/calendar.json');
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const MODEL = arg('model', 'gpt-6-astra');
const ONLY = arg('only', '');
const FORCE = process.argv.includes('--force');
const SLIDES = process.argv.includes('--slides');
const CAPTIONS = process.argv.includes('--captions');
const COVERS = process.argv.includes('--covers');

for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
}
if (!process.env.OPENAI_API_KEY) { console.error('No OPENAI_API_KEY in .env'); process.exit(1); }

const SYSTEM = [
  'Tu raksti Mārketinga Skolas (Latvijas digitālā mārketinga aģentūra) sociālo tīklu ierakstus Facebook un Instagram.',
  // Rihards, 4 Nov 2026: posts on the agency pages say "mūsu", not "mans", and carry no personal sign-off.
  'Aģentūra runā daudzskaitlī: "mēs", "mūsu projekts", "salikām", "mūs pārsteidza". Nekad "es", "mans", "mana" un nekad paraksts "Rihards" ieraksta beigās. Rihardu min trešajā personā tikai tad, ja jāpasaka, kurš vada komandu.',
  // Rihards, 4 Nov 2026: the hook needs flavour, and translated English jokes "dont work" in Latvian.
  'Āķim vajag garšu: pretrunīgu vai asprātīgu pirmo teikumu. Ņem to no latviešu valodas, piemēram, dzīvu teicienu, kas sasaistās ar faktu ieraksta tekstā ("Ne viss ir zelts, kas spīd", "Lēnāk brauksi, tālāk tiksi", "Uzticies, bet pārbaudi"), nevis no angļu joka tulkojuma. Teicienu raksti tā standarta formā. Jokam nedrīkst pievienot jaunu skaitli vai faktu.',
  ...LV_RULES,
  'Atbildi tikai ar JSON objektu tādā formā, kādu prasa lietotāja ziņa.',
].join('\n');
const CALENDAR_SHAPE = 'Atbildi tikai ar JSON: {"virsraksts": "āķis vizuālim, līdz 60 zīmēm, bez punkta beigās", "apraksts": "viens vai divi īsi teikumi kalendāram: par ko ieraksts un kāpēc tas lasītājam svarīgs"}';

// What each format needs on its visuals, with hard length limits.
const SHAPES = {
  carousel: '{"aki": {"virsraksts": "līdz 42 zīmēm: kas lasītājam ir uz spēles, ko viņš zaudē vai iegūst", "teksts": "līdz 140 zīmēm"}, "slaidi": [no 4 līdz 6 punktiem, katrs {"virsraksts": "līdz 42 zīmēm", "teksts": "līdz 170 zīmēm"}; tikai tik punktu, cik faktos ir patiesa satura], "nosleguma_virsraksts": "līdz 42 zīmēm", "nosleguma_teksts": "līdz 140 zīmēm; aicini saglabāt ierakstu vai nosūtīt kolēģim"}. Otrais slaids (aki) jāsaprot arī bez vāka: Instagram to rāda cilvēkam, kurš vāku paskrēja garām.',
  single: '{"akcents": "viens vārds vai īsa frāze no virsraksta, ko pasvītrot", "teksts": "līdz 150 zīmēm"}',
  story: '{"akcents": "viens vārds vai īsa frāze no virsraksta, ko pasvītrot", "teksts": "līdz 110 zīmēm"}',
};
const CAPTION_SHAPE = '{"teksts": "līdz 650 zīmēm, īsi: ziņkāre un viena konkrēta vērtība, nevis garš skaidrojums (Rihards, 4. nov.); teikumi garāki un savienoti ar un, jo, tāpēc, lai, kas, kad, nekad saraustītu trīsvārdu teikumu virkne; pirmā rinda ir āķis līdz 120 zīmēm, kas neatkārto virsrakstu vārds vārdā un tēmu nosauc ar vārdiem, ko cilvēks meklētu (piemēram Meta reklāma, Google Ads); tad 2-3 rindkopas, kas papildina slaidus, nevis tos pārraksta; beigās viens jautājums lasītājam vai aicinājums saglabāt ierakstu vai nosūtīt to kolēģim, kam tas noderētu; bez saites, bez datumiem un cenām (tos pievienosim paši); rindkopas atdalītas ar tukšu rindu; bez tēmturiem tekstā", "tagi": ["#trīs", "#tēmturi", "#latviski"]}';
const COVER_SHAPE = (n) => `{"virsraksts": "vāka virsraksts līdz 60 zīmēm, bez punkta beigās", "akcents": "viens vārds vai īsa frāze no virsraksta, ko pasvītrot"}. Virsrakstam jābūt viena no šīm formām: skaitlis un solījums (ierakstā ir tieši ${n} punkti), pretrunīgs apgalvojums, nosaukta kļūda vai "kā" solījums. Nevis vienkāršs jautājums. Tēmas atslēgvārds (piemēram Meta reklāma, Google Ads, AI) pirmajos vārdos. Vienīgais skaitlis, ko drīkst pievienot, ir ${n}.`;
const shapeOf = (p) => (p.format.startsWith('carousel') ? 'carousel' : p.slot === 'story' ? 'story' : 'single');
const dataOnly = (p) => /review card|result card/.test(p.format);

const userFor = (p) => [
  `Formāts: ${p.format} (${p.slot}). Tēma: ${p.pillar}.`,
  `Ideja: ${p.brief}`,
  'Fakti (drīkst izmantot tikai tos):',
  ...p.facts.map((f) => `- ${f}`),
  p.cta ? `Aicinājums uz: ${p.cta.label}` : '',
  COVERS ? `\nIeraksta slaidi jau gatavi: ${JSON.stringify({ aki: p.lv.visual.aki, slaidi: p.lv.visual.slaidi })}.\nTagad uzraksti vāka virsrakstu no jauna. Atbildi tikai ar JSON: ${COVER_SHAPE(p.lv.visual.slaidi.length)}`
    : CAPTIONS ? `\nVizuālis jau ir gatavs. Virsraksts: "${p.lv.virsraksts}". Uz vizuāļa rakstīts: ${JSON.stringify(p.lv.visual || {})}.\nTagad uzraksti ieraksta aprakstu (caption) Facebook un Instagram. Atbildi tikai ar JSON: ${CAPTION_SHAPE}`
    : SLIDES ? `\nVirsraksts jau ir: "${p.lv.virsraksts}". Tagad uzraksti tekstu uz vizuāļiem. Atbildi tikai ar JSON: ${SHAPES[shapeOf(p)]}` : `\n${CALENDAR_SHAPE}`,
].filter(Boolean).join('\n');

// Numbers the post may contain: the ones in its brief and facts.
const allowedNums = (p) => new Set(((p.brief + ' ' + p.facts.join(' ')).match(/\d+(?:[.,]\d+)?/g) || []).map((n) => n.replace(',', '.')));
const textOf = (out) => {
  const parts = [];
  const walk = (v) => { if (typeof v === 'string') parts.push(v); else if (v && typeof v === 'object') Object.values(v).forEach(walk); };
  walk(out);
  return parts.join(' ');
};
const slideProblems = (p, out) => {
  const shape = shapeOf(p);
  const bad = [];
  // a carousel's headline is rewritten afterwards by --covers, which sets akcents
  if (shape !== 'carousel' && (!out || typeof out.akcents !== 'string' || !p.lv.virsraksts.includes(out.akcents))) bad.push('"akcents" must be words from the headline');
  if (shape === 'carousel') {
    if (!out.aki || !out.aki.virsraksts || out.aki.virsraksts.length > 42 || !out.aki.teksts || out.aki.teksts.length > 140) bad.push('hook slide');
    if (!Array.isArray(out.slaidi) || out.slaidi.length < 4 || out.slaidi.length > 6) return [...bad, 'need 4 to 6 point slides'];
    out.slaidi.forEach((x, i) => {
      if (!x || (x.virsraksts || '').length > 42) bad.push(`slide ${i + 1} title too long`);
      if (!x || (x.teksts || '').length > 170) bad.push(`slide ${i + 1} text too long`);
    });
    if ((out.nosleguma_virsraksts || '').length > 42 || !out.nosleguma_virsraksts) bad.push('closing title');
    if ((out.nosleguma_teksts || '').length > 140 || !out.nosleguma_teksts) bad.push('closing text');
  } else if (!out.teksts || out.teksts.length > (shape === 'story' ? 110 : 150)) bad.push('supporting line length');
  return bad;
};
const captionProblems = (out) => {
  const bad = [];
  if (!out || typeof out.teksts !== 'string') return ['not the JSON asked for'];
  if (out.teksts.length > 900) bad.push(`caption ${out.teksts.length} chars`);
  if (out.teksts.split('\n')[0].length > 120) bad.push('hook line over 120 chars');
  if (/https?:|www\.|marketingaskola\.lv|#/.test(out.teksts)) bad.push('no links or hashtags inside the text');
  if (!Array.isArray(out.tagi) || out.tagi.length !== 3 || !out.tagi.every((t) => /^#[\p{Ll}\d]+$/u.test(t))) bad.push('need exactly three lowercase hashtags');
  return bad;
};
const problems = (p, out) => {
  const bad = [];
  if (COVERS) {
    if (!out || typeof out.virsraksts !== 'string' || typeof out.akcents !== 'string') return ['not the JSON asked for'];
    if (out.virsraksts.length > 60) bad.push(`headline ${out.virsraksts.length} chars`);
    if (!out.virsraksts.includes(out.akcents)) bad.push('"akcents" must be words from the headline');
  } else if (CAPTIONS) { bad.push(...captionProblems(out)); if (bad.includes('not the JSON asked for')) return bad; }
  else if (SLIDES) bad.push(...slideProblems(p, out || {}));
  else if (!out || typeof out.virsraksts !== 'string' || typeof out.apraksts !== 'string') return ['not the JSON asked for'];
  const text = COVERS ? out.virsraksts : CAPTIONS ? out.teksts : SLIDES ? textOf(out) : out.virsraksts + ' ' + out.apraksts;
  if (/[—–]|\s-\s/.test(text)) bad.push('punctuation dash');
  if (!SLIDES && !CAPTIONS && !COVERS && out.virsraksts.length > 60) bad.push(`headline ${out.virsraksts.length} chars`);
  const ok = allowedNums(p);
  if (COVERS) ok.add(String(p.lv.visual.slaidi.length));
  for (const n of text.match(/\d+(?:[.,]\d+)?/g) || []) if (!ok.has(n.replace(',', '.'))) bad.push(`number ${n} not in the facts`);
  if (/kreatīv(s|u|i|am|iem)\b/i.test(text)) bad.push('"kreatīvs" as a noun');
  return bad;
};

async function ask(p, note) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: userFor(p) + (note ? `\n\nIepriekšējā atbilde neder: ${note}. Uzraksti no jauna.` : '') },
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(data).slice(0, 300)}`);
  try { return JSON.parse(data.choices[0].message.content); } catch (e) { return null; }
}

// What the model may not be trusted with: dates, prices and links, from data.
const courses = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/_data/courseSessions.json'), 'utf8')).courses;
const MONTHS = ['janvārī', 'februārī', 'martā', 'aprīlī', 'maijā', 'jūnijā', 'jūlijā', 'augustā', 'septembrī', 'oktobrī', 'novembrī', 'decembrī'];
const lvDate = (iso) => { const d = new Date(iso + 'T12:00:00'); return `${d.getDate()}. ${MONTHS[d.getMonth()]}`; };
function compose(p, out) {
  const slug = (p.cta && p.cta.href || '').replace(/^\/|\/$/g, '');
  const c = courses[slug];
  const next = c && (c.sessions || []).map((x) => x.date || x).filter((d) => d > p.date).sort()[0];
  const course = next ? `${c.name}: ${lvDate(next)}, ${c.price} € + PVN.` : '';
  // No links in posts (13 Oct 2026): Facebook reportedly caps affected Pages at
  // 2 link posts a month and link posts get the fewest views; Instagram caption
  // links do not click. The link lives in the profile.
  // A lead-magnet post ends on its keyword instead: comment it, get the magnet by DM.
  const ask = p.magnet ? `Komentē ${p.magnet.keyword}, un nosūtīsim saiti privātā ziņā. Bez maksas.` : 'Saite profilā.';
  const text = `${out.teksts}\n\n${[course, ask].filter(Boolean).join('\n')}\n\n${out.tagi.join(' ')}`;
  return { facebook: text, instagram: text };
}

const cal = JSON.parse(fs.readFileSync(CAL, 'utf8'));
let done = 0;
for (const p of cal.posts) {
  if (ONLY && p.id !== ONLY) continue;
  if (COVERS) {
    if (!p.lv || !p.lv.visual || !p.format.startsWith('carousel') || p.status === 'killed') continue;
  } else if (CAPTIONS) {
    if (!p.lv || p.status === 'killed' || p.slot === 'story') continue;
    if (p.lv.caption && !FORCE) continue;
  } else if (SLIDES) {
    if (!p.lv || p.status === 'killed' || dataOnly(p)) continue;
    if (p.lv.visual && !FORCE) continue;
  } else if (p.lv && !FORCE) continue;
  let out = await ask(p);
  let bad = problems(p, out);
  if (bad.length) { out = await ask(p, bad.join('; ')); bad = problems(p, out); }
  if (COVERS) {
    if (!bad.length) { p.lv.virsraksts_was = p.lv.virsraksts_was || p.lv.virsraksts; p.lv.virsraksts = out.virsraksts; p.lv.visual.akcents = out.akcents; }
    else p.lv.cover_check = bad.join('; ');
    console.log(`${p.date}  ${out && out.virsraksts}${bad.length ? `   [CHECK: ${bad.join('; ')}]` : ''}`);
  } else if (CAPTIONS) {
    p.lv.caption = { ...(out || {}), ...(out && out.teksts && Array.isArray(out.tagi) ? compose(p, out) : {}), model: MODEL, written: new Date().toISOString().slice(0, 10) };
    if (bad.length) p.lv.caption.check = bad.join('; ');
    console.log(`${p.date}  ${(out && out.teksts || '').split('\n')[0]}${bad.length ? `   [CHECK: ${bad.join('; ')}]` : ''}`);
  } else if (SLIDES) {
    p.lv.visual = { ...(out || {}), model: MODEL, written: new Date().toISOString().slice(0, 10) };
    if (bad.length) p.lv.visual.check = bad.join('; ');
    console.log(`${p.date}  ${shapeOf(p)}  ${(out && (out.slaidi || []).map((x) => x.virsraksts).join(' / ')) || (out && out.teksts) || ''}${bad.length ? `   [CHECK: ${bad.join('; ')}]` : ''}`);
  } else {
    p.lv = { ...(out || {}), model: MODEL, written: new Date().toISOString().slice(0, 10) };
    if (bad.length) p.lv.check = bad.join('; ');
    console.log(`${p.date}  ${p.lv.virsraksts}${bad.length ? `   [CHECK: ${bad.join('; ')}]` : ''}`);
  }
  done++;
}
fs.writeFileSync(CAL, JSON.stringify(cal, null, 2) + '\n');
console.log(`${done} post(s) written with ${MODEL}.`);
