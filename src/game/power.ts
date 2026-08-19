import { CLASSES } from './classes';
import { playerArmor, playerWeapon, totalAttrs } from './formulas';
import { ATTR_LABELS } from './classes';
import { RARITY_COLORS, RARITY_ORDER, rarityRank } from './items';
import { AttrId, Attributes, Fighter, Item, PlayerState } from './types';

/**
 * Score de puissance : une seule note comparable entre deux objets. Pondérée
 * par la classe — l'attribut principal vaut plus cher qu'un attribut neutre,
 * sinon comparer un kolié d'Esprit à un gilet de Force n'a aucun sens.
 */
export function itemScore(it: Item, classId: PlayerState['classId']): number {
  const cls = CLASSES[classId];
  let s = 0;
  if (it.dmgMin && it.dmgMax) s += ((it.dmgMin + it.dmgMax) / 2) * 3.2;
  if (it.armor) s += it.armor * 1.3;
  (Object.keys(it.bonuses) as AttrId[]).forEach((k) => {
    const v = it.bonuses[k] ?? 0;
    const weight = k === cls.mainAttr ? 2.4 : k === 'endurance' ? 1.5 : 1;
    s += v * weight;
  });
  return Math.round(s);
}

export type Verdict = 'better' | 'worse' | 'equal' | 'empty';

export interface StatDelta {
  label: string;
  delta: number;
}

export interface ItemComparison {
  score: number;
  currentScore: number;
  diff: number;
  verdict: Verdict;
  deltas: StatDelta[];
  equipped: Item | null;
}

/**
 * Compare un objet à celui déjà porté sur le même emplacement.
 *
 * La comparaison portait sur les deux objets isolés, en ignorant les
 * panoplies : le jeu conseillait de retirer la quatrième pièce d'un set pour
 * une pièce nue de statistiques légèrement supérieures, et « Vendre le
 * surplus » pouvait liquider un set complet. On compare désormais les
 * attributs **totaux** avant et après l'échange, bonus de panoplie compris.
 */
export function compareToEquipped(
  it: Item,
  player: PlayerState
): ItemComparison {
  const cur = player.equipment[it.slot] ?? null;
  const cls = CLASSES[player.classId];

  const pesee = (a: Attributes) =>
    (Object.keys(a) as AttrId[]).reduce(
      (sum, k) =>
        sum + a[k] * (k === cls.mainAttr ? 2.4 : k === 'endurance' ? 1.5 : 1),
      0
    );

  const apres: PlayerState = { ...player, equipment: { ...player.equipment, [it.slot]: it } };
  const attrsAvant = totalAttrs(player);
  const attrsApres = totalAttrs(apres);

  const dmg = (x: Item | null) =>
    x && x.dmgMin && x.dmgMax ? (x.dmgMin + x.dmgMax) / 2 : 0;
  const armes = (dmg(it) - dmg(cur)) * 3.2;
  const armures = ((it.armor ?? 0) - (cur?.armor ?? 0)) * 1.3;

  const diff = Math.round(pesee(attrsApres) - pesee(attrsAvant) + armes + armures);
  const score = itemScore(it, player.classId);
  const currentScore = cur ? itemScore(cur, player.classId) : 0;

  const deltas: StatDelta[] = [];
  const dDmg = dmg(it) - dmg(cur);
  if (dDmg !== 0) deltas.push({ label: 'Dégâts', delta: Math.round(dDmg) });
  const dArm = (it.armor ?? 0) - (cur?.armor ?? 0);
  if (dArm !== 0) deltas.push({ label: 'Armure', delta: dArm });

  // les écarts affichés incluent le gain ou la perte de panoplie : c'est
  // précisément ce que le joueur ne voyait pas
  (Object.keys(attrsApres) as AttrId[]).forEach((k) => {
    const d = attrsApres[k] - attrsAvant[k];
    if (d !== 0) deltas.push({ label: ATTR_LABELS[k], delta: d });
  });

  return {
    score,
    currentScore,
    diff,
    verdict: !cur ? 'empty' : diff > 0 ? 'better' : diff < 0 ? 'worse' : 'equal',
    deltas,
    equipped: cur,
  };
}

/** Même échelle que kokPower, appliquée à un combattant prêt (joueur ou bot). */
export function fighterPower(f: Fighter): number {
  const cls = CLASSES[f.classId];
  const a = f.attrs;
  const main = a[cls.mainAttr];
  return Math.round(
    main * 2.4 +
      (a.force + a.adresse + a.esprit + a.chance - main) * 0.9 +
      a.endurance * cls.hpMult * 0.5 +
      ((f.weaponMin + f.weaponMax) / 2) * cls.dmgMult * 3 +
      f.armor * 1.2
  );
}

/** Puissance globale du kok — la note que le joueur cherche à faire monter. */
export function kokPower(p: PlayerState): number {
  const a = totalAttrs(p);
  const cls = CLASSES[p.classId];
  const w = playerWeapon(p);
  const main = a[cls.mainAttr];
  return Math.round(
    main * 2.4 +
      (a.force + a.adresse + a.esprit + a.chance - main) * 0.9 +
      a.endurance * cls.hpMult * 0.5 +
      ((w.min + w.max) / 2) * cls.dmgMult * 3 +
      playerArmor(p) * 1.2
  );
}

/**
 * Couleur de la meilleure gamme portée — le halo du coq. Un joueur doit voir
 * qu'il a progressé sans ouvrir de fiche.
 */
export function auraColor(player: PlayerState): string | null {
  let best = -1;
  for (const it of Object.values(player.equipment) as (Item | undefined)[]) {
    if (it) best = Math.max(best, rarityRank(it.rarity));
  }
  // en dessous de « rar », le halo n'apprendrait rien : presque tout le monde
  // porte du commun ou du korek
  return best >= 3 ? RARITY_COLORS[RARITY_ORDER[best]] : null;
}
