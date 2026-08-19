import { TransKey } from '../i18n';

import { mulberry32 } from './formulas';

// ─── Chemin du ti kok : onboarding pas à pas ─────────────────────────────

export type StepId =
  | 'equip'
  | 'quest'
  | 'attr'
  | 'arena'
  | 'shop'
  | 'win'
  | 'guild'
  | 'level3'
  | 'donjon'
  | 'transport'
  | 'level5'
  | 'mitik';

export type TabId = 'kok' | 'quetes' | 'rond' | 'donjon' | 'ecurie' | 'bazar';

export interface StepDef {
  id: StepId;
  titleKey: TransKey;
  hintKey: TransKey;
  icon: string;
  /** onglet vers lequel envoyer le joueur */
  tab: TabId;
  grains: number;
  piments: number;
}

/** L'ordre EST la progression : la première étape non validée est l'objectif. */
export const STEPS: StepDef[] = [
  {
    id: 'equip',
    titleKey: 'step.equip.title',
    hintKey: 'step.equip.hint',
    icon: '🗡️',
    tab: 'kok',
    grains: 60,
    piments: 0,
  },
  {
    id: 'quest',
    titleKey: 'step.quest.title',
    hintKey: 'step.quest.hint',
    icon: '🗺️',
    tab: 'quetes',
    grains: 90,
    piments: 0,
  },
  {
    id: 'attr',
    titleKey: 'step.attr.title',
    hintKey: 'step.attr.hint',
    icon: '💪',
    tab: 'kok',
    grains: 80,
    piments: 1,
  },
  {
    id: 'arena',
    titleKey: 'step.arena.title',
    hintKey: 'step.arena.hint',
    icon: '⚔️',
    tab: 'rond',
    grains: 100,
    piments: 1,
  },
  {
    id: 'shop',
    titleKey: 'step.shop.title',
    hintKey: 'step.shop.hint',
    icon: '🛒',
    tab: 'bazar',
    grains: 160,
    piments: 1,
  },
  {
    id: 'win',
    titleKey: 'step.win.title',
    hintKey: 'step.win.hint',
    icon: '🏆',
    tab: 'rond',
    grains: 200,
    piments: 2,
  },
  {
    id: 'guild',
    titleKey: 'step.guild.title',
    hintKey: 'step.guild.hint',
    icon: '🏠',
    tab: 'ecurie',
    grains: 240,
    piments: 2,
  },
  {
    id: 'donjon',
    titleKey: 'step.donjon.title',
    hintKey: 'step.donjon.hint',
    icon: '🗝️',
    tab: 'donjon',
    grains: 300,
    piments: 3,
  },
  {
    id: 'level3',
    titleKey: 'step.level3.title',
    hintKey: 'step.level3.hint',
    icon: '⭐',
    tab: 'quetes',
    grains: 350,
    piments: 4,
  },
  {
    id: 'transport',
    titleKey: 'step.transport.title',
    hintKey: 'step.transport.hint',
    icon: '🛵',
    tab: 'bazar',
    grains: 450,
    piments: 5,
  },
  {
    id: 'level5',
    titleKey: 'step.level5.title',
    hintKey: 'step.level5.hint',
    icon: '🔥',
    tab: 'rond',
    grains: 600,
    piments: 7,
  },
  {
    id: 'mitik',
    titleKey: 'step.mitik.title',
    hintKey: 'step.mitik.hint',
    icon: '💎',
    tab: 'bazar',
    grains: 900,
    piments: 10,
  },
];

/** Ce que le moteur doit savoir pour juger une étape franchie. */
export interface StepContext {
  equippedCount: number;
  quests: number;
  attrs: number;
  arenas: number;
  buys: number;
  wins: number;
  hasGuild: boolean;
  level: number;
  transport: number;
  dungeonFloor: number;
  foundMitik: boolean;
}

/**
 * Une étape est franchie quand son objectif de jeu est atteint.
 *
 * Le switch **doit** couvrir tous les StepId : une étape ajoutée sans son cas
 * ici retombe sur `false` et fige le chemin pour toujours — c'est arrivé avec
 * « Bat out prémié gardien ». Le test `progress.test.ts` le vérifie.
 */
export function isStepComplete(id: StepId, c: StepContext): boolean {
  switch (id) {
    case 'equip':
      return c.equippedCount > 0;
    case 'quest':
      return c.quests >= 1;
    case 'attr':
      return c.attrs >= 1;
    case 'arena':
      return c.arenas >= 1;
    case 'shop':
      return c.buys >= 1;
    case 'win':
      return c.wins >= 1;
    case 'guild':
      return c.hasGuild;
    case 'donjon':
      return c.dungeonFloor >= 1;
    case 'level3':
      return c.level >= 3;
    case 'transport':
      return c.transport > 0;
    case 'level5':
      return c.level >= 5;
    case 'mitik':
      return c.foundMitik;
  }
}


// ─── Défis du jour ───────────────────────────────────────────────────────

export type MissionKind =
  | 'quest'
  | 'arena'
  | 'win'
  | 'buy'
  | 'attr'
  | 'dodo'
  | 'equip';

export interface MissionDef {
  id: string;
  kind: MissionKind;
  target: number;
  titleKey: TransKey;
  icon: string;
  /** grains **de base** — le gain réel suit le niveau, voir `missionGrains` */
  grains: number;
  piments: number;
}

