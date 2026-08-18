/**
 * Saisons du rond : deux semaines, une récompense selon le rang atteint.
 * Sans reset du classement (frustrant tant que les adversaires sont simulés) —
 * l'enjeu est la récompense de fin, pas la remise à zéro.
 */
export const SEASON_DAYS = 14;
export const SEASON_MS = SEASON_DAYS * 86_400_000;

export interface SeasonTier {
  maxRank: number;
  label: string;
  grains: number;
  piments: number;
  icon: string;
}

export const SEASON_TIERS: SeasonTier[] = [
  { maxRank: 1, label: 'Roi du rond', grains: 6000, piments: 50, icon: '👑' },
  { maxRank: 3, label: 'Podium', grains: 3500, piments: 30, icon: '🥇' },
  { maxRank: 10, label: 'Top 10', grains: 1800, piments: 15, icon: '🏆' },
  { maxRank: 25, label: 'Top 25', grains: 900, piments: 7, icon: '🎖️' },
  { maxRank: Infinity, label: 'Batayeur', grains: 300, piments: 2, icon: '🐓' },
];

export function tierForRank(rank: number): SeasonTier {
  return SEASON_TIERS.find((t) => rank <= t.maxRank) ?? SEASON_TIERS[SEASON_TIERS.length - 1];
}

export function seasonNumber(start: number, now: number): number {
  return 1 + Math.max(0, Math.floor((now - start) / SEASON_MS));
}

export function seasonEndsAt(start: number): number {
  return start + SEASON_MS;
}
