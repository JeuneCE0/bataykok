import { supabase } from './supabase';
import { ensureSession } from './online';

/**
 * Parrainage. Le code vit côté serveur (unicité), les récompenses se versent
 * côté client (les piments ne sont pas en base) — d'où le marquage
 * `referrer_rewarded` qui empêche d'encaisser deux fois le même filleul.
 */

/** ce que touche le filleul en saisissant un code */
export const REFEREE_BONUS = { piments: 40, grains: 500 };
/** ce que touche le parrain, par filleul */
export const REFERRER_BONUS = { piments: 25, grains: 0 };

export interface ReferralState {
  code: string | null;
  referredBy: string | null;
  godchildren: number;
}

export async function fetchReferralState(): Promise<ReferralState | null> {
  if (!supabase) return null;
  const id = await ensureSession();
  if (!id) return null;

  const [me, parent, kids] = await Promise.all([
    supabase.from('koks').select('referral_code').eq('id', id).maybeSingle(),
    supabase.from('referrals').select('referrer_id').eq('referee_id', id).maybeSingle(),
    supabase.from('referrals').select('referee_id').eq('referrer_id', id),
  ]);

  let referredBy: string | null = null;
  if (parent.data?.referrer_id) {
    const { data } = await supabase
      .from('koks')
      .select('name')
      .eq('id', parent.data.referrer_id)
      .maybeSingle();
    referredBy = data?.name ?? 'in kok';
  }

  return {
    code: me.data?.referral_code ?? null,
    referredBy,
    godchildren: kids.data?.length ?? 0,
  };
}

export async function redeemReferral(
  code: string
): Promise<{ ok: true; referrer: string } | { ok: false; error: string }> {
  if (!supabase) return { ok: false, error: 'Zwé en lokal — pa possib pou lo moman.' };
  const id = await ensureSession();
  if (!id) return { ok: false, error: 'Konèksyon inposib.' };
  const { data, error } = await supabase.rpc('redeem_referral', {
    p_code: code.trim(),
  });
  if (error) return { ok: false, error: humanize(error.message) };
  const name = (data as { referrer_name: string }[])?.[0]?.referrer_name;
  return { ok: true, referrer: name ?? 'out parin' };
}

/** Filleuls pas encore payés au parrain. */
export async function claimReferralRewards(): Promise<
  { name: string; level: number }[]
> {
  if (!supabase) return [];
  const id = await ensureSession();
  if (!id) return [];
  const { data, error } = await supabase.rpc('claim_referral_rewards');
  if (error || !data) return [];
  return (data as { referee_name: string; referee_level: number }[]).map((r) => ({
    name: r.referee_name,
    level: r.referee_level,
  }));
}

function humanize(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('déjà in parin')) return 'Ou la déjà in parin.';
  if (m.includes('inkoni')) return 'Sé kod-là i egziste pa.';
  if (m.includes('ou-mem')) return 'Ou pé pa parrainn a ou-mem !';
  return 'Sa la pa marché. Rési ankor.';
}
