/* Lead magnet: the automated on-page check.
 *
 * Two destinations on submit, deliberately independent:
 *   - the URL goes to the n8n webhook, which fetches the page and returns the
 *     checks as JSON. No e-mail address is ever sent there, so nothing
 *     personal lands in n8n's execution logs.
 *   - the e-mail goes to MailerLite through the same public form endpoint the
 *     site's other forms use, so list-building keeps working even if the audit
 *     service is down.
 *
 * WHEN IT APPEARS. Never immediately: Google treats an interstitial that
 * covers the content on arrival as a ranking problem on mobile, and it is
 * simply rude. Desktop gets exit intent, phones get 55% scroll depth, and
 * either way only after 20 seconds. Once per visitor; 60 days after a
 * dismissal; never while the cookie banner is still open, because stacking two
 * overlays on a first visit is how people leave.
 */
(function () {
  var s = document.currentScript;
  var box = document.querySelector('[data-lm]');
  if (!box || !s) return;

  var AUDIT = s.getAttribute('data-audit');
  var ML_ACCOUNT = s.getAttribute('data-ml-account');
  var ML_FORM = s.getAttribute('data-ml-form');
  var KEY = 'ms-lm';
  if (!AUDIT) return;

  var read = function () { try { return localStorage.getItem(KEY); } catch (e) { return 'seen'; } };
  var write = function (v) { try { localStorage.setItem(KEY, v); } catch (e) { /* private mode */ } };

  // "seen" is permanent (they submitted); a timestamp is a dismissal to expire.
  var prev = read();
  if (prev === 'seen') return;
  if (prev && Date.now() - Number(prev) < 60 * 864e5) return;

  var form = box.querySelector('[data-lm-form]');
  var result = box.querySelector('[data-lm-result]');
  var opened = false;
  var lastFocus = null;

  function consentPending() {
    var c = document.querySelector('[data-consent]');
    return c && !c.hidden;
  }

  function open() {
    if (opened || consentPending()) return;
    opened = true;
    lastFocus = document.activeElement;
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    var first = box.querySelector('input');
    if (first) first.focus();
    if (window.msTrack) window.msTrack('lead_magnet_open', { page_path: location.pathname });
  }

  function close(permanent) {
    box.hidden = true;
    document.body.style.overflow = '';
    write(permanent ? 'seen' : String(Date.now()));
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---------- triggers ---------- */
  var armed = false;
  setTimeout(function () { armed = true; }, 20000);

  var phone = window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
  if (phone) {
    window.addEventListener('scroll', function onScroll() {
      if (!armed) return;
      var doc = document.documentElement;
      var depth = (window.scrollY + window.innerHeight) / doc.scrollHeight;
      if (depth > 0.55) { window.removeEventListener('scroll', onScroll); open(); }
    }, { passive: true });
  } else {
    document.addEventListener('mouseout', function onOut(e) {
      if (!armed || e.relatedTarget || e.clientY > 40) return;
      document.removeEventListener('mouseout', onOut);
      open();
    });
  }

  box.addEventListener('click', function (e) {
    if (e.target === box || e.target.closest('[data-lm-close]')) close(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !box.hidden) close(false);
    // Keep the tab ring inside the dialog while it is open.
    if (e.key === 'Tab' && !box.hidden) {
      var f = box.querySelectorAll('button, input, a[href]');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- submit ---------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function fail(el, msg) {
    // Text inputs keep their error inside .field; the consent checkbox has no
    // .field wrapper (that class would lift its label onto the box), so its
    // error span is the next sibling of the label instead.
    var box2 = el.closest('.field');
    var slot = box2 ? box2.querySelector('[data-error]') : null;
    if (!slot) {
      var lab = el.closest('.form-consent');
      var next = lab && lab.nextElementSibling;
      if (next && next.hasAttribute('data-error')) slot = next;
    }
    if (slot) { slot.textContent = msg; slot.hidden = false; }
    el.setAttribute('aria-invalid', 'true');
  }
  function clear() {
    box.querySelectorAll('[data-error]').forEach(function (n) { n.textContent = ''; n.hidden = true; });
    box.querySelectorAll('[aria-invalid]').forEach(function (n) { n.removeAttribute('aria-invalid'); });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clear();
    var url = form.url.value.trim();
    var email = form.email.value.trim();
    var okAll = true;
    if (!url || !/\.[a-z]{2,}/i.test(url)) { fail(form.url, 'Ieraksti mājaslapas adresi, piemēram, piemers.lv'); okAll = false; }
    if (!EMAIL_RE.test(email)) { fail(form.email, 'Pārbaudi e-pasta adresi.'); okAll = false; }
    if (!form.consent.checked) { fail(form.consent, 'Bez piekrišanas nevaram nosūtīt rezultātu.'); okAll = false; }
    if (!okAll) return;

    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Pārbaudām…';

    // The list. Fire and forget: a MailerLite outage must not cost the report.
    if (ML_ACCOUNT && ML_FORM) {
      var body = new FormData();
      body.append('fields[email]', email);
      body.append('fields[website]', url);
      body.append('fields[source_page]', 'lapas parbaude');
      body.append('ml-submit', '1');
      body.append('anticsrf', 'true');
      fetch('https://assets.mailerlite.com/jsonp/' + ML_ACCOUNT + '/forms/' + ML_FORM + '/subscribe',
        { method: 'POST', body: body, mode: 'no-cors' }).catch(function () {});
    }
    if (window.msTrack) window.msTrack('generate_lead', { form_id: 'lapas-parbaude', page_path: location.pathname }, { email: email });

    fetch(AUDIT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url: url }),
    })
      .then(function (r) { return r.json(); })
      .then(render)
      .catch(function () {
        render({ ok: false, url: url, reason: 'pārbaude neatbildēja' });
      });
  });

  function esc(t) {
    return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  }

  function render(d) {
    form.hidden = true;
    result.hidden = false;
    write('seen');

    if (!d || !d.ok) {
      result.innerHTML = '<h3>Neizdevās atvērt lapu</h3>' +
        '<p>' + esc(d && d.url) + ' &mdash; ' + esc((d && d.reason) || 'nezināma kļūda') + '. ' +
        'Pārbaudi adresi un mēģini vēlreiz, vai <a href="/sazinies/">uzraksti mums</a>.</p>';
      return;
    }

    var rows = (d.checks || []).map(function (c) {
      var mark = c.state === 'ok' ? '&#10003;' : (c.state === 'unknown' ? '?' : '&#33;');
      return '<li class="lm-check lm-check--' + esc(c.state) + '"><span class="lm-mark" aria-hidden="true">' + mark +
        '</span><div><strong>' + esc(c.title) + '</strong><span>' + esc(c.detail) + '</span></div></li>';
    }).join('');

    var head = d.fails
      ? d.fails + ' no ' + d.total + ' punktiem ir vērts salabot'
      : 'Viss pārbaudītais ir kārtībā';

    result.innerHTML =
      '<h3>' + esc(head) + '</h3>' +
      '<p class="lm-sub">Lapa: ' + esc(d.url) + '. Pārbaudīts tikai tas, ko var nolasīt no lapas koda.</p>' +
      '<ul class="lm-checks">' + rows + '</ul>' +
      '<p class="lm-next">Lielāko daļu no šī var salabot pats. Ja gribi, lai kāds izskata tieši Tavu situāciju un pasaka, ar ko sākt, ' +
      'tam ir <a href="/marketinga-konsultacijas/">maksas konsultācija</a>.</p>' +
      '<div class="btn-wrap"><a class="btn" href="/marketinga-konsultacijas/">Apskatīt konsultācijas</a>' +
      '<button type="button" class="btn btn--ghost" data-lm-close>Aizvērt</button></div>';
  }
})();
