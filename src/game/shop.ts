import { localDay } from './day';

/** Remise de l'affaire du jour. */
export const DEAL_DISCOUNT = 0.4;

/**
 * Quel objet de la rotation est en promotion aujourd'hui.
 *
 * `scores` donne, pour chaque objet, ce qu'il apporterait au joueur (l'écart
 * de `compareToEquipped`). L'affaire tombe sur le **meilleur** : tirée au sort,
 * elle tombait le plus souvent sur une pièce moins bonne que l'équipement
 * porté, et une « affaire » affichée en rouge n'en est pas une.
 *
 * En cas d'égalité — typiquement une rotation entièrement en dessous du porté —
 * le jour départage, pour que l'affaire ne saute pas d'un rendu à l'autre.
 */
export function dealIndex(scores: number[], day: string = localDay()): number {
  if (scores.length === 0) return -1;
  let h = 2166136261;
  for (let i = 0; i < day.length; i++) {
    h ^= day.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const depart = (h >>> 0) % scores.length;
  let meilleur = depart;
  for (let k = 1; k < scores.length; k++) {
    const i = (depart + k) % scores.length;
    if (scores[i] > scores[meilleur]) meilleur = i;
  }
  return meilleur;
}

/** Prix de l'affaire du jour. */
export function dealPrice(base: number): number {
  return Math.max(1, Math.round(base * (1 - DEAL_DISCOUNT)));
}
