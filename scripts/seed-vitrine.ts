/**
 * Fabrique une sauvegarde de vitrine pour les captures d'écran App Store.
 *
 *   npx tsx scripts/seed-vitrine.ts > /tmp/save.json
 *
 * Un personnage de niveau 1 fait une mauvaise vitrine : jauges vides, nombres
 * à un chiffre, aucun équipement. On construit donc un joueur crédible — et on
 * le construit avec les modules du jeu, pas à la main, pour que l'état reste
 * valide si les formules changent.
 */
import { CLASSES } from '../src/game/classes';
import { xpForLevel } from '../src/game/formulas';
import { SLOT_LIST, generateItem } from '../src/game/items';
import { curveAttr, REFERENCE_CURVE } from '../src/game/reference';
import { rollDailyMissions } from '../src/game/progress';
import { generateQuests } from '../src/game/quests';
import { shopRotation } from '../src/game/items';
import { Item, Rarity, SlotId } from '../src/game/types';

const NIVEAU = 28;
const classId = 'gep' as const;

const attrs = {
  force: curveAttr(NIVEAU, REFERENCE_CURVE.main, 10),
  adresse: curveAttr(NIVEAU, REFERENCE_CURVE.side, 8),
  esprit: curveAttr(NIVEAU, REFERENCE_CURVE.side, 8),
  endurance: curveAttr(NIVEAU, REFERENCE_CURVE.endurance, 9),
  chance: curveAttr(NIVEAU, REFERENCE_CURVE.chance, 6),
};
attrs[CLASSES[classId].mainAttr] = curveAttr(NIVEAU, REFERENCE_CURVE.main, 10);

// Un équipement complet, de belle gamme : c'est ce qui se voit sur la fiche.
const GAMMES: Rarity[] = ['rar', 'lezand', 'rar', 'kalite', 'rar', 'lezand', 'kalite', 'rar'];
const equipment: Partial<Record<SlotId, Item>> = {};
SLOT_LIST.forEach((slot, i) => {
  equipment[slot] = generateItem(NIVEAU + 1, slot, GAMMES[i % GAMMES.length]);
});

// Deux pièces en sac : la comparaison « mieux / moins bien » est un des
// écrans les plus parlants du jeu.
const inventory: Item[] = [
  generateItem(NIVEAU + 3, 'arme', 'lezand'),
  generateItem(NIVEAU - 2, 'tete', 'mitik'),
];

const aujourdhui = new Date().toISOString().slice(0, 10);

const state = {
  player: {
    name: 'Roi Volkan',
    classId,
    level: NIVEAU,
    xp: Math.round(xpForLevel(NIVEAU) * 0.62),
    appearance: { bodyColor: '#17202A', combColor: '#FF5B4A', tailPalette: 8, accessory: 5 },
    baseAttrs: attrs,
    equipment,
    inventory,
    grains: 48_600,
    piments: 214,
    honor: 386,
    honorPeak: 386,
    rank: 9,
    wins: 63,
    losses: 21,
    guildId: null,
    transport: 2,
    talents: ['kou_dur', 'kwir_dur', 'lespri_vif', 'bon_zelev'],
    cosmetics: [],
  },
  ladderOrder: [],
  quests: generateQuests(NIVEAU),
  activeQuest: null,
  motivation: 74,
  dodosToday: 1,
  guildDonatedToday: 0,
  lastDaily: aujourdhui,
  arenaTickets: 3,
  nextTicketAt: 0,
  shop: shopRotation(NIVEAU),
  album: [],
  keys: 4,
  dungeonFloor: 7,
  battleLog: [],
  lastOutcome: null,
  dailyMissions: rollDailyMissions(aujourdhui),
  dailyChestClaimed: false,
  chestNextAt: Date.now() + 2 * 3600_000,
  loginStreak: 6,
  lastLoginDay: aujourdhui,
  streakClaimedDay: null,
  claimedSteps: [],
  adsToday: 1,
  adNextAt: 0,
  guildLevel: 0,
  passUntil: 0,
  passClaimedDay: null,
  starterPackBought: false,
  offersTaken: [],
  offerShownDay: aujourdhui,
  seasonNo: 1,
  seasonPending: null,
  foundMitik: true,
  lang: 'fr',
  sfxOn: true,
  musicOn: true,
};

process.stdout.write(JSON.stringify({ state, version: 4 }));
