import { localDay } from './day';

/** Remise de l'affaire du jour. */
export const DEAL_DISCOUNT = 0.4;

/**
 * Quel objet de la rotation est en promotion aujourd'hui.
 *
 * Dérivé du jour plutôt que stocké : l'affaire ne peut pas dériver entre deux
 * rendus, et le compte à rebours affiché reste vrai. Un rerouleau payant
 * change l'objet qui occupe la place — c'est voulu, ça donne une raison de
 * payer le rerouleau.
 */
export function dealIndex(shopSize: number, day: string = localDay()): number {
  if (shopSize <= 0) return -1;
  let h = 2166136261;
  for (let i = 0; i < day.length; i++) {
    h ^= day.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % shopSize;
}

/** Prix de l'affaire du jour. */
export function dealPrice(base: number): number {
  return Math.max(1, Math.round(base * (1 - DEAL_DISCOUNT)));
}
