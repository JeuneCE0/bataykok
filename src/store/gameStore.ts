import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { generateLadder } from '../game/bots';
import {
  arenaGold,
  arenaXp,
  attrCost,
  grainsPerPiment,
  totalAttrs,
  xpForLevel,
  mulberry32,
} from '../game/formulas';
import {
  GUILD_GOLD_BONUS_PER_LEVEL,
  GUILD_XP_BONUS_PER_LEVEL,
  guildUpgradeCost,
} from '../game/guilds';
import { albumXpBonus, itemAlbumKey } from '../game/album';
import { BOSSES, KEY_PIMENT_COST, MAX_KEYS } from '../game/dungeons';
import { eventOfDay } from '../game/events';
import { Lang } from '../i18n';
import { COSMETIC_BY_ID } from '../game/cosmetics';
import { honorFloor } from '../game/ranks';
import { SLOT_LIST, generateItem, resaleValue, rollRarity, shopRotation } from '../game/items';
import { expectedRarity } from '../game/reference';
import { SET_BY_ID } from '../game/sets';
import { compareToEquipped } from '../game/power';
import {
  arenaReward,
  bossConsolation,
  BatayReward,
  defenseReward,
} from '../game/rewards';
import { SEASON_MS, tierForRank } from '../game/seasons';
import {
  BASE_ARENA_TICKETS,
  consume as consumeTicket,
  regenerate as regenerateTickets,
} from '../game/tickets';
import { pendingTier, talentEffects } from '../game/talents';
import {
  AD_COOLDOWN_MS,
  AdKind,
  adGrains,
  DAILY_CHEST,
  MAX_ADS_PER_DAY,
  isStepComplete as stepComplete,
  MissionKind,
  MissionState,
  rollDailyMissions,
  StepId,
  STEPS,
  streakRewardFor,
} from '../game/progress';
import {
  DODO_RESTORE,
  generateQuests,
  MAX_DODOS_PER_DAY,
  MAX_MOTIVATION,
} from '../game/quests';
import { TRANSPORTS } from '../game/transport';
import {
  ActiveQuest,
  Appearance,
  AttrId,
  ClassId,
  Item,
  PlayerState,
  Quest,
} from '../game/types';
import { trackEvent } from '../lib/analytics';
import { DefenseLog } from '../lib/online';

export { ARENA_TICKET_MS, BASE_ARENA_TICKETS } from '../game/tickets';
export const CHEST_MS = 4 * 60 * 60 * 1000;
export const PASS_DAYS = 30;
export const PASS_DAILY_PIMENTS = 20;

/** plafond de jetons : base + talents + événement du jour */
/** plafond de jetons : base + talents + événement du jour */
export function maxArenaTickets(
  talents: string[] | undefined,
  eventBonus: number
): number {
  return BASE_ARENA_TICKETS + talentEffects(talents ?? []).tickets + eventBonus;
}

/** Journal des batays, consultable dans La Kaz. */
export interface BattleLogEntry {
  id: string;
  kind: 'attack' | 'defense' | 'dungeon';
  opponent: string;
  won: boolean;
  gold: number;
  xp: number;
  honorDelta: number;
  at: number;
}

const LOG_MAX = 25;

/** Ce que le joueur voit à son retour, une ligne par batay subie. */
export interface DefenseSummary {
  id: string;
  attackerName: string;
  attackerLevel: number;
  attackerClass: ClassId;
  /** true = le kok a repoussé l'attaque */
  defended: boolean;
  honorDelta: number;
  gold: number;
  xp: number;
  happenedAt: string;
}

export interface QuestOutcome {
  gold: number;
  xp: number;
  item: Item | null;
  piments: number;
  levelsGained: number;
  doubled: boolean;
  /** une clé de gardien trouvée en chemin */
  key: boolean;
}

/** Compteurs cumulés — servent aux étapes du chemin et aux défis. */
export interface LifetimeStats {
  quests: number;
  arenas: number;
  wins: number;
  buys: number;
  attrs: number;
  dodos: number;
  equips: number;
}

interface GameState {
  player: PlayerState | null;
  ladderOrder: string[];
  quests: Quest[];
  activeQuest: ActiveQuest | null;
  motivation: number;
  dodosToday: number;
  lastDaily: string;
  arenaTickets: number;
  /** date de régénération du prochain jeton */
  nextTicketAt: number;
  shop: Item[];
  guildLevel: number;
  lastOutcome: QuestOutcome | null;

  // progression & fidélité
  stats: LifetimeStats;
  foundMitik: boolean;
  claimedSteps: StepId[];
  dailyMissions: MissionState[];
  dailyChestClaimed: boolean;
  loginStreak: number;
  lastLoginDay: string;
  streakClaimedDay: string | null;
  adsToday: number;
  adNextAt: number;
  starterPackBought: boolean;
  /** vrai pendant l'animation d'un combat : l'UI passe en mode scène */
  combatActive: boolean;
  /** état de la liaison multijoueur, pour qu'un échec ne soit jamais muet */
  onlineState: 'off' | 'sync' | 'ok' | 'error';
  /** réglages audio (persistés) */
  sfxOn: boolean;
  musicOn: boolean;
  /** langue de l'interface (persistée) */
  lang: Lang;
  /** coffre gratuit : date de la prochaine ouverture */
  chestNextAt: number;
  /** Zalbum : clés emplacement:rareté déjà rencontrées */
  album: string[];
  /** pass Ti Planteur : fin d'abonnement + dernier jour encaissé */
  passUntil: number;
  passClaimedDay: string | null;
  /** Route des Cirques : étages franchis et clés en poche */
  dungeonFloor: number;
  keys: number;
  /** saison en cours du rond */
  seasonStart: number;
  seasonNo: number;
  /** récompense de fin de saison en attente d'être encaissée */
  seasonPending: { season: number; rank: number } | null;
  /** série de victoires en cours au rond */
  winStreak: number;
  /** batays subies hors ligne, en attente d'être lues par le joueur */
  pendingDefenses: DefenseSummary[];
  /** historique des batays (attaques, défenses, gardiens) */
  battleLog: BattleLogEntry[];

