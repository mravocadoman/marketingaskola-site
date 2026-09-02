// Smoke-test a deployed copy of the site against its own sitemap.
//   BASE=https://marketingaskola.lv node tools/check-live.mjs          (production)
//   BASE=https://mravocadoman.github.io/marketingaskola-site node tools/check-live.mjs
//   BASE=http://localhost:8385 node tools/check-live.mjs
// Every sitemap URL must answer 200 with its canonical; production must not
// carry noindex and must honour the .htaccess redirects. Exit 1 on failure.
const PROD = 'https://marketingaskola.lv';
const BASE = (process.env.BASE || PROD).replace(/\/$/, '');
const isProd = BASE === PROD;
const withRedirects = isProd || process.env.REDIRECTS === '1';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const get = (path, opts = {}) => fetch(BASE + path, { redirect: 'manual', ...opts });
const t0 = Date.now();

const sm = await get('/sitemap.xml');
ok(sm.status === 200, `sitemap.xml -> ${sm.status}`);
const locs = [...(await sm.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
ok(locs.length > 50, `sitemap has only ${locs.length} urls`);

let checked = 0;
const queue = [...locs];
await Promise.all(Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const loc = queue.shift();
    const path = loc.replace(PROD, '');
    try {
      const r = await get(path);
      const html = await r.text();
      ok(r.status === 200, `${path} -> ${r.status}`);
      ok(/text\/html/.test(r.headers.get('content-type') || ''), `${path} content-type ${r.headers.get('content-type')}`);
      ok(html.includes(`<link rel="canonical" href="${loc}">`), `${path} canonical missing/wrong`);
      if (isProd) ok(!/name="robots" content="noindex"/.test(html), `${path} is noindex on production`);
      checked++;
    } catch (e) { fails.push(`${path} ${e.message}`); }
  }
}));

for (const [path, type] of [
  ['/feed.xml', 'xml'], ['/site.webmanifest', 'json'], ['/favicon.ico', 'icon'],
  ['/css/style.css', 'css'], ['/css/fonts.css', 'css'], ['/fonts/inter-var-latin.woff2', 'woff2'],
  ['/img/og-default.jpg', 'jpeg'], ['/video/lumi-2.webp', 'webp'],
]) {
  const r = await get(path, { method: 'HEAD' });
  ok(r.status === 200, `${path} -> ${r.status}`);
  ok((r.headers.get('content-type') || '').includes(type), `${path} content-type ${r.headers.get('content-type')}`);
}
const v = await get('/video/lumi-2.mp4', { method: 'HEAD' });
ok(v.status === 200 && Number(v.headers.get('content-length')) > 1e6, `/video/lumi-2.mp4 -> ${v.status} ${v.headers.get('content-length')}`);

const nf = await get('/this-page-does-not-exist/');
ok(nf.status === 404, `unknown url -> ${nf.status} (want 404)`);
ok(/Šī lapa nav atrasta/.test(await nf.text()), 'unknown url does not serve the custom 404 page');

if (withRedirects) {
  const expect = async (from, to) => {
    const r = await get(from, { method: 'HEAD' });
    const loc = r.headers.get('location') || '';
    ok([301, 308].includes(r.status) && loc.replace(BASE, '').replace(PROD, '') === to, `${from} -> ${r.status} ${loc || '(no location)'}; want 301 ${to}`);
  };
  await expect('/7-padomi-marketinga-strategijas-izstrade/', '/marketinga-strategijas-izstrade/');
  await expect('/meta-reklamas-kursi/', '/meta-reklamas-kurss/');
  await expect('/seo-pakalpojumi/', '/pakalpojumi/');
  await expect('/feed/', '/feed.xml');
  await expect('/wp-content/uploads/2023/12/Untitled-design-5.mp4', '/video/lumi-2.mp4');
  const gone = await get('/wp-login.php', { method: 'HEAD' });
  ok(gone.status === 410, `/wp-login.php -> ${gone.status} (want 410)`);
  if (isProd) {
    for (const [url, want] of [['http://marketingaskola.lv/', 'https://marketingaskola.lv/'], ['https://www.marketingaskola.lv/', 'https://marketingaskola.lv/']]) {
      const r = await fetch(url, { redirect: 'manual', method: 'HEAD' });
      ok([301, 308].includes(r.status) && (r.headers.get('location') || '') === want, `${url} -> ${r.status} ${r.headers.get('location')}; want 301 ${want}`);
    }
  }
}

console.log(`${BASE}: ${checked}/${locs.length} sitemap urls checked, redirects ${withRedirects ? 'checked' : 'skipped'}, ${((Date.now() - t0) / 1000).toFixed(1)}s`);
for (const f of fails) console.log('  FAIL', f);
console.log(fails.length ? `${fails.length} failure(s)` : 'all good');
process.exit(fails.length ? 1 : 0);
