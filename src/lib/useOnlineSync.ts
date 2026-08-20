import { useEffect, useRef } from 'react';

import { useGame } from '../store/gameStore';
import { fetchMyGuildLevel } from './guild';
import { claimDefenses, fetchMyHonor, isOnlineEnabled, pushSnapshot } from './online';

/**
 * Publie le snapshot du kok quand quelque chose d'affrontable a changé.
 * Sans configuration Supabase, le hook ne fait strictement rien.
 */
export function useOnlineSync() {
  const player = useGame((s) => s.player);
  const dungeonFloor = useGame((s) => s.dungeonFloor);
  const albumSize = useGame((s) => s.album.length);
  const setOnlineState = useGame((s) => s.setOnlineState);
  const applyDefenses = useGame((s) => s.applyDefenses);
  const setGuildLevel = useGame((s) => s.setGuildLevel);
  const nonce = useGame((s) => s.onlineNonce);
  const claimed = useRef(false);
  // L'écurie fait partie de la signature : sans elle, rejoindre une écurie ne
  // remontait pas au serveur avant le prochain changement de niveau ou de
  // grains — et `donate_to_guild` refusait, puisque le serveur ignorait encore
  // que le joueur en avait une.
  const signature = player
    ? `${player.level}:${player.honor}:${player.wins}:${player.losses}:${
        Object.keys(player.equipment).length
      }:${dungeonFloor}:${albumSize}:${Math.round(player.grains / 500)}:${
        player.guildId ?? '-'
      }:${nonce}`
    : '';
  const last = useRef<string>('');

  useEffect(() => {
    if (!isOnlineEnabled || !player) {
      setOnlineState('off');
      return;
    }
    if (signature === last.current) return;
    last.current = signature;
    setOnlineState('sync');
    void pushSnapshot(player, { dungeonFloor, albumSize }).then(async (ok) => {
      setOnlineState(ok ? 'ok' : 'error');
      // un échec ne doit pas figer la signature : on retentera au prochain
      // changement, sinon une panne réseau condamnerait la session entière
      if (!ok) {
        last.current = '';
        return;
      }
      // une seule relève par lancement : le snapshot doit être publié avant,
      // sinon le serveur ne sait pas encore qui nous sommes
      if (claimed.current) return;
      claimed.current = true;
      // Le niveau d'écurie est partagé et sert de bonus aux quêtes : le lire
      // seulement à l'ouverture de l'écran laissait le bonus périmé pour qui
      // n'y va jamais.
      const [logs, honor, guildLevel] = await Promise.all([
        claimDefenses(),
        fetchMyHonor(),
        fetchMyGuildLevel(player.guildId),
      ]);
      applyDefenses(logs, honor);
      if (guildLevel !== null) setGuildLevel(guildLevel);
    });
  }, [
    signature,
    player,
    dungeonFloor,
    albumSize,
    setOnlineState,
    applyDefenses,
    setGuildLevel,
  ]);
}
