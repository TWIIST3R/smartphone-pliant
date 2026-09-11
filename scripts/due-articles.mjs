#!/usr/bin/env node
// Indique à GitHub Actions s'il faut reconstruire le site lors d'un passage horaire :
// oui seulement si un article a atteint son heure de publication dans les dernières heures.
// Évite 24 builds par jour pour rien (minutes GitHub Actions).
//
// Usage : node scripts/due-articles.mjs [--hours=3]
// Écrit due=true|false dans $GITHUB_OUTPUT (ou l'affiche en local).
import { readdirSync, readFileSync, appendFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'src/content/actualites';
const hoursArg = process.argv.find((a) => a.startsWith('--hours='));
const hours = hoursArg ? Number(hoursArg.split('=')[1]) : 3;
const now = Date.now();
const since = now - hours * 3600 * 1000;

const due = [];
if (existsSync(dir)) {
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const head = readFileSync(join(dir, file), 'utf8').split(/^---\s*$/m)[1] ?? '';
    if (/^draft:\s*true\s*$/m.test(head)) continue;
    const m = head.match(/^pubDate:\s*["']?([^"'\s]+)["']?\s*$/m);
    const t = m ? Date.parse(m[1]) : NaN;
    if (t > since && t <= now) due.push(`${file} (${m[1]})`);
  }
}

const result = due.length > 0;
console.log(result ? `Article(s) à publier :\n- ${due.join('\n- ')}` : `Aucun article arrivé à échéance depuis ${hours} h.`);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `due=${result}\n`);
