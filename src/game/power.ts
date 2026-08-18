import { CLASSES } from './classes';
import { playerArmor, playerWeapon, totalAttrs } from './formulas';
import { ATTR_LABELS } from './classes';
import { AttrId, Fighter, Item, PlayerState } from './types';

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

/** Compare un objet à celui déjà porté sur le même emplacement. */
export function compareToEquipped(
  it: Item,
  player: PlayerState
): ItemComparison {
  const cur = player.equipment[it.slot] ?? null;
  const score = itemScore(it, player.classId);
  const currentScore = cur ? itemScore(cur, player.classId) : 0;
  const diff = score - currentScore;

  const deltas: StatDelta[] = [];
  const dmg = (x: Item | null) =>
    x && x.dmgMin && x.dmgMax ? (x.dmgMin + x.dmgMax) / 2 : 0;
  const dDmg = dmg(it) - dmg(cur);
  if (dDmg !== 0) deltas.push({ label: 'Dégâts', delta: Math.round(dDmg) });
  const dArm = (it.armor ?? 0) - (cur?.armor ?? 0);
  if (dArm !== 0) deltas.push({ label: 'Armure', delta: dArm });

  const keys = new Set<AttrId>([
    ...(Object.keys(it.bonuses) as AttrId[]),
    ...((cur ? Object.keys(cur.bonuses) : []) as AttrId[]),
  ]);
  keys.forEach((k) => {
    const d = (it.bonuses[k] ?? 0) - (cur?.bonuses[k] ?? 0);
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
