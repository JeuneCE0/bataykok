import { GuildDef } from './types';

export const GUILDS: GuildDef[] = [
  {
    id: 'volcan',
    name: 'Lékip Volkan',
    motto: 'Nou lé chaud kom la lave !',
    emblem: '🌋',
  },
  {
    id: 'mafate',
    name: 'Mafate Warriors',
    motto: 'Ni monte, ni désann, nou batay.',
    emblem: '⛰️',
  },
  {
    id: 'chaudron',
    name: 'Kartié Chaudron',
    motto: 'Le rond lé nou !',
    emblem: '🥘',
  },
  {
    id: 'lagon',
    name: 'Bann Lagon',
    motto: 'Fré kom lo lagon, vif kom le baracuda.',
    emblem: '🌊',
  },
  {
    id: 'kabar',
    name: 'Fonnkèr Kabar',
    motto: 'Maloya dann kèr, zéprons dann pat.',
    emblem: '🥁',
  },
];

/**
 * Bonus par niveau d'écurie. Le niveau est **partagé** : il monte avec ce que
 * tous les membres versent à la caisse commune (voir migration 0012), et le
 * bonus profite à chacun. Un niveau qu'on paie seul n'a jamais fait rencontrer
 * personne.
 */
export const GUILD_XP_BONUS_PER_LEVEL = 2; // % XP
export const GUILD_GOLD_BONUS_PER_LEVEL = 2; // % grains
