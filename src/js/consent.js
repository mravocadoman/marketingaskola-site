// Cookie consent + Google Tag Manager loader. Rendered only when
// site.analytics.gtmId is set (src/_data/site.json) and never on PREVIEW
// builds. Nothing from Google loads until the visitor presses "Piekrītu";
// the choice lives in localStorage so the banner is asked once per browser.
(function () {
  var script = document.currentScript;
  var gtmId = script && script.getAttribute('data-gtm');
  if (!gtmId) return;

  var KEY = 'ms-consent';
  var banner = document.querySelector('[data-consent]');
  var read = function () { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  var write = function (v) { try { localStorage.setItem(KEY, v); } catch (e) { /* private mode: ask again next time */ } };

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  // Consent Mode v2 defaults: everything denied until the visitor decides.
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500
  });

  var loaded = false;
  function loadGtm() {
    if (loaded) return;
    loaded = true;
    gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted'
    });
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(gtmId);
    document.head.appendChild(s);
  }
  function show() { if (banner) { banner.hidden = false; var b = banner.querySelector('button'); if (b) b.focus(); } }
  function hide() { if (banner) banner.hidden = true; }

  var state = read();
  if (state === 'granted') loadGtm();
  else if (state !== 'denied') show();

  if (banner) {
    banner.querySelector('[data-consent-accept]').addEventListener('click', function () { write('granted'); hide(); loadGtm(); });
    banner.querySelector('[data-consent-reject]').addEventListener('click', function () { write('denied'); hide(); });
  }
  // Footer "Sīkdatņu iestatījumi" reopens the banner so a choice can be changed.
  document.querySelectorAll('[data-consent-open]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); show(); });
  });
})();
