/**
 * Le jour de jeu suit l'heure **locale** du joueur, pas l'UTC : sinon la
 * journée bascule à 4 h du matin à La Réunion, au milieu d'une session.
 */
export function localDay(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Minuit local prochain : l'heure à laquelle motivation et défis reviennent. */
export function nextDailyReset(): number {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.getTime();
}

/** « 3 h 12 » — pour dire quand quelque chose revient. */
export function formatUntil(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h} h ${String(m).padStart(2, '0')}`;
  if (m > 0) return `${m} min`;
  return `${s} s`;
}


