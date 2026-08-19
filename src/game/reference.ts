import { CLASSES } from './classes';
import { generateItem, SLOT_LIST } from './items';
import { mulberry32 } from './formulas';
import { ClassId, PlayerState, Rarity } from './types';

/**
 * Le « joueur de référence » : ce qu'un joueur assidu possède à un niveau
 * donné, attributs achetés et équipement de sa gamme.
 *
 * Il vit ici, et pas dans un script, parce que l'équilibrage a déjà été faussé
 * une fois par un combattant fictif défini dans le seul script de tuning :
 * attributs plats, aucun équipement, un profil qui n'existait nulle part dans
 * le jeu. Le test et le banc d'essai partagent désormais cette définition.
 */
/**
 * Attributs qu'un joueur peut réellement financer à ce niveau.
 *
 * La courbe était posée à la main (linéaire, 2,6 par niveau). Elle est
 * maintenant dérivée du revenu : `scripts/economy-lab.ts` mesure les grains
 * gagnés pour atteindre chaque niveau, en déduit les points achetables si l'on
 * consacre 40 % de ses grains aux attributs, et la courbe suit — d'où
 * l'exposant, le revenu croissant moins vite que le coût du point.
 */
export const REFERENCE_CURVE = {
  exp: 1.41,
  main: 1.24,
  side: 0.44,
  endurance: 0.6,
  chance: 0.32,
} as const;

/** Points d'un attribut au niveau donné. */
export function curveAttr(level: number, coef: number, base: number): number {
  return Math.round(base + coef * Math.pow(level, REFERENCE_CURVE.exp));
}

/** Gamme qu'un joueur porte normalement à ce niveau. */
export function expectedRarity(level: number): Rarity {
  return level < 7
    ? 'commun'
    : level < 15
      ? 'korek'
      : level < 25
        ? 'kalite'
        : level < 34
          ? 'rar'
          : level < 41
            ? 'lezand'
            : 'mitik';
}

export function referencePlayer(
  classId: ClassId,
  level: number,
  gamme: Rarity | null = expectedRarity(level),
  rand: () => number = mulberry32(level * 7919 + classId.length)
): PlayerState {
  const equipment: PlayerState['equipment'] = {};
  if (gamme) for (const s of SLOT_LIST) equipment[s] = generateItem(level, s, gamme, rand);

  const side = curveAttr(level, REFERENCE_CURVE.side, 8);
  const attrs = {
    force: side,
    adresse: side,
    esprit: side,
    endurance: curveAttr(level, REFERENCE_CURVE.endurance, 9),
    chance: curveAttr(level, REFERENCE_CURVE.chance, 6),
  };
  attrs[CLASSES[classId].mainAttr] = curveAttr(level, REFERENCE_CURVE.main, 10);

  return {
    name: 'Référence',
    classId,
    level,
    xp: 0,
    appearance: { bodyColor: '#8d5524', combColor: '#e53935', tailPalette: 0, accessory: 0 },
    baseAttrs: attrs,
    equipment,
    inventory: [],
    grains: 0,
    piments: 0,
    honor: 100,
    rank: 1,
    wins: 0,
    losses: 0,
    guildId: null,
    transport: 0,
    talents: [],
    cosmetics: [],
  };
}
