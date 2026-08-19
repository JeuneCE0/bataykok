/** Longueur des combats : un rond qui traîne se ferme, un rond expédié n'a pas d'enjeu. */
import { CLASS_LIST } from '../src/game/classes';
import { simulateCombat } from '../src/game/combat';
import { botProfile, generateLadder } from '../src/game/bots';
import { playerToFighter } from '../src/game/formulas';
import { mulberry32 } from '../src/game/formulas';
import { player } from './balance-lab';
import { Rarity } from '../src/game/types';

const LADDER = generateLadder();
const rows: [number, Rarity][] = [[5, 'korek'], [10, 'korek'], [20, 'kalite'], [30, 'rar'], [40, 'lezand']];
let capped = 0, total = 0;
console.log('\n   niveau │ tours médians │ p90 │ combats au plafond');
for (const [lvl, gamme] of rows) {
  const lens: number[] = [];
  for (const c of CLASS_LIST) {
    const me = playerToFighter(player(c.id, lvl, gamme, mulberry32(lvl * 7919 + c.id.length)));
    for (const bot of LADDER.filter((b) => Math.abs(b.level - lvl) <= 3)) {
      const f = playerToFighter(botProfile(bot));
      for (let i = 0; i < 8; i++) {
        const r = simulateCombat(me, f).rounds.length;
        lens.push(r); total++; if (r >= 300) capped++;
      }
    }
  }
  lens.sort((a, b) => a - b);
  const med = lens[Math.floor(lens.length / 2)] ?? 0;
  const p90 = lens[Math.floor(lens.length * 0.9)] ?? 0;
  const c = lens.filter((l) => l >= 300).length;
  console.log(`   niv ${String(lvl).padStart(2)}  │ ${String(med).padStart(9)}     │ ${String(p90).padStart(3)} │ ${((c / lens.length) * 100).toFixed(1)} %`);
}
console.log(`\n   ${((capped / total) * 100).toFixed(2)} % des combats atteignent le plafond de 300 tours\n`);
