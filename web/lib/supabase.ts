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
