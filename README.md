# H-Renovation — maquette « Orage sur l'ardoise »

Site statique (HTML, CSS, JavaScript) sans étape de construction, prêt pour Vercel.

## Pages (mêmes adresses que le site Wix actuel)
- `/` accueil
- `/servicetype/toiture`, `/servicetype/façade`, `/servicetype/isolation` : les 3 savoir-faire
- `/services/…` : les 32 fiches prestations, à leur adresse d'origine (accents compris)
- `/realisations`, `/a-propos`, `/contact`, `/devis-gratuit`
- `/conditions-generales`, `/politique-de-confidentialite`, `/declaration-daccessibilite`, `/mentions-legales` (nouvelle)

Les fichiers des pages dont l'adresse contient un accent portent un nom sans accent (`services/demoussage-toiture.html`…) :
`vercel.json` sert chaque fichier à l'adresse accentuée d'origine (réécritures), et chaque page déclare cette adresse en `canonical`.
`/merci-contact` est redirigée vers `/contact`.

## Avant la mise en ligne réelle
1. Retirer `<meta name="robots" content="noindex, nofollow">` de chaque page.
2. Retirer l'en-tête `X-Robots-Tag` de `vercel.json`.
3. Brancher le domaine www.h-renovation.com sur Vercel, remettre `og:image` sur `https://www.h-renovation.com/assets/img/og-h-renovation.jpg` dans chaque page (il pointe vers l'adresse de la maquette en attendant), vérifier la propriété dans Google Search Console (la balise actuelle est conservée sur l'accueil) et envoyer `sitemap.xml`.
4. Remplacer tous les « à compléter » et valider les mentions signalées « à valider » sur les fiches.
5. Relier les formulaires de contact et de devis à un vrai service d'envoi.

## Sécurité et cache (vercel.json)
- En-têtes de sécurité : CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy, nosniff.
- La CSP autorise le petit script en ligne du `<head>` par son empreinte sha256 : si ce script change, recalculer l'empreinte dans vercel.json.
- Cache : CSS, JS et polices 1 an (les CSS et JS sont versionnés par `?v=`), images 30 jours.

## Bibliothèques (hébergées dans assets/js/vendor)
GSAP 3.15 (ScrollTrigger, SplitText), Lenis 1.3.27, OGL 1.0.11. Polices Big Shoulders Display et Manrope (SIL OFL).
