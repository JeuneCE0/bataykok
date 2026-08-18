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
} from '../game/formulas';
import {
  GUILD_GOLD_BONUS_PER_LEVEL,
  GUILD_XP_BONUS_PER_LEVEL,
  guildUpgradeCost,
} from '../game/guilds';
import { generateItem, shopRotation } from '../game/items';
import { compareToEquipped } from '../game/power';
import {
  AD_COOLDOWN_MS,
  AdKind,
  adGrains,
  DAILY_CHEST,
  MAX_ADS_PER_DAY,
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

/**
 * Jetons de batay plutôt qu'un cooldown sec : le joueur peut enchaîner trois
 * combats d'affilée (le pic de plaisir du jeu) et la recharge ne bloque que
 * les sessions longues. Même friction à l'heure, bien meilleur ressenti.
 */
export const MAX_ARENA_TICKETS = 3;
export const ARENA_TICKET_MS = 2 * 60 * 1000;

export interface QuestOutcome {
  gold: number;
  xp: number;
  item: Item | null;
  piments: number;
  levelsGained: number;
  doubled: boolean;
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
    opponentId: string
  ) => { gold: number; xp: number; levels: number };
  buyArenaTicket: () => void;
  refreshShop: (payWithPiment: boolean) => void;
  buyItem: (item: Item) => void;
  equipItem: (item: Item) => void;
  sellItem: (item: Item) => void;
  joinGuild: (guildId: string) => void;
  leaveGuild: () => void;
  donateGuild: (grains: number) => void;
  buyTransport: (index: number) => void;
  buyGrains: (piments: number) => void;
  addPiments: (n: number) => void;
  claimStep: (id: StepId) => void;
  claimMission: (missionId: string) => void;
  claimDailyChest: () => void;
  claimStreak: () => { grains: number; piments: number } | null;
  watchAd: (kind: AdKind) => boolean;
  buyStarterPack: () => void;
  setCombatActive: (v: boolean) => void;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterday(): string {
  return new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
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
        arenaTickets: MAX_ARENA_TICKETS,
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
            rank: ladder.length,
            wins: 0,
            losses: 0,
            guildId: null,
            transport: 0,
          };
          set({
            player: p,
            ladderOrder: ladder,
            quests: generateQuests(1),
            shop: shopRotation(1),
            motivation: MAX_MOTIVATION,
            dodosToday: 0,
            lastDaily: today(),
            arenaTickets: MAX_ARENA_TICKETS,
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
            arenaTickets: MAX_ARENA_TICKETS,
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
            (sum, it) => sum + Math.round(it.price * 0.4),
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
          if (s.arenaTickets >= MAX_ARENA_TICKETS) return;
          const now = Date.now();
          if (!s.nextTicketAt || now < s.nextTicketAt) return;
          const gained =
            1 + Math.floor((now - s.nextTicketAt) / ARENA_TICKET_MS);
          const tickets = Math.min(MAX_ARENA_TICKETS, s.arenaTickets + gained);
          set({
            arenaTickets: tickets,
            nextTicketAt:
              tickets >= MAX_ARENA_TICKETS ? 0 : now + ARENA_TICKET_MS,
          });
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
          const reduction = TRANSPORTS[s.player.transport].reduction;
          const dur = Math.round(q.durationSec * (1 - reduction));
          set({
            motivation: s.motivation - q.motivationCost,
            activeQuest: { quest: q, endsAt: Date.now() + dur * 1000 },
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
          const goldBonus = p.guildId
            ? 1 + (s.guildLevel * GUILD_GOLD_BONUS_PER_LEVEL) / 100
            : 1;
          const xpBonus = p.guildId
            ? 1 + (s.guildLevel * GUILD_XP_BONUS_PER_LEVEL) / 100
            : 1;
          const gold = Math.round(q.gold * goldBonus);
          const xp = Math.round(q.xp * xpBonus);
          p.grains += gold;
          const levels = applyXp(p, xp);
          let item: Item | null = null;
          if (Math.random() < q.itemChance && p.inventory.length < 24) {
            item = generateItem(p.level);
            p.inventory.push(item);
          }
          let piments = 0;
          if (Math.random() < q.pimentChance) {
            piments = 1;
            p.piments += 1;
          }
          const outcome: QuestOutcome = {
            gold,
            xp,
            item,
            piments,
            levelsGained: levels,
            doubled: false,
          };
          set({
            player: p,
            activeQuest: null,
            quests: generateQuests(p.level),
            lastOutcome: outcome,
            foundMitik: s.foundMitik || item?.rarity === 'mitik',
          });
          track('quest');
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

        applyArenaResult: (won, opponentId) => {
          const s = get();
          if (!s.player) return { gold: 0, xp: 0, levels: 0 };
          const p: PlayerState = {
            ...s.player,
            baseAttrs: { ...s.player.baseAttrs },
          };
          let gold = 0;
          let xp = 0;
          let levels = 0;
          const order = [...s.ladderOrder];
          const myIdx = order.indexOf('me');
          const opIdx = order.indexOf(opponentId);
          if (won) {
            gold = arenaGold(p.level);
            xp = arenaXp(p.level);
            p.grains += gold;
            levels = applyXp(p, xp);
            p.honor += 8;
            p.wins += 1;
            if (opIdx >= 0 && opIdx < myIdx) {
              order.splice(myIdx, 1);
              order.splice(opIdx, 0, 'me');
            }
          } else {
            p.honor = Math.max(0, p.honor - 5);
            p.losses += 1;
          }
          p.rank = order.indexOf('me') + 1;
          const tickets = Math.max(0, s.arenaTickets - 1);
          set({
            player: p,
            ladderOrder: order,
            arenaTickets: tickets,
            nextTicketAt:
              tickets >= MAX_ARENA_TICKETS
                ? 0
                : s.nextTicketAt || Date.now() + ARENA_TICKET_MS,
          });
          track('arena');
          if (won) track('win');
          return { gold, xp, levels };
        },

        buyArenaTicket: () => {
          const s = get();
          if (!s.player || s.player.piments < 1) return;
          if (s.arenaTickets >= MAX_ARENA_TICKETS) return;
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
              grains: s.player.grains + Math.round(item.price * 0.4),
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
          } else if (kind === 'arena') {
            set({
              ...spend,
              arenaTickets: Math.min(MAX_ARENA_TICKETS, s.arenaTickets + 1),
            });
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
      partialize: ({ combatActive, ...rest }) => rest as GameState,
    }
  )
);

/** Une étape est franchie quand son objectif de jeu est atteint. */
export function isStepComplete(
  id: StepId,
  s: Pick<GameState, 'player' | 'stats' | 'foundMitik'>
): boolean {
  const p = s.player;
  if (!p) return false;
  const st = { ...emptyStats(), ...s.stats };
  switch (id) {
    case 'equip':
      return Object.keys(p.equipment).length > 0;
    case 'quest':
      return st.quests >= 1;
    case 'attr':
      return st.attrs >= 1;
    case 'arena':
      return st.arenas >= 1;
    case 'shop':
      return st.buys >= 1;
    case 'win':
      return p.wins >= 1;
    case 'guild':
      return !!p.guildId;
    case 'level3':
      return p.level >= 3;
    case 'transport':
      return p.transport > 0;
    case 'level5':
      return p.level >= 5;
    case 'mitik':
      return s.foundMitik;
    default:
      return false;
  }
}

/** L'objectif courant du joueur : première étape non encaissée. */
export function currentStep(s: {
  player: PlayerState | null;
  stats: LifetimeStats;
  foundMitik: boolean;
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
