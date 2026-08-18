import { createClient } from '@supabase/supabase-js';

/**
 * Lecture du tableau de bord. La clé de service ne quitte jamais le serveur :
 * toutes les pages qui l'utilisent sont rendues côté serveur.
 */
const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const configured = Boolean(url && serviceKey);

export const admin = configured
  ? createClient(url as string, serviceKey as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

export interface Overview {
  members: number;
  online_now: number;
  active_24h: number;
  new_7d: number;
  events_24h: number;
  sessions_24h: number;
  battles: number;
  sales: number;
  sales_volume: number;
  referrals: number;
}

export interface DailyRow {
  day: string;
  events: number;
  sessions: number;
  players: number;
}

export interface EventRow {
  name: string;
  total: number;
  sessions: number;
  last_seen: string;
}

export interface SignupRow {
  day: string;
  signups: number;
}

export interface LevelRow {
  level: number;
  players: number;
}

export async function loadDashboard() {
  if (!admin) return null;
  const [overview, daily, events, signups, levels] = await Promise.all([
    admin.from('stats_overview').select('*').maybeSingle(),
    admin.from('stats_daily').select('*'),
    admin.from('stats_events').select('*').limit(25),
    admin.from('stats_signups').select('*'),
    admin.from('stats_levels').select('*'),
  ]);
  return {
    overview: (overview.data ?? null) as Overview | null,
    daily: (daily.data ?? []) as DailyRow[],
    events: (events.data ?? []) as EventRow[],
    signups: (signups.data ?? []) as SignupRow[],
    levels: (levels.data ?? []) as LevelRow[],
  };
}
