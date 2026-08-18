import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

/**
 * Le multijoueur est *optionnel* : sans variables d'environnement, le client
 * vaut null et tout le jeu continue de tourner en local (bots simulés). Aucun
 * écran ne doit supposer qu'une session existe.
 */
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isOnlineEnabled = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isOnlineEnabled
  ? createClient(url as string, anonKey as string, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        // pas de redirection d'URL en natif
        detectSessionInUrl: false,
      },
    })
  : null;
