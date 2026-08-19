import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ATTR_LABELS, CLASSES } from '../classes';
import { ALBUM_RARITIES } from '../album';
import { UNIQUE_BY_ID, forgeUnique } from '../uniques';
import {
  generateItem,
  RARITY_COLORS,
  RARITY_LABELS,
  RARITY_ORDER,
  rarityRank,
  isTopRarity,
  itemValue,
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
    equipment, inventory: [], grains: 0, piments: 0, honor: 100, honorPeak: 100,
    rank: 1, wins: 0, losses: 0, guildId: null, transport: 0, talents: [], cosmetics: [],
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
    assert.equal(rarityRank('zanset'), RARITY_ORDER.length - 1);
    assert.ok(rarityRank('zanset') > rarityRank('mitik'));
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

  it('hors panoplie, l’écart va dans le même sens que les scores', () => {
    // `diff` n'est plus la simple différence des deux scores : il mesure l'effet
    // réel de l'échange sur les attributs totaux, panoplies comprises. Sans
    // panoplie en jeu, les deux doivent au moins s'accorder sur le signe.
    for (let i = 0; i < 30; i++) {
      const a = generateItem(20, 'arme', 'rar');
      const b = generateItem(20, 'arme', 'commun');
      delete a.setId;
      delete b.setId;
      const cmp = compareToEquipped(a, joueur({ arme: b }));
      assert.ok(
        Math.sign(cmp.diff) === Math.sign(cmp.score - cmp.currentScore),
        `écart ${cmp.diff} contre scores ${cmp.score} / ${cmp.currentScore}`
      );
    }
  });
});

