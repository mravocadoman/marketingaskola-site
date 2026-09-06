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
  var capiUrl = script && script.getAttribute('data-capi');
  var capiSecret = script && script.getAttribute('data-capi-secret');
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

  var cookie = function (n) {
    var m = document.cookie.match('(^|;)\\s*' + n + '\\s*=\\s*([^;]+)');
    return m ? m.pop() : undefined;
  };
  // Hash in the BROWSER so raw personal data never reaches n8n or its logs.
  var sha256 = function (v) {
    if (!v || !window.crypto || !crypto.subtle) return Promise.resolve(undefined);
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(v)))
      .then(function (b) {
        return Array.prototype.map.call(new Uint8Array(b), function (x) {
          return ('0' + x.toString(16)).slice(-2);
        }).join('');
      })
      .catch(function () { return undefined; });
  };

  // Same event, two roads: the pixel from the browser and the Conversions API
  // from n8n. Both carry the SAME event_id, so Meta keeps one and drops the
  // duplicate. The server road survives the ad blockers that kill the pixel.
  function toCapi(metaName, params, id, identity) {
    if (!capiUrl) return;
    var idty = identity || {};
    Promise.all([sha256(idty.email && String(idty.email).trim().toLowerCase()),
                 sha256(idty.phone && String(idty.phone).replace(/[^0-9]/g, ''))])
      .then(function (h) {
        var body = {
          event_name: metaName,
          event_id: id,
          event_source_url: location.href,
          action_source: 'website',
          client_user_agent: navigator.userAgent,
          fbp: cookie('_fbp'),
          fbc: cookie('_fbc'),
          em: h[0],
          ph: h[1]
        };
        if (params && params.value !== undefined) { body.value = params.value; body.currency = params.currency || 'EUR'; }
        var headers = { 'content-type': 'application/json' };
        if (capiSecret) headers['x-ms-secret'] = capiSecret;
        // keepalive so the request survives the click navigating away.
        fetch(capiUrl, { method: 'POST', headers: headers, body: JSON.stringify(body), keepalive: true })
          .catch(function () { /* analytics must never affect the visitor */ });
      });
  }

  window.msTrack = function (name, params, identity) {
    try { gtag('event', name, params || {}); } catch (e) { /* never break the page for analytics */ }
    var meta = META_EVENT[name];
    if (!meta) return;
    var id = name + '.' + Date.now() + '.' + Math.random().toString(36).slice(2, 10);
    try { if (window.fbq) window.fbq('track', meta, params || {}, { eventID: id }); } catch (e) { /* same */ }
    try { toCapi(meta, params, id, identity); } catch (e) { /* same */ }
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
