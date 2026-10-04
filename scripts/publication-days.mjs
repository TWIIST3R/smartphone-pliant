#!/usr/bin/env node
// Jours de publication du blog : 2 par semaine, tirés au hasard (mais de façon reproductible) pour chaque semaine.
// Contraintes : jamais deux jours consécutifs, y compris d'une semaine à l'autre (dimanche puis lundi).
//
// Usage : node scripts/publication-days.mjs
// Affiche « PUBLICATION AUJOURD'HUI : oui » ou « non », puis le planning des deux semaines à venir.
const PER_WEEK = 2;
const SALT = 'smartphone-pliant.fr/blog';
const DAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

// Date du jour à Paris (AAAA-MM-JJ)
const parisDate = (d = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(d);

// Lundi (UTC minuit) de la semaine contenant une date AAAA-MM-JJ
function mondayOf(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d;
}
const isoOf = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => new Date(d.getTime() + n * 86400000);

// Générateur pseudo-aléatoire déterministe (mulberry32) initialisé par la semaine
function rng(seedText) {
  let h = 1779033703 ^ seedText.length;
  for (let i = 0; i < seedText.length; i++) h = Math.imul(h ^ seedText.charCodeAt(i), 3432918353), (h = (h << 13) | (h >>> 19));
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const cache = new Map();
/** Jours (0 = lundi … 6 = dimanche) de publication de la semaine commençant au lundi donné */
function weekDays(monday) {
  const key = isoOf(monday);
  if (cache.has(key)) return cache.get(key);
  const prevLast = key > '2026-09-28' ? Math.max(...weekDays(addDays(monday, -7))) : -10;
  const rand = rng(`${SALT}:${key}`);
  let days;
  for (let tries = 0; tries < 500; tries++) {
    const pick = new Set();
    while (pick.size < PER_WEEK) pick.add(Math.floor(rand() * 7));
    days = [...pick].sort((a, b) => a - b);
    const spaced = days.every((d, i) => i === 0 || d - days[i - 1] >= 2);
    const afterPrev = !(prevLast === 6 && days[0] === 0);
    if (spaced && afterPrev) break;
  }
  cache.set(key, days);
  return days;
}

const today = parisDate();
const monday = mondayOf(today);
const todayIdx = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7;
const publish = weekDays(monday).includes(todayIdx);

console.log(`Aujourd'hui (Paris) : ${DAYS[todayIdx]} ${today}`);
console.log(`PUBLICATION AUJOURD'HUI : ${publish ? 'oui' : 'non'}`);
console.log('\nPlanning :');
for (const w of [0, 7]) {
  const m = addDays(monday, w);
  const list = weekDays(m).map((d) => `${DAYS[d]} ${isoOf(addDays(m, d))}`);
  console.log(`  semaine du ${isoOf(m)} : ${list.join(', ')}`);
}
