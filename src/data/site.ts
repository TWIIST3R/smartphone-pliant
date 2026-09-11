export const SITE = {
  name: 'Smartphone-Pliant.fr',
  url: 'https://smartphone-pliant.fr',
  locale: 'fr_FR',
  lang: 'fr',
  amazonTag: 'smartphone-pliant-21',
  /** Date de dernière révision éditoriale globale (AAAA-MM-JJ) */
  updated: '2026-09-11',
  published: '2026-09-11',
  author: {
    name: 'Théo Marceau',
    url: '/auteur/theo-marceau/',
    avatar: '/images/theo-marceau.svg',
    jobTitle: 'Rédacteur en chef',
    bio: 'Théo Marceau signe les comparatifs, guides et tests de Smartphone-Pliant.fr. Il suit chaque lancement de smartphone pliant et croise fiches constructeurs et mesures publiées par la presse spécialisée.',
  },
  description:
    "Comparatif indépendant des smartphones pliants : iPhone Duo, Galaxy Z Fold8, Z Flip8, Pixel 11 Pro Fold, Razr 70, Honor Magic V6. Fiches, prix de lancement et guides d'achat.",
};

export const brands = {
  samsung: { name: 'Samsung', path: '/smartphone-pliant-samsung/', color: '#1428a0' },
  apple: { name: 'Apple', path: '/iphone-pliable/', color: '#6e6e73' },
  google: { name: 'Google', path: '/smartphone-pliant-google-pixel/', color: '#1a73e8' },
  motorola: { name: 'Motorola', path: '/smartphone-pliant-motorola-razr/', color: '#5c2d91' },
  honor: { name: 'Honor', path: '/smartphone-pliant-honor/', color: '#0a7c6f' },
  huawei: { name: 'Huawei', path: '/smartphone-pliant-huawei/', color: '#c7000b' },
  xiaomi: { name: 'Xiaomi', path: '/smartphone-pliant-xiaomi/', color: '#ff6900' },
} as const;
