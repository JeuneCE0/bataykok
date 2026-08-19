import { ClassId } from '../game/types';
import { ensureSession } from './online';
import { supabase } from './supabase';

/** État partagé d'une écurie — niveau, caisse, effectif réel. */
export interface GuildBoardRow {
  key: string;
  level: number;
  pot: number;
  threshold: number;
  totalDonated: number;
  members: number;
}

export interface RosterRow {
  id: string;
  name: string;
  classId: ClassId;
  level: number;
  honor: number;
  donated: number;
}

/** Le tableau des écuries : ce qu'on regarde avant de choisir la sienne. */
export async function fetchGuildBoard(): Promise<GuildBoardRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('guild_board')
    .select('guild_key, level, pot, threshold, total_donated, members');
  if (error || !data) return [];
  return data.map((r) => ({
    key: r.guild_key as string,
    level: r.level as number,
    pot: Number(r.pot),
    threshold: Number(r.threshold),
    totalDonated: Number(r.total_donated),
    members: Number(r.members),
  }));
}

/** Les membres d'une écurie, du plus gros contributeur au plus petit. */
export async function fetchRoster(guildKey: string, limit = 20): Promise<RosterRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('guild_roster')
    .select('id, name, class_id, level, honor, donated')
    .eq('guild_key', guildKey)
    .order('donated', { ascending: false })
    .order('honor', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    classId: r.class_id as ClassId,
    level: r.level as number,
    honor: r.honor as number,
    donated: Number(r.donated),
  }));
}

export interface DonateResult {
  level: number;
  pot: number;
  threshold: number;
  leveled: boolean;
}

/**
 * Verser à la caisse commune.
 *
 * Renvoie `null` sur refus du serveur (plafond journalier, hors écurie) — le
 * client ne doit alors pas débiter le joueur.
 */
export async function donateToGuild(amount: number): Promise<DonateResult | null> {
  if (!supabase) return null;
  const id = await ensureSession();
  if (!id) return null;
  const { data, error } = await supabase.rpc('donate_to_guild', { p_amount: amount });
  if (error || !data) return null;
  const row = (data as { level: number; pot: number; threshold: number; leveled: boolean }[])[0];
  if (!row) return null;
  return {
    level: row.level,
    pot: Number(row.pot),
    threshold: Number(row.threshold),
    leveled: row.leveled,
  };
}
