import { Platform } from 'react-native';

import { ensureSession } from './online';
import { supabase } from './supabase';

/**
 * Collecte produit. Trois règles :
 *  - jamais bloquer le jeu (tout est best-effort, jamais attendu) ;
 *  - envoyer par paquets, pas un appel réseau par tap ;
 *  - aucune donnée personnelle : un identifiant de session tiré au hasard,
 *    l'id du kok, et le nom de l'événement.
 */

interface QueuedEvent {
  name: string;
  props: Record<string, string | number | boolean>;
  at: string;
}

const FLUSH_AFTER = 8;
const FLUSH_EVERY_MS = 20_000;

let queue: QueuedEvent[] = [];
let timer: ReturnType<typeof setInterval> | null = null;

/** identifiant de session : durée de vie du lancement, rien de persistant */
const sessionId = `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export function trackEvent(
  name: string,
  props: Record<string, string | number | boolean> = {}
) {
  if (!supabase) return;
  queue.push({ name, props, at: new Date().toISOString() });
  if (queue.length >= FLUSH_AFTER) void flushEvents();
  if (!timer) {
    timer = setInterval(() => void flushEvents(), FLUSH_EVERY_MS);
  }
}

export async function flushEvents(): Promise<void> {
  if (!supabase || queue.length === 0) return;
  const batch = queue;
  queue = [];
  try {
    const kokId = await ensureSession();
    const rows = batch.map((e) => ({
      kok_id: kokId,
      session_id: sessionId,
      name: e.name,
      props: e.props,
      platform: Platform.OS,
      created_at: e.at,
    }));
    const { error } = await supabase.from('app_events').insert(rows);
    // en cas d'échec, on ne rejoue qu'une fois : mieux vaut perdre une mesure
    // qu'accumuler une file sans fin en pleine panne réseau
    if (error && queue.length < FLUSH_AFTER) queue = [...batch.slice(-FLUSH_AFTER), ...queue];
  } catch {
    // silence : l'analytique ne doit jamais remonter à l'écran
  }
}

export function stopAnalytics() {
  if (timer) clearInterval(timer);
  timer = null;
  void flushEvents();
}
