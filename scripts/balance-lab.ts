/**
 * Banc d'essai d'équilibrage.
 *
 * L'ancien script mesurait les classes sur un combattant synthétique (`kok()`,
 * attributs plats) qui n'existe nulle part dans le jeu : il annonçait un écart
 * de 2,8 points là où les profils réels en montraient 37. Ici tout part des
 * mêmes objets que le jeu — joueur équipé par `generateItem`, adversaires
 * issus de `generateLadder`.
 */
import { CLASSES, CLASS_LIST } from '../src/game/classes';
import { simulateCombat } from '../src/game/combat';
import { botProfile, generateLadder } from '../src/game/bots';
import { referencePlayer } from '../src/game/reference';
import { mulberry32, playerToFighter } from '../src/game/formulas';
import { ClassId, Rarity } from '../src/game/types';


const LADDER = generateLadder();

/** Taux de victoire d'une classe contre l'échelle réelle, à niveau comparable. */
export function winrate(classId: ClassId, level: number, gamme: Rarity | null, reps = 40): number {
  const me = playerToFighter(referencePlayer(classId, level, gamme));
  const foes = LADDER.filter((b) => Math.abs(b.level - level) <= 3);
  if (!foes.length) return NaN;
  let w = 0, n = 0;
  for (const bot of foes) {
    const f = playerToFighter(botProfile(bot));
    for (let i = 0; i < reps; i++, n++) if (simulateCombat(me, f).winner === 0) w++;
  }
  return (w / n) * 100;
}

/** Écart entre classes, moyenné sur les niveaux et gammes représentatifs. */
export function classSpread(): { per: Record<ClassId, number>; spread: number } {
  const per = {} as Record<ClassId, number>;
  for (const c of CLASS_LIST) {
    const samples: number[] = [];
    for (const [lvl, gamme] of [[8, 'korek'], [20, 'kalite'], [35, 'rar']] as const) {
      const v = winrate(c.id, lvl, gamme, 26);
      if (!Number.isNaN(v)) samples.push(v);
    }
    per[c.id] = samples.reduce((a, b) => a + b, 0) / samples.length;
  }
  const vals = Object.values(per);
  return { per, spread: Math.max(...vals) - Math.min(...vals) };
}

if (process.argv[2] === 'report') {
  console.log('\n── Courbe de difficulté du rond ────────────────────────────');
  console.log('   (taux de victoire moyen, toutes classes confondues)\n');
  for (const lvl of [5, 10, 20, 30, 40]) {
    const row: string[] = [];
    for (const gamme of [null, 'commun', 'korek', 'kalite', 'rar', 'lezand'] as const) {
      const vals = CLASS_LIST.map((c) => winrate(c.id, lvl, gamme, 12)).filter((v) => !Number.isNaN(v));
      row.push(vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(0).padStart(4) : '   –');
    }
    console.log(`   niv ${String(lvl).padStart(2)} │ nu${row[0]}%  commun${row[1]}%  korek${row[2]}%  kalité${row[3]}%  rar${row[4]}%  lézand${row[5]}%`);
  }
  const { per, spread } = classSpread();
  console.log('\n── Équilibre entre classes ─────────────────────────────────\n');
  for (const c of CLASS_LIST) {
    console.log(`   ${c.name.padEnd(12)} ${per[c.id].toFixed(1).padStart(5)} %  dmgMult ${CLASSES[c.id].dmgMult}`);
  }
  console.log(`\n   écart max ${spread.toFixed(1)} points\n`);
}

export { referencePlayer as player };
