import { C } from '../theme';

/**
 * Un événement par jour, tiré de façon stable : le joueur qui ouvre l'app le
 * mardi n'y trouve pas la même chose que le lundi, et certains jours valent
 * clairement plus le détour que d'autres.
 */
export type EventKind = 'grains' | 'xp' | 'loot' | 'shop' | 'batay';

export interface DayEvent {
  kind: EventKind;
  title: string;
  desc: string;
  icon: string;
  color: string;
  /** multiplicateur (ou remise pour `shop`) */
  mult: number;
}

const EVENTS: DayEvent[] = [
  {
    kind: 'grains',
    title: 'Jour de marsé',
    desc: 'Toute les récompenses en grains ×1,5',
    icon: '🌽',
    color: C.gold,
    mult: 1.5,
  },
  {
    kind: 'xp',
    title: 'Lékol dann rond',
    desc: "Toute l'XP gagnée ×1,5",
    icon: '✨',
    color: C.mystic,
    mult: 1.5,
  },
  {
    kind: 'loot',
    title: 'Chans du gramoune',
    desc: 'Deux fois plus de chances de trouver un objè en quête',
    icon: '🎁',
    color: C.cane,
    mult: 2,
  },
  {
    kind: 'shop',
    title: 'Brad o Bazar',
    desc: '−30 % su tout lékipman du Bazar',
    icon: '🏷️',
    color: C.lagoon,
    mult: 0.7,
  },
  {
    kind: 'batay',
    title: 'Gran kabar dann rond',
    desc: '+2 jetons de batay toute la journée',
    icon: '⚔️',
    color: C.ember,
    mult: 2,
  },
];

export function eventOfDay(day: string): DayEvent {
  let h = 0;
  for (let i = 0; i < day.length; i++) h = (h * 33 + day.charCodeAt(i)) | 0;
  return EVENTS[Math.abs(h) % EVENTS.length];
}

export function eventMult(ev: DayEvent, kind: EventKind): number {
  return ev.kind === kind ? ev.mult : 1;
}
