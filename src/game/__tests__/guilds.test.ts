import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { GUILDS, GUILD_BONUS_SCALE, donationTiers } from '../guilds';

describe('écurie', () => {
  it('les cinq écuries ont un nom, une devise et un emblème', () => {
    assert.equal(GUILDS.length, 5);
    assert.equal(new Set(GUILDS.map((g) => g.id)).size, 5, 'identifiants en double');
    for (const g of GUILDS) {
      assert.ok(g.name.length > 3, `${g.id} sans nom`);
      assert.ok(g.motto.length > 5, `${g.id} sans devise`);
      assert.ok(g.emblem.length > 0, `${g.id} sans emblème`);
    }
  });

  it('un joueur pauvre a toujours un montant à sa portée', () => {
    // Des paliers fixes (500 / 2 000 / 10 000) laissaient un joueur à 437
    // grains devant trois boutons éteints : la caisse ne s'ouvrait qu'aux
    // riches.
    for (const bourse of [50, 120, 437, 1000, 5000, 250_000]) {
      const tiers = donationTiers(bourse);
      assert.ok(tiers.length > 0, `aucun montant proposé à ${bourse} grains`);
      assert.ok(
        tiers.every((n) => n <= bourse),
        `montant hors de portée à ${bourse} grains : ${tiers.join(', ')}`
      );
      assert.ok(tiers.every((n) => n >= 10), 'montant dérisoire');
    }
  });

  it('les montants proposés sont distincts et croissants', () => {
    const tiers = donationTiers(9000);
    assert.equal(new Set(tiers).size, tiers.length, 'deux boutons identiques');
    for (let i = 1; i < tiers.length; i++) {
      assert.ok(tiers[i] > tiers[i - 1], 'montants dans le désordre');
    }
  });

  it('une bourse vide ne propose rien', () => {
    assert.deepEqual(donationTiers(0), []);
  });

  it('l’échelle des bonus reste lisible au premier niveau', () => {
    // Graduée sur 100 %, la barre du niveau 1 (2 %) paraissait vide et
    // l'écurie semblait ne rien apporter.
    assert.ok(2 / GUILD_BONUS_SCALE > 0.05, 'le niveau 1 ne se voit pas');
    assert.ok(GUILD_BONUS_SCALE <= 60, 'l’échelle dépasse le bonus maximal');
  });
});
