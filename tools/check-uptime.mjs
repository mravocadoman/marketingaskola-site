#!/usr/bin/env node
/* Daily uptime probe. It exists because of 2 Oct 2026: SiteGround's proxy
 * cache was found serving a bodyless 304 for the HOMEPAGE to every browser
 * that had no cached copy of it. Anyone who had visited before saw a normal
 * site, so it went unnoticed for days, and no deploy-time check can catch it -
 * the cache is poisoned BETWEEN deploys, not during one.
 *
 * Two rules decide how it fetches, and both matter:
 *
 *   1. A PLAIN GET, exactly what a first-time visitor sends. No cache-busting
 *      query, because a query string changes the cache key and would sail past
 *      the poisoned entry; no conditional headers, because If-None-Match is
 *      what makes a 304 legitimate.
 *   2. It runs on GITHUB ACTIONS, not in n8n. SiteGround's bot challenge
 *      answers n8n Cloud's IP with a 202 challenge page - measured 2 Oct 2026,
 *      all five urls - while GitHub's runners get the real pages (the deploy's
 *      own smoke test checks 67 urls from there on every run). If GitHub ever
 *      starts being challenged too, every url reports SKIP and this exits 0:
 *      a challenge says nothing about the site, and a monitor that cries wolf
 *      every morning is a monitor nobody reads.
 *
 * Exit 1 only when a real visitor would see something broken. On the way out
 * it posts the failing paths to the n8n workflow "Marketinga Skola - lapas
 * uzraudziba" (UPTIME_HOOK), which sends the e-mail; that side prints nothing
 * it receives, so only the path and the status code travel.
 */
const BASE = process.env.BASE || 'https://marketingaskola.lv';
const HOOK = process.env.UPTIME_HOOK || '';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  + ' (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const MARKER = 'Mārketinga Skola'; // in every page title, so a real page always carries it

// The homepage plus one page from each part of the site that earns money.
// One poisoned entry hits one url at a time, so a single url is not enough.
// Extra paths can be passed as arguments - that is how the alert path gets
// tested without waiting for the site to break.
const PAGES = ['/', '/pakalpojumi/', '/blogs/', '/meta-reklamas-kurss/', '/liaa-eksporta-atbalsts/']
  .concat(process.argv.slice(2));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchOnce(url) {
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': UA },
      redirect: 'follow',
      signal: AbortSignal.timeout(20000),
    });
    const html = await res.text();
    return { status: res.status, html };
  } catch (e) {
    return { status: 0, html: '', err: String((e && e.message) || e) };
  }
}

function judge(r) {
  if (r.status === 202 || /sgcaptcha|protect_captcha/i.test(r.html)) {
    return { state: 'SKIP', note: 'bot challenge answered, not the page' };
  }
  if (!r.status) return { state: 'DOWN', note: r.err || 'no response' };
  if (r.status === 304) {
    return { state: 'DOWN', note: '304 with no body - a browser with no cached copy sees nothing' };
  }
  if (r.status !== 200) return { state: 'DOWN', note: `status ${r.status}` };
  if (r.html.length < 2000 || !r.html.includes('</html>') || !r.html.includes(MARKER)) {
    return { state: 'DOWN', note: `200 but the body is not a page (${r.html.length} bytes)` };
  }
  return { state: 'OK', note: `${r.html.length} bytes` };
}

const rows = [];
for (const path of PAGES) {
  const url = BASE + path;
  let r = await fetchOnce(url);
  let v = judge(r);
  // One blip must not send an e-mail. A second look five seconds later costs
  // nothing once a day and removes nearly every false alarm.
  if (v.state === 'DOWN') {
    await sleep(5000);
    r = await fetchOnce(url);
    v = judge(r);
  }
  rows.push({ path, status: r.status, ...v });
}

for (const r of rows) console.log(`${r.state.padEnd(4)} ${BASE}${r.path} - ${r.note}`);

const down = rows.filter((r) => r.state === 'DOWN');
const skipped = rows.filter((r) => r.state === 'SKIP');

if (!down.length) {
  console.log(skipped.length === rows.length
    ? `inconclusive: every url was challenged, nothing learned about the site`
    : `all good (${rows.length - skipped.length}/${rows.length} checked)`);
  process.exit(0);
}

if (HOOK) {
  try {
    const res = await fetch(HOOK, {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: JSON.stringify({ down: down.map((d) => ({ path: d.path, status: d.status })) }),
      signal: AbortSignal.timeout(15000),
    });
    console.log(`notified n8n: ${res.status}`);
  } catch (e) {
    // The red run is the fallback signal; a failed notification must not hide
    // the failure it was reporting.
    console.log(`could not notify n8n: ${String((e && e.message) || e)}`);
  }
} else {
  console.log('UPTIME_HOOK is not set, so no e-mail was sent');
}

console.log(`DOWN: ${down.length} of ${rows.length}`);
process.exit(1);
