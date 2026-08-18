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
  SlotId,
} from '../game/types';

const ARENA_COOLDOWN_MS = 2 * 60 * 1000; // 2 min pour le prototype

export interface QuestOutcome {
  gold: number;
  xp: number;
  item: Item | null;
  piments: number;
  levelsGained: number;
}

interface GameState {
  player: PlayerState | null;
  /** ordre du classement : ids de bots + 'me' */
  ladderOrder: string[];
  quests: Quest[];
  activeQuest: ActiveQuest | null;
  motivation: number;
  dodosToday: number;
  lastDaily: string;
  arenaNextAt: number;
  shop: Item[];
  guildLevel: number;
  lastOutcome: QuestOutcome | null;

  // actions
  createPlayer: (
    name: string,
    classId: ClassId,
    appearance: Appearance
  ) => void;
  resetGame: () => void;
  ensureDaily: () => void;
  buyAttr: (attr: AttrId) => void;
  rerollQuests: () => void;
  startQuest: (q: Quest) => void;
  cancelQuest: () => void;
  collectQuest: () => QuestOutcome | null;
  drinkDodo: () => void;
  refillMotivation: () => void;
  applyArenaResult: (won: boolean, opponentId: string) => { gold: number; xp: number; levels: number };
  skipArenaCooldown: () => void;
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
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultAttrs() {
  return { force: 10, adresse: 10, esprit: 10, endurance: 10, chance: 8 };
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

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      player: null,
      ladderOrder: [],
      quests: [],
      activeQuest: null,
      motivation: MAX_MOTIVATION,
      dodosToday: 0,
      lastDaily: today(),
      arenaNextAt: 0,
      shop: [],
      guildLevel: 0,
      lastOutcome: null,

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
          arenaNextAt: 0,
          guildLevel: 0,
          activeQuest: null,
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
          arenaNextAt: 0,
          shop: [],
          guildLevel: 0,
          lastOutcome: null,
        }),

      ensureDaily: () => {
        const s = get();
        if (s.lastDaily !== today() && s.player) {
          set({
            lastDaily: today(),
            motivation: MAX_MOTIVATION,
            dodosToday: 0,
            quests: s.activeQuest ? s.quests : generateQuests(s.player.level),
            shop: shopRotation(s.player.level),
          });
        }
      },

      buyAttr: (attr) => {
        const s = get();
        if (!s.player) return;
        const cost = attrCost(s.player.baseAttrs[attr]);
        if (s.player.grains < cost) return;
        const p = { ...s.player, baseAttrs: { ...s.player.baseAttrs } };
        p.grains -= cost;
        p.baseAttrs[attr] += 1;
        set({ player: p });
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
        const goldBonus =
          p.guildId ? 1 + (s.guildLevel * GUILD_GOLD_BONUS_PER_LEVEL) / 100 : 1;
        const xpBonus =
          p.guildId ? 1 + (s.guildLevel * GUILD_XP_BONUS_PER_LEVEL) / 100 : 1;
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
        const outcome: QuestOutcome = { gold, xp, item, piments, levelsGained: levels };
        set({
          player: p,
          activeQuest: null,
          quests: generateQuests(p.level),
          lastOutcome: outcome,
        });
        return outcome;
      },

      drinkDodo: () => {
        const s = get();
        if (!s.player) return;
        if (s.dodosToday >= MAX_DODOS_PER_DAY) return;
        if (s.player.piments < 1) return;
        set({
          player: { ...s.player, piments: s.player.piments - 1 },
          motivation: Math.min(MAX_MOTIVATION + 0, s.motivation + DODO_RESTORE),
          dodosToday: s.dodosToday + 1,
        });
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
        const p: PlayerState = { ...s.player, baseAttrs: { ...s.player.baseAttrs } };
        let gold = 0;
        let xp = 0;
        let levels = 0;
        let order = [...s.ladderOrder];
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
            // on prend la place de l'adversaire
            order.splice(myIdx, 1);
            order.splice(opIdx, 0, 'me');
          }
        } else {
          p.honor = Math.max(0, p.honor - 5);
          p.losses += 1;
        }
        p.rank = order.indexOf('me') + 1;
        set({
          player: p,
          ladderOrder: order,
          arenaNextAt: Date.now() + ARENA_COOLDOWN_MS,
        });
        return { gold, xp, levels };
      },

      skipArenaCooldown: () => {
        const s = get();
        if (!s.player || s.player.piments < 1) return;
        set({
          player: { ...s.player, piments: s.player.piments - 1 },
          arenaNextAt: 0,
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
        });
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
            grains: s.player.grains + grainsPerPiment(s.player.level) * piments,
          },
        });
      },

      addPiments: (n) => {
        const s = get();
        if (!s.player) return;
        set({ player: { ...s.player, piments: s.player.piments + n } });
      },
    }),
    {
      name: 'batay-kok-save',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function playerPower(p: PlayerState): number {
  const a = totalAttrs(p);
  return a.force + a.adresse + a.esprit + a.endurance + a.chance;
}
