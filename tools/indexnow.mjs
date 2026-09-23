// Tell Bing (and so Copilot and ChatGPT's search) which pages changed today.
//
// IndexNow wants the URLs that CHANGED, not the whole site, so this reads the
// built sitemap and submits only the entries whose lastmod is today. The
// sitemap's lastmod comes from git, so "today" means a page whose source was
// committed today - exactly the set a deploy just published. Nothing to submit
// is the normal case on a deploy that only touched CSS, and it exits quietly.
import fs from 'node:fs';

const site = JSON.parse(fs.readFileSync(new URL('../src/_data/site.json', import.meta.url), 'utf8'));
const key = site.indexNowKey;
if (!key) { console.log('indexnow: no key in site.json, nothing submitted'); process.exit(0); }

const xml = fs.readFileSync(new URL('../_site/sitemap.xml', import.meta.url), 'utf8');
const today = new Date().toISOString().slice(0, 10);
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)]
  .filter((m) => m[2].slice(0, 10) === today)
  .map((m) => m[1]);

if (!urls.length) { console.log('indexnow: no pages dated today, nothing submitted'); process.exit(0); }

const host = new URL(site.url).host;
const body = { host, key, keyLocation: `${site.url}/${key}.txt`, urlList: urls };
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});
// 200 and 202 both mean accepted; 422 usually means the key file is not live yet.
console.log(`indexnow: ${res.status} ${res.statusText} for ${urls.length} url(s)`);
urls.slice(0, 10).forEach((u) => console.log('  ' + u));
if (!res.ok && res.status !== 202) process.exit(1);
