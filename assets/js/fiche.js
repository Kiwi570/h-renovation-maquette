/* H-Renovation — fiche prestation */
(function () {
  'use strict';
  var d = document, HR = window.HR || {}, $ = HR.$, $$ = HR.$$;
  var anime = HR.hasG && !HR.calme;

  // ------------------------------------------------------------- en-tête : le nom se pose, la photo se dévoile en pignon
  var hero = $('[data-fiche-hero]');
  if (hero && anime) {
    var titre = $('[data-fiche-titre]', hero), media = $('[data-fiche-media]', hero);
    var tl = gsap.timeline({ delay: d.documentElement.classList.contains('volet-ferme') ? 0.45 : 0.1 });
    if (window.SplitText && titre) {
      var sp = SplitText.create(titre, { type: 'chars,words', mask: 'words', wordsClass: 'mot-f' });
      tl.from(sp.chars, { yPercent: 115, rotation: 6, duration: 1, ease: 'expo.out', stagger: 0.025 }, 0);
    }
    tl.from($$('.fil, .eyebrow', hero), { opacity: 0, x: -20, duration: 0.7, ease: 'power3.out' }, 0)
      .fromTo(media, { clipPath: 'polygon(50% 40%, 70% 52%, 70% 70%, 30% 70%, 30% 52%)' }, { clipPath: 'polygon(50% 0%, 100% 16%, 100% 100%, 0% 100%, 0% 16%)', duration: 1.5, ease: 'expo.inOut' }, 0.1)
      .from($('img, .attente', media), { scale: 1.25, duration: 1.8, ease: 'expo.out' }, 0.3)
      .from($('.fiche-hero__picto', media), { scale: 0, rotation: -90, duration: 0.8, ease: 'back.out(2)' }, 1.1)
      .from($$('[data-fiche-fade]', hero), { opacity: 0, y: 22, duration: 0.8, ease: 'power3.out', stagger: 0.08 }, 0.45)
      .from($$('[data-plaque] > div', hero), { opacity: 0, y: 16, duration: 0.6, ease: 'power3.out', stagger: 0.07 }, 0.8);
  }

  // ------------------------------------------------------------- l'essentiel : points cochés un à un
  $$('[data-points]').forEach(function (ul) {
    if (!anime) return;
    gsap.from($$('li', ul), { opacity: 0, x: 40, duration: 0.8, ease: 'power3.out', stagger: 0.12, scrollTrigger: { trigger: ul, start: 'top 85%', once: true } });
    gsap.from($$('.points__ico', ul), { scale: 0, rotation: -120, duration: 0.7, ease: 'back.out(2.4)', stagger: 0.12, delay: 0.2, scrollTrigger: { trigger: ul, start: 'top 85%', once: true } });
  });

  // ------------------------------------------------------------- méthode : l'eau descend dans la gouttière
  $$('[data-methode-etapes]').forEach(function (ol) {
    var eau = $('[data-methode-eau]', ol), goutte = $('[data-methode-goutte]', ol), etapes = $$('[data-methode-etape]', ol);
    if (!anime) { etapes.forEach(function (e) { e.classList.add('est-mouillee'); }); return; }
    var tuyau = eau.parentElement;
    gsap.fromTo(eau, { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: {
        trigger: ol, start: 'top 72%', end: 'bottom 62%', scrub: 0.6,
        onUpdate: function (self) {
          var h = tuyau.offsetHeight, y = self.progress * h;
          gsap.set(goutte, { y: y - 4, opacity: self.progress > 0.01 && self.progress < 0.995 ? 1 : 0 });
          var top = tuyau.getBoundingClientRect().top;
          etapes.forEach(function (e) {
            var c = $('.methode__collier', e).getBoundingClientRect().top - top;
            e.classList.toggle('est-mouillee', y >= c);
          });
        },
      },
    });
    gsap.from(etapes, { opacity: 0, x: 30, duration: 0.8, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: ol, start: 'top 80%', once: true } });
  });

  // ------------------------------------------------------------- avantages : les ardoises basculent sur leur clou
  $$('[data-ardoises]').forEach(function (ul) {
    if (!anime) return;
    var els = $$('[data-ardoise]', ul);
    gsap.set(els, { rotationX: -100, opacity: 0 });
    ScrollTrigger.batch(els, {
      start: 'top 90%', once: true,
      onEnter: function (lot) { gsap.to(lot, { rotationX: 0, opacity: 1, duration: 1.3, ease: 'elastic.out(1, 0.55)', stagger: 0.11 }); },
    });
    if (HR.fin) {
      els.forEach(function (el) {
        var r = gsap.quickTo(el, 'rotation', { duration: 0.8, ease: 'elastic.out(1, 0.35)' });
        el.addEventListener('pointerenter', function (e) { var b = el.getBoundingClientRect(); r((e.clientX - (b.left + b.width / 2)) / b.width * -6); });
        el.addEventListener('pointerleave', function () { r(0); });
      });
    }
  });

  // ------------------------------------------------------------- signes à cocher
  $$('[data-signes]').forEach(function (sec) {
    var cases = $$('[data-signe]', sec), txt = $('[data-signes-txt]', sec), bilan = $('[data-signes-bilan]', sec);
    var maj = function () {
      var n = cases.filter(function (c) { return c.checked; }).length;
      txt.textContent = n === 0 ? txt.getAttribute('data-zero') : (n === 1 ? txt.getAttribute('data-un') : txt.getAttribute('data-plus').replace('{n}', n));
      bilan.classList.toggle('est-actif', n > 0);
      if (anime && n > 0) gsap.fromTo(bilan, { scale: 0.985 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    };
    cases.forEach(function (c) { c.addEventListener('change', maj); });
    if (anime) gsap.from($$('.signe', sec), { opacity: 0, y: 18, duration: 0.6, ease: 'power3.out', stagger: 0.07, scrollTrigger: { trigger: sec, start: 'top 75%', once: true } });
  });

  // ------------------------------------------------------------- listes : rangées, alertes, pourquoi, autres prestations
  if (anime) {
    $$('[data-rangees]').forEach(function (ul) {
      gsap.from($$('.rangee', ul), { opacity: 0, x: -40, duration: 0.8, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: ul, start: 'top 82%', once: true } });
      gsap.from($$('.rangee__num', ul), { yPercent: 100, opacity: 0, duration: 0.7, ease: 'back.out(2)', stagger: 0.08, delay: 0.15, scrollTrigger: { trigger: ul, start: 'top 82%', once: true } });
    });
    $$('[data-alertes]').forEach(function (ul) {
      gsap.from($$('li', ul), { opacity: 0, y: 20, duration: 0.7, ease: 'power3.out', stagger: 0.09, scrollTrigger: { trigger: ul, start: 'top 82%', once: true } });
      gsap.from($$('svg', ul), { scale: 0, duration: 0.6, ease: 'back.out(3)', stagger: 0.09, delay: 0.2, scrollTrigger: { trigger: ul, start: 'top 82%', once: true } });
    });
    $$('[data-pourquoi]').forEach(function (ol) {
      gsap.from($$('li', ol), { opacity: 0, y: 40, duration: 0.9, ease: 'power3.out', stagger: 0.09, scrollTrigger: { trigger: ol, start: 'top 85%', once: true } });
    });
    $$('[data-autres]').forEach(function (ul) {
      var lis = $$('li', ul);
      gsap.set(lis, { opacity: 0, y: 30 });
      ScrollTrigger.batch(lis, { start: 'top 92%', once: true, onEnter: function (lot) { gsap.to(lot, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.05 }); } });
    });
    $$('.mosaique__el').forEach(function (el, i) {
      gsap.from(el, { opacity: 0, y: 50, duration: 0.9, ease: 'power3.out', delay: (i % 3) * 0.08, scrollTrigger: { trigger: el, start: 'top 94%', once: true } });
    });
    var conclu = $('.conclu__fond');
    if (conclu) gsap.fromTo(conclu, { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: conclu.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  }
})();
