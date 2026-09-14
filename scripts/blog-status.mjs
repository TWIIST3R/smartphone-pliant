// État du blog et contrôle d'un article avant publication.
// Usage :
//   node scripts/blog-status.mjs                 → derniers articles, mix éditorial, sujets du backlog, formats disponibles
//   node scripts/blog-status.mjs --check <slug>  → contrôle complet d'un article (0 erreur exigée)
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dir = join(root, 'src', 'content', 'actualites');
const formats = JSON.parse(readFileSync(join(root, 'src', 'data', 'blog-formats.json'), 'utf8'));
const sujetsPath = join(root, 'src', 'data', 'blog-sujets.json');
const sujets = existsSync(sujetsPath) ? JSON.parse(readFileSync(sujetsPath, 'utf8')) : [];
// Lecture de cocoon.ts par expression régulière (fonctionne quelle que soit la version de Node).
const cocoonSrc = readFileSync(join(root, 'src', 'data', 'cocoon.ts'), 'utf8');
const nodes = [...cocoonSrc.matchAll(/\{\s*path:\s*'([^']+)'[^}]*?group:\s*'([^']+)'/g)].map((m) => ({ path: m[1], group: m[2] }));
const phonesSrc = readFileSync(join(root, 'src', 'data', 'phones.ts'), 'utf8');
const phoneIds = [...phonesSrc.matchAll(/^\s{4}id: '([^']+)'/gm)].map((m) => m[1]);
const cocoonPaths = new Set(nodes.map((n) => n.path));
const productPaths = new Set(nodes.filter((n) => n.group === 'produit').map((n) => n.path));

const CATEGORIES = ['actualite', 'question', 'guide', 'analyse', 'comparatif', 'astuce', 'dossier'];
/** Nombre de questions « pliant » publiées avant d'ouvrir les sujets hors pliant */
const QUESTIONS_PLIANT_AVANT_HORS_PLIANT = 8;

// ——— Lecture du frontmatter (YAML simple : scalaires, listes [a, b], objets { k: "v" }, listes d'objets) ———
function unquote(v) {
  v = v.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1);
  return v;
}
function parseInlineObject(s) {
  const obj = {};
  for (const m of s.trim().replace(/^\{|\}$/g, '').matchAll(/(\w+)\s*:\s*("(?:[^"\\]|\\.)*"|'[^']*'|[^,}]+)/g)) obj[m[1]] = unquote(m[2]);
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
    } else if (v.startsWith('{')) {
      data[k] = parseInlineObject(v);
      listKey = null;
    } else {
      data[k] = unquote(v);
      listKey = null;
    }
  }
  return { data, body: m[2] };
}

