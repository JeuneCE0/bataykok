import * as Notifications from 'expo-notifications';

/**
 * Rappels locaux : le joueur n'a aucune raison de rouvrir l'app tant qu'il ne
 * sait pas que sa quête est finie. Tout est local (aucun serveur requis) —
 * les push distantes arriveront avec le backend V1.
 */

let configured = false;

function configure() {
  if (configured) return;
  configured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: true,
    }),
  });
}

export async function askNotificationPermission(): Promise<boolean> {
  try {
    configure();
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  } catch {
    return false;
  }
}

async function schedule(
  id: string,
  seconds: number,
  title: string,
  body: string
) {
  if (seconds < 5) return;
  try {
    configure();
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) return;
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: { title, body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.round(seconds),
      },
    });
  } catch {
    // pas de notif = pas de crash : le jeu reste jouable
  }
}

export function scheduleQuestDone(seconds: number, questTitle: string) {
  void schedule(
    'quest-done',
    seconds,
    '🐓 Out kok lé rentré !',
    `« ${questTitle} » lé fini. Vien chercher ta récompense !`
  );
}

export function cancelQuestReminder() {
  Notifications.cancelScheduledNotificationAsync('quest-done').catch(() => {});
}

export function scheduleArenaReady(seconds: number) {
  void schedule(
    'arena-ready',
    seconds,
    '⚔️ Le rond i attend a ou',
    'Ton kok la repri son souf. Anon batayé !'
  );
}
