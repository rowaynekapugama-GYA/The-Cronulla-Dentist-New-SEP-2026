/**
 * Injected into every page of static-site/ by scripts/build-static.mjs.
 *
 * Those pages use absolute asset paths (/_next/…, /images/…) because that is what a
 * hosted site needs. Opened straight from disk, or served from the wrong root, the
 * stylesheet never loads and the page renders as unstyled blue links with broken
 * images — which looks like a broken build rather than the wrong folder.
 *
 * This detects that state and says what to do instead. It is inert on a correctly
 * served page (the check returns immediately) and is stripped out of preview-offline/.
 */
(function () {
  function check() {
    try {
      var nav = document.querySelector('.nav');
      if (!nav) return;
      // .nav is position:fixed in globals.css — if it computes to anything else, our CSS never applied.
      if (getComputedStyle(nav).position === 'fixed') return;

      var fromDisk = location.protocol === 'file:';
      var code = 'background:rgba(255,255,255,.16);padding:2px 6px;border-radius:4px;font-family:ui-monospace,Menlo,monospace';
      var box = document.createElement('div');
      box.setAttribute('role', 'alert');
      box.style.cssText =
        'position:fixed;left:0;right:0;top:0;z-index:2147483647;background:#0E3566;color:#fff;' +
        'font:15px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;padding:20px 24px;' +
        'box-shadow:0 8px 28px rgba(0,0,0,.35)';

      box.innerHTML = fromDisk
        ? '<strong>This is the folder for hosting — it cannot be opened from disk.</strong><br>' +
          'Its asset paths start at the site root, so over <span style="' + code + '">file://</span> ' +
          'nothing loads and the page falls back to unstyled links.<br>' +
          'To look at the design, open <span style="' + code + '">preview-offline/index.html</span> ' +
          '(or <span style="' + code + '">_all-pages.html</span>) instead. Upload <em>this</em> folder to Vercel.'
        : '<strong>The stylesheet did not load.</strong><br>' +
          'This build must be served from the site root. Check that the deploy points at this folder ' +
          'and that <span style="' + code + '">/_next/</span> is reachable.';

      document.body.insertBefore(box, document.body.firstChild);
    } catch (e) {
      /* never let the guard itself break the page */
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(check, 120);
    });
  } else {
    setTimeout(check, 120);
  }
})();
