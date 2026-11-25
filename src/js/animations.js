/* ==========================================================================
   animations.js — reveals, header, progresso, scrollspy, parallax e tilt
   Não altera textos: apenas classes, atributos de estado e elementos decorativos.
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var tiltMQ = window.matchMedia
    ? window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px) and (prefers-reduced-motion: no-preference)')
    : null;
  var parallaxMQ = window.matchMedia
    ? window.matchMedia('(min-width: 1024px) and (hover: hover) and (prefers-reduced-motion: no-preference)')
    : null;

  var header = document.querySelector('.site-header');
  var menu = document.querySelector('[data-sc-menu]');
  var burger = document.querySelector('[data-burger]');

  /* ---------- Loader de entrada ---------- */

  var boot = document.getElementById('abh-boot');
  var bootDone = false;
  var bootFade = reduceMQ && reduceMQ.matches ? 0 : 320;

  function finishBoot() {
    if (bootDone) return;
    bootDone = true;
    root.classList.add('is-ready');

    window.setTimeout(function () {
      root.classList.add('is-complete');
      try {
        window.dispatchEvent(new Event('site:ready'));
      } catch (error) {}

      window.setTimeout(function () {
        if (boot && boot.parentNode) boot.parentNode.removeChild(boot);
      }, 700);
    }, bootFade);
  }

  function scheduleBoot() {
    if (bootDone) return;
    var min = reduceMQ && reduceMQ.matches ? 500 : 1000;
    var wait = Math.max(0, min - performance.now());
    window.setTimeout(finishBoot, wait);
  }

  var pageLoaded = new Promise(function (resolve) {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', resolve, { once: true });
    }
  });

  var fontsLoaded = document.fonts && document.fonts.ready
    ? Promise.race([
        document.fonts.ready,
        new Promise(function (resolve) {
          window.setTimeout(resolve, 1200);
        })
      ])
    : Promise.resolve();

  Promise.all([pageLoaded, fontsLoaded]).then(scheduleBoot);
  window.setTimeout(finishBoot, 3000);

  /* ---------- Barra de progresso ---------- */

  var progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  progress.appendChild(document.createElement('span'));
  document.body.appendChild(progress);

  /* ---------- Reveals ---------- */

  var revealMap = [
    ['.section-head', 'reveal--up', false],
    ['.section-head--simple', 'reveal--up', false],
    ['.quote-feature', 'reveal--left', false],
    ['.testimonial', 'reveal--up', true],
    ['.marquee-mask--section', 'reveal--scale', false],
    ['.benefits-photo', 'reveal--left', false],
    ['.feature', 'reveal--up', true],
    ['.service-card', 'reveal--up', true],
    ['.service-panel', 'reveal--scale', false],
    ['.about-photo', 'reveal--left', false],
    ['.about-copy', 'reveal--right', false],
    ['.mini-card', 'reveal--up', true],
    ['.faq-intro', 'reveal--up', false],
    ['.faq-item', 'reveal--up', true],
    ['.cta-panel', 'reveal--scale', false],
    ['.contact-card', 'reveal--up', true],
    ['.site-footer__inner', 'reveal--up', false]
  ];

  var revealTargets = [];

  revealMap.forEach(function (entry) {
    var selector = entry[0];
    var variant = entry[1];
    var stagger = entry[2];

    Array.prototype.forEach.call(document.querySelectorAll(selector), function (el) {
      var index = 0;

      if (stagger && el.parentElement) {
        var siblings = Array.prototype.filter.call(el.parentElement.children, function (child) {
          return child.matches(selector);
        });
        index = siblings.indexOf(el);
      }

      el.classList.add('reveal', variant);
      if (index > 0) el.style.setProperty('--reveal-delay', index * 90 + 'ms');
      revealTargets.push(el);
    });
  });

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-inview');
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    revealTargets.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealTargets.forEach(function (el) {
      el.classList.add('is-inview');
    });
  }

  /* ---------- Scrollspy do menu ---------- */

  var navLinks = document.querySelectorAll('.nav-desktop a[href^="#"], .nav-mobile a[href^="#"]');
  var spySections = ['beneficios', 'servicos', 'sobre', 'faq', 'contato'];
  var currentActive = null;

  function setActive(id) {
    if (id === currentActive) return;
    currentActive = id;

    Array.prototype.forEach.call(navLinks, function (link) {
      var active = link.getAttribute('href') === '#' + id;
      link.classList.toggle('is-active', active);
      if (active) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  if ('IntersectionObserver' in window) {
    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    spySections.forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spyObserver.observe(section);
    });
  }

  /* ---------- Parallax ---------- */

  var parallaxItems = [
    { wrap: document.querySelector('.hero-photo'), img: document.querySelector('.hero-photo img'), max: 18, scale: 1.08 },
    { wrap: document.querySelector('.benefits-photo'), img: document.querySelector('.benefits-photo img'), max: 14, scale: 1.06 },
    { wrap: document.querySelector('.about-photo'), img: document.querySelector('.about-photo img'), max: 12, scale: 1.05 }
  ].filter(function (item) {
    return item.wrap && item.img;
  });

  var parallaxApplied = false;

  function resetParallax() {
    if (!parallaxApplied) return;
    parallaxItems.forEach(function (item) {
      item.img.style.removeProperty('transform');
    });
    parallaxApplied = false;
  }

  function updateParallax() {
    if (!parallaxMQ || !parallaxMQ.matches) {
      resetParallax();
      return;
    }

    parallaxApplied = true;
    var viewport = window.innerHeight;

    parallaxItems.forEach(function (item) {
      var rect = item.wrap.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > viewport + 200) return;

      var center = rect.top + rect.height / 2;
      var progress = (viewport / 2 - center) / (viewport / 2 + rect.height / 2);
      progress = Math.max(-1, Math.min(1, progress));

      item.img.style.transform =
        'translate3d(0,' + (progress * item.max).toFixed(2) + 'px,0) scale(' + item.scale + ')';
    });
  }

  /* ---------- Tilt 3D ---------- */

  function initTilt(el) {
    if (!tiltMQ || !tiltMQ.matches) return;

    el.classList.add('tilt-ready');
    var rect = null;

    function measure() {
      rect = el.getBoundingClientRect();
    }

    function onEnter() {
      measure();
    }

    function onMove(event) {
      if (!tiltMQ.matches || event.pointerType === 'touch') return;
      if (!rect) measure();
      if (!rect || !rect.width || !rect.height) return;

      var x = (event.clientX - rect.left) / rect.width - 0.5;
      var y = (event.clientY - rect.top) / rect.height - 0.5;

      el.style.setProperty('--tilt-x', (-y * 3).toFixed(2) + 'deg');
      el.style.setProperty('--tilt-y', (x * 3).toFixed(2) + 'deg');
      el.classList.add('is-tilting');
    }

    function onLeave() {
      rect = null;
      el.classList.remove('is-tilting');
      el.style.removeProperty('--tilt-x');
      el.style.removeProperty('--tilt-y');
    }

    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
  }

  var armTilt = [];

  Array.prototype.forEach.call(
    document.querySelectorAll('.service-card, .stat-card, .mini-card, .contact-card'),
    function (el) {
      var armed = false;

      function arm() {
        if (armed || !tiltMQ || !tiltMQ.matches) return;
        armed = true;
        initTilt(el);
      }

      armTilt.push(arm);
      el.addEventListener('animationend', function (event) {
        if (event.target === el) arm();
      });
      setTimeout(arm, 1600);
    }
  );

  /* ---------- Header e progresso no scroll ---------- */

  var lastY = window.scrollY || window.pageYOffset || 0;
  var forceHeaderUntil = 0;
  var ticking = false;

  function update() {
    var y = window.scrollY || window.pageYOffset || 0;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;

    root.style.setProperty('--scroll-progress', ratio.toFixed(4));

    if (ratio > 0.995) {
      setActive('contato');
    } else if (y < 40) {
      setActive('');
    }

    if (header) {
      header.classList.toggle('is-scrolled', y > 16);

      if (reduceMQ && reduceMQ.matches) {
        header.classList.remove('is-hidden');
      } else {
        var menuOpen = menu && menu.hasAttribute('data-open');
        var forced = performance.now() < forceHeaderUntil;

        if (!bootDone || y < 180 || menuOpen || forced) {
          header.classList.remove('is-hidden');
        } else if (y > lastY + 8 && y > 340) {
          header.classList.add('is-hidden');
        } else if (y < lastY - 8) {
          header.classList.remove('is-hidden');
        }
      }
    }

    updateParallax();
    lastY = y;
    ticking = false;
  }

  function schedule() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('load', schedule);
  schedule();

  if ('ResizeObserver' in window) {
    new ResizeObserver(schedule).observe(document.body);
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest ? event.target.closest('a[href^="#"]') : null;
    if (!link) return;
    forceHeaderUntil = performance.now() + 1800;
    if (header) header.classList.remove('is-hidden');
  });

  if (burger) {
    burger.addEventListener('click', function () {
      forceHeaderUntil = performance.now() + 900;
      if (header) header.classList.remove('is-hidden');
    });
  }

  if (header) {
    header.addEventListener('focusin', function () {
      header.classList.remove('is-hidden');
    });
  }

  function bindChange(mq, handler) {
    if (!mq) return;
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
    } else if (mq.addListener) {
      mq.addListener(handler);
    }
  }

  bindChange(reduceMQ, function () {
    if (header) header.classList.remove('is-hidden');
    updateParallax();
    schedule();
  });

  bindChange(parallaxMQ, function () {
    updateParallax();
  });

  bindChange(tiltMQ, function () {
    if (tiltMQ && tiltMQ.matches) armTilt.forEach(function (arm) { arm(); });
  });
})();
