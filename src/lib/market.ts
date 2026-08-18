import { Item, Rarity, SlotId } from '../game/types';
import { ensureSession } from './online';
import { supabase } from './supabase';

/**
 * Hôtel des ventes. La base ne fait que du dépôt : l'objet quitte le sak
 * local au moment de la mise en vente, et les grains ne changent de mains
 * qu'au passage suivant du vendeur.
 */

export interface Listing {
  id: string;
  item: Item;
  price: number;
  sellerName: string;
  isMine: boolean;
  createdAt: string;
}

export interface Quote {
  sales: number;
  median: number;
  min: number;
  max: number;
}

/** Commission de l'hôtel : évite le blanchiment de grains entre comptes. */
export const MARKET_FEE = 0.05;

export async function listItem(item: Item, price: number): Promise<boolean> {
  if (!supabase) return false;
  const id = await ensureSession();
  if (!id) return false;
  const { error } = await supabase.from('market_listings').insert({
    seller_id: id,
    item,
    slot: item.slot,
    rarity: item.rarity,
    item_level: item.level,
    price,
  });
  return !error;
}

export async function fetchListings(filter?: {
  slot?: SlotId;
  rarity?: Rarity;
  maxPrice?: number;
}): Promise<Listing[]> {
  if (!supabase) return [];
  const me = await ensureSession();
  let q = supabase
    .from('market_listings')
    .select('id, item, price, seller_id, created_at, koks!market_listings_seller_id_fkey(name)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(60);
  if (filter?.slot) q = q.eq('slot', filter.slot);
  if (filter?.rarity) q = q.eq('rarity', filter.rarity);
  if (filter?.maxPrice) q = q.lte('price', filter.maxPrice);

  const { data, error } = await q;
  if (error || !data) return [];
  return (data as unknown as ListingRow[]).map((r) => ({
    id: r.id,
    item: r.item,
    price: r.price,
    sellerName: r.koks?.name ?? 'in kok',
    isMine: r.seller_id === me,
    createdAt: r.created_at,
  }));
}

export async function buyListing(
  id: string
): Promise<{ ok: true; item: Item; price: number } | { ok: false; error: string }> {
  if (!supabase) return { ok: false, error: 'Zwé en lokal.' };
  const session = await ensureSession();
  if (!session) return { ok: false, error: 'Konèksyon inposib.' };
  const { data, error } = await supabase.rpc('buy_listing', { p_listing: id });
  if (error) {
    const m = error.message.toLowerCase();
    if (m.includes('déjà partí')) return { ok: false, error: 'Trop tar — la déjà partí !' };
    if (m.includes('prop zafèr')) return { ok: false, error: 'Sé out prop annons.' };
    return { ok: false, error: 'Lasha la pa marché.' };
  }
  const row = (data as { item: Item; price: number }[])?.[0];
  if (!row) return { ok: false, error: 'Lasha la pa marché.' };
  return { ok: true, item: row.item, price: row.price };
}

export async function cancelListing(id: string): Promise<Item | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('cancel_listing', { p_listing: id });
  if (error || !data) return null;
  return (data as { item: Item }[])[0]?.item ?? null;
}

/** Ventes conclues pendant l'absence du vendeur. */
export async function claimSales(): Promise<
  { name: string; price: number }[]
> {
  if (!supabase) return [];
  const id = await ensureSession();
  if (!id) return [];
  const { data, error } = await supabase.rpc('claim_market_sales');
  if (error || !data) return [];
  return (data as { item_name: string; price: number }[]).map((r) => ({
    name: r.item_name,
    price: r.price,
  }));
}

/** Cote d'un objet comparable : la référence pour fixer son prix. */
export async function fetchQuote(item: Item): Promise<Quote | null> {
  if (!supabase) return null;
  const bucket = Math.min(12, Math.max(1, Math.ceil(item.level / 5)));
  const { data, error } = await supabase
    .from('market_quotes')
    .select('sales, median_price, min_price, max_price')
    .eq('slot', item.slot)
    .eq('rarity', item.rarity)
    .eq('level_bucket', bucket)
    .maybeSingle();
  if (error || !data) return null;
  return {
    sales: data.sales as number,
    median: Math.round(data.median_price as number),
    min: data.min_price as number,
    max: data.max_price as number,
  };
}

interface ListingRow {
  id: string;
  item: Item;
  price: number;
  seller_id: string;
  created_at: string;
  koks: { name: string } | null;
}
