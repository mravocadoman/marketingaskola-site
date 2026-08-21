/* Form submission for the hand-coded forms that replaced the Tally iframes.
 *
 * Provider choice (see CLAUDE.md): MailerLite, not Resend. This site is static
 * on GitHub Pages with no server anywhere. MailerLite's form endpoint is built
 * to accept a browser POST and carries no secret, so it works from a static
 * page as-is. A Resend API key must never reach the browser, so Resend would
 * require a serverless function on some other host just to receive a form.
 *
 * The provider lives behind an adapter: swapping to Resend later means adding
 * one entry below and changing "provider" in src/_data/forms.json — no markup
 * changes anywhere in the site.
 */
(function () {
  'use strict';

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var providers = {
    /* MailerLite's public embedded-form endpoint. Same one their own copy-paste
     * embed uses, which is why it needs no key and accepts a cross-origin POST. */
    mailerlite: function (form, data) {
      var account = form.getAttribute('data-account');
      var formId = form.getAttribute('data-form-id');
      if (!account || !formId) return null;

      var body = new FormData();
      Object.keys(data).forEach(function (k) {
        if (data[k]) body.append('fields[' + k + ']', data[k]);
      });
      body.append('ml-submit', '1');
      body.append('anticsrf', 'true');

      return {
        url: 'https://assets.mailerlite.com/jsonp/' + account + '/forms/' + formId + '/subscribe',
        body: body
      };
    }
  };

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
    return data;
  }

  /* Last resort: never drop a lead because a third party is unreachable.
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
      var build = providers[form.getAttribute('data-provider')];
      var req = build && build(form, data);

      if (!req) {
        var href = mailtoFallback(form, data);
        say('Forma pašlaik nav savienota. ' + (href ? 'Atveram e-pastu…' : 'Raksti uz rihards@marketingaskola.lv'), 'error');
        if (href) window.location.href = href;
        return;
      }

      form.classList.add('is-sending');
      say('Sūtām…', 'sending');

      fetch(req.url, { method: 'POST', body: req.body })
        .then(function (r) { return r.json().catch(function () { return { success: true }; }); })
        .then(function (out) {
          if (out && out.success === false) throw new Error('rejected');
          succeed(form);
        })
        .catch(function () {
          /* A cross-origin POST of FormData is a "simple" request, so it still
           * reaches the server even when the browser refuses to let us read the
           * reply. Retry opaquely: if that resolves, the submission landed. */
          return fetch(req.url, { method: 'POST', mode: 'no-cors', body: req.body })
            .then(function () { succeed(form); })
            .catch(function () {
              form.classList.remove('is-sending');
              var href = mailtoFallback(form, data);
              say('Neizdevās nosūtīt. ' + (href ? 'Atveram e-pastu, lai pieteikums nepazustu…' : 'Raksti uz rihards@marketingaskola.lv'), 'error');
              if (href) window.location.href = href;
            });
        });
    });

    /* Clear a field's error as soon as the visitor starts fixing it. */
    form.addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid')) setError(e.target, '');
    });
  }

  document.querySelectorAll('form[data-form]').forEach(bind);
})();
