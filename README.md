# H-Renovation — maquette « Orage sur l'ardoise »

Site statique (HTML, CSS, JavaScript) sans étape de construction, prêt pour Vercel.

## Pages
- `/` accueil
- `/servicetype/toiture` page Toiture (même adresse que sur le site Wix actuel)
- `/devis-gratuit` demande de devis en 4 étapes (simulée)
- `/mentions-legales` mentions et confidentialité (à compléter)

Les anciennes adresses du site Wix (services, contact, réalisations, à propos, conditions générales…) sont redirigées dans `vercel.json`.

## Avant la mise en ligne réelle
1. Retirer `<meta name="robots" content="noindex, nofollow">` de chaque page.
2. Retirer l'en-tête `X-Robots-Tag` de `vercel.json`.
3. Brancher le domaine www.h-renovation.com sur Vercel, puis vérifier la propriété dans Google Search Console (la balise de vérification actuelle est conservée sur l'accueil) et envoyer `sitemap.xml`.
4. Remplacer tous les « à compléter » (mentions légales, décennale, e-mail, horaires, zone, note Google).
5. Relier le formulaire de devis à un vrai service d'envoi.

## Images
- `assets/img/chantiers/` : vraies photos du site actuel, vérifiées une à une et renommées d'après leur contenu (correction de lumière légère, WebP).
- `assets/img/videos/` : deux vidéos de chantier du site actuel, réencodées sans le son.
- `assets/img/grok/` : images d'ambiance créées avec Grok (signalées « Illustration » quand elles illustrent une prestation).
- `assets/img/provisoire-*` : visuels provisoires en attendant une vraie photo.
- Les images générées par IA présentes sur le site Wix (ouvriers en gilet « H-RENOVATION ») et les photos de banque d'images ne sont pas reprises.

## Bibliothèques (hébergées dans assets/js/vendor)
GSAP 3.15 (ScrollTrigger, SplitText), Lenis 1.3.27, OGL 1.0.11. Polices Big Shoulders Display et Manrope (SIL OFL).
