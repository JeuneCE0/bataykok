import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

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
    const total = (mods: Parameters<typeof simulateCombat>[2]) => {
      let d = 0;
      for (let i = 0; i < 60; i++) {
        for (const r of simulateCombat(me, lui, mods).rounds) if (r.kind === 'crit') d += r.damage;
      }
      return d;
    };
    const normal = total({});
    const eclairs = total({ critMult: 3 });
    assert.ok(eclairs > normal * 1.2, `critiques : ${eclairs} contre ${normal}`);
  });

  it('la nuit Sitarane raccourcit les combats', () => {
    const me = playerToFighter(referencePlayer('gep', 25));
    const lui = playerToFighter(referencePlayer('sovaz', 25));
    const tours = (mods: Parameters<typeof simulateCombat>[2]) => {
      let n = 0;
      for (let i = 0; i < 60; i++) n += simulateCombat(me, lui, mods).rounds.length;
      return n / 60;
    };
    assert.ok(tours({ armorScale: 0.5 }) < tours({}), 'l’armure divisée n’accélère rien');
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
    assert.ok(part(0.18) > part(0) * 1.5, 'le bonus de chance ne change rien');
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
