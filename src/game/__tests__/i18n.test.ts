import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CLASS_LIST } from '../classes';
import { BOSSES } from '../dungeons';
import { LANGS, missingKeys, mismatchedTokens, translate } from '../../i18n';
import { DICT } from '../../i18n/dict';
import { STEPS } from '../progress';
import { TALENT_TIERS } from '../talents';

describe('traductions', () => {
  it('chaque clé existe dans les deux langues', () => {
    const manquantes = missingKeys();
    assert.deepEqual(
      manquantes,
      [],
      `${manquantes.length} clé(s) sans version kréol : ${manquantes.slice(0, 8).join(', ')}`
    );
  });

  it('les jetons {x} sont les mêmes dans les deux langues', () => {
    // Un `{n}` oublié côté kréol affiche « Niv. {n} » à l'écran sans rien casser :
    // c'est le genre de faute qu'on ne voit qu'en production.
    assert.deepEqual(mismatchedTokens(), []);
  });

  it('aucune traduction n’est vide', () => {
    for (const [key, entry] of Object.entries(DICT)) {
      for (const { id } of LANGS) {
        const v = translate(id, key as keyof typeof DICT);
        assert.ok(v.trim().length > 0, `traduction vide : ${key} (${id})`);
      }
    }
  });

  it('toutes les clés référencées par les données de jeu existent', () => {
    const refs: string[] = [
      ...CLASS_LIST.flatMap((c) => [c.subtitleKey, c.descriptionKey, c.flavorKey]),
      ...STEPS.flatMap((s) => [s.titleKey, s.hintKey]),
      ...TALENT_TIERS.flatMap((t) => t.choices.flatMap((c) => [c.titleKey, c.descKey])),
      ...BOSSES.map((b) => b.flavorKey),
    ];
    const orphelines = refs.filter((k) => !(k in DICT));
    assert.deepEqual(orphelines, [], `clés référencées mais absentes : ${orphelines.join(', ')}`);
  });
});

describe('pluriels', () => {
  it('toute clé au pluriel compte bien sur {n}', () => {
    // « Saison 1 · 13 jour restant » : la clé portait le numéro de saison dans
    // {n} et le nombre de jours dans {d}. Le pluriel se décidait donc sur un
    // nombre qui n'était pas celui qu'on compte.
    for (const key of Object.keys(DICT)) {
      if (!key.endsWith('_n')) continue;
      const singulier = key.slice(0, -2);
      for (const k of [key, singulier]) {
        const fr = (DICT as Record<string, { fr: string }>)[k]?.fr ?? '';
        assert.ok(fr.includes('{n}'), `${k} se décline sans porter {n}`);
      }
    }
  });

  it('la forme change bien entre un et plusieurs', () => {
    for (const key of Object.keys(DICT)) {
      if (!key.endsWith('_n')) continue;
      const singulier = key.slice(0, -2) as Parameters<typeof translate>[1];
      const un = translate('fr', singulier, { n: 1, s: 1, d: 1 });
      const plusieurs = translate('fr', singulier, { n: 13, s: 1, d: 13 });
      assert.notEqual(un.replace(/\d+/g, '#'), plusieurs.replace(/\d+/g, '#'), `${singulier} ne se décline pas`);
    }
  });
});