  // actions
  createPlayer: (name: string, classId: ClassId, appearance: Appearance) => void;
  resetGame: () => void;
  ensureDaily: () => void;
  buyAttr: (attr: AttrId, times?: number) => void;
  equipBest: () => number;
  sellJunk: () => { count: number; grains: number };
  regenTickets: () => void;
  rerollQuests: () => void;
  startQuest: (q: Quest) => void;
  cancelQuest: () => void;
  collectQuest: () => QuestOutcome | null;
  drinkDodo: () => void;
  refillMotivation: () => void;
  applyArenaResult: (
    won: boolean,
    opponentId: string,
    context?: {
      myPower?: number;
      opPower?: number;
      online?: boolean;
      opponentName?: string;
      opponentLevel?: number;
    }
  ) => BatayReward & { levels: number; streak: number; item: Item | null };
  buyArenaTicket: () => void;
  refreshShop: (payWithPiment: boolean) => void;
  buyItem: (item: Item) => void;
  equipItem: (item: Item) => void;
  sellItem: (item: Item) => void;
  joinGuild: (guildId: string) => void;
  leaveGuild: () => void;
  donateGuild: (grains: number) => void;
  buyTransport: (index: number) => void;
  buyCosmetic: (id: string) => boolean;
  /** achète une panoplie complète : huit pièces + le look assorti */
  buySetKit: (setId: string) => boolean;
  setKitPrice: (setId: string) => number;
  setAppearance: (a: Partial<Appearance>) => void;
  buyGrains: (piments: number) => void;
  addPiments: (n: number) => void;
  claimStep: (id: StepId) => void;
  claimMission: (missionId: string) => void;
  claimDailyChest: () => void;
  claimStreak: () => { grains: number; piments: number } | null;
  watchAd: (kind: AdKind) => boolean;
  buyStarterPack: () => void;
  setCombatActive: (v: boolean) => void;
  setOnlineState: (v: GameState['onlineState']) => void;
  setSfxOn: (v: boolean) => void;
  setLang: (v: Lang) => void;
  setMusicOn: (v: boolean) => void;
  /** coupe ou rétablit tout d'un geste */
  toggleMute: () => boolean;
  /** encaisse les défenses relevées au serveur et réaligne l'honneur */
  applyDefenses: (
    logs: DefenseLog[],
    serverHonor: { honor: number; peak: number } | null
  ) => { gold: number; xp: number; levels: number } | null;
  clearDefenses: () => void;
  /** crédit direct (parrainage, offres) — le serveur ne tient pas la bourse */
  grantBonus: (b: { grains?: number; piments?: number }) => void;
  /** sortie/entrée d'un objet du sak (hôtel des ventes) */
  removeItem: (itemId: string) => boolean;
  addItem: (item: Item) => boolean;
  spendGrains: (n: number) => boolean;
  openFreeChest: () => { grains: number; piments: number; item: Item | null } | null;
  pickTalent: (id: string) => void;
  buyPass: () => void;
  claimPassPiments: () => number;
  buyKey: () => void;
  applyBossResult: (
    won: boolean,
    floor: number,
    /** part des PV du gardien retirés — sert à la consolation */
    damageRatio?: number
  ) => { grains: number; xp: number; levels: number; item: Item | null } | null;
  claimSeason: () => { grains: number; piments: number } | null;
}

/**
 * Jour **local** du joueur. `toISOString()` renvoie de l'UTC : à La Réunion
 * (UTC+4) la journée de jeu basculait à 4 h du matin, en plein milieu d'une
 * soirée de jeu.
 */
function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function today(): string {
  return dayKey(new Date());
}

function yesterday(): string {
  return dayKey(new Date(Date.now() - 86_400_000));
}

/** Minuit local prochain : l'heure à laquelle tout se recharge. */
export function nextDailyReset(): number {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.getTime();
}

function defaultAttrs() {
  return { force: 10, adresse: 10, esprit: 10, endurance: 10, chance: 8 };
}

function emptyStats(): LifetimeStats {
  return { quests: 0, arenas: 0, wins: 0, buys: 0, attrs: 0, dodos: 0, equips: 0 };
}

/** applique l'XP et renvoie le nombre de niveaux gagnés */
function applyXp(p: PlayerState, xp: number): number {
  p.xp += xp;
  let gained = 0;
  while (p.xp >= xpForLevel(p.level)) {
    p.xp -= xpForLevel(p.level);
    p.level++;
    gained++;
  }
  return gained;
}

function pushLog(log: BattleLogEntry[], entry: BattleLogEntry): BattleLogEntry[] {
  return [entry, ...log].slice(0, LOG_MAX);
}

function addToAlbum(album: string[], it: Item): string[] {
  const key = itemAlbumKey(it);
  return album.includes(key) ? album : [...album, key];
}

