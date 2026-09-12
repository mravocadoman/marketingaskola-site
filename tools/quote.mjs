// Render one LIAA cenu piedāvājums from templates/cenu-piedavajums.html.
//
//   node tools/quote.mjs --offer=materiali --client="SIA Piemērs" --regnr=40000000000 \
//        --contact="Jānis Bērziņš, janis@piemers.lv" [--nr=2026-001] [--valid=30] [--html]
//
// Prices and scope rows come from src/_data/liaa.json, the same file the web
// pages render, so a quote can never quote a price the site does not show.
// Output: a PDF next to the repo root unless --html, which writes the filled
// HTML instead (useful to eyeball the layout without launching Chrome).
import fs from 'node:fs';
import path from 'node:path';
import { chromePath } from './_chrome.mjs';

const arg = (k, d) => {
  const hit = process.argv.find((a) => a.startsWith(`--${k}=`));
  return hit ? hit.slice(k.length + 3) : d;
};
const liaa = JSON.parse(fs.readFileSync('src/_data/liaa.json', 'utf8'));
const site = JSON.parse(fs.readFileSync('src/_data/site.json', 'utf8'));

const offer = liaa.offers.find((o) => o.id === arg('offer'));
if (!offer) {
  console.error(`--offer must be one of: ${liaa.offers.map((o) => o.id).join(', ')}`);
  process.exit(2);
}
const client = arg('client');
if (!client) { console.error('--client="<uzņēmuma nosaukums>" is required'); process.exit(2); }

/* Latvian number formatting: no-break thousands, comma decimal. The quote is a
   financial document, so the VAT and gross lines carry cents even when round. */
const lvEur = (n) => n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d),)/g, ' ');
const net = offer.price;
const vat = net * 0.21;
const support = net * liaa.programme.rate / 100;

const days = Number(arg('valid', 30));
const today = new Date();
const valid = new Date(today.getTime() + days * 864e5);
const lvDate = (d) => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}.`;

/* One priced line per scope row keeps the quote comparable with a competitor's
   and lets the buyer drop a position without re-quoting the whole thing. The
   split is proportional and rounded so the lines add up to the fixed total
   exactly - a quote whose column does not sum is the first thing a reviewer
   notices. */
const share = net / offer.scope.length;
const lines = offer.scope.map((_, i) =>
  i === offer.scope.length - 1 ? net - Math.round(share) * (offer.scope.length - 1) : Math.round(share));

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const rows = offer.scope.map((r, i) =>
  `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td><td class="n">${lvEur(lines[i])}</td></tr>`).join('\n    ');

const fill = {
  'company.name': site.company.name, 'company.address': site.company.address,
  'company.regNr': site.company.regNr, 'company.vat': site.company.vat,
  email: site.email, phone: site.phone,
  quoteNr: arg('nr', `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`),
  date: lvDate(today), validUntil: lvDate(valid),
  'client.name': client, 'client.regNr': arg('regnr', '—'), 'client.contact': arg('contact', ''),
  'offer.name': offer.name, 'offer.lead': offer.lead, 'offer.category': offer.category, 'offer.term': offer.term,
  rows, inputs: offer.inputs.map((i) => `<li>${esc(i)}</li>`).join('\n  '),
  priceNet: lvEur(net), priceVat: lvEur(vat), priceGross: lvEur(net + vat),
  rate: liaa.programme.rate, priceSupport: lvEur(support), priceOwn: lvEur(net - support),
};

let html = fs.readFileSync('templates/cenu-piedavajums.html', 'utf8');
for (const [k, v] of Object.entries(fill)) html = html.split(`{{ ${k} }}`).join(v);
const left = html.match(/\{\{ [^}]+ \}\}/g);
if (left) { console.error(`template placeholders left unfilled: ${[...new Set(left)].join(', ')}`); process.exit(1); }

const slug = client.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const out = arg('out', `cenu-piedavajums-${offer.id}-${slug}.${arg('html', null) === null && !process.argv.includes('--html') ? 'pdf' : 'html'}`);

if (out.endsWith('.html')) {
  fs.writeFileSync(out, html);
} else {
  const { default: puppeteer } = await import('puppeteer-core');
  const b = await puppeteer.launch({ executablePath: chromePath(), headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setContent(html, { waitUntil: 'load' });
  await p.pdf({ path: out, format: 'A4', printBackground: true });
  await b.close();
}
console.log(`${out} — ${offer.name}, ${lvEur(net)} € bez PVN, ${path.basename(out)}`);
