import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { arenaGold, arenaXp } from '../formulas';
import {
  arenaReward,
  bossConsolation,
  defenseReward,
  streakBonus,
  underdogBonus,
} from '../rewards';

const base = { level: 12, myPower: 100, opPower: 100, streak: 0, online: false };

describe('récompenses de combat', () => {
  it('une défaite rapporte quelque chose — sinon on ferme l’app', () => {
    const perdu = arenaReward({ ...base, won: false });
    assert.ok(perdu.gold > 0, 'défaite sans grains');
    assert.ok(perdu.xp > 0, 'défaite sans XP');
  });

  it('une victoire rapporte toujours plus qu’une défaite', () => {
    const gagne = arenaReward({ ...base, won: true });
    const perdu = arenaReward({ ...base, won: false });
    assert.ok(gagne.gold > perdu.gold);
    assert.ok(gagne.xp > perdu.xp);
    assert.ok(gagne.honor > 0 && perdu.honor < 0);
  });

  it('battre plus fort que soi paie mieux', () => {
    const egal = arenaReward({ ...base, won: true });
    const fort = arenaReward({ ...base, won: true, opPower: 180 });
    assert.ok(fort.gold > egal.gold);
    assert.ok(fort.honor > egal.honor, 'aucun honneur de plus contre plus fort');
  });

  it('perdre contre bien plus fort coûte moins cher en honneur', () => {
    const egal = arenaReward({ ...base, won: false });
    const fort = arenaReward({ ...base, won: false, opPower: 200 });
    assert.ok(fort.honor > egal.honor, 'même sanction quel que soit l’adversaire');
  });

  it('perdre exprès en ligne ne doit pas rapporter comme une victoire locale', () => {
    const victoireLocale = arenaReward({ ...base, won: true });
    const defaiteEnLigne = arenaReward({ ...base, won: false, online: true });
    assert.ok(
      defaiteEnLigne.xp < victoireLocale.xp,
      'la défaite en ligne rapporte autant qu’une victoire : farmable'
    );
  });

  it('la série récompense sans s’emballer', () => {
    assert.equal(streakBonus(1), 0);
    assert.ok(streakBonus(3) > streakBonus(2));
    assert.equal(streakBonus(50), streakBonus(6), 'le bonus de série n’est pas plafonné');
  });

  it('le bonus outsider est plafonné', () => {
    assert.equal(underdogBonus(100, 100), 0);
    assert.equal(underdogBonus(100, 50), 0, 'bonus en battant plus faible');
    assert.equal(underdogBonus(100, 10_000), underdogBonus(100, 160));
  });

  it('les gains restent des entiers', () => {
    const r = arenaReward({ ...base, won: true, opPower: 137, streak: 3, online: true });
    assert.equal(r.gold, Math.round(r.gold));
    assert.equal(r.xp, Math.round(r.xp));
    assert.equal(r.honor, Math.round(r.honor));
  });

  it('les bonus appliqués sont annoncés au joueur', () => {
    const r = arenaReward({ ...base, won: true, opPower: 150, streak: 4, online: true });
    const labels = r.parts.map((p) => p.label).join(' ');
    assert.ok(r.parts.length >= 3, 'des bonus sont appliqués sans être affichés');
    assert.ok(labels.length > 10);
  });
});

describe('consolation de donjon', () => {
  it('elle suit les dégâts infligés', () => {
    const reward = { grains: 1000, xp: 500 };
    const rien = bossConsolation(reward, 0);
    const moitie = bossConsolation(reward, 0.5);
    const presque = bossConsolation(reward, 0.95);
    assert.equal(rien.grains, 0);
    assert.ok(moitie.grains > 0 && moitie.grains < presque.grains);
  });

  it('elle reste très en dessous de la victoire', () => {
    const reward = { grains: 1000, xp: 500 };
    const max = bossConsolation(reward, 1);
    assert.ok(max.grains < reward.grains * 0.3);
    assert.ok(max.xp < reward.xp * 0.5);
  });

  it('un ratio aberrant ne casse rien', () => {
    const reward = { grains: 1000, xp: 500 };
    assert.equal(bossConsolation(reward, -3).grains, 0);
    assert.equal(bossConsolation(reward, 9).grains, bossConsolation(reward, 1).grains);
  });
});

describe('défense hors ligne', () => {
  it('repousser paie plus que se faire battre', () => {
    const gagne = defenseReward(true, 10);
    const perdu = defenseReward(false, 10);
    assert.ok(gagne.gold > perdu.gold);
    assert.ok(gagne.xp > perdu.xp);
  });

  it('elle reste inférieure à un combat mené soi-même', () => {
    const defense = defenseReward(true, 10);
    assert.ok(defense.gold < arenaGold(10), 'défendre paie autant qu’attaquer');
    assert.ok(defense.xp < arenaXp(10));
  });
});
