/* The marketing automation quiz (/automatizacijas-tests/), the site's one lead
 * magnet since 11 Oct 2026.
 *
 * Four questions, one per area, then the result straight away: no e-mail is
 * asked for the scorecard. The page renders every question as a plain
 * fieldset, so without JavaScript it still reads top to bottom; this file turns
 * them into one-at-a-time steps (picking an answer moves on, "Atpakaļ" goes
 * back, the bar shows progress).
 *
 * Scoring is in src/_data/quiz.json, and it is a scorecard: each question
 * belongs to an area, each option's `need` sets that area's level (0 in order,
 * 1 partly, 2-3 needs attention), and its `score` adds points to automation
 * codes. Codes with 2 points or more are the priorities (ties in the order of
 * `results`), each shown with the `find` sentence of the answer that raised it.
 *
 * The personal step: the visitor may add a website and must add an e-mail.
 * One text/plain POST (no preflight) goes to the AI workflow in n8n, carrying
 * ONLY answer indexes, area levels, codes, the address and the e-mail. It reads
 * the site, has Claude write three suggestions, saves the lead, answers here
 * and mails a copy. It can take 10-30 seconds, so the wait says what is
 * happening. A refusal, an error or 60 s of silence offers a pre-filled mailto
 * instead, because a lost lead is worse than an error message.
 */
