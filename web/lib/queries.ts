import { admin } from './supabase';

/**
 * Une fonction par écran. Chaque vue SQL répond à une question précise ;
 * on ne charge jamais plus que ce que la page affiche.
 */

/**
 * Une vue absente, une permission refusée ou un réseau coupé rendaient
 * exactement la même chose qu'un produit sans activité : des tableaux vides
 * et des tuiles à zéro. Sur un outil de décision, c'est le pire des bugs.
 */
export class QueryError extends Error {
  constructor(readonly view: string, message: string) {
    super(`${view} : ${message}`);
  }
}

async function view<T>(
  name: string,
  opts: { limit?: number; order?: { column: string; ascending?: boolean } } = {}
): Promise<T[]> {
  if (!admin) return [];
  let q = admin.from(name).select('*');
  // sans ORDER BY, Postgres ne garantit aucun ordre : un « top N » tiré d'un
  // LIMIT sans tri est arbitraire et change avec le plan d'exécution
  if (opts.order) q = q.order(opts.order.column, { ascending: opts.order.ascending ?? false });
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) {
    console.error(`[dashboard] lecture de ${name} :`, error.message);
    throw new QueryError(name, error.message);
  }
  return (data ?? []) as T[];
}

async function single<T>(name: string): Promise<T | null> {
  if (!admin) return null;
  const { data, error } = await admin.from(name).select('*').maybeSingle();
  if (error) {
    console.error(`[dashboard] lecture de ${name} :`, error.message);
    throw new QueryError(name, error.message);
  }
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
export const getDaily = () =>
  view<DailyRow>('stats_daily', { order: { column: 'day', ascending: true }, limit: 30 });
export const getEvents = () =>
  view<EventRow>('stats_events', { order: { column: 'total' }, limit: 40 });
export const getSignups = () =>
  view<SignupRow>('stats_signups', { order: { column: 'day', ascending: true }, limit: 30 });
export const getRetention = () =>
  view<RetentionRow>('stats_retention', { order: { column: 'day' }, limit: 30 });
export const getClasses = () =>
  view<ClassRow>('stats_classes', { order: { column: 'players' }, limit: 12 });
export const getPlayers = () =>
  view<PlayerRow>('stats_players', { order: { column: 'honor' }, limit: 300 });
export const getEconomy = () =>
  view<EconomyRow>('stats_economy', { order: { column: 'level_bucket', ascending: true }, limit: 12 });
export const getMarket = () =>
  view<MarketRow>('stats_market', { order: { column: 'vendus' }, limit: 12 });
export const getDungeon = () =>
  view<DungeonRow>('stats_dungeon', { order: { column: 'floor', ascending: true }, limit: 20 });
export const getTalents = () =>
  view<TalentRow>('stats_talents', { order: { column: 'picks' }, limit: 20 });
export const getPlatforms = () =>
  view<PlatformRow>('stats_platforms', { order: { column: 'players' }, limit: 20 });
export const getBattlesDaily = () =>
  view<BattleDayRow>('stats_battles_daily', { order: { column: 'day', ascending: true }, limit: 30 });
export const getMonetisation = () => single<MonetisationRow>('stats_monetisation');
export const getHourly = () =>
  view<HourRow>('stats_hourly', { order: { column: 'hour', ascending: true }, limit: 24 });
export const getLevels = () =>
  view<LevelRow>('stats_levels', { order: { column: 'level', ascending: true }, limit: 60 });

/** Annonces en cours, pour la page Marché. */
export async function getListings() {
  if (!admin) return [];
  const { data, error } = await admin
    .from('market_listings')
    .select('id, item, price, status, rarity, slot, item_level, created_at, sold_at')
    .order('created_at', { ascending: false })
    .limit(60);
  if (error) throw new QueryError('market_listings', error.message);
  type Row = {
    id: string; item: unknown; price: number; status: string;
    rarity: string; slot: string; item_level: number;
    created_at: string | null; sold_at: string | null;
  };
  // `item` est du jsonb : un nom qui serait un objet ferait tomber tout le
  // rendu React (« Objects are not valid as a React child »)
  return ((data ?? []) as Row[]).map((r) => {
    const name = (r.item as { name?: unknown } | null)?.name;
    return { ...r, itemName: typeof name === 'string' ? name : '—' };
  });
}

/** Derniers combats, pour la page Combats. */
export async function getRecentBattles() {
  if (!admin) return [];
  const { data, error } = await admin
    .from('arena_results')
    .select('id, attacker_won, honor_delta, created_at, attacker_id, defender_id')
    .order('created_at', { ascending: false })
    .limit(40);
  if (error) throw new QueryError('arena_results', error.message);
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
