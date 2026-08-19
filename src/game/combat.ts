import { CLASSES } from './classes';
import { maxHp } from './formulas';
import { CombatResult, CombatRound, Fighter } from './types';

// Commentaires du rond, façon kabar
const HIT_LINES = [
  '%A i mèt in kou de zéprons à %D !',
  '%A i pik %D sec !',
  'Zoli kou de bec de %A !',
  '%A i sava dessus %D !',
  '%A i fé volé la plime de %D !',
];
const CRIT_LINES = [
  'OTÉ ! Kou kritik de %A ! Le rond i kriye !',
  'MONMON ! %A i alonz %D ak in kou mortel !',
  'Kou de maître ! %A i fé mal, i fé MAL !',
];
const BLOCK_LINES = [
  '%D i blok ek son zéprons ! Nada !',
  'Blokaz propre de %D !',
];
const DODGE_LINES = [
  '%D i esquive kom in papang !',
  '%A i tape dan le vent ! %D lé pi là !',
];

function pick(lines: string[], a: string, d: string) {
  const l = lines[Math.floor(Math.random() * lines.length)];
  return l.replace(/%A/g, a).replace(/%D/g, d);
}

/**
 * Taux de coup critique.
 *
 * L'ancienne formule — `chance × 2,5 / (niveau × 100)` — faisait *baisser* le
 * taux en montant : 7,5 % au niveau 20, 4,6 % au niveau 50 pour un joueur qui
 * suit la courbe. La chance était un attribut mort, et le talent « Mèt du
 * kritik » ne rattrapait rien. Une forme en saturation garde un socle constant
 * (~13 %) et récompense vraiment l'investissement (jusqu'à 45 %).
 */
function critChance(attacker: Fighter, defender: Fighter): number {
  const c = Math.max(0, attacker.attrs.chance);
  const seuil = 12 * Math.max(1, defender.level);
  return Math.min(0.45, c / (c + seuil));
}

function baseDamage(
  attacker: Fighter,
  defender: Fighter,
  damageScale = 1
): number {
  const c = CLASSES[attacker.classId];
  const cd = CLASSES[defender.classId];
  const weapon =
    attacker.weaponMin +
    Math.random() * (attacker.weaponMax - attacker.weaponMin);
  const main = attacker.attrs[c.mainAttr];
  let dmg = weapon * c.dmgMult * (1 + main / 10);
  // réduction par l'armure (plafonnée par la classe du défenseur)
  const reduction = Math.min(
    cd.armorCap,
    defender.armor / (Math.max(1, attacker.level) * 12)
  );
  dmg *= (1 - reduction) * damageScale;
  return Math.max(1, dmg);
}

/**
 * Règles modifiées d'un jour d'événement.
 *
 * Un multiplicateur de gains est invisible en jeu : « +50 % de grains » ne se
 * raconte pas. Une règle qui change se voit au premier coup, et c'est ce qui
 * fait revenir un mardi plutôt qu'un lundi.
 */
export interface CombatMods {
  /** multiplicateur des dégâts critiques (2 par défaut) */
  critMult?: number;
  /**
   * Multiplicateur global de dégâts — 1,6 rend les combats courts et brutaux.
   *
   * Première tentative : diviser l'armure. Elle était inerte (le plafond de
   * classe étant souvent déjà atteint, réduire la valeur ne changeait rien),
   * puis, une fois portée sur la réduction effective, franchement biaisée —
   * les classes à fort `armorCap` (gèp, piman) tombaient de 61 % à 52 % de
   * victoires quand les autres ne bougeaient pas. Un multiplicateur qui
   * s'applique aux deux camps raccourcit les combats sans favoriser personne.
   */
  damageScale?: number;
}