const countWords = (t) => t.replace(/[#>*_|`-]/g, ' ').split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
const firstParagraph = (body) =>
  body
    .split(/\r?\n\s*\r?\n/)
    .map((b) => b.trim())
    .find((b) => b && !/^(#|\||>|[-*]\s|!\[|<)/.test(b)) ?? '';
const scopeOf = (a) => a.data.scope || 'pliant';

const articles = existsSync(dir)
  ? readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => {
        const parsed = parseFrontmatter(readFileSync(join(dir, f), 'utf8'));
        return parsed ? { slug: f.replace(/\.md$/, ''), ...parsed } : { slug: f.replace(/\.md$/, ''), data: {}, body: '', invalid: true };
      })
      .sort((a, b) => new Date(b.data.pubDate) - new Date(a.data.pubDate))
  : [];

/** Sujets hors pliant autorisés ? `list` = articles antérieurs, du plus récent au plus ancien */
function horsPliant(list) {
  const questionsPliant = list.filter((x) => x.data.category === 'question' && scopeOf(x) === 'pliant').length;
  const recent = list.slice(0, 2).some((x) => scopeOf(x) === 'smartphone');
  return { ok: questionsPliant >= QUESTIONS_PLIANT_AVANT_HORS_PLIANT && !recent, questionsPliant, recent };
}

const now = new Date();
const fmtParis = (d) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Paris' }).format(new Date(d));

const args = process.argv.slice(2);
const checkIdx = args.indexOf('--check');

if (checkIdx === -1) {
  const published = articles.filter((a) => new Date(a.data.pubDate) <= now && a.data.draft !== 'true');
  const scheduled = articles.filter((a) => new Date(a.data.pubDate) > now);
  const last7 = articles.slice(0, 7).map((a) => a.data.format);
  const lastFormat = articles[0]?.data.format;
  const available = formats.filter((f) => f.key !== lastFormat && !last7.includes(f.key));
  const fallback = formats.filter((f) => f.key !== lastFormat && last7.filter((k) => k === f.key).length < 2);

  console.log(`Articles : ${articles.length} (publiés ${published.length}, programmés ${scheduled.length})`);
  if (scheduled.length) {
    console.log('\nPROGRAMMÉS :');
    scheduled.forEach((a) => console.log(`  ${fmtParis(a.data.pubDate)}  [${a.data.format}]  ${a.data.title}`));
  }
  console.log('\n15 DERNIERS :');
  articles
    .slice(0, 15)
    .forEach((a) => console.log(`  ${fmtParis(a.data.pubDate)}  [${a.data.format} / ${a.data.category} / ${scopeOf(a)}]  ${a.data.title}  → tests: ${(a.data.relatedTests || []).join(', ') || '-'}`));

  const last3 = articles.slice(0, 3).map((a) => a.data.category);
  const newsHeavy = last3.filter((c) => c === 'actualite').length >= 2;
  const hp = horsPliant(articles);
  console.log('\nMIX ÉDITORIAL :');
  console.log(`  3 derniers articles : ${last3.join(', ') || 'aucun'}`);
  console.log(
    newsHeavy
      ? '  → prochain article : une QUESTION du backlog (une actualité seulement pour une annonce officielle majeure concernant la France)'
      : '  → une actualité forte est possible ; sinon une QUESTION du backlog',
  );
  console.log(
    `  Questions « pliant » publiées ou programmées : ${hp.questionsPliant}. Sujets hors pliant : ${
      hp.ok ? 'autorisés pour le prochain article' : `non autorisés (${QUESTIONS_PLIANT_AVANT_HORS_PLIANT} questions pliant requises, et aucun article hors pliant parmi les 2 derniers)`
    }.`,
  );

  const used = new Set(articles.map((a) => a.data.sujet).filter(Boolean));
  const todo = sujets.filter((s) => !used.has(s.id) && (s.scope === 'pliant' || hp.ok)).sort((x, y) => x.priorite - y.priorite);
  console.log(`\nSUJETS DU BACKLOG À TRAITER (${todo.length} disponibles, par priorité ; src/data/blog-sujets.json) :`);
  todo.slice(0, 8).forEach((s) =>
    console.log(
      `  [${s.id}] (${s.scope}, priorité ${s.priorite}) ${s.question}\n      liens suggérés : ${s.pages.join(' ')}${s.tests?.length ? `\n      relatedTests possibles : ${s.tests.join(' ')}` : ''}\n      angle : ${s.angle}`,
    ),
  );
  const invalid = sujets.flatMap((s) => [
    ...(s.pages || []).filter((p) => !cocoonPaths.has(p)).map((p) => `${s.id} : page inconnue ${p}`),
    ...(s.tests || []).filter((t) => !productPaths.has(t)).map((t) => `${s.id} : test inconnu ${t}`),
  ]);
  if (invalid.length) {
    console.log('\n⚠ BACKLOG : chemins invalides');
    invalid.forEach((x) => console.log(`  ${x}`));
  }

  console.log('\nFORMATS DISPONIBLES (non utilisés dans les 7 derniers articles) :');
  (available.length ? available : fallback).forEach((f) => console.log(`  ${f.key.padEnd(20)} ${f.label} (${f.words[0]}–${f.words[1]} mots)`));
  console.log(`\nDernier format utilisé : ${lastFormat ?? 'aucun'} (interdit pour le prochain article)`);
  console.log('\nSUJETS DÉJÀ TRAITÉS (60 derniers, titres + tags) :');
  articles.slice(0, 60).forEach((a) => console.log(`  - ${a.data.title} {${(a.data.tags || []).join(', ')}}${a.data.sujet ? ` [sujet ${a.data.sujet}]` : ''}`));
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
const articleSlugs = new Set(articles.map((x) => x.slug));
const scope = scopeOf(a);
const earlier = articles.filter((x) => x.slug !== slug && new Date(x.data.pubDate) <= new Date(d.pubDate));

if (!/^[a-z0-9]+(-[a-z0-9]+){2,8}$/.test(slug)) errors.push('slug : minuscules, mots séparés par des tirets, 3 à 9 mots, sans date');
for (const k of ['title', 'description', 'pubDate', 'format', 'category']) if (!d[k]) errors.push(`frontmatter : champ « ${k} » manquant`);
const minTitle = d.category === 'question' ? 30 : 40;
if (d.title && (d.title.length < minTitle || d.title.length > 70)) errors.push(`title : ${d.title.length} caractères (${minTitle} à 70)`);
if (d.description && (d.description.length < 120 || d.description.length > 165)) errors.push(`description : ${d.description.length} caractères (120 à 165)`);
if (d.pubDate && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/.test(d.pubDate)) errors.push('pubDate : format attendu 2026-09-12T14:37:00+02:00 (utiliser scripts/pick-publish-time.mjs)');
if (!fmt) errors.push(`format « ${d.format} » inconnu (voir src/data/blog-formats.json)`);
if (!CATEGORIES.includes(d.category)) errors.push(`category « ${d.category} » invalide (${CATEGORIES.join(' | ')})`);
if (!['pliant', 'smartphone'].includes(scope)) errors.push(`scope « ${scope} » invalide (pliant | smartphone)`);
const previous = earlier.slice(0, 7);
if (previous[0]?.data.format === d.format) errors.push(`format « ${d.format} » identique à l'article précédent`);
if (previous.filter((x) => x.data.format === d.format).length >= 2) errors.push(`format « ${d.format} » déjà utilisé 2 fois sur les 7 derniers articles`);
for (const t of d.relatedTests || []) if (!productPaths.has(t)) errors.push(`relatedTests : « ${t} » n'est pas une page de dernier niveau du cocon`);
if ((d.relatedTests || []).length > 3) errors.push('relatedTests : 3 tests maximum');
for (const p of [...(d.phones || []), ...(d.phone ? [d.phone] : [])]) if (!phoneIds.includes(p)) errors.push(`phones/phone : id « ${p} » inconnu dans phones.ts`);
const sources = d.sources || [];
if (['actualite', 'question'].includes(d.category) && sources.length < 2) errors.push(`sources : au moins 2 sources pour la catégorie ${d.category}`);
for (const s of sources) if (!s.url || !/^https?:\/\//.test(s.url)) errors.push(`sources : URL invalide pour « ${s.media} »`);

// Sujet du backlog et périmètre
if (d.sujet) {
  const s = sujets.find((x) => x.id === d.sujet);
  if (!s) errors.push(`sujet « ${d.sujet} » absent de src/data/blog-sujets.json`);
  else if (s.scope !== scope) errors.push(`scope « ${scope} » différent de celui du sujet « ${d.sujet} » (${s.scope})`);
  const dup = articles.find((x) => x.slug !== slug && x.data.sujet === d.sujet);
  if (dup) errors.push(`sujet « ${d.sujet} » déjà traité par ${dup.slug}`);
}
if (scope === 'smartphone') {
  const hp = horsPliant(earlier);
  if (!hp.ok)
    errors.push(
      `sujet hors pliant non autorisé : ${hp.questionsPliant} question(s) pliant publiée(s) sur ${QUESTIONS_PLIANT_AVANT_HORS_PLIANT} requises${hp.recent ? ', et un article hors pliant figure déjà parmi les 2 précédents' : ''}`,
    );
}

// Articles « question » : la réponse d'abord
if (d.category === 'question') {
  if (d.title && !d.title.trim().endsWith('?')) errors.push('title : une question doit se terminer par « ? »');
  const fw = countWords(firstParagraph(a.body));
  if (fw < 25 || fw > 80) errors.push(`premier paragraphe : ${fw} mots (25 à 80) ; il doit donner la réponse directe à la question`);
}
const faq = d.faq || [];
if (d.format === 'reponse-question' && (faq.length < 3 || faq.length > 6)) errors.push(`faq : ${faq.length} question(s) (3 à 6 pour le format reponse-question)`);
if (faq.length > 6) errors.push('faq : 6 questions maximum');
for (const f of faq) {
  if (!f.q || !f.q.trim().endsWith('?')) errors.push(`faq : « ${f.q ?? '?'} » doit se terminer par « ? »`);
  if (!f.a || f.a.length < 40 || f.a.length > 450) errors.push(`faq : réponse de ${f.a ? f.a.length : 0} caractères pour « ${f.q} » (40 à 450)`);
  if (/amazon\.|https?:\/\//i.test(f.a || '')) errors.push('faq : pas de lien dans les réponses (texte seul)');
}

// Illustration d'en-tête
if (d.cover) {
  const c = d.cover;
  if (typeof c !== 'object') errors.push('cover : écrire l\'objet sur une ligne { src: "./images/<slug>.webp", alt: "…", credit: "…", kind: … }');
  else {
    if (!c.src || !/^\.\/images\/[a-z0-9-]+\.(webp|jpg|jpeg|png)$/.test(c.src)) errors.push('cover : src attendu ./images/<slug>.webp (ou .jpg, .png)');
    else if (!existsSync(resolve(dir, c.src))) errors.push(`cover : fichier introuvable src/content/actualites/${c.src.slice(2)}`);
    if (!['illustration-ia', 'photo-presse', 'photo'].includes(c.kind)) errors.push('cover : kind attendu illustration-ia | photo-presse | photo');
    if (!c.alt || c.alt.length < 10) errors.push('cover : texte alternatif (alt) trop court');
    if (!c.credit) errors.push('cover : crédit manquant');
    if (c.kind === 'illustration-ia' && !/\bIA\b/.test(c.credit || '')) errors.push('cover : le crédit d\'une illustration générée doit mentionner « IA »');
    if (c.kind === 'photo-presse' && !/^https?:\/\//.test(c.sourceUrl || '')) errors.push('cover : sourceUrl obligatoire pour une photo de presse');
  }
}

const words = countWords(a.body);
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
const texts = [a.body, ...faq.map((f) => `${f.q} ${f.a}`)].join('\n');
const hits = [...new Set((texts.match(forbidden) || []).map((s) => s.toLowerCase()))];
if (hits.length) errors.push(`formulations interdites : ${hits.join(', ')}`);
const quotes = (a.body.match(/«[^»]{90,}»/g) || []).length;
if (quotes) warnings.push(`${quotes} citation(s) longue(s) : vérifier la limite de 15 mots`);

console.log(
  `Contrôle de « ${slug} » : ${words} mots, format ${d.format}, catégorie ${d.category}, périmètre ${scope}${d.sujet ? `, sujet ${d.sujet}` : ''}, ${cocoonLinks.length} liens cocon, ${sources.length} sources, ${faq.length} questions liées, publication ${d.pubDate ? fmtParis(d.pubDate) : '?'}`,
);
warnings.forEach((w) => console.log('⚠ ' + w));
if (errors.length) {
  errors.forEach((e) => console.error('✗ ' + e));
  process.exit(1);
}
console.log('✓ Article conforme.');