(function () {
  var form = document.querySelector('[data-quiz]');
  var dataEl = document.getElementById('quiz-data');
  if (!form || !dataEl) return;
  var QUIZ;
  try { QUIZ = JSON.parse(dataEl.textContent); } catch (e) { return; }

  // data-quiz-form, NOT data-form: forms.js binds every form[data-form].
  var FORM_ID = form.getAttribute('data-quiz-form') || 'automatizacijas-tests';
  var steps = [].slice.call(form.querySelectorAll('[data-step]'));
  var bar = form.querySelector('[data-quiz-bar]');
  var count = form.querySelector('[data-quiz-count]');
  var back = form.querySelector('[data-quiz-back]');
  var result = document.querySelector('[data-quiz-result]');
  var aiBox = document.querySelector('[data-quiz-ai]');
  var aiForm = document.querySelector('[data-quiz-ai-form]');
  var aiOut = document.querySelector('[data-quiz-ai-out]');
  var current = 0;
  var total = QUIZ.questions.length;
  var started = false;

  form.classList.add('is-stepped');

  function show(i) {
    current = Math.max(0, Math.min(i, steps.length - 1));
    steps.forEach(function (s, k) { s.hidden = k !== current; });
    if (bar) bar.style.width = Math.round((current / total) * 100) + '%';
    if (count) count.textContent = (current + 1) + ' no ' + total;
    back.hidden = current === 0;
    var first = steps[current].querySelector('input:checked, input');
    // Focus only after the visitor has started, never on page load: a focused
    // radio scrolls the page and would yank the reader past the hero.
    if (started && first) first.focus({ preventScroll: true });
  }

  form.addEventListener('change', function (e) {
    if (e.target.type !== 'radio') return;
    if (!started && window.msTrack) window.msTrack('quiz_start', { form_id: FORM_ID });
    started = true;
    // A short beat so the choice registers before the next screen replaces it.
    setTimeout(function () {
      if (current < total - 1) show(current + 1); else finish();
    }, 220);
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  back.addEventListener('click', function () { started = true; show(current - 1); });
  show(0);

  /* ---------- scoring ---------- */
  function answers() {
    return QUIZ.questions.map(function (q) {
      var picked = form.querySelector('input[name="' + q.id + '"]:checked');
      return picked ? Number(picked.value) : -1;
    });
  }
  function options(idx) { return idx.map(function (n, i) { return QUIZ.questions[i].options[n] || null; }); }
  function topCodes(chosen) {
    var score = {};
    chosen.forEach(function (o) {
      if (!o) return;
      Object.keys(o.score || {}).forEach(function (c) { score[c] = (score[c] || 0) + o.score[c]; });
    });
    var order = QUIZ.results.map(function (r) { return r.code; });
    // Two points at least: one lukewarm answer is not a reason to automate.
    return order
      .filter(function (c) { return score[c] >= 2; })
      .sort(function (a, b) { return (score[b] - score[a]) || (order.indexOf(a) - order.indexOf(b)); })
      .slice(0, 3);
  }
  // One level per area, in the order of QUIZ.areas: 0 in order, 1 partly, 2 needs attention.
  function areaLevels(chosen) {
    var sum = {};
    QUIZ.questions.forEach(function (q, i) {
      if (q.area && chosen[i]) sum[q.area] = (sum[q.area] || 0) + (chosen[i].need || 0);
    });
    return QUIZ.areas.map(function (a) { var n = sum[a.id] || 0; return n >= 2 ? 2 : n >= 1 ? 1 : 0; });
  }
  function findings(chosen, code) {
    return chosen.filter(function (o) { return o && o.find && (o.score || {})[code] > 0; })
      .map(function (o) { return o.find; }).slice(0, 2);
  }
  function esc(t) {
    return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  }

  var state = null;

  /* ---------- the free result: scorecard and priorities, no e-mail ---------- */
  function finish() {
    var idx = answers();
    var missing = idx.indexOf(-1);
    if (missing !== -1) { show(missing); return; }
    var chosen = options(idx);
    state = { idx: idx, chosen: chosen, top: topCodes(chosen), levels: areaLevels(chosen) };
    try { localStorage.setItem('ms-lm', 'seen'); } catch (e) { /* private mode */ }
    if (window.msTrack) window.msTrack('quiz_complete', { form_id: FORM_ID });

    var byCode = {};
    QUIZ.results.forEach(function (r) { byCode[r.code] = r; });
    var card = '<ul class="quiz-score">' + QUIZ.areas.map(function (a, i) {
      var lv = state.levels[i];
      return '<li class="lv-' + lv + '"><span class="qs-name">' + esc(a.name) + '</span>' +
        '<span class="qs-meter" aria-hidden="true"><i></i><i></i><i></i></span>' +
        '<span class="qs-level">' + esc(QUIZ.levels[lv]) + '</span></li>';
    }).join('') + '</ul>';
    var shown = {}; // a finding that raised two codes is told once, under the first
    var plan = state.top.length
      ? '<h3>Ar ko sākt</h3><ol class="quiz-top">' + state.top.map(function (c) {
          var r = byCode[c];
          var seen = findings(chosen, c).filter(function (f) { return shown[f] ? false : (shown[f] = true); });
          return '<li><strong>' + esc(r.title) + '</strong>' +
            (seen.length ? '<p><span class="qt-label">Šobrīd</span>' + esc(seen.join(' ')) + '</p>' : '') +
            '<p><span class="qt-label">Risinājums</span>' + esc(r.short) + '</p></li>';
        }).join('') + '</ol>'
      : '<h3>Pamats ir kārtībā</h3><p>Nevienā jomā nav steidzamu darbu. Ja gribi saprast, ko uzlabot tālāk, zemāk AI var uzrakstīt ieteikumus tieši Tavam uzņēmumam.</p>';

    form.hidden = true;
    result.hidden = false;
    result.innerHTML = '<span class="eyebrow">Rezultāts</span><h2>Tavs mārketings šobrīd</h2>' + card + plan;
    if (aiBox) aiBox.hidden = false;
    result.scrollIntoView({ block: 'start' });
  }

  /* ---------- the personal step: website + e-mail, AI suggestions ---------- */
  if (!aiForm) return;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var URL_RE = /^(https?:\/\/)?([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(\/\S*)?$/i;
  var HOOK = QUIZ.aiEndpoint;

  function fail(el, msg) {
    var slot = el.closest('.field') ? el.closest('.field').querySelector('[data-error]') : null;
    if (!slot) { var lab = el.closest('.form-consent'); slot = lab && lab.nextElementSibling; }
    if (slot && slot.hasAttribute('data-error')) { slot.textContent = msg; slot.hidden = false; }
    el.setAttribute('aria-invalid', 'true');
  }
  function clear() {
    aiForm.querySelectorAll('[data-error]').forEach(function (n) { n.textContent = ''; n.hidden = true; });
    aiForm.querySelectorAll('[aria-invalid]').forEach(function (n) { n.removeAttribute('aria-invalid'); });
  }

  // While the workflow reads the page and Claude writes, say what is happening.
  var WAIT = ['Lasām Tavu lapu…', 'Salīdzinām to ar Tavām atbildēm…', 'Rakstām ieteikumus…', 'Vēl dažas sekundes…'];
  var waitTimer = null;
  function waiting(on, hasUrl) {
    clearInterval(waitTimer);
    if (!on) return;
    var lines = hasUrl ? WAIT : WAIT.slice(1);
    var k = 0;
    aiOut.innerHTML = '<div class="quiz-wait"><span class="quiz-wait-bar" aria-hidden="true"></span><p data-wait>' + lines[0] + '</p></div>';
    var p = aiOut.querySelector('[data-wait]');
    waitTimer = setInterval(function () { k = Math.min(k + 1, lines.length - 1); p.textContent = lines[k]; }, 5000);
  }

  aiForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!state) return;
    clear();
    var email = aiForm.email.value.trim();
    var url = aiForm.website.value.trim();
    var ok = true;
    if (url && !URL_RE.test(url)) { fail(aiForm.website, 'Pārbaudi adresi, piemēram: tavalapa.lv'); ok = false; }
    if (!EMAIL_RE.test(email)) { fail(aiForm.email, 'Pārbaudi e-pasta adresi.'); ok = false; }
    if (!aiForm.consent.checked) { fail(aiForm.consent, 'Bez piekrišanas ieteikumus nevaram nosūtīt.'); ok = false; }
    if (!ok) return;

    var btn = aiForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    aiForm.hidden = true;
    waiting(true, !!url);
    if (window.msTrack) window.msTrack('generate_lead', { form_id: FORM_ID, page_path: location.pathname }, { email: email });

    var payload = JSON.stringify({
      email: email, url: url, a: state.idx.join(','), areas: state.levels.join(','),
      top: state.top.join(','), page: location.pathname,
    });
    var settled = false;
    function settle(data) {
      if (settled) return;
      settled = true;
      waiting(false);
      if (data && data.ok) render(data, email); else lost(email, url);
    }
    var timer = setTimeout(function () { settle(null); }, 60000);
    try {
      fetch(HOOK, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: payload })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { clearTimeout(timer); settle(d); })
        .catch(function () { clearTimeout(timer); settle(null); });
    } catch (err) { clearTimeout(timer); settle(null); }
  });

  function render(d, email) {
    var items = Array.isArray(d.ieteikumi) ? d.ieteikumi : [];
    aiOut.innerHTML =
      '<span class="eyebrow">' + (d.ai ? 'Ieteikumi Tavam uzņēmumam' : 'Ieteikumi') + '</span>' +
      (d.ai && d.lapa ? '<p class="quiz-ai-lapa">' + esc(d.lapa) + '</p>' : '') +
      '<ol class="quiz-top">' + items.map(function (x) {
        return '<li><strong>' + esc(x.virsraksts) + '</strong><p>' + esc(x.kapec) + '</p>' +
          (x.pirmais_solis ? '<p><span class="qt-label">Pirmais solis</span>' + esc(x.pirmais_solis) + '</p>' : '') + '</li>';
      }).join('') + '</ol>' +
      '<p class="fine">' + (d.ai
        ? 'Ieteikumus sagatavoja AI, balstoties uz Tavām atbildēm' + (d.lapa ? ' un lapas tekstu' : '') + '. Cilvēks tos vēl nav pārbaudījis, tāpēc uztver tos kā sākumpunktu. '
        : 'Šoreiz personalizētus ieteikumus nevarējām sagatavot, tāpēc šie ir vispārīgi. ') +
      'Kopiju nosūtījām uz <strong>' + esc(email) + '</strong>.</p>' +
      '<div class="btn-wrap"><a class="btn" href="/sazinies/">Pieteikties iepazīšanās zvanam</a>' +
      '<a class="btn btn--ghost" href="/marketinga-automatizacija/">Kā mēs to ieviešam</a></div>';
    aiOut.scrollIntoView({ block: 'start' });
  }

  /* A lost request must not cost the lead: a pre-filled e-mail instead. */
  function lost(email, url) {
    var lv = state.levels.map(function (l, i) { return QUIZ.areas[i].name + ': ' + QUIZ.levels[l]; }).join('\n');
    var href = 'mailto:rihards@marketingaskola.lv?subject=' + encodeURIComponent('Automatizācijas tests') +
      '&body=' + encodeURIComponent('E-pasts: ' + email + '\nLapa: ' + (url || '-') + '\n\n' + lv);
    aiOut.innerHTML =
      '<h3>Ieteikumus neizdevās sagatavot</h3>' +
      '<p class="lm-sub">Visticamāk, vainīgs savienojums vai reklāmu bloķētājs. Atsūti mums rezultātu pa e-pastu, un ieteikumus sagatavosim paši.</p>' +
      '<div class="btn-wrap"><a class="btn" href="' + esc(href) + '">Atvērt e-pastu</a></div>';
  }
})();
