import { GuildDef } from './types';

export const GUILDS: GuildDef[] = [
  {
    id: 'volcan',
    name: 'Lékip Volkan',
    motto: 'Nou lé chaud kom la lave !',
    emblem: '🌋',
    members: ['Volkan 974', 'La Fournèz', 'Piman Kabri', 'Ti Kok Dann Fé', 'Zeklair du Port'],
  },
  {
    id: 'mafate',
    name: 'Mafate Warriors',
    motto: 'Ni monte, ni désann, nou batay.',
    emblem: '⛰️',
    members: ['Léspri Mafate', 'Gramoune Fer', 'Ravine Blanche', 'Ti Baro', 'Salazie Fury'],
  },
  {
    id: 'chaudron',
    name: 'Kartié Chaudron',
    motto: 'Le rond lé nou !',
    emblem: '🥘',
    members: ['Roi du Chaudron', 'Béton Armé', 'Kok la Rage', 'Sin-Dni Killer', 'Ti Kréol'],
  },
  {
    id: 'lagon',
    name: 'Bann Lagon',
    motto: 'Fré kom lo lagon, vif kom le baracuda.',
    emblem: '🌊',
    members: ['Zoizo Blan', 'Paille en Ké', 'Bichik Sové', 'Tec Tec', 'Zatte Volante'],
  },
  {
    id: 'kabar',
    name: 'Fonnkèr Kabar',
    motto: 'Maloya dann kèr, zéprons dann pat.',
    emblem: '🥁',
    members: ['Fonnkèr Brizé', 'Dodo Lé La', 'Karyol Fou', 'Bal la Poussière', 'Ti Sitarane'],
  },
];

/** Bonus par niveau d'amélioration de guilde */
export const GUILD_XP_BONUS_PER_LEVEL = 2; // % XP
export const GUILD_GOLD_BONUS_PER_LEVEL = 2; // % grains
export const GUILD_UPGRADE_BASE_COST = 80;

export function guildUpgradeCost(level: number): number {
  return Math.round(GUILD_UPGRADE_BASE_COST * Math.pow(1.6, level));
}
