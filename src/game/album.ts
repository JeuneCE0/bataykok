import { Item, Rarity, SlotId } from './types';

/**
 * Zalbum : la collection. Chaque combinaison emplacement × rareté vue au moins
 * une fois reste acquise, et le remplissage donne un bonus d'XP permanent —
 * de quoi donner une valeur à un objet qu'on ne portera jamais.
 */
export const ALBUM_SLOTS: SlotId[] = [
  'arme',
  'tete',
  'torse',
  'pattes',
  'amulette',
  'anneau',
  'ceinture',
  'grigri',
];

export const ALBUM_RARITIES: Rarity[] = ['commun', 'korek', 'kalite', 'mitik'];

export const ALBUM_SIZE = ALBUM_SLOTS.length * ALBUM_RARITIES.length;

export function albumKey(slot: SlotId, rarity: Rarity): string {
  return `${slot}:${rarity}`;
}

export function itemAlbumKey(it: Item): string {
  return albumKey(it.slot, it.rarity);
}

/** +1 % d'XP par case remplie : 32 % au Zalbum complet. */
export function albumXpBonus(count: number): number {
  return count / 100;
}
