import { ATTR_LABELS } from './classes';
import { rnd } from './formulas';
import { SETS } from './sets';
import { AttrId, Item, Rarity, SlotId } from './types';

export const RARITY_LABELS: Record<Rarity, string> = {
  commun: 'Commun',
  korek: 'Korek',
  kalite: 'Kalité',
  rar: 'Rar',
  lezand: 'Lézandèr',
  mitik: 'Mitik',
};

export const RARITY_COLORS: Record<Rarity, string> = {
  commun: '#9AA6AD',
  korek: '#3BD97E',
  kalite: '#3BA9F0',
  rar: '#B06BFF',
  lezand: '#FF8A3D',
  mitik: '#FFC93C',
};

/** L'ordre fait foi : tri, comparaison, progression du Zalbum. */
export const RARITY_ORDER: Rarity[] = [
  'commun',
  'korek',
  'kalite',
  'rar',
  'lezand',
  'mitik',
];

export function rarityRank(r: Rarity): number {
  return RARITY_ORDER.indexOf(r);
}

const RARITY_MULT: Record<Rarity, number> = {
  commun: 1,
  korek: 1.35,
  kalite: 1.8,
  rar: 2.4,
  lezand: 3.2,
  mitik: 4.4,
};

/** Un nom par gamme : la rareté doit s'entendre avant même de lire la couleur. */
const SLOT_NAMES: Record<SlotId, string[]> = {
  arme: [
    'Zéprons', 'Lames de patte', 'Zéprons forgés',
    'Grif volkanik', 'Zéprons du Gran Brilé', 'Grif de Sitarane',
  ],
  tete: [
    'Kasket', 'Bandana', 'Chapo payanké',
    'Kask la fournèz', 'Kouronn de Mafate', 'Kask du Maloya Mistik',
  ],
  torse: [
    'Gilet plimé', 'Plastron koko', 'Armure vakoa',
    'Plimaz doré', 'Kirass du Piton', 'Plimaz de Grand-Mèr Kal',
  ],
  pattes: [
    'Zergos', 'Bot la boue', 'Pat renforcées',
    'Zergos siklone', 'Zergos du Papang Roi', 'Pat de la Fournèz',
  ],
  amulette: [
    'Kolié koki', 'Kolié bwa de santal', 'Kolié perle noire',
    'Kolié volkan', 'Kolié dé Sèt Kaskad', 'Kolié du Gran-Basin',
  ],
  anneau: [
    'Bag laiton', 'Bag larzan', 'Bag lor',
    'Bag mitik', 'Bag du Vié Tisanèr', 'Bag dé Anset',
  ],
  ceinture: [
    'Sintir chanvre', 'Sintir kuir', 'Sintir géranium',
    'Sintir gran-mèr kal', 'Sintir du Kabar', 'Sintir dé Sirk',
  ],
  grigri: [
    'Ti gri-gri', 'Gri-gri tisanèr', 'Gri-gri sitarane',
    'Gri-gri gramoune', 'Gri-gri du Volkan', 'Gri-gri dé Zanset',
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
export function rollRarity(luck = 0): Rarity {
  // décaler la plage vers le haut, pas la rétrécir vers le bas : l'ancienne
  // formule faisait disparaître rar, lézandèr et mitik dès luck = 0,1
  const l = Math.min(0.25, Math.max(0, luck));
  const r = Math.random() * (1 - l) + l;
  if (r < 0.46) return 'commun';
  if (r < 0.74) return 'korek';
  if (r < 0.90) return 'kalite';
  if (r < 0.968) return 'rar';
  if (r < 0.995) return 'lezand';
  return 'mitik';
}

export function generateItem(level: number, slot?: SlotId, rarity?: Rarity): Item {
  const s: SlotId =
    slot ??
    (['arme', 'tete', 'torse', 'pattes', 'amulette', 'anneau', 'ceinture', 'grigri'][
      rnd(0, 7)
    ] as SlotId);
  const r = rarity ?? rollRarity();
  const mult = RARITY_MULT[r];
  const tier = rarityRank(r);
  const baseName = SLOT_NAMES[s][tier];
  const name =
    tier >= 1 ? `${baseName} ${SUFFIXES[rnd(0, SUFFIXES.length - 1)]}` : baseName;

  const nBonuses = Math.min(4, 1 + Math.floor(tier / 1.4));
  const pool = [...ATTRS].sort(() => Math.random() - 0.5).slice(0, nBonuses);
  const bonuses: Partial<Record<AttrId, number>> = {};
  pool.forEach((a) => {
    bonuses[a] = Math.max(1, Math.round((1 + level * 0.7) * mult * (0.7 + Math.random() * 0.6)));
  });

  // une pièce sur cinq appartient à une panoplie (jamais sur du commun :
  // les sets doivent rester un objectif, pas un acquis de départ)
  const set =
    tier >= 1 && Math.random() < 0.22
      ? SETS[rnd(0, SETS.length - 1)]
      : null;

  const item: Item = {
    id: `it${Date.now()}_${itemSeq++}`,
    slot: s,
    name: set ? `${baseName} ${set.name}` : name,
    rarity: r,
    level,
    bonuses,
    price: Math.round(
      (15 + level * 9) * mult * (0.8 + Math.random() * 0.4) * (set ? 1.25 : 1)
    ),
    ...(set ? { setId: set.id } : {}),
  };

  if (s === 'arme') {
    const base = Math.round((2 + level * 1.6) * mult);
    item.dmgMin = base;
    item.dmgMax = base + Math.max(2, Math.round(base * 0.4));
  } else if (s === 'tete' || s === 'torse' || s === 'pattes' || s === 'ceinture') {
    item.armor = Math.max(1, Math.round(level * 2.2 * mult * (0.7 + Math.random() * 0.6)));
  }

  return item;
}

export function shopRotation(level: number, count = 6): Item[] {
  const slots: SlotId[] = ['arme', 'tete', 'torse', 'pattes', 'amulette', 'anneau', 'ceinture', 'grigri'];
  const shuffled = [...slots].sort(() => Math.random() - 0.5).slice(0, count);
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
