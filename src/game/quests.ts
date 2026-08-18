import { questGold, questXp, rnd } from './formulas';
import { Quest } from './types';

interface QuestTemplate {
  title: string;
  place: string;
  flavor: string;
}

const TEMPLATES: QuestTemplate[] = [
  {
    title: 'Chasse au tangue',
    place: 'Ravine de Mafate',
    flavor: "In tangue i nargue a ou depuis le bord de la ravine. Montre a li kisa lé le chef.",
  },
  {
    title: 'Livraison de makatias',
    place: 'Boutik chinois de Saint-Paul',
    flavor: "Le boutik chinois i cherche un livreur rapide. Fé pa tomber les makatias !",
  },
  {
    title: 'Gardien du marché forain',
    place: 'Marché de Saint-Pierre',
    flavor: 'Des margouyas i vol les letchis. Fé le ménage dan les étals !',
  },
  {
    title: 'Course contre le siklone',
    place: 'Route du Littoral',
    flavor: 'Alerte orange ! Ramène les poules à la kaz avant les rafales.',
  },
  {
    title: 'Randonnée du Piton',
    place: 'Piton de la Fournaise',
    flavor: "Le volkan i gronde. Va vérifier si le Pas de Bellecombe lé toujours là.",
  },
  {
    title: 'Bal la poussière',
    place: 'Kabar de Sainte-Suzanne',
    flavor: 'Le kabar i manque un danseur. Montre ton plus beau séga !',
  },
  {
    title: 'Pique-nique sous les filaos',
    place: "Plage de l'Ermitage",
    flavor: 'Des zoizos blan i attaque le cari. Défends le marmite familial !',
  },
  {
    title: 'Brouillard du Maïdo',
    place: 'Maïdo',
    flavor: 'In poussin lé perdu dan le brouillard. Ramène a li avant la nuit.',
  },
  {
    title: 'Traversée de Takamaka',
    place: 'Forêt de Bébour-Bélouve',
    flavor: 'La forêt lé sombre, les fanjans lé géants. Trouve le chemin !',
  },
  {
    title: 'Défi du Cap Méchant',
    place: 'Cap Méchant',
    flavor: 'Les vagues i tape fort. Reste digne face à la houle australe !',
  },
  {
    title: 'Cueillette de goyaviers',
    place: 'Plaine des Palmistes',
    flavor: 'La saison lé bonne ! Ramasse in máx de goyaviers avant les tangues.',
  },
  {
    title: 'Nuit à Grand-Bassin',
    place: 'Grand-Bassin',
    flavor: 'Le village lé isolé, la descente lé rude. Bon kouraz ti kok !',
  },
  {
    title: 'Sécurité au bassin',
    place: 'Bassin la Paix',
    flavor: 'Des touristes zoreils i glisse su les galets. Va faire la circulation.',
  },
  {
    title: 'Réveil du Gramoune',
    place: 'Hauts de Cilaos',
    flavor: 'Le vié tisanèr i dor depuis 3 jours. Chante pou réveil a li !',
  },
  {
    title: 'Concours de bichiques',
    place: 'Rivière des Roches',
    flavor: 'La pêche o bichiques lé ouverte. Attrape plis que les autres koks !',
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
      title: t.title,
      place: t.place,
      flavor: t.flavor,
      durationSec: d.sec,
      motivationCost: Math.max(2, Math.round(minutes * 8)),
      gold: questGold(level, minutes),
      xp: questXp(level, minutes),
      itemChance: 0.22 + minutes * 0.04,
      pimentChance: 0.06 + minutes * 0.01,
    };
  });
}

export const MAX_MOTIVATION = 100;
export const DODO_RESTORE = 20;
export const MAX_DODOS_PER_DAY = 10;
