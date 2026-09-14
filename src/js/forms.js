/* Form submission for the hand-coded forms that replaced the Tally iframes.
 *
 * Every form posts to ONE n8n workflow (forms.json -> endpoint). It saves the
 * enquiry in our own n8n data table, answers {"ok":true}, then e-mails Rihards
 * and, for the LIAA forms, the applicant. Until 14 Sep 2026 MailerLite took the
 * leads, because the site had no server of its own; n8n is that server now.
 * See CLAUDE.md.
 *
 * The body is text/plain on purpose: it keeps the POST a "simple" request, so
 * the browser sends no preflight, and the workflow's reply carries
 * Access-Control-Allow-Origin, so the answer can still be read.
 */
(function () {
  'use strict';

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var TIMEOUT = 15000;

  function labelFor(field) {
    var p = field.closest('.field');
    var l = p && p.querySelector('label');
    return l ? l.firstChild.textContent.trim() : 'Šis lauks';
  }

  function setError(field, msg) {
    var slot = field.closest('.field');
    slot = slot && slot.querySelector('[data-error]');
    if (msg) {
      field.setAttribute('aria-invalid', 'true');
      if (slot) { slot.textContent = msg; slot.hidden = false; }
    } else {
      field.removeAttribute('aria-invalid');
      if (slot) { slot.textContent = ''; slot.hidden = true; }
    }
  }

  /* Validated here rather than left to the browser so the messages are in
   * Latvian and every invalid field is marked at once, not one at a time. */
  function validate(form) {
    var bad = null;
    var fields = form.querySelectorAll('input, select, textarea');

    Array.prototype.forEach.call(fields, function (f) {
      if (f.type === 'hidden' || f.closest('.hp')) return;
      setError(f, '');
      var v = (f.value || '').trim();

      if (f.type === 'checkbox') {
        if (f.required && !f.checked) {
          f.setAttribute('aria-invalid', 'true');
          if (!bad) bad = f;
        }
        return;
      }
      if (f.required && !v) {
        setError(f, labelFor(f) + ' ir jāaizpilda.');
        if (!bad) bad = f;
      } else if (v && f.type === 'email' && !EMAIL_RE.test(v)) {
        setError(f, 'Pārbaudi e-pasta adresi.');
        if (!bad) bad = f;
      } else if (v && f.type === 'url' && !/^https?:\/\/.+\..+/i.test(v)) {
        setError(f, 'Adresei jāsākas ar http:// vai https://');
        if (!bad) bad = f;
      }
    });
    return bad;
  }

  function collect(form) {
    var data = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.type === 'checkbox' || el.closest('.hp')) return;
      var v = (el.value || '').trim();
      if (v) data[el.name] = v;
    });
    /* A field marked data-into travels INSIDE another field as a labelled
     * line, so the notification e-mail and the table's message column read as
     * one text. Give it a column of its own by dropping "into" from forms.json. */
    Array.prototype.forEach.call(form.querySelectorAll('[data-into]'), function (el) {
      var v = data[el.name], to = el.getAttribute('data-into');
      if (!v) return;
      delete data[el.name];
      data[to] = labelFor(el) + ': ' + v + (data[to] ? '\n\n' + data[to] : '');
    });
    return data;
  }

  /* The lead counts as sent only once the workflow says so. A refusal, a
   * network error, an unreadable reply or 15 seconds of silence all count as
   * failure, and failure hands the visitor a pre-filled e-mail instead. */
  function send(form, data) {
    var request = fetch(form.getAttribute('data-endpoint'), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ form: form.getAttribute('data-form'), page: location.pathname, data: data })
    }).then(function (r) {
      if (!r.ok) throw new Error('status ' + r.status);
      return r.json();
    }).then(function (out) {
      if (!out || out.ok !== true) throw new Error('rejected');
    });
    var timeout = new Promise(function (_, reject) {
      setTimeout(function () { reject(new Error('timeout')); }, TIMEOUT);
    });
    return Promise.race([request, timeout]);
  }

  /* Last resort: never drop a lead because the workflow is unreachable.
   * Hands the visitor a pre-filled email instead of an apology. */
  function mailtoFallback(form, data) {
    var to = form.getAttribute('data-fallback');
    if (!to) return null;
    var lines = Object.keys(data).map(function (k) { return k + ': ' + data[k]; });
    return 'mailto:' + to +
      '?subject=' + encodeURIComponent('Pieteikums no mājaslapas') +
      '&body=' + encodeURIComponent(lines.join('\n'));
  }

  function succeed(form) {
    // GA4: the one place every successful submission passes through.
    if (window.msTrack) {
      var val = function (n) { var el = form.querySelector('[name="' + n + '"]'); return el ? el.value : ''; };
      // The identity is hashed in consent.js before it leaves the browser.
      window.msTrack('generate_lead', {
        form_id: form.getAttribute('data-form') || 'unknown',
        page_path: location.pathname
      }, { email: val('email'), phone: val('phone') });
    }
    var tpl = form.querySelector('template[data-success]');
    if (!tpl) return;
    var done = tpl.content.cloneNode(true);
    var el = done.firstElementChild;   // grab it BEFORE the fragment is emptied
    form.replaceWith(done);
    if (el) {
      el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  function bind(form) {
    var status = form.querySelector('.form-status');

    function say(msg, state) {
      if (!status) return;
      status.textContent = msg || '';
      if (state) status.setAttribute('data-state', state);
      else status.removeAttribute('data-state');
    }

    function fallback(data, lead) {
      form.classList.remove('is-sending');
      var href = mailtoFallback(form, data);
      say(lead + (href ? 'Atveram e-pastu, lai pieteikums nepazustu…' : 'Raksti uz rihards@marketingaskola.lv'), 'error');
      if (href) window.location.href = href;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.classList.contains('is-sending')) return;

      var bad = validate(form);
      if (bad) {
        say('Pārbaudi iezīmētos laukus.', 'error');
        bad.focus();
        return;
      }
      /* Honeypot filled means a bot. Show the normal confirmation so it learns
       * nothing, but send nothing. */
      var hp = form.querySelector('.hp input');
      if (hp && hp.value) { succeed(form); return; }

      var data = collect(form);
      if (!form.getAttribute('data-endpoint')) { fallback(data, 'Forma pašlaik nav savienota. '); return; }

      form.classList.add('is-sending');
      say('Sūtām…', 'sending');
      send(form, data)
        .then(function () { succeed(form); })
        .catch(function () { fallback(data, 'Neizdevās nosūtīt. '); });
    });

    /* Clear a field's error as soon as the visitor starts fixing it. */
    form.addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid')) setError(e.target, '');
    });
  }

  document.querySelectorAll('form[data-form]').forEach(bind);
})();
