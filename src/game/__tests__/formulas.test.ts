import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { eventOfDay } from '../events';
import {
  arenaGold, arenaXp, attrCost, grainsPerPiment, maxHp,
  playerArmor, playerToFighter, playerWeapon, questGold, questXp,
  totalAttrs, xpForLevel,
} from '../formulas';
import { generateItem } from '../items';
import { kokPower } from '../power';
import { talentEffects, TALENT_TIERS, pendingTier } from '../talents';
import { Item, PlayerState, SlotId } from '../types';

function joueur(over: Partial<PlayerState> = {}): PlayerState {
  return {
    name: 'Test', classId: 'gep', level: 10, xp: 0,
    appearance: { bodyColor: '#8d5524', combColor: '#e53935', tailPalette: 0, accessory: 0 },
    baseAttrs: { force: 30, adresse: 15, esprit: 15, endurance: 20, chance: 10 },
    equipment: {}, inventory: [], grains: 0, piments: 0, honor: 100,
    rank: 1, wins: 0, losses: 0, guildId: null, transport: 0, talents: [],
    ...over,
  };
}

describe('courbes de progression', () => {
  it('chaque niveau demande plus que le précédent', () => {
    for (let l = 1; l < 60; l++) {
      assert.ok(xpForLevel(l + 1) > xpForLevel(l), `palier plat au niveau ${l}`);
    }
  });

  it('chaque point d’attribut coûte plus cher', () => {
    for (let v = 10; v < 200; v += 7) {
      assert.ok(attrCost(v + 1) >= attrCost(v), `coût qui baisse à ${v}`);
    }
  });

  it('les gains suivent le niveau', () => {
    for (let l = 1; l < 40; l++) {
      assert.ok(arenaGold(l + 1) > arenaGold(l));
      assert.ok(arenaXp(l + 1) >= arenaXp(l));
      assert.ok(grainsPerPiment(l + 1) > grainsPerPiment(l));
    }
  });

  it('une quête longue paie plus qu’une courte', () => {
    assert.ok(questGold(10, 5) > questGold(10, 0.5));
    assert.ok(questXp(10, 5) > questXp(10, 0.5));
  });

  it('l’XP d’arène reste une fraction du palier', () => {
    for (const l of [1, 10, 30]) {
      assert.ok(arenaXp(l) < xpForLevel(l), `un combat suffit à monter au niveau ${l}`);
    }
  });
});

describe('agrégation des statistiques', () => {
  it('l’ékipman s’ajoute aux attributs de base', () => {
    const arme: Item = {
      id: 'x', slot: 'arme', name: 'Test', rarity: 'korek', level: 10,
      bonuses: { force: 12 }, price: 100, dmgMin: 10, dmgMax: 15,
    };
    const nu = totalAttrs(joueur());
    const equipe = totalAttrs(joueur({ equipment: { arme } }));
    assert.equal(equipe.force, nu.force + 12);
  });

  it('sans arme, le kok tape quand même', () => {
    const w = playerWeapon(joueur());
    assert.ok(w.min > 0 && w.max >= w.min, 'un kok désarmé ne peut pas frapper');
  });

  it('l’armure s’additionne sur toutes les pièces', () => {
    const piece = (slot: SlotId): Item => ({
      id: slot, slot, name: slot, rarity: 'korek', level: 10,
      bonuses: {}, price: 10, armor: 20,
    });
    const p = joueur({
      equipment: { tete: piece('tete'), torse: piece('torse'), pattes: piece('pattes') },
    });
    assert.equal(playerArmor(p), 60);
  });

  it('les PV montent avec l’endurance et le niveau', () => {
    const f1 = playerToFighter(joueur({ level: 10 }));
    const f2 = playerToFighter(joueur({ level: 20 }));
    assert.ok(maxHp(f2) > maxHp(f1));
  });

  it('la puissance monte quand on s’équipe', () => {
    const nu = kokPower(joueur());
    const equipe = kokPower(joueur({ equipment: { arme: generateItem(20, 'arme', 'lezand') } }));
    assert.ok(equipe > nu);
  });
});

describe('talents', () => {
  it('chaque palier propose trois choix distincts', () => {
    for (const tier of TALENT_TIERS) {
      assert.equal(tier.choices.length, 3, `palier ${tier.level}`);
      assert.equal(new Set(tier.choices.map((c) => c.id)).size, 3);
      tier.choices.forEach((c) => {
        assert.ok(Object.keys(c.effect).length > 0, `talent sans effet : ${c.id}`);
        assert.ok(c.desc.length > 5);
      });
    }
  });

  it('les identifiants de talent sont uniques sur tout l’arbre', () => {
    const ids = TALENT_TIERS.flatMap((t) => t.choices.map((c) => c.id));
    assert.equal(new Set(ids).size, ids.length, 'deux talents partagent un identifiant');
  });

  it('un palier atteint mais non choisi reste dû', () => {
    assert.equal(pendingTier(4, []), null, 'un talent est offert avant le niveau 5');
    assert.equal(pendingTier(5, [])?.level, 5);
    assert.equal(pendingTier(5, ['kou_dur']), null, 'le palier reste dû après le choix');
    assert.equal(pendingTier(12, ['kou_dur'])?.level, 10);
  });

  it('les effets s’additionnent', () => {
    const un = talentEffects(['kou_dur']);
    const deux = talentEffects(['kou_dur', 'fors_brit']);
    assert.ok(deux.dmg > un.dmg);
    assert.equal(talentEffects([]).dmg, 0);
    assert.equal(talentEffects(['inconnu']).dmg, 0, 'un talent inconnu casse le calcul');
  });

  it('les talents agissent réellement sur le combattant', () => {
    const sans = playerToFighter(joueur({ level: 20 }));
    const avec = playerToFighter(joueur({ level: 20, talents: ['zéprons_fé', 'kwir_dur'] }));
    assert.ok(avec.weaponMax > sans.weaponMax, 'le talent de dégâts ne fait rien');
    assert.ok(avec.attrs.endurance > sans.attrs.endurance, 'le talent de PV ne fait rien');
  });
});

describe('événement du jour', () => {
  it('le même jour donne le même événement', () => {
    assert.equal(eventOfDay('2026-08-19').kind, eventOfDay('2026-08-19').kind);
  });

  it('les événements tournent au fil des jours', () => {
    const kinds = new Set(
      Array.from({ length: 40 }, (_, i) => eventOfDay(`2026-09-${String((i % 30) + 1).padStart(2, '0')}`).kind)
    );
    assert.ok(kinds.size > 1, 'le même événement tombe tous les jours');
  });

  it('chaque événement a un libellé court pour le HUD', () => {
    for (let d = 1; d <= 28; d++) {
      const ev = eventOfDay(`2026-03-${String(d).padStart(2, '0')}`);
      assert.ok(ev.short.length > 0 && ev.short.length < 16, `libellé HUD trop long : ${ev.short}`);
      assert.ok(ev.mult > 0);
    }
  });
});
