import { TransKey } from '../i18n';
import { AttrId, Item, SlotId } from './types';

/**
 * Les uniques.
 *
 * Un palier de gamme de plus n'aurait fait qu'ajouter une couleur. Ce qui se
 * raconte, c'est un objet qu'on nomme : « j'ai trouvé les Zéprons de Sitarane ».
 * Chacun porte donc son nom, sa légende et un profil de statistiques taillé à
 * la main plutôt qu'un tirage.
 *
 * Ils ne tombent que sur un tirage `zanset` — un sur mille — et le premier
 * exemplaire déclenche l'ouverture de coffre la plus longue du jeu.
 */
export interface UniqueDef {
  id: string;
  slot: SlotId;
  nameKey: TransKey;
  loreKey: TransKey;
  icon: string;
  /** part de la valeur totale versée dans chaque attribut (somme ≈ 1) */
  spread: Partial<Record<AttrId, number>>;
  /** multiplicateur appliqué au budget de l'objet — l'identité de l'unique */
  weaponBias?: number;
  armorBias?: number;
}

export const UNIQUES: UniqueDef[] = [
  {
    id: 'zepron_sitarane',
    slot: 'arme',
    nameKey: 'unique.zepron_sitarane.name',
    loreKey: 'unique.zepron_sitarane.lore',
    icon: '🗡️',
    spread: { force: 0.55, chance: 0.45 },
    weaponBias: 1.5,
  },
  {
    id: 'kouronn_papang',
    slot: 'tete',
    nameKey: 'unique.kouronn_papang.name',
    loreKey: 'unique.kouronn_papang.lore',
    icon: '👑',
    spread: { adresse: 0.6, esprit: 0.4 },
    armorBias: 1.3,
  },
  {
    id: 'plimaz_fournez',
    slot: 'torse',
    nameKey: 'unique.plimaz_fournez.name',
    loreKey: 'unique.plimaz_fournez.lore',
    icon: '🌋',
    spread: { endurance: 0.7, force: 0.3 },
    armorBias: 1.8,
  },
  {
    id: 'pat_mafate',
    slot: 'pattes',
    nameKey: 'unique.pat_mafate.name',
    loreKey: 'unique.pat_mafate.lore',
    icon: '🥾',
    spread: { adresse: 0.5, endurance: 0.5 },
    armorBias: 1.4,
  },
  {
    id: 'kolie_grandbasin',
    slot: 'amulette',
    nameKey: 'unique.kolie_grandbasin.name',
    loreKey: 'unique.kolie_grandbasin.lore',
    icon: '📿',
    spread: { esprit: 0.75, chance: 0.25 },
  },
  {
    id: 'bag_gramoune',
    slot: 'anneau',
    nameKey: 'unique.bag_gramoune.name',
    loreKey: 'unique.bag_gramoune.lore',
    icon: '💍',
    spread: { chance: 0.8, esprit: 0.2 },
  },
  {
    id: 'sintir_kabar',
    slot: 'ceinture',
    nameKey: 'unique.sintir_kabar.name',
    loreKey: 'unique.sintir_kabar.lore',
    icon: '🪢',
    spread: { force: 0.4, esprit: 0.4, endurance: 0.2 },
    armorBias: 1.2,
  },
  {
    id: 'grigri_zanset',
    slot: 'grigri',
    nameKey: 'unique.grigri_zanset.name',
    loreKey: 'unique.grigri_zanset.lore',
    icon: '🪬',
    spread: { force: 0.25, adresse: 0.25, esprit: 0.25, endurance: 0.25 },
  },
];

export const UNIQUE_BY_ID: Record<string, UniqueDef> = UNIQUES.reduce(
  (acc, u) => {
    acc[u.id] = u;
    return acc;
  },
  {} as Record<string, UniqueDef>
);

/** Budget d'attributs d'un unique à ce niveau — nettement au-dessus du mitik. */
const UNIQUE_BUDGET = (level: number) => Math.round((1 + level * 0.42) * 6.5 * 4);

/**
 * Forge un unique. Les statistiques sont dérivées du niveau et du profil, sans
 * aléa : deux joueurs qui trouvent le même unique au même niveau ont le même
 * objet. C'est ce qui en fait une référence dont on peut parler.
 */
export function forgeUnique(def: UniqueDef, level: number, seq: number): Item {
  const budget = UNIQUE_BUDGET(level);
  const bonuses: Partial<Record<AttrId, number>> = {};
  (Object.keys(def.spread) as AttrId[]).forEach((k) => {
    bonuses[k] = Math.max(1, Math.round(budget * (def.spread[k] ?? 0)));
  });

  const item: Item = {
    id: `uq${level}_${def.id}_${seq}`,
    slot: def.slot,
    name: def.id, // remplacé à l'affichage par la traduction (voir itemLabel)
    rarity: 'zanset',
    level,
    bonuses,
    price: 0,
    uniqueId: def.id,
  };

  if (def.slot === 'arme') {
    const base = Math.round((2 + level * 1.6) * 6.5 * (def.weaponBias ?? 1));
    item.dmgMin = base;
    item.dmgMax = base + Math.max(3, Math.round(base * 0.35));
  } else if (def.armorBias) {
    item.armor = Math.max(1, Math.round(level * 2.2 * 6.5 * def.armorBias));
  }

  return item;
}

let uniqueSeq = 0;

/**
 * Tire un unique pour ce niveau. `slot` est respecté quand il est fourni :
 * une boutique qui promet une arme ne doit pas rendre un collier.
 */
export function rollUnique(
  level: number,
  rand: () => number = Math.random,
  slot?: SlotId
): Item {
  const pool = slot ? UNIQUES.filter((u) => u.slot === slot) : UNIQUES;
  const def = pool[Math.floor(rand() * pool.length)] ?? UNIQUES[0];
  return forgeUnique(def, level, uniqueSeq++);
}
