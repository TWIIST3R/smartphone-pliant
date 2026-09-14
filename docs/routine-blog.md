# Routine « article du jour » — Smartphone-Pliant.fr

Ce fichier est le cahier des charges de la routine qui rédige **un article par jour** dans `src/content/actualites/`.
Il fait autorité : en cas de doute, appliquer ce document et `docs/guide-redactionnel.md` (sections 6 et 7).

## Principe de publication

- La routine écrit l'article **avec une heure de publication dans le futur** (`pubDate`), choisie par `scripts/pick-publish-time.mjs` dans des créneaux crédibles pour Paris, et le pousse sur une branche `claude/article-<slug>`.
- Le workflow GitHub `publish-article.yml` contrôle l'article (contrôle éditorial, build, maillage) puis l'ajoute à `main` et supprime la branche.
- `deploy.yml` met le site en ligne dès que l'heure de publication est passée. Aucune autre action n'est nécessaire.

## Ligne éditoriale : trois familles d'articles

1. **Actualités des pliants** (`category: actualite`) : lancements, dates et prix officiels, mises à jour logicielles, tests publiés, fuites crédibles présentées comme telles, chiffres de marché, réparabilité, offres officielles.
2. **Questions d'internautes sur les pliants** (`category: question`, `scope: pliant`) : « Un smartphone pliant est-il fragile ? », « Quel est l'intérêt d'un téléphone pliable ? », « Quels sont les inconvénients d'un téléphone pliable ? »… Le backlog est dans `src/data/blog-sujets.json`.
3. **Questions sur le smartphone en général** (`scope: smartphone`) : batterie, charge, indice IP, eSIM, mises à jour… Toujours dans le périmètre du téléphone.
   - Autorisées seulement après **8 questions « pliant » publiées**.
   - Ensuite, **au plus 1 article sur 3** : jamais d'article hors pliant si l'un des 2 précédents l'était déjà.

## Choisir le sujet du jour

`node scripts/blog-status.mjs` affiche le **mix éditorial** et les **sujets du backlog disponibles**. Appliquer dans l'ordre :

1. **Actualité forte** : datant de moins de 72 h, jamais traitée, importante pour un acheteur en France.
   - Si l'état du blog indique « prochain article : une QUESTION », une actualité n'est possible que pour une annonce officielle majeure concernant la France (prix ou date de sortie en France, par exemple).
2. **Sinon, une question du backlog** : prendre le sujet disponible le plus prioritaire.
   - On peut choisir parmi les 3 premiers si l'un d'eux colle mieux à l'actualité du moment.
   - Renseigner `sujet: <id>` et `scope` comme dans le backlog.
3. **Si le backlog est épuisé pour le périmètre autorisé** : traiter une question réelle d'acheteur, jamais traitée, repérée pendant la veille (« autres questions posées » des moteurs de recherche, forums, presse). Dans ce cas, pas de champ `sujet`. Proposer dans le compte rendu 3 idées de sujets à ajouter au backlog.

## Étapes, dans l'ordre

1. **Préparer** : `npm ci` (si `node_modules` est absent). Vérifier `node -v`.
2. **État du blog** : `node scripts/blog-status.mjs`.
   - Si un article est déjà **programmé** (heure future), **ne rien écrire** et terminer : la routine a déjà tourné.
   - Noter le mix éditorial, les sujets du backlog, le dernier format utilisé et les sujets déjà traités.
3. **Veille** (recherche web, sources des 72 dernières heures en priorité) puis **choix du sujet** selon la section précédente.
4. **Format** : choisir dans la liste des formats disponibles (`src/data/blog-formats.json`) celui qui sert le mieux le sujet.
   - Jamais le même format que l'article précédent.
   - Jamais plus de 2 fois sur les 7 derniers articles.
   - Respecter le squelette (`skeleton`) et la fourchette de mots (`words`) du format.
   - Pour une question : `reponse-question`, `vrai-faux`, `questions-reponses`, `liste-conseils`, `decryptage`, `guide-pratique`, `face-a-face` ou `lexique` selon le sujet.
5. **Vérifier les faits** :
   - au moins **2 sources fiables** pour une actualité ou une question ;
   - une source officielle suffit pour une annonce de constructeur ;
   - noter les URL.
6. **Heure** : `node scripts/pick-publish-time.mjs`, puis copier la valeur `iso` dans `pubDate`.
7. **Rédiger** `src/content/actualites/<slug>.md` :
   - slug court, sans date, en minuscules, 3 à 9 mots séparés par des tirets ;
   - frontmatter ci-dessous.
8. **Contrôler**, et corriger jusqu'à 0 erreur :
   - `node scripts/blog-status.mjs --check <slug>` ;
   - `npm run build` ;
   - `npm run check-links`.

   Si le build échoue pour une raison étrangère à l'article (version de Node trop ancienne, par exemple), le signaler dans le message de commit. GitHub Actions refera le build.
