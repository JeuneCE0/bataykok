import { AttrId, ClassId } from './types';

export interface ClassDef {
  id: ClassId;
  name: string;
  subtitle: string;
  mainAttr: AttrId;
  mainAttrLabel: string;
  description: string;
  flavor: string;
  /** multiplicateur de points de vie (endurance × (niveau+1) × mult) */
  hpMult: number;
  /** plafond de réduction des dégâts par l'armure */
  armorCap: number;
  /**
   * Multiplicateur de dégâts d'arme. C'est le seul levier d'équilibrage :
   * PV, armure et capacités portent l'identité de la classe et ne bougent pas.
   * Valeurs issues d'une recherche automatique (scripts/tune-balance.ts) qui
   * a ramené l'écart entre classes de 32 à moins de 5 points.
   */
  dmgMult: number;
  emoji: string;
  color: string;
}

export const CLASSES: Record<ClassId, ClassDef> = {
  gep: {
    id: 'gep',
    name: 'Kok Gèp',
    subtitle: 'Le Guerrier',
    mainAttr: 'force',
    mainAttrLabel: 'Force',
    description:
      "Bloque 25% des coups avec ses zéprons d'acier trempé (sauf pouvoirs mystiques).",
    flavor: "Race légendaire du rond. Li tape for, li tape dur. Oté !",
    hpMult: 5,
    armorCap: 0.5,
    dmgMult: 1.09,
    emoji: '⚔️',
    color: '#c0392b',
  },
  malin: {
    id: 'malin',
    name: 'Kok Malin',
    subtitle: "L'Esquiveur",
    mainAttr: 'adresse',
    mainAttrLabel: 'Adresse',
    description:
      "Esquive 50% des attaques adverses grâce à son jeu de pattes (sauf pouvoirs mystiques).",
    flavor: "Fin malin sa ! Ou tape, li lé déjà pi là.",
    hpMult: 4,
    armorCap: 0.25,
    dmgMult: 0.91,
    emoji: '💨',
    color: '#27ae60',
  },
  tizane: {
    id: 'tizane',
    name: 'Kok Tisanèr',
    subtitle: 'Le Mystique',
    mainAttr: 'esprit',
    mainAttrLabel: 'Esprit',
    description:
      "Ses attaques mystiques du gramoune ne peuvent être ni bloquées ni esquivées.",
    flavor: "Élevé aux tisanes péi dans les hauts de Cilaos. Son regard i fé fré dann do.",
    hpMult: 2,
    armorCap: 0.1,
    dmgMult: 3.34,
    emoji: '🌿',
    color: '#8e44ad',
  },
  sovaz: {
    id: 'sovaz',
    name: 'Kok Sovaz',
    subtitle: 'Le Berserker',
    mainAttr: 'force',
    mainAttrLabel: 'Force',
    description:
      "Entre en furie : 50% de chance d'enchaîner un coup supplémentaire (15 max d'affilée).",
    flavor: "Attrapé dans les ravines de Mafate. Personne i tient dan son chemin.",
    hpMult: 4,
    armorCap: 0.25,
    dmgMult: 0.89,
    emoji: '🔥',
    color: '#d35400',
  },
  piman: {
    id: 'piman',
    name: 'Kok Piman',
    subtitle: 'Le Mage de Combat',
    mainAttr: 'force',
    mainAttrLabel: 'Force',
    description:
      "Crache une boule de feu au piman kabri au début de chaque combat (jusqu'à 33% des PV ennemis).",
    flavor: "Nourri au rougail piment depuis poussin. Son bec i brûle.",
    hpMult: 5,
    armorCap: 0.5,
    dmgMult: 1.07,
    emoji: '🌶️',
    color: '#e74c3c',
  },
  sega: {
    id: 'sega',
    name: 'Kok Séga',
    subtitle: 'Le Barde',
    mainAttr: 'esprit',
    mainAttrLabel: 'Esprit',
    description:
      "Chante un séga électrisant tous les 4 tours : ses attaques suivantes font +60% de dégâts.",
    flavor: "Star des kabars. Son maloya i fé trembler le gallodrome.",
    hpMult: 3,
    armorCap: 0.1,
    dmgMult: 2.46,
    emoji: '🎵',
    color: '#f39c12',
  },
};

export const CLASS_LIST = Object.values(CLASSES);

export const ATTR_LABELS: Record<AttrId, string> = {
  force: 'Force',
  adresse: 'Adresse',
  esprit: 'Esprit',
  endurance: 'Endurance',
  chance: 'Chance',
};

export const ATTR_ICONS: Record<AttrId, string> = {
  force: '💪',
  adresse: '🎯',
  esprit: '🧠',
  endurance: '❤️',
  chance: '🍀',
};
