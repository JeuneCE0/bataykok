import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CLASS_LIST, CLASSES } from '../classes';
import { simulateCombat } from '../combat';
import { maxHp } from '../formulas';
import { Fighter } from '../types';

function kok(classId: Fighter['classId'], level: number, force = 1): Fighter {
  const base = Math.round(10 + level * 3 * force);
  return {
    name: `Kok ${classId} ${level}`,
    level,
    classId,
    attrs: {
      force: base,
      adresse: base,
      esprit: base,
      endurance: Math.round(base * 0.9),
      chance: Math.round(base * 0.5),
    },
    weaponMin: Math.round(4 + level * 1.5 * force),
    weaponMax: Math.round(7 + level * 2.2 * force),
    armor: Math.round(level * 3 * force),
    appearance: { bodyColor: '#8d5524', combColor: '#e53935', tailPalette: 0, accessory: 0 },
  };
}

describe('simulation de combat', () => {
  it('un combat se termine toujours, quelles que soient les classes', () => {
    // sans garde-fou, une classe qui bloque et une classe qui esquive
    // pourraient tourner à l'infini
    for (const a of CLASS_LIST) {
      for (const b of CLASS_LIST) {
        const r = simulateCombat(kok(a.id, 20), kok(b.id, 20));
        assert.ok(r.rounds.length > 0, `${a.id} vs ${b.id} : aucun round`);
        assert.ok(
          r.rounds.length < 500,
          `${a.id} vs ${b.id} : ${r.rounds.length} rounds, combat qui s'emballe`
        );
        assert.ok(r.winner === 0 || r.winner === 1);
      }
    }
  });

  it('les points de vie ne remontent jamais et finissent à zéro', () => {
    const r = simulateCombat(kok('gep', 15), kok('malin', 15));
    let [a, b] = r.maxHp;
    for (const round of r.rounds) {
      assert.ok(round.hpAfter[0] <= a, 'le combattant de gauche a récupéré des PV');
      assert.ok(round.hpAfter[1] <= b, 'le combattant de droite a récupéré des PV');
      [a, b] = round.hpAfter;
    }
    const dernier = r.rounds[r.rounds.length - 1];
    assert.equal(
      dernier.hpAfter[r.winner === 0 ? 1 : 0] <= 0,
      true,
      'le combat se termine sans que le perdant soit à terre'
    );
    assert.ok(dernier.hpAfter[r.winner] > 0, 'le vainqueur est à zéro PV');
  });

  it('un combattant très supérieur gagne presque toujours', () => {
    let victoires = 0;
    for (let i = 0; i < 200; i++) {
      const r = simulateCombat(kok('gep', 30), kok('gep', 8));
      if (r.winner === 0) victoires++;
    }
    assert.ok(
      victoires >= 190,
      `le niveau 30 ne gagne que ${victoires}/200 fois contre un niveau 8`
    );
  });

  it('aucune classe ne domine : toutes entre 42 et 58 %', () => {
    // Un joueur met ses points dans l'attribut de sa classe : mesurer à
    // attributs plats donnait une image fausse de l'équilibrage.
    const oriente = (id: Fighter['classId'], lvl: number) => {
      const f = kok(id, lvl);
      const main = CLASSES[id].mainAttr;
      f.attrs[main] = Math.round(f.attrs[main] * 2.2);
      return f;
    };
    const taux: Record<string, number> = {};
    for (const a of CLASS_LIST) {
      let victoires = 0;
      const N = 600;
      for (const b of CLASS_LIST) {
        for (let i = 0; i < N / CLASS_LIST.length; i++) {
          if (simulateCombat(oriente(a.id, 20), oriente(b.id, 20)).winner === 0) victoires++;
        }
      }
      taux[a.id] = (victoires / N) * 100;
    }
    for (const a of CLASS_LIST) {
      assert.ok(
        taux[a.id] > 42 && taux[a.id] < 58,
        `${CLASSES[a.id].name} gagne ${taux[a.id].toFixed(0)} % du temps`
      );
    }
    const v = Object.values(taux);
    assert.ok(
      Math.max(...v) - Math.min(...v) < 14,
      `${(Math.max(...v) - Math.min(...v)).toFixed(0)} points séparent la meilleure classe de la pire`
    );
  });

  it('chaque round dit ce qui se passe', () => {
    const r = simulateCombat(kok('sega', 18), kok('piman', 18));
    for (const round of r.rounds) {
      assert.ok(round.text.length > 5, 'round sans commentaire');
      assert.ok(round.damage >= 0, 'dégâts négatifs');
      assert.ok([0, 1].includes(round.attacker));
    }
  });

  it('les PV de départ correspondent à la formule', () => {
    const a = kok('gep', 12);
    const b = kok('tizane', 12);
    const r = simulateCombat(a, b);
    assert.deepEqual(r.maxHp, [maxHp(a), maxHp(b)]);
  });
});
