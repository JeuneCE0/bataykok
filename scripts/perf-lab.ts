/** Coût des chemins chauds — ceux qui tournent à chaque rendu. */
import { botProfile, botToFighter, generateLadder } from '../src/game/bots';
import { playerToFighter, totalAttrs } from '../src/game/formulas';
import { fighterPower, kokPower } from '../src/game/power';
import { referencePlayer } from '../src/game/reference';

function bench(nom: string, n: number, f: () => unknown) {
  f(); // chauffe
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < n; i++) f();
  const us = Number(process.hrtime.bigint() - t0) / 1000 / n;
  console.log(`   ${nom.padEnd(38)} ${us.toFixed(2).padStart(8)} µs/appel`);
}

const ladder = generateLadder();
const bot = ladder[10];
const me = referencePlayer('gep', 30);

console.log('\n── Chemins chauds ──────────────────────────────────────────\n');
bench('botProfile (mémoïsé)', 200_000, () => botProfile(bot));
bench('botToFighter', 20_000, () => botToFighter(bot));
bench('playerToFighter(joueur)', 20_000, () => playerToFighter(me));
bench('totalAttrs(joueur)', 50_000, () => totalAttrs(me));
bench('kokPower(joueur)', 20_000, () => kokPower(me));
bench('fighterPower', 200_000, () => fighterPower(playerToFighter(me)));

// ce que fait vraiment un rendu de la liste du Rond
const cibles = ladder.slice(0, 12);
bench('un rendu de la liste du Rond (12 cibles)', 2_000, () => {
  const p = kokPower(me);
  return cibles.map((b) => p / Math.max(1, fighterPower(botToFighter(b))));
});
console.log('');
