# Smartphone-Pliant.fr

Site d'affiliation Amazon consacré aux smartphones pliants, construit avec [Astro](https://astro.build) en site 100 % statique (HTML pur, quasiment sans JavaScript).

## Démarrer

```bash
npm install
npm run dev          # aperçu local sur http://localhost:4321
npm run build        # génère le site dans dist/
npm run check-links  # vérifie le maillage du cocon sur dist/
```

Node.js 22.12 ou plus récent est requis.

## Organisation

| Dossier / fichier | Rôle |
|---|---|
| `src/data/phones.ts` | **Base produits** : fiches, prix de lancement, notes, points forts/faibles, requête ou ASIN Amazon |
| `src/data/cocoon.ts` | **Arborescence du cocon sémantique** (mère, groupe, libellés des pages) |
| `src/data/site.ts` | Nom, URL, tag Amazon, date de mise à jour, couleurs des marques |
| `src/pages/` | Une page = un fichier `.astro` (contenu rédigé à la main) |
| `src/components/` | Blocs réutilisables (tableaux, cartes, FAQ, boutons Amazon…) |
| `src/pages/llms.txt.ts` | Génère `/llms.txt` pour les moteurs de réponse IA |
| `public/` | `robots.txt`, `.htaccess` (OVH), favicon |
| `scripts/check-links.mjs` | Contrôle automatique des règles du cocon |
| `docs/guide-redactionnel.md` | Règles de rédaction, SEO/GEO et faits vérifiés |

## Le cocon sémantique

```
Accueil (comparatif global) ─┬─ Formats   : clapet · format livre · tri-pliant
                             ├─ Marques   : Apple · Samsung · Google · Motorola · Honor · Huawei · Xiaomi
                             │              └─ Fiches produits (+ duel iPhone Duo vs Fold8)
                             ├─ Budgets   : < 1 000 € · < 1 500 € · < 2 000 € · > 2 000 €
                             └─ Usages    : photo · travail · autonomie · gaming · résistance
```

Règles appliquées (et vérifiées par `npm run check-links`) :

1. la page mère lie toutes ses filles dans le contenu ;
2. chaque fille lie sa mère en premier lien du contenu ;
3. chaque page liste ses sœurs (même mère, même groupe) en bas de contenu ;
4. aucun lien transversal entre silos (seules `/methodologie/` et `/a-propos/` sont autorisées partout).

**Liens obfusqués** : pour que les visiteurs puissent ouvrir un test depuis l'accueil ou n'importe quel guide sans casser le cocon, les noms, vignettes et boutons « Lire le test complet » du tableau comparatif et des cartes produits sont des liens obfusqués (composant `ObfLink`) : cliquables pour l'humain (clic, Ctrl+clic, clic molette, touche Entrée), mais pas des liens `<a href>` pour les robots. Seules les pages marques pointent vers les tests avec de vrais liens.

### Parcours de l'acheteur (glissement sémantique)

Les pages de niveau 1 sont regroupées en clusters qui suivent le raisonnement d'un acheteur (`PARCOURS` dans `src/data/cocoon.ts`) : les meilleurs pliants (accueil) › se rassurer (résistance, autonomie) › choisir le format › fixer son budget › préciser son usage › choisir la marque › lire le test. Chaque page propose en fin de contenu l'étape suivante (champ `next` : pages de même mère, cluster suivant, bloc « Et ensuite ? »), puis liste ses sœurs du même cluster. L'accueil présente le parcours en questions. `npm run check-links` vérifie ces liens.

### Ajouter une page

1. Déclarer la page dans `src/data/cocoon.ts` (chemin, `parent`, `group`, libellés).
2. Si c'est un produit, l'ajouter dans `src/data/phones.ts`.
3. Créer le fichier dans `src/pages/` en suivant `docs/guide-redactionnel.md`.
4. Ajouter le lien vers la nouvelle fille dans le contenu de sa page mère.
5. `npm run build && npm run check-links`.

## Images des téléphones

