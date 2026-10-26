/* H-Renovation — formulaire de contact (simulé : rien n'est envoyé) */
(function () {
  'use strict';
  var d = document, HR = window.HR || {}, $ = HR.$;
  var anime = HR.hasG && !HR.calme;
  var form = $('[data-contact]');
  if (!form) return;
  var err = $('[data-contact-erreur]', form);
  var marque = function (el, ko) { el.setAttribute('aria-invalid', ko ? 'true' : 'false'); };
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var champs = ['c-prenom', 'c-nom', 'c-email', 'c-message'].map(function (id) { return d.getElementById(id); });
    var vide = null;
    champs.forEach(function (c) { var ko = !c.value.trim(); marque(c, ko); if (ko && !vide) vide = c; });
    var mail = d.getElementById('c-email');
    if (!vide && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.value.trim())) { marque(mail, true); err.textContent = 'Vérifiez l’adresse e-mail.'; mail.focus(); return; }
    if (vide) { err.textContent = 'Merci de remplir les champs marqués d’une étoile.'; vide.focus(); return; }
    if (!d.getElementById('c-consent').checked) { err.textContent = 'Cochez la case pour accepter d’être recontacté.'; d.getElementById('c-consent').focus(); return; }
    err.textContent = '';
    $('[data-contact-champs]', form).hidden = true;
    var merci = $('[data-contact-merci]', form);
    merci.hidden = false;
    $('[data-contact-merci-titre]', form).focus();
    if (anime) gsap.from(merci.children, { opacity: 0, y: 20, duration: 0.7, ease: 'power3.out', stagger: 0.08 });
  });
})();
