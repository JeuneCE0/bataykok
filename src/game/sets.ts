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
  icon: string;
  color: string;
  /** bonus par pièce au-delà du seuil, exprimé en points d'attribut par niveau */
  perLevel: number;
}

export const SETS: SetDef[] = [
  {
    id: 'mafate',
    name: 'Linz Mafate',
    attr: 'endurance',
    icon: '🥾',
    color: '#3BD97E',
    perLevel: 0.9,
  },
  {
    id: 'volkan',
    name: 'Tenu Volkan',
    attr: 'force',
    icon: '🌋',
    color: '#FF5A1F',
    perLevel: 0.9,
  },
  {
    id: 'sega',
    name: 'Kostim Séga',
    attr: 'esprit',
    icon: '🎵',
    color: '#B06BFF',
    perLevel: 0.9,
  },
  {
    id: 'gramoune',
    name: 'Plimaz Gramoune',
    attr: 'chance',
    icon: '🪬',
    color: '#FFC93C',
    perLevel: 0.8,
  },
  {
    id: 'kanyar',
    name: 'Kanyar Malin',
    attr: 'adresse',
    icon: '💨',
    color: '#2FC6E8',
    perLevel: 0.9,
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

/** Attributs offerts par les panoplies portées. */
export function setBonuses(
  equipment: Partial<Record<SlotId, Item>>,
  level: number
): Partial<Attributes> {
  const counts = countSets(equipment);
  const out: Partial<Attributes> = {};
  Object.entries(counts).forEach(([id, n]) => {
    const def = SET_BY_ID[id];
    if (!def) return;
    const steps = SET_THRESHOLDS.filter((t) => n >= t).length;
    if (!steps) return;
    const gain = Math.round(def.perLevel * (level + 2) * steps);
    out[def.attr] = (out[def.attr] ?? 0) + gain;
  });
  return out;
}

export function setBonusLabel(def: SetDef, level: number, steps: number): string {
  const gain = Math.round(def.perLevel * (level + 2) * steps);
  return `+${gain} ${ATTR_LABELS[def.attr]}`;
}
