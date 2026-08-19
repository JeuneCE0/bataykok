import { TransKey } from '../i18n';

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
  titleKey: TransKey;
  descKey: TransKey;
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
        titleKey: 'talent.kou_dur.title',
        descKey: 'talent.kou_dur.desc',
        icon: '🗡️',
        effect: { dmg: 0.12 },
      },
      {
        id: 'kwir_dur',
        titleKey: 'talent.kwir_dur.title',
        descKey: 'talent.kwir_dur.desc',
        icon: '❤️',
        effect: { hp: 0.15 },
      },
      {
        id: 'ti_komersan',
        titleKey: 'talent.ti_komersan.title',
        descKey: 'talent.ti_komersan.desc',
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
        titleKey: 'talent.lespri_vif.title',
        descKey: 'talent.lespri_vif.desc',
        icon: '⚡',
        effect: { crit: 0.25 },
      },
      {
        id: 'karapas',
        titleKey: 'talent.karapas.title',
        descKey: 'talent.karapas.desc',
        icon: '🛡️',
        effect: { armor: 0.25 },
      },
      {
        id: 'bon_zelev',
        titleKey: 'talent.bon_zelev.title',
        descKey: 'talent.bon_zelev.desc',
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
        titleKey: 'talent.sof_rapid.title',
        descKey: 'talent.sof_rapid.desc',
        icon: '⚔️',
        effect: { tickets: 1 },
      },
      {
        id: 'pié_lézé',
        titleKey: 'talent.pié_lézé.title',
        descKey: 'talent.pié_lézé.desc',
        icon: '🛵',
        effect: { questSpeed: 0.2 },
      },
      {
        id: 'fors_brit',
        titleKey: 'talent.fors_brit.title',
        descKey: 'talent.fors_brit.desc',
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
        titleKey: 'talent.kok_dasié.title',
        descKey: 'talent.kok_dasié.desc',
        icon: '🪨',
        effect: { hp: 0.22, armor: 0.15 },
      },
      {
        id: 'chaser',
        titleKey: 'talent.chaser.title',
        descKey: 'talent.chaser.desc',
        icon: '💰',
        effect: { gold: 0.3, xp: 0.15 },
      },
      {
        id: 'zéprons_fé',
        titleKey: 'talent.zéprons_fé.title',
        descKey: 'talent.zéprons_fé.desc',
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
        titleKey: 'talent.lezand.title',
        descKey: 'talent.lezand.desc',
        icon: '👑',
        effect: { tickets: 2 },
      },
      {
        id: 'mèt_kritik',
        titleKey: 'talent.mèt_kritik.title',
        descKey: 'talent.mèt_kritik.desc',
        icon: '🎯',
        effect: { crit: 0.4 },
      },
      {
        id: 'gran_batayeur',
        titleKey: 'talent.gran_batayeur.title',
        descKey: 'talent.gran_batayeur.desc',
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
