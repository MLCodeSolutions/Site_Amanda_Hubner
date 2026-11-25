import './safe.js';
import './site-config.js';
import './animations.js';
import './main.js';

(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  var lite =
    (connection && (connection.saveData || /(^|-)2g$/.test(connection.effectiveType || ''))) ||
    (window.matchMedia && window.matchMedia('(prefers-reduced-data: reduce)').matches) ||
    window.innerWidth <= 600;

  if (lite) root.classList.add('lite-mode');

  var toTop = document.querySelector('[data-to-top]');
  var ticking = false;

  function updateToTop() {
    if (!toTop) return;
    toTop.classList.toggle('is-visible', window.scrollY > 520);
    ticking = false;
  }

  function schedule() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateToTop);
  }

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
    window.addEventListener('scroll', schedule, { passive: true });
    updateToTop();
  }
})();
