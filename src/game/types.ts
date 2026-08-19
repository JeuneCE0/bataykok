import { TransKey } from '../i18n';

// ─── Types du jeu Batay Kok ───────────────────────────────────────────────

export type ClassId = 'gep' | 'malin' | 'tizane' | 'sovaz' | 'piman' | 'sega';

export type AttrId = 'force' | 'adresse' | 'esprit' | 'endurance' | 'chance';

export interface Attributes {
  force: number;
  adresse: number;
  esprit: number;
  endurance: number;
  chance: number;
}

export type Rarity =
  | 'commun'
  | 'korek'
  | 'kalite'
  | 'rar'
  | 'lezand'
  | 'mitik'
  /** Zanset : le palier des uniques. Un objet nommé, jamais deux fois le même. */
  | 'zanset';

export type SlotId =
  | 'arme'
  | 'tete'
  | 'torse'
  | 'pattes'
  | 'amulette'
  | 'anneau'
  | 'ceinture'
  | 'grigri';

export interface Item {
  id: string;
  slot: SlotId;
  name: string;
  rarity: Rarity;
  level: number;
  /** dégâts min/max — uniquement pour les armes (zéprons) */
  dmgMin?: number;
  dmgMax?: number;
  /** armure — pièces défensives */
  armor?: number;
  bonuses: Partial<Attributes>;
  price: number;
  /** panoplie éventuelle (voir game/sets.ts) */
  setId?: string;
  /** objet unique (voir game/uniques.ts) — porte son propre nom et sa légende */
  uniqueId?: string;
}

export interface Appearance {
  bodyColor: string;
  combColor: string;
  tailPalette: number; // index de palette
  accessory: number; // index d'accessoire
}

export interface Fighter {
  name: string;
  level: number;
  classId: ClassId;
  attrs: Attributes; // attributs TOTAUX (base + équipement)
  weaponMin: number;
  weaponMax: number;
  armor: number;
  appearance: Appearance;
}

export interface PlayerState {
  name: string;
  classId: ClassId;
  level: number;
  xp: number;
  appearance: Appearance;
  baseAttrs: Attributes; // attributs achetés (hors équipement)
  equipment: Partial<Record<SlotId, Item>>;
  inventory: Item[];
  grains: number; // monnaie principale (or)
  piments: number; // monnaie premium (champignons)
  honor: number;
  rank: number; // position au classement (1 = meilleur)
  wins: number;
  losses: number;
  guildId: string | null;
  transport: number; // index du moyen de transport possédé
  /** talents choisis (voir game/talents.ts) */
  talents: string[];
  /** cosmétiques achetés (voir game/cosmetics.ts) */
  cosmetics: string[];
}

export interface Quest {
  id: string;
  /** clés i18n : une quête en cours est persistée, elle doit suivre la langue */
  titleKey: TransKey;
  placeKey: TransKey;
  flavorKey: TransKey;
  durationSec: number;
  motivationCost: number;
  gold: number;
  xp: number;
  itemChance: number; // 0..1
  pimentChance: number; // 0..1
}

export interface ActiveQuest {
  quest: Quest;
  /** date de départ — la progression se mesure entre elle et `endsAt` */
  startedAt: number;
  endsAt: number; // timestamp ms
}

export interface Bot {
  id: string;
  name: string;
  classId: ClassId;
  level: number;
  appearance: Appearance;
}

export interface CombatRound {
  attacker: 0 | 1;
  kind:
    | 'hit'
    | 'crit'
    | 'block'
    | 'dodge'
    | 'comet'
    | 'chain'
    | 'melody';
  damage: number;
  hpAfter: [number, number];
  text: string;
}

export interface CombatResult {
  winner: 0 | 1;
  rounds: CombatRound[];
  maxHp: [number, number];
}

export interface GuildDef {
  id: string;
  name: string;
  motto: string;
  members: string[];
  emblem: string;
}
