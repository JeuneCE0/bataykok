/**
 * Recherche d'équilibrage sur les profils réels du jeu.
 *
 * Seul `dmgMult` bouge : PV, armure et capacités portent l'identité de la
 * classe. La version précédente optimisait contre un combattant synthétique
 * qui n'apparaît nulle part — elle annonçait 2,8 points d'écart quand les
 * vrais profils en montraient 38.
 */
import { CLASSES, CLASS_LIST } from '../src/game/classes';
import { classSpread } from './balance-lab';

let best = { spread: 999, dmg: {} as Record<string, number> };
const snapshot = () =>
  Object.fromEntries(CLASS_LIST.map((c) => [c.id, CLASSES[c.id].dmgMult]));

for (let iter = 0; iter < 40; iter++) {
  const { per, spread } = classSpread();
  if (spread < best.spread) best = { spread, dmg: snapshot() };
  console.error(
    `  passe ${String(iter + 1).padStart(2)} · écart ${spread.toFixed(1).padStart(5)} · ` +
      CLASS_LIST.map((c) => `${c.id} ${per[c.id].toFixed(0)}`).join(' ')
  );
  if (spread < 6) break;
  for (const c of CLASS_LIST) {
    const delta = (50 - per[c.id]) / 100;
    const factor = 1 + Math.max(-0.12, Math.min(0.12, delta * 0.5));
    CLASSES[c.id].dmgMult = Math.round(CLASSES[c.id].dmgMult * factor * 1000) / 1000;
  }
}

console.error(`\n  meilleur écart : ${best.spread.toFixed(1)} points\n`);
for (const c of CLASS_LIST) console.log(`${c.id}: ${best.dmg[c.id]},`);
