import { TransKey } from '../i18n';
import { Rarity } from './types';

/**
 * Cosmétiques : la seule façon de se distinguer sans toucher aux statistiques.
 *
 * Le coq est un SVG paramétrique — une couleur ou un accessoire de plus ne
 * coûte rien en taille d'app, ce qui rend le catalogue extensible sans limite
 * pratique. Les entrées « free » sont celles proposées à la création ; les
 * autres s'achètent au Bazar.
 */
export type CosmeticKind = 'body' | 'comb' | 'tail' | 'accessory';

export interface CosmeticDef {
  id: string;
  kind: CosmeticKind;
  nameKey: TransKey;
  /** couleur hexadécimale (corps, crête) ou index de catalogue (queue, accessoire) */
  value: string | number;
  rarity: Rarity;
  grains?: number;
  piments?: number;
  /** débloqué d'office : les choix de la création */
  free?: boolean;
}

// ─── Catalogues d'apparence ───────────────────────────────────────────────
// L'ordre fait foi : `Appearance.tailPalette` et `Appearance.accessory` sont
// des index persistés. Toute nouvelle entrée s'ajoute **à la fin**.

export const BODY_COLORS = [
  '#8d5524', '#3b3b3b', '#e8e4d8', '#b5541c', '#5d4037', '#7b1fa2',
  // payantes
  '#C89B3C', '#1B4F72', '#0E6655', '#7B241C', '#F5B7B1', '#17202A',
];

export const COMB_COLORS = [
  '#e53935', '#ff7043', '#c2185b', '#f9a825', '#6a1b9a',
  // payantes
  '#00E5FF', '#7CFC00', '#FF00E5', '#FFFFFF',
];

export const TAIL_PALETTES: string[][] = [
  ['#1b5e20', '#2e7d32', '#43a047'],
  ['#0d47a1', '#1976d2', '#42a5f5'],
  ['#b71c1c', '#e53935', '#ff7043'],
  ['#4a148c', '#7b1fa2', '#ab47bc'],
  ['#004d40', '#00897b', '#4db6ac'],
  // payantes
  ['#B8860B', '#FFD700', '#FFF3B0'],
  ['#2E0854', '#7D26CD', '#E066FF'],
  ['#0B0B0B', '#3A3A3A', '#6E6E6E'],
  ['#FF6B00', '#FF3B00', '#FFD000'],
  // La Réunion n'a pas de drapeau officiel : ce sont les deux étendards les
  // plus portés dans l'île. On les nomme pour ce qu'ils sont.
  ['#0038A8', '#E4002B', '#FFD700'], // Rayon Volkan (« drapeau du volcan »)
  ['#E4002B', '#0038A8', '#00A650'], // Lo Mahavéli
];

export const ACCESSORIES = [
  'aucun', 'bandana', 'lunettes', 'chapo', 'chaine',
  // payants
  'kouronn', 'kask', 'tiare', 'linet_lor',
];

/** Nombre d'entrées gratuites par catalogue — le reste s'achète. */
export const FREE_COUNTS = { body: 6, comb: 5, tail: 5, accessory: 5 } as const;

