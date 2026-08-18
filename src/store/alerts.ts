import { compareToEquipped } from '../game/power';
import { TabId } from '../game/progress';
import { currentStep, useGame } from './gameStore';

/**
 * Pastilles d'appel à l'action sur la barre d'onglets : le joueur ne doit
 * jamais avoir à fouiller pour savoir où quelque chose l'attend.
 */
export function useAlerts(now: number): Record<TabId, boolean> {
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

  const none: Record<TabId, boolean> = {
    kok: false,
    quetes: false,
    rond: false,
    donjon: false,
    ecurie: false,
    bazar: false,
  };
  if (!player) return none;

  const step = currentStep({ player, stats, foundMitik, claimedSteps });
  const missionReady = missions.some((m) => !m.claimed && m.progress >= m.def.target);
  const upgradeInBag = player.inventory.some(
    (it) => compareToEquipped(it, player).diff > 0
  );
  const dealInShop = shop.some(
    (it) => it.price <= player.grains && compareToEquipped(it, player).diff > 0
  );

  return {
    kok: upgradeInBag || missionReady || !!step?.ready,
    quetes: !!activeQuest && now >= activeQuest.endsAt,
    rond: arenaTickets > 0,
    donjon: keys > 0 && dungeonFloor < 13,
    ecurie: !player.guildId,
    bazar: dealInShop,
  };
}
