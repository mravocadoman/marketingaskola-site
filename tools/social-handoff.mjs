// Hand a finished social post over to the one posting calendar (Notion), so it shows in Post Desk.
//
//   node tools/social-handoff.mjs <post-id> [--date=YYYY-MM-DD]
//
// Since 3 Nov 2026 the Notion Content Calendar is the only schedule: Rihards's English posts and every
// Latvian post for the Mārketinga Skola Facebook page and Instagram sit there side by side, and Post Desk
// is where he reads, edits, reorders and approves them. social/calendar.json stays the workshop (briefs,
// facts, copy, renders); this tool is the step after checkpoint 3.
//
// For the post it converts social/out/<id>/NN.png to JPG, uploads the JPGs (and 01.mp4, the moving cover)
// through HOST_HOOK to download/lv/ms-<id>-NN.jpg, checks each upload byte for byte, and writes
// social/out/<id>/notion.md: the row's name, properties and page body (=== FINAL POST LV ===, LV SLIDES,
// MAGNET URL). The session then creates the row with the Notion connector from that file and publishes
// slide 1 with Post Desk as covers/ms-<id>-01.jpg. Approval on an "MS · " row is the Post Ready box, never
// Approved: the English 08:00 packager reads Approved and would stall on a row with no English post.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const id = process.argv.slice(2).find((a) => !a.startsWith('--'));
const dateArg = (process.argv.find((a) => a.startsWith('--date=')) || '').slice(7);
if (!id) { console.error('usage: node tools/social-handoff.mjs <post-id> [--date=YYYY-MM-DD]'); process.exit(1); }

const cal = JSON.parse(fs.readFileSync(path.join(ROOT, 'social/calendar.json'), 'utf8'));
const post = cal.posts.find((p) => p.id === id);
if (!post) { console.error(`no post ${id} in social/calendar.json`); process.exit(1); }
const caption = post.lv?.caption?.instagram || post.lv?.caption?.facebook || post.lv?.virsraksts;
if (!caption) { console.error(`${id} has no Latvian caption yet: write it first (checkpoint 3)`); process.exit(1); }

const hook = (fs.readFileSync(path.join(ROOT, '.env'), 'utf8').match(/^HOST_HOOK=["']?([^"'\n]+)/m) || [])[1];
if (!hook) { console.error('HOST_HOOK is missing from .env'); process.exit(1); }
const BASE = 'https://yxdtomxgsqaguqjhutgq.supabase.co/functions/v1/download/lv/';
const md5 = (buf) => crypto.createHash('md5').update(buf).digest('hex');

async function upload(name, buf, type) {
  const form = new FormData();
  form.append('file', new Blob([buf], { type }), name);
  const res = await fetch(`${hook}&folder=lv`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`upload ${name}: HTTP ${res.status}`);
  const back = Buffer.from(await (await fetch(`${BASE}${name}?v=${Date.now()}`)).arrayBuffer());
  if (md5(back) !== md5(buf)) throw new Error(`upload ${name}: the hosted copy differs`);
  return BASE + name;
}

const dir = path.join(ROOT, 'social/out', id);
const pngs = fs.readdirSync(dir).filter((f) => /^\d\d\.png$/.test(f)).sort();
if (!pngs.length) { console.error(`no slides in social/out/${id}: render it first`); process.exit(1); }
const urls = [];
if (fs.existsSync(path.join(dir, '01.mp4'))) urls.push(await upload(`ms-${id}-01.mp4`, fs.readFileSync(path.join(dir, '01.mp4')), 'video/mp4'));
for (const f of pngs) {
  const jpg = await sharp(path.join(dir, f)).jpeg({ quality: 90 }).toBuffer();
  if (f === '01.png') fs.writeFileSync(path.join(dir, `ms-${id}-01.jpg`), jpg);   // for Post Desk's covers/
  urls.push(await upload(`ms-${id}-${f.replace('.png', '.jpg')}`, jpg, 'image/jpeg'));
}

const date = dateArg || post.date;
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const d = new Date(date + 'T12:00:00Z');
const kw = post.magnet?.keyword;
const name = `MS · ${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} · ${post.lv.virsraksts}${kw ? ` (${kw})` : post.slot === 'story' ? ' (STORY)' : ''}`;
// Notion reads a line that starts with "#" as a heading and "1." as a list: escape them, as Post Desk does.
const esc = (s) => s.replace(/^(\s*)([#+])/gm, '$1\\$2').replace(/^(\s*\d+)\.(?=\s)/gm, '$1\\.');
const body = [
  '=== FINAL POST LV ===', '', esc(caption.trim()), '',
  '=== LV SLIDES ===', '', urls.join('\n'),
  ...(post.magnet?.url ? ['', '=== MAGNET URL ===', '', `https://marketingaskola.lv${post.magnet.url}`] : []),
].join('\n');
const props = {
  Name: name, 'date:Date:start': date, 'date:Date:is_datetime': 0, Category: '📱 Social Content', Status: 'Draft',
  'Day Type': kw ? 'Lead Magnet' : 'Free Value', Approved: '__NO__', 'Post Ready': '__NO__',
  'Topic Angle': `MĀRKETINGA SKOLA · LATVIAN ONLY · Facebook page + Instagram (${post.format}). From social/calendar.json id ${id}.` +
    (kw ? ` Keyword ${kw}: comment-to-DM in Zernio, guide ${post.magnet.url}.` : '') + ' Approve with Post Ready, never Approved.',
};
fs.writeFileSync(path.join(dir, 'notion.md'), `PROPERTIES\n${JSON.stringify(props, null, 2)}\n\nBODY\n${body}\n`);
console.log(`${id}: ${urls.length} files hosted, row ready in social/out/${id}/notion.md`);
console.log(`Post Desk cover: social/out/${id}/ms-${id}-01.jpg -> covers/ms-${id}-01.jpg`);
