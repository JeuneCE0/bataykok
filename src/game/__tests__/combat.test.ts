import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { botProfile, generateLadder } from '../bots';
import { CLASS_LIST, CLASSES } from '../classes';
import { simulateCombat } from '../combat';
import { maxHp, playerToFighter } from '../formulas';
import { referencePlayer } from '../reference';
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

  it('aucune classe ne domine face à l’échelle réelle', () => {
    // Mesuré sur le joueur de référence — équipé, attributs orientés — contre
    // les adversaires que le jeu produit vraiment. La version précédente
    // opposait deux combattants synthétiques à attributs plats et sans
    // équipement : elle annonçait 3 points d'écart là où le jeu en avait 45.
    const ladder = generateLadder();
    const taux: Record<string, number> = {};
    for (const c of CLASS_LIST) {
      let victoires = 0;
      let n = 0;
      for (const level of [10, 20, 35]) {
        const moi = playerToFighter(referencePlayer(c.id, level));
        for (const bot of ladder.filter((b) => Math.abs(b.level - level) <= 3)) {
          const lui = playerToFighter(botProfile(bot));
          for (let i = 0; i < 10; i++, n++) {
            if (simulateCombat(moi, lui).winner === 0) victoires++;
          }
        }
      }
      taux[c.id] = (victoires / n) * 100;
    }
    const v = Object.values(taux);
    const ecart = Math.max(...v) - Math.min(...v);
    assert.ok(
      ecart < 16,
      `${ecart.toFixed(0)} points séparent la meilleure classe de la pire : ` +
        CLASS_LIST.map((c) => `${c.id} ${taux[c.id].toFixed(0)} %`).join(', ')
    );
  });

  it('l’équipement décide du sort du combat', () => {
    // Sans équipement le joueur doit perdre, bien équipé il doit gagner : c'est
    // ce qui manquait quand les bots n'avaient aucun objet — le rond passait de
    // 0 à 100 % de victoires dès la première panoplie achetée.
    const ladder = generateLadder().filter((b) => Math.abs(b.level - 20) <= 3);
    const taux = (gamme: Parameters<typeof referencePlayer>[2]) => {
      let victoires = 0;
      let n = 0;
      for (const c of CLASS_LIST) {
        const moi = playerToFighter(referencePlayer(c.id, 20, gamme));
        for (const bot of ladder) {
          const lui = playerToFighter(botProfile(bot));
          for (let i = 0; i < 6; i++, n++) {
            if (simulateCombat(moi, lui).winner === 0) victoires++;
          }
        }
      }
      return (victoires / n) * 100;
    };
    const nu = taux(null);
    const equipe = taux('kalite');
    assert.ok(nu < 15, `un coq sans équipement gagne ${nu.toFixed(0)} % du temps`);
    assert.ok(equipe > 45, `un coq bien équipé ne gagne que ${equipe.toFixed(0)} % du temps`);
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

describe('combats qui n’aboutissent pas', () => {
  it('un mur de PV ne gagne pas par forfait', () => {
    // Deux tortues identiques atteignent le plafond de tours. L'index 0 étant
    // toujours le joueur, renvoyer 0 par défaut lui offrait la victoire —
    // donc un étage de donjon et son butin garanti.
    const tortue = (nom: string): Fighter => ({
      name: nom, level: 40, classId: 'gep',
      attrs: { force: 10, adresse: 10, esprit: 10, endurance: 400, chance: 10 },
      weaponMin: 1, weaponMax: 1, armor: 800,
      appearance: { bodyColor: '#8d5524', combColor: '#e53935', tailPalette: 0, accessory: 0 },
    });
    const r = simulateCombat(tortue('gauche'), tortue('droite'));
    const last = r.rounds[r.rounds.length - 1];
    if (last.hpAfter[0] > 0 && last.hpAfter[1] > 0) {
      // départage aux PV restants, pas à la position dans le tableau
      const partGauche = last.hpAfter[0] / r.maxHp[0];
      const partDroite = last.hpAfter[1] / r.maxHp[1];
      assert.equal(
        r.winner,
        partGauche >= partDroite ? 0 : 1,
        'le combat au plafond est attribué à l’index 0'
      );
    }
  });
});
