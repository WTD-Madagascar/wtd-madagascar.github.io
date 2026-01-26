(function () {
  // Sécurité : base path doit exister
  if (typeof window.BASE_PATH === 'undefined') {
    console.warn('BASE_PATH non défini. basepath.js est-il chargé ?');
    window.BASE_PATH = '';
  }

  /* =========================
     CSS dynamique (optionnel)
  ========================== */
  const css = document.querySelector('link[data-main-css]');
  if (css) {
    css.href = BASE_PATH + 'assets/css/style.css';
  }

  /* =========================
     Navigation : liens
  ========================== */
  document.querySelectorAll('a[data-href]').forEach(link => {
    link.setAttribute('href', BASE_PATH + link.dataset.href);
  });

  /* =========================
     Navigation : page active
  ========================== */
  const current = location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('a[data-href]').forEach(link => {
    const target = link.dataset.href.split('/').pop();
    if (target === current) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  /* =========================
     Accessibilité : focus visible
  ========================== */
  document.addEventListener('keyup', e => {
    if (e.key === 'Tab') {
      document.body.classList.add('user-is-tabbing');
    }
  });

})();
