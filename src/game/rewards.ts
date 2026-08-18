import { arenaGold, arenaXp } from './formulas';

/**
 * Récompenses de batay.
 *
 * Trois principes, tous absents du prototype d'origine :
 *  - une défaite rapporte quand même quelque chose. Perdre trois jetons pour
 *    zéro progression, c'est ce qui fait fermer l'app.
 *  - battre plus fort que soi paie mieux que battre plus faible.
 *  - une série de victoires se ressent.
 */

export interface RewardPart {
  label: string;
  /** facteur appliqué (1.2 = +20 %) */
  mult: number;
}

export interface BatayReward {
  gold: number;
  xp: number;
  honor: number;
  parts: RewardPart[];
}

/** Défaite : on garde une part franche, pas symbolique. */
const LOSS_GOLD = 0.35;
const LOSS_XP = 0.5;

/** Plafond du bonus « outsider » et de la série. */
const MAX_UNDERDOG = 0.6;
const MAX_STREAK = 0.5;

export function streakBonus(streak: number): number {
  return Math.min(MAX_STREAK, Math.max(0, streak - 1) * 0.1);
}

export function underdogBonus(myPower: number, opPower: number): number {
  if (myPower <= 0 || opPower <= myPower) return 0;
  return Math.min(MAX_UNDERDOG, opPower / myPower - 1);
}

export function arenaReward({
  won,
  level,
  myPower,
  opPower,
  streak,
  online,
}: {
  won: boolean;
  level: number;
  myPower: number;
  opPower: number;
  /** série de victoires AVANT ce combat */
  streak: number;
  online: boolean;
}): BatayReward {
  const parts: RewardPart[] = [];
  let gold = arenaGold(level);
  let xp = arenaXp(level);

  if (!won) {
    gold = Math.round(gold * LOSS_GOLD);
    xp = Math.round(xp * LOSS_XP);
    parts.push({ label: 'Défèt — ti konsolasyon', mult: LOSS_XP });
  }

  const underdog = underdogBonus(myPower, opPower);
  if (underdog > 0) {
    parts.push({ label: 'Pli for ke ou', mult: 1 + underdog });
    gold = Math.round(gold * (1 + underdog));
    xp = Math.round(xp * (1 + underdog));
  }

  if (won) {
    const sb = streakBonus(streak + 1);
    if (sb > 0) {
      parts.push({ label: `Séri de ${streak + 1} viktoir`, mult: 1 + sb });
      gold = Math.round(gold * (1 + sb));
      xp = Math.round(xp * (1 + sb));
    }
  }

  if (online) {
    // plein tarif sur une victoire, moitié sur une défaite : sinon perdre
    // exprès en ligne rapporterait presque autant que gagner en local
    const m = won ? 1.5 : 1.25;
    parts.push({ label: 'Batay en lign', mult: m });
    gold = Math.round(gold * m);
    xp = Math.round(xp * m);
  }

  // l'honneur suit le mérite : battre plus fort en rapporte davantage
  const honor = won
    ? Math.round(8 * (1 + underdog))
    : -Math.max(2, Math.round(5 * (1 - underdog)));

  return { gold, xp, honor, parts };
}

/**
 * Donjon : un gardien qu'on n'a pas fait tomber laisse quand même de quoi
 * revenir — proportionnellement aux dégâts infligés. Échouer à 5 % près ne
 * doit pas donner la même chose que se faire balayer.
 */
export function bossConsolation(
  reward: { grains: number; xp: number },
  damageRatio: number
): { grains: number; xp: number } {
  const r = Math.max(0, Math.min(1, damageRatio));
  return {
    grains: Math.round(reward.grains * 0.25 * r),
    xp: Math.round(reward.xp * 0.4 * r),
  };
}
