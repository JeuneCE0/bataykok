import { useEffect, useMemo, useState } from 'react';

import { compareToEquipped } from '../game/power';
import { TabId } from '../game/progress';
import { currentStep, useGame } from './gameStore';

/**
 * Pastilles d'appel à l'action sur la barre d'onglets : le joueur ne doit
 * jamais avoir à fouiller pour savoir où quelque chose l'attend.
 */
export function useAlerts(): Record<TabId, boolean> {
  // Le seul besoin de temps réel, ce sont les échéances (quête finie, jeton
  // revenu). Cinq secondes suffisent, et seul ce composant se réveille.
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(t);
  }, []);

  const player = useGame((s) => s.player);
  const activeQuest = useGame((s) => s.activeQuest);
  const arenaTickets = useGame((s) => s.arenaTickets);
  const shop = useGame((s) => s.shop);
  const missions = useGame((s) => s.dailyMissions);
  const stats = useGame((s) => s.stats);
  const foundMitik = useGame((s) => s.foundMitik);
  const claimedSteps = useGame((s) => s.claimedSteps);
  const keys = useGame((s) => s.keys);
  const dungeonFloor = useGame((s) => s.dungeonFloor);

  // comparer tout le sak et toute la boutique coûte cher : on ne le refait
  // que si l'un des trois a bougé, pas à chaque battement d'horloge
  const upgrades = useMemo(() => {
    if (!player) return { inBag: false, inShop: false };
    return {
      inBag: player.inventory.some((it) => compareToEquipped(it, player).diff > 0),
      inShop: shop.some(
        (it) => it.price <= player.grains && compareToEquipped(it, player).diff > 0
      ),
    };
  }, [player, shop]);

  const none: Record<TabId, boolean> = {
    kok: false,
    quetes: false,
    rond: false,
    donjon: false,
    ecurie: false,
    bazar: false,
  };
  if (!player) return none;

  const step = currentStep({ player, stats, foundMitik, dungeonFloor, claimedSteps });
  const missionReady = missions.some((m) => !m.claimed && m.progress >= m.def.target);

  return {
    kok: upgrades.inBag || missionReady || !!step?.ready,
    quetes: !!activeQuest && now >= activeQuest.endsAt,
    rond: arenaTickets > 0,
    donjon: keys > 0 && dungeonFloor < 13,
    ecurie: !player.guildId,
    bazar: upgrades.inShop,
  };
}
