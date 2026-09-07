// Drives the real form in a real browser. The MailerLite request is stubbed so
// the test proves the client behaviour without creating subscribers.
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

let captured = null;
await page.setRequestInterception(true);
page.on('request', (req) => {
  if (req.url().includes('assets.mailerlite.com')) {
    captured = { url: req.url(), body: req.postData() || '' };
    return req.respond({ status: 200, contentType: 'application/json', body: '{"success":true}' });
  }
  req.continue();
});

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
await page.$eval('#contact-email', (n) => { n.value = 'lead@example.com'; });
await page.$eval('#contact-name', (n) => { n.value = 'Anna'; });
await page.$eval('#contact-last_name', (n) => { n.value = 'Berzina'; });
await page.$eval('#contact-message', (n) => { n.value = 'Interese par Meta reklamam.'; });
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
check('posted to contact form id', !!captured && captured.url.includes('196419637828650760'), captured ? captured.url.split('/forms/')[1] : 'no request');
for (const [k, v] of [['email', 'lead@example.com'], ['name', 'Anna'], ['message', 'Interese']]) {
  check(`payload carries ${k}`, !!captured && captured.body.includes(v), '');
}
check('honeypot not sent', !!captured && !captured.body.includes('company_url'), '');
check('source_page sent', !!captured && captured.body.includes('/sazinies/'), '');

// 5. honeypot: a filled trap sends nothing but looks successful
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

// 6. the hub's course form asks which course, and offers the undecided option
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
