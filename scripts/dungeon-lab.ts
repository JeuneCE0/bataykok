/**
 * Difficulté réelle des gardiens.
 *
 * Le score `fighterPower` pondère par la classe : deux gardiens Tisanèr
 * paraissaient plus forts que leurs voisins alors que la difficulté ressentie
 * est autre chose. On mesure donc le taux de victoire, pas le score.
 */
import { CLASS_LIST } from '../src/game/classes';
import { simulateCombat } from '../src/game/combat';
import { BOSSES, bossToFighter } from '../src/game/dungeons';
import { playerToFighter } from '../src/game/formulas';
import { referencePlayer } from '../src/game/reference';

/** Taux de victoire d'un joueur de référence à `delta` niveaux au-dessus. */
function wr(b: (typeof BOSSES)[number], delta: number): number {
  const f = bossToFighter(b);
  let w = 0;
  let n = 0;
  for (const c of CLASS_LIST) {
    const me = playerToFighter(referencePlayer(c.id, b.level + delta));
    for (let i = 0; i < 40; i++, n++) if (simulateCombat(me, f).winner === 0) w++;
  }
  return (w / n) * 100;
}

console.log('\n   étage │ niv │ power │ à niveau │ +4 niv │ +8 niv');
for (const b of BOSSES) {
  console.log(
    `   ${String(b.floor).padStart(5)} │ ${String(b.level).padStart(3)} │ ${b.power.toFixed(2)} │ ` +
      `${wr(b, 0).toFixed(0).padStart(7)} % │ ${wr(b, 4).toFixed(0).padStart(5)} % │ ${wr(b, 8).toFixed(0).padStart(5)} %`
  );
}
console.log('');
