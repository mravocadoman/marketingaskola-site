// Render the lead magnet's download: templates/eksporta-atbalsts-sagatave.html
// -> src/faili/eksporta-atbalsts-sagatave.pdf
//
//   npm run sagatave            # rewrite the committed PDF
//   npm run sagatave -- --html  # the filled HTML instead, to eyeball the layout
//
// Every figure comes from src/_data/liaa.json, so this PDF cannot state a rate
// the site does not. RE-RUN IT after any change to that file: the document is
// committed, and nothing else notices when it goes stale.
import fs from 'node:fs';
import { chromePath } from './_chrome.mjs';

const liaa = JSON.parse(fs.readFileSync('src/_data/liaa.json', 'utf8'));
const site = JSON.parse(fs.readFileSync('src/_data/site.json', 'utf8'));
const p = liaa.programme;

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const eur = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const d = new Date();
const lvDate = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}.`;

const fill = {
  'company.name': site.company.name, email: site.email, phone: site.phone,
  date: lvDate,
  'programme.name': p.name, programmeUrl: p.url,
  rate: p.rate, yearCap: eur(p.yearCap), turnoverShare: p.turnoverShare,
  applyUntil: p.applyUntil, claimBy: p.claimBy, quotes: p.quotes,
  procurementThreshold: eur(p.procurementThreshold),
  gates: p.gates.map((g) => `<li>${esc(g)}</li>`).join('\n  '),
  sectors: p.excludedSectors.map((s) => `<li>${esc(s[0].toUpperCase() + s.slice(1))}</li>`).join('\n  '),
};

let html = fs.readFileSync('templates/eksporta-atbalsts-sagatave.html', 'utf8');
for (const [k, v] of Object.entries(fill)) html = html.split(`{{ ${k} }}`).join(v);
const left = html.match(/\{\{ [^}]+ \}\}/g);
if (left) { console.error(`template slots left unfilled: ${[...new Set(left)].join(', ')}`); process.exit(1); }

// --html writes OUTSIDE src/ by default: an .html file under src/faili would be
// picked up by Eleventy as a template and published as a page of its own.
const htmlOut = (process.argv.find((a) => a.startsWith('--out=')) || '').slice(6);
if (process.argv.includes('--html')) {
  const to = htmlOut || 'eksporta-atbalsts-sagatave.html';
  fs.writeFileSync(to, html);
  console.log(to);
} else {
  const { default: puppeteer } = await import('puppeteer-core');
  const b = await puppeteer.launch({ executablePath: chromePath(), headless: 'new', args: ['--no-sandbox'] });
  const page = await b.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  fs.mkdirSync('src/faili', { recursive: true });
  await page.pdf({ path: 'src/faili/eksporta-atbalsts-sagatave.pdf', format: 'A4', printBackground: true });
  await b.close();

  /* The document is TWO pages by design - the programme, then the procurement.
   * The first version silently ran to four, with a near-empty page and a
   * section stranded at the foot of another, and nothing noticed. Chrome writes
   * these page objects uncompressed, so counting them is the cheap check that
   * the copy still fits after an edit. */
  const raw = fs.readFileSync('src/faili/eksporta-atbalsts-sagatave.pdf');
  const pages = (raw.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  if (pages !== 2) {
    console.error(`${pages} pages, expected 2 - the copy no longer fits. Shorten a section or move it to the other page; do not just let it spill.`);
    process.exit(1);
  }
  console.log(`src/faili/eksporta-atbalsts-sagatave.pdf - ${pages} pages, ${(raw.length / 1024).toFixed(0)} KB, ${p.rate}% / ${eur(p.yearCap)} €, sagatavots ${lvDate}`);
}
