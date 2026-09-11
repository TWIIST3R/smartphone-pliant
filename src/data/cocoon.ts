// Structure du cocon sémantique.
// Chaque page déclare sa mère (`parent`). Les sœurs = pages ayant la même mère
// ET le même `group` (sous-cocon). Les filles = pages dont `parent` est la page.
// Ce fichier pilote le fil d'Ariane, le lien vers la mère, les listings de sœurs
// et le script de vérification du maillage (scripts/check-links.mjs).

export type Group = 'root' | 'format' | 'marque' | 'budget' | 'usage' | 'produit' | 'legal';

export interface CocoonNode {
  path: string;
  /** Ancre courte utilisée dans les listings et le fil d'Ariane */
  label: string;
  /** Titre long (listings de sœurs) */
  title: string;
  /** Accroche d'une ligne pour les listings */
  teaser: string;
  parent: string | null;
  group: Group;
}

export const nodes: CocoonNode[] = [
  { path: '/', label: 'Accueil', title: 'Comparatif smartphones pliants', teaser: '', parent: null, group: 'root' },

  // ——— Sous-cocon : formats ———
  { path: '/smartphone-pliant-clapet/', label: 'Pliants à clapet', title: 'Smartphone pliant à clapet', teaser: 'Galaxy Z Flip, Razr : le pliant qui tient dans une poche de jean.', parent: '/', group: 'format' },
  { path: '/smartphone-pliant-format-livre/', label: 'Pliants format livre', title: 'Smartphone pliant format livre', teaser: 'Fold, iPhone Duo, Magic V : une tablette qui se referme.', parent: '/', group: 'format' },
  { path: '/smartphone-tri-pliant/', label: 'Tri-pliants', title: 'Smartphone tri-pliant', teaser: 'Deux charnières, un écran de 10 pouces : où en est le format ?', parent: '/', group: 'format' },

  // ——— Sous-cocon : marques ———
  { path: '/iphone-pliable/', label: 'iPhone pliable', title: 'iPhone pliable : l’iPhone Duo', teaser: 'Tout sur le premier pliant d’Apple, prix et sortie en France.', parent: '/', group: 'marque' },
  { path: '/smartphone-pliant-samsung/', label: 'Samsung', title: 'Smartphones pliants Samsung', teaser: 'Fold8 Ultra, Fold8, Flip8 : quelle Galaxy Z choisir ?', parent: '/', group: 'marque' },
  { path: '/smartphone-pliant-google-pixel/', label: 'Google Pixel', title: 'Pixel Fold de Google', teaser: 'Pixel 11 Pro Fold ou 10 Pro Fold : le pliant photo et IA.', parent: '/', group: 'marque' },
  { path: '/smartphone-pliant-motorola-razr/', label: 'Motorola Razr', title: 'Motorola Razr pliants', teaser: 'Razr 70, 70 Plus, 70 Ultra et Razr Fold : la gamme la plus large.', parent: '/', group: 'marque' },
  { path: '/smartphone-pliant-honor/', label: 'Honor', title: 'Smartphones pliants Honor', teaser: 'Magic V6 et V5 : batteries géantes et finesse record.', parent: '/', group: 'marque' },
  { path: '/smartphone-pliant-huawei/', label: 'Huawei', title: 'Smartphones pliants Huawei', teaser: 'Mate X7 et Mate XT : du très haut de gamme sans Google.', parent: '/', group: 'marque' },
  { path: '/smartphone-pliant-xiaomi/', label: 'Xiaomi', title: 'Smartphones pliants Xiaomi', teaser: 'Mix Flip, 18 Fold réservé à la Chine : l’état de la gamme en France.', parent: '/', group: 'marque' },

  // ——— Sous-cocon : budgets ———
  { path: '/smartphone-pliant-pas-cher/', label: 'Moins de 1 000 €', title: 'Smartphone pliant pas cher', teaser: 'Les pliants à moins de 1 000 € qui valent vraiment le coup.', parent: '/', group: 'budget' },
  { path: '/smartphone-pliant-moins-de-1500-euros/', label: 'Moins de 1 500 €', title: 'Smartphone pliant à moins de 1 500 €', teaser: 'Le cœur du marché : Razr 70 Ultra, Flip8 et clapets haut de gamme.', parent: '/', group: 'budget' },
  { path: '/smartphone-pliant-moins-de-2000-euros/', label: 'Moins de 2 000 €', title: 'Smartphone pliant à moins de 2 000 €', teaser: 'Format livre haut de gamme sans dépasser 2 000 €.', parent: '/', group: 'budget' },
  { path: '/smartphone-pliant-haut-de-gamme/', label: 'Plus de 2 000 €', title: 'Smartphone pliant haut de gamme', teaser: 'iPhone Duo, Fold8 Ultra, Magic V6 : le meilleur, sans limite.', parent: '/', group: 'budget' },

  // ——— Sous-cocon : usages ———
  { path: '/smartphone-pliant-photo/', label: 'Photo', title: 'Meilleur smartphone pliant pour la photo', teaser: 'Zoom, capteurs, mode selfie arrière : le classement photo.', parent: '/', group: 'usage' },
  { path: '/smartphone-pliant-travail/', label: 'Travail et multitâche', title: 'Smartphone pliant pour travailler', teaser: 'Multi-fenêtres, clavier, DeX : les pliants de la productivité.', parent: '/', group: 'usage' },
  { path: '/smartphone-pliant-autonomie/', label: 'Autonomie', title: 'Smartphone pliant avec la meilleure autonomie', teaser: 'mAh, charge rapide, sans-fil : ceux qui tiennent deux jours.', parent: '/', group: 'usage' },
  { path: '/smartphone-pliant-gaming/', label: 'Jeu vidéo', title: 'Smartphone pliant pour le gaming', teaser: 'Puces, grand écran, refroidissement : jouer sur un pliant.', parent: '/', group: 'usage' },
  { path: '/smartphone-pliant-resistant/', label: 'Résistance', title: 'Smartphone pliant résistant et étanche', teaser: 'IP68, IP48, charnière : quel pliant survit au quotidien ?', parent: '/', group: 'usage' },

  // ——— Petites-filles : fiches produits (mère = page marque) ———
  { path: '/iphone-pliable/iphone-duo/', label: 'iPhone Duo', title: 'Apple iPhone Duo', teaser: 'Fiche complète, prix et avis sur le premier iPhone pliable.', parent: '/iphone-pliable/', group: 'produit' },
  { path: '/iphone-pliable/iphone-duo-vs-galaxy-z-fold8/', label: 'iPhone Duo vs Galaxy Z Fold8', title: 'iPhone Duo vs Galaxy Z Fold8', teaser: 'Le duel des pliants « larges » : lequel choisir ?', parent: '/iphone-pliable/', group: 'produit' },

  { path: '/smartphone-pliant-samsung/galaxy-z-fold8-ultra/', label: 'Galaxy Z Fold8 Ultra', title: 'Samsung Galaxy Z Fold8 Ultra', teaser: '200 Mpx, 5 000 mAh, 8 pouces : la fiche complète.', parent: '/smartphone-pliant-samsung/', group: 'produit' },
  { path: '/smartphone-pliant-samsung/galaxy-z-fold8/', label: 'Galaxy Z Fold8', title: 'Samsung Galaxy Z Fold8', teaser: 'Le Fold au format large 4:3.', parent: '/smartphone-pliant-samsung/', group: 'produit' },
  { path: '/smartphone-pliant-samsung/galaxy-z-flip8/', label: 'Galaxy Z Flip8', title: 'Samsung Galaxy Z Flip8', teaser: '180 g et 6,1 mm : le Flip le plus fin.', parent: '/smartphone-pliant-samsung/', group: 'produit' },
  { path: '/smartphone-pliant-samsung/galaxy-z-fold7/', label: 'Galaxy Z Fold7', title: 'Samsung Galaxy Z Fold7', teaser: 'L’ancien Fold vaut-il encore le coup ?', parent: '/smartphone-pliant-samsung/', group: 'produit' },
  { path: '/smartphone-pliant-samsung/galaxy-z-flip7/', label: 'Galaxy Z Flip7', title: 'Samsung Galaxy Z Flip7', teaser: 'Presque un Flip8, en moins cher.', parent: '/smartphone-pliant-samsung/', group: 'produit' },
  { path: '/smartphone-pliant-samsung/galaxy-z-flip7-fe/', label: 'Galaxy Z Flip7 FE', title: 'Samsung Galaxy Z Flip7 FE', teaser: 'Le Samsung pliant le plus abordable.', parent: '/smartphone-pliant-samsung/', group: 'produit' },

  { path: '/smartphone-pliant-google-pixel/pixel-11-pro-fold/', label: 'Pixel 11 Pro Fold', title: 'Google Pixel 11 Pro Fold', teaser: 'Zoom x5, IP68 et Tensor G6.', parent: '/smartphone-pliant-google-pixel/', group: 'produit' },
  { path: '/smartphone-pliant-google-pixel/pixel-10-pro-fold/', label: 'Pixel 10 Pro Fold', title: 'Google Pixel 10 Pro Fold', teaser: 'Le premier pliant IP68, à prix réduit.', parent: '/smartphone-pliant-google-pixel/', group: 'produit' },

  { path: '/smartphone-pliant-motorola-razr/razr-70-ultra/', label: 'Razr 70 Ultra', title: 'Motorola Razr 70 Ultra', teaser: 'Snapdragon 8 Elite et 165 Hz.', parent: '/smartphone-pliant-motorola-razr/', group: 'produit' },
  { path: '/smartphone-pliant-motorola-razr/razr-70-plus/', label: 'Razr 70 Plus', title: 'Motorola Razr 70 Plus', teaser: 'Le milieu de gamme de la famille.', parent: '/smartphone-pliant-motorola-razr/', group: 'produit' },
  { path: '/smartphone-pliant-motorola-razr/razr-70/', label: 'Razr 70', title: 'Motorola Razr 70', teaser: 'Le clapet à 999 €.', parent: '/smartphone-pliant-motorola-razr/', group: 'produit' },
  { path: '/smartphone-pliant-motorola-razr/razr-60-ultra/', label: 'Razr 60 Ultra', title: 'Motorola Razr 60 Ultra', teaser: 'L’Ultra 2025 à prix cassé.', parent: '/smartphone-pliant-motorola-razr/', group: 'produit' },
  { path: '/smartphone-pliant-motorola-razr/razr-fold/', label: 'Razr Fold', title: 'Motorola Razr Fold', teaser: 'Le premier Motorola au format livre.', parent: '/smartphone-pliant-motorola-razr/', group: 'produit' },

  { path: '/smartphone-pliant-honor/magic-v6/', label: 'Honor Magic V6', title: 'Honor Magic V6', teaser: '6 660 mAh et IP69.', parent: '/smartphone-pliant-honor/', group: 'produit' },
  { path: '/smartphone-pliant-honor/magic-v5/', label: 'Honor Magic V5', title: 'Honor Magic V5', teaser: 'Le rapport qualité/prix en format livre.', parent: '/smartphone-pliant-honor/', group: 'produit' },

  { path: '/smartphone-pliant-huawei/mate-x7/', label: 'Huawei Mate X7', title: 'Huawei Mate X7', teaser: 'Photo et étanchéité, sans Google.', parent: '/smartphone-pliant-huawei/', group: 'produit' },
  { path: '/smartphone-pliant-huawei/mate-xt/', label: 'Huawei Mate XT', title: 'Huawei Mate XT Ultimate Design', teaser: 'Le tri-pliant de 10,2 pouces.', parent: '/smartphone-pliant-huawei/', group: 'produit' },

  { path: '/smartphone-pliant-xiaomi/mix-flip/', label: 'Xiaomi Mix Flip', title: 'Xiaomi Mix Flip', teaser: 'Le clapet puissant souvent bradé.', parent: '/smartphone-pliant-xiaomi/', group: 'produit' },

  // ——— Pages hors cocon (liens de pied de page) ———
  { path: '/a-propos/', label: 'À propos', title: 'À propos', teaser: '', parent: null, group: 'legal' },
  { path: '/auteur/theo-marceau/', label: 'L’auteur', title: 'Théo Marceau', teaser: '', parent: null, group: 'legal' },
  { path: '/credits-images/', label: 'Crédits photos', title: 'Crédits photos', teaser: '', parent: null, group: 'legal' },
  { path: '/methodologie/', label: 'Méthodologie', title: 'Notre méthodologie', teaser: '', parent: null, group: 'legal' },
  { path: '/mentions-legales/', label: 'Mentions légales', title: 'Mentions légales', teaser: '', parent: null, group: 'legal' },
  { path: '/confidentialite/', label: 'Confidentialité', title: 'Politique de confidentialité', teaser: '', parent: null, group: 'legal' },
];

const byPath = new Map(nodes.map((n) => [n.path, n]));

export function node(path: string): CocoonNode {
  const n = byPath.get(path);
  if (!n) throw new Error(`Page absente du cocon : ${path}`);
  return n;
}

export function parentOf(path: string): CocoonNode | null {
  const n = node(path);
  return n.parent ? node(n.parent) : null;
}

export function childrenOf(path: string, group?: Group): CocoonNode[] {
  return nodes.filter((n) => n.parent === path && (!group || n.group === group));
}

export function siblingsOf(path: string): CocoonNode[] {
  const n = node(path);
  if (!n.parent) return [];
  return nodes.filter((s) => s.parent === n.parent && s.group === n.group && s.path !== path);
}

export function ancestors(path: string): CocoonNode[] {
  const chain: CocoonNode[] = [];
  let current = parentOf(path);
  while (current) {
    chain.unshift(current);
    current = current.parent ? node(current.parent) : null;
  }
  return chain;
}
