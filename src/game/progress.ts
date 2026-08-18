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
  title: string;
  hint: string;
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
    title: 'Ékip out zéprons',
    hint: 'Dan out sak, ékip in arme su out kok.',
    icon: '🗡️',
    tab: 'kok',
    grains: 60,
    piments: 0,
  },
  {
    id: 'quest',
    title: 'Fé out prémié kèt',
    hint: 'Chez Mémé Zizine, pars en quête et récupère la récompense.',
    icon: '🗺️',
    tab: 'quetes',
    grains: 90,
    piments: 0,
  },
  {
    id: 'attr',
    title: 'Monte in attribut',
    hint: 'Dépense des grains pour muscler ton kok.',
    icon: '💪',
    tab: 'kok',
    grains: 80,
    piments: 1,
  },
  {
    id: 'arena',
    title: 'Rentre dann rond',
    hint: 'Lance ton premier combat au gallodrome.',
    icon: '⚔️',
    tab: 'rond',
    grains: 100,
    piments: 1,
  },
  {
    id: 'shop',
    title: 'Achète o Bazar',
    hint: 'Un bon ékipman change tout. Regarde les flèches vertes !',
    icon: '🛒',
    tab: 'bazar',
    grains: 120,
    piments: 0,
  },
  {
    id: 'win',
    title: 'Gagne in batay',
    hint: 'Monte au Palmarès en battant un kok mieux classé.',
    icon: '🏆',
    tab: 'rond',
    grains: 200,
    piments: 2,
  },
  {
    id: 'guild',
    title: "Rentre dan in n'écurie",
    hint: 'Les écuries donnent des bonus XP et grains permanents.',
    icon: '🏠',
    tab: 'ecurie',
    grains: 150,
    piments: 1,
  },
  {
    id: 'donjon',
    title: 'Bat out prémié gardien',
    hint: 'Su la Rout dé Sirk, chak gardien i lâche in ékipman garanti.',
    icon: '🗝️',
    tab: 'donjon',
    grains: 200,
    piments: 2,
  },
  {
    id: 'level3',
    title: 'Ariv nivo 3',
    hint: 'Enchaîne quêtes et batays pour monter en niveau.',
    icon: '⭐',
    tab: 'quetes',
    grains: 250,
    piments: 3,
  },
  {
    id: 'transport',
    title: 'Achète in transport',
    hint: 'Au Garage : tes quêtes iront bien plus vite.',
    icon: '🛵',
    tab: 'bazar',
    grains: 300,
    piments: 2,
  },
  {
    id: 'level5',
    title: 'Ariv nivo 5',
    hint: 'Ton kok devient un vrai batayeur.',
    icon: '🔥',
    tab: 'rond',
    grains: 500,
    piments: 5,
  },
  {
    id: 'mitik',
    title: 'Trouv in objè Mitik',
    hint: 'La rareté suprême. Tente le Bazar et les quêtes longues.',
    icon: '💎',
    tab: 'bazar',
    grains: 800,
    piments: 8,
  },
];

export const STEP_BY_ID: Record<StepId, StepDef> = STEPS.reduce(
  (acc, s) => {
    acc[s.id] = s;
    return acc;
  },
  {} as Record<StepId, StepDef>
);

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
  title: string;
  icon: string;
  grains: number;
  piments: number;
}

const POOL: MissionDef[] = [
  { id: 'q2', kind: 'quest', target: 2, title: 'Fé 2 kèt', icon: '🗺️', grains: 150, piments: 0 },
  { id: 'q3', kind: 'quest', target: 3, title: 'Fé 3 kèt', icon: '🗺️', grains: 220, piments: 1 },
  { id: 'a2', kind: 'arena', target: 2, title: 'Batay 2 foi dann rond', icon: '⚔️', grains: 160, piments: 0 },
  { id: 'w1', kind: 'win', target: 1, title: 'Gagne 1 batay', icon: '🏆', grains: 200, piments: 1 },
  { id: 'w2', kind: 'win', target: 2, title: 'Gagne 2 batay', icon: '🏆', grains: 320, piments: 1 },
  { id: 'b1', kind: 'buy', target: 1, title: 'Achète 1 ékipman', icon: '🛒', grains: 120, piments: 0 },
  { id: 'at2', kind: 'attr', target: 2, title: 'Monte 2 attributs', icon: '💪', grains: 140, piments: 0 },
  { id: 'at4', kind: 'attr', target: 4, title: 'Monte 4 attributs', icon: '💪', grains: 260, piments: 1 },
  { id: 'd1', kind: 'dodo', target: 1, title: 'Boir in Dodo fré', icon: '🍺', grains: 100, piments: 0 },
  { id: 'e1', kind: 'equip', target: 1, title: 'Ékip in nouvo linz', icon: '🎽', grains: 110, piments: 0 },
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
  const idx = ((streak - 1) % 7 + 7) % 7;
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