export const COSMETICS: CosmeticDef[] = [
  // ─── Corps ───
  { id: 'body.gold', kind: 'body', nameKey: 'cosmetic.body.gold', value: '#C89B3C', rarity: 'rar', grains: 4500 },
  { id: 'body.ocean', kind: 'body', nameKey: 'cosmetic.body.ocean', value: '#1B4F72', rarity: 'kalite', grains: 2200 },
  { id: 'body.lagon', kind: 'body', nameKey: 'cosmetic.body.lagon', value: '#0E6655', rarity: 'kalite', grains: 2200 },
  { id: 'body.brik', kind: 'body', nameKey: 'cosmetic.body.brik', value: '#7B241C', rarity: 'korek', grains: 900 },
  { id: 'body.rose', kind: 'body', nameKey: 'cosmetic.body.rose', value: '#F5B7B1', rarity: 'korek', grains: 900 },
  { id: 'body.obsidian', kind: 'body', nameKey: 'cosmetic.body.obsidian', value: '#17202A', rarity: 'lezand', piments: 12 },

  // ─── Crête ───
  { id: 'comb.neon', kind: 'comb', nameKey: 'cosmetic.comb.neon', value: '#00E5FF', rarity: 'rar', grains: 3200 },
  { id: 'comb.kann', kind: 'comb', nameKey: 'cosmetic.comb.kann', value: '#7CFC00', rarity: 'kalite', grains: 1800 },
  { id: 'comb.fuchsia', kind: 'comb', nameKey: 'cosmetic.comb.fuchsia', value: '#FF00E5', rarity: 'rar', grains: 3200 },
  { id: 'comb.blan', kind: 'comb', nameKey: 'cosmetic.comb.blan', value: '#FFFFFF', rarity: 'lezand', piments: 10 },

  // ─── Queue ───
  { id: 'tail.lor', kind: 'tail', nameKey: 'cosmetic.tail.lor', value: 5, rarity: 'rar', grains: 5200 },
  { id: 'tail.mistik', kind: 'tail', nameKey: 'cosmetic.tail.mistik', value: 6, rarity: 'rar', grains: 5200 },
  { id: 'tail.lonbraz', kind: 'tail', nameKey: 'cosmetic.tail.lonbraz', value: 7, rarity: 'lezand', piments: 14 },
  { id: 'tail.volkan', kind: 'tail', nameKey: 'cosmetic.tail.volkan', value: 8, rarity: 'lezand', piments: 14 },
  { id: 'tail.rayonvolkan', kind: 'tail', nameKey: 'cosmetic.tail.rayonvolkan', value: 9, rarity: 'mitik', piments: 22 },
  { id: 'tail.mahaveli', kind: 'tail', nameKey: 'cosmetic.tail.mahaveli', value: 10, rarity: 'mitik', piments: 22 },

  // ─── Accessoires ───
  { id: 'acc.kouronn', kind: 'accessory', nameKey: 'cosmetic.acc.kouronn', value: 5, rarity: 'lezand', piments: 18 },
  { id: 'acc.kask', kind: 'accessory', nameKey: 'cosmetic.acc.kask', value: 6, rarity: 'rar', grains: 6000 },
  { id: 'acc.tiare', kind: 'accessory', nameKey: 'cosmetic.acc.tiare', value: 7, rarity: 'kalite', grains: 2600 },
  { id: 'acc.linet_lor', kind: 'accessory', nameKey: 'cosmetic.acc.linet_lor', value: 8, rarity: 'rar', grains: 4800 },
];

export const COSMETIC_BY_ID: Record<string, CosmeticDef> = COSMETICS.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<string, CosmeticDef>
);

/** Une valeur d'apparence est-elle accessible au joueur ? */
export function ownsValue(
  kind: CosmeticKind,
  value: string | number,
  owned: string[] = []
): boolean {
  const free =
    kind === 'body'
      ? BODY_COLORS.slice(0, FREE_COUNTS.body).includes(value as string)
      : kind === 'comb'
        ? COMB_COLORS.slice(0, FREE_COUNTS.comb).includes(value as string)
        : (value as number) < FREE_COUNTS[kind];
  if (free) return true;
  return COSMETICS.some(
    (c) => c.kind === kind && c.value === value && (owned ?? []).includes(c.id)
  );
}

/**
 * Cosmétiques correspondant à un look de panoplie.
 *
 * Acheter une panoplie applique son look, mais n'accordait pas les pièces
 * d'apparence : le joueur se retrouvait à porter un casque affiché en même
 * temps comme « porté » et « à vendre à 6 000 grains ». Un look offert doit
 * être un look possédé.
 */
export function cosmeticsForLook(look: {
  bodyColor: string;
  combColor: string;
  tailPalette: number;
  accessory: number;
}): string[] {
  const paires: [CosmeticKind, string | number][] = [
    ['body', look.bodyColor],
    ['comb', look.combColor],
    ['tail', look.tailPalette],
    ['accessory', look.accessory],
  ];
  return COSMETICS.filter((c) =>
    paires.some(([kind, valeur]) => c.kind === kind && c.value === valeur)
  ).map((c) => c.id);
}
