// Images des smartphones.
//
// UTILISATION SIMPLE : déposez les photos dans src/assets/phones/<id-du-telephone>/
//   1.jpg = image principale (vignette du comparatif, cartes, en-tête du test)
//   2.jpg = vue secondaire affichée dans le texte du test
//   3.jpg, 4.jpg… = vues supplémentaires
// Formats acceptés : jpg, jpeg, png, webp, avif. Elles sont détectées automatiquement au build.
//
// OPTION : pour un texte alternatif précis ou un crédit photo, déclarez les images dans `phoneImages`.
// Les modèles sans image affichent la silhouette de leur format.
import type { ImageMetadata } from 'astro';
import { phones } from './phones';

export type ImageKind = 'photo' | 'presse' | 'illustration';

export interface PhoneImageEntry {
  /** Chemin relatif à src/assets/, ex. « phones/galaxy-z-fold8-ultra/1.jpg » */
  file: string;
  alt: string;
  kind: ImageKind;
  /** Auteur ou détenteur des droits (affiché en légende si renseigné) */
  credit?: string;
  license?: string;
  licenseUrl?: string;
  sourceUrl?: string;
  role?: 'principale' | 'galerie';
}

/** Déclarations manuelles facultatives (prioritaires sur la détection automatique) */
export const phoneImages: Record<string, PhoneImageEntry[]> = {};

/** Photos d'ambiance facultatives, dans src/assets/ambiance/ */
export const ambianceImages: Record<string, PhoneImageEntry> = {};

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}', {
  eager: true,
});

export interface ResolvedImage extends PhoneImageEntry {
  src: ImageMetadata;
}

function resolve(entry: PhoneImageEntry): ResolvedImage | null {
  const mod = files[`../assets/${entry.file}`];
  return mod ? { ...entry, src: mod.default } : null;
}

/** Images trouvées dans src/assets/phones/<id>/, triées par nom (1, 2, 3… puis alphabétique) */
function discovered(id: string): PhoneImageEntry[] {
  const prefix = `../assets/phones/${id}/`;
  const name = phones.find((p) => p.id === id)?.fullName ?? id;
  return Object.keys(files)
    .filter((k) => k.startsWith(prefix) && !k.slice(prefix.length).includes('/'))
    .sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }))
    .map((k, i) => ({
      file: k.slice('../assets/'.length),
      alt: i === 0 ? name : `${name}, vue ${i + 1}`,
      kind: 'photo' as const,
      role: i === 0 ? ('principale' as const) : ('galerie' as const),
    }));
}

export function imagesFor(id: string): ResolvedImage[] {
  const declared = phoneImages[id];
  const entries = declared && declared.length > 0 ? declared : discovered(id);
  return entries.map(resolve).filter((x): x is ResolvedImage => x !== null);
}

export function mainImage(id: string): ResolvedImage | null {
  const list = imagesFor(id);
  return list.find((i) => i.role === 'principale') ?? list[0] ?? null;
}

export function ambiance(key: string): ResolvedImage | null {
  const entry = ambianceImages[key];
  return entry ? resolve(entry) : null;
}

/** Images créditées (pour la page /credits-images/) */
export function allImages(): { id: string | null; image: ResolvedImage }[] {
  const phoneList = phones.flatMap((p) => imagesFor(p.id).map((image) => ({ id: p.id, image })));
  const amb = Object.keys(ambianceImages)
    .map((k) => ambiance(k))
    .filter((x): x is ResolvedImage => x !== null)
    .map((image) => ({ id: null, image }));
  return [...phoneList, ...amb].filter(({ image }) => Boolean(image.credit));
}
