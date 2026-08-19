import { TransKey } from '../i18n';
import { ATTR_LABELS } from './classes';
import { rnd } from './formulas';
import { SETS } from './sets';
import { rollUnique } from './uniques';
import { AttrId, Item, Rarity, SlotId } from './types';

export const RARITY_LABELS: Record<Rarity, string> = {
  commun: 'Commun',
  korek: 'Korek',
  kalite: 'Kalité',
  rar: 'Rar',
  lezand: 'Lézandèr',
  mitik: 'Mitik',
  zanset: 'Zanset',
};

export const RARITY_COLORS: Record<Rarity, string> = {
  commun: '#9AA6AD',
  korek: '#3BD97E',
  kalite: '#3BA9F0',
  rar: '#B06BFF',
  lezand: '#FF8A3D',
  mitik: '#FFC93C',
  zanset: '#FF2E63',
};

/** L'ordre fait foi : tri, comparaison, progression du Zalbum. */
export const RARITY_ORDER: Rarity[] = [
  'commun',
  'korek',
  'kalite',
  'rar',
  'lezand',
  'mitik',
  'zanset',
];

export function rarityRank(r: Rarity): number {
  return RARITY_ORDER.indexOf(r);
}

/**
 * Gamme d'exception : mitik ou au-dessus.
 *
 * Six endroits comparaient à `'mitik'` en littéral. Quand « zanset » est venu
 * se placer au-dessus, trouver l'objet le plus rare du jeu ne validait plus
 * l'étape « Trouv in objè Mitik » — le même trou qui avait figé le chemin du
 * ti kok à 7/12.
 */
export function isTopRarity(r: Rarity | undefined): boolean {
  return r !== undefined && rarityRank(r) >= rarityRank('mitik');
}

const RARITY_MULT: Record<Rarity, number> = {
  commun: 1,
  korek: 1.35,
  kalite: 1.8,
  rar: 2.4,
  lezand: 3.2,
  mitik: 4.4,
  zanset: 6.5,
};

/** Un nom par gamme : la rareté doit s'entendre avant même de lire la couleur. */
const SLOT_NAMES: Record<SlotId, string[]> = {
  arme: [
    'Zéprons', 'Lames de patte', 'Zéprons forgés',
    'Grif volkanik', 'Zéprons du Gran Brilé', 'Grif de Sitarane',
    'Zéprons dé Zanset',
  ],
  tete: [
    'Kasket', 'Bandana', 'Chapo payanké',
    'Kask la fournèz', 'Kouronn de Mafate', 'Kask du Maloya Mistik',
    'Kouronn dé Zanset',
  ],
  torse: [
    'Gilet plimé', 'Plastron koko', 'Armure vakoa',
    'Plimaz doré', 'Kirass du Piton', 'Plimaz de Grand-Mèr Kal',
    'Plimaz dé Zanset',
  ],
  pattes: [
    'Zergos', 'Bot la boue', 'Pat renforcées',
    'Zergos siklone', 'Zergos du Papang Roi', 'Pat de la Fournèz',
    'Pat dé Zanset',
  ],
  amulette: [
    'Kolié koki', 'Kolié bwa de santal', 'Kolié perle noire',
    'Kolié volkan', 'Kolié dé Sèt Kaskad', 'Kolié du Gran-Basin',
    'Kolié dé Zanset',
  ],
  anneau: [
    'Bag laiton', 'Bag larzan', 'Bag lor',
    'Bag mitik', 'Bag du Vié Tisanèr', 'Bag dé Anset',
    'Bag dé Zanset',
  ],
  ceinture: [
    'Sintir chanvre', 'Sintir kuir', 'Sintir géranium',
    'Sintir gran-mèr kal', 'Sintir du Kabar', 'Sintir dé Sirk',
    'Sintir dé Zanset',
  ],
  grigri: [
    'Ti gri-gri', 'Gri-gri tisanèr', 'Gri-gri sitarane',
    'Gri-gri gramoune', 'Gri-gri du Volkan', 'Gri-gri dé Zanset',
    'Gri-gri dé Zanset',
  ],
};

