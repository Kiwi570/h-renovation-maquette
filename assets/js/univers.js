/* H-Renovation — pages Façade et Isolation */
(function () {
  'use strict';
  var d = document, HR = window.HR || {}, $ = HR.$, $$ = HR.$$;
  var anime = HR.hasG && !HR.calme;

  if (HR.initHero) HR.initHero($('[data-hero]'), { doux: true });

  // ------------------------------------------------------------- schéma interactif (coupe de mur ou maison thermique)
  var schema = $('[data-schema]');
  if (schema) {
    var sec = schema.closest('section');
    var els = $$('[data-el]', schema), btns = $$('[data-schema-btn]', sec), pans = $$('[data-schema-pan]', sec), labels = $$('[data-label]', schema);
    var actuel = null;
    var choisir = function (id) {
      if (id === actuel) return;
      actuel = id;
      els.forEach(function (e) { e.classList.toggle('est-actif', e.getAttribute('data-el') === id); });
      labels.forEach(function (l) { $('text', l).classList.toggle('est-actif', l.getAttribute('data-label') === id); });
      btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-schema-btn') === id)); });
      pans.forEach(function (p) {
        var on = p.getAttribute('data-schema-pan') === id;
        p.hidden = !on;
        if (on && anime) gsap.fromTo(p.children, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.05 });
      });
    };
    btns.forEach(function (b) { b.addEventListener('click', function () { choisir(b.getAttribute('data-schema-btn')); }); });
    els.forEach(function (e) {
      e.addEventListener('click', function () { choisir(e.getAttribute('data-el')); });
      if (HR.fin) e.addEventListener('pointerenter', function () { choisir(e.getAttribute('data-el')); });
    });
    choisir(btns.length ? btns[0].getAttribute('data-schema-btn') : null);
    if (anime) {
      gsap.from(els, { opacity: 0, y: 26, duration: 0.8, ease: 'power3.out', stagger: 0.06, scrollTrigger: { trigger: schema, start: 'top 78%', once: true } });
      if (labels.length) gsap.from(labels, { opacity: 0, duration: 0.5, stagger: 0.04, delay: 0.7, scrollTrigger: { trigger: schema, start: 'top 78%', once: true } });
      var pluie = $('[data-pluie]', schema);
      if (pluie) gsap.to(pluie, { y: 110, x: -18, duration: 0.9, ease: 'none', repeat: -1 });
      var inf = $('[data-infiltration]', schema);
      if (inf) gsap.to(inf, { strokeDashoffset: -24, duration: 0.9, ease: 'none', repeat: -1 });
    }
  }

  // ------------------------------------------------------------- maison thermique : isoler / ne pas isoler
  var thermo = $('[data-thermo]');
  if (thermo) {
    var bascule = $('[data-thermo-bascule]', thermo), etat = $('[data-thermo-etat]', thermo), vagues = $$('[data-thermo-vagues] path', thermo);
    var label = $('span', bascule);
    var isolee = false, vagueTl = null;
    if (anime) {
      vagueTl = gsap.timeline({ repeat: -1 });
      vagues.forEach(function (v, i) {
        var l = v.getTotalLength();
        gsap.set(v, { strokeDasharray: l * 0.35 + ' ' + l, strokeDashoffset: l * 0.35 });
        vagueTl.to(v, { strokeDashoffset: -l, duration: 1.8, ease: 'none' }, (i % 5) * 0.32);
      });
    }
    var maj = function () {
      thermo.classList.toggle('est-isolee', isolee);
      bascule.setAttribute('aria-pressed', String(isolee));
      label.textContent = isolee ? 'Retirer l’isolation' : 'Isoler la maison';
      etat.textContent = isolee ? 'Maison isolée' : 'Maison non isolée';
      if (vagueTl) { if (isolee) vagueTl.pause(); else vagueTl.play(); }
      if (anime) {
        gsap.fromTo($('[data-thermo-isolants]', thermo), { y: isolee ? -10 : 0 }, { y: 0, duration: 0.8, ease: 'bounce.out' });
        gsap.fromTo(etat, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
      }
    };
    bascule.addEventListener('click', function () { isolee = !isolee; maj(); });
    maj();
  }
})();
