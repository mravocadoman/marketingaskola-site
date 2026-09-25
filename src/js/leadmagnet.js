/* Lead magnet. One engine, two offers - base.njk picks which by page, and the
 * script reads it from data-variant:
 *
 *   "liaa"  - the export-grant sagatave, on the commercial pages. E-mail plus
 *             one qualifying question; the file is handed over on screen AND
 *             e-mailed by the n8n workflow, so closing the tab costs nothing.
 *   "audit" - the automated on-page check, everywhere else.
 *
 * Only the submit and the result differ. The timing, the dismissal memory and
 * the focus trap below are shared, and they are the tuned part.
 *
 * ONE destination on submit (data-hook), the same n8n workflow as the site's
 * forms: it saves the row and then mails the deliverable - the sagatave's PDF,
 * or the page check's nine-point report.
 *
 * THE PAGE CHECK'S REPORT IS THE E-MAIL, and that is the whole point: it used
 * to render on screen, so an address was optional and a throwaway one cost the
 * visitor nothing. Now the address is what the report is worth. The browser no
 * longer calls the audit webhook at all - the workflow runs the checks itself,
 * after it has answered us, so a slow page cannot make this panel wait. So
 * this file must tell the visitor whether the request GOT THROUGH, which is
 * why the page check waits for the answer and the sagatave does not.
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

  var VARIANT = s.getAttribute('data-variant') === 'liaa' ? 'liaa' : 'audit';
  var HOOK = s.getAttribute('data-hook');
  var FILE = s.getAttribute('data-file');
  var KEY = 'ms-lm';
  if (!HOOK) return;

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
    // input OR select: the sagatave's first field is the qualifying dropdown,
    // and querySelector('input') would skip straight past it to the e-mail.
    var first = box.querySelector('input, select');
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
    var email = form.email.value.trim();
    var url = '', eksports = '';
    var okAll = true;
    if (VARIANT === 'liaa') {
      eksports = form.eksports.value;
      if (!eksports) { fail(form.eksports, 'Izvēlies vienu variantu.'); okAll = false; }
    } else {
      url = form.url.value.trim();
      if (!url || !/\.[a-z]{2,}/i.test(url)) { fail(form.url, 'Ieraksti mājaslapas adresi, piemēram, piemers.lv'); okAll = false; }
    }
    if (!EMAIL_RE.test(email)) { fail(form.email, 'Pārbaudi e-pasta adresi.'); okAll = false; }
    if (!form.consent.checked) { fail(form.consent, 'Bez piekrišanas nevaram neko nosūtīt.'); okAll = false; }
    if (!okAll) return;

    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = VARIANT === 'liaa' ? 'Sūtām…' : 'Pārbaudām…';

    /* Same workflow and payload shape as the site's forms, so it lands in the
     * same table; text/plain keeps it a simple request with no preflight. */
    var formId = VARIANT === 'liaa' ? 'liaa-sagatave' : 'lapas-parbaude';
    var payload = JSON.stringify({
      form: formId, page: location.pathname,
      data: VARIANT === 'liaa'
        ? { email: email, message: 'Eksporta statuss: ' + eksports }
        : { email: email, website: url },
    });
    if (window.msTrack) window.msTrack('generate_lead', { form_id: formId, page_path: location.pathname }, { email: email });

    // The sagatave is on screen at once, so its post can fail unseen: the
    // e-mail is the copy, not the delivery.
    if (VARIANT === 'liaa') {
      try {
        fetch(HOOK, {
          method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' },
          body: payload,
        }).catch(function () {});
      } catch (e) { /* a blocked fetch must not cost the lead */ }
      handOver();
      return;
    }

    /* The page check has nothing to hand over on screen, so it has to know
     * whether the request landed. Readable response (the workflow answers with
     * Access-Control-Allow-Origin for this origin), and the same 15 s ceiling
     * and mailto fallback as forms.js: a lost lead is worse than an error. */
    var settled = false;
    function settle(ok) {
      if (settled) return;
      settled = true;
      if (ok) sent(email); else lost(email, url);
    }
    var timer = setTimeout(function () { settle(false); }, 15000);
    try {
      fetch(HOOK, {
        method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: payload,
      })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { clearTimeout(timer); settle(!!(d && d.ok)); })
        .catch(function () { clearTimeout(timer); settle(false); });
    } catch (e) { clearTimeout(timer); settle(false); }
  });

  /* The sagatave is handed over on screen, not held back until an e-mail
     arrives: a mistyped address would otherwise leave the visitor with
     nothing at all. */
  function handOver() {
    form.hidden = true;
    result.hidden = false;
    write('seen');
    result.innerHTML =
      '<h3>PDF ir gatavs</h3>' +
      '<p class="lm-sub">Divas lapas: programmas nosacījumi un cenu aptaujas protokola sagatave. To pašu failu nosūtām arī uz e-pastu.</p>' +
      '<div class="btn-wrap"><a class="btn" href="' + FILE + '" download>Lejupielādēt PDF</a>' +
      '<a class="btn btn--ghost" href="/liaa-eksporta-atbalsts/">Kā programma darbojas</a></div>' +
      '<p class="lm-next">Ja jau zini apjomu un vāc piedāvājumus salīdzināšanai, ' +
      '<a href="/liaa-eksporta-atbalsts/#pieteikums">cenu piedāvājumu ar pozīcijām</a> nosūtām vienas darba dienas laikā.</p>';
  }

  function esc(t) {
    return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  }

  /* The report is an e-mail now, so this panel's whole job is to say the
     request landed, name the address it is going to (a typo is the one failure
     the visitor can still fix), and give something to read while it arrives. */
  function sent(email) {
    form.hidden = true;
    result.hidden = false;
    write('seen');
    result.innerHTML =
      '<h3>Pārbaude ir palaista</h3>' +
      '<p class="lm-sub">Atskaite ar visiem deviņiem punktiem aiziet uz <strong>' + esc(email) +
      '</strong> pāris minūšu laikā. Ja tās nav, paskaties mēstuļu mapē.</p>' +
      '<div class="btn-wrap"><a class="btn" href="/konversiju-uzskaite/">Kā mēra konversijas</a>' +
      '<button type="button" class="btn btn--ghost" data-lm-close>Aizvērt</button></div>' +
      '<p class="lm-next">Ja gribi, lai kāds izskata tieši Tavu situāciju un pasaka, ar ko sākt, ' +
      'tam ir <a href="/marketinga-konsultacijas/">maksas konsultācija</a>.</p>';
  }

  /* A lost request must not cost the lead, so it becomes a pre-filled mailto,
     exactly as in forms.js. Deliberately does NOT write 'seen': nothing was
     delivered, so the popup may ask again rather than the lead simply being
     gone. */
  function lost(email, url) {
    form.hidden = true;
    result.hidden = false;
    var href = 'mailto:rihards@marketingaskola.lv?subject=' +
      encodeURIComponent('Lapas pārbaude: ' + url) + '&body=' +
      encodeURIComponent('Lapa: ' + url + '\nE-pasts: ' + email +
        '\n\nLūdzu, atsūtiet lapas pārbaudes atskaiti.');
    result.innerHTML =
      '<h3>Pieprasījumu neizdevās nosūtīt</h3>' +
      '<p class="lm-sub">Visticamāk, vainojams savienojums vai reklāmu bloķētājs. ' +
      'Nosūti to pašu e-pastā, un atskaiti atsūtīsim ar roku.</p>' +
      '<div class="btn-wrap"><a class="btn" href="' + esc(href) + '">Atvērt e-pastu</a>' +
      '<button type="button" class="btn btn--ghost" data-lm-close>Aizvērt</button></div>';
  }
})();
