import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ATTR_LABELS, CLASSES } from '../classes';
import {
  generateItem,
  RARITY_COLORS,
  RARITY_LABELS,
  RARITY_ORDER,
  rarityRank,
  rollRarity,
  shopRotation,
} from '../items';
import { compareToEquipped, itemScore } from '../power';
import { countSets, SETS, setBonuses } from '../sets';
import { AttrId, Item, PlayerState, Rarity, SlotId } from '../types';

const SLOTS: SlotId[] = [
  'arme', 'tete', 'torse', 'pattes', 'amulette', 'anneau', 'ceinture', 'grigri',
];

function joueur(equipment: Partial<Record<SlotId, Item>> = {}): PlayerState {
  return {
    name: 'Test', classId: 'gep', level: 20, xp: 0,
    appearance: { bodyColor: '#8d5524', combColor: '#e53935', tailPalette: 0, accessory: 0 },
    baseAttrs: { force: 40, adresse: 20, esprit: 20, endurance: 30, chance: 15 },
    equipment, inventory: [], grains: 0, piments: 0, honor: 100,
    rank: 1, wins: 0, losses: 0, guildId: null, transport: 0, talents: [],
  };
}

describe('gammes d’ékipman', () => {
  it('chaque gamme a son libellé, sa couleur et un nom d’objet par emplacement', () => {
    for (const r of RARITY_ORDER) {
      assert.ok(RARITY_LABELS[r], `gamme sans libellé : ${r}`);
      assert.ok(RARITY_COLORS[r], `gamme sans couleur : ${r}`);
      for (const slot of SLOTS) {
        const it = generateItem(10, slot, r);
        assert.ok(it.name.length > 3, `${slot}/${r} : nom vide`);
      }
    }
  });

  it('les gammes rares le restent', () => {
    const N = 30_000;
    const counts: Record<string, number> = {};
    for (let i = 0; i < N; i++) {
      const r = rollRarity();
      counts[r] = (counts[r] ?? 0) + 1;
    }
    const part = (r: Rarity) => ((counts[r] ?? 0) / N) * 100;
    assert.ok(part('commun') > 35, 'le commun n’est plus la base');
    assert.ok(part('mitik') < 1.5, `le mitik tombe ${part('mitik').toFixed(2)} % du temps`);
    assert.ok(part('lezand') < 5);
    // la courbe doit décroître d'un bout à l'autre
    for (let i = 1; i < RARITY_ORDER.length; i++) {
      assert.ok(
        part(RARITY_ORDER[i]) <= part(RARITY_ORDER[i - 1]),
        `${RARITY_ORDER[i]} sort plus souvent que ${RARITY_ORDER[i - 1]}`
      );
    }
  });

  it('monter d’une gamme vaut toujours mieux', () => {
    const moyenne = (r: Rarity) => {
      let s = 0;
      for (let i = 0; i < 300; i++) s += itemScore(generateItem(20, 'arme', r), 'gep');
      return s / 300;
    };
    let prev = 0;
    for (const r of RARITY_ORDER) {
      const m = moyenne(r);
      assert.ok(m > prev, `${r} ne vaut pas mieux que la gamme précédente`);
      prev = m;
    }
  });

  it('une arme a des dégâts, une amulette n’en a pas', () => {
    for (let i = 0; i < 50; i++) {
      const arme = generateItem(10, 'arme');
      assert.ok(arme.dmgMin && arme.dmgMax && arme.dmgMax >= arme.dmgMin);
      const kolie = generateItem(10, 'amulette');
      assert.equal(kolie.dmgMin, undefined, 'une amulette porte des dégâts');
    }
  });

  it('les bonus d’attribut sont positifs et nommés', () => {
    for (let i = 0; i < 80; i++) {
      const it = generateItem(15);
      for (const k of Object.keys(it.bonuses) as AttrId[]) {
        assert.ok((it.bonuses[k] ?? 0) > 0, 'bonus nul ou négatif');
        assert.ok(ATTR_LABELS[k], `attribut inconnu : ${k}`);
      }
    }
  });

  it('la boutique propose toujours une arme', () => {
    for (let i = 0; i < 20; i++) {
      const shop = shopRotation(10);
      assert.ok(shop.some((it) => it.slot === 'arme'), 'boutique sans arme');
      assert.equal(new Set(shop.map((i) => i.id)).size, shop.length, 'objets en double');
    }
  });

  it('rarityRank suit l’ordre déclaré', () => {
    assert.equal(rarityRank('commun'), 0);
    assert.equal(rarityRank('mitik'), RARITY_ORDER.length - 1);
  });
});

describe('comparaison d’ékipman', () => {
  it('un emplacement vide est signalé comme tel', () => {
    const it = generateItem(10, 'arme', 'korek');
    const cmp = compareToEquipped(it, joueur());
    assert.equal(cmp.verdict, 'empty');
    assert.equal(cmp.equipped, null);
  });

  it('mieux et moins bon sont correctement jugés', () => {
    const faible = generateItem(10, 'arme', 'commun');
    const fort = generateItem(10, 'arme', 'lezand');
    assert.equal(compareToEquipped(fort, joueur({ arme: faible })).verdict, 'better');
    assert.equal(compareToEquipped(faible, joueur({ arme: fort })).verdict, 'worse');
  });

  it('le même objet contre lui-même ne montre aucun écart', () => {
    const it = generateItem(10, 'torse', 'kalite');
    const cmp = compareToEquipped(it, joueur({ torse: it }));
    assert.equal(cmp.diff, 0);
    assert.equal(cmp.deltas.length, 0);
  });

  it('l’écart annoncé correspond aux scores', () => {
    const a = generateItem(20, 'arme', 'rar');
    const b = generateItem(20, 'arme', 'commun');
    const cmp = compareToEquipped(a, joueur({ arme: b }));
    assert.equal(cmp.diff, cmp.score - cmp.currentScore);
  });
});

describe('panoplies', () => {
  it('deux pièces donnent un bonus, quatre le doublent', () => {
    const set = SETS[0];
    const piece = (slot: SlotId): Item => ({
      ...generateItem(20, slot, 'kalite'),
      setId: set.id,
    });
    const deux = setBonuses({ arme: piece('arme'), tete: piece('tete') }, 20);
    const quatre = setBonuses(
      { arme: piece('arme'), tete: piece('tete'), torse: piece('torse'), pattes: piece('pattes') },
      20
    );
    const attr = set.attr;
    assert.ok((deux[attr] ?? 0) > 0, 'deux pièces ne donnent rien');
    assert.equal(quatre[attr], (deux[attr] ?? 0) * 2, 'quatre pièces ne doublent pas');
  });

  it('une seule pièce ne donne rien', () => {
    const set = SETS[1];
    const it: Item = { ...generateItem(20, 'arme', 'kalite'), setId: set.id };
    assert.deepEqual(setBonuses({ arme: it }, 20), {});
  });

  it('le comptage distingue les panoplies', () => {
    const a: Item = { ...generateItem(10, 'arme', 'korek'), setId: SETS[0].id };
    const b: Item = { ...generateItem(10, 'tete', 'korek'), setId: SETS[1].id };
    const counts = countSets({ arme: a, tete: b });
    assert.equal(counts[SETS[0].id], 1);
    assert.equal(counts[SETS[1].id], 1);
  });

  it('le commun n’appartient jamais à une panoplie', () => {
    for (let i = 0; i < 200; i++) {
      const it = generateItem(15, undefined, 'commun');
      assert.equal(it.setId, undefined, 'un objet commun porte une panoplie');
    }
  });
});
