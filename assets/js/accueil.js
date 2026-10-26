/* H-Renovation — accueil */
(function () {
  'use strict';
  var d = document, HR = window.HR || {}, $ = HR.$, $$ = HR.$$;
  var calme = HR.calme, hasG = HR.hasG;
  var anime = hasG && !calme;

  // ------------------------------------------------------------- ouverture puis hero
  var hero = $('[data-hero]');
  if (HR.initHero) HR.initHero(hero, { attendre: true });

  (function ouverture() {
    var o = $('[data-ouverture]');
    var signal = function () { d.dispatchEvent(new Event('hr:ouvert')); };
    if (!o || !anime || d.documentElement.classList.contains('deja-vu')) {
      if (o) o.remove();
      setTimeout(signal, d.documentElement.classList.contains('volet-ferme') ? 250 : 30);
      return;
    }
    try { sessionStorage.setItem('hr-vu', '1'); } catch (e) {}
    if (HR.lenis) HR.lenis.stop();
    var trait = $('path', o), lettres = $$('.ouverture__mot span', o);
    var long = trait.getTotalLength();
    gsap.set(o, { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' });
    gsap.set(trait, { strokeDasharray: long, strokeDashoffset: long });
    var tl = gsap.timeline({ onComplete: function () { o.remove(); if (HR.lenis) HR.lenis.start(); } });
    tl.to(trait, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' })
      .from(lettres, { yPercent: -150, rotationX: -95, opacity: 0, duration: 0.6, ease: 'back.out(2.2)', stagger: 0.045 }, '-=0.25')
      .from($('.ouverture__sous', o), { opacity: 0, y: 10, duration: 0.4 }, '-=0.3')
      .to(o, { clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)', duration: 0.85, ease: 'expo.inOut' }, '+=0.2')
      .call(signal, null, '-=0.55');
  })();

  // ------------------------------------------------------------- bandeau de zinc
  $$('[data-defile]').forEach(function (ligne) {
    if (!anime) return;
    var sens = parseFloat(ligne.getAttribute('data-defile'));
    var groupe = ligne.firstElementChild, largeur = groupe.offsetWidth, x = sens > 0 ? 0 : -largeur, visible = true;
    var skew = gsap.quickTo(ligne, 'skewX', { duration: 0.5, ease: 'power3' });
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(ligne);
    window.addEventListener('resize', function () { largeur = groupe.offsetWidth; });
    gsap.ticker.add(function (t, dt) {
      if (!visible) return;
      var v = HR.lenis ? HR.lenis.velocity : 0;
      x -= sens * (45 + Math.min(900, Math.abs(v) * 14)) * dt / 1000;
      if (x <= -largeur) x += largeur;
      if (x > 0) x -= largeur;
      gsap.set(ligne, { x: x });
      skew(Math.max(-7, Math.min(7, -v * 0.25 * sens)));
    });
  });

  // ------------------------------------------------------------- diagnostic sur la maison en coupe
  var maison = $('[data-maison]');
  if (maison) {
    var boutons = $$('[data-diag]'), panneaux = $$('[data-pour]'), zones = $$('.zone', maison);
    var goutte = $('[data-goutte-fuite]', maison), animFuite = null, animDebord = null;
    if (anime) {
      animFuite = gsap.fromTo(goutte, { attr: { cy: 150 }, opacity: 1 }, { attr: { cy: 488 }, duration: 1.7, ease: 'power2.in', repeat: -1, repeatDelay: 0.5, paused: true });
      animDebord = gsap.fromTo($$('[data-debord] path', maison), { y: 0, opacity: 1 }, { y: 34, opacity: 0, duration: 0.9, ease: 'power1.in', stagger: 0.25, repeat: -1, paused: true });
    }
    var choisir = function (id, focusPanneau) {
      maison.setAttribute('data-actif', id);
      zones.forEach(function (z) { z.classList.toggle('est-actif', z.getAttribute('data-zone') === id); });
      boutons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-diag') === id)); });
      panneaux.forEach(function (p) {
        var on = p.getAttribute('data-pour') === id;
        p.hidden = !on;
        if (on && anime) gsap.fromTo(p.children, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.05 });
      });
      if (animFuite) id === 'fuite' ? animFuite.play() : animFuite.pause(0);
      if (animDebord) id === 'gouttiere' ? animDebord.play() : animDebord.pause(0);
    };
    boutons.forEach(function (b) { b.addEventListener('click', function () { choisir(b.getAttribute('data-diag')); }); });
    choisir('fuite');

    if (anime) {
      $$('.draw', maison).forEach(function (p) {
        var l = p.getTotalLength();
        gsap.fromTo(p, { strokeDasharray: l, strokeDashoffset: l }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: maison, start: 'top 88%', end: 'center 55%', scrub: 0.6 } });
      });
      gsap.from($$('.rempli-mur, .rempli-ardoise, .rempli-isolant, .tache, .mousse', maison), { opacity: 0, ease: 'none', scrollTrigger: { trigger: maison, start: 'top 70%', end: 'center 50%', scrub: true } });
      gsap.from($$('.point', maison), { scale: 0, duration: 0.6, ease: 'back.out(2)', stagger: 0.08, scrollTrigger: { trigger: maison, start: 'center 70%', once: true } });
      gsap.to($('[data-pluie]', maison), { y: 120, x: -18, duration: 0.55, ease: 'none', repeat: -1 });
    }
  }

  // ------------------------------------------------------------- chantier rang par rang
  var rangsSec = $('[data-rangs-sec]');
  if (rangsSec) {
    var svgR = $('[data-rangs]', rangsSec), etapes = $$('[data-etape]', rangsSec);
    if (anime) {
      var lignes = [];
      $$('.ard', svgR).forEach(function (r) { var k = +r.getAttribute('data-row'); (lignes[k] = lignes[k] || []).push(r); });
      var faite = $('[data-faite]', svgR), gouts = $$('[data-gout]', svgR), chem = $('[data-cheminee]', svgR);
      gsap.set($$('.ard', svgR), { opacity: 0, y: -30 });
      gsap.set(faite, { scaleX: 0, transformOrigin: '50% 50%' });
      gsap.set(chem, { opacity: 0, y: -20 });
      gouts.forEach(function (g) { var l = g.getTotalLength(); gsap.set(g, { strokeDasharray: l, strokeDashoffset: l }); });
      var tl = gsap.timeline({ scrollTrigger: { trigger: $('.rangs__etapes', rangsSec), start: 'top 75%', end: 'bottom 65%', scrub: 0.7 } });
      tl.to(gouts, { strokeDashoffset: 0, duration: 0.6, ease: 'none' }, 0);
      lignes.forEach(function (row, k) {
        tl.to(row, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', stagger: 0.02 }, 0.35 + k * 0.32);
      });
      tl.to(chem, { opacity: 1, y: 0, duration: 0.4 }, '-=0.6');
      tl.to(faite, { scaleX: 1, duration: 0.6, ease: 'power2.inOut' });
      etapes.forEach(function (e, i) {
        ScrollTrigger.create({
          trigger: e, start: 'top 62%', end: 'bottom 62%',
          onToggle: function (self) { if (self.isActive) etapes.forEach(function (x, j) { x.classList.toggle('est-active', j === i); }); },
        });
      });
    } else {
      etapes.forEach(function (e) { e.classList.add('est-active'); });
    }
  }

  // ------------------------------------------------------------- réalisations (galerie horizontale)
  var real = $('[data-real]');
  if (real) {
    var piste = $('[data-real-piste]', real), num = $('[data-real-num]', real), figs = $$('.chantier', piste), n = figs.length;
    var pad = function (v) { return (v < 10 ? '0' : '') + v; };
    piste.addEventListener('scroll', function () {
      var i = Math.round(piste.scrollLeft / Math.max(1, piste.scrollWidth - piste.clientWidth) * (n - 1));
      if (num) num.textContent = pad(i + 1);
    }, { passive: true });
    if (anime) {
      var mm = gsap.matchMedia();
      mm.add('(min-width: 900px)', function () {
        real.classList.add('est-epingle');
        var pin = $('[data-real-pin]', real);
        var dist = function () { return Math.max(0, piste.scrollWidth - window.innerWidth + 40); };
        var tw = gsap.to(piste, {
          x: function () { return -dist(); }, ease: 'none',
          scrollTrigger: {
            trigger: pin, start: 'center center', end: function () { return '+=' + dist(); }, pin: true, scrub: 0.8, invalidateOnRefresh: true,
            onUpdate: function (self) { if (num) num.textContent = pad(1 + Math.round(self.progress * (n - 1))); },
          },
        });
        $$('[data-parallax-x]', piste).forEach(function (img) {
          gsap.fromTo(img, { xPercent: -7 }, { xPercent: 7, ease: 'none', scrollTrigger: { trigger: img.closest('.chantier'), containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } });
        });
        return function () { real.classList.remove('est-epingle'); gsap.set(piste, { clearProps: 'x' }); };
      });
      gsap.from(figs, { opacity: 0, y: 60, duration: 1, ease: 'power3.out', stagger: 0.06, scrollTrigger: { trigger: piste, start: 'top 85%', once: true } });
    }
    var av = $('[data-avap]', real);
    if (av) {
      var input = $('input', av), apres = $('.avap__pan--apres', av), poignee = $('.avap__poignee', av);
      var maj = function () { var v = input.value; apres.style.clipPath = 'inset(0 0 0 ' + v + '%)'; poignee.style.left = v + '%'; };
      input.addEventListener('input', maj); maj();
    }
  }

  // ------------------------------------------------------------- citation mot à mot
  var cit = $('[data-mots]');
  if (cit && anime) {
    cit.innerHTML = cit.textContent.split(' ').map(function (m) { return '<span class="mot">' + m + '</span>'; }).join(' ');
    cit.classList.add('anime');
    gsap.to($$('.mot', cit), { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: cit, start: 'top 82%', end: 'top 45%', scrub: true } });
  }

  // ------------------------------------------------------------- pile d'ardoises : avis clients
  var pile = $('[data-pile]');
  if (pile) {
    var cartes = $$('[data-carte-avis]', pile), nb = cartes.length, idx = 0, compte = $('[data-pile-compte]');
    var ranger = function (instant) {
      cartes.forEach(function (c, i) {
        var k = (i - idx + nb) % nb;
        var props = { x: k * 12, y: k * 16, rotation: k === 0 ? 0 : (k % 2 ? 2.4 : -2.2), scale: 1 - k * 0.04, opacity: k > 2 ? 0 : 1, zIndex: nb - k };
        if (instant || !anime) gsap.set(c, props); else gsap.to(c, Object.assign({ duration: 0.65, ease: 'power3.out' }, props));
        c.inert = k !== 0;
        c.setAttribute('aria-hidden', String(k !== 0));
      });
      if (compte) compte.textContent = (idx + 1) + ' / ' + nb;
    };
    var aller = function (dir, vx) {
      var top = cartes[idx];
      if (anime) gsap.to(top, { x: (dir > 0 ? -1 : 1) * (vx || 520), rotation: dir > 0 ? -14 : 14, opacity: 0, duration: 0.45, ease: 'power2.in' });
      idx = (idx + dir + nb) % nb;
      setTimeout(function () { ranger(); }, anime ? 260 : 0);
    };
    ranger(true);
    $('[data-pile-suiv]').addEventListener('click', function () { aller(1); });
    $('[data-pile-prec]').addEventListener('click', function () { aller(-1); });
    var x0 = null, dx = 0, enCours = null;
    pile.addEventListener('pointerdown', function (e) {
      var c = e.target.closest('[data-carte-avis]');
      if (!c || c !== cartes[idx]) return;
      x0 = e.clientX; dx = 0; enCours = c; c.setPointerCapture(e.pointerId);
    });
    pile.addEventListener('pointermove', function (e) {
      if (x0 === null || !enCours) return;
      dx = e.clientX - x0;
      if (hasG) gsap.set(enCours, { x: dx, rotation: dx * 0.04 });
    });
    var relacher = function () {
      if (x0 === null) return;
      x0 = null;
      if (Math.abs(dx) > 90) aller(dx < 0 ? 1 : -1, Math.abs(dx) * 4);
      else if (hasG) gsap.to(enCours, { x: 0, rotation: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
      enCours = null;
    };
    pile.addEventListener('pointerup', relacher);
    pile.addEventListener('pointercancel', relacher);
  }

  // ------------------------------------------------------------- carte de la zone
  var carte = $('[data-carte]');
  if (carte && anime) {
    $$('.draw', carte).forEach(function (p) {
      var l = p.getTotalLength();
      gsap.fromTo(p, { strokeDasharray: l, strokeDashoffset: l }, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', scrollTrigger: { trigger: carte, start: 'top 78%', once: true } });
    });
    gsap.from($$('[data-ville]', carte), { opacity: 0, y: 8, duration: 0.5, stagger: 0.06, delay: 0.6, scrollTrigger: { trigger: carte, start: 'top 78%', once: true } });
    gsap.from($('.herblay .pin', carte), { y: -80, opacity: 0, duration: 1.1, ease: 'bounce.out', delay: 1, scrollTrigger: { trigger: carte, start: 'top 78%', once: true } });
    gsap.fromTo($$('[data-onde]', carte), { attr: { r: 20 }, opacity: 0.9 }, { attr: { r: 110 }, opacity: 0, duration: 2.4, ease: 'power1.out', repeat: -1, stagger: 1.2 });
    gsap.to($('[data-rayon]', carte), { strokeDashoffset: -140, duration: 7, ease: 'none', repeat: -1 });
  }
})();
