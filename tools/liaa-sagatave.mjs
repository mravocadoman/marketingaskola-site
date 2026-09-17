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
const eur = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
const d = new Date();
const lvDate = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}.`;

const fill = {
  'company.name': site.company.name, email: site.email, phone: site.phone,
  date: lvDate,
  'programme.name': p.name, programmeUrl: p.url,
  rate: p.rate, yearCap: eur(p.yearCap), turnoverShare: p.turnoverShare,
  applyUntil: p.applyUntil, claimBy: p.claimBy, quotes: p.quotes,
  lastYear: p.lastYear, decisionDays: p.decisionDays,
  procurementThreshold: eur(p.procurementThreshold),
  gates: p.gates.map((g) => `<li>${esc(g)}</li>`).join('\n  '),
  sectors: p.excludedSectors.map((s) => `<li>${esc(s[0].toUpperCase() + s.slice(1))}</li>`).join('\n  '),
  // The CTA's two offers, from the same file the pages and the quote read -
  // a price typed into this PDF would be the one place it could go stale.
  // Ex-VAT on every line, per CONTENT-RULES rule 3.
  offers: liaa.offers.map((o) =>
    `<div class="offer"><span>${esc(o.nav)}</span><b>${eur(o.price)}\u00a0€<small>bez PVN</small></b></div>`).join('\n    '),
  // UTM-tagged so GA4 can tell a visit that came from the PDF from one that
  // came from the popup or the page; #pieteikums lands on the quote form.
  ctaUrl: 'https://marketingaskola.lv/liaa-eksporta-atbalsts/?utm_source=sagatave&amp;utm_medium=pdf&amp;utm_campaign=liaa#pieteikums',
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
  // preferCSSPageSize is what makes the template's @page size AND margins
  // count. Without it puppeteer uses its own margin option, which defaults to
  // 0, and the PDF prints edge to edge however the CSS is written.
  const OPTS = { format: 'A4', preferCSSPageSize: true, printBackground: true };
  await page.pdf({ path: 'src/faili/eksporta-atbalsts-sagatave.pdf', ...OPTS });

  /* --png=<dir>: rasterise each REAL page, not a mock-up of one. Every page is
   * printed on its own with pageRanges (Chrome lays out the whole document
   * first, so a page printed alone is identical to that page in the full PDF)
   * and handed to macOS Quick Look. A screenshot of the HTML in a
   * page-sized box is NOT this check - that is how zero margins shipped. */
  const pngDir = (process.argv.find((a) => a.startsWith('--png=')) || '').slice(6);
  if (pngDir) {
    const { execFileSync } = await import('node:child_process');
    fs.mkdirSync(pngDir, { recursive: true });
    for (const n of [1, 2]) {
      const one = `${pngDir}/page-${n}.pdf`;
      await page.pdf({ path: one, ...OPTS, pageRanges: String(n) });
      execFileSync('qlmanage', ['-t', '-s', '1400', '-o', pngDir, one], { stdio: 'ignore' });
      fs.renameSync(`${one}.png`, `${pngDir}/page-${n}.png`);
    }
    console.log(`page images: ${pngDir}/page-1.png, ${pngDir}/page-2.png`);
  }
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
