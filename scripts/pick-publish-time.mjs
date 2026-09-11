// Choisit une heure de publication aléatoire, crédible pour un média parisien.
// Usage : node scripts/pick-publish-time.mjs [AAAA-MM-JJ]
// Sortie JSON : { "iso": "2026-09-12T14:37:00+02:00", "paris": "samedi 12 septembre 2026 à 14:37" }
//
// Créneaux (heure de Paris) :
//   lundi → vendredi : 07:15 – 21:40
//   samedi           : 08:50 – 20:20
//   dimanche         : 09:35 – 19:45
// Les minutes « rondes » (:00, :15, :30, :45) sont évitées. Si la date est aujourd'hui,
// l'heure choisie est au moins 25 minutes après maintenant ; sinon on passe au lendemain.

const TZ = 'Europe/Paris';
const WINDOWS = { 0: [9 * 60 + 35, 19 * 60 + 45], 6: [8 * 60 + 50, 20 * 60 + 20], default: [7 * 60 + 15, 21 * 60 + 40] };

function parisParts(date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t)?.value;
  return { y: +get('year'), m: +get('month'), d: +get('day'), hh: +get('hour'), mm: +get('minute') };
}

function offsetFor(y, m, d) {
  // Décalage de Paris à midi ce jour-là (les changements d'heure ont lieu la nuit, hors créneaux).
  const noonUtc = new Date(Date.UTC(y, m - 1, d, 12, 0));
  const name = new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'longOffset' })
    .formatToParts(noonUtc)
    .find((p) => p.type === 'timeZoneName').value; // « GMT+02:00 »
  return name.replace('GMT', '') || '+00:00';
}

const pad = (n) => String(n).padStart(2, '0');
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

function pick(y, m, d, notBeforeMinutes = 0) {
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const [start, end] = WINDOWS[weekday] ?? WINDOWS.default;
  const from = Math.max(start, notBeforeMinutes);
  if (from > end) return null;
  let minutes = rand(from, end);
  if (minutes % 15 === 0) minutes += minutes + 7 <= end ? rand(1, 7) : -rand(1, 7);
  const hh = Math.floor(minutes / 60);
  const mm = minutes % 60;
  const iso = `${y}-${pad(m)}-${pad(d)}T${pad(hh)}:${pad(mm)}:00${offsetFor(y, m, d)}`;
  const paris = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeStyle: 'short', timeZone: TZ }).format(new Date(iso));
  return { iso, paris };
}

const now = parisParts(new Date());
const arg = process.argv[2];
let [y, m, d] = arg ? arg.split('-').map(Number) : [now.y, now.m, now.d];
const isToday = y === now.y && m === now.m && d === now.d;

let result = pick(y, m, d, isToday ? now.hh * 60 + now.mm + 25 : 0);
if (!result) {
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  result = pick(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate());
}
console.log(JSON.stringify(result, null, 2));
