/* Lead magnet popup. Since 11 Oct 2026 it is ONE offer, an invitation to the
 * marketing automation quiz at /automatizacijas-tests/; the quiz page collects
 * the e-mail and sends the result (quiz.js). The owner retired the two older
 * offers (the LIAA sagatave and the automated page check) because neither
 * applied to most visitors. Git has the form-handling version of this file.
 *
 * WHEN IT APPEARS - the tuned part, unchanged. Never immediately: Google
 * treats an interstitial that covers the content on arrival as a ranking
 * problem on mobile, and it is simply rude. Desktop gets exit intent, phones
 * get 55% scroll depth, and either way only after 20 seconds. Once per
 * visitor; 60 days after a dismissal or a click through; never while the
 * cookie banner is still open, because stacking two overlays on a first visit
 * is how people leave. Finishing the quiz writes "seen", which ends it for good.
 */
(function () {
  var box = document.querySelector('[data-lm]');
  if (!box) return;
  var KEY = 'ms-lm';

  var read = function () { try { return localStorage.getItem(KEY); } catch (e) { return 'seen'; } };
  var write = function (v) { try { localStorage.setItem(KEY, v); } catch (e) { /* private mode */ } };

  // "seen" is permanent (they finished the quiz); a timestamp is a dismissal.
  var prev = read();
  if (prev === 'seen') return;
  if (prev && Date.now() - Number(prev) < 60 * 864e5) return;

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
    var go = box.querySelector('[data-lm-go]');
    if (go) go.focus();
    if (window.msTrack) window.msTrack('lead_magnet_open', { page_path: location.pathname });
  }

  function close() {
    box.hidden = true;
    document.body.style.overflow = '';
    write(String(Date.now()));
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
    if (e.target === box || e.target.closest('[data-lm-close]')) close();
    if (e.target.closest('[data-lm-go]')) {
      // Going to the quiz counts as an answer for 60 days; finishing it is forever.
      write(String(Date.now()));
      if (window.msTrack) window.msTrack('lead_magnet_click', { page_path: location.pathname });
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !box.hidden) close();
    // Keep the tab ring inside the dialog while it is open.
    if (e.key === 'Tab' && !box.hidden) {
      var f = box.querySelectorAll('button, a[href]');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();
