/* H-Renovation — demande de devis en quatre étapes (simulée : rien n'est envoyé) */
(function () {
  'use strict';
  var d = document, HR = window.HR || {}, $ = HR.$, $$ = HR.$$;
  var anime = HR.hasG && !HR.calme;
  var form = $('[data-devis]');
  if (!form) return;

  var etapes = $$('[data-etape-form]', form), prog = $$('[data-progres] li', form), rangs = $$('[data-rang]', form);
  var prec = $('[data-prec]', form), suiv = $('[data-suiv]', form), nav = $('[data-form-nav]', form);
  var fleche = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var cur = 0;

  var PRESELECTION = {
    fuite: ['toiture', ['refection-toiture', 'solin', 'noue', 'faitage']],
    mousse: ['toiture', ['demoussage-toiture', 'nettoyage-toiture', 'hydrofuge-toiture']],
    gouttiere: ['toiture', ['gouttiere']],
    lumiere: ['toiture', ['velux']],
    humidite: ['facade', ['facade-5', 'facade-6', 'facade-7', 'facade-8']],
    froid: ['isolation', ['isolation-3', 'isolation-4']],
    toiture: ['toiture', []], facade: ['facade', []], isolation: ['isolation', []],
  };

  function univers() { var r = form.querySelector('input[name="univers"]:checked'); return r ? r.value : null; }
  function majCases() {
    var u = univers();
    $$('[data-cases]', form).forEach(function (c) { c.hidden = c.getAttribute('data-cases') !== u; });
  }
  function majUrgence() {
    var v = form.querySelector('input[name="urgence"]:checked');
    $('[data-alerte-fuite]', form).classList.toggle('est-visible', !!v && v.value === 'Fuite en cours');
  }
  function lireAncre() {
    var m = /^#besoin-(.+)$/.exec(location.hash || '');
    if (!m) return;
    var cle = decodeURIComponent(m[1]);
    var conf = PRESELECTION[cle] || (d.getElementById('p-' + cle) ? ['toiture', [cle]] : null);
    if (!conf) return;
    var r = d.getElementById('univers-' + conf[0]);
    if (r) r.checked = true;
    majCases();
    conf[1].forEach(function (id) { var c = d.getElementById('p-' + id); if (c) c.checked = true; });
  }

  function apercu(inp) {
    var box = $('[data-apercu]', form);
    box.innerHTML = '';
    Array.prototype.slice.call(inp.files || [], 0, 6).forEach(function (f) {
      if (!/^image\//.test(f.type)) return;
      var img = new Image();
      img.alt = f.name;
      img.src = URL.createObjectURL(f);
      box.appendChild(img);
    });
  }

  form.addEventListener('change', function (e) {
    if (e.target.name === 'univers') majCases();
    if (e.target.name === 'urgence') majUrgence();
    if (e.target.id === 'photos') apercu(e.target);
  });

  function erreur(cle, msg) { var el = form.querySelector('[data-erreur="' + cle + '"]'); if (el) el.textContent = msg || ''; }
  function marque(el, ko) { if (ko) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid'); }

  function valider(i) {
    if (i === 0) {
      if (!univers()) { erreur('univers', 'Choisissez un savoir-faire.'); return false; }
      erreur('univers'); return true;
    }
    if (i === 1) {
      var u = univers();
      if (u === 'autre') {
        var t = d.getElementById('autre-besoin');
        if (!t.value.trim()) { erreur('prestations', 'Décrivez votre besoin en quelques mots.'); marque(t, true); t.focus(); return false; }
        marque(t, false);
      } else if (!form.querySelectorAll('[data-cases="' + u + '"] input:checked').length) {
        erreur('prestations', 'Cochez au moins une prestation, même approximative.');
        var premier = form.querySelector('[data-cases="' + u + '"] input');
        if (premier) premier.focus();
        return false;
      }
      erreur('prestations'); return true;
    }
    if (i === 2) {
      var c = d.getElementById('commune'), cp = d.getElementById('cp');
      if (!c.value.trim()) { marque(c, true); erreur('commune', 'Indiquez la commune du chantier.'); c.focus(); return false; }
      marque(c, false);
      if (cp.value && !/^\d{5}$/.test(cp.value.trim())) { marque(cp, true); erreur('commune', 'Le code postal compte 5 chiffres.'); cp.focus(); return false; }
      marque(cp, false); erreur('commune'); return true;
    }
    if (i === 3) {
      var ok = true, msgs = [];
      ['prenom', 'nom'].forEach(function (id) { var f = d.getElementById(id), v = !!f.value.trim(); marque(f, !v); if (!v) ok = false; });
      if (!ok) msgs.push('Le prénom et le nom sont nécessaires.');
      var em = d.getElementById('email'), ev = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em.value.trim());
      marque(em, !ev);
      if (!ev) { ok = false; msgs.push('L’adresse e-mail semble incomplète (exemple : prenom@domaine.fr).'); }
      var tel = d.getElementById('tel');
      if (tel.value.trim() && tel.value.replace(/\D/g, '').length < 10) { ok = false; marque(tel, true); msgs.push('Le téléphone doit compter 10 chiffres.'); } else marque(tel, false);
      erreur('coord', msgs.join(' '));
      var cs = d.getElementById('consent');
      if (!cs.checked) { ok = false; erreur('consent', 'Cochez la case pour que Samuel puisse vous recontacter.'); } else erreur('consent');
      if (!ok) { var f1 = form.querySelector('[data-etape-form="3"] [aria-invalid="true"]') || cs; f1.focus(); }
      return ok;
    }
    return true;
  }

  function maj() {
    prog.forEach(function (li, k) { li.classList.toggle('est-fait', k < cur); li.classList.toggle('est-courant', k === cur); });
    rangs.forEach(function (r, k) {
      var on = k < cur;
      if (anime) gsap.to(r, { opacity: on ? 1 : 0.15, duration: 0.5, ease: 'power2.out', delay: on ? k * 0.08 : 0 });
      else r.setAttribute('opacity', on ? '1' : '0.15');
    });
    prec.hidden = cur === 0 || cur === 4;
    nav.hidden = cur === 4;
    suiv.innerHTML = (cur === 3 ? 'Envoyer ma demande ' : 'Continuer ') + fleche;
  }

  function aller(i) {
    var depuis = etapes[cur], vers = etapes[i], dir = i > cur ? 1 : -1;
    var afficher = function () {
      etapes.forEach(function (e, k) { e.hidden = k !== i; });
      cur = i;
      maj();
      var focus = vers.querySelector('[data-merci-titre]') || vers.querySelector('input:checked, input, textarea');
      if (focus) focus.focus({ preventScroll: true });
      var top = form.getBoundingClientRect().top;
      if (top < 80 && HR.scrollTo) HR.scrollTo(form, -120);
    };
    if (!anime) { afficher(); return; }
    gsap.to(depuis, {
      opacity: 0, x: -30 * dir, duration: 0.22, ease: 'power2.in',
      onComplete: function () {
        gsap.set(depuis, { clearProps: 'opacity,transform' });
        afficher();
        gsap.fromTo(vers, { opacity: 0, x: 30 * dir }, { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out', clearProps: 'opacity,transform' });
      },
    });
  }

  function recap() {
    var dl = $('[data-recap]', form);
    var val = function (n) { var r = form.querySelector('input[name="' + n + '"]:checked'); return r ? r.value : ''; };
    var u = univers();
    var lab = { toiture: 'Toiture', facade: 'Façade', isolation: 'Isolation', autre: 'Autre' }[u] || '';
    var prestas = u === 'autre' ? d.getElementById('autre-besoin').value.trim()
      : $$('[data-cases="' + u + '"] input:checked', form).map(function (c) { return c.value; }).join(', ');
    var photos = d.getElementById('photos').files.length;
    var lignes = [
      ['Besoin', lab], ['Détail', prestas], ['Urgence', val('urgence')], ['Logement', val('logement')],
      ['Commune', [d.getElementById('commune').value.trim(), d.getElementById('cp').value.trim()].filter(Boolean).join(' ')],
      ['Message', d.getElementById('message').value.trim() || '—'],
      ['Photos', photos ? photos + ' photo' + (photos > 1 ? 's' : '') : 'aucune'],
      ['Contact', [d.getElementById('prenom').value.trim(), d.getElementById('nom').value.trim()].join(' ')],
      ['E-mail', d.getElementById('email').value.trim()],
      ['Téléphone', d.getElementById('tel').value.trim() || '—'],
    ];
    dl.innerHTML = '';
    lignes.forEach(function (l) {
      var div = d.createElement('div'), dt = d.createElement('dt'), dd = d.createElement('dd');
      dt.textContent = l[0]; dd.textContent = l[1];
      div.appendChild(dt); div.appendChild(dd); dl.appendChild(div);
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!valider(cur)) return;
    if (cur === 3) { recap(); aller(4); } else aller(cur + 1);
  });
  prec.addEventListener('click', function () { if (cur > 0) aller(cur - 1); });
  window.addEventListener('hashchange', lireAncre);

  lireAncre();
  majCases();
  majUrgence();
  maj();

  if (anime) {
    gsap.from('.form-carte', { opacity: 0, y: 40, duration: 1, ease: 'power3.out', delay: 0.2 });
    gsap.from('.devis__fond img', { scale: 1.12, duration: 2.4, ease: 'expo.out' });
  }
})();