function bumpMissions(
  missions: MissionState[],
  kind: MissionKind,
  n: number
): MissionState[] {
  return missions.map((m) =>
    m.def.kind === kind && m.progress < m.def.target
      ? { ...m, progress: Math.min(m.def.target, m.progress + n) }
      : m
  );
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => {
      /** avance les compteurs cumulés ET les défis du jour */
      const track = (kind: MissionKind, n = 1) => {
        const s = get();
        const stats = { ...emptyStats(), ...s.stats };
        const key: keyof LifetimeStats =
          kind === 'quest'
            ? 'quests'
            : kind === 'arena'
              ? 'arenas'
              : kind === 'win'
                ? 'wins'
                : kind === 'buy'
                  ? 'buys'
                  : kind === 'attr'
                    ? 'attrs'
                    : kind === 'dodo'
                      ? 'dodos'
                      : 'equips';
        stats[key] += n;
        set({ stats, dailyMissions: bumpMissions(s.dailyMissions, kind, n) });
      };

      return {
        player: null,
        ladderOrder: [],
        quests: [],
        activeQuest: null,
        motivation: MAX_MOTIVATION,
        dodosToday: 0,
        lastDaily: today(),
        arenaTickets: BASE_ARENA_TICKETS,
        nextTicketAt: 0,
        shop: [],
        guildLevel: 0,
        lastOutcome: null,

        stats: emptyStats(),
        foundMitik: false,
        claimedSteps: [],
        dailyMissions: rollDailyMissions(today()),
        dailyChestClaimed: false,
        loginStreak: 1,
        lastLoginDay: today(),
        streakClaimedDay: null,
        adsToday: 0,
        adNextAt: 0,
        starterPackBought: false,
        combatActive: false,
        onlineState: 'off',
        sfxOn: true,
        musicOn: true,
        // le jeu se passe à La Réunion : le kréol est la langue par défaut
        lang: 'rcf',
        chestNextAt: 0,
        album: [],
        passUntil: 0,
        passClaimedDay: null,
        dungeonFloor: 0,
        keys: 2,
        seasonStart: Date.now(),
        seasonNo: 1,
        seasonPending: null,
        winStreak: 0,
        pendingDefenses: [],
        battleLog: [],

        createPlayer: (name, classId, appearance) => {
          const ladder = generateLadder().map((b) => b.id);
          ladder.push('me');
          const p: PlayerState = {
            name: name.trim() || 'Ti Kok',
            classId,
            level: 1,
            xp: 0,
            appearance,
            baseAttrs: defaultAttrs(),
            equipment: {},
            inventory: [generateItem(1, 'arme', 'commun')],
            grains: 120,
            piments: 15,
            honor: 100,
            honorPeak: 100,
            rank: ladder.length,
            wins: 0,
            losses: 0,
            guildId: null,
            transport: 0,
            talents: [],
            cosmetics: [],
          };
          trackEvent('player_created', { classId });
          set({
            player: p,
            ladderOrder: ladder,
            quests: generateQuests(1),
            shop: shopRotation(1),
            motivation: MAX_MOTIVATION,
            dodosToday: 0,
            lastDaily: today(),
            arenaTickets: BASE_ARENA_TICKETS,
            nextTicketAt: 0,
            guildLevel: 0,
            activeQuest: null,
            stats: emptyStats(),
            foundMitik: false,
            claimedSteps: [],
            dailyMissions: rollDailyMissions(today()),
            dailyChestClaimed: false,
            loginStreak: 1,
            lastLoginDay: today(),
            streakClaimedDay: null,
            adsToday: 0,
            adNextAt: 0,
            starterPackBought: false,
            chestNextAt: 0,
            album: [],
            passUntil: 0,
            passClaimedDay: null,
            dungeonFloor: 0,
            keys: 2,
            seasonStart: Date.now(),
            seasonNo: 1,
            seasonPending: null,
            winStreak: 0,
            pendingDefenses: [],
            battleLog: [],
          });
        },

        resetGame: () =>
          set({
            player: null,
            ladderOrder: [],
            quests: [],
            activeQuest: null,
            motivation: MAX_MOTIVATION,
            dodosToday: 0,
            arenaTickets: BASE_ARENA_TICKETS,
            nextTicketAt: 0,
            shop: [],
            guildLevel: 0,
            lastOutcome: null,
            stats: emptyStats(),
            foundMitik: false,
            claimedSteps: [],
            dailyMissions: rollDailyMissions(today()),
            dailyChestClaimed: false,
            loginStreak: 1,
            lastLoginDay: today(),
            streakClaimedDay: null,
            adsToday: 0,
            adNextAt: 0,
            starterPackBought: false,
            chestNextAt: 0,
            album: [],
            passUntil: 0,
            passClaimedDay: null,
            dungeonFloor: 0,
            keys: 2,
            seasonStart: Date.now(),
            seasonNo: 1,
            seasonPending: null,
            winStreak: 0,
            pendingDefenses: [],
            battleLog: [],
          }),

        ensureDaily: () => {
          const s = get();
          if (!s.player || s.lastDaily === today()) return;
          // la série continue si la dernière visite était hier, sinon elle repart
          const streak = s.lastLoginDay === yesterday() ? s.loginStreak + 1 : 1;
          set({
            lastDaily: today(),
            motivation: MAX_MOTIVATION,
            dodosToday: 0,
            quests: s.activeQuest ? s.quests : generateQuests(s.player.level),
            shop: shopRotation(s.player.level),
            dailyMissions: rollDailyMissions(today()),
            dailyChestClaimed: false,
            loginStreak: streak,
            lastLoginDay: today(),
            streakClaimedDay: null,
            adsToday: 0,
            adNextAt: 0,
            keys: Math.min(MAX_KEYS, s.keys + 1),
            ...(Date.now() >= s.seasonStart + SEASON_MS && !s.seasonPending
              ? {
                  seasonPending: {
                    season: s.seasonNo,
                    rank: s.ladderOrder.indexOf('me') + 1,
                  },
                  seasonStart: Date.now(),
                  seasonNo: s.seasonNo + 1,
                }
              : {}),
          });
        },

        buyAttr: (attr, times = 1) => {
          const s = get();
          if (!s.player) return;
          const p = { ...s.player, baseAttrs: { ...s.player.baseAttrs } };
          let bought = 0;
          for (let i = 0; i < times; i++) {
            const cost = attrCost(p.baseAttrs[attr]);
            if (p.grains < cost) break;
            p.grains -= cost;
            p.baseAttrs[attr] += 1;
            bought++;
          }
          if (!bought) return;
          set({ player: p });
          track('attr', bought);
        },

        /** équipe d'un coup tout ce qui est meilleur que le porté */
        equipBest: () => {
          const s = get();
          if (!s.player) return 0;
          const p: PlayerState = {
            ...s.player,
            equipment: { ...s.player.equipment },
            inventory: [...s.player.inventory],
          };
          let changed = 0;
          let pass = true;
          while (pass) {
            pass = false;
            for (const it of [...p.inventory]) {
              if (compareToEquipped(it, p).diff <= 0) continue;
              p.inventory = p.inventory.filter((x) => x.id !== it.id);
              const prev = p.equipment[it.slot];
              if (prev) p.inventory.push(prev);
              p.equipment[it.slot] = it;
              changed++;
              pass = true;
              break;
            }
          }
          if (!changed) return 0;
          set({ player: p });
          track('equip', changed);
          return changed;
        },

        /** vend tout ce qui est strictement moins bon que le porté */
        sellJunk: () => {
          const s = get();
          if (!s.player) return { count: 0, grains: 0 };
          const junk = s.player.inventory.filter(
            (it) => compareToEquipped(it, s.player!).verdict === 'worse'
          );
          if (!junk.length) return { count: 0, grains: 0 };
          const grains = junk.reduce(
            (sum, it) => sum + resaleValue(it),
            0
          );
          const ids = new Set(junk.map((i) => i.id));
          set({
            player: {
              ...s.player,
              grains: s.player.grains + grains,
              inventory: s.player.inventory.filter((i) => !ids.has(i.id)),
            },
          });
          return { count: junk.length, grains };
        },

        /** rend les jetons de batay dus depuis la dernière visite */
        regenTickets: () => {
          const s = get();
          const max = maxArenaTickets(
            s.player?.talents,
            eventOfDay(today()).kind === 'batay' ? 2 : 0
          );
          const next = regenerateTickets(
            { tickets: s.arenaTickets, nextAt: s.nextTicketAt },
            max,
            Date.now()
          );
          if (next.tickets === s.arenaTickets && next.nextAt === s.nextTicketAt) return;
          set({ arenaTickets: next.tickets, nextTicketAt: next.nextAt });
        },

        rerollQuests: () => {
          const s = get();
          if (!s.player || s.activeQuest) return;
          set({ quests: generateQuests(s.player.level) });
        },

        startQuest: (q) => {
          const s = get();
          if (!s.player || s.activeQuest) return;
          if (s.motivation < q.motivationCost) return;
          // le talent « Pié lézé » était déclaré mais jamais consommé :
          // un joueur sur trois s'amputait d'un choix définitif au palier 15
          const reduction = TRANSPORTS[s.player.transport].reduction;
          const speed = talentEffects(s.player.talents ?? []).questSpeed;
          const dur = Math.round(q.durationSec * (1 - reduction) * (1 - speed));
          const now = Date.now();
          set({
            motivation: s.motivation - q.motivationCost,
            activeQuest: { quest: q, startedAt: now, endsAt: now + dur * 1000 },
          });
        },

        cancelQuest: () => set({ activeQuest: null }),

        collectQuest: () => {
          const s = get();
          if (!s.player || !s.activeQuest) return null;
          if (Date.now() < s.activeQuest.endsAt) return null;
          const q = s.activeQuest.quest;
          const p: PlayerState = {
            ...s.player,
            baseAttrs: { ...s.player.baseAttrs },
            inventory: [...s.player.inventory],
          };
          const ev = eventOfDay(today());
          const t = talentEffects(p.talents ?? []);
          const goldBonus =
            (p.guildId ? 1 + (s.guildLevel * GUILD_GOLD_BONUS_PER_LEVEL) / 100 : 1) *
            (1 + t.gold) *
            (ev.kind === 'grains' ? ev.mult : 1);
          const xpBonus =
            (p.guildId ? 1 + (s.guildLevel * GUILD_XP_BONUS_PER_LEVEL) / 100 : 1) *
            (1 + t.xp) *
            (1 + albumXpBonus(s.album.length)) *
            (s.passUntil > Date.now() ? 1.1 : 1) *
            (ev.kind === 'xp' ? ev.mult : 1);
          const gold = Math.round(q.gold * goldBonus);
          const xp = Math.round(q.xp * xpBonus);
          p.grains += gold;
          const levels = applyXp(p, xp);
          let item: Item | null = null;
          const lootChance =
            q.itemChance * (ev.kind === 'loot' ? ev.mult : 1);
          if (Math.random() < lootChance && p.inventory.length < 24) {
            // le temps investi dans la quête pousse le tirage de gamme
            item = generateItem(p.level, undefined, rollRarity(q.luck ?? 0));
            p.inventory.push(item);
          }
          let piments = 0;
          if (Math.random() < q.pimentChance) {
            piments = 1;
            p.piments += 1;
          }
          // une quête sur douze ramène une clé de gardien
          const foundKey = Math.random() < 0.08 && s.keys < MAX_KEYS;
          const outcome: QuestOutcome = {
            gold,
            xp,
            item,
            piments,
            levelsGained: levels,
            doubled: false,
            key: foundKey,
          };
          set({
            player: p,
            activeQuest: null,
            quests: generateQuests(p.level),
            lastOutcome: outcome,
            foundMitik: s.foundMitik || item?.rarity === 'mitik',
            album: item ? addToAlbum(s.album, item) : s.album,
            keys: foundKey ? s.keys + 1 : s.keys,
          });
          track('quest');
          trackEvent('quest_done', { gold, xp, item: Boolean(item) });
          return outcome;
        },

        drinkDodo: () => {
          const s = get();
          if (!s.player) return;
          if (s.dodosToday >= MAX_DODOS_PER_DAY) return;
          if (s.player.piments < 1) return;
          set({
            player: { ...s.player, piments: s.player.piments - 1 },
            motivation: s.motivation + DODO_RESTORE,
            dodosToday: s.dodosToday + 1,
          });
          track('dodo');
        },

        refillMotivation: () => {
          const s = get();
          if (!s.player || s.player.piments < 5) return;
          set({
            player: { ...s.player, piments: s.player.piments - 5 },
            motivation: MAX_MOTIVATION,
          });
        },

        applyArenaResult: (won, opponentId, context) => {
          const s = get();
          const empty = {
            gold: 0,
            xp: 0,
            honor: 0,
            parts: [],
            levels: 0,
            streak: 0,
            item: null,
          };
          if (!s.player) return empty;
          const p: PlayerState = {
            ...s.player,
            baseAttrs: { ...s.player.baseAttrs },
            inventory: [...s.player.inventory],
          };
          const ev = eventOfDay(today());
          const t = talentEffects(p.talents ?? []);

          const reward = arenaReward({
            won,
            level: p.level,
            myPower: context?.myPower ?? 1,
            opPower: context?.opPower ?? 1,
            streak: s.winStreak,
            online: context?.online ?? false,
          });

          const gold = Math.round(
            reward.gold * (1 + t.gold) * (ev.kind === 'grains' ? ev.mult : 1)
          );
          const xp = Math.round(
            reward.xp *
              (1 + t.xp) *
              (1 + albumXpBonus(s.album.length)) *
              (s.passUntil > Date.now() ? 1.1 : 1) *
              (ev.kind === 'xp' ? ev.mult : 1)
          );

          p.grains += gold;
          const levels = applyXp(p, xp);
          p.honorPeak = Math.max(p.honorPeak ?? 100, p.honor + reward.honor);
          p.honor = Math.max(honorFloor(p.honorPeak), p.honor + reward.honor);
          if (won) p.wins += 1;
          else p.losses += 1;

          // butin de batay : rare, mais c'est ce qui fait relancer un combat
          let drop: Item | null = null;
          const dropChance = 0.09 * (ev.kind === 'loot' ? ev.mult : 1);
          if (won && p.inventory.length < 24 && Math.random() < dropChance) {
            drop = generateItem(
              Math.max(1, context?.opponentLevel ?? p.level)
            );
            p.inventory.push(drop);
          }

          const order = [...s.ladderOrder];
          const myIdx = order.indexOf('me');
          const opIdx = order.indexOf(opponentId);
          if (won && opIdx >= 0 && opIdx < myIdx) {
            order.splice(myIdx, 1);
            order.splice(opIdx, 0, 'me');
          }
          p.rank = order.indexOf('me') + 1;

          const streak = won ? s.winStreak + 1 : 0;
          const max = maxArenaTickets(p.talents, ev.kind === 'batay' ? 2 : 0);
          const spent = consumeTicket(
            { tickets: s.arenaTickets, nextAt: s.nextTicketAt },
            max,
            Date.now()
          );
          set({
            player: p,
            ladderOrder: order,
            arenaTickets: spent.tickets,
            nextTicketAt: spent.nextAt,
            winStreak: streak,
            album: drop ? addToAlbum(s.album, drop) : s.album,
            foundMitik: s.foundMitik || drop?.rarity === 'mitik',
            battleLog: pushLog(s.battleLog, {
              id: `a${Date.now()}`,
              kind: 'attack',
              opponent: context?.opponentName ?? 'In kok',
              won,
              gold,
              xp,
              honorDelta: reward.honor,
              at: Date.now(),
            }),
          });
          track('arena');
          if (won) track('win');
          trackEvent('arena_fight', {
            won,
            online: context?.online ?? false,
            level: p.level,
          });
          return { ...reward, gold, xp, levels, streak, item: drop };
        },

        buyArenaTicket: () => {
          const s = get();
          if (!s.player || s.player.piments < 1) return;
          const max = maxArenaTickets(
            s.player.talents,
            eventOfDay(today()).kind === 'batay' ? 2 : 0
          );
          if (s.arenaTickets >= max) return;
          set({
            player: { ...s.player, piments: s.player.piments - 1 },
            arenaTickets: s.arenaTickets + 1,
          });
        },

        refreshShop: (payWithPiment) => {
          const s = get();
          if (!s.player) return;
          if (payWithPiment) {
            if (s.player.piments < 1) return;
            set({
              player: { ...s.player, piments: s.player.piments - 1 },
              shop: shopRotation(s.player.level),
            });
          } else {
            set({ shop: shopRotation(s.player.level) });
          }
        },

        buyItem: (item) => {
          const s = get();
          if (!s.player) return;
          if (s.player.grains < item.price) return;
          if (s.player.inventory.length >= 24) return;
          set({
            player: {
              ...s.player,
              grains: s.player.grains - item.price,
              inventory: [...s.player.inventory, item],
            },
            shop: s.shop.filter((i) => i.id !== item.id),
            foundMitik: s.foundMitik || item.rarity === 'mitik',
            album: addToAlbum(s.album, item),
          });
          track('buy');
        },

        equipItem: (item) => {
          const s = get();
          if (!s.player) return;
          const p: PlayerState = {
            ...s.player,
            equipment: { ...s.player.equipment },
            inventory: s.player.inventory.filter((i) => i.id !== item.id),
          };
          const prev = p.equipment[item.slot];
          if (prev) p.inventory.push(prev);
          p.equipment[item.slot] = item;
          set({ player: p });
          track('equip');
        },

        sellItem: (item) => {
          const s = get();
          if (!s.player) return;
          set({
            player: {
              ...s.player,
              grains: s.player.grains + resaleValue(item),
              inventory: s.player.inventory.filter((i) => i.id !== item.id),
            },
          });
        },

        joinGuild: (guildId) => {
          const s = get();
          if (!s.player) return;
          set({ player: { ...s.player, guildId }, guildLevel: 1 });
        },

        leaveGuild: () => {
          const s = get();
          if (!s.player) return;
          set({ player: { ...s.player, guildId: null }, guildLevel: 0 });
        },

        donateGuild: (grains) => {
          const s = get();
          if (!s.player || !s.player.guildId) return;
          const cost = guildUpgradeCost(s.guildLevel);
          if (grains < cost || s.player.grains < cost) return;
          set({
            player: { ...s.player, grains: s.player.grains - cost },
            guildLevel: s.guildLevel + 1,
          });
        },

        /**
         * Achat d'un cosmétique. Il n'entre jamais dans les statistiques :
         * c'est le seul poste de dépense qui ne déséquilibre rien, donc le seul
         * qu'on puisse laisser cher sans fermer la porte aux joueurs gratuits.
         */
        setKitPrice: (setId) => {
          const s = get();
          if (!s.player) return 0;
          const def = SET_BY_ID[setId];
          if (!def) return 0;
          // huit pièces de la gamme attendue au niveau du joueur, plus la prime
          // de commodité : on paie de ne pas farmer chaque emplacement
          const gamme = expectedRarity(s.player.level);
          const unit = SLOT_LIST.map(
            (sl) => generateItem(s.player!.level, sl, gamme, mulberry32(7 + sl.length)).price
          ).reduce((a, b) => a + b, 0);
          return Math.round(unit * 1.15);
        },

        buySetKit: (setId) => {
          const s = get();
          const def = SET_BY_ID[setId];
          if (!s.player || !def) return false;
          const price = get().setKitPrice(setId);
          if (s.player.grains < price) return false;

          const gamme = expectedRarity(s.player.level);
          const pieces = SLOT_LIST.map((sl) => {
            const it = generateItem(s.player!.level, sl, gamme);
            it.setId = def.id;
            it.name = `${it.name.split(' ')[0]} ${def.name}`;
            return it;
          });
          // les pièces remplacées partent au sac : personne ne doit perdre un
          // objet en achetant, surtout si c'était un unique
          const equipment = { ...s.player.equipment };
          const displaced: Item[] = [];
          pieces.forEach((it) => {
            const old = equipment[it.slot];
            if (old) displaced.push(old);
            equipment[it.slot] = it;
          });
          set({
            player: {
              ...s.player,
              grains: s.player.grains - price,
              equipment,
              inventory: [...s.player.inventory, ...displaced],
              appearance: { ...s.player.appearance, ...def.look },
              // le look de la panoplie reste acquis même si on la démonte
              cosmetics: s.player.cosmetics.includes(`set.${def.id}`)
                ? s.player.cosmetics
                : [...s.player.cosmetics, `set.${def.id}`],
            },
          });
          trackEvent('set_kit_bought', { setId, price });
          return true;
        },

        buyCosmetic: (id) => {
          const s = get();
          const c = COSMETIC_BY_ID[id];
          if (!s.player || !c) return false;
          if (s.player.cosmetics.includes(id)) return false;
          const grains = c.grains ?? 0;
          const piments = c.piments ?? 0;
          if (s.player.grains < grains || s.player.piments < piments) return false;
          set({
            player: {
              ...s.player,
              grains: s.player.grains - grains,
              piments: s.player.piments - piments,
              cosmetics: [...s.player.cosmetics, id],
            },
          });
          trackEvent('cosmetic_bought', { id, rarity: c.rarity });
          return true;
        },

        setAppearance: (a) => {
          const s = get();
          if (!s.player) return;
          set({ player: { ...s.player, appearance: { ...s.player.appearance, ...a } } });
        },

        buyTransport: (index) => {
          const s = get();
          if (!s.player) return;
          const t = TRANSPORTS[index];
          if (!t || index <= s.player.transport) return;
          if (t.costGrains) {
            if (s.player.grains < t.costGrains) return;
            set({
              player: {
                ...s.player,
                grains: s.player.grains - t.costGrains,
                transport: index,
              },
            });
          } else if (t.costPiments) {
            if (s.player.piments < t.costPiments) return;
            set({
              player: {
                ...s.player,
                piments: s.player.piments - t.costPiments,
                transport: index,
              },
            });
          }
        },

        buyGrains: (piments) => {
          const s = get();
          if (!s.player || s.player.piments < piments) return;
          set({
            player: {
              ...s.player,
              piments: s.player.piments - piments,
              grains:
                s.player.grains + grainsPerPiment(s.player.level) * piments,
            },
          });
        },

        addPiments: (n) => {
          const s = get();
          if (!s.player) return;
          set({ player: { ...s.player, piments: s.player.piments + n } });
        },

        // ─── Progression ───────────────────────────────────────────────

        claimStep: (id) => {
          const s = get();
          if (!s.player || s.claimedSteps.includes(id)) return;
          const def = STEPS.find((x) => x.id === id);
          if (!def || !isStepComplete(id, s)) return;
          set({
            player: {
              ...s.player,
              grains: s.player.grains + def.grains,
              piments: s.player.piments + def.piments,
            },
            claimedSteps: [...s.claimedSteps, id],
          });
        },

        claimMission: (missionId) => {
          const s = get();
          if (!s.player) return;
          const m = s.dailyMissions.find((x) => x.def.id === missionId);
          if (!m || m.claimed || m.progress < m.def.target) return;
          set({
            player: {
              ...s.player,
              grains: s.player.grains + m.def.grains,
              piments: s.player.piments + m.def.piments,
            },
            dailyMissions: s.dailyMissions.map((x) =>
              x.def.id === missionId ? { ...x, claimed: true } : x
            ),
          });
        },

        claimDailyChest: () => {
          const s = get();
          if (!s.player || s.dailyChestClaimed) return;
          if (!s.dailyMissions.every((m) => m.claimed)) return;
          set({
            player: {
              ...s.player,
              grains: s.player.grains + DAILY_CHEST.grains,
              piments: s.player.piments + DAILY_CHEST.piments,
            },
            dailyChestClaimed: true,
            // les trois défis du jour valent une tentative de donjon
            keys: Math.min(MAX_KEYS, s.keys + 1),
          });
        },

        claimStreak: () => {
          const s = get();
          if (!s.player || s.streakClaimedDay === today()) return null;
          const r = streakRewardFor(s.loginStreak);
          set({
            player: {
              ...s.player,
              grains: s.player.grains + r.grains,
              piments: s.player.piments + r.piments,
            },
            streakClaimedDay: today(),
          });
          return { grains: r.grains, piments: r.piments };
        },

        watchAd: (kind) => {
          const s = get();
          if (!s.player) return false;
          if (s.adsToday >= MAX_ADS_PER_DAY) return false;
          if (Date.now() < s.adNextAt) return false;

          const spend = {
            adsToday: s.adsToday + 1,
            adNextAt: Date.now() + AD_COOLDOWN_MS,
          };

          if (kind === 'dodo') {
            set({ ...spend, motivation: s.motivation + DODO_RESTORE });
          } else if (kind === 'grains') {
            set({
              ...spend,
              player: {
                ...s.player,
                grains: s.player.grains + adGrains(s.player.level),
              },
            });
          } else if (kind === 'key') {
            if (s.keys >= MAX_KEYS) return false;
            set({ ...spend, keys: s.keys + 1 });
          } else if (kind === 'arena') {
            const max = maxArenaTickets(
              s.player.talents,
              eventOfDay(today()).kind === 'batay' ? 2 : 0
            );
            set({ ...spend, arenaTickets: Math.min(max, s.arenaTickets + 1) });
          } else if (kind === 'double') {
            const o = s.lastOutcome;
            if (!o || o.doubled) return false;
            const p = { ...s.player, baseAttrs: { ...s.player.baseAttrs } };
            p.grains += o.gold;
            const levels = applyXp(p, o.xp);
            set({
              ...spend,
              player: p,
              lastOutcome: {
                ...o,
                gold: o.gold * 2,
                xp: o.xp * 2,
                levelsGained: o.levelsGained + levels,
                doubled: true,
              },
            });
          }
          return true;
        },

        setCombatActive: (v) => set({ combatActive: v }),

        setOnlineState: (v) => set({ onlineState: v }),

        setLang: (v) => set({ lang: v }),

        setSfxOn: (v) => set({ sfxOn: v }),
        setMusicOn: (v) => set({ musicOn: v }),

        toggleMute: () => {
          const s = get();
          const muted = !s.sfxOn && !s.musicOn;
          // couper tout, ou tout rétablir : un seul geste, pas de demi-état
          set({ sfxOn: muted, musicOn: muted });
          return !muted;
        },

        applyDefenses: (logs, serverHonor) => {
          const s = get();
          if (!s.player || logs.length === 0) {
            if (s.player && serverHonor && serverHonor.honor !== s.player.honor) {
              set({ player: { ...s.player, honor: serverHonor.honor, honorPeak: Math.max(s.player.honorPeak ?? 100, serverHonor.peak) } });
            }
            return null;
          }
          const p: PlayerState = {
            ...s.player,
            baseAttrs: { ...s.player.baseAttrs },
          };
          let gold = 0;
          let xp = 0;
          const summaries: DefenseSummary[] = [];

          logs.forEach((l) => {
            const defended = !l.attackerWon;
            const r = defenseReward(defended, p.level);
            gold += r.gold;
            xp += r.xp;
            if (defended) p.wins += 1;
            else p.losses += 1;
            summaries.push({
              id: l.id,
              attackerName: l.attackerName,
              attackerLevel: l.attackerLevel,
              attackerClass: l.attackerClass,
              defended,
              honorDelta: -l.honorDelta,
              gold: r.gold,
              xp: r.xp,
              happenedAt: l.happenedAt,
            });
          });

          p.grains += gold;
          const levels = applyXp(p, xp);
          // le serveur fait foi sur l'honneur : il a arbitré ces combats
          if (serverHonor) {
            p.honor = serverHonor.honor;
            p.honorPeak = Math.max(p.honorPeak ?? 100, serverHonor.peak);
          }

          set({
            player: p,
            pendingDefenses: summaries,
            battleLog: summaries.reduce(
              (log, d) =>
                pushLog(log, {
                  id: d.id,
                  kind: 'defense',
                  opponent: d.attackerName,
                  won: d.defended,
                  gold: d.gold,
                  xp: d.xp,
                  honorDelta: d.honorDelta,
                  at: new Date(d.happenedAt).getTime() || Date.now(),
                }),
              s.battleLog
            ),
          });
          return { gold, xp, levels };
        },

        clearDefenses: () => set({ pendingDefenses: [] }),

        removeItem: (itemId) => {
          const s = get();
          if (!s.player) return false;
          if (!s.player.inventory.some((i) => i.id === itemId)) return false;
          set({
            player: {
              ...s.player,
              inventory: s.player.inventory.filter((i) => i.id !== itemId),
            },
          });
          return true;
        },

        addItem: (item) => {
          const s = get();
          if (!s.player || s.player.inventory.length >= 24) return false;
          set({
            player: { ...s.player, inventory: [...s.player.inventory, item] },
            album: addToAlbum(s.album, item),
            foundMitik: s.foundMitik || item.rarity === 'mitik',
          });
          return true;
        },

        spendGrains: (n) => {
          const s = get();
          if (!s.player || s.player.grains < n) return false;
          set({ player: { ...s.player, grains: s.player.grains - n } });
          return true;
        },

        grantBonus: ({ grains = 0, piments = 0 }) => {
          const s = get();
          if (!s.player) return;
          set({
            player: {
              ...s.player,
              grains: s.player.grains + grains,
              piments: s.player.piments + piments,
            },
          });
        },

        /** Coffre gratuit toutes les 4 h : le rendez-vous « gratter ». */
        openFreeChest: () => {
          const s = get();
          if (!s.player || Date.now() < s.chestNextAt) return null;
          const p: PlayerState = {
            ...s.player,
            inventory: [...s.player.inventory],
          };
          const roll = Math.random();
          let grains = 0;
          let piments = 0;
          let item: Item | null = null;
          if (roll < 0.55) {
            grains = Math.round((60 + p.level * 40) * (0.8 + Math.random() * 0.6));
            p.grains += grains;
          } else if (roll < 0.82) {
            piments = 1 + Math.floor(Math.random() * 3);
            p.piments += piments;
          } else if (p.inventory.length < 24) {
            item = generateItem(p.level, undefined, Math.random() < 0.3 ? 'kalite' : 'korek');
            p.inventory.push(item);
          } else {
            grains = Math.round(80 + p.level * 50);
            p.grains += grains;
          }
          set({
            player: p,
            chestNextAt: Date.now() + CHEST_MS,
            album: item ? addToAlbum(s.album, item) : s.album,
            foundMitik: s.foundMitik || item?.rarity === 'mitik',
          });
          return { grains, piments, item };
        },

        pickTalent: (id) => {
          const s = get();
          if (!s.player) return;
          const talents = s.player.talents ?? [];
          const tier = pendingTier(s.player.level, talents);
          if (!tier || !tier.choices.some((c) => c.id === id)) return;
          set({ player: { ...s.player, talents: [...talents, id] } });
        },

        buyKey: () => {
          const s = get();
          if (!s.player || s.player.piments < KEY_PIMENT_COST) return;
          if (s.keys >= MAX_KEYS) return;
          set({
            player: { ...s.player, piments: s.player.piments - KEY_PIMENT_COST },
            keys: s.keys + 1,
          });
        },

        /**
         * Un étage se tente contre une clé (perdue même en cas d'échec) et ne
         * se franchit qu'une fois : les récompenses sont garanties, donc non
         * farmables.
         */
        applyBossResult: (won, floor, damageRatio = 0) => {
          const s = get();
          if (!s.player) return null;
          if (s.keys <= 0) return null;
          const boss = BOSSES.find((b) => b.floor === floor);
          if (!boss || floor !== s.dungeonFloor + 1) return null;

          if (!won) {
            const c = bossConsolation(boss.reward, damageRatio);
            const lost: PlayerState = {
              ...s.player,
              baseAttrs: { ...s.player.baseAttrs },
            };
            lost.grains += c.grains;
            const lvls = applyXp(lost, c.xp);
            set({
              player: lost,
              keys: s.keys - 1,
              battleLog: pushLog(s.battleLog, {
                id: `d${Date.now()}`,
                kind: 'dungeon',
                opponent: boss.name,
                won: false,
                gold: c.grains,
                xp: c.xp,
                honorDelta: 0,
                at: Date.now(),
              }),
            });
            return { grains: c.grains, xp: c.xp, levels: lvls, item: null };
          }

          const p: PlayerState = {
            ...s.player,
            baseAttrs: { ...s.player.baseAttrs },
            inventory: [...s.player.inventory],
          };
          const ev = eventOfDay(today());
          const t = talentEffects(p.talents ?? []);
          const grains = Math.round(
            boss.reward.grains * (1 + t.gold) * (ev.kind === 'grains' ? ev.mult : 1)
          );
          const xp = Math.round(
            boss.reward.xp *
              (1 + t.xp) *
              (1 + albumXpBonus(s.album.length)) *
              (s.passUntil > Date.now() ? 1.1 : 1) *
              (ev.kind === 'xp' ? ev.mult : 1)
          );
          p.grains += grains;
          p.piments += boss.reward.piments;
          const levels = applyXp(p, xp);
          let item: Item | null = null;
          if (p.inventory.length < 24) {
            item = generateItem(Math.max(p.level, boss.level), undefined, boss.reward.rarity);
            p.inventory.push(item);
          }
          trackEvent('boss_cleared', { floor, level: p.level });
          set({
            player: p,
            keys: s.keys - 1,
            dungeonFloor: floor,
            album: item ? addToAlbum(s.album, item) : s.album,
            foundMitik: s.foundMitik || item?.rarity === 'mitik',
            battleLog: pushLog(s.battleLog, {
              id: `d${Date.now()}`,
              kind: 'dungeon',
              opponent: boss.name,
              won: true,
              gold: grains,
              xp,
              honorDelta: 0,
              at: Date.now(),
            }),
          });
          return { grains, xp, levels, item };
        },

        claimSeason: () => {
          const s = get();
          if (!s.player || !s.seasonPending) return null;
          const tier = tierForRank(s.seasonPending.rank);
          set({
            player: {
              ...s.player,
              grains: s.player.grains + tier.grains,
              piments: s.player.piments + tier.piments,
            },
            seasonPending: null,
          });
          return { grains: tier.grains, piments: tier.piments };
        },

        buyPass: () => {
          const s = get();
          if (!s.player) return;
          const from = Math.max(Date.now(), s.passUntil);
          set({ passUntil: from + PASS_DAYS * 86_400_000 });
        },

        claimPassPiments: () => {
          const s = get();
          if (!s.player || s.passUntil < Date.now()) return 0;
          if (s.passClaimedDay === today()) return 0;
          set({
            player: {
              ...s.player,
              piments: s.player.piments + PASS_DAILY_PIMENTS,
            },
            passClaimedDay: today(),
          });
          return PASS_DAILY_PIMENTS;
        },

        buyStarterPack: () => {
          const s = get();
          if (!s.player || s.starterPackBought) return;
          set({
            player: {
              ...s.player,
              piments: s.player.piments + 300,
              grains: s.player.grains + 1500,
            },
            starterPackBought: true,
          });
          trackEvent('purchase', { sku: 'starter_pack' });
        },
      };
    },
    {
      name: 'batay-kok-save',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      // les sauvegardes d'avant la progression restent valides : le merge
      // shallow de zustand complète les nouveaux champs avec leurs défauts.
      migrate: (persisted) => persisted as GameState,
      partialize: ({ combatActive, onlineState, pendingDefenses, ...rest }) =>
        rest as GameState,
    }
  )
);

