import { playerArmor, playerToFighter, totalAttrs } from '../game/formulas';
import { kokPower } from '../game/power';
import { Appearance, Attributes, ClassId, Fighter, PlayerState } from '../game/types';
import { Platform } from 'react-native';

import { isOnlineEnabled, supabase } from './supabase';

const APP_VERSION =
  (require('../../app.json') as { expo: { version: string } }).expo.version;

/**
 * Multijoueur asynchrone : on publie un *snapshot* de son kok, et on affronte
 * ceux des autres. Rien n'est temps réel, donc rien ne casse si le réseau
 * tombe — l'app retombe sur les adversaires simulés.
 */

export interface OnlineKok {
  id: string;
  name: string;
  classId: ClassId;
  level: number;
  appearance: Appearance;
  attrs: Attributes;
  weaponMin: number;
  weaponMax: number;
  armor: number;
  power: number;
  honor: number;
  rank: number;
}

/**
 * Session anonyme : personne ne crée de compte pour jouer à un jeu de coqs.
 *
 * Deux pièges, tous deux payés en comptes fantômes (un kok orphelin de plus
 * dans le classement à chaque fois) :
 *  - supabase-js restaure la session depuis AsyncStorage de façon asynchrone,
 *    donc un `getSession()` trop précoce renvoie null ;
 *  - deux appelants simultanés (le hook de sync et l'écran du rond) créeraient
 *    chacun leur compte.
 * D'où la relance courte et la promesse partagée.
 */
let sessionPromise: Promise<string | null> | null = null;

