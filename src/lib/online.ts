import { playerArmor, playerToFighter, totalAttrs } from '../game/formulas';
import { kokPower } from '../game/power';
import { Appearance, Attributes, ClassId, Fighter, PlayerState } from '../game/types';
import { isOnlineEnabled, supabase } from './supabase';

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

/** Session anonyme : personne ne crée de compte pour jouer à un jeu de coqs. */
export async function ensureSession(): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user.id) return data.session.user.id;
    const { data: signed, error } = await supabase.auth.signInAnonymously();
    if (error) return null;
    return signed.user?.id ?? null;
  } catch {
    return null;
  }
}

/** Publie l'état du kok. Silencieux en cas d'échec : le jeu prime. */
export async function pushSnapshot(p: PlayerState): Promise<boolean> {
  if (!supabase) return false;
  const id = await ensureSession();
  if (!id) return false;
  const f = playerToFighter(p);
  const { error } = await supabase.from('koks').upsert(
    {
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
      honor: p.honor,
      wins: p.wins,
      losses: p.losses,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );
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
  if (error || !data?.length) return null;
  return data[0].new_honor ?? null;
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
