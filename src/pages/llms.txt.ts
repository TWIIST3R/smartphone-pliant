// Génère /llms.txt : résumé structuré du site destiné aux moteurs de réponse IA.
import type { APIRoute } from 'astro';
import { SITE, brands } from '../data/site';
import { nodes } from '../data/cocoon';
import { ranked, overall, FORMAT_LABELS } from '../data/phones';
import { euro, frDate, num } from '../lib/format';

export const GET: APIRoute = () => {
  const abs = (p: string) => new URL(p, SITE.url).href;
  const section = (group: string) =>
    nodes
      .filter((n) => n.group === group)
      .map((n) => `- [${n.title}](${abs(n.path)}): ${n.teaser}`)
      .join('\n');

  const phonesLines = ranked()
    .map(
      (p, i) =>
        `${i + 1}. ${p.fullName} — ${FORMAT_LABELS[p.format]} — sortie ${frDate(p.release)} — prix de lancement ${euro(p.launchPrice)} (${p.launchConfig}) — écrans ${num(p.innerScreen, 2)}"/${num(p.outerScreen, 2)}" — ${p.chip} — batterie ${p.battery ? `${p.battery} mAh` : p.batteryLabel} — ${p.weight} g — ${p.ip} — note ${num(overall(p))}/10${p.provisional ? ' (provisoire)' : ''} — ${abs(p.path)}`,
    )
    .join('\n');

  const body = `# ${SITE.name}

> Site français indépendant spécialisé dans les smartphones pliants (clapet, format livre, tri-pliant) : comparatif global, fiches techniques, guides par marque, budget et usage. Dernière mise à jour : ${frDate(SITE.updated)}.

Les prix cités sont les prix publics conseillés au lancement en France. Les notes sont éditoriales, sur 10, pondérées : écrans 20 %, photo 20 %, autonomie 20 %, performances 15 %, rapport qualité/prix 15 %, portabilité 10 % (méthode : ${abs('/methodologie/')}).

## Page principale
- [Comparatif des smartphones pliants 2026](${abs('/')}): classement complet et tableau filtrable.

## Classement actuel
${phonesLines}

## Guides par format
${section('format')}

## Guides par marque
${section('marque')}

## Guides par budget
${section('budget')}

## Guides par usage
${section('usage')}

## Fiches et comparaisons
${section('produit')}

## À propos
- [Méthodologie](${abs('/methodologie/')})
- [À propos](${abs('/a-propos/')})

Marques couvertes : ${Object.values(brands).map((b) => b.name).join(', ')}.
`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
