import { TransKey } from '../i18n';
import { C } from '../theme';
import { CombatMods } from './combat';

/**
 * Un événement par jour, tiré de façon stable : le joueur qui ouvre l'app le
 * mardi n'y trouve pas la même chose que le lundi.
 *
 * Trois d'entre eux changent les **règles** plutôt que les gains. Un
 * multiplicateur est invisible en jeu — « +50 % de grains » ne se raconte pas,
 * alors que « aujourd'hui les critiques font ×3 » se voit au premier coup et
 * se répète entre joueurs.
 */
export type EventKind =
  | 'grains'
  | 'xp'
  | 'loot'
  | 'shop'
  | 'batay'
  | 'krit'
  | 'sitarane'
  | 'chans';

export interface DayEvent {
  kind: EventKind;
  titleKey: TransKey;
  descKey: TransKey;
  /** libellé de la pastille du HUD */
  shortKey: TransKey;
  icon: string;
  color: string;
  /** multiplicateur (ou remise pour `shop`) */
  mult: number;
}

const EVENTS: DayEvent[] = [
  {
    kind: 'grains',
    titleKey: 'event.grains.title',
    descKey: 'event.grains.desc',
    shortKey: 'event.grains.short',
    icon: '🌽',
    color: C.gold,
    mult: 1.5,
  },
  {
    kind: 'xp',
    titleKey: 'event.xp.title',
    descKey: 'event.xp.desc',
    shortKey: 'event.xp.short',
    icon: '✨',
    color: C.mystic,
    mult: 1.5,
  },
  {
    kind: 'loot',
    titleKey: 'event.loot.title',
    descKey: 'event.loot.desc',
    shortKey: 'event.loot.short',
    icon: '🎁',
    color: C.cane,
    mult: 2,
  },
  {
    kind: 'shop',
    titleKey: 'event.shop.title',
    descKey: 'event.shop.desc',
    shortKey: 'event.shop.short',
    icon: '🏷️',
    color: C.lagoon,
    mult: 0.7,
  },
  {
    kind: 'batay',
    titleKey: 'event.batay.title',
    descKey: 'event.batay.desc',
    shortKey: 'event.batay.short',
    icon: '⚔️',
    color: C.ember,
    mult: 2,
  },
  // ─── Ceux qui changent les règles ───
  {
    kind: 'krit',
    titleKey: 'event.krit.title',
    descKey: 'event.krit.desc',
    shortKey: 'event.krit.short',
    icon: '⚡',
    color: C.lava,
    mult: 3,
  },
  {
    kind: 'sitarane',
    titleKey: 'event.sitarane.title',
    descKey: 'event.sitarane.desc',
    shortKey: 'event.sitarane.short',
    icon: '🌑',
    color: C.piment,
    mult: 0.5,
  },
  {
    kind: 'chans',
    titleKey: 'event.chans.title',
    descKey: 'event.chans.desc',
    shortKey: 'event.chans.short',
    icon: '🪬',
    color: C.mystic,
    mult: 1,
  },
];

export function eventOfDay(day: string): DayEvent {
  let h = 0;
  for (let i = 0; i < day.length; i++) h = (h * 33 + day.charCodeAt(i)) | 0;
  return EVENTS[Math.abs(h) % EVENTS.length];
}

/** Ce que l'événement du jour change dans un combat. */
export function eventCombatMods(ev: DayEvent): CombatMods {
  if (ev.kind === 'krit') return { critMult: ev.mult };
  if (ev.kind === 'sitarane') return { armorScale: ev.mult };
  return {};
}

/** Bonus de gamme sur le butin apporté par l'événement du jour. */
export function eventLuck(ev: DayEvent): number {
  return ev.kind === 'chans' ? 0.18 : 0;
}