const SUFFIXES = [
  'du Chaudron',
  'de Mafate',
  'du Piton',
  'de Grand-Bassin',
  "de l'Ermitage",
  'du Maïdo',
  'de Cap Méchant',
  'de la Ravine',
  'du Tremblet',
  'de Takamaka',
  'du Gramoune',
  'de Ti-Jean',
];

const ATTRS: AttrId[] = ['force', 'adresse', 'esprit', 'endurance', 'chance'];

let itemSeq = 0;

/**
 * Tirage de gamme. Les deux derniers paliers restent rares au point d'être un
 * événement : c'est ce qui donne sa valeur au reste (et à l'hôtel des ventes).
 */
export function rollRarity(luck = 0, rand: () => number = Math.random): Rarity {
  // décaler la plage vers le haut, pas la rétrécir vers le bas : l'ancienne
  // formule faisait disparaître rar, lézandèr et mitik dès luck = 0,1
  const l = Math.min(0.25, Math.max(0, luck));
  const r = rand() * (1 - l) + l;
  if (r < 0.46) return 'commun';
  if (r < 0.74) return 'korek';
  if (r < 0.90) return 'kalite';
  if (r < 0.968) return 'rar';
  if (r < 0.995) return 'lezand';
  // Zanset : un tirage sur mille. Assez rare pour qu'un joueur s'en souvienne,
  // assez atteignable pour que le palier ne soit pas décoratif.
  if (r < 0.999) return 'mitik';
  return 'zanset';
}

export const SLOT_LIST: SlotId[] = [
  'arme', 'tete', 'torse', 'pattes', 'amulette', 'anneau', 'ceinture', 'grigri',
];

/**
 * `rand` est injectable parce que l'équipement des bots doit être déterministe :
 * `botToFighter` est appelé à chaque rendu de l'échelle, et un adversaire dont
 * la puissance change entre deux affichages est un adversaire dont on ne peut
 * pas évaluer les chances.
 */
/**
 * Valeur intrinsèque d'un objet, indépendante de la classe.
 *
 * Le prix en dérivait auparavant du seul niveau (`15 + level * 9`), ce qui
 * rendait un kolié mitik à 4 bonus moins cher que la moitié d'un point
 * d'attribut acheté à la Kaz. Le puits de grains était donc inopérant : aucun
 * joueur rationnel n'achetait jamais d'attribut. Le prix suit désormais ce
 * que l'objet apporte vraiment.
 */
export function itemValue(it: Item): number {
  let v = 0;
  if (it.dmgMin && it.dmgMax) v += ((it.dmgMin + it.dmgMax) / 2) * DMG_VALUE;
  if (it.armor) v += it.armor * ARMOR_VALUE;
  (Object.keys(it.bonuses) as AttrId[]).forEach((k) => {
    v += (it.bonuses[k] ?? 0) * (k === 'endurance' ? 1.5 : 1);
  });
  return v;
}

/** Un point de dégât moyen vaut plus qu'un point d'attribut : il frappe à chaque tour. */
const DMG_VALUE = 3;
const ARMOR_VALUE = 1.3;
/** Grains par point de valeur — le levier qui aligne boutique et Kaz. */
export const GRAINS_PER_VALUE = 3.1;

export function itemPrice(it: Item, rand: () => number = Math.random): number {
  const setPremium = it.setId ? 1.25 : 1;
  return Math.max(
    5,
    Math.round(itemValue(it) * GRAINS_PER_VALUE * setPremium * (0.88 + rand() * 0.24))
  );
}

/** Ce que le marchand rachète — deux écrans en avaient chacun leur copie. */
export function resaleValue(it: Item): number {
  return Math.max(1, Math.round(it.price * 0.4));
}

