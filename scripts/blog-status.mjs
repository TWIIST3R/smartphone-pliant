// État du blog et contrôle d'un article avant publication.
// Usage :
//   node scripts/blog-status.mjs                 → derniers articles, formats disponibles, sujets déjà traités
//   node scripts/blog-status.mjs --check <slug>  → contrôle complet d'un article (0 erreur exigée)
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dir = join(root, 'src', 'content', 'actualites');
const formats = JSON.parse(readFileSync(join(root, 'src', 'data', 'blog-formats.json'), 'utf8'));
// Lecture de cocoon.ts par expression régulière (fonctionne quelle que soit la version de Node).
const cocoonSrc = readFileSync(join(root, 'src', 'data', 'cocoon.ts'), 'utf8');
const nodes = [...cocoonSrc.matchAll(/\{\s*path:\s*'([^']+)'[^}]*?group:\s*'([^']+)'/g)].map((m) => ({ path: m[1], group: m[2] }));
const phonesSrc = readFileSync(join(root, 'src', 'data', 'phones.ts'), 'utf8');
const phoneIds = [...phonesSrc.matchAll(/^\s{4}id: '([^']+)'/gm)].map((m) => m[1]);

// ——— Lecture du frontmatter (YAML simple : scalaires, listes [a, b], listes d'objets { k: "v" }) ———
function unquote(v) {
  v = v.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1);
  return v;
}
function parseInlineObject(s) {
  const obj = {};
  for (const m of s.replace(/^\{|\}$/g, '').matchAll(/(\w+)\s*:\s*("(?:[^"\\]|\\.)*"|'[^']*'|[^,}]+)/g)) obj[m[1]] = unquote(m[2]);
  return obj;
}
function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return null;
  const data = {};
  let listKey = null;
  for (const raw of m[1].split(/\r?\n/)) {
    const line = raw.replace(/\s+#.*$/, '');
    if (!line.trim()) continue;
    const item = line.match(/^\s*-\s+(.*)$/);
    if (item && listKey) {
      const v = item[1].trim();
      data[listKey].push(v.startsWith('{') ? parseInlineObject(v) : unquote(v));
      continue;
    }
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    const [, k, v] = kv;
    if (v === '') {
      data[k] = [];
      listKey = k;
    } else if (v.startsWith('[')) {
      data[k] = v.replace(/^\[|\]$/g, '').split(',').map((x) => unquote(x)).filter(Boolean);
      listKey = null;
    } else {
      data[k] = unquote(v);
      listKey = null;
    }
  }
  return { data, body: m[2] };
}

const articles = existsSync(dir)
  ? readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => {
        const parsed = parseFrontmatter(readFileSync(join(dir, f), 'utf8'));
        return parsed ? { slug: f.replace(/\.md$/, ''), ...parsed } : { slug: f.replace(/\.md$/, ''), data: {}, body: '', invalid: true };
      })
      .sort((a, b) => new Date(b.data.pubDate) - new Date(a.data.pubDate))
  : [];

const now = new Date();
const fmtParis = (d) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Paris' }).format(new Date(d));

const args = process.argv.slice(2);
const checkIdx = args.indexOf('--check');

if (checkIdx === -1) {
  const published = articles.filter((a) => new Date(a.data.pubDate) <= now && a.data.draft !== 'true');
  const scheduled = articles.filter((a) => new Date(a.data.pubDate) > now);
  const last7 = articles.slice(0, 7).map((a) => a.data.format);
  const lastFormat = articles[0]?.data.format;
  const available = formats.filter((f) => f.key !== lastFormat && last7.filter((k) => k === f.key).length < 2 && !articles.slice(0, 7).some((a) => a.data.format === f.key));
  const fallback = formats.filter((f) => f.key !== lastFormat && last7.filter((k) => k === f.key).length < 2);

  console.log(`Articles : ${articles.length} (publiés ${published.length}, programmés ${scheduled.length})`);
  if (scheduled.length) {
    console.log('\nPROGRAMMÉS :');
    scheduled.forEach((a) => console.log(`  ${fmtParis(a.data.pubDate)}  [${a.data.format}]  ${a.data.title}`));
  }
  console.log('\n15 DERNIERS :');
  articles.slice(0, 15).forEach((a) => console.log(`  ${fmtParis(a.data.pubDate)}  [${a.data.format} / ${a.data.category}]  ${a.data.title}  → tests: ${(a.data.relatedTests || []).join(', ') || '-'}`));
  console.log('\nFORMATS DISPONIBLES (non utilisés dans les 7 derniers articles) :');
  (available.length ? available : fallback).forEach((f) => console.log(`  ${f.key.padEnd(20)} ${f.label} (${f.words[0]}–${f.words[1]} mots)`));
  console.log(`\nDernier format utilisé : ${lastFormat ?? 'aucun'} (interdit pour le prochain article)`);
  console.log('\nSUJETS DÉJÀ TRAITÉS (60 derniers, titres + tags) :');
  articles.slice(0, 60).forEach((a) => console.log(`  - ${a.data.title} {${(a.data.tags || []).join(', ')}}`));
  process.exit(0);
}

