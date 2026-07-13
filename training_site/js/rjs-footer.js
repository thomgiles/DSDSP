<script>
(function () {
  function deriveHtmlLink() {
    // Prefer Quarto’s source-file metadata
    var meta = document.querySelector('meta[name="quarto:source-file"]');
    if (meta && meta.content) {
      var base = meta.content.replace(/\.[^.]+$/, '');
      return base + '.html';
    }
    // Fallback: swap .revealjs.html → .html in current URL
    var m = (location.pathname || '').match(/([^\/]+)\.revealjs\.html$/);
    if (m) return m[1] + '.html';
    return null;
    }

  function setFooter() {
    var p = document.querySelector('.reveal .footer p') ||
            document.querySelector('.footer.footer-default p') ||
            document.querySelector('.reveal .footer');
    if (!p) return false;
    var target = deriveHtmlLink();
    if (!target) return false;

    var existing = (p.innerHTML || '').trim();
    if (existing.indexOf('Return to Article View') !== -1) return true; // already patched
    var link = '<a href="' + target + '">Return to Article View</a>';
    p.innerHTML = existing ? (link + ' | ' + existing) : link;
    return true;
  }

  function ready() {
    if (setFooter()) return;
    // Footer may be added after Reveal initialises: observe until present
    var mo = new MutationObserver(function () {
      if (setFooter()) mo.disconnect();
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (window.Reveal && typeof window.Reveal.on === 'function') {
    window.Reveal.on('ready', ready);
  } else {
    document.addEventListener('DOMContentLoaded', ready);
  }
})();
</script>
