/**
 * Recherche d'équilibrage : on ajuste le multiplicateur de dégâts de chaque
 * classe en fonction de son taux de victoire, et on recommence jusqu'à ce que
 * tout le monde tienne dans la cible. Le reste (PV, armure, capacités) ne
 * bouge pas : c'est l'identité de la classe.
 */
import { CLASSES, CLASS_LIST } from '../src/game/classes';
import { simulateCombat } from '../src/game/combat';
import { ClassId, Fighter } from '../src/game/types';

function kok(id: ClassId, lvl: number): Fighter {
  const b = Math.round(10 + lvl * 3);
  const f: Fighter = {
    name: id, level: lvl, classId: id,
    attrs: { force: b, adresse: b, esprit: b, endurance: Math.round(b * 0.9), chance: Math.round(b * 0.5) },
    weaponMin: Math.round(4 + lvl * 1.5), weaponMax: Math.round(7 + lvl * 2.2), armor: Math.round(lvl * 3),
    appearance: { bodyColor: '#8d5524', combColor: '#e53935', tailPalette: 0, accessory: 0 },
  };
  const main = CLASSES[id].mainAttr;
  f.attrs[main] = Math.round(f.attrs[main] * 2.2);
  return f;
}

function winrates(per = 220): Record<ClassId, number> {
  const out = {} as Record<ClassId, number>;
  for (const a of CLASS_LIST) {
    let w = 0, n = 0;
    for (const b of CLASS_LIST) {
      // plusieurs niveaux : une classe ne doit pas dominer qu'en fin de partie
      for (const lvl of [8, 20, 35]) {
        for (let i = 0; i < per / 3 / CLASS_LIST.length; i++, n++) {
          if (simulateCombat(kok(a.id, lvl), kok(b.id, lvl)).winner === 0) w++;
        }
      }
    }
    out[a.id] = (w / n) * 100;
  }
  return out;
}

let best = { spread: 999, dmg: {} as Record<ClassId, number> };
for (let iter = 0; iter < 26; iter++) {
  const wr = winrates();
  const vals = CLASS_LIST.map((c) => wr[c.id]);
  const spread = Math.max(...vals) - Math.min(...vals);
  if (spread < best.spread) {
    best = {
      spread,
      dmg: Object.fromEntries(CLASS_LIST.map((c) => [c.id, CLASSES[c.id].dmgMult])) as Record<ClassId, number>,
    };
  }
  if (spread < 9) break;
  // un pas proportionnel à l'écart, borné pour ne pas osciller
  for (const c of CLASS_LIST) {
    const delta = (50 - wr[c.id]) / 100;
    const factor = 1 + Math.max(-0.13, Math.min(0.13, delta * 0.55));
    CLASSES[c.id].dmgMult = Math.round(CLASSES[c.id].dmgMult * factor * 1000) / 1000;
  }
}

console.log(`meilleur écart : ${best.spread.toFixed(1)} points\n`);
for (const c of CLASS_LIST) CLASSES[c.id].dmgMult = best.dmg[c.id];
const wr = winrates(900);
for (const c of CLASS_LIST) {
  console.log(
    `  ${CLASSES[c.id].name.padEnd(13)} dmg×${String(best.dmg[c.id]).padEnd(6)} ${wr[c.id].toFixed(1).padStart(5)} %`
  );
}
const v = CLASS_LIST.map((c) => wr[c.id]);
console.log(`\n  contrôle final : ${(Math.max(...v) - Math.min(...v)).toFixed(1)} points d'écart`);
