import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CLASS_LIST } from '../classes';
import { simulateCombat } from '../combat';
import { BOSSES, bossToFighter } from '../dungeons';
import { playerToFighter } from '../formulas';
import { referencePlayer } from '../reference';

/** Taux de victoire du joueur de référence, `delta` niveaux au-dessus du gardien. */
function winrate(boss: (typeof BOSSES)[number], delta: number, reps = 14): number {
  const f = bossToFighter(boss);
  let w = 0;
  let n = 0;
  for (const c of CLASS_LIST) {
    const me = playerToFighter(referencePlayer(c.id, boss.level + delta));
    for (let i = 0; i < reps; i++, n++) if (simulateCombat(me, f).winner === 0) w++;
  }
  return (w / n) * 100;
}

describe('Route des Cirques', () => {
  it('aucun étage n’est une formalité à son propre niveau', () => {
    // Les gardiens dérivaient d'une formule figée quand la courbe du joueur a
    // changé : à partir de l'étage 5, on gagnait 100 % du temps.
    for (const b of BOSSES) {
      const wr = winrate(b, 0);
      assert.ok(wr < 80, `étage ${b.floor} gagné ${wr.toFixed(0)} % du temps à niveau égal`);
    }
  });

  it('chaque étage cède à la préparation', () => {
    // L'inverse du piège précédent : un donjon qu'on ne franchit jamais, même
    // en montant de huit niveaux, n'est pas une progression mais un mur.
    for (const b of BOSSES) {
      const wr = winrate(b, 8);
      assert.ok(wr > 35, `étage ${b.floor} reste à ${wr.toFixed(0)} % huit niveaux au-dessus`);
    }
  });

  it('monter de niveau aide toujours', () => {
    for (const b of BOSSES) {
      assert.ok(
        winrate(b, 8) >= winrate(b, 0),
        `étage ${b.floor} : gagner des niveaux ne sert à rien`
      );
    }
  });

  it('la puissance des gardiens ne recule jamais', () => {
    let prev = 0;
    for (const b of BOSSES) {
      assert.ok(b.level > prev, `étage ${b.floor} : niveau en recul`);
      prev = b.level;
    }
  });
});

describe('textes des gardiens', () => {
  it('chaque gardien porte sa propre description', () => {
    // Le n°2 avait reçu la description du n°1, et tout le reste avait glissé
    // d'un cran : onze gardiens sur treize se présentaient avec le texte de
    // leur prédécesseur, et les deux derniers textes n'étaient jamais lus.
    const vues = new Set<string>();
    for (const b of BOSSES) {
      assert.ok(!vues.has(b.flavorKey), `${b.name} reprend une description déjà servie`);
      vues.add(b.flavorKey);
    }
    assert.equal(vues.size, BOSSES.length);
  });
});