/** Adaptateur : l'état du store vers le contexte attendu par le moteur. */
export function isStepComplete(
  id: StepId,
  s: Pick<GameState, 'player' | 'stats' | 'foundMitik' | 'dungeonFloor'>
): boolean {
  const p = s.player;
  if (!p) return false;
  const st = { ...emptyStats(), ...s.stats };
  return stepComplete(id, {
    equippedCount: Object.keys(p.equipment).length,
    quests: st.quests,
    attrs: st.attrs,
    arenas: st.arenas,
    buys: st.buys,
    wins: p.wins,
    hasGuild: !!p.guildId,
    level: p.level,
    transport: p.transport,
    dungeonFloor: s.dungeonFloor,
    foundMitik: s.foundMitik,
  });
}

/** L'objectif courant du joueur : première étape non encaissée. */
export function currentStep(s: {
  player: PlayerState | null;
  stats: LifetimeStats;
  foundMitik: boolean;
  dungeonFloor: number;
  claimedSteps: StepId[];
}) {
  const def = STEPS.find((x) => !s.claimedSteps.includes(x.id));
  if (!def) return null;
  return { def, ready: isStepComplete(def.id, s) };
}

export function playerPower(p: PlayerState): number {
  const a = totalAttrs(p);
  return a.force + a.adresse + a.esprit + a.endurance + a.chance;
}
