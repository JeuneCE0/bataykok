import { TransKey } from '../i18n';

/**
 * Saisons du rond : deux semaines, une récompense selon le rang atteint.
 * Sans reset du classement (frustrant tant que les adversaires sont simulés) —
 * l'enjeu est la récompense de fin, pas la remise à zéro.
 */
const SEASON_DAYS = 14;
export const SEASON_MS = SEASON_DAYS * 86_400_000;

export interface SeasonTier {
  maxRank: number;
  labelKey: TransKey;
  grains: number;
  piments: number;
  icon: string;
}

const SEASON_TIERS: SeasonTier[] = [
  { maxRank: 1, labelKey: 'season.tier.roi', grains: 6000, piments: 50, icon: '👑' },
  { maxRank: 3, labelKey: 'season.tier.podium', grains: 3500, piments: 30, icon: '🥇' },
  { maxRank: 10, labelKey: 'season.tier.top10', grains: 1800, piments: 15, icon: '🏆' },
  { maxRank: 25, labelKey: 'season.tier.top25', grains: 900, piments: 7, icon: '🎖️' },
  { maxRank: Infinity, labelKey: 'season.tier.batayer', grains: 300, piments: 2, icon: '🐓' },
];

export function tierForRank(rank: number): SeasonTier {
  return SEASON_TIERS.find((t) => rank <= t.maxRank) ?? SEASON_TIERS[SEASON_TIERS.length - 1];
}


