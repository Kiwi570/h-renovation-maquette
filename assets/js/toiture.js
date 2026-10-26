/* H-Renovation — page Toiture */
(function () {
  'use strict';
  var d = document, HR = window.HR || {}, $ = HR.$, $$ = HR.$$;
  var anime = HR.hasG && !HR.calme;

  if (HR.initHero) HR.initHero($('[data-hero]'), { doux: true });

  // ------------------------------------------------------------- anatomie d'un toit
  var toit = $('[data-toit]');
  if (toit) {
    var els = $$('[data-el]', toit), btns = $$('[data-anat]'), pans = $$('[data-pour-anat]'), labels = $$('[data-label]', toit);
    var actuel = null;
    var choisir = function (id) {
      if (id === actuel) return;
      actuel = id;
      els.forEach(function (e) { e.classList.toggle('est-actif', e.getAttribute('data-el') === id); });
      labels.forEach(function (l) { $('text', l).classList.toggle('est-actif', l.getAttribute('data-label') === id); });
      btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-anat') === id)); });
      pans.forEach(function (p) {
        var on = p.getAttribute('data-pour-anat') === id;
        p.hidden = !on;
        if (on && anime) gsap.fromTo(p.children, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.05 });
      });
    };
    btns.forEach(function (b) { b.addEventListener('click', function () { choisir(b.getAttribute('data-anat')); }); });
    els.forEach(function (e) {
      e.addEventListener('click', function () { choisir(e.getAttribute('data-el')); });
      if (HR.fin) e.addEventListener('pointerenter', function () { choisir(e.getAttribute('data-el')); });
    });
    choisir('couverture');
    if (anime) {
      gsap.from(els, { opacity: 0, y: 34, duration: 0.8, ease: 'power3.out', stagger: 0.07, scrollTrigger: { trigger: toit, start: 'top 78%', once: true } });
      gsap.from(labels, { opacity: 0, duration: 0.5, stagger: 0.05, delay: 0.7, scrollTrigger: { trigger: toit, start: 'top 78%', once: true } });
    }
  }

  // surbrillance de la prestation visée par un lien
  d.addEventListener('hr:cible', function (e) {
    var c = e.target;
    if (c && c.matches && c.matches('[data-presta]')) {
      c.classList.add('est-cible');
      setTimeout(function () { c.classList.remove('est-cible'); }, 2400);
    }
  });

  // ------------------------------------------------------------- cartes de prestations
  var cartes = $$('[data-presta]');
  if (anime && cartes.length) {
    gsap.set(cartes, { opacity: 0, y: 50 });
    ScrollTrigger.batch(cartes, {
      start: 'top 92%', once: true,
      onEnter: function (lot) { gsap.to(lot, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 }); },
    });
  }

  // ------------------------------------------------------------- galerie : glisser à la souris
  var piste = $('[data-real-piste]');
  if (piste) {
    if (anime) gsap.from($$('.chantier', piste), { opacity: 0, x: 80, duration: 1, ease: 'power3.out', stagger: 0.07, scrollTrigger: { trigger: piste, start: 'top 85%', once: true } });
    if (HR.fin) {
      var x0 = null, s0 = 0, bouge = false;
      piste.addEventListener('pointerdown', function (e) { x0 = e.clientX; s0 = piste.scrollLeft; bouge = false; piste.style.scrollSnapType = 'none'; });
      window.addEventListener('pointermove', function (e) {
        if (x0 === null) return;
        var dx = e.clientX - x0;
        if (Math.abs(dx) > 4) bouge = true;
        piste.scrollLeft = s0 - dx;
      });
      window.addEventListener('pointerup', function () { if (x0 === null) return; x0 = null; piste.style.scrollSnapType = ''; });
      piste.addEventListener('click', function (e) { if (bouge) { e.preventDefault(); e.stopPropagation(); } }, true);
      piste.addEventListener('dragstart', function (e) { e.preventDefault(); });
    }
  }
})();
