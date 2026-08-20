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

/**
 * Plafond des barres de bonus à l'écran.
 *
 * Elles étaient graduées sur 100 % : au niveau 1, un bonus de 2 % donnait une
 * barre vide et l'écurie paraissait ne rien apporter. 30 % correspond au
 * niveau 15 — une cible qu'une écurie active atteint en quelques semaines.
 */
export const GUILD_BONUS_SCALE = 30;

/**
 * Trois montants de don calés sur la bourse du joueur.
 *
 * Des paliers fixes (500 / 2 000 / 10 000) laissaient un joueur à 437 grains
 * devant trois boutons éteints : la caisse commune ne s'ouvrait qu'aux riches.
 * Ici il y a toujours au moins une somme à portée, et l'échelle suit celui qui
 * a de quoi donner.
 */
/**
 * Plafond de dons par 24 h — la même valeur que `donate_to_guild` (migration
 * 0012). Sans elle côté client, le plus gros palier d'un joueur fortuné
 * dépassait le plafond et le bouton échouait à tous les coups.
 */
export const GUILD_DAILY_CAP = 50_000;

export function donationTiers(grains: number, donneAujourdhui = 0): number[] {
  const marge = Math.max(0, GUILD_DAILY_CAP - donneAujourdhui);
  const plafond = Math.min(grains, marge);
  const arrondi = (n: number) => {
    if (n < 100) return Math.max(10, Math.round(n / 10) * 10);
    if (n < 1000) return Math.round(n / 50) * 50;
    return Math.round(n / 500) * 500;
  };
  const brut = [grains * 0.1, grains * 0.3, grains * 0.6]
    .map((n) => Math.min(n, plafond))
    .map(arrondi);
  // dédoublonner : mieux vaut deux boutons distincts que trois identiques
  return [...new Set(brut)].filter((n) => n >= 10 && n <= plafond);
}
