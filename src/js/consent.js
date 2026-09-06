// Cookie consent + Google analytics loader. Rendered only when
// site.analytics.ga4Id OR .gtmId is set (src/_data/site.json), and never on
// PREVIEW builds. Nothing from Google loads until the visitor presses
// "Piekrītu"; the choice lives in localStorage so the banner is asked once
// per browser.
//
// GA4 (gtag.js) and the Meta pixel are loaded DIRECTLY rather than through a
// container, and only after "Piekrītu" - so nothing from Google or Meta runs
// for a visitor who refuses. The
// GTM-MVJJGQ4 container still holds a dead Universal Analytics tag and a
// 2020 Facebook Pixel set to fire on All Pages, so publishing it would have
// switched that pixel back on as a side effect of turning analytics on.
// The gtmId path is kept working for the day that container is cleaned up.
(function () {
  var script = document.currentScript;
  var ga4Id = script && script.getAttribute('data-ga4');
  var metaId = script && script.getAttribute('data-meta');
  var gtmId = script && script.getAttribute('data-gtm');
  if (!ga4Id && !metaId && !gtmId) return;

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

  // One place for the rest of the site to report a conversion. Events queue on
  // the dataLayer whether or not consent has been given; if it is refused
  // gtag.js never loads and nothing is ever sent, so this is safe to call
  // unconditionally from anywhere.
  var META_EVENT = {
    generate_lead: 'Lead',
    begin_checkout: 'InitiateCheckout',
    schedule_booking: 'Schedule',
    contact_click: 'Contact'
  };
  window.msTrack = function (name, params) {
    try { gtag('event', name, params || {}); } catch (e) { /* never break the page for analytics */ }
    try {
      var meta = META_EVENT[name];
      if (meta && window.fbq) window.fbq('track', meta, params || {});
    } catch (e) { /* same */ }
  };

  var add = function (src) {
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  };

  var loaded = false;
  function loadAnalytics() {
    if (loaded) return;
    loaded = true;
    gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted'
    });
    if (ga4Id) {
      // gtag.js reads the same window.dataLayer, so these queue safely before
      // the script arrives.
      gtag('js', new Date());
      gtag('config', ga4Id);
      add('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ga4Id));
    }
    if (metaId) {
      // Meta's own loader, trimmed: fbq queues calls until fbevents.js arrives.
      if (!window.fbq) {
        var n = window.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!window._fbq) window._fbq = n;
        n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
        add('https://connect.facebook.net/en_US/fbevents.js');
      }
      window.fbq('init', metaId);
      window.fbq('track', 'PageView');
    }
    if (gtmId) {
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      add('https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(gtmId));
    }
  }
  function show() { if (banner) { banner.hidden = false; var b = banner.querySelector('button'); if (b) b.focus(); } }
  function hide() { if (banner) banner.hidden = true; }

  var state = read();
  if (state === 'granted') loadAnalytics();
  else if (state !== 'denied') show();

  if (banner) {
    banner.querySelector('[data-consent-accept]').addEventListener('click', function () { write('granted'); hide(); loadAnalytics(); });
    banner.querySelector('[data-consent-reject]').addEventListener('click', function () { write('denied'); hide(); });
  }
  // Footer "Sīkdatņu iestatījumi" reopens the banner so a choice can be changed.
  document.querySelectorAll('[data-consent-open]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); show(); });
  });
})();
