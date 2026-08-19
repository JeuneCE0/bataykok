import { CLASSES } from './classes';
import { setBonuses } from './sets';
import { talentEffects } from './talents';
import { Attributes, AttrId, Fighter, Item, PlayerState, SlotId } from './types';

// ─── RNG utilitaire (seedable pour les bots) ─────────────────────────────
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const rnd = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// ─── Progression ─────────────────────────────────────────────────────────

/** XP nécessaire pour passer du niveau n au niveau n+1 */
export function xpForLevel(level: number): number {
  return Math.round(60 * Math.pow(level, 1.75) + 40 * level);
}

/**
 * Coût en grains pour monter un attribut de sa valeur actuelle n → n+1.
 *
 * L'exposant valait 1,9 : à haut niveau un point coûtait 1 400 grains quand un
 * objet de boutique en donnait 250 pour 900. Aucun joueur rationnel n'achetait
 * jamais d'attribut, et l'écran de la Kaz — avec ses boutons ×1 / ×5 / ×10 —
 * était un piège. Ramené à 1,45, l'écart avec la boutique reste large (il faut
 * bien que l'équipement soit l'axe excitant) sans être absurde.
 */
export function attrCost(current: number): number {
  return Math.round(3 + current * 1.2 + Math.pow(current, 1.45) / 3);
}

// ─── Attributs & équipement ──────────────────────────────────────────────

export function totalAttrs(p: PlayerState): Attributes {
  const t: Attributes = { ...p.baseAttrs };
  (Object.values(p.equipment) as Item[]).forEach((it) => {
    if (!it) return;
    (Object.keys(it.bonuses) as AttrId[]).forEach((k) => {
      t[k] += it.bonuses[k] ?? 0;
    });
  });
  const sets = setBonuses(p.equipment);
  (Object.keys(sets) as AttrId[]).forEach((k) => {
    t[k] += sets[k] ?? 0;
  });
  return t;
}

export function playerWeapon(p: PlayerState): { min: number; max: number } {
  const w = p.equipment.arme;
  if (w && w.dmgMin && w.dmgMax) return { min: w.dmgMin, max: w.dmgMax };
  // à coups de bec — arme de base
  const base = 1 + Math.round(p.level * 1.2);
  return { min: base, max: base + 3 };
}

export function playerArmor(p: PlayerState): number {
  let a = 0;
  (Object.values(p.equipment) as Item[]).forEach((it) => {
    if (it?.armor) a += it.armor;
  });
  return a;
}

export function maxHp(f: Fighter): number {
  const c = CLASSES[f.classId];
  return Math.max(1, Math.round(f.attrs.endurance * (f.level + 1) * c.hpMult));
}

export function playerToFighter(p: PlayerState): Fighter {
  const w = playerWeapon(p);
  const t = talentEffects(p.talents ?? []);
  const attrs = totalAttrs(p);
  return {
    name: p.name,
    level: p.level,
    classId: p.classId,
    attrs: {
      ...attrs,
      endurance: Math.round(attrs.endurance * (1 + t.hp)),
      chance: Math.round(attrs.chance * (1 + t.crit)),
    },
    weaponMin: Math.round(w.min * (1 + t.dmg)),
    weaponMax: Math.round(w.max * (1 + t.dmg)),
    armor: Math.round(playerArmor(p) * (1 + t.armor)),
    appearance: p.appearance,
  };
}

// ─── Économie / récompenses ──────────────────────────────────────────────

export function questGold(level: number, minutes: number): number {
  return Math.round((8 + level * 3.5) * minutes * (0.85 + Math.random() * 0.3));
}

/**
 * XP de quête, en valeur absolue.
 *
 * L'ancienne formule partait de `xpForLevel(level)` — l'exigence du palier —
 * si bien que le palier se simplifiait : il fallait 18 minutes de quête pour
 * monter d'un niveau, au niveau 3 comme au niveau 99. La courbe d'XP était
 * décorative. Un gain absolu qui croît moins vite que l'exigence redonne à la
 * progression sa pente.
 */
export function questXp(level: number, minutes: number): number {
  return Math.round((18 + level * 6) * minutes * (0.9 + Math.random() * 0.2));
}

export function arenaGold(level: number): number {
  return Math.round(10 + level * 5);
}

export function arenaXp(level: number): number {
  // même raison que `questXp` : une part fixe de l'exigence annule la courbe
  return Math.round(30 + level * 11);
}

/** grains obtenus en échange de piments (taux dépendant du niveau) */
export function grainsPerPiment(level: number): number {
  return Math.round(25 + level * 12);
}

// ─── Divers ──────────────────────────────────────────────────────────────

export const SLOT_LABELS: Record<SlotId, string> = {
  arme: 'Zéprons',
  tete: 'Kasket',
  torse: 'Gilet plimé',
  pattes: 'Zergos',
  amulette: 'Kolié',
  anneau: 'Bag',
  ceinture: 'Sintir',
  grigri: 'Gri-gri',
};

export const SLOT_ICONS: Record<SlotId, string> = {
  arme: '🗡️',
  tete: '🧢',
  torse: '🦺',
  pattes: '🥾',
  amulette: '📿',
  anneau: '💍',
  ceinture: '🪢',
  grigri: '🪬',
};

export function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 10_000) return (n / 1000).toFixed(1) + 'k';
  return String(Math.floor(n));
}
