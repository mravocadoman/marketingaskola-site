// Mārketinga Skola — interaction layer. No dependencies, no frameworks.
// Everything degrades to a fully usable static page and respects
// prefers-reduced-motion.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mobile navigation ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
  // First tap opens a submenu on touch layouts; second tap follows the link.
  document.querySelectorAll('.nav .has-children > a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var li = a.parentElement;
      if (window.matchMedia('(max-width: 1020px)').matches && !li.classList.contains('open')) {
        e.preventDefault();
        li.classList.add('open');
      }
    });
  });

  /* ---------- header state ---------- */
  var header = document.querySelector('.header');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* The tempo knob lives in CSS (--motion on :root) so one number slows or
     speeds everything; the JS timings below read the same value. */
  var MOTION = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--motion')) || 1;

  /* ---------- scroll reveal ---------- */
  // List items are NOT reveal targets (9 Oct 2026). Each bullet faded in on its
  // own; owner: "doesn't look professional". A list arrives with its section.
  if (!reduce && 'IntersectionObserver' in window) {
    var targets = document.querySelectorAll(
      '.cell, .post-card, .testimonial, .step, .stat, .cta, .counter, .course-tile, .media, .blurb, .team-card, .sec-head, .course-card, .instructor-card, .faq'
    );
    targets.forEach(function (el) { el.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var sibs = Array.prototype.filter.call(
          el.parentElement ? el.parentElement.children : [],
          function (s) { return s.classList && s.classList.contains('reveal'); }
        );
        var delay = Math.min(Math.max(0, sibs.indexOf(el)) * 70 * MOTION, 350 * MOTION);
        el.style.transitionDelay = delay + 'ms';
        el.classList.add('in');
        io.unobserve(el);
        // The stagger delay applies to EVERY transition on the element, so it
        // would also hold back the hover lift on a card. Drop it once the
        // entrance has finished.
        setTimeout(function () { el.style.transitionDelay = ''; }, delay + 700 * MOTION);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- kinetic hero headline (9 Oct 2026) ----------
     Wraps each word of a hero h1 in its own clipping box so it can rise out
     of the line; on the homepage each letter too, so it can hop on hover.
     The heading keeps its full text as aria-label and the spans are hidden
     from assistive tech, so a screen reader hears one heading, not letters.
     <em> keywords and the cyan full stop are kept as they are. */
  if (!reduce) {
    document.querySelectorAll('.sec--hero h1, .page-hero h1').forEach(function (h1) {
      var letters = !!h1.closest('.sec--hero') && window.matchMedia('(hover: hover)').matches;
      var n = 0;
      h1.setAttribute('aria-label', h1.textContent.replace(/\s+/g, ' ').trim());
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (child) {
          if (child.nodeType === 1) {
            if (child.classList.contains('accent-text')) child.setAttribute('aria-hidden', 'true');
            else walk(child);
            return;
          }
          if (child.nodeType !== 3 || !child.textContent.trim()) return;
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var w = document.createElement('span');
            w.className = 'w';
            w.setAttribute('aria-hidden', 'true');
            var wi = document.createElement('span');
            wi.className = 'wi';
            wi.style.setProperty('--i', n++);
            if (letters) {
              Array.from(part).forEach(function (c) {
                var ch = document.createElement('span');
                ch.className = 'ch';
                ch.textContent = c;
                wi.appendChild(ch);
              });
            } else {
              wi.textContent = part;
            }
            w.appendChild(wi);
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        });
      })(h1);
      h1.classList.add('split');
    });
  }

  /* ---------- ledger stat counters ----------
     Counts up the numeric part of a stat while preserving its formatting
     ("1M", "100", "36,34"). Suffixes live in their own span, untouched. */
  var stats = document.querySelectorAll('.stat .num, .counter .num');
  if (stats.length && !reduce && 'IntersectionObserver' in window) {
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        countIO.unobserve(el);
        var sfx = el.querySelector('.sfx');
        var sfxHtml = sfx ? sfx.outerHTML : '';
        var raw = (sfx ? el.textContent.replace(sfx.textContent, '') : el.textContent).trim();
        var m = raw.match(/^([^\d]*)([\d\s.,]+)(.*)$/);
        if (!m) return;
        var pre = m[1], digits = m[2].trim(), post = m[3];
        var decimals = (digits.split(/[.,]/)[1] || '').length;
        var sep = digits.indexOf(',') > -1 ? ',' : '.';
        var hasSpace = /\s/.test(digits);
        var target = parseFloat(digits.replace(/\s/g, '').replace(',', '.'));
        if (!isFinite(target)) return;
        var start = performance.now();
        var dur = 900 * MOTION;
        el.setAttribute('data-count', '');
        (function tick(now) {
          var t = Math.min(1, (now - start) / dur);
          var eased = 1 - Math.pow(1 - t, 3);
          var val = target * eased;
          var out = decimals ? val.toFixed(decimals).replace('.', sep) : String(Math.round(val));
          if (hasSpace) out = out.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
          el.innerHTML = pre + out + post + sfxHtml;
          if (t < 1) requestAnimationFrame(tick);
        })(start);
      });
    }, { threshold: 0.5 });
    stats.forEach(function (el) { countIO.observe(el); });
  }

  /* ---------- homepage hero reel (9 Oct 2026) ----------
     Plays the reel only where it is shown (wide screens - phones hide the
     artwork), never under reduced motion or Save-Data, and only while it is
     on screen. The brand in the ad bar follows the cuts; the result cards
     count up once they have popped in and drift against the cursor. */
  var reel = document.querySelector('[data-hero-reel]');
  if (reel) {
    var vid = reel.querySelector('video');
    var brandEl = reel.querySelector('[data-reel-brand]');
    var clientEl = reel.querySelector('[data-reel-client]');
    // Where each clip starts in hero-reel.mp4. Keep in step with the ffmpeg cut.
    var cuts = [[0, 'Fitosauna'], [3.8, 'Lumi mājas'], [7.6, 'Fitosauna'], [11.4, 'Lumi mājas']];
    var saveData = navigator.connection && navigator.connection.saveData;
    if (vid && !reduce && !saveData && window.matchMedia('(min-width: 981px)').matches) {
      vid.preload = 'auto';
      var tryPlay = function () { var p = vid.play(); if (p && p.catch) p.catch(function () {}); };
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) tryPlay(); else vid.pause(); });
        }, { threshold: 0.2 }).observe(vid);
      } else { tryPlay(); }
      vid.addEventListener('timeupdate', function () {
        var t = vid.currentTime, name = cuts[0][1];
        for (var i = 0; i < cuts.length; i++) if (t >= cuts[i][0]) name = cuts[i][1];
        if (brandEl && brandEl.textContent !== name) {
          brandEl.textContent = name;
          if (clientEl) clientEl.textContent = name;
        }
      });
    }
    if (!reduce && window.matchMedia('(hover: hover)').matches) {
      var stage = reel.closest('.sec--hero') || reel;
      stage.addEventListener('mousemove', function (e) {
        var r = reel.getBoundingClientRect();
        var px = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2);
        var py = (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2);
        reel.style.setProperty('--px', Math.max(-1, Math.min(1, px)).toFixed(3));
        reel.style.setProperty('--py', Math.max(-1, Math.min(1, py)).toFixed(3));
      });
      stage.addEventListener('mouseleave', function () {
        reel.style.setProperty('--px', 0);
        reel.style.setProperty('--py', 0);
      });
    }
    if (!reduce) {
      reel.querySelectorAll('.reel-card-num').forEach(function (el, k) {
        var sfx = el.querySelector('.sfx');
        var sfxHtml = sfx ? sfx.outerHTML : '';
        var raw = (sfx ? el.textContent.replace(sfx.textContent, '') : el.textContent).trim();
        var dec = (raw.split(',')[1] || '').length;
        var target = parseFloat(raw.replace(',', '.'));
        if (!isFinite(target)) return;
        var show = function (v) { el.innerHTML = v.toFixed(dec).replace('.', ',') + sfxHtml; };
        show(0);
        setTimeout(function () {
          var start = performance.now(), dur = 1100 * MOTION;
          (function tick(now) {
            var t = Math.min(1, (now - start) / dur);
            show(target * (1 - Math.pow(1 - t, 3)));
            if (t < 1) requestAnimationFrame(tick);
          })(start);
        }, (900 + k * 200) * MOTION);
      });
    }
  }

  /* ---------- article reading progress ---------- */
  var bar = document.querySelector('[data-read-progress]');
  var article = document.querySelector('.article-body');
  if (bar && article) {
    var progress = function () {
      var rect = article.getBoundingClientRect();
      var total = rect.height - window.innerHeight;
      var seen = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      bar.style.transform = 'scaleX(' + (total > 0 ? seen / total : 0) + ')';
    };
    window.addEventListener('scroll', progress, { passive: true });
    window.addEventListener('resize', progress);
    progress();
  }

  /* ---------- table-of-contents scrollspy ---------- */
  var toc = document.querySelector('[data-toc]');
  if (toc && 'IntersectionObserver' in window) {
    var links = {};
    toc.querySelectorAll('a[href^="#"]').forEach(function (a) {
      links[decodeURIComponent(a.getAttribute('href').slice(1))] = a.parentElement;
    });
    var heads = Object.keys(links)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);
    if (heads.length) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          Object.keys(links).forEach(function (id) { links[id].classList.remove('is-active'); });
          var li = links[entry.target.id];
          if (li) li.classList.add('is-active');
        });
      }, { rootMargin: '-110px 0px -70% 0px', threshold: 0 });
      heads.forEach(function (h) { spy.observe(h); });
    }
  }

  /* ---------- back to top ---------- */
  if (document.querySelector('.article-body') || document.body.scrollHeight > 4000) {
    var btn = document.createElement('button');
    btn.className = 'to-top';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Atgriezties lapas sākumā');
    btn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
    document.body.appendChild(btn);
    var toggleTop = function () { btn.classList.toggle('show', window.scrollY > 900); };
    window.addEventListener('scroll', toggleTop, { passive: true });
    toggleTop();
  }

  /* ---------- blog search (/blogs/) ---------- */
  var search = document.querySelector("[data-blog-search]");
  var list = document.querySelector("[data-blog-list]");
  if (search && list) {
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-search]"));
    var count = document.querySelector("[data-blog-count]");
    var empty = document.querySelector("[data-blog-empty]");
    var fold = function (s) {
      return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };
    cards.forEach(function (c) { c.setAttribute("data-fold", fold(c.getAttribute("data-search"))); });
    var apply = function () {
      var terms = fold(search.value).split(/\s+/).filter(Boolean);
      var shown = 0;
      cards.forEach(function (c) {
        var hay = c.getAttribute("data-fold");
        var hit = terms.every(function (t) { return hay.indexOf(t) !== -1; });
        c.hidden = !hit;
        if (hit) shown++;
      });
      if (count) count.textContent = "Raksti: " + shown;
      if (empty) empty.hidden = shown !== 0;
      list.classList.toggle("is-filtered", terms.length > 0);
    };
    search.addEventListener("input", apply);
    search.addEventListener("search", apply);
    if (search.value) apply();
  }

  /* Infographic text version, open by default on phones.
     The collages bake their labels into a 1536px-wide image. In the 602px
     article column that reads at ~16px, but at 375px it renders at ~9px and
     the notes at ~6.5px - unreadable, and most blog traffic is a phone. The
     picture stays (it carries the structure); the words just stop being
     hidden behind a disclosure on the screens where the picture cannot be
     read. Without JS nothing changes: the details still works as a toggle. */
  if (window.matchMedia && window.matchMedia("(max-width: 700px)").matches) {
    document.querySelectorAll(".infographic-text").forEach(function (d) { d.open = true; });
  }

  /* Course dates that have passed are hidden client-side (7 Sep 2026).
     The site is static and rebuilds only on push, so a listed date would
     otherwise keep selling like a live one for weeks. Cal.com is the real
     availability; this just stops the page contradicting it. */
  var today = new Date().toISOString().slice(0, 10);
  document.querySelectorAll('[data-date]').forEach(function (el) {
    if (el.getAttribute('data-date') < today) el.hidden = true;
  });

  /* GA4 outbound and intent tracking (6 Sep 2026).
     One delegated listener rather than per-element handlers, so nothing has to
     be wired into the markup when a new button appears. window.msTrack comes
     from consent.js and is a no-op until analytics is switched on, so this is
     safe whether or not the visitor has consented. */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a, [data-track]');
    if (!a || !window.msTrack) return;
    var href = a.getAttribute('href') || '';
    var tag = a.getAttribute('data-track');

    if (tag) {
      window.msTrack('contact_click', { method: tag, page_path: location.pathname });
    } else if (href.indexOf('https://buy.stripe.com') === 0) {
      // Money leaving for checkout: the closest thing this site has to a sale.
      window.msTrack('begin_checkout', { link_url: href, page_path: location.pathname });
    } else if (href.indexOf('https://cal.com') === 0) {
      window.msTrack('schedule_booking', { link_url: href, page_path: location.pathname });
    } else if (href.indexOf('tel:') === 0) {
      window.msTrack('contact_click', { method: 'phone', page_path: location.pathname });
    } else if (href.indexOf('mailto:') === 0) {
      window.msTrack('contact_click', { method: 'email', page_path: location.pathname });
    }
  }, true);
})();
