#!/usr/bin/env node
// Génère l'illustration d'en-tête d'un article avec l'API Images d'OpenAI et l'enregistre en WebP.
//
// Usage : node scripts/generate-cover.mjs --slug <slug> --prompt "<scène à illustrer, en anglais>"
//
// Clé API :
//   - dans l'environnement cloud de la routine : identifiant « API credentials » (hôte api.openai.com),
//     ajouté automatiquement aux requêtes par le proxy, sans variable d'environnement ;
//   - en local : variable OPENAI_API_KEY (fichier .env non versionné).
// Réglages facultatifs : OPENAI_IMAGE_MODEL (gpt-image-2), OPENAI_IMAGE_SIZE (1536x1024), OPENAI_IMAGE_QUALITY (medium).
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';

const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};
const slug = arg('slug');
const scene = arg('prompt');
if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || !scene) {
  console.error('Usage : node scripts/generate-cover.mjs --slug <slug> --prompt "<scene description in English>"');
  process.exit(1);
}

// Illustration générique uniquement : aucune marque, aucun modèle réel, aucun logo, aucune personne identifiable.
const FORBIDDEN =
  /\b(apple|iphone|ipad|samsung|galaxy|google|pixel|android|motorola|razr|honor|huawei|mate|xiaomi|oppo|oneplus|vivo|sony|nokia|nothing phone|logo|logos|brand|trademark|celebrity|famous|politician)\b/i;
if (FORBIDDEN.test(scene)) {
  console.error(`Refusé : la description contient « ${scene.match(FORBIDDEN)[0]} ». Décrire une scène générique, sans marque, modèle, logo ni personne connue.`);
  process.exit(1);
}

const out = `src/content/actualites/images/${slug}.webp`;
if (existsSync(out)) {
  console.error(`Refusé : ${out} existe déjà (une seule illustration par article).`);
  process.exit(1);
}

const STYLE = [
  'Editorial illustration for a French consumer-technology magazine.',
  'Clean modern 3D render, soft studio lighting, generous negative space.',
  'Palette: dark charcoal background (#15171c), muted teal (#0f6d63) and warm orange (#e2471b) accents, off-white highlights.',
  'Generic, unbranded devices only. No logos, no brand names, no text, letters or numbers, no watermark, no real app interfaces.',
  'No identifiable real person; hands or silhouettes are fine.',
].join(' ');

const payload = JSON.stringify({
  model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2',
  prompt: `${STYLE}\n\nScene: ${scene}`,
  size: process.env.OPENAI_IMAGE_SIZE || '1536x1024',
  quality: process.env.OPENAI_IMAGE_QUALITY || 'medium',
  n: 1,
});

// curl plutôt que fetch : il respecte le proxy (HTTPS_PROXY) et le magasin de certificats de l'environnement cloud.
const curlArgs = ['-sS', '-X', 'POST', 'https://api.openai.com/v1/images/generations', '-H', 'Content-Type: application/json', '--data-binary', '@-', '-w', '\n%{http_code}', '--max-time', '300'];
if (process.env.OPENAI_API_KEY) curlArgs.push('-H', `Authorization: Bearer ${process.env.OPENAI_API_KEY}`);

let raw;
try {
  raw = execFileSync('curl', curlArgs, { input: payload, encoding: 'utf8', maxBuffer: 80 * 1024 * 1024 });
} catch (e) {
  console.error(`Appel à l'API impossible : ${e.message}`);
  process.exit(1);
}
const status = Number(raw.slice(raw.lastIndexOf('\n') + 1));
let json = {};
try {
  json = JSON.parse(raw.slice(0, raw.lastIndexOf('\n')));
} catch {
  /* réponse non JSON */
}
if (status !== 200) {
  console.error(`Erreur API OpenAI (HTTP ${status}) : ${json.error?.message ?? 'réponse illisible'}`);
  if (status === 401) console.error('Clé absente ou invalide : vérifier l\'identifiant « API credentials » de l\'environnement (hôte api.openai.com) ou OPENAI_API_KEY.');
  process.exit(1);
}

const item = json.data?.[0];
let image;
if (item?.b64_json) image = Buffer.from(item.b64_json, 'base64');
else if (item?.url) image = execFileSync('curl', ['-sS', '--max-time', '120', item.url], { maxBuffer: 80 * 1024 * 1024 });
if (!image) {
  console.error('Réponse de l\'API sans image.');
  process.exit(1);
}

mkdirSync('src/content/actualites/images', { recursive: true });
const info = await sharp(image).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out);
console.log(`Illustration enregistrée : ${out} (${info.width}x${info.height}, ${Math.round(info.size / 1024)} Ko)`);
console.log('Ligne à ajouter au frontmatter (décrire l\'image en français dans alt) :');
console.log(`cover: { src: "./images/${slug}.webp", alt: "…", credit: "Illustration générée par IA (OpenAI)", kind: illustration-ia }`);
