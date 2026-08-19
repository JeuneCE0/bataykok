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
export const REFERENCE_CURVE = {
  main: 2.6,
  side: 1.1,
  endurance: 1.6,
  chance: 0.8,
} as const;

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

  const side = Math.round(8 + level * REFERENCE_CURVE.side);
  const attrs = {
    force: side,
    adresse: side,
    esprit: side,
    endurance: Math.round(9 + level * REFERENCE_CURVE.endurance),
    chance: Math.round(6 + level * REFERENCE_CURVE.chance),
  };
  attrs[CLASSES[classId].mainAttr] = Math.round(10 + level * REFERENCE_CURVE.main);

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
