import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DAILY_CHEST,
  isStepComplete,
  rollDailyMissions,
  STEPS,
  StepContext,
  StepId,
  streakRewardFor,
  STREAK_REWARDS,
} from '../progress';

/** Un joueur qui vient de commencer : rien d'accompli. */
const vierge: StepContext = {
  equippedCount: 0,
  quests: 0,
  attrs: 0,
  arenas: 0,
  buys: 0,
  wins: 0,
  hasGuild: false,
  level: 1,
  transport: 0,
  dungeonFloor: 0,
  foundMitik: false,
};

/** Un joueur qui a tout fait : toutes les étapes doivent tomber. */
const accompli: StepContext = {
  equippedCount: 8,
  quests: 50,
  attrs: 30,
  arenas: 40,
  buys: 12,
  wins: 20,
  hasGuild: true,
  level: 25,
  transport: 3,
  dungeonFloor: 13,
  foundMitik: true,
};

describe('chemin du ti kok', () => {
  it("chaque étape déclarée est jugeable — c'est le bug qui a figé le chemin", () => {
    // « Bat out prémié gardien » avait été ajoutée à STEPS sans son cas dans
    // le switch : elle retombait sur false et bloquait la progression à vie.
    for (const step of STEPS) {
      assert.equal(
        isStepComplete(step.id, accompli),
        true,
        `l'étape « ${step.title} » (${step.id}) reste infranchissable`
      );
    }
  });

  it('aucune étape ne se valide sur un joueur qui débute', () => {
    for (const step of STEPS) {
      assert.equal(
        isStepComplete(step.id, vierge),
        false,
        `l'étape « ${step.title} » se valide sans rien faire`
      );
    }
  });

  it('chaque étape a un onglet, une récompense et un texte', () => {
    for (const s of STEPS) {
      assert.ok(s.title.length > 3, `titre trop court : ${s.id}`);
      assert.ok(s.hint.length > 10, `indice trop court : ${s.id}`);
      assert.ok(s.grains > 0 || s.piments > 0, `étape sans récompense : ${s.id}`);
    }
  });

  it('les identifiants ne se répètent pas', () => {
    const ids = STEPS.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it('la récompense ne recule jamais au fil du chemin', () => {
    // en valeur totale, pas en grains seuls : certaines étapes paient moins
    // de grains mais ajoutent un piment (qui vaut bien plus)
    const PIMENT = 60;
    const valeur = STEPS.map((s) => s.grains + s.piments * PIMENT);
    for (let i = 1; i < valeur.length; i++) {
      assert.ok(
        valeur[i] >= valeur[i - 1],
        `récompense en recul à l'étape ${STEPS[i].id} : ${valeur[i - 1]} → ${valeur[i]}`
      );
    }
  });
});

describe('défis du jour', () => {
  it('le même jour donne toujours les mêmes défis', () => {
    const a = rollDailyMissions('2026-08-19');
    const b = rollDailyMissions('2026-08-19');
    assert.deepEqual(
      a.map((m) => m.def.id),
      b.map((m) => m.def.id)
    );
  });

  it('deux jours donnent des tirages indépendants', () => {
    const jours = ['2026-08-19', '2026-08-20', '2026-08-21', '2026-08-22'];
    const tirages = jours.map((j) =>
      rollDailyMissions(j).map((m) => m.def.id).join(',')
    );
    assert.ok(new Set(tirages).size > 1, 'tous les jours tirent la même chose');
  });

  it('trois défis, jamais deux fois le même type', () => {
    for (const jour of ['2026-01-01', '2026-06-15', '2026-12-31']) {
      const m = rollDailyMissions(jour);
      assert.equal(m.length, 3);
      assert.equal(new Set(m.map((x) => x.def.kind)).size, 3);
      m.forEach((x) => {
        assert.equal(x.progress, 0);
        assert.equal(x.claimed, false);
      });
    }
  });

  it('le coffre vaut plus que chaque défi pris isolément', () => {
    const m = rollDailyMissions('2026-08-19');
    const meilleur = Math.max(...m.map((x) => x.def.grains));
    assert.ok(DAILY_CHEST.grains > meilleur);
  });
});

describe('série de connexions', () => {
  it('la récompense tourne sur sept jours', () => {
    assert.equal(streakRewardFor(1).day, STREAK_REWARDS[0].day);
    assert.equal(streakRewardFor(8).day, STREAK_REWARDS[0].day);
    assert.equal(streakRewardFor(15).day, STREAK_REWARDS[0].day);
  });

  it('le septième jour est le plus généreux', () => {
    const j7 = streakRewardFor(7);
    for (let d = 1; d <= 6; d++) {
      const r = streakRewardFor(d);
      assert.ok(
        j7.grains + j7.piments * 100 > r.grains + r.piments * 100,
        `le jour ${d} paie autant que le jour 7`
      );
    }
  });

  it('une série interrompue ne casse pas le calcul', () => {
    for (const n of [0, -1, 99]) {
      assert.ok(streakRewardFor(n), `série ${n} sans récompense`);
    }
  });
});
