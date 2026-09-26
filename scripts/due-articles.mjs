#!/usr/bin/env node
// Indique à GitHub Actions s'il faut reconstruire le site lors d'un passage planifié :
// oui si un article dont l'heure de publication est passée n'est pas encore en ligne.
// On interroge le site lui-même plutôt qu'une fenêtre horaire : les tâches planifiées de GitHub
// sont souvent retardées de plusieurs heures, un article manqué est ainsi rattrapé au passage suivant.
//
// Usage : node scripts/due-articles.mjs
// Écrit due=true|false dans $GITHUB_OUTPUT (ou l'affiche en local).
import { readdirSync, readFileSync, appendFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SITE = 'https://smartphone-pliant.fr';
const dir = 'src/content/actualites';
const now = Date.now();

const published = [];
if (existsSync(dir)) {
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const head = readFileSync(join(dir, file), 'utf8').split(/^---\s*$/m)[1] ?? '';
    if (/^draft:\s*true\s*$/m.test(head)) continue;
    const m = head.match(/^pubDate:\s*["']?([^"'\s]+)["']?\s*$/m);
    const t = m ? Date.parse(m[1]) : NaN;
    if (t <= now) published.push({ slug: file.replace(/\.md$/, ''), t });
  }
}

// Les 20 articles les plus récents suffisent : les plus anciens sont forcément en ligne.
const recent = published.sort((a, b) => b.t - a.t).slice(0, 20);
const missing = [];
let networkError = false;
for (const { slug } of recent) {
  try {
    const res = await fetch(`${SITE}/actualites/${slug}/`, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(15000) });
    if (res.status === 404) missing.push(slug);
  } catch {
    networkError = true;
  }
}

// En cas d'erreur réseau, on reconstruit par sécurité.
const due = missing.length > 0 || networkError;
console.log(
  missing.length
    ? `Article(s) publié(s) mais absent(s) du site :\n- ${missing.join('\n- ')}`
    : networkError
      ? 'Site injoignable : reconstruction par sécurité.'
      : `Les ${recent.length} articles publiés les plus récents sont en ligne.`,
);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `due=${due}\n`);