export function generateItem(
  level: number,
  slot?: SlotId,
  rarity?: Rarity,
  rand: () => number = Math.random
): Item {
  const pick = (n: number) => Math.floor(rand() * n);
  const s: SlotId = slot ?? SLOT_LIST[pick(8)];
  const r = rarity ?? rollRarity(0, rand);

  // Un tirage `zanset` ne produit pas un objet de plus : il produit *un* des
  // uniques, nommé et taillé à la main.
  if (r === 'zanset') {
    const item = rollUnique(level, rand, slot);
    item.price = itemPrice(item, rand);
    return item;
  }
  const mult = RARITY_MULT[r];
  const tier = rarityRank(r);
  const baseName = SLOT_NAMES[s][tier];
  const name =
    tier >= 1 ? `${baseName} ${SUFFIXES[pick(SUFFIXES.length)]}` : baseName;

  const nBonuses = Math.min(4, 1 + Math.floor(tier / 1.4));
  const pool = [...ATTRS].sort(() => rand() - 0.5).slice(0, nBonuses);
  const bonuses: Partial<Record<AttrId, number>> = {};
  pool.forEach((a) => {
    // 0,7 par niveau faisait de l'équipement 93 % des attributs à niveau 50 :
    // la classe n'avait plus d'identité, son attribut principal se noyait dans
    // le tirage aléatoire des pièces.
    bonuses[a] = Math.max(1, Math.round((1 + level * 0.42) * mult * (0.7 + rand() * 0.6)));
  });

  // une pièce sur cinq appartient à une panoplie (jamais sur du commun :
  // les sets doivent rester un objectif, pas un acquis de départ)
  const set = tier >= 1 && rand() < 0.22 ? SETS[pick(SETS.length)] : null;

  const item: Item = {
    id: `it${Date.now()}_${itemSeq++}`,
    slot: s,
    name: set ? `${baseName} ${set.name}` : name,
    rarity: r,
    level,
    bonuses,
    price: 0, // posé plus bas : le prix dérive de la valeur réelle de l'objet
    ...(set ? { setId: set.id } : {}),
  };

  if (s === 'arme') {
    const base = Math.round((2 + level * 1.6) * mult);
    item.dmgMin = base;
    item.dmgMax = base + Math.max(2, Math.round(base * 0.4));
  } else if (s === 'tete' || s === 'torse' || s === 'pattes' || s === 'ceinture') {
    item.armor = Math.max(1, Math.round(level * 2.2 * mult * (0.7 + rand() * 0.6)));
  }

  item.price = itemPrice(item, rand);
  return item;
}

export function shopRotation(level: number, count = 6): Item[] {
  const shuffled = [...SLOT_LIST].sort(() => Math.random() - 0.5).slice(0, count);
  // toujours au moins une arme en boutique
  if (!shuffled.includes('arme')) shuffled[0] = 'arme';
  return shuffled.map((s) => generateItem(Math.max(1, level + rnd(-1, 2)), s));
}

/**
 * Résumé lisible d'un objet : « Dégâts 12–18 · Armure +9 · Force +4 ».
 * Trois écrans en avaient chacun leur copie.
 */
export function itemStats(it: Item): string {
  const parts: string[] = [];
  if (it.dmgMin) parts.push(`Dégâts ${it.dmgMin}–${it.dmgMax}`);
  if (it.armor) parts.push(`Armure +${it.armor}`);
  (Object.keys(it.bonuses) as AttrId[]).forEach((k) =>
    parts.push(`${ATTR_LABELS[k]} +${it.bonuses[k]}`)
  );
  return parts.join(' · ');
}

/**
 * Libellé d'un objet. Les uniques portent une clé de traduction dans `name` —
 * leur nom est du texte, il doit suivre la langue comme le reste.
 */
export function itemLabel(it: Item, t: (k: TransKey) => string): string {
  return it.uniqueId ? t(`unique.${it.uniqueId}.name` as TransKey) : it.name;
}
