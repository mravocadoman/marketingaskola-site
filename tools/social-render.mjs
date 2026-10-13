// Render the social calendar's posts as images in the site's brand style.
//
//   node tools/social-render.mjs [--only=<id>]
//
// A post with "motion": true also gets 01.mp4: its cover as a 6 s loop, the
// artwork taking itself apart and assembling again piece by piece, the same
// pieces the site's headers are built from (piecesSvg in build-motifs.mjs).
// It opens and ends on the complete cover, so the first frame is a finished
// picture wherever a platform shows it as the thumbnail. Swipes after it are
// the still slides.
//
// Reads social/calendar.json (text written by tools/social-write-lv.mjs) and
// the site's own data (courseSessions.json, reviews.json), builds one HTML
// page per slide with the site's tokens, fonts and logo, and screenshots it
// through the same headless Chrome the other tools use. Output, per post:
// social/out/<id>/NN.png plus sheet.png, a contact sheet to judge a whole
// carousel at a glance. social/out/ is not committed.
//
// The look is the site's v7 ledger, not a new one: dark canvas, three text
// tiers, square geometry, the indexed eyebrow (cyan tick + cyan index chip +
// a rule to the edge), the keyword underline under ONE word of the headline,
// a cyan period at the end of it, cyan only where it marks something. All
// words are real HTML text, so the Latvian is exact; the only pixels with
// meaning are the house artwork and real screenshots.
//
// Every slide is measured after layout: if any text runs past its frame, the
// tool lists it and exits 1, so an overlong line is fixed in the copy rather
// than shipped cropped.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';
import { chromePath } from './_chrome.mjs';
import { piecesSvg } from './build-motifs.mjs';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const ONLY = arg('only', '');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const cal = read('social/calendar.json');
const courses = read('src/_data/courseSessions.json').courses;
const reviews = read('src/_data/reviews.json');
const OUT = path.join(ROOT, 'social/out');
const fileUrl = (p) => pathToFileURL(path.join(ROOT, p)).href;

const FEED = { w: 1080, h: 1350 };
const STORY = { w: 1080, h: 1920 };

