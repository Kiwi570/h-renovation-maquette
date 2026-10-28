/* H-Renovation — comportements communs à toutes les pages */
(function () {
  'use strict';
  var d = document, h = d.documentElement;
  var HR = (window.HR = window.HR || {});
  var calme = h.classList.contains('calme');
  var fin = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasG = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  HR.calme = calme; HR.$ = $; HR.$$ = $$; HR.hasG = hasG; HR.fin = fin;

  if (hasG) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(SplitText);
    gsap.config({ nullTargetWarn: false });
  }

  // ------------------------------------------------------------- défilement fluide
  var lenis = null;
  if (!calme && hasG && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  HR.lenis = lenis;
  HR.scrollTo = function (el, off) {
    off = off == null ? -90 : off;
    if (lenis) lenis.scrollTo(el, { offset: off, duration: 1.3 });
    else {
      var y = el.getBoundingClientRect().top + window.scrollY + off;
      window.scrollTo({ top: y, behavior: calme ? 'auto' : 'smooth' });
    }
  };

  function chemin(p) { return p.replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, ''); }
  function memePage(url) { return url.origin === location.origin && chemin(url.pathname) === chemin(location.pathname); }

  // ------------------------------------------------------------- en-tête, menu, barre mobile
  var tete = $('[data-tete]'), barre = $('[data-barre]'), burger = $('[data-burger]'), menu = $('[data-menu]');
  var menuOuvert = false, dernierY = 0;
  // hauteurs réelles de l'en-tête et de la barre du bas, pour les sections qui doivent tenir dans l'écran
  function mesurerBarres() {
    if (tete) h.style.setProperty('--entete-h', tete.offsetHeight + 'px');
    if (barre) h.style.setProperty('--barres-h', barre.offsetHeight + 'px');
  }
  mesurerBarres();
  if (window.ResizeObserver) { var roBarres = new ResizeObserver(mesurerBarres); if (tete) roBarres.observe(tete); if (barre) roBarres.observe(barre); }
  // barre mobile : seulement une fois le héros dépassé, jamais sur un formulaire, le pied de page ou le menu ouvert
  var heroPasse = false, caches = [];
  function majBarre() {
    if (!barre) return;
    var on = heroPasse && !caches.length && !menuOuvert;
    barre.classList.toggle('est-visible', on);
    barre.inert = !on;
  }
  if (barre && 'IntersectionObserver' in window) {
    var heroEl = $('[data-hero]') || $('main > section');
    if (heroEl) new IntersectionObserver(function (en) {
      heroPasse = !en[0].isIntersecting && en[0].boundingClientRect.top < 0; majBarre();
    }).observe(heroEl);
    else heroPasse = true;
    var ioMasque = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        var i = caches.indexOf(e.target);
        if (e.isIntersecting && i < 0) caches.push(e.target);
        else if (!e.isIntersecting && i > -1) caches.splice(i, 1);
      });
      majBarre();
    });
    $$('form, [data-devis], .pied').forEach(function (el) { ioMasque.observe(el); });
  }
  majBarre();
  function auDefilement(y) {
    if (tete) {
      tete.classList.toggle('est-replie', y > 40);
      if (y > dernierY + 6 && y > 500 && !menuOuvert) tete.classList.add('est-cache');
      else if (y < dernierY - 6 || y < 200) tete.classList.remove('est-cache');
    }
    dernierY = y;
  }
  if (lenis) lenis.on('scroll', function (e) { auDefilement(e.scroll); });
  else window.addEventListener('scroll', function () { auDefilement(window.scrollY); }, { passive: true });
  auDefilement(window.scrollY);

  if (menu) menu.inert = true;
  function ouvrirMenu() {
    menuOuvert = true;
    menu.inert = false;
    menu.classList.add('est-ouvert');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Fermer le menu');
    tete.classList.remove('est-cache');
    majBarre();
    if (lenis) lenis.stop();
    if (hasG && !calme) gsap.from($$('.menu__liste > li', menu), { yPercent: 60, opacity: 0, duration: 0.7, ease: 'expo.out', stagger: 0.05, delay: 0.15 });
    var premier = $('a', menu); if (premier) premier.focus({ preventScroll: true });
  }
  function fermerMenu(rendreFocus) {
    if (!menuOuvert) return;
    menuOuvert = false;
    menu.classList.remove('est-ouvert');
    menu.inert = true;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    majBarre();
    if (lenis) lenis.start();
    if (rendreFocus) burger.focus();
  }
  HR.fermerMenu = fermerMenu;
  if (burger) burger.addEventListener('click', function () { menuOuvert ? fermerMenu(true) : ouvrirMenu(); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') fermerMenu(true); });

  // menu déroulant des savoir-faire : Échap le referme, il se rouvre au prochain survol
  var nav = $('.nav');
  if (nav) {
    d.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !nav.contains(d.activeElement)) return;
      var g = d.activeElement.closest('.nav__groupe');
      nav.classList.add('est-ferme');
      if (g) $('a', g).focus();
    });
    nav.addEventListener('pointerleave', function () { nav.classList.remove('est-ferme'); });
    nav.addEventListener('focusout', function (e) { if (!nav.contains(e.relatedTarget)) nav.classList.remove('est-ferme'); });
  }

  // ------------------------------------------------------------- liens : ancres et volet de transition
  var volet = $$('.volet span');
  function ouvrirVolet() {
    if (!h.classList.contains('volet-ferme')) return;
    try { sessionStorage.removeItem('hr-volet'); } catch (e) {}
    if (!hasG || calme) { h.classList.remove('volet-ferme'); return; }
    gsap.set(volet, { scaleY: 1, transformOrigin: '50% 100%' });
    h.classList.remove('volet-ferme');
    gsap.to(volet, { scaleY: 0, duration: 0.65, ease: 'power3.inOut', stagger: 0.05, delay: 0.05 });
  }
  ouvrirVolet();
  window.addEventListener('pageshow', function (e) {
    if (e.persisted && hasG) { gsap.set(volet, { scaleY: 0 }); h.classList.remove('volet-ferme'); }
  });

  d.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var href = a.getAttribute('href');
    if (/^(tel|mailto|sms):/i.test(href) || a.target === '_blank' || a.hasAttribute('download')) return;
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin) return;
    if (memePage(url) && url.hash) {
      var cible = d.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!cible) return;
      e.preventDefault();
      fermerMenu(false);
      HR.scrollTo(cible);
      cible.dispatchEvent(new CustomEvent('hr:cible', { bubbles: true }));
      return;
    }
    if (calme || !hasG || !volet.length) return;
    e.preventDefault();
    fermerMenu(false);
    try { sessionStorage.setItem('hr-volet', '1'); } catch (err) {}
    gsap.set(volet, { transformOrigin: '50% 0%' });
    gsap.to(volet, { scaleY: 1, duration: 0.45, ease: 'power3.in', stagger: 0.04, onComplete: function () { location.href = a.href; } });
  });

  // arrivée sur une ancre depuis une autre page
  window.addEventListener('load', function () {
    if (!location.hash) return;
    var cible = d.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!cible) return;
    setTimeout(function () {
      if (hasG) ScrollTrigger.refresh();
      if (lenis) lenis.scrollTo(cible, { offset: -90, immediate: true });
      else cible.scrollIntoView();
      cible.dispatchEvent(new CustomEvent('hr:cible', { bubbles: true }));
    }, 120);
  });

  // ------------------------------------------------------------- curseur goutte et boutons aimantés
  if (fin && !calme && hasG) {
    var cur = $('.curseur'), lab = cur && $('.curseur__label', cur);
    if (cur) {
      var xTo = gsap.quickTo(cur, 'x', { duration: 0.35, ease: 'power3' });
      var yTo = gsap.quickTo(cur, 'y', { duration: 0.35, ease: 'power3' });
      gsap.set(cur, { x: -100, y: -100 });
      window.addEventListener('pointermove', function (e) { xTo(e.clientX); yTo(e.clientY); }, { passive: true });
      d.addEventListener('pointerover', function (e) {
        var t = e.target.closest('a, button, label, summary, input, [data-el], [data-curseur], [data-carte-avis]');
        cur.classList.toggle('est-actif', !!t);
        var l = e.target.closest('[data-curseur]');
        var txt = l ? l.getAttribute('data-curseur') : (e.target.closest('[data-carte-avis]') ? 'Glisser' : '');
        cur.classList.toggle('a-label', !!txt);
        if (txt) lab.textContent = txt;
      });
      d.addEventListener('pointerleave', function () { gsap.set(cur, { x: -100, y: -100 }); });
    }
    $$('[data-magnet]').forEach(function (el) {
      var mx = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.45)' });
      var my = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.45)' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        mx((e.clientX - (r.left + r.width / 2)) * 0.22);
        my((e.clientY - (r.top + r.height / 2)) * 0.32);
      });
      el.addEventListener('pointerleave', function () { mx(0); my(0); });
    });
    $$('[data-tilt]').forEach(function (el) {
      gsap.set(el, { transformPerspective: 900 });
      var rx = gsap.quickTo(el, 'rotationX', { duration: 0.7, ease: 'power3' });
      var ry = gsap.quickTo(el, 'rotationY', { duration: 0.7, ease: 'power3' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 9);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 9);
      });
      el.addEventListener('pointerleave', function () { rx(0); ry(0); });
    });
  }

  // ------------------------------------------------------------- apparitions au défilement
  if (hasG && !calme) {
    if (window.SplitText) {
      $$('[data-split]').forEach(function (el) {
        SplitText.create(el, {
          type: 'lines', mask: 'lines', linesClass: 'ligne', autoSplit: true,
          onSplit: function (self) {
            return gsap.from(self.lines, { yPercent: 108, duration: 1.15, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
          },
        });
      });
    }
    $$('[data-pignon]').forEach(function (el) {
      gsap.fromTo(el,
        { clipPath: 'polygon(50% 34%, 78% 58%, 78% 100%, 22% 100%, 22% 58%)' },
        { clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    });
    $$('[data-parallax]').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('.lead, .txt, .carte-sf p, .note-maquette, .coord, .preuves, .chiffres').forEach(function (el) {
      if (el.closest('[data-hero], .devis, .fiche-hero')) return;
      gsap.from(el, { opacity: 0, y: 28, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
    $$('[data-compte]').forEach(function (el) {
      var fin = parseFloat(el.getAttribute('data-compte')), suf = el.getAttribute('data-suffixe') || '';
      var o = { v: fin === 0 ? 250 : 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: function () {
          gsap.to(o, { v: fin, duration: 1.8, ease: 'power3.out', onUpdate: function () { el.textContent = Math.round(o.v) + suf; } });
        },
      });
    });
  }

  // ------------------------------------------------------------- copier le numéro
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copie]');
    if (!b) return;
    var txt = b.getAttribute('data-copie'), orig = b.textContent;
    function ok() { b.textContent = 'Copié'; setTimeout(function () { b.textContent = orig; }, 1600); }
    function selection() {
      var num = b.parentElement.querySelector('.coord__num');
      if (!num) return;
      var r = d.createRange(); r.selectNodeContents(num);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      b.textContent = 'Sélectionné'; setTimeout(function () { b.textContent = orig; }, 1600);
    }
    try { navigator.clipboard.writeText(txt).then(ok, selection); } catch (err) { selection(); }
  });

  // ------------------------------------------------------------- animations réduites (choix du visiteur)
  $$('[data-bascule-calme]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(calme));
    b.addEventListener('click', function () {
      try { localStorage.setItem('hr-calme', calme ? '0' : '1'); } catch (e) {}
      location.reload();
    });
  });

  // ------------------------------------------------------------- appel final : la gouttière mène au bouton Appeler
  HR.gouttiere = function (sec) {
    var cible = $('[data-appel-cible]', sec), zone = $('.appel__gouttiere', sec);
    if (!cible || !zone) return;
    var NS = 'http://www.w3.org/2000/svg';
    var svg = d.createElementNS(NS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;left:0;top:0;width:100%;pointer-events:none;overflow:visible;z-index:0';
    sec.insertBefore(svg, sec.firstChild);
    var flux, lenFlux, finGouttiere, sortie, hautBouton, actif = false, timer = null;

    function construire() {
      var sr = sec.getBoundingClientRect(), br = cible.getBoundingClientRect();
      var W = sr.width, bx = br.left - sr.left + br.width / 2;
      hautBouton = br.top - sr.top;
      sortie = Math.max(150, hautBouton - 70);
      if (window.innerWidth < 900) {
        bx = W - Math.max(28, parseFloat(getComputedStyle(sec.querySelector('.wrap')).paddingRight) + 12);
        sortie = zone.offsetHeight - 26;
        hautBouton = zone.offsetHeight + 6;
      }
      svg.setAttribute('height', String(hautBouton + 4));
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + (hautBouton + 4));
      var ard = '';
      for (var r = 0; r < 3; r++) {
        for (var x = -(r % 2) * 23; x < W + 46; x += 46) {
          ard += '<rect x="' + x + '" y="' + (r * 17 - 6) + '" width="44" height="26" rx="2" fill="' + ['#262c33', '#2c333b', '#22272d', '#30373f'][(r * 3 + Math.round(x / 46)) % 4] + '"/>';
        }
      }
      var g0 = 66, g1 = 80, coude = bx - 30;
      var dGout = 'M-20 ' + g0 + ' L' + coude + ' ' + g1;
      var dDesc = 'M' + coude + ' ' + g1 + ' Q' + bx + ' ' + g1 + ' ' + bx + ' ' + (g1 + 28) + ' L' + bx + ' ' + sortie;
      var crochets = '';
      for (var cx = 60; cx < coude - 20; cx += 150) crochets += '<path d="M' + cx + ' ' + (g0 - 14 + (g1 - g0) * (cx / coude)) + 'v22" stroke="#4d555d" stroke-width="3"/>';
      svg.innerHTML = '<g>' + ard + '</g>' + crochets +
        '<path d="' + dGout + '" stroke="#7d8790" stroke-width="18" stroke-linecap="round" fill="none"/>' +
        '<path d="' + dGout + '" stroke="#c9ced2" stroke-width="2" fill="none" transform="translate(0 -8)"/>' +
        '<path d="' + dDesc + '" stroke="#7d8790" stroke-width="15" fill="none"/>' +
        '<path d="M' + (bx - 7) + ' ' + (g1 + 30) + 'V' + sortie + '" stroke="#a6aeb5" stroke-width="2" fill="none"/>' +
        '<path d="M' + (bx - 12) + ' ' + sortie + 'h24l5 12h-34z" fill="#7d8790"/>' +
        '<path data-flux d="M-20 ' + (g0 - 3) + ' L' + coude + ' ' + (g1 - 3) + ' Q' + bx + ' ' + (g1 - 3) + ' ' + bx + ' ' + (g1 + 28) + ' L' + bx + ' ' + sortie + '" fill="none" stroke="none"/>' +
        '<g data-gouttes></g>';
      flux = $('[data-flux]', svg);
      lenFlux = flux.getTotalLength();
      finGouttiere = lenFlux - (sortie - (g1 + 28)) - 40;
    }
    construire();

    function goutte() {
      if (!actif) return;
      var c = d.createElementNS(NS, 'circle');
      c.setAttribute('r', String(3 + Math.random() * 2.5));
      c.setAttribute('fill', '#8fb0c9');
      c.setAttribute('cx', '-40'); c.setAttribute('cy', '-40');
      $('[data-gouttes]', svg).appendChild(c);
      var o = { p: 0 };
      var tl = gsap.timeline({ onComplete: function () { c.remove(); } });
      tl.to(o, {
        p: 1, duration: 2.4 + Math.random() * 0.8, ease: 'power1.in',
        onUpdate: function () {
          var l = o.p * lenFlux, pt = flux.getPointAtLength(l);
          c.setAttribute('cx', pt.x); c.setAttribute('cy', pt.y);
          c.setAttribute('opacity', l < finGouttiere ? '1' : '0');
        },
      });
      var chute = { y: sortie + 12 };
      tl.to(chute, { y: hautBouton - 4, duration: 0.42, ease: 'power2.in', onStart: function () { c.setAttribute('opacity', '1'); }, onUpdate: function () { c.setAttribute('cy', chute.y.toFixed(1)); } });
      tl.call(function () {
        cible.classList.remove('est-touche'); void cible.offsetWidth; cible.classList.add('est-touche');
      });
      var rayon = { r: parseFloat(c.getAttribute('r')) };
      tl.to(rayon, { r: 0, duration: 0.15, onUpdate: function () { c.setAttribute('r', rayon.r.toFixed(2)); } });
    }
    if (hasG && !calme) {
      ScrollTrigger.create({
        trigger: sec, start: 'top bottom', end: 'bottom top',
        onToggle: function (self) {
          actif = self.isActive;
          clearInterval(timer);
          if (actif) { goutte(); timer = setInterval(goutte, 900); }
        },
      });
    }
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(construire, 200); });
    if (hasG) ScrollTrigger.addEventListener('refresh', construire);
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(construire);
  };
  var appel = $('[data-appel]');
  if (appel) HR.gouttiere(appel);

  // ------------------------------------------------------------- vidéos de chantier : lecture quand elles sont à l'écran
  var videos = $$('[data-video-auto]');
  if (videos.length && 'IntersectionObserver' in window) {
    if (calme) videos.forEach(function (v) { v.setAttribute('controls', ''); });
    else {
      var ioV = new IntersectionObserver(function (en) {
        en.forEach(function (x) {
          var v = x.target;
          if (x.isIntersecting && !v.hasAttribute('data-arretee')) { if (v.preload === 'none') v.preload = 'auto'; var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
          else v.pause();
        });
      }, { threshold: 0.35 });
      videos.forEach(function (v) {
        ioV.observe(v);
        // un clic (ou Entrée) met la vidéo en pause ou la relance
        v.setAttribute('tabindex', '0');
        v.setAttribute('title', 'Cliquer pour mettre en pause ou relancer la vidéo');
        var basculer = function () {
          if (v.paused) { v.removeAttribute('data-arretee'); var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
          else { v.setAttribute('data-arretee', ''); v.pause(); }
        };
        v.addEventListener('click', basculer);
        v.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); basculer(); } });
      });
    }
  }

  // ------------------------------------------------------------- avant / après
  $$('[data-avap]').forEach(function (av) {
    var input = $('input', av), apres = $('.avap__pan--apres', av), poignee = $('.avap__poignee', av);
    var maj = function () { var v = input.value; apres.style.clipPath = 'inset(0 0 0 ' + v + '%)'; poignee.style.left = v + '%'; };
    input.addEventListener('input', maj); maj();
  });

  // ------------------------------------------------------------- citation qui s'allume mot à mot
  $$('[data-mots]').forEach(function (cit) {
    if (!hasG || calme) return;
    cit.innerHTML = cit.textContent.split(' ').map(function (m) { return '<span class="mot">' + m + '</span>'; }).join(' ');
    cit.classList.add('anime');
    gsap.to($$('.mot', cit), { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: cit, start: 'top 82%', end: 'top 45%', scrub: true } });
  });

  // ------------------------------------------------------------- carte de la zone
  $$('[data-carte]').forEach(function (carte) {
    if (!hasG || calme) return;
    $$('.draw', carte).forEach(function (p) {
      var l = p.getTotalLength();
      gsap.fromTo(p, { strokeDasharray: l, strokeDashoffset: l }, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', scrollTrigger: { trigger: carte, start: 'top 78%', once: true } });
    });
    gsap.from($$('[data-ville]', carte), { opacity: 0, y: 8, duration: 0.5, stagger: 0.06, delay: 0.6, scrollTrigger: { trigger: carte, start: 'top 78%', once: true } });
    gsap.from($('.herblay .pin', carte), { y: -80, opacity: 0, duration: 1.1, ease: 'bounce.out', delay: 1, scrollTrigger: { trigger: carte, start: 'top 78%', once: true } });
    gsap.fromTo($$('[data-onde]', carte), { attr: { r: 20 }, opacity: 0.9 }, { attr: { r: 110 }, opacity: 0, duration: 2.4, ease: 'power1.out', repeat: -1, stagger: 1.2 });
    gsap.to($('[data-rayon]', carte), { strokeDashoffset: -140, duration: 7, ease: 'none', repeat: -1 });
  });

  // ------------------------------------------------------------- cartes de prestations (pages univers)
  var cartesP = $$('[data-presta]');
  if (hasG && !calme && cartesP.length) {
    gsap.set(cartesP, { opacity: 0, y: 50 });
    ScrollTrigger.batch(cartesP, { start: 'top 92%', once: true, onEnter: function (lot) { gsap.to(lot, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 }); } });
  }
  d.addEventListener('hr:cible', function (e) {
    var c = e.target;
    if (c && c.matches && c.matches('[data-presta]')) { c.classList.add('est-cible'); setTimeout(function () { c.classList.remove('est-cible'); }, 2400); }
  });

  // ------------------------------------------------------------- galeries horizontales simples : glisser à la souris
  HR.piste = function (piste) {
    if (hasG && !calme) gsap.from($$('.chantier', piste), { opacity: 0, x: 80, duration: 1, ease: 'power3.out', stagger: 0.07, scrollTrigger: { trigger: piste, start: 'top 85%', once: true } });
    if (!fin) return;
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
  };
  $$('[data-real-simple] [data-real-piste]').forEach(HR.piste);

  // ------------------------------------------------------------- visionneuse photos et vidéos
  var vis = null, visListe = [], visIdx = 0, visOrigine = null;
  function visCreer() {
    vis = d.createElement('dialog');
    vis.className = 'visionneuse';
    vis.setAttribute('aria-label', 'Visionneuse des réalisations');
    vis.innerHTML = '<div class="visionneuse__haut"><span class="visionneuse__compte" data-vis-compte></span><button class="rond" type="button" aria-label="Fermer la visionneuse" data-vis-fermer>✕</button></div>' +
      '<div class="visionneuse__scene" data-vis-scene></div>' +
      '<div class="visionneuse__bas"><p class="visionneuse__legende" data-vis-legende></p><div class="visionneuse__nav"><a class="lien lien--fleche" data-vis-lien hidden></a><button class="rond" type="button" aria-label="Précédent" data-vis-prec>←</button><button class="rond" type="button" aria-label="Suivant" data-vis-suiv>→</button></div></div>';
    d.body.appendChild(vis);
    $('[data-vis-fermer]', vis).addEventListener('click', function () { vis.close(); });
    $('[data-vis-prec]', vis).addEventListener('click', function () { visAller(-1); });
    $('[data-vis-suiv]', vis).addEventListener('click', function () { visAller(1); });
    vis.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') visAller(-1); if (e.key === 'ArrowRight') visAller(1); });
    vis.addEventListener('click', function (e) { if (e.target === vis || e.target.hasAttribute('data-vis-scene')) vis.close(); });
    vis.addEventListener('close', function () { $('[data-vis-scene]', vis).innerHTML = ''; if (lenis) lenis.start(); if (visOrigine) visOrigine.focus({ preventScroll: true }); });
    var sx = null;
    var scene = $('[data-vis-scene]', vis);
    scene.addEventListener('pointerdown', function (e) { sx = e.clientX; });
    scene.addEventListener('pointerup', function (e) { if (sx === null) return; var dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) visAller(dx < 0 ? 1 : -1); });
  }
  function visMontrer() {
    var b = visListe[visIdx], scene = $('[data-vis-scene]', vis), lien = $('[data-vis-lien]', vis);
    var leg = b.getAttribute('data-vis-legende');
    var m;
    if (b.hasAttribute('data-vis-video')) {
      m = d.createElement('video');
      m.src = b.getAttribute('data-vis-video'); m.poster = b.getAttribute('data-vis-poster');
      m.controls = true; m.muted = true; m.playsInline = true; m.loop = true; m.autoplay = !calme;
      m.setAttribute('aria-label', leg);
    } else {
      m = d.createElement('img');
      m.src = b.getAttribute('data-vis-src'); m.alt = leg + ' : chantier réalisé par H-Renovation';
    }
    scene.innerHTML = ''; scene.appendChild(m);
    if (hasG && !calme) gsap.fromTo(m, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'power3.out' });
    $('[data-vis-legende]', vis).innerHTML = '';
    $('[data-vis-legende]', vis).appendChild(d.createTextNode(leg));
    var sm = d.createElement('small'); sm.textContent = 'Lieu et date\u00a0: à compléter'; $('[data-vis-legende]', vis).appendChild(sm);
    $('[data-vis-compte]', vis).textContent = (visIdx + 1) + ' / ' + visListe.length;
    if (b.hasAttribute('data-vis-lien')) { lien.hidden = false; lien.href = b.getAttribute('data-vis-lien'); lien.textContent = b.getAttribute('data-vis-lien-txt'); }
    else lien.hidden = true;
  }
  function visAller(dir) { visIdx = (visIdx + dir + visListe.length) % visListe.length; visMontrer(); }
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-vis]');
    if (!b) return;
    var groupe = b.closest('[data-visionneuse]');
    if (!vis) visCreer();
    if (typeof vis.showModal !== 'function') { var u = b.getAttribute('data-vis-src') || b.getAttribute('data-vis-video'); if (u) window.open(u, '_blank'); return; }
    visListe = $$('[data-vis]', groupe).filter(function (x) { return x.offsetParent !== null; });
    visIdx = Math.max(0, visListe.indexOf(b));
    visOrigine = b;
    visMontrer();
    vis.showModal();
    if (lenis) lenis.stop();
  });

  // recalcul une fois les polices chargées
  if (hasG && d.fonts && d.fonts.ready) d.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
