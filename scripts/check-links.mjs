// Vérifie le maillage du cocon sémantique sur le site généré (dist/).
// Usage : npm run build && npm run check-links
//
// Règles contrôlées pour chaque page du cocon :
//  1. Premier lien interne du contenu = page mère (sauf accueil).
//  2. Liens internes du contenu limités à : mère, filles, sœurs du même cluster, étapes suivantes
//     du parcours (`next`, pages de même mère), pages légales.
//  3. Toutes les filles sont liées dans le contenu.
//  4. Toutes les sœurs figurent dans le listing de bas de page.
//  5. Aucun lien interne cassé, aucune page orpheline.
//  6. Étapes suivantes (`next`) : même mère, cluster différent, toutes liées dans le contenu.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Options : node scripts/check-links.mjs [dossier-build] [--only=/page1/,/page2/]
const args = process.argv.slice(2);
const distArg = args.find((a) => !a.startsWith('--'));
const onlyArg = args.find((a) => a.startsWith('--only='));
const only = onlyArg ? new Set(onlyArg.slice(7).split(',').filter(Boolean)) : null;
const inScope = (p) => !only || only.has(p);

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = distArg ? resolve(distArg) : join(root, 'dist');
const { nodes } = await import(new URL('../src/data/cocoon.ts', import.meta.url).href);

if (!existsSync(dist)) {
  console.error('dist/ introuvable : lancez d’abord « npm run build ».');
  process.exit(1);
}

const legal = new Set(nodes.filter((n) => n.group === 'legal').map((n) => n.path));
const byPath = new Map(nodes.map((n) => [n.path, n]));

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const full = join(dir, f);
    return statSync(full).isDirectory() ? walk(full) : f === 'index.html' ? [full] : [];
  });
}

const pages = new Map();
for (const file of walk(dist)) {
  const rel = '/' + relative(dist, file).split(sep).slice(0, -1).join('/');
  const path = rel === '/' ? '/' : rel + '/';
  pages.set(path, readFileSync(file, 'utf8'));
}

const hrefs = (html) =>
  [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((h) => h.startsWith('/') && !h.startsWith('//'))
    .map((h) => h.split('#')[0])
    .filter((h) => h && !/\.(xml|txt|svg|png|ico)$/.test(h));

const errors = [];
const warn = [];

for (const n of nodes) {
  if (!pages.has(n.path) && inScope(n.path)) errors.push(`Page du cocon non générée : ${n.path}`);
}
for (const p of pages.keys()) {
  if (p !== '/404/' && !p.startsWith('/actualites/') && !byPath.has(p)) warn.push(`Page générée absente de cocoon.ts : ${p}`);
}

for (const [path, html] of pages) {
  if (!inScope(path)) continue;
  const n = byPath.get(path);
  const all = hrefs(html);
  for (const h of new Set(all)) {
    if (pages.has(h)) continue;
    if (only && byPath.has(h)) warn.push(`${path} → ${h} pas encore générée (page d’un autre lot)`);
    else errors.push(`${path} → lien cassé ${h}`);
  }
  if (!n || n.group === 'legal') continue;

  const main = (html.match(/<main[^>]*>([\s\S]*)<\/main>/) || [])[1] || '';
  const sibNav = (main.match(/<nav class="siblings"[\s\S]*?<\/nav>/) || [''])[0];
  const content = main.replace(/<nav class="crumbs[\s\S]*?<\/nav>/, '').replace(sibNav, '');
  const links = hrefs(content).filter((h) => h !== path);
  // Blog : seules les pages de dernier niveau (tests) peuvent lier des articles.
  const blogLinks = links.filter((h) => h.startsWith('/actualites/'));
  if (blogLinks.length && n.group !== 'produit') {
    errors.push(`${path} : lien vers le blog interdit (réservé aux pages de dernier niveau) → ${blogLinks[0]}`);
  }
  const cocoonLinks = links.filter((h) => !legal.has(h) && !h.startsWith('/actualites/'));

  const children = nodes.filter((c) => c.parent === path).map((c) => c.path);
  const sisters = n.parent ? nodes.filter((s) => s.parent === n.parent && s.group === n.group && s.path !== path).map((s) => s.path) : [];
  const next = n.next ?? [];
  for (const t of next) {
    const tn = byPath.get(t);
    if (!tn) errors.push(`${path} : étape suivante inconnue ${t}`);
    else if (tn.parent !== n.parent) errors.push(`${path} : l’étape suivante ${t} n’a pas la même mère (glissement hors cocon)`);
    else if (tn.group === n.group) errors.push(`${path} : l’étape suivante ${t} est dans le même cluster (utiliser le listing des sœurs)`);
    if (!cocoonLinks.includes(t)) errors.push(`${path} : l’étape suivante ${t} n’est pas liée dans le contenu`);
  }
  const allowed = new Set([n.parent, ...children, ...sisters, ...next].filter(Boolean));
  if (n.parent && cocoonLinks[0] !== n.parent) {
    errors.push(`${path} : le premier lien du contenu doit pointer vers la mère ${n.parent} (trouvé : ${cocoonLinks[0] ?? 'aucun'})`);
  }
  for (const h of new Set(cocoonLinks)) {
    if (!allowed.has(h)) errors.push(`${path} : lien hors cocon vers ${h}`);
  }
  for (const c of children) {
    if (!cocoonLinks.includes(c)) errors.push(`${path} : la fille ${c} n’est pas liée dans le contenu`);
  }
  const sibLinks = hrefs(sibNav);
  for (const s of sisters) {
    if (!sibLinks.includes(s)) errors.push(`${path} : la sœur ${s} manque dans le listing de bas de page`);
  }
}

console.log(`${pages.size} pages analysées.`);
warn.forEach((w) => console.warn('⚠ ' + w));
if (errors.length) {
  errors.forEach((e) => console.error('✗ ' + e));
  console.error(`\n${errors.length} erreur(s) de maillage.`);
  process.exit(1);
}
console.log('✓ Maillage du cocon conforme.');