describe('panoplies', () => {
  it('deux pièces donnent un bonus, quatre le doublent', () => {
    const set = SETS[0];
    const piece = (slot: SlotId): Item => ({
      ...generateItem(20, slot, 'kalite'),
      setId: set.id,
    });
    const deux = setBonuses({ arme: piece('arme'), tete: piece('tete') });
    const quatre = setBonuses({
      arme: piece('arme'),
      tete: piece('tete'),
      torse: piece('torse'),
      pattes: piece('pattes'),
    });
    const attr = set.attr;
    assert.ok((deux[attr] ?? 0) > 0, 'deux pièces ne donnent rien');
    assert.equal(quatre[attr], (deux[attr] ?? 0) * 2, 'quatre pièces ne doublent pas');
  });

  it('une seule pièce ne donne rien', () => {
    const set = SETS[1];
    const it: Item = { ...generateItem(20, 'arme', 'kalite'), setId: set.id };
    assert.deepEqual(setBonuses({ arme: it }), {});
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

describe('bonus de chance sur le tirage de gamme', () => {
  it('la chance augmente les hautes gammes au lieu de les supprimer', () => {
    const part = (luck: number) => {
      let hautes = 0;
      const N = 20_000;
      for (let i = 0; i < N; i++) {
        const r = rollRarity(luck);
        if (r === 'rar' || r === 'lezand' || r === 'mitik') hautes++;
      }
      return (hautes / N) * 100;
    };
    const sans = part(0);
    const avec = part(0.2);
    assert.ok(
      avec > sans,
      `la chance fait baisser les hautes gammes : ${sans.toFixed(1)} % → ${avec.toFixed(1)} %`
    );
  });
});

describe('objets uniques', () => {
  it('un tirage zanset produit toujours un unique nommé', () => {
    for (let i = 0; i < 40; i++) {
      const it = generateItem(30, undefined, 'zanset');
      assert.ok(it.uniqueId, 'objet zanset sans identité d’unique');
      assert.equal(it.rarity, 'zanset');
      assert.ok(UNIQUE_BY_ID[it.uniqueId!], `unique inconnu : ${it.uniqueId}`);
    }
  });

  it('un unique bat largement le mitik du même niveau', () => {
    // Sinon le palier n'apporte qu'une couleur de plus.
    const mitik = Array.from({ length: 30 }, () => itemValue(generateItem(30, 'amulette', 'mitik')));
    const moyMitik = mitik.reduce((a, b) => a + b, 0) / mitik.length;
    const uq = itemValue(forgeUnique(UNIQUE_BY_ID.kolie_grandbasin, 30, 0));
    assert.ok(uq > moyMitik * 1.3, `unique ${uq} vs mitik moyen ${moyMitik.toFixed(0)}`);
  });

  it('deux exemplaires du même unique au même niveau sont identiques', () => {
    // C'est ce qui permet d'en parler entre joueurs : « le Kolié niveau 30 ».
    const a = forgeUnique(UNIQUE_BY_ID.bag_gramoune, 24, 0);
    const b = forgeUnique(UNIQUE_BY_ID.bag_gramoune, 24, 1);
    assert.deepEqual(a.bonuses, b.bonuses);
    assert.equal(a.armor, b.armor);
  });

  it('le zanset reste un tirage sur mille', () => {
    let n = 0;
    const N = 200_000;
    for (let i = 0; i < N; i++) if (rollRarity() === 'zanset') n++;
    const taux = n / N;
    assert.ok(taux > 0.0004 && taux < 0.0018, `taux de zanset : ${(taux * 100).toFixed(3)} %`);
  });
});

describe('gamme d’exception', () => {
  it('le zanset compte comme mitik ou mieux', () => {
    // Six endroits comparaient à `'mitik'` en littéral : trouver l'objet le plus
    // rare du jeu ne validait pas l'étape « Trouv in objè Mitik ».
    assert.equal(isTopRarity('mitik'), true);
    assert.equal(isTopRarity('zanset'), true);
    assert.equal(isTopRarity('lezand'), false);
    assert.equal(isTopRarity(undefined), false);
  });

  it('toute gamme au sommet de l’ordre est reconnue', () => {
    // Garde-fou pour le prochain palier ajouté : il devra passer sans retoucher
    // les appelants.
    const sommet = RARITY_ORDER[RARITY_ORDER.length - 1];
    assert.equal(isTopRarity(sommet), true);
  });

  it('le Zalbum couvre toutes les gammes', () => {
    for (const r of RARITY_ORDER) {
      assert.ok(ALBUM_RARITIES.includes(r), `gamme absente du Zalbum : ${r}`);
    }
  });
});

describe('comparaison et panoplies', () => {
  const setDef = SETS[0];
  // armure figée : `generateItem` la tire au hasard, et l'écart d'armure
  // noierait le signal qu'on veut mesurer (le gain ou la perte de panoplie)
  const piece = (slot: SlotId): Item => ({
    ...generateItem(20, slot, 'kalite'),
    setId: setDef.id,
    bonuses: { [setDef.attr]: 20 },
    armor: 30,
  });

  it('casser une panoplie de quatre est signalé comme un recul', () => {
    // Le jeu conseillait de retirer la quatrième pièce d'un set pour une pièce
    // nue à peine supérieure — et « Vendre le surplus » pouvait liquider un set
    // entier.
    const porte: Partial<Record<SlotId, Item>> = {
      arme: piece('arme'),
      tete: piece('tete'),
      torse: piece('torse'),
      pattes: piece('pattes'),
    };
    const p = joueur(porte);
    // une pièce nue légèrement meilleure en brut, mais hors panoplie
    const nue: Item = {
      ...generateItem(20, 'tete', 'kalite'),
      bonuses: { [setDef.attr]: 26 },
      armor: 30,
    };
    delete nue.setId;
    const cmp = compareToEquipped(nue, p);
    assert.equal(cmp.verdict, 'worse', `verdict ${cmp.verdict} (diff ${cmp.diff})`);
  });

  it('une pièce nettement meilleure reste meilleure, panoplie ou non', () => {
    // L'inverse du piège : la protection ne doit pas figer l'équipement à vie.
    const porte: Partial<Record<SlotId, Item>> = {
      arme: piece('arme'),
      tete: piece('tete'),
      torse: piece('torse'),
      pattes: piece('pattes'),
    };
    const p = joueur(porte);
    const bien: Item = {
      ...generateItem(20, 'tete', 'mitik'),
      bonuses: { [setDef.attr]: 300 },
      armor: 30,
    };
    delete bien.setId;
    assert.equal(compareToEquipped(bien, p).verdict, 'better');
  });

  it('compléter une panoplie est signalé comme un gain', () => {
    const porte: Partial<Record<SlotId, Item>> = {
      arme: piece('arme'),
      tete: piece('tete'),
      torse: piece('torse'),
    };
    const p = joueur(porte);
    // même valeur brute que ce qui est porté, mais elle boucle les quatre pièces
    const quatrieme = piece('pattes');
    const cmp = compareToEquipped(quatrieme, p);
    assert.equal(cmp.verdict, 'empty', 'l’emplacement pattes devrait être vide');
    assert.ok(cmp.diff > 0, `compléter la panoplie ne rapporte rien (${cmp.diff})`);
  });
});