/** Simule un combat complet, tour par tour, façon Shakes & Fidget. */
export function simulateCombat(a: Fighter, b: Fighter, mods: CombatMods = {}): CombatResult {
  const fighters: [Fighter, Fighter] = [a, b];
  const hp: [number, number] = [maxHp(a), maxHp(b)];
  const maxHpArr: [number, number] = [hp[0], hp[1]];
  const rounds: CombatRound[] = [];
  const segaCounter = [0, 0];
  const segaBuff = [false, false];

  // Boule de feu du Kok Piman en ouverture
  ([0, 1] as const).forEach((i) => {
    const f = fighters[i];
    const o = (1 - i) as 0 | 1;
    if (f.classId === 'piman') {
      const dmg = Math.round(maxHpArr[o] * (0.1 + Math.random() * 0.23));
      hp[o] = Math.max(0, hp[o] - dmg);
      rounds.push({
        attacker: i,
        kind: 'comet',
        damage: dmg,
        hpAfter: [hp[0], hp[1]],
        text: `🌶️ ${f.name} i krash son boul de fé piman kabri su ${fighters[o].name} !`,
      });
    }
  });

  // Initiative : l'adresse départage
  let turn: 0 | 1 =
    a.attrs.adresse + Math.random() * 20 >= b.attrs.adresse + Math.random() * 20
      ? 0
      : 1;

  let safety = 0;
  while (hp[0] > 0 && hp[1] > 0 && safety < 300) {
    safety++;
    const atkIdx = turn;
    const defIdx = (1 - turn) as 0 | 1;
    const atk = fighters[atkIdx];
    const def = fighters[defIdx];


    // Séga : buff tous les 4 tours
    if (atk.classId === 'sega') {
      segaCounter[atkIdx]++;
      if (segaCounter[atkIdx] % 4 === 0) {
        segaBuff[atkIdx] = true;
        rounds.push({
          attacker: atkIdx,
          kind: 'melody',
          damage: 0,
          hpAfter: [hp[0], hp[1]],
          text: `🎵 ${atk.name} i lans in séga élektrik ! Son prochain kou i fé plis mal !`,
        });
      }
    }

    let chainCount = 0;
    let attacking = true;
    while (attacking && hp[defIdx] > 0) {
      attacking = false;
      const mystic = atk.classId === 'tizane';
      // esquive / blocage (impossibles contre le Tisanèr)
      if (!mystic && def.classId === 'malin' && Math.random() < 0.5) {
        rounds.push({
          attacker: atkIdx,
          kind: 'dodge',
          damage: 0,
          hpAfter: [hp[0], hp[1]],
          text: pick(DODGE_LINES, atk.name, def.name),
        });
      } else if (!mystic && def.classId === 'gep' && Math.random() < 0.25) {
        rounds.push({
          attacker: atkIdx,
          kind: 'block',
          damage: 0,
          hpAfter: [hp[0], hp[1]],
          text: pick(BLOCK_LINES, atk.name, def.name),
        });
      } else {
        let dmg = baseDamage(atk, def, mods.damageScale ?? 1);
        const isCrit = Math.random() < critChance(atk, def);
        if (isCrit) dmg *= mods.critMult ?? 2;
        if (segaBuff[atkIdx]) {
          dmg *= 1.6;
          segaBuff[atkIdx] = false;
        }
        const final = Math.max(1, Math.round(dmg));
        hp[defIdx] = Math.max(0, hp[defIdx] - final);
        rounds.push({
          attacker: atkIdx,
          kind: isCrit ? 'crit' : chainCount > 0 ? 'chain' : 'hit',
          damage: final,
          hpAfter: [hp[0], hp[1]],
          text:
            chainCount > 0
              ? `🔥 ${atk.name} i anchène ankor ! (${final} dégâts)`
              : pick(isCrit ? CRIT_LINES : HIT_LINES, atk.name, def.name),
        });
      }
      // Furie du Kok Sovaz : 50% de chance de rejouer (max 15)
      if (
        atk.classId === 'sovaz' &&
        hp[defIdx] > 0 &&
        chainCount < 15 &&
        Math.random() < 0.5
      ) {
        chainCount++;
        attacking = true;
      }
    }
    turn = defIdx;
  }

  // Si les deux tiennent encore au plafond de tours, on départage sur la part
  // de vie restante. Renvoyer 0 par défaut donnait la victoire au joueur —
  // l'index 0 est toujours lui — et un build très défensif gagnait par forfait.
  const winner: 0 | 1 =
    hp[0] > 0 && hp[1] > 0
      ? hp[0] / maxHpArr[0] >= hp[1] / maxHpArr[1]
        ? 0
        : 1
      : hp[0] > 0
        ? 0
        : 1;

  return { winner, rounds, maxHp: maxHpArr };
}