// ——— Contrôle d'un article ———
const slug = args[checkIdx + 1];
const a = articles.find((x) => x.slug === slug);
const errors = [];
const warnings = [];
if (!a) {
  console.error(`Article introuvable : src/content/actualites/${slug}.md`);
  process.exit(1);
}
const d = a.data;
const fmt = formats.find((f) => f.key === d.format);
const cocoonPaths = new Set(nodes.map((n) => n.path));
const productPaths = new Set(nodes.filter((n) => n.group === 'produit').map((n) => n.path));
const articleSlugs = new Set(articles.map((x) => x.slug));

if (!/^[a-z0-9]+(-[a-z0-9]+){2,8}$/.test(slug)) errors.push('slug : minuscules, mots séparés par des tirets, 3 à 9 mots, sans date');
for (const k of ['title', 'description', 'pubDate', 'format', 'category']) if (!d[k]) errors.push(`frontmatter : champ « ${k} » manquant`);
if (d.title && (d.title.length < 40 || d.title.length > 70)) errors.push(`title : ${d.title.length} caractères (40 à 70)`);
if (d.description && (d.description.length < 120 || d.description.length > 165)) errors.push(`description : ${d.description.length} caractères (120 à 165)`);
if (d.pubDate && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/.test(d.pubDate)) errors.push('pubDate : format attendu 2026-09-12T14:37:00+02:00 (utiliser scripts/pick-publish-time.mjs)');
if (!fmt) errors.push(`format « ${d.format} » inconnu (voir src/data/blog-formats.json)`);
if (!['actualite', 'guide', 'analyse', 'comparatif', 'astuce', 'dossier'].includes(d.category)) errors.push(`category « ${d.category} » invalide`);
const previous = articles.filter((x) => x.slug !== slug && new Date(x.data.pubDate) <= new Date(d.pubDate)).slice(0, 7);
if (previous[0]?.data.format === d.format) errors.push(`format « ${d.format} » identique à l'article précédent`);
if (previous.filter((x) => x.data.format === d.format).length >= 2) errors.push(`format « ${d.format} » déjà utilisé 2 fois sur les 7 derniers articles`);
for (const t of d.relatedTests || []) if (!productPaths.has(t)) errors.push(`relatedTests : « ${t} » n'est pas une page de dernier niveau du cocon`);
if ((d.relatedTests || []).length > 3) errors.push('relatedTests : 3 tests maximum');
for (const p of [...(d.phones || []), ...(d.phone ? [d.phone] : [])]) if (!phoneIds.includes(p)) errors.push(`phones/phone : id « ${p} » inconnu dans phones.ts`);
const sources = d.sources || [];
if (d.category === 'actualite' && sources.length < 2) errors.push('sources : au moins 2 sources pour une actualité');
for (const s of sources) if (!s.url || !/^https?:\/\//.test(s.url)) errors.push(`sources : URL invalide pour « ${s.media} »`);

const words = a.body.replace(/[#>*_|`-]/g, ' ').split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
if (fmt && (words < fmt.words[0] * 0.9 || words > fmt.words[1] * 1.1)) errors.push(`longueur : ${words} mots (format ${fmt.key} : ${fmt.words[0]}–${fmt.words[1]})`);

const internal = [...a.body.matchAll(/\]\((\/[^)\s]*)\)/g)].map((m) => m[1].split('#')[0]);
const cocoonLinks = internal.filter((h) => !h.startsWith('/actualites/'));
if (cocoonLinks.length < 2 || cocoonLinks.length > 6) errors.push(`liens internes vers le cocon : ${cocoonLinks.length} (2 à 6 attendus)`);
for (const h of internal) {
  if (!h.endsWith('/')) errors.push(`lien « ${h} » : slash final manquant`);
  else if (h.startsWith('/actualites/')) {
    if (!articleSlugs.has(h.replace(/^\/actualites\/|\/$/g, ''))) errors.push(`lien vers un article inexistant : ${h}`);
  } else if (!cocoonPaths.has(h)) errors.push(`lien interne cassé : ${h}`);
}
if (/amazon\./i.test(a.body)) errors.push('lien Amazon interdit dans le corps (les cartes « modèles cités » portent les boutons)');
if (/^#\s/m.test(a.body)) errors.push('titre de niveau 1 (#) interdit dans le corps : le H1 est généré depuis « title »');

const forbidden = /nous avons testé|notre test|lors de nos tests|nous avons mesuré|en main depuis|dans un monde où|à l'ère de|à l’ère de|plongeons|découvrons|incontournable|révolutionnaire|véritable bijou|must-have|game changer|que vous soyez|il est important de noter|n'hésitez pas|n’hésitez pas|sans plus attendre|en somme|en conclusion|tout simplement/gi;
const hits = [...new Set((a.body.match(forbidden) || []).map((s) => s.toLowerCase()))];
if (hits.length) errors.push(`formulations interdites : ${hits.join(', ')}`);
const quotes = (a.body.match(/«[^»]{90,}»/g) || []).length;
if (quotes) warnings.push(`${quotes} citation(s) longue(s) : vérifier la limite de 15 mots`);

console.log(`Contrôle de « ${slug} » : ${words} mots, format ${d.format}, ${cocoonLinks.length} liens cocon, ${sources.length} sources, publication ${d.pubDate ? fmtParis(d.pubDate) : '?'}`);
warnings.forEach((w) => console.log('⚠ ' + w));
if (errors.length) {
  errors.forEach((e) => console.error('✗ ' + e));
  process.exit(1);
}
console.log('✓ Article conforme.');
