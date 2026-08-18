import { CLASSES, CLASS_LIST } from './classes';
import { mulberry32 } from './formulas';
import { botNames } from './names';
import { Appearance, Bot, ClassId, Fighter } from './types';

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

/** Génère l'échelle de 60 adversaires simulés (déterministe). */
export function generateLadder(): Bot[] {
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

/** Convertit un bot en combattant, stats dérivées de son niveau. */
export function botToFighter(bot: Bot): Fighter {
  const rand = mulberry32(bot.id.length * 7919 + bot.level * 104729);
  const c = CLASSES[bot.classId];
  const L = bot.level;
  const main = Math.round(8 + L * 3.2 + rand() * L);
  const side = Math.round(5 + L * 1.6 + rand() * L * 0.5);
  const attrs = {
    force: side,
    adresse: side,
    esprit: side,
    endurance: Math.round(6 + L * 2.4 + rand() * L * 0.5),
    chance: Math.round(4 + L * 1.2),
  };
  attrs[c.mainAttr] = main;
  const wBase = Math.round(2 + L * 2.1);
  return {
    name: bot.name,
    level: L,
    classId: bot.classId,
    attrs,
    weaponMin: wBase,
    weaponMax: wBase + Math.max(2, Math.round(wBase * 0.4)),
    armor: Math.round(L * 4.5),
    appearance: bot.appearance,
  };
}

export function classIdSafe(id: string): ClassId {
  return (id in CLASSES ? id : 'gep') as ClassId;
}
