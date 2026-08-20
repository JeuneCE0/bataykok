import { playerToFighter } from './formulas';
import { referencePlayer } from './reference';
import { TransKey } from '../i18n';
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
  flavorKey: TransKey;
  level: number;
  classId: ClassId;
  /**
   * Écart au joueur de référence de son niveau.
   *
   * Rampe régulière 1,00 → 1,30 plutôt que des valeurs ajustées au taux de
   * victoire : à ces niveaux le combat est quasi déterministe (8 % de
   * statistiques font 30 points de victoire), donc viser un pourcentage revient
   * à sur-ajuster du bruit. La difficulté vient d'abord du niveau du gardien —
   * ici, monotone par construction.
   */
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
    flavorKey: 'boss.tikok.flavor',
    level: 3,
    classId: 'sovaz',
    power: 1.0,
    appearance: look('#8d5524', '#e53935', 2, 0),
    reward: { grains: 220, xp: 90, piments: 1, rarity: 'korek' },
  },
  {
    floor: 2,
    name: 'Zarlor de Salazie',
    place: 'Hell-Bourg',
    flavorKey: 'boss.zarlor.flavor',
    level: 6,
    classId: 'gep',
    power: 1.025,
    appearance: look('#5d4037', '#f9a825', 0, 4),
    reward: { grains: 420, xp: 190, piments: 1, rarity: 'korek' },
  },
  {
    floor: 3,
    name: 'Kok Vakoa',
    place: 'Forêt de Bébour',
    flavorKey: 'boss.vakoa.flavor',
    level: 9,
    classId: 'gep',
    power: 1.05,
    appearance: look('#3b3b3b', '#c2185b', 4, 0),
    reward: { grains: 700, xp: 340, piments: 2, rarity: 'kalite' },
  },
  {
    floor: 4,
    name: 'Gardien de Cilaos',
    place: 'Cirque de Cilaos',
    flavorKey: 'boss.cilaos.flavor',
    level: 12,
    classId: 'tizane',
    power: 1.075,
    appearance: look('#e8e4d8', '#6a1b9a', 4, 3),
    reward: { grains: 1100, xp: 560, piments: 2, rarity: 'kalite' },
  },
  {
    floor: 5,
    name: 'Bèf Mafate',
    place: 'Îlet à Malheur',
    flavorKey: 'boss.mafate.flavor',
    level: 15,
    classId: 'sovaz',
    power: 1.1,
    appearance: look('#b5541c', '#e53935', 2, 1),
    reward: { grains: 1700, xp: 850, piments: 3, rarity: 'kalite' },
  },
  {
    floor: 6,
    name: 'Sitarane',
    place: 'Cimetière de Saint-Pierre',
    flavorKey: 'boss.sitarane.flavor',
    level: 18,
    classId: 'malin',
    power: 1.125,
    appearance: look('#3b3b3b', '#6a1b9a', 3, 2),
    reward: { grains: 2500, xp: 1250, piments: 3, rarity: 'rar' },
  },
  {
    floor: 7,
    name: 'Kok Volkan',
    place: 'Pas de Bellecombe',
    flavorKey: 'boss.volkan.flavor',
    level: 21,
    classId: 'piman',
    power: 1.15,
    appearance: look('#b5541c', '#ff7043', 2, 0),
    reward: { grains: 3600, xp: 1800, piments: 4, rarity: 'rar' },
  },
  {
    floor: 8,
    name: 'Grand-Mère Kal',
    place: 'Piton Grand-Mère',
    flavorKey: 'boss.grandmere.flavor',
    level: 24,
    classId: 'tizane',
    power: 1.175,
    appearance: look('#e8e4d8', '#c2185b', 4, 3),
    reward: { grains: 5000, xp: 2500, piments: 5, rarity: 'rar' },
  },
  {
    floor: 9,
    name: 'Kap Méchant',
    place: 'Sud sauvage',
    flavorKey: 'boss.capmechant.flavor',
    level: 27,
    classId: 'gep',
    power: 1.16,
    appearance: look('#3b3b3b', '#e53935', 1, 1),
    reward: { grains: 7000, xp: 3400, piments: 5, rarity: 'lezand' },
  },
  {
    floor: 10,
    name: 'Papang Roi',
    place: 'Cirque de Mafate',
    flavorKey: 'boss.papang.flavor',
    level: 30,
    classId: 'malin',
    power: 1.225,
    appearance: look('#5d4037', '#f9a825', 0, 2),
    reward: { grains: 9500, xp: 4600, piments: 6, rarity: 'lezand' },
  },
  {
    floor: 11,
    name: 'Kok Fournèz',
    place: 'Cratère Dolomieu',
    flavorKey: 'boss.fournez.flavor',
    level: 34,
    classId: 'piman',
    power: 1.2,
    appearance: look('#b5541c', '#ff7043', 2, 4),
    reward: { grains: 13000, xp: 6200, piments: 8, rarity: 'lezand' },
  },
  {
    floor: 12,
    name: 'Zamal Gramoune',
    place: 'Hauts de Sainte-Rose',
    flavorKey: 'boss.zamal.flavor',
    level: 38,
    classId: 'tizane',
    power: 1.24,
    appearance: look('#e8e4d8', '#6a1b9a', 4, 3),
    reward: { grains: 18000, xp: 8500, piments: 10, rarity: 'mitik' },
  },
  {
    floor: 13,
    name: 'Maloya Mistik',
    place: 'Grand-Bassin',
    flavorKey: 'boss.maloya.flavor',
    level: 42,
    classId: 'sega',
    power: 1.12,
    appearance: look('#7b1fa2', '#f9a825', 3, 4),
    reward: { grains: 26000, xp: 12000, piments: 15, rarity: 'mitik' },
  },
];

/**
 * Statistiques du gardien.
 *
 * Elles dérivaient d'une formule d'attributs propre au donjon, restée figée
 * quand la courbe du joueur a changé : à partir de l'étage 5, le joueur de
 * référence gagnait 100 % du temps. Le gardien est désormais un joueur de
 * référence de son niveau, équipé, dont les attributs et l'arme sont rehaussés
 * par `power` — il reste donc calé sur la progression réelle.
 */
export function bossToFighter(boss: Boss): Fighter {
  // équipé comme un joueur de son niveau : c'est `power` qui fait l'écart,
  // sinon la gamme du butin comptait deux fois
  const base = playerToFighter(referencePlayer(boss.classId, boss.level));
  const p = boss.power;
  return {
    ...base,
    name: boss.name,
    appearance: boss.appearance,
    attrs: {
      force: Math.round(base.attrs.force * p),
      adresse: Math.round(base.attrs.adresse * p),
      esprit: Math.round(base.attrs.esprit * p),
      endurance: Math.round(base.attrs.endurance * p),
      chance: Math.round(base.attrs.chance * p),
    },
    weaponMin: Math.round(base.weaponMin * p),
    weaponMax: Math.round(base.weaponMax * p),
    armor: Math.round(base.armor * p),
  };
}

export const MAX_KEYS = 5;
export const KEY_PIMENT_COST = 3;
