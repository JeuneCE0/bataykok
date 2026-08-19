import { TransKey } from '../i18n';
import { AttrId, ClassId } from './types';

export interface ClassDef {
  id: ClassId;
  /** nom propre du kok — identique dans les deux langues */
  name: string;
  mainAttr: AttrId;
  /** le rôle, la capacité et la saveur se traduisent : clés i18n */
  subtitleKey: TransKey;
  descriptionKey: TransKey;
  flavorKey: TransKey;
  /** multiplicateur de points de vie (endurance × (niveau+1) × mult) */
  hpMult: number;
  /** plafond de réduction des dégâts par l'armure */
  armorCap: number;
  /**
   * Multiplicateur de dégâts d'arme. C'est le seul levier d'équilibrage :
   * PV, armure et capacités portent l'identité de la classe et ne bougent pas.
   * Valeurs issues de scripts/tune-balance.ts, qui mesure désormais sur les
   * profils réels du jeu (joueur équipé contre l'échelle) et non sur un
   * combattant synthétique : l'écart entre classes passe de 45 à 5 points.
   */
  dmgMult: number;
  emoji: string;
  color: string;
}

export const CLASSES: Record<ClassId, ClassDef> = {
  gep: {
    id: 'gep',
    name: 'Kok Gèp',
    mainAttr: 'force',
    subtitleKey: 'class.gep.subtitle',
    descriptionKey: 'class.gep.desc',
    flavorKey: 'class.gep.flavor',
    hpMult: 5,
    armorCap: 0.5,
    dmgMult: 0.362,
    emoji: '⚔️',
    color: '#c0392b',
  },
  malin: {
    id: 'malin',
    name: 'Kok Malin',
    mainAttr: 'adresse',
    subtitleKey: 'class.malin.subtitle',
    descriptionKey: 'class.malin.desc',
    flavorKey: 'class.malin.flavor',
    hpMult: 4,
    armorCap: 0.25,
    dmgMult: 0.577,
    emoji: '💨',
    color: '#27ae60',
  },
  tizane: {
    id: 'tizane',
    name: 'Kok Tisanèr',
    mainAttr: 'esprit',
    subtitleKey: 'class.tizane.subtitle',
    descriptionKey: 'class.tizane.desc',
    flavorKey: 'class.tizane.flavor',
    hpMult: 2,
    armorCap: 0.1,
    dmgMult: 2.552,
    emoji: '🌿',
    color: '#8e44ad',
  },
  sovaz: {
    id: 'sovaz',
    name: 'Kok Sovaz',
    mainAttr: 'force',
    subtitleKey: 'class.sovaz.subtitle',
    descriptionKey: 'class.sovaz.desc',
    flavorKey: 'class.sovaz.flavor',
    hpMult: 4,
    armorCap: 0.25,
    dmgMult: 0.376,
    emoji: '🔥',
    color: '#d35400',
  },
  piman: {
    id: 'piman',
    name: 'Kok Piman',
    mainAttr: 'force',
    subtitleKey: 'class.piman.subtitle',
    descriptionKey: 'class.piman.desc',
    flavorKey: 'class.piman.flavor',
    hpMult: 5,
    armorCap: 0.5,
    dmgMult: 0.317,
    emoji: '🌶️',
    color: '#e74c3c',
  },
  sega: {
    id: 'sega',
    name: 'Kok Séga',
    mainAttr: 'esprit',
    subtitleKey: 'class.sega.subtitle',
    descriptionKey: 'class.sega.desc',
    flavorKey: 'class.sega.flavor',
    hpMult: 3,
    armorCap: 0.1,
    dmgMult: 2.016,
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
