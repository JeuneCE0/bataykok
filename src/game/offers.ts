import { TransKey } from '../i18n';
import { Rarity } from './types';

/**
 * Offres payantes ponctuelles.
 *
 * Le Bazar ne proposait qu'un pack de bienvenue et un abonnement, tous deux
 * permanents : rien qui donne une raison de revenir un mardi plutôt qu'un
 * lundi. Ces offres apparaissent au lancement, une par jour au plus, et
 * expirent — c'est la rareté perçue qui fait l'offre, pas le montant de la
 * remise.
 *
 * Aucun achat intégré n'est branché : les boutons annoncent la simulation.
 */
export interface Offer {
  id: string;
  nameKey: TransKey;
  pitchKey: TransKey;
  /** ce qu'on reçoit */
  piments: number;
  grains: number;
  /** pièce offerte, s'il y en a une */
  itemRarity: Rarity | null;
  /** prix affiché et prix barré, en euros */
  price: string;
  oldPrice: string;
  /** économie annoncée */
  saving: number;
  icon: string;
  color: string;
  /** niveau minimal pour que l'offre ait du sens */
  minLevel: number;
  /** durée de vie une fois proposée, en heures */
  hours: number;
}

export const OFFERS: Offer[] = [
  {
    id: 'ti_batayer',
    nameKey: 'offer.ti_batayer.name',
    pitchKey: 'offer.ti_batayer.pitch',
    piments: 120,
    grains: 4000,
    itemRarity: 'kalite',
    price: '2,99 €',
    oldPrice: '7,99 €',
    saving: 62,
    icon: '🐣',
    color: '#3BD97E',
    minLevel: 2,
    hours: 48,
  },
  {
    id: 'sak_volkan',
    nameKey: 'offer.sak_volkan.name',
    pitchKey: 'offer.sak_volkan.pitch',
    piments: 420,
    grains: 18000,
    itemRarity: 'rar',
    price: '6,99 €',
    oldPrice: '16,99 €',
    saving: 59,
    icon: '🌋',
    color: '#FF5A1F',
    minLevel: 8,
    hours: 24,
  },
  {
    id: 'trezor_gramoune',
    nameKey: 'offer.trezor_gramoune.name',
    pitchKey: 'offer.trezor_gramoune.pitch',
    piments: 1400,
    grains: 80000,
    itemRarity: 'lezand',
    price: '19,99 €',
    oldPrice: '49,99 €',
    saving: 60,
    icon: '🪬',
    color: '#FFC93C',
    minLevel: 18,
    hours: 24,
  },
  {
    id: 'kof_zanset',
    nameKey: 'offer.kof_zanset.name',
    pitchKey: 'offer.kof_zanset.pitch',
    piments: 3000,
    grains: 200000,
    itemRarity: 'mitik',
    price: '49,99 €',
    oldPrice: '119,99 €',
    saving: 58,
    icon: '👑',
    color: '#FF2E63',
    minLevel: 30,
    hours: 12,
  },
];

export const OFFER_BY_ID: Record<string, Offer> = OFFERS.reduce(
  (acc, o) => {
    acc[o.id] = o;
    return acc;
  },
  {} as Record<string, Offer>
);

/**
 * L'offre à proposer aujourd'hui, ou `null`.
 *
 * On prend la plus chère que le niveau justifie et qui n'a pas déjà été prise :
 * proposer le pack de bienvenue à un joueur de niveau 30 ne sert personne.
 */
export function offerOfDay(
  level: number,
  achetees: string[],
  day: string
): Offer | null {
  const eligibles = OFFERS.filter(
    (o) => level >= o.minLevel && !achetees.includes(o.id)
  );
  if (eligibles.length === 0) return null;
  // stable sur la journée : l'offre ne doit pas changer entre deux ouvertures
  let h = 0;
  for (let i = 0; i < day.length; i++) h = (h * 31 + day.charCodeAt(i)) | 0;
  // les deux tiers du temps la plus haute débloquée, sinon une au hasard —
  // sinon la même offre reviendrait indéfiniment jusqu'à l'achat
  const haute = eligibles[eligibles.length - 1];
  return Math.abs(h) % 3 === 0
    ? eligibles[Math.abs(h >> 3) % eligibles.length]
    : haute;
}
