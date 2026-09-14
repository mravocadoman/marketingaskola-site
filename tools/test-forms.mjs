// Drives the real form in a real browser. The n8n lead endpoint is stubbed so
// the test proves the client behaviour without writing rows or sending mail.
import puppeteer from 'puppeteer-core';
import { chromePath } from './_chrome.mjs';

const CHROME = chromePath();
const BASE = 'http://localhost:8385';
const results = [];
const check = (name, pass, detail) => { results.push({ name, pass, detail }); };

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
const page = await browser.newPage();

// `html { scroll-behavior: smooth }` makes scrolling ASYNCHRONOUS, and
// puppeteer's click scrolls the target into view and then clicks its
// coordinates. On a long page the animation is still running when the click
// lands, so it hits whatever is at those coordinates instead of the button -
// the course form sits ~7 200px down the hub and failed exactly this way,
// while the same code passed on /sazinies/ at ~1 050px. Real visitors click
// what they can already see; this only makes the automation deterministic.
const submit = async () => {
  await page.$eval('form.form button[type="submit"]', (b) => {
    document.documentElement.style.scrollBehavior = 'auto';
    b.scrollIntoView({ block: 'center' });
  });
  await page.click('form.form button[type="submit"]');
};

// The workflow answers {"ok":true} with Access-Control-Allow-Origin, which is
// what lets forms.js read the reply of a text/plain POST. stubStatus lets a
// step play a refusal.
let captured = null;
let stubStatus = 200;
await page.setRequestInterception(true);
page.on('request', (req) => {
  const url = req.url();
  if (url.includes('app.n8n.cloud/webhook/liaa-lead')) {
    captured = { url, body: req.postData() || '' };
    return req.respond({
      status: stubStatus,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: stubStatus === 200 ? '{"ok":true}' : '{"ok":false}',
    });
  }
  // Every other n8n webhook is answered here too. A successful lead fires
  // msTrack, which calls the live Meta CAPI relay: before 14 Sep 2026 each
  // run of this test sent a fake lead to Meta's dataset.
  if (url.includes('app.n8n.cloud/webhook/')) {
    return req.respond({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: '{"ok":true}' });
  }
  req.continue();
});
const payload = () => { try { return JSON.parse(captured.body); } catch { return {}; } };

const fillContact = async () => {
  await page.$eval('#contact-email', (n) => { n.value = 'lead@example.com'; });
  await page.$eval('#contact-name', (n) => { n.value = 'Anna'; });
  await page.$eval('#contact-last_name', (n) => { n.value = 'Berzina'; });
  await page.$eval('#contact-message', (n) => { n.value = 'Interese par Meta reklamam.'; });
  // required since 11 Sep 2026 - set it so a later step fails on its own cause
  await page.$eval('#contact-budget', (n) => { n.value = '1 000–3 000 €'; });
};

await page.goto(BASE + '/sazinies/', { waitUntil: 'load' });

// 1. empty submit must be blocked and must mark fields
await submit();
await new Promise((r) => setTimeout(r, 250));
const invalid = await page.$$eval('form.form [aria-invalid="true"]', (n) => n.length);
const firstErr = await page.$eval('.field-error:not([hidden])', (n) => n.textContent).catch(() => '');
check('empty submit blocked', captured === null && invalid > 0, `${invalid} fields marked, no request sent`);
check('errors are in Latvian', /jāaizpilda/.test(firstErr), firstErr);

// 2. bad email is caught
await page.type('#contact-email', 'not-an-email');
await submit();
await new Promise((r) => setTimeout(r, 200));
const emailErr = await page.$eval('#contact-email ~ .field-error', (n) => n.textContent).catch(() => '');
check('invalid email caught', /e-pasta/i.test(emailErr), emailErr);

// 3. consent is genuinely required
await fillContact();
await submit();
await new Promise((r) => setTimeout(r, 200));
check('consent required', captured === null, 'submit still blocked with consent unchecked');