Chaque modèle a son dossier dans `src/assets/phones/` (le nom du dossier est l'`id` du modèle dans `phones.ts`).

1. Déposez les photos dans le dossier du modèle en les nommant **`1.jpg`** (image principale : vignette du comparatif, cartes, en-tête du test) puis **`2.jpg`** (vue affichée dans le texte du test), `3.jpg`… Formats acceptés : jpg, png, webp, avif.
2. Lancez `npm run build` : les photos sont détectées automatiquement, converties en WebP à plusieurs tailles et affichées partout, sur fond blanc et sans recadrage (idéal pour les visuels produits).
3. Dès qu'un modèle a au moins 2 photos, une galerie apparaît dans la section design de son test : ajoutez `2.jpg`, `3.jpg`, `4.jpg` (dos, profil, fermé, coloris…) pour l'enrichir.

Sans photo, le site affiche la silhouette du format. Pour un texte alternatif précis ou un crédit photo, les images peuvent aussi être déclarées dans `src/data/images.ts` (les images créditées apparaissent sur `/credits-images/`).

> Rappel : le contrat du Programme Partenaires n'autorise l'affichage des images Amazon que via la Creators API (images servies depuis les serveurs d'Amazon, rafraîchies toutes les 24 h). Le choix des images utilisées relève de l'éditeur du site.

## Tests et auteur

- Les fiches produits sont des **tests sous forme de synthèses sourcées**. Les mesures et verdicts repris de la presse sont attribués et liés (composants `Measures` et `TestSources`), sans jamais prétendre à une prise en main.
- Les pages sont signées **Théo Marceau**, nom de plume de la rédaction, avec un avatar illustré (`public/images/theo-marceau.svg`) et une page `/auteur/theo-marceau/`. Pour signer de votre vrai nom, modifiez `SITE.author` dans `src/data/site.ts`.

## Blog « Actualités »

- Articles en Markdown dans `src/content/actualites/<slug>.md` (schéma dans `src/content.config.ts`), publiés sur `/actualites/` (liste paginée), `/actualites/<slug>/` et `/actualites/rss.xml`.
- **Publication programmée** : un article n'apparaît qu'une fois son `pubDate` passé. Le workflow GitHub `.github/workflows/deploy.yml` reconstruit et envoie le site sur OVH à chaque push sur `main` et, toutes les heures, dès qu'un article programmé arrive à échéance (`scripts/due-articles.mjs` : pas de build inutile, les minutes GitHub Actions sont préservées).
- **Maillage hermétique** : les articles lient librement les pages du cocon ; seules les pages de dernier niveau (tests) affichent un lien vers les articles, via le bloc « Pour aller plus loin » alimenté par le champ `relatedTests`. L'accueil et les pages de niveau 1 n'ont que des liens obfusqués vers le blog (en-tête, pied de page). `npm run check-links` vérifie ces règles.
- **Outils** :
  - `node scripts/blog-status.mjs` : derniers articles, formats disponibles, sujets déjà traités ;
  - `node scripts/blog-status.mjs --check <slug>` : contrôle complet d'un article ;
  - `node scripts/pick-publish-time.mjs` : heure de publication aléatoire dans les créneaux parisiens.
- **Ligne éditoriale** : actualités des pliants, questions d'internautes sur les pliants (« Un smartphone pliant est-il fragile ? »), puis questions sur le smartphone en général (au plus 1 article sur 3, après 8 questions pliant). Le backlog des questions est dans `src/data/blog-sujets.json` : ajoutez-y vos idées (id, question, périmètre, priorité, pages et tests suggérés, angle). `node scripts/blog-status.mjs` vérifie les chemins du backlog.
- **Articles « question »** : réponse directe dans le premier paragraphe, questions liées (`faq`) affichées et balisées en FAQPage, illustration facultative (`cover`, fichier dans `src/content/actualites/images/`, crédit obligatoire, « IA » pour une image générée).
- **Routine quotidienne** : cahier des charges dans `docs/routine-blog.md` ; 17 formats d'article dans `src/data/blog-formats.json`.
- **Relecture quotidienne** : une seconde routine cloud (cahier des charges `docs/relecture-blog.md`) relit chaque matin l'article programmé avant sa sortie. Elle vérifie chaque affirmation dans les sources et le catalogue, contrôle l'illustration et pousse ses corrections sur une branche `claude/relecture-<slug>`. Le workflow `.github/workflows/publish-review.yml` les intègre seulement si l'article n'est pas encore publié et si ses champs structurants (date, format, catégorie, sujet, image) n'ont pas changé (`scripts/review-guard.mjs`). Le détail des corrections figure dans le message du commit.
- **Images des articles** (environ un article sur deux) :
  - `node scripts/generate-cover.mjs --slug <slug> --prompt "<scène en anglais>"` : illustration générée par l'API Images d'OpenAI (modèle `gpt-image-2`, qualité moyenne), légendée « Illustration générée par IA ». Scène générique, sans marque, logo ni personne identifiable. Clé : identifiant « API credentials » de l'environnement cloud (hôte `api.openai.com`) pour la routine, `OPENAI_API_KEY` en local.
  - `node scripts/fetch-press-image.mjs --slug <slug> --brand <clé> --page <URL> --image <URL>` : photo officielle de dossier de presse, seulement pour les marques autorisées dans `src/data/salles-de-presse.json` (conditions d'usage éditorial vérifiées), créditée avec lien vers la source. La routine pousse chaque article sur une branche `claude/article-<slug>` ; le workflow `.github/workflows/publish-article.yml` le contrôle (contrôle éditorial, build avec les articles programmés, maillage), l'ajoute à `main` et supprime la branche. Toute branche qui modifie autre chose qu'un nouvel article est refusée (échec visible dans l'onglet Actions de GitHub).

## Liens Amazon

- Tag de suivi : `smartphone-pliant-21` (dans `src/data/site.ts`).
- Par défaut, les boutons pointent vers une **recherche Amazon** du modèle. Pour un lien direct vers la fiche produit, renseignez le champ `asin` du modèle dans `phones.ts` (ex. `asin: 'B0XXXXXXX'`) : tous les boutons du site sont mis à jour.
- Tous les liens portent `rel="sponsored nofollow noopener"`.
- Le site n'affiche **jamais de prix Amazon** (interdit sans l'API Product Advertising) : uniquement les prix publics de lancement.

## Mettre en ligne chez OVH

### Option A — Hébergement web OVH (mutualisé)

Le nom de domaine seul ne suffit pas : il faut un hébergement (l'offre Perso suffit largement).

1. `npm run build`
2. Connectez-vous en FTP/SFTP (identifiants dans l'espace client OVH › Hébergements › FTP-SSH), par exemple avec FileZilla.
3. Envoyez **le contenu** du dossier `dist/` dans le dossier `www/` (y compris le fichier caché `.htaccess`).
4. Dans l'espace client : Hébergements › Multisite, vérifiez que `smartphone-pliant.fr` et `www.smartphone-pliant.fr` pointent vers `www/`, puis activez le certificat SSL (Let's Encrypt gratuit).

Le `.htaccess` force HTTPS, redirige `www` vers le domaine nu et gère la page 404 et le cache.

### Option B — Hébergement statique gratuit (Cloudflare Pages, Netlify)

Connectez le dépôt Git, commande de build `npm run build`, dossier de sortie `dist`. Ajoutez ensuite le domaine dans le service choisi et modifiez les enregistrements DNS dans la zone DNS OVH. Le `.htaccess` est ignoré : configurez la redirection `www` et HTTPS dans le service.

## Avant le lancement

- [ ] Compléter `src/pages/mentions-legales.astro` (éditeur, directeur de publication) — **obligatoire (LCEN)**.
- [ ] Créer l'adresse `contact@smartphone-pliant.fr` (incluse avec l'hébergement OVH) ou remplacer l'adresse dans les pages.
- [ ] Présenter l'auteur réel dans `src/pages/a-propos.astro` et, idéalement, remplacer « La rédaction » dans `src/data/site.ts` par un nom (signal E-E-A-T).
- [ ] Renseigner les ASIN Amazon des modèles dans `phones.ts` dès qu'ils sont disponibles (iPhone Duo : après le 16 octobre 2026).
- [ ] Déclarer le site dans Google Search Console et Bing Webmaster Tools (Bing alimente ChatGPT Search et Copilot), puis soumettre `https://smartphone-pliant.fr/sitemap-index.xml`.
- [ ] Ajouter l'URL du site dans votre compte Partenaires Amazon (Gestion du compte › Sites web).

## Maintenir le site

- Après chaque lancement : mettre à jour `phones.ts`, la date `updated` dans `site.ts`, puis les pages concernées.
- Le comparatif, les classements, `llms.txt`, le sitemap et les données structurées se recalculent automatiquement au build.
- **Google Tag Manager** (`GTM-56FHZD5J`) est chargé sur toutes les pages depuis `src/layouts/BaseLayout.astro`. Toute balise qui dépose des cookies non indispensables (Google Analytics, pixels publicitaires…) doit attendre le consentement du visiteur (bandeau conforme CNIL + Consent Mode), et `src/pages/confidentialite.astro` doit lister les outils activés.
- **Données structurées** (`src/lib/schema.ts`) : Organization (logo PNG, principes éditoriaux), WebSite, Person, WebPage, BreadcrumbList, Article (image, sources citées, modèles cités), Product (fiche technique complète), Review (note, points forts et faibles affichés sur la page), FAQPage, ItemList, NewsArticle/BlogPosting. Contrôle rapide : `npm run build` puis le [test des résultats enrichis](https://search.google.com/test/rich-results) de Google sur une URL en ligne.