const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// The headline: ONE word underlined (the writer's `akcents`), and the site's
// cyan full stop, or a cyan question mark when it asks.
function headline(text, accent) {
  // A number stays on the line of the word it counts ("7 noteikumi").
  let h = esc(text).replace(/(\d) /g, '$1\u00a0');
  accent = accent && accent.replace(/(\d) /g, '$1\u00a0'); text = text.replace(/(\d) /g, '$1\u00a0');
  if (accent && text.includes(accent)) h = h.replace(esc(accent), `<em>${esc(accent)}</em>`);
  if (/\?$/.test(text)) return h.replace(/\?$/, '<span class="mark">?</span>');
  if (/[\p{L}]$/u.test(text)) return h + '<span class="mark">.</span>';
  return h;
}
const MONTHS = ['janvārī', 'februārī', 'martā', 'aprīlī', 'maijā', 'jūnijā', 'jūlijā', 'augustā', 'septembrī', 'oktobrī', 'novembrī', 'decembrī'];
const lvDate = (iso) => { const d = new Date(iso + 'T12:00:00'); return `${d.getDate()}. ${MONTHS[d.getMonth()]}`; };
// The next course date after the post goes out, from the same data the site uses.
function nextCourse(slug, after) {
  const c = courses[slug];
  const dates = (c.sessions || []).map((s) => s.date || s).filter((d) => d > after).sort();
  return dates.length ? { date: dates[0], price: c.price, hours: c.hours } : null;
}
const courseSlugOf = (href) => (href || '').replace(/^\/|\/$/g, '');
const shortUrl = (href) => 'marketingaskola.lv' + (href || '/').replace(/\/$/, '').replace(/#.*$/, '');

const CSS = (size) => `
@font-face { font-family: 'Inter'; font-weight: 100 900; src: url('${fileUrl('src/fonts/inter-var-latin.woff2')}') format('woff2'); unicode-range: U+0000-00FF, U+2000-206F, U+20AC; }
@font-face { font-family: 'Inter'; font-weight: 100 900; src: url('${fileUrl('src/fonts/inter-var-latin-ext.woff2')}') format('woff2'); unicode-range: U+0100-02BA, U+1E00-1EFF; }
@font-face { font-family: 'Space Grotesk'; font-weight: 300 700; src: url('${fileUrl('src/fonts/space-grotesk-var-latin.woff2')}') format('woff2'); unicode-range: U+0000-00FF, U+2000-206F, U+20AC; }
@font-face { font-family: 'Space Grotesk'; font-weight: 300 700; src: url('${fileUrl('src/fonts/space-grotesk-var-latin-ext.woff2')}') format('woff2'); unicode-range: U+0100-02BA, U+1E00-1EFF; }
:root { --canvas: #020d1c; --band: #0e2743; --card: #00152c; --cyan: #03c3f8; --heading: #ffffff; --body: #c9d8e8; --muted: #8ba3bd;
  --line: rgba(255,255,255,0.08); --line-strong: rgba(255,255,255,0.16); --display: 'Space Grotesk', 'Inter', sans-serif; --text: 'Inter', sans-serif; }
* { box-sizing: border-box; }
html, body { margin: 0; width: ${size.w}px; height: ${size.h}px; background: var(--canvas); overflow: hidden; }
.frame { position: relative; width: ${size.w}px; height: ${size.h}px; padding: ${size.h > 1500 ? '200px 88px 300px' : '88px 88px 80px'}; display: flex; flex-direction: column; color: var(--body); font: 400 34px/1.45 var(--text); -webkit-font-smoothing: antialiased; }
.frame.band { background: var(--band); }
.eyebrow { display: flex; align-items: center; gap: 18px; font: 600 24px/1 var(--display); letter-spacing: 0.16em; text-transform: uppercase; color: var(--muted); }
.eyebrow .tick { width: 44px; height: 4px; background: var(--cyan); flex: none; }
.eyebrow .idx { background: var(--cyan); color: var(--card); padding: 8px 10px 7px; letter-spacing: 0.04em; }
.eyebrow .rule { flex: 1; height: 1px; background: var(--line-strong); }
h1, h2 { font-family: var(--display); font-weight: 600; color: var(--heading); letter-spacing: -0.02em; margin: 0; }
h1 { font-size: 88px; line-height: 1.04; margin-top: 44px; }
h2 { font-size: 62px; line-height: 1.08; }
em { font-style: normal; background: linear-gradient(var(--cyan), var(--cyan)) no-repeat 0 92% / 100% 0.13em; padding-bottom: 0.02em; }
.mark { color: var(--cyan); }
p { margin: 0; }
.lead { margin-top: 32px; font-size: 38px; line-height: 1.45; color: var(--body); max-width: 900px; }
.art { flex: 1; min-height: 0; margin-top: 40px; display: flex; align-items: center; justify-content: center; }
.art img { max-width: 100%; max-height: 100%; object-fit: contain; display: block; }
.art svg { width: 100%; height: 100%; display: block; }
.art .m { transform-box: view-box; }
.foot { margin-top: 40px; padding-top: 28px; border-top: 1px solid var(--line-strong); display: flex; align-items: center; justify-content: space-between; font: 500 24px/1 var(--display); letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
.foot img { height: 50px; display: block; }
.foot .kw { color: var(--cyan); font-weight: 700; }
/* A magnet cover carries its keyword as a bar, like the best-commented magnets
   seen on LinkedIn (13 Oct 2026): the ask is readable in the feed before a swipe. */
.coverkey { margin-top: 32px; display: flex; align-items: stretch; }
.coverkey .say { display: flex; align-items: center; padding: 0 26px; border: 2px solid var(--cyan); border-right: 0; font: 600 26px/1 var(--display); letter-spacing: 0.12em; text-transform: uppercase; color: var(--heading); }
.coverkey .word { padding: 18px 26px 14px; background: var(--cyan); color: var(--card); font: 700 56px/1 var(--display); }
.coverkey .free { display: flex; align-items: center; padding-left: 22px; font: 500 24px/1.2 var(--display); letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
/* Slide 2 is a hook of its own: Instagram re-shows a skipped carousel from it. */
.hook { flex: 1; display: flex; flex-direction: column; justify-content: center; padding-bottom: 40px; }
.hook .bar { width: 64px; height: 5px; background: var(--cyan); margin-bottom: 48px; }
.hook h2 { font-size: 84px; line-height: 1.06; }
.hook .text { margin-top: 36px; font-size: 46px; line-height: 1.4; color: var(--body); }
/* The gate: a lead-magnet post closes on its keyword. Comment it, get the
   magnet by DM (Zernio comment-to-DM, Meta private replies). Cyan is a surface
   here because it marks the one action, as on the site's buttons. */
.gate { flex: 1; display: flex; flex-direction: column; justify-content: center; padding-bottom: 20px; }
.gate h2 { font-size: 64px; }
.gate ul { margin: 34px 0 0; padding: 0; list-style: none; }
.gate li { position: relative; padding-left: 40px; margin-top: 16px; font-size: 36px; line-height: 1.35; color: var(--body); }
.gate li::before { content: ""; position: absolute; left: 0; top: 0.55em; width: 18px; height: 4px; background: var(--cyan); }
.keyword { margin-top: 56px; display: flex; align-items: stretch; }
.keyword .say { display: flex; align-items: center; padding: 0 30px; border: 2px solid var(--cyan); border-right: 0; font: 600 30px/1 var(--display); letter-spacing: 0.12em; text-transform: uppercase; color: var(--heading); }
.keyword .word { padding: 26px 34px 22px; background: var(--cyan); color: var(--card); font: 700 92px/1 var(--display); letter-spacing: 0.02em; }
.gate .after { margin-top: 26px; font: 500 28px/1.3 var(--display); letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
.point { flex: 1; display: flex; flex-direction: column; justify-content: center; padding-bottom: 40px; }
.num { font: 600 220px/0.85 var(--display); color: rgba(255,255,255,0.12); letter-spacing: -0.05em; }
.point h2 { margin-top: 40px; font-size: 72px; }
.point .text { margin-top: 32px; font-size: 44px; line-height: 1.42; color: var(--body); }
.point .bar { margin-top: 44px; width: 64px; height: 5px; background: var(--cyan); }
.cta { margin-top: auto; }
.cta .btn { display: inline-block; margin-top: 36px; padding: 26px 34px; background: var(--cyan); color: var(--card); font: 600 34px/1 var(--display); letter-spacing: 0; }
.cta .btn.long { font-size: 27px; }
.close { flex: 1; display: flex; flex-direction: column; justify-content: center; padding-bottom: 40px; }
.close h2 { font-size: 72px; }
.close .cta { margin-top: 24px; }
.cta .meta { margin-top: 22px; font: 500 26px/1.3 var(--display); letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
.quote { margin-top: 56px; font: 500 52px/1.32 var(--display); color: var(--heading); letter-spacing: -0.01em; }
.quote::before { content: "\\201C"; display: block; font-size: 140px; line-height: 0.6; color: var(--muted); margin-bottom: 18px; }
.who { margin-top: 40px; font: 600 30px/1.2 var(--display); color: var(--heading); }
.who span { display: block; margin-top: 10px; font-weight: 500; font-size: 22px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); }
.stars { display: inline-flex; gap: 6px; margin-top: 18px; }
.stars i { width: 30px; height: 30px; background: var(--heading); clip-path: polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); }
.panel { margin-top: auto; border: 1px solid var(--line-strong); border-top: 3px solid var(--cyan); padding: 36px 40px; background: var(--card); }
.panel .label { font: 600 22px/1 var(--display); letter-spacing: 0.16em; text-transform: uppercase; color: var(--muted); }
.panel .value { margin-top: 14px; font: 600 48px/1.1 var(--display); color: var(--heading); }
.stat { margin-top: 48px; font: 600 200px/0.9 var(--display); color: var(--heading); letter-spacing: -0.04em; }
.stat small { display: block; margin-top: 18px; font-size: 30px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); font-weight: 500; }
.shot { margin-top: 48px; border: 1px solid var(--line-strong); background: #fff; }
.shot img { display: block; width: 100%; }
.poll-space { flex: 1; min-height: 420px; }
`;

// A long article URL drops a size rather than wrapping onto two lines.
const btn = (href) => { const u = shortUrl(href); return `<div class="btn${u.length > 40 ? ' long' : ''}">${esc(u)}</div>`; };
const LOGO = fileUrl('src/img/logo.png');
const foot = (right) => `<div class="foot"><img src="${LOGO}" alt=""><span>${right}</span></div>`;
const eyebrow = (idx, label) => `<div class="eyebrow"><span class="tick"></span>${idx ? `<span class="idx">${idx}</span>` : ''}<span>${esc(label)}</span><span class="rule"></span></div>`;
const page = (size, inner, cls = '') => `<!doctype html><html lang="lv"><head><meta charset="utf-8"><style>${CSS(size)}</style></head><body><div class="frame ${cls}">${inner}</div></body></html>`;

// ---------- the four layouts ----------
function carousel(p) {
  const v = p.lv.visual;
  const total = 2 + (v.aki ? 1 : 0) + v.slaidi.length;
  const count = (n) => `${String(n).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  const slides = [];
  slides.push(page(FEED, `${eyebrow(null, p.pillar)}<h1>${headline(p.lv.virsraksts, v.akcents)}</h1>
    ${p._pieces ? `<div class="art">${p._pieces}</div>` : p.art ? `<div class="art"><img src="${fileUrl(p.art)}" alt=""></div>` : '<div class="art"></div>'}${p.magnet ? `<div class="coverkey"><span class="say">Komentē</span><span class="word">${esc(p.magnet.keyword)}</span><span class="free">Bez maksas</span></div>` : ''}${foot(count(1) + ' &nbsp;→')}`));
  if (v.aki) slides.push(page(FEED, `${eyebrow(null, p.pillar)}<div class="hook"><div class="bar"></div>
      <h2>${esc(v.aki.virsraksts)}</h2><div class="text">${esc(v.aki.teksts)}</div></div>${foot(count(2))}`));
  v.slaidi.forEach((s, i) => {
    slides.push(page(FEED, `${eyebrow(null, p.pillar)}<div class="point">
      <div class="num">${String(i + 1).padStart(2, '0')}</div>
      <h2>${esc(s.virsraksts)}</h2><div class="text">${esc(s.teksts)}</div><div class="bar"></div></div>
      ${foot(count(slides.length + 1))}`));
  });
  slides.push(page(FEED, (p.magnet ? gate(p.magnet) : closing(p, v.nosleguma_virsraksts, v.nosleguma_teksts)) + foot(count(total)), 'band'));
  return { size: FEED, slides };
}
function gate(m) {
  return `${eyebrow(null, 'Bez maksas')}<div class="gate"><h2>${esc(m.title)}</h2>
    <ul>${m.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <div class="keyword"><span class="say">Komentē</span><span class="word">${esc(m.keyword)}</span></div>
    <div class="after">Nosūtīsim saiti privātā ziņā</div></div>`;
}
function closing(p, title, text) {
  const course = p.cta && courses[courseSlugOf(p.cta.href)] ? nextCourse(courseSlugOf(p.cta.href), p.date) : null;
  return `${eyebrow(null, 'Ko darīt tālāk')}<div class="close"><h2>${esc(title)}</h2>
    <div class="lead">${esc(text)}</div>
    ${p.cta ? `<div class="cta">${btn(p.cta.href)}
      ${course ? `<div class="meta">${esc(p.cta.label)} · ${lvDate(course.date)} · ${course.price} € + PVN</div>` : `<div class="meta">${esc(p.cta.label)}</div>`}</div>` : ''}</div>`;
}
function single(p) {
  const v = p.lv.visual;
  const course = p.cta && courses[courseSlugOf(p.cta.href)] ? nextCourse(courseSlugOf(p.cta.href), p.date) : null;
  return { size: FEED, slides: [page(FEED, `${eyebrow(null, p.pillar)}<h1>${headline(p.lv.virsraksts, v.akcents)}</h1>
    <div class="lead">${esc(v.teksts)}</div>
    ${p.art ? `<div class="art"><img src="${fileUrl(p.art)}" alt=""></div>` : '<div style="flex:1"></div>'}
    ${foot(esc(course ? `${p.cta.label} · ${lvDate(course.date)}` : shortUrl(p.cta && p.cta.href)))}`)] };
}
function story(p) {
  const v = p.lv.visual;
  const poll = /poll/.test(p.format);
  return { size: STORY, slides: [page(STORY, `${eyebrow(null, p.pillar)}<h1 style="font-size:96px">${headline(p.lv.virsraksts, v.akcents)}</h1>
    <div class="lead" style="font-size:42px">${esc(v.teksts)}</div>
    ${poll ? '<div class="poll-space"></div>' : p.art ? `<div class="art"><img src="${fileUrl(p.art)}" alt=""></div>` : '<div style="flex:1"></div>'}
    ${p.cta ? `<div class="cta" style="margin-top:40px">${btn(p.cta.href)}</div>` : ''}
    ${foot(poll ? 'Atbildi aptaujā' : 'marketingaskola.lv')}`)] };
}
function reviewStory(p) {
  const r = reviews.items.linda;
  const course = nextCourse('meta-reklamas-kurss', p.date);
  return { size: STORY, slides: [page(STORY, `${eyebrow(null, 'Atsauksmes')}
    <div class="quote">${esc(r.text)}</div>
    <div class="who">${esc(r.name)}<span>${esc(r.source)} atsauksme · ${esc(r.topic)}</span></div>
    <div class="stars"><i></i><i></i><i></i><i></i><i></i></div>
    <div class="panel"><div class="label">Nākamā grupa</div><div class="value">${lvDate(course.date)} · ${course.price} € + PVN</div></div>
    <div class="cta" style="margin-top:36px">${btn(p.cta.href)}</div>
    ${foot('marketingaskola.lv')}`)] };
}
function resultStory(p) {
  return { size: STORY, slides: [page(STORY, `${eyebrow(null, 'Rezultāti')}
    <h1 style="font-size:96px">Četras Zoles<span class="mark">.</span></h1>
    <div class="stat">36,34<small>ROAS pēc pirmajiem 1 000 € reklāmā</small></div>
    <div class="shot"><img src="${fileUrl(p.art)}" alt=""></div>
    <div style="flex:1"></div>
    <div class="cta">${btn(p.cta.href)}</div>
    ${foot('marketingaskola.lv')}`)] };
}
const layoutOf = (p) => (/review card/.test(p.format) ? reviewStory(p) : /result card/.test(p.format) ? resultStory(p)
  : p.format.startsWith('carousel') ? carousel(p) : p.slot === 'story' ? story(p) : single(p));

// ---------- render ----------
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: 'new', args: ['--allow-file-access-from-files'] });
const tab = await browser.newPage();
let failed = 0;
// An idea row has no Latvian yet and nothing to render.
const posts = cal.posts.filter((p) => (!ONLY || p.id === ONLY) && p.status !== 'killed' && p.lv);
// The motion timeline, in seconds. Bigger than the site's motif-in on
// purpose: a 1080px frame shows at ~390pt on a phone, so the site's 12px rise
// reads as 4pt and nobody sees it. Hold the finished cover, take the pieces
// away last-in-first-out with the underline, a short empty beat, draw the
// underline, assemble the pieces in drawing order, hold.
const FPS = 30, SECONDS = 6;
const ease = { in: (x) => x * x * x, out: (x) => 1 - Math.pow(1 - x, 4) };
const clamp = (x) => Math.max(0, Math.min(1, x));
function poseAt(t, rank, n) {
  const gone = ease.in(clamp((t - (0.8 + (n - 1 - rank) * 0.04)) / 0.3));
  const back = ease.out(clamp((t - (1.75 + rank * Math.min(0.11, 1.3 / Math.max(n - 1, 1)))) / 0.6));
  const hidden = t < 1.5 ? gone : 1 - back;   // 0 = in place, 1 = away
  return { o: 1 - hidden, y: 70 * hidden, s: 1 - 0.15 * hidden };
}
const lineAt = (t) => (t < 1.5 ? 1 - ease.in(clamp((t - 0.8) / 0.3)) : ease.out(clamp((t - 1.5) / 0.45)));
async function recordCover(p, dir) {
  const frames = path.join(dir, '_frames');
  fs.mkdirSync(frames, { recursive: true });
  await tab.goto(pathToFileURL(path.join(dir, '01.html')).href, { waitUntil: 'load' });
  await tab.evaluate(() => document.fonts.ready);
  const n = await tab.evaluate(() => document.querySelectorAll('.art .m').length);   // in drawing order
  for (let f = 0; f < FPS * SECONDS; f++) {
    const t = f / FPS;
    const poses = Array.from({ length: n }, (_, k) => poseAt(t, k, n));
    await tab.evaluate((poses, line) => {
      document.querySelectorAll('.art .m').forEach((g, k) => {
        g.style.opacity = poses[k].o;
        g.style.transform = `translateY(${poses[k].y}px) scale(${poses[k].s})`;
      });
      const em = document.querySelector('h1 em');
      if (em) em.style.backgroundSize = `${line * 100}% 0.13em`;
    }, poses, lineAt(t));
    await tab.screenshot({ path: path.join(frames, `${String(f).padStart(3, '0')}.png`) });
  }
  // H.264 + a silent AAC track: Instagram's API has refused video with no audio stream.
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(frames, '%03d.png'),
    '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-shortest', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
    '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '64k', '-movflags', '+faststart', path.join(dir, '01.mp4')]);
  fs.rmSync(frames, { recursive: true, force: true });
}

for (const p of posts) {
  if (p.motion && p.art && p.format.startsWith('carousel')) p._pieces = (await piecesSvg(path.join(ROOT, p.art), fileUrl(p.art), 'cover', '')).svg;
  const { size, slides } = layoutOf(p);
  const dir = path.join(OUT, p.id);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  await tab.setViewport({ width: size.w, height: size.h, deviceScaleFactor: 1 });
  const pngs = [];
  for (let i = 0; i < slides.length; i++) {
    const html = path.join(dir, `${String(i + 1).padStart(2, '0')}.html`);
    fs.writeFileSync(html, slides[i]);
    await tab.goto(pathToFileURL(html).href, { waitUntil: 'load' });
    await tab.evaluate(() => document.fonts.ready);
    // Anything that does not fit its frame is a copy problem, not a crop.
    const over = await tab.evaluate(() => {
      const f = document.querySelector('.frame');
      const bad = [];
      if (f.scrollHeight > f.clientHeight + 1) bad.push(`content ${f.scrollHeight - f.clientHeight}px too tall`);
      document.querySelectorAll('h1, h2, .lead, .text, .quote').forEach((el) => { if (el.scrollWidth > el.clientWidth + 1) bad.push(`${el.tagName} too wide`); });
      return bad;
    });
    if (over.length) { failed++; console.error(`OVERFLOW ${p.id} slide ${i + 1}: ${over.join(', ')}`); }
    const png = html.replace(/\.html$/, '.png');
    await tab.screenshot({ path: png });
    pngs.push(png);
  }
  // Contact sheet: every slide of the post side by side.
  const W = 360, H = Math.round(W * size.h / size.w), G = 16;
  const tiles = await Promise.all(pngs.map((f) => sharp(f).resize(W, H).toBuffer()));
  await sharp({ create: { width: pngs.length * (W + G) - G, height: H, channels: 3, background: '#ffffff' } })
    .composite(tiles.map((b, i) => ({ input: b, left: i * (W + G), top: 0 }))).png().toFile(path.join(dir, 'sheet.png'));
  if (p._pieces) await recordCover(p, dir);
  console.log(`${p.date}  ${p.id}  ${pngs.length} image(s)${p._pieces ? ' + 01.mp4' : ''}`);
}
await browser.close();
if (failed) { console.error(`${failed} slide(s) overflow. Shorten the copy and render again.`); process.exit(1); }
