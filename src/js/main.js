// Mobile nav, header state, scroll-reveal. No dependencies.
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // On mobile, first tap on a parent item opens its dropdown; second tap follows the link.
  document.querySelectorAll('.nav .has-children > a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var li = a.parentElement;
      if (window.matchMedia('(max-width: 1020px)').matches && !li.classList.contains('open')) {
        e.preventDefault();
        li.classList.add('open');
      }
    });
  });

  // Header shadow after scrolling
  var header = document.querySelector('.header');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Scroll reveal: cards and grid items fade in with a small stagger.
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    var targets = document.querySelectorAll('.blurb, .post-card, .testimonial, .step, .stat, .cta, .counter');
    targets.forEach(function (el) { el.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = Array.prototype.filter.call(el.parentElement ? el.parentElement.children : [], function (s) { return s.classList && s.classList.contains('reveal'); });
        var idx = Math.max(0, siblings.indexOf(el));
        el.style.transitionDelay = Math.min(idx * 70, 350) + 'ms';
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  }
})();
