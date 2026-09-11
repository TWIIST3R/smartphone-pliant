# Guide rédactionnel et technique — Smartphone-Pliant.fr

Ce guide s'applique à **toute nouvelle page**. Il est aussi le brief des rédacteurs (humains ou IA).

---

## 1. Contexte

- Site d'affiliation Amazon (tag `smartphone-pliant-21`) 100 % consacré aux smartphones pliants, marché français.
- Objectif : trafic SEO + citations dans les moteurs de réponse IA (Google AI Overviews, ChatGPT Search, Perplexity…) = **GEO**.
- Date de référence éditoriale : **11 septembre 2026**. L'iPhone Duo vient d'être annoncé (9 septembre 2026).
- Modèle de qualité : Les Numériques / Frandroid, ton journalistique, précis, avis argumentés.

## 2. Stack et fichiers

- Astro 7 en site statique. Aucune dépendance front. Build : `npx astro build`.
- Données produits : `src/data/phones.ts` (19 modèles, notes, fiches, prix de lancement). **Source de vérité pour les chiffres.**
- Arborescence du cocon : `src/data/cocoon.ts` (chemins, mère, groupe, libellés).
- Marques et réglages : `src/data/site.ts`.
- Gabarit : `src/layouts/BaseLayout.astro` (header, fil d'Ariane automatique, footer, JSON-LD Organization/WebSite).
- Composants : `src/components/*.astro`. Styles : `src/styles/global.css`.
- Pages modèles à lire avant d'écrire : `src/pages/index.astro` (mère), `src/pages/iphone-pliable/index.astro` (page marque), `src/pages/iphone-pliable/iphone-duo.astro` (fiche produit).

Emplacement des fichiers (trailingSlash `always`, format `directory`) :

| URL | Fichier |
|---|---|
| `/smartphone-pliant-clapet/` | `src/pages/smartphone-pliant-clapet.astro` |
| `/smartphone-pliant-samsung/` | `src/pages/smartphone-pliant-samsung/index.astro` |
| `/smartphone-pliant-samsung/galaxy-z-fold8-ultra/` | `src/pages/smartphone-pliant-samsung/galaxy-z-fold8-ultra.astro` |

**Ne modifiez pas** les fichiers partagés (data, composants, layout, CSS). Si un besoin apparaît, signalez-le. Un petit bloc `<style>` propre à une page est toléré.

## 3. Règles du cocon sémantique (contrôlées automatiquement)

Chaque page du cocon a une **mère** (`parent` dans cocoon.ts). Les **sœurs** ont la même mère ET le même `group`. Les **filles** ont la page pour mère.

1. **Lien vers la mère en haut de contenu** : le *premier* lien interne du contenu (hors fil d'Ariane) pointe vers la mère, dans le chapô ou le premier paragraphe, avec une ancre descriptive qui contient le mot-clé de la mère. Variez la formulation d'une page à l'autre.
2. **Liens vers toutes les filles** dans le corps du texte (en contexte). Sur une page marque, on peut en plus utiliser `PhoneCard linkToSheet` et `CompareTable linkNames` — **uniquement** là.
3. **Listing des sœurs en bas de contenu** avec `<Siblings path={path} heading="…" variant="list|chips|cards" />`. Des liens vers des sœurs dans le texte sont aussi permis.
4. **Aucun autre lien interne**. Pas de lien transversal : une page budget/usage/format ne lie **ni** les fiches produits **ni** les pages marques ; une fiche produit ne lie ni une autre marque ni un budget. Exceptions permises partout : `/methodologie/` et `/a-propos/`.
   **Liens obfusqués** : pour que le visiteur puisse ouvrir un test depuis n'importe quelle page sans casser le cocon, `PhoneCard` et `CompareTable` rendent par défaut le nom, la vignette et « Lire le test complet » en liens obfusqués (composant `ObfLink`, invisible comme lien pour les robots). Seule la page marque utilise de vrais liens (`linkToSheet` / `linkNames`). Dans le texte, pour citer un test hors silo de façon cliquable : `<ObfLink href="/chemin/" class="obf-text">texte</ObfLink>` (avec parcimonie).
5. Header, footer et fil d'Ariane sont automatiques : ne pas les ajouter.
6. Les liens Amazon ne comptent pas dans le cocon (externes, `rel="sponsored nofollow noopener"`).

Arbre actuel :

```
/ (comparatif global — mère)
├── format : /smartphone-pliant-clapet/ · /smartphone-pliant-format-livre/ · /smartphone-tri-pliant/
├── marque : /iphone-pliable/ · /smartphone-pliant-samsung/ · /smartphone-pliant-google-pixel/ · /smartphone-pliant-motorola-razr/ · /smartphone-pliant-honor/ · /smartphone-pliant-huawei/ · /smartphone-pliant-xiaomi/
│            └── produit : fiches (chemins dans phones.ts → `path`) + /iphone-pliable/iphone-duo-vs-galaxy-z-fold8/
├── budget : /smartphone-pliant-pas-cher/ · /smartphone-pliant-moins-de-1500-euros/ · /smartphone-pliant-moins-de-2000-euros/ · /smartphone-pliant-haut-de-gamme/
└── usage  : /smartphone-pliant-photo/ · /smartphone-pliant-travail/ · /smartphone-pliant-autonomie/ · /smartphone-pliant-gaming/ · /smartphone-pliant-resistant/
```

## 4. Composants

Imports relatifs depuis `src/pages/…` (ex. `../../components/X.astro` dans un sous-dossier).

| Composant | Props | Usage |
|---|---|---|
| `BaseLayout` | `title` (45–60 car., le suffixe « \| Smartphone-Pliant.fr » est ajouté), `description` (130–160 car.), `schema?` (tableau), `ogType?`, `noindex?` | Enveloppe de toute page |
| `Byline` | `minutes?`, `updated?`, `showDisclosure?` | Auteur + date + mention affiliation |
| `Siblings` | `path`, `heading`, `intro?`, `variant?` | Listing des sœurs (obligatoire) |
| `AmazonButton` | `phone?` ou `query?`, `label?`, `variant?: primary\|ghost\|text`, `size?: sm\|md` | Lien affilié |
| `PhoneCard` | `phone`, `rank?`, `linkToSheet?`, `headingLevel?`, `ctaLabel?`, `badge?` | Carte produit (note, specs clés, CTA) |
| `CompareTable` | `phones`, `caption`, `columns?` (format, score, price, screens, chip, battery, charge, camera, zoom, weight, thickness, ip), `id?`, `linkNames?`, `cta?` | Tableau comparatif |
| `SpecTable` | `phone`, `caption?` | Fiche technique complète |
| `ScoreBars` | `phone`, `showOverall?` | Note globale + barres par critère |
| `Score` | `value`, `size?` | Pastille de note |
| `ProsCons` | `pros`, `cons`, `prosTitle?`, `consTitle?` | Pour/contre |
| `KeyFacts` | `items: {label, value}[]` | Bandeau de chiffres clés |
| `Callout` | `variant?: info\|tip\|warn\|accent\|answer`, `title?` | Encadré (`answer` = réponse courte mise en avant) |
| `Faq` | `items: {q, a}[]` (texte brut), `heading?`, `id?`, `openFirst?` | FAQ + JSON-LD FAQPage (une seule par page) |
| `FoldIcon` | `format`, `color?`, `label?` | Silhouette SVG |

Helpers : `byId('galaxy-z-fold8')`, `ranked(list)`, `overall(phone)`, `phones`, `FORMAT_LABELS` (data/phones) ; `euro()`, `num()`, `frDate()`, `inches()`, `mah()`, `mm()` (lib/format) ; `article()`, `product()`, `itemList()` (lib/schema) ; `amazonUrl()`, `AFFILIATE_REL` (lib/affiliate) ; `brands` (data/site).

Classes CSS utiles : `wrap`, `prose`, `section`, `section-tight`, `band`, `eyebrow`, `lede`, `muted`, `small`, `cols-2` + `sticky` (colonne latérale), `grid` (+ `style="--min:240px"`), `card`, `tile-link`, `badge badge-accent|teal|gold`, `btn btn-amazon|btn-ghost`, `table-scroll`, `num`, `facts`, `stack`, `flex`, `timeline` (ol > li > time), `vs-grid` (+ `.vs`), `podium`, `hero`, `hero-split`, `toc`, `mt-0`, `mb-0`.

## 5. SEO et GEO

- **Réponse d'abord** : les 2–3 premières phrases répondent à l'intention de recherche avec des chiffres (prix, date, note, nom complet).
- **Paragraphes autoportants** : sous chaque H2, la première phrase répond au titre et reste compréhensible si elle est citée seule (répéter le nom du produit plutôt que « il »).
- **Entités complètes** : « Samsung Galaxy Z Fold8 Ultra », pas « le Fold ». Dates absolues (« 7 août 2026 »), jamais « récemment ».
- **Données en tableaux HTML** dès qu'il y a comparaison.
- Un seul H1, différent du `title`. H2 variés : affirmations, questions réelles, formules journalistiques.
- `schema` : `article()` sur toutes les pages ; `product(p)` en plus sur les fiches ; `itemList()` sur les classements.
- FAQ : questions telles qu'on les tape dans Google, réponses de 40 à 80 mots, autoportantes. 3 à 6 questions. Toutes les pages n'ont pas besoin d'une FAQ.
- Longueurs : page marque 1 500–2 200 mots ; fiche produit 1 000–1 600 ; pages format/budget/usage 1 400–2 200 ; tri-pliant et marques à gamme courte : 900–1 400.

## 6. Éviter l'empreinte « texte IA »

**Structures variées** : chaque page reçoit un gabarit de structure différent (voir l'attribution de votre lot). Variez aussi : présence/position de la colonne latérale, type d'encadré, titre de FAQ, variante et titre du listing de sœurs, libellés des boutons Amazon (« Voir le prix sur Amazon », « Consulter l'offre », « Vérifier la disponibilité », « Voir les coloris », etc.), texte de l'eyebrow.

**Style** : journaliste tech français, vouvoiement, phrases de longueur variée, avis tranché mais justifié, comparaisons concrètes (« 50 g de plus qu'un Flip8 »), un peu de relief. Listes à puces avec parcimonie.

**Interdits** : « Dans un monde où », « à l'ère de », « plongeons », « découvrons », « incontournable », « révolutionnaire », « véritable bijou », « must-have », « game changer », « que vous soyez X ou Y », « il est important de noter », « n'hésitez pas », « sans plus attendre », « en somme », « en conclusion », « tout simplement », « offre une expérience fluide », « se démarque » répété, avalanches de triplets, tirets cadratins en série, emojis, H2 « Conclusion » systématique.

## 7. Exactitude

- Chiffres : uniquement `phones.ts` et la fiche de faits ci-dessous. En cas de doute, ne pas écrire, ou vérifier par une recherche web fiable (site constructeur, GSMArena, presse tech FR).
- **Aucune prétention de test en main** : nous n'avons pas manipulé les appareils. Formulations : « sur le papier », « selon Samsung », « d'après les tests publiés ».
- **Prix** : uniquement les prix publics de lancement en France. Jamais de prix Amazon ni de « prix actuel » chiffré (règle du Programme Partenaires). On peut dire qu'un modèle ancien « se trouve souvent nettement moins cher ».
- Pas de benchmarks, d'heures d'autonomie ou de cycles de charnière inventés.

### Fiche de faits vérifiés (septembre 2026)

**Samsung** — Galaxy Z Fold8 Ultra, Z Fold8, Z Flip8 sortis le 7 août 2026. Prix : Fold8 Ultra 2 199 € (256 Go) / 2 399 € (512 Go) / 2 799 € (1 To) ; Fold8 1 999 / 2 199 / 2 399 € ; Flip8 1 299 € (256 Go) / 1 499 € (512 Go). Fold8 Ultra : charge 45 W (67 % en 30 min), capteur 200 Mpx, ultra grand-angle 50 Mpx, téléobjectif 10 Mpx x3, écran externe 6,5" 21:9, cadre Armor Aluminum, Android 17 / One UI 9 (comme le Fold8 et le Flip8), vidéo 8K, charnière « Flex » en titane. Fold8 : écran intérieur 7,6" au ratio 4:3 (format « large »), externe 5,5", 63 % en 30 min, pas de téléobjectif. Flip8 : Exynos 2600, 180 g, 6,1 mm déplié, externe 4,1", 4 300 mAh, 25 W / 15 W. Pas de Flip8 FE annoncé. Fold7/Flip7/Flip7 FE sortis le 25 juillet 2025 (Fold7 2 099 € en 256 Go, 2 219 € en 512 Go ; Flip7 1 199 € / 1 319 € ; Flip7 FE 999 € en 128 Go). Flip7 FE arrêté en juillet 2026. Samsung promet 7 ans de mises à jour Android sur ses pliants récents. Galaxy Z TriFold : lancé en Corée en décembre 2025 (date exacte variable selon les sources), pas de commercialisation officielle en France, production arrêtée en quelques mois selon la presse, uniquement via importateurs.

**Apple** — iPhone Duo annoncé le 9 septembre 2026 (première keynote de John Ternus comme PDG). Précommandes France 16 octobre 2026 à 14 h, sortie 23 octobre 2026. Prix : 2 339 € (256 Go), 2 589 € (512 Go), 3 089 € (1 To), 3 839 € (2 To) ; 1 999 $ aux États-Unis. Écrans 7,6" (430 ppi) et 5,4" (460 ppi) au même ratio, ProMotion 120 Hz, 3 000 cd/m². 254 g, 11,3 mm fermé, 5,2 mm ouvert. Titane grade 5, IP68 (6 m, 30 min), Ceramic Shield 2. A20 Pro (2 nm), double batterie : 24 h usage mixte, 31 h vidéo écran intérieur, 44 h vidéo écran extérieur. Charge 50 % en ~20 min (adaptateur 60 W), MagSafe/Qi2 25 W. Touch ID dans le bouton latéral (pas de Face ID). 48 Mpx principal + 48 Mpx ultra grand-angle, zoom x2 par recadrage, vidéo 4K120 Dolby Vision, caméra 12 Mpx Center Stage + caméra FaceTime sous l'écran intérieur. eSIM uniquement, Wi-Fi 7, iOS 27 avec deux apps côte à côte.

**Google** — Pixel 11 Pro Fold annoncé le 12 août 2026, en vente le 20 août 2026 : 1 999 € (256 Go), 2 129 € (512 Go), 2 389 € (1 To). Tensor G6, 16 Go, écrans 8" et 6,5" jusqu'à 3 600 cd/m², charnière sans engrenage, verre intérieur plus épais pour atténuer le pli, dos en composite de fibre de verre, IP68, 4 806 mAh, 30 W (50 % en 30 min), sans fil magnétique 25 W, 239 g, 10,1 mm plié, 48 Mpx + UGA 10,5 Mpx + télé 10,8 Mpx x5. Coloris noir et olive. Pixel 10 Pro Fold : 1 899 € (256 Go), en vente en France le 9 octobre 2025, premier pliant IP68, Tensor G5, 5 015 mAh, Qi2 15 W, 258 g.

**Motorola** — Razr 70, 70 Plus, 70 Ultra disponibles en France en mai 2026 (Razr 70 Ultra annoncé le 29 avril 2026). Razr 70 Ultra 1 499 € (16/512 Go) : écran 7" 165 Hz jusqu'à 5 000 cd/m² en HDR, externe 4" 165 Hz 3 000 cd/m², Snapdragon 8 Elite, 5 000 mAh silicium-carbone, 68 W / 30 W sans fil / charge inversée, trois capteurs 50 Mpx (principal, UGA, selfie), charnière titane, Gorilla Glass Ceramic, finitions Pantone bleu Alcantara ou bois naturel, 199 g, IP48. Razr 70 Plus 1 199 € (12/512 Go) : 6,9" et 4" 165 Hz, Snapdragon 8s Gen 3, 4 500 mAh, 45 W / 15 W / 5 W inversée, 50 + 50 Mpx, selfie 32 Mpx, 189 g. Razr 70 999 € (8/256 Go) : 6,9" 120 Hz, externe 3,63" 90 Hz, Dimensity 7450X, 4 800 mAh, 30 W / 15 W, 50 + 50 Mpx, selfie 32 Mpx, 188 g. Razr 60 Ultra : 1 299 € au lancement en 2025 (16/512 Go), Snapdragon 8 Elite, 4 700 mAh, 68 W / 30 W, 199 g. **Razr Fold** (format livre) : officialisé au MWC le 3 mars 2026, en vente en Europe depuis le 13 avril 2026 ; **en France, une seule configuration 16 Go / 512 Go à 2 199 €** (le 1 999 € en 12/256 Go annoncé en mars n'a pas été commercialisé en France), stylet Moto Pen Ultra fourni dans la boîte, écran intérieur 8,1" LTPO 120 Hz, externe 6,6" 165 Hz (Gorilla Glass Ceramic 3), jusqu'à 6 000 cd/m², Snapdragon 8 Gen 5, 12 ou 16 Go, 6 000 mAh silicium-carbone, 80 W / 50 W sans fil / 5 W inversée, trois capteurs 50 Mpx (principal f/1,6 stabilisé, téléobjectif x3 stabilisé, ultra grand-angle 122°), vidéo 8K30, 243 g, 9,89 mm plié / 4,55 mm déplié (fiche d'assistance Motorola ; GSMArena et Phonandroid donnent 10,1 / 4,7 mm), IP48/IP49, compatible stylet Moto Pen Ultra, 7 ans de mises à jour. Razr 70 : 3 versions d'Android ; la durée des correctifs de sécurité varie selon les sources (4 ans selon la page d'assistance Motorola citée par BGR, 5 à 6 ans pour l'Europe selon GSMArena) : toujours attribuer le chiffre à sa source.

**Honor** — Magic V6 disponible en France depuis le 2 juillet 2026, prix public 2 299,90 € (16/512 Go, seule configuration), offre de lancement à 1 699,90 € jusqu'au 31 juillet 2026. Snapdragon 8 Elite Gen 5, 6 660 mAh silicium-carbone (plus grosse batterie de pliant en Europe selon Honor), 80 W / 66 W sans fil, écrans 7,95" et 6,52" (6 000 cd/m² en externe), 50 + 50 + 64 Mpx périscope x3, selfies 20 Mpx, 8,75 mm plié / 4 mm déplié, 219 g (blanc) à 224 g, IP68 et IP69. Magic V5 : lancé en France le 28 août 2025 à 1 999,90 € (16/512 Go), 5 820 mAh, 66 W / 50 W, 8,8 mm plié, IP58/IP59.

**Huawei** — Mate X7 en France depuis le 21 janvier 2026 à 2 099 € (16/512 Go), remise de lancement de 250 €. Kirin 9030 Pro, écrans 8" et 6,49", 50 Mpx + UGA 40 Mpx + périscope 50 Mpx x3,5, 5 300 mAh (version européenne), 66 W / 50 W, 9,5 mm plié, 236 g, IP58/IP59, aluminium aéronautique. Sans services Google (sanctions américaines) et sans 5G. Mate XT Ultimate Design : lancement international en février 2025, 3 499 € en Europe (16 Go/1 To), écran 10,2" déplié, 7,9" en mode double, 6,4" plié, Kirin 9010, 5 600 mAh, 66 W / 50 W, 298 g, 3,6 mm déplié, sans Google ni 5G.

**Xiaomi** — Mix Flip : lancement international en septembre 2024 à 1 299 € (12/512 Go), Snapdragon 8 Gen 3, 4 780 mAh 67 W, écrans 6,86" et 4,01". Le Mix Flip 3 a été annulé ; Xiaomi privilégie un grand pliant. Mix Flip 2 (juin 2025) resté en Chine. Xiaomi 18 Fold présenté en Chine le 7 septembre 2026 (7,58" / 5,38", puce Xring O3, zoom x3,5), sans sortie européenne annoncée. Pas de nouveau pliant Xiaomi en France en 2026.

**Autres** — Oppo Find N6 (mars 2026, 8,93 mm plié) non commercialisé en France. Nubia Flip 3 lancé au Japon en janvier 2026, pas de sortie française confirmée.

## 8. Affiliation et conformité

- Liens Amazon uniquement via `AmazonButton` ou `amazonUrl()` + `AFFILIATE_REL` + `target="_blank"`.
- 3 à 8 liens Amazon par page, placés là où la décision se prend.
- `Byline` (qui contient la mention d'affiliation) en haut de toutes les pages éditoriales.

## 8 bis. Tests complets (fiches produits)

Les fiches produits sont des **tests complets rédigés comme des synthèses sourcées**.

- **Titre et H1** : « Test du … », « … : test complet » ou « Avis et test … » sont permis.
- **Interdit** : toute formulation qui laisse croire à une prise en main par la rédaction (« nous avons testé », « pendant notre semaine d'utilisation », « dans notre main », « nous avons mesuré »).
- **Formulations à utiliser** : « Les Numériques a mesuré… », « d'après le test de Frandroid… », « les tests publiés s'accordent sur… », « sur le papier… ».
- **Mesures** : autonomie, luminosité, temps de charge, benchmarks, pli… Toujours reprises d'un test publié, avec le média et un lien, dans le composant `Measures`. Aucun chiffre inventé ni extrapolé.
- **Verdicts des médias** : composant `TestSources` avec 3 à 5 médias. Notes telles que publiées, verdict **reformulé** en une ou deux phrases, lien vers le test.
- **Droit d'auteur** : aucune phrase copiée. Au plus une citation courte (moins de 15 mots) par source, entre guillemets et attribuée. Résumer, comparer, analyser.
- **Liens sortants** vers les tests cités : `target="_blank" rel="noopener"`, sans nofollow. Ils ne comptent pas dans le cocon.
- **Blocs attendus** :
  - image d'en-tête `<PhoneImage id="…" variant="hero" eager />` ;
  - verdict ;
  - sections design, écrans, performances, photo, autonomie et charge, logiciel et suivi, prix et alternatives dans le silo ;
  - `Measures` ;
  - `TestSources` ;
  - `ScoreBars`, `SpecTable`, `ProsCons` ;
  - FAQ ;
  - `Siblings`.
- **Structures variées** : ordre, intertitres et encadrés différents d'un test à l'autre. Conservez l'angle propre à chaque page existante.
- **Images** : `<PhoneImage id="…" variant="figure" index={1} />` dans le texte, par exemple dans la section design. Si l'image n'existe pas, rien ne s'affiche. Ne jamais décrire une image dans le texte (« comme on le voit sur la photo »).
- **Schema** : `article()` + `product(p)` + `review(p)`.
- **Longueur** : 2 000 à 3 200 mots.
- **Modèle pas encore sorti** (iPhone Duo) : pas de test, uniquement un aperçu sur fiche technique, jusqu'aux premiers tests publiés.

### Test « hyper complet » : contenu minimal (version 2)

3 500 à 4 500 mots. L'ordre et les intertitres restent libres et variés d'une page à l'autre, mais chaque test couvre :

1. **`<ProductSummary phone={p} />` juste sous le H1**, avant le chapô. Il affiche la grande photo, la note, le prix de lancement, la date de sortie, les chiffres clés et le bouton Amazon, visibles sans défiler. Il remplace l'ancien `<PhoneImage variant="hero">` : ne pas afficher deux fois la photo principale.
2. **Verdict** détaillé en 5 à 6 phrases, avec pour qui et pas pour qui.
3. **Design et prise en main** :
   - dimensions ouvert et fermé, poids, matériaux ;
   - coloris vendus en France ;
   - charnière, pli (d'après les tests), ouverture à une main, mode Flex ou chevalet ;
   - `<PhoneGallery id="…" />`, qui ne s'affiche que s'il y a plusieurs photos.
4. **Écrans intérieur et extérieur** : définition, fréquence, luminosité mesurée, pli, reflets, confort de l'écran externe.
5. **Performances et jeu** : puce, benchmarks publiés, jeux cités par la presse, chauffe et stabilité.
6. **Logiciel, IA et mises à jour** : version, surcouche, fonctions propres au pliant (multifenêtre, apps continues, bureau), durée de suivi.
7. **Photo et vidéo** :
   - rôle de chaque capteur ;
   - rendu de jour, de nuit, en zoom, en portrait et en selfie avec le capteur principal, d'après les tests ;
   - vidéo.
8. **Autonomie et recharge** : mesures publiées, temps de charge, sans fil, chargeur fourni ou non.
9. **Audio, connectivité, biométrie** : haut-parleurs, 5G, Wi-Fi, Bluetooth, NFC, eSIM ou nano-SIM, capteur d'empreinte ou reconnaissance faciale.
10. **Solidité et réparabilité** :
   - indice IP, verres, durabilité de charnière annoncée ;
   - étiquette énergie UE (classe de réparabilité, résistance aux chutes, cycles de batterie) si publiée ;
   - offre de protection d'écran du constructeur si elle existe.
11. **Contenu de la boîte et accessoires** (coques, stylet, chargeur).
12. **Versions, coloris et prix de lancement en France** (tableau) et conseil d'achat, sans prix actuel chiffré.
13. **Face à la concurrence** : 3 ou 4 alternatives argumentées.
   - même marque : vrais liens ;
   - autres marques : texte, `ObfLink` ou `AmazonButton`.
14. **`Measures`** (8 lignes ou plus si les données existent) et **`TestSources`** (4 à 6 médias).
15. **`ScoreBars`**, **`SpecTable`**, **`ProsCons`** (au moins 5 points forts et 4 points faibles), **FAQ** de 6 à 8 questions, **`Siblings`**.
16. **4 à 6 `AmazonButton`**, aux endroits où le lecteur se décide.

## 8 ter. Auteur

Toutes les pages sont signées **Théo Marceau** (nom de plume, avatar illustré, page `/auteur/theo-marceau/`). Ne lui attribuez ni diplôme, ni expérience professionnelle, ni prise en main d'appareil.

## 9. Vérification avant livraison

```bash
npx astro build --outDir <dossier-temporaire-unique>
node scripts/check-links.mjs <dossier-temporaire-unique> --only=/page-1/,/page-2/
```

`--only` limite le contrôle à vos pages ; les liens vers des pages d'autres lots pas encore écrites apparaissent en avertissement, pas en erreur. Plusieurs builds peuvent tourner en parallèle : en cas d'erreur de cache (EBUSY, ENOENT dans `.astro` ou `node_modules/.vite`), relancez une fois.
