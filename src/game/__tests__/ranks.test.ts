import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { RANK_TIERS, honorFloor, nextTier, tierForHonor } from '../ranks';

describe('paliers d’honneur', () => {
  it('les seuils montent sans trou', () => {
    for (let i = 1; i < RANK_TIERS.length; i++) {
      assert.ok(
        RANK_TIERS[i].floor > RANK_TIERS[i - 1].floor,
        `palier ${i} : seuil en recul`
      );
    }
  });

  it('le palier suit l’honneur', () => {
    assert.equal(tierForHonor(0).floor, 0);
    assert.equal(tierForHonor(149).floor, 0);
    assert.equal(tierForHonor(150).floor, 150);
    assert.equal(tierForHonor(9999).floor, 1100);
  });

  it('un palier franchi ne se reperd pas', () => {
    // C'est tout l'objet : une mauvaise série effaçait l'honneur accumulé
    // jusqu'à zéro, et c'est là qu'un joueur ferme l'app.
    assert.equal(honorFloor(760), 750);
    assert.equal(honorFloor(300), 300);
    assert.equal(honorFloor(120), 0);
  });

  it('le plancher ne dépasse jamais le sommet atteint', () => {
    for (let peak = 0; peak <= 1500; peak += 7) {
      assert.ok(honorFloor(peak) <= peak, `plancher au-dessus du sommet à ${peak}`);
    }
  });

  it('le palier suivant est toujours au-dessus, sauf au sommet', () => {
    for (let h = 0; h <= 1500; h += 13) {
      const n = nextTier(h);
      if (n) assert.ok(n.floor > h);
      else assert.ok(h >= RANK_TIERS[RANK_TIERS.length - 1].floor);
    }
  });
});