9. **Publier** sur une branche dédiée (la routine ne peut pas pousser directement sur `main`) :
   - `git checkout -b claude/article-<slug>` ;
   - `git add src/content/actualites/<slug>.md` (et `src/content/actualites/images/<slug>.webp` s'il y a une illustration autorisée), puis commit `Article : <titre>` ;
   - `git push -u origin claude/article-<slug>`.

   Ne modifier **aucun autre fichier** du dépôt (pas même le backlog) : le workflow `publish-article.yml` refuse toute branche qui touche autre chose qu'un nouvel article et son illustration. Ne pas ouvrir de pull request : le workflow intègre l'article à `main` tout seul.

## Articles « question » : règles propres

- **Titre** : la question telle qu'un internaute la tape, ou très proche, terminée par « ? » (30 à 70 caractères).
- **Premier paragraphe** : la réponse directe en **25 à 80 mots**, compréhensible seule.
  - C'est le passage que reprennent les moteurs de réponse (AI Overviews, ChatGPT, Perplexity) : pas d'introduction, pas de suspense.
- **Réponse équilibrée** : ni alarmiste ni promotionnelle. Les nuances (selon le format, le modèle, l'usage) viennent dans les intertitres, avec des faits sourcés et des exemples du catalogue (`src/data/phones.ts`, pages de test).
- **Questions liées** (`faq`) : 3 à 6 questions voisines, obligatoires pour le format `reponse-question`.
  - Réponses de 40 à 450 caractères, en texte seul, sans lien.
  - Elles sont affichées en bas d'article et balisées en FAQPage.
- **Liens** : partir des pages suggérées par le backlog, sans dépasser 2 à 6 liens vers le cocon. Pour un sujet `smartphone`, lier l'accueil et les guides réellement utiles (autonomie, résistance, photo…).
- **`relatedTests`** : les tests suggérés par le backlog, seulement si l'article approfondit vraiment leur sujet. Souvent aucun pour un sujet `smartphone`.
- **`phones`** : les modèles réellement cités en exemple (facultatif pour un sujet général).

## Frontmatter

```yaml
---
title: "…"                      # 40 à 70 caractères (30 à 70 pour une question)
description: "…"                # 120 à 165 caractères, avec un fait précis
pubDate: 2026-09-12T14:37:00+02:00
format: reponse-question        # clé de src/data/blog-formats.json
category: question              # actualite | question | guide | analyse | comparatif | astuce | dossier
scope: pliant                   # pliant (défaut) | smartphone
sujet: smartphone-pliant-fragile   # id du backlog src/data/blog-sujets.json, si le sujet en vient
tags: [resistance, charniere, indice-ip]
phones: [honor-magic-v6, iphone-duo]   # ids de src/data/phones.ts cités (cartes produits avec boutons Amazon en bas d'article)
phone: iphone-duo               # facultatif : photo d'en-tête, seulement si l'article porte sur CE modèle
relatedTests: [/smartphone-pliant-honor/magic-v6/]   # 0 à 3 tests que l'article approfondit
sources:
  - { media: "Samsung Newsroom", url: "https://…", title: "…" }
  - { media: "GSMArena", url: "https://…", title: "…" }
faq:
  - { q: "Un écran pliant se remplace-t-il ?", a: "…" }
---
```

Écrire les listes **sur une ligne** (`[a, b]`), et les sources et questions liées **une par ligne** au format `- { clé: "…", clé: "…" }`.

## Illustrations

Objectif : **environ un article sur deux** avec une image d'en-tête (`cover`), jamais deux images pour le même article. Une seule image par article, dans `src/content/actualites/images/<slug>.webp`, produite **uniquement** par l'un des deux scripts ci-dessous. `cover` et `phone` ne se cumulent pas : `cover` l'emporte.

1. **Actualité sur un produit précis** → **photo officielle de presse** :
   - trouver le communiqué ou le dossier de presse du produit sur la salle de presse officielle de la marque ;
   - la marque doit être autorisée dans `src/data/salles-de-presse.json` (`autorise: true`) ;
   - la photo doit montrer le produit dont parle l'article ;
   - lancer `node scripts/fetch-press-image.mjs --slug <slug> --brand <clé> --page <URL du communiqué> --image <URL du fichier image>` ;
   - reprendre la ligne `cover` affichée (crédit et `sourceUrl` compris) et écrire le texte alternatif `alt` en français.

   Aucune photo sans ce script : pas de photo de site de presse, de revendeur, de réseau social ni de banque d'images.
2. **Question, guide, décryptage, marché** → **illustration générée par IA** :
   - lancer `node scripts/generate-cover.mjs --slug <slug> --prompt "<scène en anglais>"` ;
   - la scène est générique et évoque le sujet : un smartphone pliant entrouvert sur un bureau, une main qui plie un téléphone, une batterie stylisée, une loupe sur une charnière… ;
   - **jamais** de marque, de modèle réel, de logo, de texte ni de personne identifiable (le script refuse les noms de marque) ;
   - ne jamais présenter l'illustration comme la photo d'un produit réel ;
   - garder le crédit affiché (« Illustration générée par IA (OpenAI) ») et décrire l'image en français dans `alt`.

   Si le script échoue (clé absente, erreur de l'API), publier l'article sans illustration et le signaler dans le compte rendu.
3. **Sinon** → `phone` : la photo produit d'un modèle du catalogue, uniquement si l'article porte principalement sur ce modèle (le nom du modèle s'affiche en légende). Ne jamais l'utiliser pour illustrer un autre modèle, même le successeur ou le prédécesseur.

Ne jamais télécharger une image autrement qu'avec `scripts/fetch-press-image.mjs` (droits d'auteur). Penser à ajouter le fichier image au commit (étape 9).

## Maillage : règles strictes

- **Dans le corps**, faire 2 à 6 liens internes vers des pages du cocon réellement utiles au lecteur : tests, pages marque, format, budget, usage, accueil.
  - Ancres descriptives (jamais « cliquez ici »).
  - Chemins relatifs avec slash final : `[le test du Galaxy Z Fold8](/smartphone-pliant-samsung/galaxy-z-fold8/)`.
- **1 ou 2 liens vers d'anciens articles** sont possibles, s'ils sont vraiment pertinents.
- **`relatedTests`** : uniquement des tests dont l'article **approfondit directement** le sujet.
  - Ce sont les **seules** pages du cocon qui afficheront un lien vers l'article (bloc « Pour aller plus loin »).
  - Ne jamais modifier les pages du cocon pour y ajouter des liens.
- **Aucun lien Amazon** dans le corps : les cartes générées à partir de `phones` portent les boutons.
- **Pas de titre `#`** dans le corps : le H1 vient de `title`. Structurer avec `##` et `###`.

## Qualité et honnêteté

- Tout fait vérifiable est sourcé. **Aucune information inventée**, aucune date ni aucun chiffre non vérifié.
- **Relecture factuelle obligatoire avant les contrôles** : pour chaque phrase qui affirme un fait, retrouver sa source (une URL du champ `sources`, ou un passage précis du dépôt : `phones.ts`, page de test). Supprimer ou reformuler toute phrase sans source, en particulier :
  - les « premier », « seul », « a introduit », « plus gros », « la plupart des marques », « l'immense majorité » ;
  - les comparaisons avec d'anciennes générations ou d'autres marques qui ne figurent pas dans une source ;
  - les généralisations tirées de quelques modèles (« toutes les marques », « l'autonomie a progressé partout »).
- Recompter ce qui est dénombré (marques, modèles, pourcentages) avant de l'écrire.
- Ne jamais attribuer à un modèle une caractéristique lue dans l'article consacré à un autre modèle (écran, puce, fréquence…). Garder des notes séparées par modèle.
- Quand deux sources divergent (définition, gain de performance, date de vente), écrire les deux valeurs en les attribuant (« 3,2K selon Clubic, 3K selon Engadget ») plutôt que d'en choisir une.
- Ne pas déduire une caractéristique qu'aucune source n'écrit (« écran extérieur distinct », « caméra sous l'écran ») : si ce n'est pas écrit, ne pas l'affirmer.
- **Conseils pratiques** (charge, entretien, garantie, démarches) : s'appuyer sur la documentation officielle des constructeurs ou des sites publics (service-public.fr, textes européens), jamais sur des idées reçues.
- Les rumeurs sont présentées comme telles, avec leur source et leur degré de fiabilité.
- **Aucune prétention de prise en main** (« nous avons testé », « lors de notre test »…). La rédaction s'appuie sur les sources et les tests publiés.
- **Prix** : uniquement des prix officiels annoncés ou de lancement, jamais de prix Amazon ou de « prix actuel ».
- **Droit d'auteur** : aucune phrase copiée. Au plus une citation de moins de 15 mots par source, entre guillemets et attribuée.
- **Style** : `docs/guide-redactionnel.md` section 6 (formules interdites, vouvoiement, pas de « En conclusion »).
- La signature (Théo Marceau) est automatique : ne pas l'écrire dans le corps.

## Variété d'un article à l'autre

En plus du format, varier à chaque article :

- **l'accroche** : fait chiffré, question, contexte daté, courte citation attribuée, contraste. Ne pas reprendre le type d'accroche de l'article précédent. Pour une question, l'accroche est la réponse directe ;
- **la longueur**, dans la fourchette du format ;
- **les intertitres** : affirmation, question, mot-clé suivi de deux-points, numérotation (selon le format) ;
- **les éléments** : tableau, liste, citation `>`, phrase « À retenir » en gras. Jamais tous dans le même article ;
- **la chute** : conseil pratique, prochaine échéance datée, mise en perspective ou question ouverte.

## Créneaux de publication (heure de Paris)

| Jour | Créneau |
|---|---|
| Lundi → vendredi | 07:15 – 21:40 |
| Samedi | 08:50 – 20:20 |
| Dimanche | 09:35 – 19:45 |

Les minutes rondes sont évitées. Si le créneau du jour est dépassé, le script choisit le lendemain.
