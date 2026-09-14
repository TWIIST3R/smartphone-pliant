#!/usr/bin/env node
// Récupère une photo officielle d'un dossier de presse constructeur pour l'en-tête d'un article.
// Seules les salles de presse autorisées dans src/data/salles-de-presse.json sont acceptées
// (conditions d'usage éditorial vérifiées, domaines des pages et des images listés).
//
// Usage : node scripts/fetch-press-image.mjs --slug <slug> --brand <clé> --page <URL de la page presse> --image <URL du fichier image>
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';

const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};
const [slug, brandKey, page, imageUrl] = ['slug', 'brand', 'page', 'image'].map(arg);
if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || !brandKey || !page || !imageUrl) {
  console.error('Usage : node scripts/fetch-press-image.mjs --slug <slug> --brand <clé> --page <URL page presse> --image <URL image>');
  process.exit(1);
}

const rooms = JSON.parse(readFileSync('src/data/salles-de-presse.json', 'utf8'));
const room = rooms.find((r) => r.brand === brandKey);
if (!room) {
  console.error(`Marque « ${brandKey} » inconnue. Clés disponibles : ${rooms.map((r) => r.brand).join(', ')}`);
  process.exit(1);
}
if (!room.autorise) {
  console.error(`Refusé : les photos de presse ${room.name} ne sont pas autorisées (${room.raison}).`);
  process.exit(1);
}

const hostOk = (url, domains) => {
  let host;
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') return false;
    host = u.hostname;
  } catch {
    return false;
  }
  return domains.some((d) => host === d || host.endsWith(`.${d}`));
};
const prefixOk = (url, prefixes) => !prefixes?.length || prefixes.some((p) => url.startsWith(p));
if (!hostOk(page, room.pageDomains) || !prefixOk(page, room.pagePrefixes)) {
  console.error(`Refusé : la page ${page} n'est pas dans l'espace presse autorisé ${room.name} (${(room.pagePrefixes ?? room.pageDomains).join(', ')}).`);
  process.exit(1);
}
if (!hostOk(imageUrl, room.imageDomains) || !prefixOk(imageUrl, room.imagePrefixes)) {
  console.error(`Refusé : l'image ${imageUrl} n'est pas servie par l'espace presse autorisé ${room.name} (${(room.imagePrefixes ?? room.imageDomains).join(', ')}).`);
  process.exit(1);
}

const out = `src/content/actualites/images/${slug}.webp`;
if (existsSync(out)) {
  console.error(`Refusé : ${out} existe déjà (une seule illustration par article).`);
  process.exit(1);
}

let image;
try {
  image = execFileSync('curl', ['-sSfL', '--max-time', '120', '--max-filesize', '30000000', imageUrl], { maxBuffer: 40 * 1024 * 1024 });
} catch (e) {
  console.error(`Téléchargement impossible : ${e.message}`);
  process.exit(1);
}

let info;
try {
  // Pas de recadrage ni de retouche : simple redimensionnement et conversion (les conditions interdisent souvent la modification).
  mkdirSync('src/content/actualites/images', { recursive: true });
  info = await sharp(image).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 85 }).toFile(out);
} catch (e) {
  console.error(`Le fichier téléchargé n'est pas une image exploitable : ${e.message}`);
  process.exit(1);
}
console.log(`Photo enregistrée : ${out} (${info.width}x${info.height}, ${Math.round(info.size / 1024)} Ko)`);
console.log('Ligne à ajouter au frontmatter (décrire la photo en français dans alt) :');
console.log(`cover: { src: "./images/${slug}.webp", alt: "…", credit: "${room.credit}", kind: photo-presse, sourceUrl: "${page}" }`);
