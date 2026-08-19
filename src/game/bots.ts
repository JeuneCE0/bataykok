import { CLASSES, CLASS_LIST } from './classes';
import { mulberry32, playerToFighter } from './formulas';
import { SLOT_LIST, generateItem } from './items';
import { botNames } from './names';
import { Appearance, Bot, ClassId, Fighter, Item, PlayerState, Rarity, SlotId } from './types';

export const BODY_COLORS = ['#8d5524', '#3b3b3b', '#e8e4d8', '#b5541c', '#5d4037', '#7b1fa2'];
export const COMB_COLORS = ['#e53935', '#ff7043', '#c2185b', '#f9a825', '#6a1b9a'];
export const TAIL_PALETTES: string[][] = [
  ['#1b5e20', '#2e7d32', '#43a047'],
  ['#0d47a1', '#1976d2', '#42a5f5'],
  ['#b71c1c', '#e53935', '#ff7043'],
  ['#4a148c', '#7b1fa2', '#ab47bc'],
  ['#004d40', '#00897b', '#4db6ac'],
];
export const ACCESSORIES = ['Aucun', 'Bandana', 'Lunettes soleil', 'Chapo payanké', 'Chaîne en or'];

export function randomAppearance(rand: () => number = Math.random): Appearance {
  return {
    bodyColor: BODY_COLORS[Math.floor(rand() * BODY_COLORS.length)],
    combColor: COMB_COLORS[Math.floor(rand() * COMB_COLORS.length)],
    tailPalette: Math.floor(rand() * TAIL_PALETTES.length),
    accessory: Math.floor(rand() * ACCESSORIES.length),
  };
}

let ladderCache: Bot[] | null = null;

/**
 * L'échelle des 60 adversaires simulés. Déterministe, donc calculée une fois
 * pour toutes : deux écrans l'importaient et la reconstruisaient chacun.
 */
export function generateLadder(): Bot[] {
  if (ladderCache) return ladderCache;
  return (ladderCache = buildLadder());
}

function buildLadder(): Bot[] {
  const rand = mulberry32(974974);
  const names = botNames();
  const bots: Bot[] = [];
  for (let i = 0; i < 60; i++) {
    const classId = CLASS_LIST[Math.floor(rand() * CLASS_LIST.length)].id;
    // rang 1 = niveau ~42, rang 60 = niveau 1
    const level = Math.max(1, Math.round(42 - i * 0.7 + rand() * 3));
    bots.push({
      id: `bot${i}`,
      name: names[i % names.length],
      classId,
      level,
      appearance: randomAppearance(rand),
    });
  }
  return bots;
}

// ─── Profil d'un bot ──────────────────────────────────────────────────────

/**
 * Attributs *achetés* d'un bot, hors équipement. Volontairement calqués sur ce
 * qu'un joueur assidu possède au même niveau : l'adversaire doit être un
 * miroir, pas une courbe parallèle.
 */
const BASE = { main: 2.6, side: 1.1, endurance: 1.6, chance: 0.8 } as const;

/**
 * Gamme portée selon le niveau. C'est *la* raison d'être de ce fichier : sans
 * équipement, un bot n'avait que ses attributs de base, et le joueur passait
 * de 0 % à 100 % de victoires en s'achetant une panoplie kalité — le rond
 * n'opposait plus aucune résistance passé le premier palier de boutique.
 */
function rarityForLevel(level: number, roll: number): Rarity {
  const tiers: Rarity[] = ['commun', 'korek', 'kalite', 'rar', 'lezand', 'mitik'];
  const base = level < 7 ? 0 : level < 15 ? 1 : level < 25 ? 2 : level < 34 ? 3 : level < 41 ? 4 : 5;
  // ±1 palier : deux bots du même niveau ne se ressemblent pas
  const jitter = roll < 0.22 ? -1 : roll > 0.88 ? 1 : 0;
  return tiers[Math.max(0, Math.min(5, base + jitter))];
}

const profileCache = new Map<string, PlayerState>();

/** Équipement et attributs d'un bot — déterministes, donc mémoïsables. */
export function botProfile(bot: Bot): PlayerState {
  const cached = profileCache.get(bot.id);
  if (cached) return cached;

  const rand = mulberry32(hashId(bot.id) ^ (bot.level * 104729));
  const L = bot.level;
  const equipment: Partial<Record<SlotId, Item>> = {};
  for (const slot of SLOT_LIST) {
    // tout le monde n'est pas équipé de pied en cap — un trou laisse une prise
    if (slot !== 'arme' && rand() < 0.16) continue;
    const lvl = Math.max(1, L + Math.round(rand() * 4 - 2));
    equipment[slot] = generateItem(lvl, slot, rarityForLevel(L, rand()), rand);
  }

  const main = Math.round(10 + L * BASE.main);
  const side = Math.round(8 + L * BASE.side);
  const attrs = {
    force: side,
    adresse: side,
    esprit: side,
    endurance: Math.round(9 + L * BASE.endurance),
    chance: Math.round(6 + L * BASE.chance),
  };
  attrs[CLASSES[bot.classId].mainAttr] = main;

  const profile: PlayerState = {
    name: bot.name,
    classId: bot.classId,
    level: L,
    xp: 0,
    appearance: bot.appearance,
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
  };
  profileCache.set(bot.id, profile);
  return profile;
}

/** Le bot est un combattant comme un autre : mêmes formules que le joueur. */
export function botToFighter(bot: Bot): Fighter {
  return playerToFighter(botProfile(bot));
}

function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
