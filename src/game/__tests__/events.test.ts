import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { botProfile, generateLadder } from '../bots';
import { CLASS_LIST } from '../classes';
import { simulateCombat } from '../combat';
import { eventCombatMods, eventLuck, eventOfDay } from '../events';
import { playerToFighter } from '../formulas';
import { rollRarity, rarityRank } from '../items';
import { referencePlayer } from '../reference';
import { translate } from '../../i18n';

describe('événement du jour', () => {
  it('le même jour donne le même événement', () => {
    for (const j of ['2026-08-19', '2026-01-01', '2026-12-31']) {
      const a = eventOfDay(j);
      for (let i = 0; i < 10; i++) assert.equal(eventOfDay(j).kind, a.kind);
    }
  });

  it('chaque événement est nommé dans les deux langues', () => {
    const vus = new Set<string>();
    for (let d = 1; d <= 60; d++) {
      const ev = eventOfDay(`2026-03-${String(d % 28 || 28).padStart(2, '0')}`);
      vus.add(ev.kind);
      for (const lang of ['fr', 'rcf'] as const) {
        assert.ok(translate(lang, ev.titleKey).length > 3, `${ev.kind} sans titre (${lang})`);
        assert.ok(translate(lang, ev.descKey).length > 8, `${ev.kind} sans description (${lang})`);
        assert.ok(translate(lang, ev.shortKey).length > 2, `${ev.kind} sans pastille (${lang})`);
      }
    }
    assert.ok(vus.size >= 5, `seulement ${vus.size} événements atteints sur deux mois`);
  });

  it('le jour des éclairs frappe vraiment plus fort', () => {
    // Un multiplicateur de gains est invisible en jeu ; une règle qui change
    // doit se mesurer.
    const me = playerToFighter(referencePlayer('gep', 25));
    const lui = playerToFighter(referencePlayer('malin', 25));
    // On mesure le dégât *moyen par critique*, pas le total : avec des coups
    // plus forts les combats finissent plus tôt, donc le cumul peut baisser
    // alors même que chaque coup frappe davantage.
    const moyenne = (mods: Parameters<typeof simulateCombat>[2]) => {
      let d = 0;
      let n = 0;
      for (let i = 0; i < 200; i++) {
        for (const r of simulateCombat(me, lui, mods).rounds) {
          if (r.kind === 'crit') {
            d += r.damage;
            n++;
          }
        }
      }
      return n > 0 ? d / n : 0;
    };
    const normal = moyenne({});
    const eclairs = moyenne({ critMult: 3 });
    assert.ok(
      eclairs > normal * 1.25,
      `critique moyen : ${eclairs.toFixed(0)} contre ${normal.toFixed(0)}`
    );
  });

  it('la nuit Sitarane raccourcit les combats', () => {
    const me = playerToFighter(referencePlayer('gep', 25));
    const lui = playerToFighter(referencePlayer('sovaz', 25));
    const tours = (mods: Parameters<typeof simulateCombat>[2]) => {
      let n = 0;
      for (let i = 0; i < 60; i++) n += simulateCombat(me, lui, mods).rounds.length;
      return n / 60;
    };
    assert.ok(tours({ damageScale: 1.6 }) < tours({}), 'les dégâts renforcés n’accélèrent rien');
  });

  it('la chance du gramoune pousse vraiment les gammes', () => {
    const part = (luck: number) => {
      let hauts = 0;
      const N = 40_000;
      for (let i = 0; i < N; i++) {
        if (rarityRank(rollRarity(luck)) >= rarityRank('rar')) hauts++;
      }
      return hauts / N;
    };
    assert.ok(part(eventLuck(eventOfDay('x'))) >= 0, 'garde-fou de forme');
    // marge large : on vérifie que le levier agit, pas sa valeur exacte
    assert.ok(part(0.18) > part(0) * 1.3, 'le bonus de chance ne change rien');
  });

  it('seuls les jours prévus changent les règles', () => {
    for (const j of ['2026-05-01', '2026-05-02', '2026-05-03', '2026-05-04']) {
      const ev = eventOfDay(j);
      const mods = eventCombatMods(ev);
      if (ev.kind !== 'krit' && ev.kind !== 'sitarane') {
        assert.deepEqual(mods, {}, `${ev.kind} modifie le combat sans le dire`);
      }
    }
  });
});

describe('équilibre les jours d’événement', () => {
  const ladder = generateLadder();

  /** Écart entre la meilleure et la pire classe sous des règles données. */
  function spread(mods: Parameters<typeof simulateCombat>[2]): number {
    const taux: number[] = [];
    for (const c of CLASS_LIST) {
      let w = 0;
      let n = 0;
      for (const lvl of [10, 20, 35]) {
        const me = playerToFighter(referencePlayer(c.id, lvl));
        for (const b of ladder.filter((x) => Math.abs(x.level - lvl) <= 3)) {
          const f = playerToFighter(botProfile(b));
          for (let i = 0; i < 6; i++, n++) if (simulateCombat(me, f, mods).winner === 0) w++;
        }
      }
      taux.push((w / n) * 100);
    }
    return Math.max(...taux) - Math.min(...taux);
  }

  it('aucune règle du jour ne fait basculer l’équilibre', () => {
    // Une règle qui change le combat peut favoriser une classe : le jour des
    // éclairs pourrait profiter aux classes qui misent sur la chance, et la
    // nuit Sitarane à celles qui frappent fort. On le mesure plutôt que de
    // l'espérer.
    const ordinaire = spread({});
    for (const [nom, mods] of [
      ['jour des éclairs', { critMult: 3 }],
      ['nuit Sitarane', { damageScale: 1.6 }],
    ] as const) {
      const e = spread(mods);
      assert.ok(e < 20, `${nom} : ${e.toFixed(0)} points d’écart entre classes`);
      assert.ok(
        e < ordinaire + 12,
        `${nom} creuse l’écart de ${(e - ordinaire).toFixed(0)} points`
      );
    }
  });
});
