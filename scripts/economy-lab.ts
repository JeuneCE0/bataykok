/**
 * Banc d'essai économique.
 *
 * Trois questions, toutes restées sans réponse chiffrée jusqu'ici :
 *  - un grain dépensé en attribut vaut-il un grain dépensé en boutique ?
 *  - combien de temps pour monter d'un niveau, et cette durée croît-elle ?
 *  - à haut niveau, que reste-t-il des attributs achetés face à l'équipement ?
 */
import { CLASSES } from '../src/game/classes';
import { attrCost, questGold, questXp, totalAttrs, xpForLevel } from '../src/game/formulas';
import { generateItem, itemValue, SLOT_LIST } from '../src/game/items';
import { itemScore } from '../src/game/power';
import { expectedRarity, referencePlayer } from '../src/game/reference';

const NL = '\n';

function moyenne(xs: number[]) {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

// ─── 1. Rendement d'un grain ──────────────────────────────────────────────
console.log(NL + '── Que vaut un grain ? ─────────────────────────────────────────');
console.log('   (points d’attribut obtenus pour 1000 grains)' + NL);
console.log('   niveau │ à la Kaz (attributs) │ au Bazar (objets) │ écart');
for (const lvl of [5, 10, 20, 30, 40, 50]) {
  // Kaz : coût de +1 sur l'attribut principal, à sa valeur courante
  const base = Math.round(10 + lvl * 2.6);
  const kaz = 1000 / attrCost(base);
  // Bazar : points d'attribut d'un objet de la gamme du niveau, par grain
  const gamme = expectedRarity(lvl);
  const objets = Array.from({ length: 60 }, () => generateItem(lvl, undefined, gamme));
  const parGrain = moyenne(
    objets.map((it) => {
      const pts = Object.values(it.bonuses).reduce((a, b) => a + (b ?? 0), 0);
      return it.price > 0 ? (pts / it.price) * 1000 : 0;
    })
  );
  const ratio = parGrain / kaz;
  console.log(
    `   niv ${String(lvl).padStart(2)}  │ ${kaz.toFixed(1).padStart(18)} │ ${parGrain
      .toFixed(1)
      .padStart(17)} │ ×${ratio.toFixed(1)}`
  );
}

// ─── 2. Courbe de niveau ──────────────────────────────────────────────────
console.log(NL + '── Temps pour monter d’un niveau ───────────────────────────────');
console.log('   (en minutes de quête, transport et talents exclus)' + NL);
let cumul = 0;
for (const lvl of [1, 5, 10, 20, 30, 50, 80, 100]) {
  // rendement d'une quête d'une minute à ce niveau
  const xpParMin = questXp(lvl, 1);
  const min = xpForLevel(lvl) / xpParMin;
  console.log(
    `   niv ${String(lvl).padStart(3)} │ ${xpForLevel(lvl).toString().padStart(7)} XP requis │ ${xpParMin
      .toFixed(0)
      .padStart(6)} XP/min │ ${min.toFixed(0).padStart(5)} min`
  );
}
for (let l = 1; l < 100; l++) cumul += xpForLevel(l) / questXp(l, 1);
console.log(`${NL}   niveau 1 → 100 : ${(cumul / 60).toFixed(0)} heures de quête`);

// ─── 3. Part des attributs achetés ────────────────────────────────────────
console.log(NL + '── D’où viennent les attributs ? ───────────────────────────────' + NL);
console.log('   niveau │ achetés │ équipement │ part de l’équipement');
for (const lvl of [5, 10, 20, 30, 40, 50]) {
  const p = referencePlayer('gep', lvl);
  const base = Object.values(p.baseAttrs).reduce((a, b) => a + b, 0);
  const tot = Object.values(totalAttrs(p)).reduce((a, b) => a + b, 0);
  const gear = tot - base;
  console.log(
    `   niv ${String(lvl).padStart(2)}  │ ${base.toString().padStart(7)} │ ${gear
      .toString()
      .padStart(10)} │ ${((gear / tot) * 100).toFixed(0)} %`
  );
}

// ─── 4. Revenu horaire ────────────────────────────────────────────────────
console.log(NL + '── Revenu en grains ────────────────────────────────────────────' + NL);
for (const lvl of [5, 20, 50]) {
  const parHeure = questGold(lvl, 60);
  const gamme = expectedRarity(lvl);
  const panoplie = SLOT_LIST.map((s) => generateItem(lvl, s, gamme).price).reduce((a, b) => a + b, 0);
  console.log(
    `   niv ${String(lvl).padStart(2)} │ ${parHeure.toFixed(0).padStart(7)} grains/h │ ` +
      `panoplie ${gamme} : ${panoplie.toFixed(0).padStart(7)} grains (${(panoplie / parHeure).toFixed(1)} h)`
  );
}
console.log('');

// ─── 5. Ce qu'un joueur peut réellement s'acheter ────────────────────────
// La courbe d'attributs de `referencePlayer` était posée à la main. Ici on la
// dérive du revenu : combien de points un joueur arrivé au niveau L a-t-il pu
// payer, en consacrant une part de ses grains aux attributs ?
console.log(NL + '── Attributs réellement finançables ────────────────────────────' + NL);
console.log('   niveau │ minutes cumulées │ grains gagnés │ points achetables (40 % du revenu)');
{
  let minutes = 0;
  let grains = 0;
  const jalons = new Set([5, 10, 20, 30, 40, 50, 70, 100]);
  for (let l = 1; l <= 100; l++) {
    const min = xpForLevel(l) / questXp(l, 1);
    minutes += min;
    grains += questGold(l, min);
    if (jalons.has(l)) {
      // on achète les cinq attributs de front : le coût suit la valeur courante
      let budget = grains * 0.4;
      let pts = 0;
      let cur = 10;
      while (budget > 0 && pts < 20000) {
        const c = attrCost(Math.round(cur));
        if (c > budget) break;
        budget -= c;
        pts++;
        cur += 0.2; // réparti sur cinq attributs
      }
      console.log(
        `   niv ${String(l).padStart(3)} │ ${minutes.toFixed(0).padStart(16)} │ ${grains
          .toFixed(0)
          .padStart(13)} │ ${pts}`
      );
    }
  }
}
console.log('');
