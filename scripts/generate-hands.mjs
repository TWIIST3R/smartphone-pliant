#!/usr/bin/env node
// Génère, pour chaque modèle, une illustration « en main » à partir de la photo produit (src/assets/phones/<id>/1.*)
// avec l'API Images d'OpenAI (endpoint d'édition), et l'enregistre dans src/assets/mains/<id>.webp.
// Les images sont affichées sur les tests avec la légende « Illustration générée par IA ».
//
// Usage : node scripts/generate-hands.mjs [--id <id>[,<id>…]] [--force]
// Clé API : « API credentials » de l'environnement cloud (hôte api.openai.com) ou OPENAI_API_KEY en local.
// Réglages facultatifs : OPENAI_IMAGE_MODEL (gpt-image-2), OPENAI_IMAGE_QUALITY (medium).
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};
const force = process.argv.includes('--force');

// Formats lus dans phones.ts (sans exécuter le TypeScript)
const src = readFileSync('src/data/phones.ts', 'utf8');
const models = [...src.matchAll(/^\s{4}id: '([^']+)',[\s\S]*?^\s{4}fullName: '([^']+)',[\s\S]*?^\s{4}format: '([^']+)'/gm)].map((m) => ({ id: m[1], name: m[2], format: m[3] }));
const only = arg('id')?.split(',');
const list = models.filter((m) => !only || only.includes(m.id));

const POSE = {
  livre: 'The phone is unfolded like an open book, held in both hands, the large inner screen facing the viewer at a slight angle.',
  clapet: 'The flip phone is half-folded in an L shape, held in one hand, the small cover screen and the hinge clearly visible.',
  'tri-pliant': 'The tri-fold phone is fully unfolded into a tablet-sized screen, held in both hands.',
};

const prompt = (m) =>
  [
    'Realistic lifestyle product photo: a person\'s hands holding the exact smartphone shown in the reference image.',
    'Keep the phone\'s design faithful to the reference: shape, colour, camera module layout, hinge and proportions.',
    POSE[m.format] ?? POSE.livre,
    'Natural daylight in a bright, softly blurred home or café interior, shallow depth of field, photographed from the holder\'s point of view or slightly over the shoulder.',
    'Only hands and forearms visible: no face, no identifiable person, no jewellery with logos.',
    'The screens show a neutral abstract wallpaper. No text, no watermark, no added logos or captions.',
  ].join(' ');

const out = 'src/assets/mains';
mkdirSync(out, { recursive: true });
const tmp = mkdtempSync(join(tmpdir(), 'mains-'));
let ok = 0;
let failed = 0;

for (const m of list) {
  const target = join(out, `${m.id}.webp`);
  if (existsSync(target) && !force) {
    console.log(`= ${m.id} : déjà présente (--force pour régénérer)`);
    continue;
  }
  const dir = join('src/assets/phones', m.id);
  const ref = existsSync(dir) ? readdirSync(dir).find((f) => /^1\.(jpe?g|png|webp)$/i.test(f)) : undefined;
  if (!ref) {
    console.log(`- ${m.id} : pas de photo produit 1.* : ignoré`);
    continue;
  }
  // Référence convertie en PNG carré sur fond blanc (format accepté par l'endpoint d'édition)
  const refPng = join(tmp, `${m.id}.png`);
  await sharp(join(dir, ref)).resize(1024, 1024, { fit: 'contain', background: '#ffffff' }).png().toFile(refPng);

  const args = [
    '-sS', '-X', 'POST', 'https://api.openai.com/v1/images/edits',
    '-F', `model=${process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2'}`,
    '-F', `image=@${refPng};type=image/png`,
    '-F', `prompt=${prompt(m)}`,
    '-F', 'size=1536x1024',
    '-F', `quality=${process.env.OPENAI_IMAGE_QUALITY || 'medium'}`,
    '-F', 'n=1',
    '-w', '\n%{http_code}', '--max-time', '300',
  ];
  if (process.env.OPENAI_API_KEY) args.push('-H', `Authorization: Bearer ${process.env.OPENAI_API_KEY}`);

  let raw;
  try {
    raw = execFileSync('curl', args, { encoding: 'utf8', maxBuffer: 80 * 1024 * 1024 });
  } catch (e) {
    console.log(`✗ ${m.id} : appel impossible (${e.message})`);
    failed++;
    continue;
  }
  const status = Number(raw.slice(raw.lastIndexOf('\n') + 1));
  let json = {};
  try {
    json = JSON.parse(raw.slice(0, raw.lastIndexOf('\n')));
  } catch {
    /* réponse non JSON */
  }
  const b64 = json.data?.[0]?.b64_json;
  if (status !== 200 || !b64) {
    console.log(`✗ ${m.id} : HTTP ${status} ${json.error?.message ?? 'sans image'}`);
    failed++;
    continue;
  }
  const info = await sharp(Buffer.from(b64, 'base64')).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toFile(target);
  console.log(`✓ ${m.id} : ${target} (${info.width}x${info.height}, ${Math.round(info.size / 1024)} Ko)`);
  ok++;
}

writeFileSync(join(tmp, 'done'), '');
console.log(`\n${ok} image(s) générée(s), ${failed} échec(s).`);
process.exit(failed && !ok ? 1 : 0);
