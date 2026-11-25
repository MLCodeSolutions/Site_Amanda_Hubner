/* ==========================================================================
   safe.js — só permite http/https em URLs externas; mailto é tratado à parte.
   ========================================================================== */

window.safeUrl = function (value) {
  if (!value) return '';
  try {
    var url = new URL(value, window.location.href);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
  } catch (error) {
    return '';
  }
};
