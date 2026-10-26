/* H-Renovation — réalisations : filtres animés */
(function () {
  'use strict';
  var d = document, HR = window.HR || {}, $ = HR.$, $$ = HR.$$;
  var anime = HR.hasG && !HR.calme;

  var galerie = $('[data-galerie]'), filtres = $$('[data-filtre]'), annonce = $('[data-filtres-annonce]');
  if (!galerie) return;
  var items = $$('.mosaique__el', galerie), enCours = false;

  if (anime) {
    gsap.from($$('.filtre'), { opacity: 0, y: 16, duration: 0.6, ease: 'power3.out', stagger: 0.05, delay: 0.5 });
    items.forEach(function (el, i) {
      gsap.from(el, { opacity: 0, y: 60, duration: 1, ease: 'power3.out', delay: (i % 4) * 0.07, scrollTrigger: { trigger: el, start: 'top 95%', once: true } });
    });
  }

  function appliquer(f) {
    var n = 0;
    items.forEach(function (el) {
      var ok = f === 'tout' || (el.getAttribute('data-cat') || '').split(' ').indexOf(f) !== -1;
      el.classList.toggle('est-masque', !ok);
      if (ok) n++;
    });
    if (annonce) annonce.textContent = n + ' réalisation' + (n > 1 ? 's' : '') + ' affichée' + (n > 1 ? 's' : '');
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }
  function filtrer(f) {
    if (enCours) return;
    filtres.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-filtre') === f)); });
    if (!anime) { appliquer(f); return; }
    enCours = true;
    var visibles = items.filter(function (el) { return !el.classList.contains('est-masque'); });
    gsap.to(visibles, {
      opacity: 0, y: 24, scale: 0.96, duration: 0.28, ease: 'power2.in', stagger: 0.01,
      onComplete: function () {
        appliquer(f);
        var nouveaux = items.filter(function (el) { return !el.classList.contains('est-masque'); });
        gsap.fromTo(nouveaux, { opacity: 0, y: 40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out', stagger: 0.035, clearProps: 'transform', onComplete: function () { enCours = false; } });
      },
    });
  }
  filtres.forEach(function (b) { b.addEventListener('click', function () { filtrer(b.getAttribute('data-filtre')); }); });
})();
