# Routine « article du jour » — Smartphone-Pliant.fr

Ce fichier est le cahier des charges de la routine qui rédige **un article par jour** dans `src/content/actualites/`.
Il fait autorité : en cas de doute, appliquer ce document et `docs/guide-redactionnel.md` (sections 6 et 7).

## Principe de publication

- La routine écrit l'article **avec une heure de publication dans le futur** (`pubDate`), choisie par `scripts/pick-publish-time.mjs` dans des créneaux crédibles pour Paris, et le pousse sur une branche `claude/article-<slug>`.
- Le workflow GitHub `publish-article.yml` contrôle l'article (contrôle éditorial, build, maillage) puis l'ajoute à `main` et supprime la branche.
- `deploy.yml` met le site en ligne dès que l'heure de publication est passée. Aucune autre action n'est nécessaire.

## Étapes, dans l'ordre

1. **Préparer** : `npm ci` (si `node_modules` est absent). Vérifier `node -v`.
2. **État du blog** : `node scripts/blog-status.mjs`.
   - Si un article est déjà **programmé** (heure future), **ne rien écrire** et terminer : la routine a déjà tourné.
   - Noter le dernier format utilisé, les formats disponibles et les sujets déjà traités.
3. **Veille** (recherche web, sources des 72 dernières heures en priorité), sur les smartphones pliants vendus ou attendus en France :
   - lancements ;
   - dates et prix officiels ;
   - mises à jour logicielles ;
   - tests publiés par la presse ;
   - fuites crédibles (en les présentant comme telles) ;
   - chiffres de marché (Counterpoint, IDC, Canalys) ;
   - réparabilité ;
   - offres officielles des constructeurs.

   Retenir **un sujet jamais traité** (comparer aux titres et tags listés à l'étape 2).
   S'il n'y a pas d'actualité solide, écrire un article **intemporel et utile** (guide, décryptage, lexique, conseils) lié à une question réelle d'acheteur.
4. **Format** : choisir dans la liste des formats disponibles (`src/data/blog-formats.json`) celui qui sert le mieux le sujet.
   - Jamais le même format que l'article précédent.
   - Jamais plus de 2 fois sur les 7 derniers articles.
   - Respecter le squelette (`skeleton`) et la fourchette de mots (`words`) du format.
5. **Vérifier les faits** :
   - au moins **2 sources fiables** pour une actualité ;
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
   - `git add src/content/actualites/<slug>.md`, puis commit `Article : <titre>` ;
   - `git push -u origin claude/article-<slug>`.

   Ne modifier **aucun autre fichier** du dépôt : le workflow `publish-article.yml` refuse toute branche qui touche autre chose qu'un nouvel article. Ne pas ouvrir de pull request : le workflow intègre l'article à `main` tout seul.

## Frontmatter

```yaml
---
title: "…"                      # 40 à 70 caractères
description: "…"                # 120 à 165 caractères, avec un fait précis
pubDate: 2026-09-12T14:37:00+02:00
format: analyse                 # clé de src/data/blog-formats.json
category: actualite             # actualite | guide | analyse | comparatif | astuce | dossier
tags: [iphone-duo, apple, precommandes]
phones: [iphone-duo]            # ids de src/data/phones.ts cités (cartes produits avec boutons Amazon en bas d'article)
phone: iphone-duo               # facultatif : photo d'en-tête (id d'un modèle)
relatedTests: [/iphone-pliable/iphone-duo/]   # 0 à 3 tests que l'article approfondit
sources:
  - { media: "Apple Newsroom", url: "https://…", title: "…" }
---
```

Écrire les listes **sur une ligne** (`[a, b]`) et les sources **une par ligne** au format `- { media: "…", url: "…", title: "…" }`.

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
- Les rumeurs sont présentées comme telles, avec leur source et leur degré de fiabilité.
- **Aucune prétention de prise en main** (« nous avons testé », « lors de notre test »…). La rédaction s'appuie sur les sources et les tests publiés.
- **Prix** : uniquement des prix officiels annoncés ou de lancement, jamais de prix Amazon ou de « prix actuel ».
- **Droit d'auteur** : aucune phrase copiée. Au plus une citation de moins de 15 mots par source, entre guillemets et attribuée.
- **Style** : `docs/guide-redactionnel.md` section 6 (formules interdites, vouvoiement, pas de « En conclusion »).
- La signature (Théo Marceau) est automatique : ne pas l'écrire dans le corps.

## Variété d'un article à l'autre

En plus du format, varier à chaque article :

- **l'accroche** : fait chiffré, question, contexte daté, courte citation attribuée, contraste. Ne pas reprendre le type d'accroche de l'article précédent ;
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
