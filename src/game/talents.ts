/**
 * Talents : un choix tous les cinq niveaux. C'est le seul endroit du jeu où
 * deux koks de même classe divergent — il faut donc que les options soient
 * lisibles et exclusives, pas des +2 % interchangeables.
 */
export interface TalentEffects {
  dmg: number;
  hp: number;
  crit: number;
  armor: number;
  gold: number;
  xp: number;
  tickets: number;
  questSpeed: number;
}

export interface TalentDef {
  id: string;
  title: string;
  desc: string;
  icon: string;
  effect: Partial<TalentEffects>;
}

export interface TalentTier {
  level: number;
  choices: TalentDef[];
}

export const TALENT_TIERS: TalentTier[] = [
  {
    level: 5,
    choices: [
      {
        id: 'kou_dur',
        title: 'Kou dur',
        desc: '+12 % de dégâts d’arme',
        icon: '🗡️',
        effect: { dmg: 0.12 },
      },
      {
        id: 'kwir_dur',
        title: 'Kwir dur',
        desc: '+15 % de points de vie',
        icon: '❤️',
        effect: { hp: 0.15 },
      },
      {
        id: 'ti_komersan',
        title: 'Ti komersan',
        desc: '+20 % de grains sur tout',
        icon: '🌽',
        effect: { gold: 0.2 },
      },
    ],
  },
  {
    level: 10,
    choices: [
      {
        id: 'lespri_vif',
        title: 'Lespri vif',
        desc: '+25 % de chance de coup kritik',
        icon: '⚡',
        effect: { crit: 0.25 },
      },
      {
        id: 'karapas',
        title: 'Karapas',
        desc: '+25 % d’armure',
        icon: '🛡️',
        effect: { armor: 0.25 },
      },
      {
        id: 'bon_zelev',
        title: 'Bon zélèv',
        desc: '+20 % d’XP sur tout',
        icon: '✨',
        effect: { xp: 0.2 },
      },
    ],
  },
  {
    level: 15,
    choices: [
      {
        id: 'sof_rapid',
        title: 'Sof rapid',
        desc: '+1 jeton de batay',
        icon: '⚔️',
        effect: { tickets: 1 },
      },
      {
        id: 'pié_lézé',
        title: 'Pié lézé',
        desc: '−20 % sur la durée des quêtes',
        icon: '🛵',
        effect: { questSpeed: 0.2 },
      },
      {
        id: 'fors_brit',
        title: 'Fors brit',
        desc: '+18 % de dégâts d’arme',
        icon: '💥',
        effect: { dmg: 0.18 },
      },
    ],
  },
  {
    level: 20,
    choices: [
      {
        id: 'kok_dasié',
        title: 'Kok d’asié',
        desc: '+22 % de PV et +15 % d’armure',
        icon: '🪨',
        effect: { hp: 0.22, armor: 0.15 },
      },
      {
        id: 'chaser',
        title: 'Chasèr',
        desc: '+30 % de grains et +15 % d’XP',
        icon: '💰',
        effect: { gold: 0.3, xp: 0.15 },
      },
      {
        id: 'zéprons_fé',
        title: 'Zéprons de fé',
        desc: '+25 % de dégâts d’arme',
        icon: '🔥',
        effect: { dmg: 0.25 },
      },
    ],
  },
  {
    level: 25,
    choices: [
      {
        id: 'lezand',
        title: 'Lézand du rond',
        desc: '+2 jetons de batay',
        icon: '👑',
        effect: { tickets: 2 },
      },
      {
        id: 'mèt_kritik',
        title: 'Mèt du kritik',
        desc: '+40 % de chance de kritik',
        icon: '🎯',
        effect: { crit: 0.4 },
      },
      {
        id: 'gran_batayeur',
        title: 'Gran batayèr',
        desc: '+20 % de dégâts et +20 % de PV',
        icon: '🏆',
        effect: { dmg: 0.2, hp: 0.2 },
      },
    ],
  },
];

export const TALENT_BY_ID: Record<string, TalentDef> = TALENT_TIERS.reduce(
  (acc, t) => {
    t.choices.forEach((c) => {
      acc[c.id] = c;
    });
    return acc;
  },
  {} as Record<string, TalentDef>
);

const EMPTY: TalentEffects = {
  dmg: 0,
  hp: 0,
  crit: 0,
  armor: 0,
  gold: 0,
  xp: 0,
  tickets: 0,
  questSpeed: 0,
};

export function talentEffects(ids: string[]): TalentEffects {
  const out = { ...EMPTY };
  ids.forEach((id) => {
    const def = TALENT_BY_ID[id];
    if (!def) return;
    (Object.keys(def.effect) as (keyof TalentEffects)[]).forEach((k) => {
      out[k] += def.effect[k] ?? 0;
    });
  });
  return out;
}

/** Le palier dû au joueur, s'il n'a pas encore choisi. */
export function pendingTier(level: number, chosen: string[]): TalentTier | null {
  for (const tier of TALENT_TIERS) {
    if (level < tier.level) break;
    const taken = tier.choices.some((c) => chosen.includes(c.id));
    if (!taken) return tier;
  }
  return null;
}
