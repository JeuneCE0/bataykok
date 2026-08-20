import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { COSMETIC_BY_ID, cosmeticsForLook, ownsValue } from '../cosmetics';
import { GUILDS, GUILD_BONUS_SCALE, GUILD_DAILY_CAP, donationTiers } from '../guilds';
import { SETS } from '../sets';

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

  it('aucun montant proposé ne peut être refusé par le plafond du jour', () => {
    // Le serveur refuse au-delà de 50 000 par 24 h. Un joueur à 87 000 grains
    // se voyait proposer 52 000 : un bouton qui échoue à tous les coups.
    for (const bourse of [60_000, 87_000, 400_000]) {
      for (const deja of [0, 20_000, 49_500, 50_000]) {
        const tiers = donationTiers(bourse, deja);
        assert.ok(
          tiers.every((n) => deja + n <= GUILD_DAILY_CAP),
          `palier refusé d'avance (bourse ${bourse}, déjà ${deja}) : ${tiers.join(', ')}`
        );
      }
    }
  });

  it('le plafond atteint ne propose plus rien', () => {
    assert.deepEqual(donationTiers(100_000, GUILD_DAILY_CAP), []);
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

describe('look des panoplies', () => {
  it('un look offert est un look possédé', () => {
    // Acheter une panoplie appliquait son look sans accorder les pièces
    // d'apparence : le casque s'affichait à la fois « porté » et « à vendre à
    // 6 000 grains ».
    for (const def of SETS) {
      const ids = cosmeticsForLook(def.look);
      const acquis = [`set.${def.id}`, ...ids];
      for (const [kind, valeur] of [
        ['body', def.look.bodyColor],
        ['comb', def.look.combColor],
        ['tail', def.look.tailPalette],
        ['accessory', def.look.accessory],
      ] as const) {
        assert.ok(
          ownsValue(kind, valeur, acquis),
          `${def.id} : ${kind} ${valeur} porté sans être acquis`
        );
      }
    }
  });

  it('le look n’accorde rien de plus que ce qu’il montre', () => {
    for (const def of SETS) {
      for (const id of cosmeticsForLook(def.look)) {
        const c = COSMETIC_BY_ID[id];
        const valeurs = [
          def.look.bodyColor,
          def.look.combColor,
          def.look.tailPalette,
          def.look.accessory,
        ];
        assert.ok(valeurs.includes(c.value as never), `${def.id} accorde ${id} en trop`);
      }
    }
  });
});
