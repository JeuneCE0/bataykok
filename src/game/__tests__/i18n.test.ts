import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
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

describe('hygiène du dictionnaire', () => {
  /** Tout le code de l'app, concaténé — le dictionnaire exclu. */
  function sources(dir: string): string {
    let out = '';
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const chemin = join(dir, e.name);
      if (e.isDirectory()) out += sources(chemin);
      else if (/\.tsx?$/.test(e.name) && e.name !== 'dict.ts') out += readFileSync(chemin, 'utf8');
    }
    return out;
  }

  it('aucune clé ne dort dans le dictionnaire', () => {
    // Trente-quatre clés traînaient sans lecteur — des restes de fonctions
    // retirées. Une traduction qu'on écrit sans la brancher coûte deux fois :
    // à l'écrire, puis à la relire en croyant qu'elle sert.
    const code = sources('src') + readFileSync('App.tsx', 'utf8');
    const mortes = Object.keys(DICT).filter((k) => {
      if (code.includes(`'${k}'`)) return false;
      // une forme plurielle s'atteint par son singulier
      if (k.endsWith('_n') && code.includes(`'${k.slice(0, -2)}'`)) return false;
      // `unique.<id>.name` et `.lore` se composent à la volée
      if (/^unique\.[\w-]+\.(name|lore)$/.test(k)) return false;
      return true;
    });
    assert.deepEqual(mortes, [], `clés sans lecteur : ${mortes.join(', ')}`);
  });
});