// 4. valid submit reaches the endpoint with the right payload
await page.click('.form-consent input');
await submit();
await page.waitForSelector('.form-done', { timeout: 5000 }).catch(() => {});
const done = await page.$('.form-done');
check('success panel shown', !!done, done ? 'form replaced by confirmation' : 'MISSING');
check('form removed after submit', !(await page.$('form.form')), 'prevents double submit');
const p = captured ? payload() : {};
const d = p.data || {};
check('posted to the lead endpoint', !!captured && captured.url.includes('/webhook/liaa-lead'), captured ? captured.url.split('/webhook/')[1] : 'no request');
check('form key sent', p.form === 'contact', p.form || '(none)');
for (const [k, v] of [['email', 'lead@example.com'], ['name', 'Anna'], ['message', 'Interese']]) {
  check(`payload carries ${k}`, String(d[k] || '').includes(v), '');
}
check('honeypot not sent', !!captured && !('company_url' in d), '');
check('budget rides inside the message', String(d.message || '').includes('3 000') && !('budget' in d), 'one readable message');
check('source_page sent', d.source_page === '/sazinies/', d.source_page || '(none)');

// 5. a refusal must not lose the lead: the visitor is handed a pre-filled e-mail
captured = null;
stubStatus = 500;
await page.goto(BASE + '/sazinies/', { waitUntil: 'load' });
await fillContact();
await page.click('.form-consent input');
await submit();
await new Promise((r) => setTimeout(r, 800));
const status = await page.$eval('.form-status', (n) => n.textContent).catch(() => '');
check('refusal falls back to e-mail', !!captured && /Neizdevās/.test(status), status || '(no status)');
stubStatus = 200;

// 6. honeypot: a filled trap sends nothing but looks successful
// The course form moved: since all three courses got a Stripe `bookUrl`
// (4 Sep 2026) course-sessions.njk renders the buy button instead of the
// form, so the only page still rendering form("course") is the hub.
captured = null;
await page.goto(BASE + '/digitala-marketinga-kursi/', { waitUntil: 'load' });
await page.$eval('.hp input', (n) => { n.value = 'http://spam.example'; });
// `course` is required and the hub preselects nothing, so pick one or
// validation stops the submit before forms.js ever reaches the trap.
await page.$eval('#course-course', (n) => { n.value = [...n.options].find((o) => o.value)?.value; });
await page.$eval('#course-email', (n) => { n.value = 'bot@example.com'; });
await page.$eval('#course-name', (n) => { n.value = 'Bot'; });
await page.$eval('#course-last_name', (n) => { n.value = 'Bot'; });
await page.click('.form-consent input');
await submit();
await new Promise((r) => setTimeout(r, 400));
check('honeypot blocks the request', captured === null, 'nothing sent');
check('honeypot still shows success', !!(await page.$('.form-done')), 'bot learns nothing');

// 7. the hub's course form asks which course, and offers the undecided option
// The preselect path (form("course", { course: courseName })) is NOT dead
// code - course-sessions.njk still uses it in its fallback branch, which is
// what a course renders when it has no bookUrl. There is simply no page in
// that state today, so there is nothing to point a browser at. If a course
// ever loses its Stripe link, re-add the preselect assertion against it.
await page.goto(BASE + '/digitala-marketinga-kursi/', { waitUntil: 'load' });
const sel = await page.$eval('#course-course', (n) => n.value);
check('hub course not preselected', sel === '', sel || '(empty)');
const undecided = await page.$eval('#course-course', (n) =>
  [...n.options].some((o) => o.textContent.includes('Vēl neesmu izlēmis')));
check('undecided option offered', undecided, 'keeps the "not sure yet" route');

await browser.close();

let bad = 0;
for (const r of results) {
  if (!r.pass) bad++;
  console.log(`  ${r.pass ? 'ok  ' : 'FAIL'} ${r.name.padEnd(30)} ${r.detail || ''}`);
}
console.log(`\n${results.length - bad}/${results.length} passed`);
process.exit(bad ? 1 : 0);
