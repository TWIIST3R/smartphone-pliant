# Relecture avant publication — Smartphone-Pliant.fr

Ce fichier est le cahier des charges de la routine de **relecture**. Elle passe chaque matin après la routine de rédaction (`docs/routine-blog.md`) et **avant** l'heure de publication de l'article.

Son rôle : **vérifier chaque affirmation de l'article programmé et corriger les erreurs** avant sa mise en ligne.

- La relecture corrige ; elle ne réécrit pas l'article et ne change pas son angle.
- Les règles « Qualité et honnêteté » de `docs/routine-blog.md` s'appliquent intégralement.

## Étapes, dans l'ordre

1. **Préparer** : `npm ci` (si `node_modules` est absent), puis `node scripts/blog-status.mjs`.
   - Relire chaque article de la section **PROGRAMMÉS** dont la publication a lieu dans plus de 20 minutes.
   - S'il n'y en a aucun : lancer `git ls-remote --heads origin "claude/article-*"`. Une branche listée signale un article refusé par le contrôle GitHub : l'indiquer dans le compte rendu. Puis terminer sans rien modifier.
2. **Lire l'article en entier** : frontmatter, corps, questions liées (`faq`), sources.
3. **Dresser la liste numérotée des affirmations vérifiables** :
   - chiffres, dates, prix, caractéristiques ;
   - superlatifs (« seul », « premier », « meilleur »), comparaisons, décomptes (« trois modèles… ») ;
   - absences affirmées (« aucun test », « ne communique pas »), citations ;
   - mentions « selon X ».
4. **Vérifier chaque affirmation, une par une** :
   - **source citée** : `WebFetch` de l'URL avec une question précise sur le passage concerné. Si la page est inaccessible, chercher une autre source fiable (`WebSearch`) ou retirer l'affirmation ;
   - **catalogue du site** : extraire les valeurs de `src/data/phones.ts` par commande, sur tous les modèles concernés. Par exemple `grep -E "^\s{4}(id|format|ip): " src/data/phones.ts`. Ne jamais compter de mémoire ;
   - **pages du site** (tests, guides) : `grep` dans `src/pages/` pour retrouver le passage et sa source ;
   - **citations** : texte exact dans la source, moins de 15 mots, bien attribué ;
   - **sources** : chacune doit exister et traiter du sujet. Retirer une source inutilisée ou hors sujet.
5. **Vérifier le reste** :
   - le titre et la description restent exacts après correction ;
   - pour une question, le premier paragraphe donne toujours la réponse directe (25 à 80 mots) ;
   - les questions liées sont exactes et sans lien ;
   - les liens internes et les `relatedTests` sont pertinents ;
   - **illustration** : ouvrir l'image avec `Read`. Elle ne doit montrer ni marque, ni logo, ni texte lisible, ni personne identifiable. Elle doit coller au sujet, et le texte `alt` doit la décrire fidèlement. Pour une photo de presse, vérifier qu'elle montre bien le produit de l'article.
6. **Corriger** :
   - reformuler ou supprimer tout ce qui est faux, non sourcé, déformé, trop général ou mal attribué. Quand deux sources divergent, donner les deux valeurs en les attribuant ;
   - une source consultée qui contredit l'article l'emporte sur l'article. Au moindre doute non levé, nuancer ou retirer ;
   - ne pas enrichir l'article : n'ajouter une information que pour remplacer une erreur par la bonne valeur sourcée (en ajoutant la source si besoin) ;
   - garder le format, la structure, le ton et la longueur dans la fourchette du format ;
   - **ne jamais modifier** : le nom du fichier, `pubDate`, `format`, `category`, `scope`, `sujet`, ni `src`, `kind` et `credit` de `cover`. Le texte `alt` peut être corrigé ;
   - ne pas modifier ni régénérer l'image ;
   - si l'article repose sur une erreur de fond impossible à corriger (événement inexistant, confusion entre deux produits du début à la fin), ajouter `draft: true` au frontmatter pour bloquer la publication et l'expliquer dans le commit.
7. **Contrôler**, jusqu'à 0 erreur :
   - `node scripts/blog-status.mjs --check <slug>` ;
   - `BLOG_INCLUDE_FUTURE=1 npm run build` ;
   - `npm run check-links`.
8. **Publier les corrections**, seulement s'il y en a :
   - `git checkout -b claude/relecture-<slug>` ;
   - `git add src/content/actualites/<slug>.md` : aucun autre fichier ;
   - commit dont la première ligne est `Relecture : <titre>`. Le corps liste chaque correction sous la forme `- « avant » → « après » (raison ; source)` ;
   - `git push -u origin claude/relecture-<slug>`.

   Le workflow GitHub `publish-review.yml` vérifie que l'article n'est pas encore publié et que ses champs structurants n'ont pas bougé, relance les contrôles et intègre la correction à `main`. Ne pas ouvrir de pull request.

   S'il n'y a rien à corriger : ne rien pousser.
9. **Compte rendu** (en français, court) :
   - article(s) relu(s) ;
   - nombre d'affirmations vérifiées ;
   - corrections faites (avant → après, raison) ;
   - points laissés faute de pouvoir les vérifier, et pourquoi ;
   - état de l'illustration ;
   - branche poussée, ou « aucune correction ».