async function resolveSession(): Promise<string | null> {
  if (!supabase) return null;
  try {
    for (let i = 0; i < 3; i++) {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user.id) return data.session.user.id;
      if (i < 2) await new Promise((r) => setTimeout(r, 250));
    }
    const { data: signed, error } = await supabase.auth.signInAnonymously();
    if (error) return null;
    return signed.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function ensureSession(): Promise<string | null> {
  if (!supabase) return null;
  if (!sessionPromise) {
    sessionPromise = resolveSession().then((id) => {
      // un échec ne doit pas condamner les tentatives suivantes
      if (!id) sessionPromise = null;
      return id;
    });
  }
  return sessionPromise;
}

/**
 * Une session peut rester valide localement alors que le compte n'existe plus
 * côté serveur (purge, changement de projet, reset de base). Sans ça, l'app
 * reste « connectée » et échoue en silence pour toujours.
 */
async function resetSession(): Promise<string | null> {
  sessionPromise = null;
  try {
    await supabase?.auth.signOut({ scope: 'local' });
  } catch {
    // rien à faire : on repart de toute façon sur une nouvelle session
  }
  return ensureSession();
}

/** Codes qui trahissent une session morte plutôt qu'une vraie erreur métier. */
function isStaleSession(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const code = error.code ?? '';
  const msg = (error.message ?? '').toLowerCase();
  return (
    code === '23503' || // le compte référencé n'existe plus
    code === '42501' || // RLS : l'uid ne correspond à rien
    code === 'PGRST301' || // JWT expiré
    msg.includes('jwt') ||
    msg.includes('not authorized')
  );
}

function snapshotRow(id: string, p: PlayerState, extra?: SnapshotExtra) {
  const f = playerToFighter(p);
  return {
    id,
    name: p.name,
    class_id: p.classId,
    level: p.level,
    appearance: p.appearance,
    attrs: totalAttrs(p),
    weapon_min: f.weaponMin,
    weapon_max: f.weaponMax,
    armor: playerArmor(p),
    power: kokPower(p),
    // `honor` est absent volontairement : il appartient au serveur depuis la
    // migration 0010. Le publier écrasait la perte d'honneur inscrite par
    // `submit_arena_result` pendant qu'on était hors ligne — aucune défense
    // perdue n'a jamais coûté un point à personne.
    wins: p.wins,
    losses: p.losses,
    // pilotage : économie et progression, rien de personnel
    grains: p.grains,
    piments: p.piments,
    talents: p.talents ?? [],
    transport: p.transport,
    guild_key: p.guildId,
    equipped: Object.keys(p.equipment).length,
    dungeon_floor: extra?.dungeonFloor ?? 0,
    album_size: extra?.albumSize ?? 0,
    platform: Platform.OS,
    app_version: APP_VERSION,
    updated_at: new Date().toISOString(),
  };
}

export interface SnapshotExtra {
  dungeonFloor?: number;
  albumSize?: number;
}

/** Publie l'état du kok. N'interrompt jamais la partie en cas d'échec. */
export async function pushSnapshot(
  p: PlayerState,
  extra?: SnapshotExtra
): Promise<boolean> {
  if (!supabase) return false;
  let id = await ensureSession();
  if (!id) return false;

  let { error } = await supabase
    .from('koks')
    .upsert(snapshotRow(id, p, extra), { onConflict: 'id' });

  if (error && isStaleSession(error)) {
    id = await resetSession();
    if (!id) return false;
    ({ error } = await supabase
      .from('koks')
      .upsert(snapshotRow(id, p, extra), { onConflict: 'id' }));
  }
  return !error;
}

/** Les koks juste au-dessus de soi au classement — les cibles utiles. */
export async function fetchRivals(limit = 3): Promise<OnlineKok[]> {
  if (!supabase) return [];
  const id = await ensureSession();
  if (!id) return [];

  const me = await supabase
    .from('ladder')
    .select('rank, honor')
    .eq('id', id)
    .maybeSingle();
  const myHonor = me.data?.honor ?? 0;

  const { data, error } = await supabase
    .from('ladder')
    .select(
      'id, name, class_id, level, appearance, attrs, weapon_min, weapon_max, armor, power, honor, rank'
    )
    .gt('honor', myHonor)
    .neq('id', id)
    .order('honor', { ascending: true })
    .limit(limit);
  if (error || !data) return [];
  return data.map(toOnlineKok);
}

export async function fetchTopLadder(limit = 30): Promise<OnlineKok[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('ladder')
    .select(
      'id, name, class_id, level, appearance, attrs, weapon_min, weapon_max, armor, power, honor, rank'
    )
    .order('rank', { ascending: true })
    .limit(limit);
  if (error || !data) return [];
  return data.map(toOnlineKok);
}

/** Enregistre l'issue d'une batay et renvoie le nouvel honneur. */
export async function submitResult(
  defenderId: string,
  won: boolean
): Promise<number | null> {
  if (!supabase) return null;
  const id = await ensureSession();
  if (!id) return null;
  const { data, error } = await supabase.rpc('submit_arena_result', {
    p_defender: defenderId,
    p_attacker_won: won,
  });
  if (error) {
    // le plus souvent : le kok de l'attaquant n'est pas encore publié
    if (isStaleSession(error)) await resetSession();
    return null;
  }
  if (!data?.length) return null;
  return data[0].new_honor ?? null;
}

export interface DefenseLog {
  id: string;
  attackerName: string;
  attackerLevel: number;
  attackerClass: ClassId;
  /** true = l'attaquant a gagné, donc le kok a perdu sa défense */
  attackerWon: boolean;
  honorDelta: number;
  happenedAt: string;
}

/**
 * Relève les batays subies pendant l'absence, et les marque lues d'un même
 * geste : les grains se versent côté client, il ne faut pas pouvoir les
 * encaisser deux fois.
 */
export async function claimDefenses(): Promise<DefenseLog[]> {
  if (!supabase) return [];
  const id = await ensureSession();
  if (!id) return [];
  const { data, error } = await supabase.rpc('claim_defenses');
  if (error || !data) return [];
  return (data as DefenseRow[]).map((r) => ({
    id: r.id,
    attackerName: r.attacker_name,
    attackerLevel: r.attacker_level,
    attackerClass: r.attacker_class as ClassId,
    attackerWon: r.attacker_won,
    honorDelta: r.honor_delta,
    happenedAt: r.happened_at,
  }));
}

/**
 * L'honneur fait autorité côté serveur : il faut réaligner le local. Le sommet
 * vient avec, sinon le palier acquis se perdrait à chaque reconnexion.
 */
export async function fetchMyHonor(): Promise<{ honor: number; peak: number } | null> {
  if (!supabase) return null;
  const id = await ensureSession();
  if (!id) return null;
  const { data, error } = await supabase
    .from('koks')
    .select('honor, honor_peak')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return { honor: data.honor as number, peak: (data.honor_peak as number) ?? data.honor };
}

export function onlineToFighter(k: OnlineKok): Fighter {
  return {
    name: k.name,
    level: k.level,
    classId: k.classId,
    attrs: k.attrs,
    weaponMin: k.weaponMin,
    weaponMax: k.weaponMax,
    armor: k.armor,
    appearance: k.appearance,
  };
}

export { isOnlineEnabled };

interface DefenseRow {
  id: string;
  attacker_name: string;
  attacker_level: number;
  attacker_class: string;
  attacker_won: boolean;
  honor_delta: number;
  happened_at: string;
}

interface LadderRow {
  id: string;
  name: string;
  class_id: string;
  level: number;
  appearance: Appearance;
  attrs: Attributes;
  weapon_min: number;
  weapon_max: number;
  armor: number;
  power: number;
  honor: number;
  rank: number;
}

function toOnlineKok(r: LadderRow): OnlineKok {
  return {
    id: r.id,
    name: r.name,
    classId: r.class_id as ClassId,
    level: r.level,
    appearance: r.appearance,
    attrs: r.attrs,
    weaponMin: r.weapon_min,
    weaponMax: r.weapon_max,
    armor: r.armor,
    power: r.power,
    honor: r.honor,
    rank: r.rank,
  };
}
