import { TransKey } from '../i18n';

/**
 * Paliers d'honneur.
 *
 * Le seul plancher était zéro : une mauvaise série coûtait tout l'honneur
 * accumulé, sans filet. C'est exactement le moment où un joueur ferme l'app
 * pour de bon. Chaque palier franchi est désormais acquis — on peut redescendre
 * à l'intérieur d'un palier, jamais en dessous.
 *
 * Le plancher est appliqué **côté serveur** (`submit_arena_result`) : l'honneur
 * ne s'écrit plus depuis le client, une version locale ne serait que décor.
 */
export interface RankTier {
  /** honneur à atteindre pour décrocher le palier — et plancher une fois acquis */
  floor: number;
  nameKey: TransKey;
  icon: string;
  color: string;
}

export const RANK_TIERS: RankTier[] = [
  { floor: 0, nameKey: 'rank.tikok', icon: '🐣', color: '#9AA6AD' },
  { floor: 150, nameKey: 'rank.batayer', icon: '🐓', color: '#3BD97E' },
  { floor: 300, nameKey: 'rank.konu', icon: '⚔️', color: '#3BA9F0' },
  { floor: 500, nameKey: 'rank.respekte', icon: '🎖️', color: '#B06BFF' },
  { floor: 750, nameKey: 'rank.lezand', icon: '🔥', color: '#FF8A3D' },
  { floor: 1100, nameKey: 'rank.roi', icon: '👑', color: '#FFC93C' },
];

/** Palier correspondant à un montant d'honneur. */
export function tierForHonor(honor: number): RankTier {
  let out = RANK_TIERS[0];
  for (const t of RANK_TIERS) if (honor >= t.floor) out = t;
  return out;
}

/** Palier suivant, ou `null` si le sommet est atteint. */
export function nextTier(honor: number): RankTier | null {
  return RANK_TIERS.find((t) => t.floor > honor) ?? null;
}

/** Plancher acquis : on ne redescend jamais sous le palier atteint. */
export function honorFloor(peak: number): number {
  return tierForHonor(peak).floor;
}
