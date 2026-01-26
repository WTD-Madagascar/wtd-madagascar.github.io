// Détermine si la page est dans /doc
(function () {
  const inDoc = location.pathname.includes('/doc/');
  window.BASE_PATH = inDoc ? '../' : '';
})();
