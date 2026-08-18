import { CLASSES } from './classes';
import { Appearance, ClassId, Fighter, Rarity } from './types';

/**
 * La Route des Cirques : la progression PvE qui manquait. Contrairement au
 * rond (adversaires de ton niveau, gains réguliers), un étage se franchit une
 * seule fois, il est nettement au-dessus de toi, et il lâche une récompense
 * garantie. C'est le mur qui donne envie d'aller s'équiper.
 */
export interface Boss {
  floor: number;
  name: string;
  place: string;
  flavor: string;
  level: number;
  classId: ClassId;
  /** multiplicateur de statistiques par rapport à un adversaire du même niveau */
  power: number;
  appearance: Appearance;
  reward: {
    grains: number;
    xp: number;
    piments: number;
    rarity: Rarity;
  };
}

function look(
  bodyColor: string,
  combColor: string,
  tailPalette: number,
  accessory: number
): Appearance {
  return { bodyColor, combColor, tailPalette, accessory };
}

export const BOSSES: Boss[] = [
  {
    floor: 1,
    name: 'Ti Kok Sovaz',
    place: 'Ravine Saint-Gilles',
    flavor: "In ti kok maron i garde l'entrée de la ravine. Li lé pa gro, mé li mord.",
    level: 3,
    classId: 'sovaz',
    power: 1.1,
    appearance: look('#8d5524', '#e53935', 2, 0),
    reward: { grains: 220, xp: 90, piments: 1, rarity: 'korek' },
  },
  {
    floor: 2,
    name: 'Zarlor de Salazie',
    place: 'Hell-Bourg',
    flavor: 'Li kach son trézor dann kaz kréol. Faudra passe su li avant.',
    level: 6,
    classId: 'gep',
    power: 1.15,
    appearance: look('#5d4037', '#f9a825', 0, 4),
    reward: { grains: 420, xp: 190, piments: 1, rarity: 'korek' },
  },
  {
    floor: 3,
    name: 'Kok Vakoa',
    place: 'Forêt de Bébour',
    flavor: 'Son plimaz lé dur kom in vakoa. Les zéprons i glisse dessus.',
    level: 9,
    classId: 'gep',
    power: 1.2,
    appearance: look('#3b3b3b', '#c2185b', 4, 0),
    reward: { grains: 700, xp: 340, piments: 2, rarity: 'kalite' },
  },
  {
    floor: 4,
    name: 'Gardien de Cilaos',
    place: 'Cirque de Cilaos',
    flavor: "Le vié tisanèr la formé a li. I tape ek le pouvoir des plantes.",
    level: 12,
    classId: 'tizane',
    power: 1.25,
    appearance: look('#e8e4d8', '#6a1b9a', 4, 3),
    reward: { grains: 1100, xp: 560, piments: 2, rarity: 'kalite' },
  },
  {
    floor: 5,
    name: 'Bèf Mafate',
    place: 'Îlet à Malheur',
    flavor: "Trois jours de marche pou ariv jusqu'à li. Li lé pa content.",
    level: 15,
    classId: 'sovaz',
    power: 1.3,
    appearance: look('#b5541c', '#e53935', 2, 1),
    reward: { grains: 1700, xp: 850, piments: 3, rarity: 'kalite' },
  },
  {
    floor: 6,
    name: 'Sitarane',
    place: 'Cimetière de Saint-Pierre',
    flavor: "Le nom la pa prononsé apré minui. Li bat dann lonbraz.",
    level: 18,
    classId: 'malin',
    power: 1.35,
    appearance: look('#3b3b3b', '#6a1b9a', 3, 2),
    reward: { grains: 2500, xp: 1250, piments: 3, rarity: 'kalite' },
  },
  {
    floor: 7,
    name: 'Kok Volkan',
    place: 'Pas de Bellecombe',
    flavor: 'Son krèt i brile. Aproche a ou, ou sar kui.',
    level: 21,
    classId: 'piman',
    power: 1.4,
    appearance: look('#b5541c', '#ff7043', 2, 0),
    reward: { grains: 3600, xp: 1800, piments: 4, rarity: 'kalite' },
  },
  {
    floor: 8,
    name: 'Grand-Mère Kal',
    place: 'Piton Grand-Mère',
    flavor: "La légende i di li la jamé perdu in batay. Zamé.",
    level: 24,
    classId: 'tizane',
    power: 1.45,
    appearance: look('#e8e4d8', '#c2185b', 4, 3),
    reward: { grains: 5000, xp: 2500, piments: 5, rarity: 'mitik' },
  },
  {
    floor: 9,
    name: 'Kap Méchant',
    place: 'Sud sauvage',
    flavor: 'Li bat kom la houle : sa arète zamé, sa fatig pa.',
    level: 27,
    classId: 'gep',
    power: 1.5,
    appearance: look('#3b3b3b', '#e53935', 1, 1),
    reward: { grains: 7000, xp: 3400, piments: 5, rarity: 'mitik' },
  },
  {
    floor: 10,
    name: 'Papang Roi',
    place: 'Cirque de Mafate',
    flavor: "Le roi des zoizo i tourne dann siel. Li vwa a ou avan ou vwa a li.",
    level: 30,
    classId: 'malin',
    power: 1.55,
    appearance: look('#5d4037', '#f9a825', 0, 2),
    reward: { grains: 9500, xp: 4600, piments: 6, rarity: 'mitik' },
  },
  {
    floor: 11,
    name: 'Kok Fournèz',
    place: 'Cratère Dolomieu',
    flavor: 'Fé dann vèn, lav dann kèr. Le rond i tremble kan li rentre.',
    level: 34,
    classId: 'piman',
    power: 1.62,
    appearance: look('#b5541c', '#ff7043', 2, 4),
    reward: { grains: 13000, xp: 6200, piments: 8, rarity: 'mitik' },
  },
  {
    floor: 12,
    name: 'Zamal Gramoune',
    place: 'Hauts de Sainte-Rose',
    flavor: "Personn i koné son laz. Personn la vu a li perdre.",
    level: 38,
    classId: 'tizane',
    power: 1.7,
    appearance: look('#e8e4d8', '#6a1b9a', 4, 3),
    reward: { grains: 18000, xp: 8500, piments: 10, rarity: 'mitik' },
  },
  {
    floor: 13,
    name: 'Maloya Mistik',
    place: 'Grand-Bassin',
    flavor: "Le dernié. Son séga i fé danse la mor. Bon kouraz ti kok.",
    level: 42,
    classId: 'sega',
    power: 1.8,
    appearance: look('#7b1fa2', '#f9a825', 3, 4),
    reward: { grains: 26000, xp: 12000, piments: 15, rarity: 'mitik' },
  },
];

/** Statistiques du boss — mêmes formules qu'un bot, rehaussées par `power`. */
export function bossToFighter(boss: Boss): Fighter {
  const L = boss.level;
  const p = boss.power;
  const main = Math.round((8 + L * 3.2) * p);
  const side = Math.round((5 + L * 1.6) * p);
  const attrs = {
    force: side,
    adresse: side,
    esprit: side,
    endurance: Math.round((6 + L * 2.4) * p),
    chance: Math.round((4 + L * 1.2) * p),
  };
  attrs[CLASSES[boss.classId].mainAttr] = main;
  const wBase = Math.round((2 + L * 2.1) * p);
  const f: Fighter = {
    name: boss.name,
    level: L,
    classId: boss.classId,
    attrs,
    weaponMin: wBase,
    weaponMax: wBase + Math.max(2, Math.round(wBase * 0.4)),
    armor: Math.round(L * 4.5 * p),
    appearance: boss.appearance,
  };
  return f;
}

export const MAX_KEYS = 5;
export const KEY_PIMENT_COST = 3;
