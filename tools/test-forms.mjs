// Drives the real form in a real browser. The MailerLite request is stubbed so
// the test proves the client behaviour without creating subscribers.
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://localhost:8385';
const results = [];
const check = (name, pass, detail) => { results.push({ name, pass, detail }); };

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
const page = await browser.newPage();

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
await page.click('form.form button[type="submit"]');
await new Promise((r) => setTimeout(r, 250));
const invalid = await page.$$eval('form.form [aria-invalid="true"]', (n) => n.length);
const firstErr = await page.$eval('.field-error:not([hidden])', (n) => n.textContent).catch(() => '');
check('empty submit blocked', captured === null && invalid > 0, `${invalid} fields marked, no request sent`);
check('errors are in Latvian', /jāaizpilda/.test(firstErr), firstErr);

// 2. bad email is caught
await page.type('#contact-email', 'not-an-email');
await page.click('form.form button[type="submit"]');
await new Promise((r) => setTimeout(r, 200));
const emailErr = await page.$eval('#contact-email ~ .field-error', (n) => n.textContent).catch(() => '');
check('invalid email caught', /e-pasta/i.test(emailErr), emailErr);

// 3. consent is genuinely required
await page.$eval('#contact-email', (n) => { n.value = 'lead@example.com'; });
await page.$eval('#contact-name', (n) => { n.value = 'Anna'; });
await page.$eval('#contact-last_name', (n) => { n.value = 'Berzina'; });
await page.$eval('#contact-message', (n) => { n.value = 'Interese par Meta reklamam.'; });
await page.click('form.form button[type="submit"]');
await new Promise((r) => setTimeout(r, 200));
check('consent required', captured === null, 'submit still blocked with consent unchecked');

// 4. valid submit reaches the endpoint with the right payload
await page.click('.form-consent input');
await page.click('form.form button[type="submit"]');
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
captured = null;
await page.goto(BASE + '/seo-kursi/', { waitUntil: 'load' });
await page.$eval('.hp input', (n) => { n.value = 'http://spam.example'; });
await page.$eval('#course-email', (n) => { n.value = 'bot@example.com'; });
await page.$eval('#course-name', (n) => { n.value = 'Bot'; });
await page.$eval('#course-last_name', (n) => { n.value = 'Bot'; });
await page.click('.form-consent input');
await page.click('form.form button[type="submit"]');
await new Promise((r) => setTimeout(r, 400));
check('honeypot blocks the request', captured === null, 'nothing sent');
check('honeypot still shows success', !!(await page.$('.form-done')), 'bot learns nothing');

// 6. the course page preselects its course
await page.goto(BASE + '/seo-kursi/', { waitUntil: 'load' });
const sel = await page.$eval('#course-course', (n) => n.value);
check('course preselected', sel === 'SEO kurss', sel);

await browser.close();

let bad = 0;
for (const r of results) {
  if (!r.pass) bad++;
  console.log(`  ${r.pass ? 'ok  ' : 'FAIL'} ${r.name.padEnd(30)} ${r.detail || ''}`);
}
console.log(`\n${results.length - bad}/${results.length} passed`);
process.exit(bad ? 1 : 0);
