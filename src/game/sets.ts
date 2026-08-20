import { ATTR_LABELS } from './classes';
import { AttrId, Attributes, Item, SlotId } from './types';

/**
 * Panoplies : un objet sur cinq appartient à un set. Deux pièces donnent déjà
 * un bonus, quatre en donnent un franc — de quoi transformer le farm en
 * collection et rendre un choix d'équipement autre que « le plus gros score ».
 */
export interface SetDef {
  id: string;
  name: string;
  attr: AttrId;
  color: string;
  /** bonus par pièce au-delà du seuil, exprimé en points d'attribut par niveau */
  perLevel: number;
  /**
   * Look offert avec la panoplie complète. L'équipement ne se dessine pas sur
   * le coq — sans cela, acheter huit pièces d'un coup ne se verrait nulle part.
   */
  look: { bodyColor: string; combColor: string; tailPalette: number; accessory: number };
}

export const SETS: SetDef[] = [
  {
    id: 'mafate',
    name: 'Linz Mafate',
    attr: 'endurance',
    color: '#3BD97E',
    perLevel: 0.9,
    look: { bodyColor: '#5d4037', combColor: '#7CFC00', tailPalette: 0, accessory: 6 },
  },
  {
    id: 'volkan',
    name: 'Tenu Volkan',
    attr: 'force',
    color: '#FF5A1F',
    perLevel: 0.9,
    look: { bodyColor: '#b5541c', combColor: '#ff7043', tailPalette: 8, accessory: 6 },
  },
  {
    id: 'sega',
    name: 'Kostim Séga',
    attr: 'esprit',
    color: '#B06BFF',
    perLevel: 0.9,
    look: { bodyColor: '#7b1fa2', combColor: '#FF00E5', tailPalette: 6, accessory: 7 },
  },
  {
    id: 'gramoune',
    name: 'Plimaz Gramoune',
    attr: 'chance',
    color: '#FFC93C',
    perLevel: 0.8,
    look: { bodyColor: '#C89B3C', combColor: '#f9a825', tailPalette: 5, accessory: 5 },
  },
  {
    id: 'kanyar',
    name: 'Kanyar Malin',
    attr: 'adresse',
    color: '#2FC6E8',
    perLevel: 0.9,
    look: { bodyColor: '#1B4F72', combColor: '#00E5FF', tailPalette: 1, accessory: 8 },
  },
];

export const SET_BY_ID: Record<string, SetDef> = SETS.reduce(
  (acc, s) => {
    acc[s.id] = s;
    return acc;
  },
  {} as Record<string, SetDef>
);

export const SET_THRESHOLDS = [2, 4] as const;

/** Combien de pièces de chaque set le kok porte-t-il ? */
export function countSets(
  equipment: Partial<Record<SlotId, Item>>
): Record<string, number> {
  const out: Record<string, number> = {};
  (Object.values(equipment) as (Item | undefined)[]).forEach((it) => {
    if (it?.setId) out[it.setId] = (out[it.setId] ?? 0) + 1;
  });
  return out;
}

/**
 * Attributs offerts par les panoplies portées.
 *
 * Le bonus suivait le niveau du **joueur** : quatre pièces korek ramassées au
 * niveau 1 valaient +94 Force à niveau 50, sans jamais être remplacées. Il
 * suit désormais le niveau moyen des pièces qui le composent — une vieille
 * panoplie vieillit.
 */
export function setBonuses(
  equipment: Partial<Record<SlotId, Item>>
): Partial<Attributes> {
  const counts = countSets(equipment);
  const out: Partial<Attributes> = {};
  Object.entries(counts).forEach(([id, n]) => {
    const def = SET_BY_ID[id];
    if (!def) return;
    const steps = SET_THRESHOLDS.filter((t) => n >= t).length;
    if (!steps) return;
    const pieces = (Object.values(equipment) as (Item | undefined)[]).filter(
      (it) => it?.setId === id
    ) as Item[];
    const lvl = pieces.reduce((a, it) => a + it.level, 0) / pieces.length;
    out[def.attr] = (out[def.attr] ?? 0) + Math.round(def.perLevel * (lvl + 2) * steps);
  });
  return out;
}

export function setBonusLabel(def: SetDef, level: number, steps: number): string {
  const gain = Math.round(def.perLevel * (level + 2) * steps);
  return `+${gain} ${ATTR_LABELS[def.attr]}`;
}
