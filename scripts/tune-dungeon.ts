/**
 * Recherche des multiplicateurs `power` des gardiens.
 *
 * Cible : une descente régulière du taux de victoire, de ~58 % au premier
 * étage à ~28 % au dernier. Un donjon doit être un mur qu'on franchit en
 * s'équipant, pas une formalité (ce qu'il était : 100 % dès l'étage 5) ni un
 * refus (0 % partout).
 */
import { CLASS_LIST } from '../src/game/classes';
import { simulateCombat } from '../src/game/combat';
import { BOSSES, bossToFighter } from '../src/game/dungeons';
import { playerToFighter } from '../src/game/formulas';
import { referencePlayer } from '../src/game/reference';

const cible = (floor: number) => 58 - (floor - 1) * 2.5;

function winrate(b: (typeof BOSSES)[number], reps = 24): number {
  const f = bossToFighter(b);
  let w = 0;
  let n = 0;
  for (const c of CLASS_LIST) {
    const me = playerToFighter(referencePlayer(c.id, b.level));
    for (let i = 0; i < reps; i++, n++) if (simulateCombat(me, f).winner === 0) w++;
  }
  return (w / n) * 100;
}

for (let iter = 0; iter < 30; iter++) {
  let ecartMax = 0;
  for (const b of BOSSES) {
    const wr = winrate(b);
    const d = wr - cible(b.floor);
    ecartMax = Math.max(ecartMax, Math.abs(d));
    // trop de victoires → gardien plus fort
    const facteur = 1 + Math.max(-0.1, Math.min(0.1, d / 400));
    b.power = Math.round(b.power * facteur * 1000) / 1000;
  }
  console.error(`  passe ${String(iter + 1).padStart(2)} · écart max ${ecartMax.toFixed(1)}`);
  if (ecartMax < 6) break;
}

for (const b of BOSSES) console.log(`${b.floor}: ${b.power}`);
