// Renders one newsletter issue into the house e-mail template.
//
//   npm run newsletter -- newsletters/2026-10-jaunumi.json
//
// writes newsletters/2026-10-jaunumi.html: the whole e-mail, ready to become a
// Sender campaign draft (the Sender connector takes HTML as the body). Issues
// are JSON so the words get reviewed once and the markup is never touched.
//
// Keep every sentence gender-neutral. Latvian participles change with gender
// (pieteicies / pieteikusies), which is why the MailerLite sends went out in two
// versions; one neutral text makes the split unnecessary.
import fs from 'node:fs';

const file = process.argv[2];
if (!file || !file.endsWith('.json')) {
  console.error('usage: npm run newsletter -- newsletters/<issue>.json');
  process.exit(1);
}
const issue = JSON.parse(fs.readFileSync(file, 'utf8'));
for (const key of ['subject', 'preheader', 'utm_campaign', 'title', 'cta']) {
  if (!issue[key]) { console.error(`issue is missing "${key}"`); process.exit(1); }
}

const [page, blocks] = fs.readFileSync('templates/newsletter.html', 'utf8').split('<!-- BLOCKS -->');
const block = (name) => {
  const m = blocks.match(new RegExp(`<!-- ${name} -->([\\s\\S]*?)<!-- /${name} -->`));
  if (!m) throw new Error(`template block "${name}" is missing`);
  return m[1].trim();
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Links back to the site carry the issue's UTM tags, so GA4 tells a newsletter
// visit apart from the popup, the ads and the PDF. Other hosts are left alone.
const track = (href) => {
  const u = new URL(href, 'https://marketingaskola.lv');
  if (u.hostname === 'marketingaskola.lv') {
    u.searchParams.set('utm_source', 'sender');
    u.searchParams.set('utm_medium', 'email');
    u.searchParams.set('utm_campaign', issue.utm_campaign);
  }
  return esc(u.toString());
};
const fill = (tpl, values) => tpl.replace(/\{\{(\w+)\}\}/g, (all, key) => (key in values ? values[key] : all));
const paras = (list = []) => list.map((text) => fill(block('para'), { text: esc(text) })).join('\n');

// CONTENT-RULES.md rule 6: an issue that mentions LIAA carries the pages' disclaimer word
// for word. It is read from the include the pages render, so the e-mail cannot drift from
// them; only the "Par šo lapu." label goes, because an e-mail is not a page.
const liaaDisclaimer = fs.readFileSync('src/_includes/liaa-disclaimer.njk', 'utf8')
  .replace(/\{#[\s\S]*?#\}/g, '').replace(/<strong>[\s\S]*?<\/strong>/, '').replace(/<[^>]+>/g, '').trim();
if (!liaaDisclaimer.includes('LIAA')) { console.error('could not read the LIAA disclaimer'); process.exit(1); }
const mentionsLiaa = JSON.stringify(issue, (key, value) => (key.startsWith('_') ? undefined : value)).includes('LIAA');

const html = fill(page, {
  subject: esc(issue.subject),
  preheader: esc(issue.preheader),
  site: track('/'),
  title: esc(issue.title),
  intro: paras(issue.intro),
  items: (issue.items || []).map((it) => fill(block('item'), {
    eyebrow: esc(it.eyebrow), title: esc(it.title), text: esc(it.text), link: esc(it.link), url: track(it.url),
  })).join('\n'),
  cta_text: esc(issue.cta.text),
  cta_url: track(issue.cta.url),
  outro: paras(issue.outro),
  fine: mentionsLiaa ? fill(block('fine'), { text: esc(liaaDisclaimer) }) : '',
});

// An unfilled slot or a missing unsubscribe link must never reach a list.
const left = html.match(/\{\{\w+\}\}/);
if (left) { console.error(`unfilled slot ${left[0]}`); process.exit(1); }
if (!html.includes('href="{$unsubscribe_link}"')) { console.error('the unsubscribe link is missing'); process.exit(1); }

const out = file.replace(/\.json$/, '.html');
fs.writeFileSync(out, html);
console.log(`${out}: ${(issue.items || []).length} items, ${Buffer.byteLength(html)} bytes`);
