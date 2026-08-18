import { admin } from './supabase';

/**
 * Une fonction par écran. Chaque vue SQL répond à une question précise ;
 * on ne charge jamais plus que ce que la page affiche.
 */

async function view<T>(name: string, limit?: number): Promise<T[]> {
  if (!admin) return [];
  let q = admin.from(name).select('*');
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return (data ?? []) as T[];
}

async function single<T>(name: string): Promise<T | null> {
  if (!admin) return null;
  const { data } = await admin.from(name).select('*').maybeSingle();
  return (data ?? null) as T | null;
}

export interface Overview {
  members: number; online_now: number; active_24h: number; active_7d: number;
  new_24h: number; new_7d: number; events_24h: number; sessions_24h: number;
  battles: number; battles_24h: number; sales: number; listings_open: number;
  sales_volume: number; referrals: number; grains_total: number;
  piments_total: number; avg_level: number; guilds: number;
}
export interface DailyRow { day: string; events: number; sessions: number; players: number }
export interface EventRow { name: string; total: number; sessions: number; last_seen: string }
export interface SignupRow { day: string; signups: number }
export interface RetentionRow { day: string; signups: number; d1: number; d7: number }
export interface ClassRow { class_id: string; players: number; avg_level: number; wins: number; losses: number; winrate: number }
export interface PlayerRow {
  id: string; name: string; class_id: string; level: number; honor: number;
  wins: number; losses: number; power: number; grains: number; piments: number;
  dungeon_floor: number; transport: number; equipped: number; album_size: number;
  talents: number; platform: string | null; app_version: string | null;
  created_at: string; updated_at: string; online: boolean;
}
export interface EconomyRow { level_bucket: number; players: number; avg_grains: number; avg_piments: number; avg_equipped: number; avg_floor: number }
export interface MarketRow { rarity: string; en_vente: number; vendus: number; prix_moyen: number; prix_min: number; prix_max: number }
export interface DungeonRow { floor: number; players: number }
export interface TalentRow { talent: string; picks: number }
export interface PlatformRow { platform: string; version: string; players: number }
export interface BattleDayRow { day: string; battles: number; attacker_wins: number }
export interface MonetisationRow { ads_started: number; ads_completed: number; purchases: number; ad_users: number; referrals: number; parrains: number }
export interface HourRow { hour: number; events: number; sessions: number }
export interface LevelRow { level: number; players: number }

export const getOverview = () => single<Overview>('stats_overview');
export const getDaily = () => view<DailyRow>('stats_daily');
export const getEvents = () => view<EventRow>('stats_events', 40);
export const getSignups = () => view<SignupRow>('stats_signups');
export const getRetention = () => view<RetentionRow>('stats_retention', 30);
export const getClasses = () => view<ClassRow>('stats_classes');
export const getPlayers = () => view<PlayerRow>('stats_players', 300);
export const getEconomy = () => view<EconomyRow>('stats_economy');
export const getMarket = () => view<MarketRow>('stats_market');
export const getDungeon = () => view<DungeonRow>('stats_dungeon');
export const getTalents = () => view<TalentRow>('stats_talents');
export const getPlatforms = () => view<PlatformRow>('stats_platforms');
export const getBattlesDaily = () => view<BattleDayRow>('stats_battles_daily');
export const getMonetisation = () => single<MonetisationRow>('stats_monetisation');
export const getHourly = () => view<HourRow>('stats_hourly');
export const getLevels = () => view<LevelRow>('stats_levels');

/** Annonces en cours, pour la page Marché. */
export async function getListings() {
  if (!admin) return [];
  const { data } = await admin
    .from('market_listings')
    .select('id, item, price, status, rarity, slot, item_level, created_at, sold_at')
    .order('created_at', { ascending: false })
    .limit(60);
  return (data ?? []) as {
    id: string; item: { name: string }; price: number; status: string;
    rarity: string; slot: string; item_level: number;
    created_at: string; sold_at: string | null;
  }[];
}

/** Derniers combats, pour la page Combats. */
export async function getRecentBattles() {
  if (!admin) return [];
  const { data } = await admin
    .from('arena_results')
    .select('id, attacker_won, honor_delta, created_at, attacker_id, defender_id')
    .order('created_at', { ascending: false })
    .limit(40);
  const rows = (data ?? []) as {
    id: string; attacker_won: boolean; honor_delta: number; created_at: string;
    attacker_id: string; defender_id: string;
  }[];
  if (rows.length === 0) return [];
  const ids = [...new Set(rows.flatMap((r) => [r.attacker_id, r.defender_id]))];
  const { data: koks } = await admin!.from('koks').select('id, name').in('id', ids);
  const byId = new Map((koks ?? []).map((k) => [k.id as string, k.name as string]));
  return rows.map((r) => ({
    ...r,
    attacker: byId.get(r.attacker_id) ?? '—',
    defender: byId.get(r.defender_id) ?? '—',
  }));
}
