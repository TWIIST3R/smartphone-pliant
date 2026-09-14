#!/usr/bin/env node
// Garde-fou du workflow publish-review.yml : une branche de relecture ne peut que corriger
// des articles déjà intégrés à main et pas encore publiés, sans toucher à leurs champs structurants.
// Usage : node scripts/review-guard.mjs <commit de base> <commit de tête>
import { execFileSync } from 'node:child_process';

const [base, head] = process.argv.slice(2);
if (!base || !head) {
  console.error('Usage : node scripts/review-guard.mjs <base> <head>');
  process.exit(1);
}
const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
const errors = [];

const frontmatter = (txt) => txt.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
const field = (txt, key) => frontmatter(txt).match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))?.[1].trim() ?? '';
const coverPart = (txt, key) => field(txt, 'cover').match(new RegExp(`\\b${key}:\\s*("(?:[^"\\\\]|\\\\.)*"|[^,}]+)`))?.[1].trim() ?? '';

const changes = git('diff', '--name-status', base, head)
  .split('\n')
  .filter(Boolean)
  .map((line) => line.split('\t'));
if (!changes.length) errors.push('aucune modification dans la branche');

const now = Date.now();
for (const [status, file] of changes) {
  if (status !== 'M' || !/^src\/content\/actualites\/[a-z0-9-]+\.md$/.test(file)) {
    errors.push(`${status} ${file} : une relecture ne peut que modifier un article existant (src/content/actualites/<slug>.md)`);
    continue;
  }
  const before = git('show', `${base}:${file}`);
  const after = git('show', `${head}:${file}`);
  let onMain = null;
  try {
    onMain = git('show', `origin/main:${file}`);
  } catch {
    /* absent de main */
  }
  if (onMain !== before) errors.push(`${file} : l'article a changé sur main depuis le début de la relecture`);

  const pubDate = field(before, 'pubDate');
  if (!(Date.parse(pubDate) > now + 5 * 60 * 1000)) errors.push(`${file} : article déjà publié ou publié dans moins de 5 minutes (pubDate ${pubDate || 'absente'}) : relecture refusée`);

  for (const key of ['pubDate', 'format', 'category', 'scope', 'sujet']) {
    if (field(before, key) !== field(after, key)) errors.push(`${file} : le champ « ${key} » ne doit pas être modifié par une relecture`);
  }
  for (const key of ['src', 'kind', 'credit']) {
    if (coverPart(before, key) !== coverPart(after, key)) errors.push(`${file} : « cover.${key} » ne doit pas être modifié par une relecture`);
  }
}

if (errors.length) {
  errors.forEach((e) => console.error(`::error::${e}`));
  process.exit(1);
}
console.log(`Relecture acceptée : ${changes.map(([, f]) => f).join(', ')}`);
