// Mobile nav toggle + dropdown tap support. No dependencies.
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  // On touch/mobile, first tap on a parent item opens its dropdown; second tap follows the link.
  document.querySelectorAll('.nav .has-children > a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var li = a.parentElement;
      var isMobile = window.matchMedia('(max-width: 980px)').matches;
      if (isMobile && !li.classList.contains('open')) {
        e.preventDefault();
        li.classList.add('open');
      }
    });
  });
})();
