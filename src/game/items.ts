import { rnd } from './formulas';
import { SETS } from './sets';
import { AttrId, Item, Rarity, SlotId } from './types';

export const RARITY_LABELS: Record<Rarity, string> = {
  commun: 'Commun',
  korek: 'Korek',
  kalite: 'Kalité',
  mitik: 'Mitik',
};

export const RARITY_COLORS: Record<Rarity, string> = {
  commun: '#95a5a6',
  korek: '#2ecc71',
  kalite: '#3498db',
  mitik: '#f1c40f',
};

const RARITY_MULT: Record<Rarity, number> = {
  commun: 1,
  korek: 1.35,
  kalite: 1.8,
  mitik: 2.5,
};

const SLOT_NAMES: Record<SlotId, string[]> = {
  arme: ['Zéprons', 'Lames de patte', 'Zéprons forgés', 'Grif volkanik'],
  tete: ['Kasket', 'Bandana', 'Chapo payanké', 'Kask la fournèz'],
  torse: ['Gilet plimé', 'Plastron koko', 'Armure vakoa', 'Plimaz doré'],
  pattes: ['Zergos', 'Bot la boue', 'Pat renforcées', 'Zergos siklone'],
  amulette: ['Kolié koki', 'Kolié bwa de santal', 'Kolié perle noire', 'Kolié volkan'],
  anneau: ['Bag laiton', 'Bag larzan', 'Bag lor', 'Bag mitik'],
  ceinture: ['Sintir chanvre', 'Sintir kuir', 'Sintir géranium', 'Sintir gran-mèr kal'],
  grigri: ['Ti gri-gri', 'Gri-gri tisanèr', 'Gri-gri sitarane', 'Gri-gri gramoune'],
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

export function rollRarity(): Rarity {
  const r = Math.random();
  if (r < 0.55) return 'commun';
  if (r < 0.82) return 'korek';
  if (r < 0.96) return 'kalite';
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
  const tier = r === 'mitik' ? 3 : r === 'kalite' ? 2 : r === 'korek' ? 1 : 0;
  const baseName = SLOT_NAMES[s][tier];
  const name =
    tier >= 1 ? `${baseName} ${SUFFIXES[rnd(0, SUFFIXES.length - 1)]}` : baseName;

  const nBonuses = 1 + tier >= 3 ? 3 : 1 + Math.min(tier, 2);
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
