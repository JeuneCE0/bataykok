import { useEffect, useRef } from 'react';

import { useGame } from '../store/gameStore';
import { isOnlineEnabled, pushSnapshot } from './online';

/**
 * Publie le snapshot du kok quand quelque chose d'affrontable a changé.
 * Sans configuration Supabase, le hook ne fait strictement rien.
 */
export function useOnlineSync() {
  const player = useGame((s) => s.player);
  const setOnlineState = useGame((s) => s.setOnlineState);
  const signature = player
    ? `${player.level}:${player.honor}:${player.wins}:${player.losses}:${
        Object.keys(player.equipment).length
      }`
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
    void pushSnapshot(player).then((ok) => {
      setOnlineState(ok ? 'ok' : 'error');
      // un échec ne doit pas figer la signature : on retentera au prochain
      // changement, sinon une panne réseau condamnerait la session entière
      if (!ok) last.current = '';
    });
  }, [signature, player, setOnlineState]);
}
