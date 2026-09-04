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

  /* ---------- scroll reveal ---------- */
  if (!reduce && 'IntersectionObserver' in window) {
    var targets = document.querySelectorAll(
      '.cell, .post-card, .testimonial, .step, .stat, .cta, .counter, .course-tile, .media, .blurb, .team-card, .sec-head, .course-card, .instructor-card, .faq, .tick-list li'
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
        el.style.transitionDelay = Math.min(Math.max(0, sibs.indexOf(el)) * 70, 350) + 'ms';
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
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
        var dur = 900;
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
})();