/**
 * Grains rendus par un défi à ce niveau.
 *
 * Les valeurs étaient fixes : 990 grains pour les trois défis et le coffre,
 * quand un joueur de niveau 50 en gagne 6 000 par jour. Passé le niveau 15,
 * les défis du jour ne valaient plus le détour — et c'est justement à ce
 * moment-là qu'on a besoin d'une raison de revenir.
 */
export function missionGrains(base: number, level: number): number {
  return Math.round(base * (1 + level * 0.03));
}

const POOL: MissionDef[] = [
  { id: 'q2', kind: 'quest', target: 2, titleKey: 'mission.q2', icon: '🗺️', grains: 150, piments: 0 },
  { id: 'q3', kind: 'quest', target: 3, titleKey: 'mission.q3', icon: '🗺️', grains: 220, piments: 1 },
  { id: 'a2', kind: 'arena', target: 2, titleKey: 'mission.a2', icon: '⚔️', grains: 160, piments: 0 },
  { id: 'w1', kind: 'win', target: 1, titleKey: 'mission.w1', icon: '🏆', grains: 200, piments: 1 },
  { id: 'w2', kind: 'win', target: 2, titleKey: 'mission.w2', icon: '🏆', grains: 320, piments: 1 },
  { id: 'b1', kind: 'buy', target: 1, titleKey: 'mission.b1', icon: '🛒', grains: 120, piments: 0 },
  { id: 'at2', kind: 'attr', target: 2, titleKey: 'mission.at2', icon: '💪', grains: 140, piments: 0 },
  { id: 'at4', kind: 'attr', target: 4, titleKey: 'mission.at4', icon: '💪', grains: 260, piments: 1 },
  { id: 'd1', kind: 'dodo', target: 1, titleKey: 'mission.d1', icon: '🍺', grains: 100, piments: 0 },
  { id: 'e1', kind: 'equip', target: 1, titleKey: 'mission.e1', icon: '🎽', grains: 110, piments: 0 },
];

export interface MissionState {
  def: MissionDef;
  progress: number;
  claimed: boolean;
}

/** Tirage stable pour une journée donnée (même jour = mêmes défis). */
export function rollDailyMissions(day: string): MissionState[] {
  let h = 0;
  for (let i = 0; i < day.length; i++) h = (h * 31 + day.charCodeAt(i)) | 0;
  const rng = mulberry32(Math.abs(h));
  const pool = [...POOL];
  const out: MissionState[] = [];
  const kinds = new Set<MissionKind>();
  while (out.length < 3 && pool.length) {
    const i = Math.floor(rng() * pool.length);
    const [def] = pool.splice(i, 1);
    if (kinds.has(def.kind)) continue;
    kinds.add(def.kind);
    out.push({ def, progress: 0, claimed: false });
  }
  return out;
}

/** Coffre bonus quand les 3 défis du jour sont réclamés. */
export const DAILY_CHEST = { grains: 300, piments: 3 };

// ─── Fidélité : série de connexions ──────────────────────────────────────

export interface StreakReward {
  day: number;
  grains: number;
  piments: number;
  label: string;
}

export const STREAK_REWARDS: StreakReward[] = [
  { day: 1, grains: 100, piments: 0, label: '100 grains' },
  { day: 2, grains: 180, piments: 0, label: '180 grains' },
  { day: 3, grains: 0, piments: 3, label: '3 piments' },
  { day: 4, grains: 300, piments: 0, label: '300 grains' },
  { day: 5, grains: 0, piments: 5, label: '5 piments' },
  { day: 6, grains: 500, piments: 0, label: '500 grains' },
  { day: 7, grains: 800, piments: 10, label: '800 grains + 10 piments' },
];

export function streakRewardFor(streak: number): StreakReward {
  // une série à 0 tombait sur l'index 6, soit la récompense du jour 7
  const idx = ((Math.max(1, streak) - 1) % 7 + 7) % 7;
  return STREAK_REWARDS[idx];
}

// ─── Pub récompensée ─────────────────────────────────────────────────────

export type AdKind = 'dodo' | 'grains' | 'double' | 'arena' | 'key';

export interface AdOffer {
  kind: AdKind;
  title: string;
  reward: string;
  icon: string;
}

export const MAX_ADS_PER_DAY = 6;
export const AD_COOLDOWN_MS = 3 * 60 * 1000;

export const AD_OFFERS: Record<AdKind, AdOffer> = {
  dodo: {
    kind: 'dodo',
    title: 'Dodo ofèr',
    reward: '+20 motivation',
    icon: '🍺',
  },
  grains: {
    kind: 'grains',
    title: 'Sak de grains',
    reward: 'grains selon ton niveau',
    icon: '🌽',
  },
  double: {
    kind: 'double',
    title: 'Doubl out rékonpans',
    reward: '×2 sur la quête terminée',
    icon: '✨',
  },
  arena: {
    kind: 'arena',
    title: 'Batay tousuit',
    reward: "annule l'attente du rond",
    icon: '⏩',
  },
  key: {
    kind: 'key',
    title: 'In clé pou lo donjon',
    reward: '+1 clé',
    icon: '🗝️',
  },
};

export function adGrains(level: number): number {
  return Math.round(90 + level * 45);
}
