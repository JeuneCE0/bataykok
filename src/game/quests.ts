import { questGold, questXp, rnd } from './formulas';
import { TransKey } from '../i18n';
import { Quest } from './types';

interface QuestTemplate {
  titleKey: TransKey;
  placeKey: TransKey;
  flavorKey: TransKey;
}

/**
 * Les quêtes tirées sont persistées dans la sauvegarde : elles portent donc
 * des clés et non du texte, sinon changer de langue laisserait les quêtes en
 * cours dans l'ancienne.
 */
const TEMPLATES: QuestTemplate[] = [
  {
    titleKey: 'quest.tangue.title',
    placeKey: 'quest.tangue.place',
    flavorKey: 'quest.tangue.flavor',
  },
  {
    titleKey: 'quest.makatia.title',
    placeKey: 'quest.makatia.place',
    flavorKey: 'quest.makatia.flavor',
  },
  {
    titleKey: 'quest.marche.title',
    placeKey: 'quest.marche.place',
    flavorKey: 'quest.marche.flavor',
  },
  {
    titleKey: 'quest.siklone.title',
    placeKey: 'quest.siklone.place',
    flavorKey: 'quest.siklone.flavor',
  },
  {
    titleKey: 'quest.piton.title',
    placeKey: 'quest.piton.place',
    flavorKey: 'quest.piton.flavor',
  },
  {
    titleKey: 'quest.kabar.title',
    placeKey: 'quest.kabar.place',
    flavorKey: 'quest.kabar.flavor',
  },
  {
    titleKey: 'quest.filaos.title',
    placeKey: 'quest.filaos.place',
    flavorKey: 'quest.filaos.flavor',
  },
  {
    titleKey: 'quest.maido.title',
    placeKey: 'quest.maido.place',
    flavorKey: 'quest.maido.flavor',
  },
  {
    titleKey: 'quest.takamaka.title',
    placeKey: 'quest.takamaka.place',
    flavorKey: 'quest.takamaka.flavor',
  },
  {
    titleKey: 'quest.capmechant.title',
    placeKey: 'quest.capmechant.place',
    flavorKey: 'quest.capmechant.flavor',
  },
  {
    titleKey: 'quest.goyavier.title',
    placeKey: 'quest.goyavier.place',
    flavorKey: 'quest.goyavier.flavor',
  },
  {
    titleKey: 'quest.grandbassin.title',
    placeKey: 'quest.grandbassin.place',
    flavorKey: 'quest.grandbassin.flavor',
  },
  {
    titleKey: 'quest.bassinlapaix.title',
    placeKey: 'quest.bassinlapaix.place',
    flavorKey: 'quest.bassinlapaix.flavor',
  },
  {
    titleKey: 'quest.gramoune.title',
    placeKey: 'quest.gramoune.place',
    flavorKey: 'quest.gramoune.flavor',
  },
  {
    titleKey: 'quest.bichique.title',
    placeKey: 'quest.bichique.place',
    flavorKey: 'quest.bichique.flavor',
  },
];

const DURATIONS = [
  { sec: 30, label: 'court' },
  { sec: 60, label: 'moyen' },
  { sec: 150, label: 'long' },
  { sec: 300, label: 'très long' },
];

let qSeq = 0;

export function generateQuests(level: number, count = 3): Quest[] {
  const shuffled = [...TEMPLATES].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map((t) => {
    const d = DURATIONS[rnd(0, DURATIONS.length - 1)];
    const minutes = d.sec / 60;
    return {
      id: `q${Date.now()}_${qSeq++}`,
      titleKey: t.titleKey,
      placeKey: t.placeKey,
      flavorKey: t.flavorKey,
      durationSec: d.sec,
      motivationCost: Math.max(2, Math.round(minutes * 8)),
      gold: questGold(level, minutes),
      xp: questXp(level, minutes),
      // Le butin ne suivait pas le coût : une quête de 5 min coûtait 40 de
      // motivation pour 42 % de chance d'objet, contre 4 pour 24 % sur 30 s —
      // soit 5,7× moins de butin par point dépensé. Personne ne partait long.
      itemChance: Math.min(0.94, 0.16 + minutes * 0.17),
      pimentChance: Math.min(0.5, 0.04 + minutes * 0.075),
      // et le temps investi améliore la gamme, pas seulement la fréquence
      luck: Math.min(0.22, minutes * 0.045),
    };
  });
}

export const MAX_MOTIVATION = 100;
export const DODO_RESTORE = 20;
export const MAX_DODOS_PER_DAY = 10;
