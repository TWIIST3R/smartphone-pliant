const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

/** 2339 → « 2 339 € » ; 2299.9 → « 2 299,90 € » */
export function euro(n: number): string {
  const hasCents = Math.round(n * 100) % 100 !== 0;
  return (
    new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: hasCents ? 2 : 0,
      maximumFractionDigits: hasCents ? 2 : 0,
    }).format(n) + ' €'
  );
}

/** 6.5 → « 6,5 » */
export function num(n: number, digits = 1): string {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: digits }).format(n);
}

/** « 2026-09-11 » → « 11 septembre 2026 » ; « 2026-05 » → « mai 2026 » */
export function frDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const month = months[m - 1];
  return d ? `${d === 1 ? '1er' : d} ${month} ${y}` : `${month} ${y}`;
}

/** 6.5 → « 6,5" » */
export function inches(n: number): string {
  return `${num(n, 2)}"`;
}

export function mah(n: number | null, fallback = 'n.c.'): string {
  return n ? `${new Intl.NumberFormat('fr-FR').format(n)} mAh` : fallback;
}

export function mm(n: number | null): string {
  return n ? `${num(n, 2)} mm` : 'n.c.';
}

export function readingTime(words: number): string {
  return `${Math.max(2, Math.round(words / 230))} min de lecture`;
}
