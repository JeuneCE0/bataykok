import { AdKind } from '../game/progress';

/**
 * Pubs récompensées (AdMob).
 *
 * Le SDK est un module natif : dans Expo Go il n'existe pas et son import
 * lève. Tout passe donc par cette porte — `pubsReelles` dit si le vrai SDK
 * répond, et l'appelant retombe sinon sur la simulation, qui reste le seul
 * moyen de travailler l'équilibrage sans build natif.
 *
 * Les identifiants de blocs vivent dans l'environnement, jamais dans le code :
 * passer du test au réel est un changement de configuration, pas de version.
 */
type Sdk = typeof import('react-native-google-mobile-ads');

let sdk: Sdk | null = null;
try {
  sdk = require('react-native-google-mobile-ads') as Sdk;
} catch {
  sdk = null;
}

export const pubsReelles = sdk !== null;

/**
 * Un bloc par emplacement : sans ça, le rapport AdMob agrège tout et on ne
 * peut pas savoir lequel mérite de rester.
 */
const UNITES: Record<AdKind, string | undefined> = {
  dodo: process.env.EXPO_PUBLIC_ADMOB_DODO,
  key: process.env.EXPO_PUBLIC_ADMOB_KEY,
  grains: process.env.EXPO_PUBLIC_ADMOB_GRAINS,
  double: process.env.EXPO_PUBLIC_ADMOB_DOUBLE,
  arena: process.env.EXPO_PUBLIC_ADMOB_ARENA,
};

/**
 * En développement on ne sert **jamais** de vraie annonce : les impressions
 * d'un développeur sur son propre inventaire sont du trafic invalide, et
 * Google ferme les comptes pour ça.
 */
function unite(kind: AdKind): string {
  const test = sdk!.TestIds.REWARDED;
  if (__DEV__) return test;
  return UNITES[kind] ?? test;
}

/** Une pub qui ne charge pas ne doit pas laisser le bouton tourner sans fin. */
const DELAI_CHARGEMENT_MS = 15_000;

let prete = false;

/**
 * Consentement puis initialisation. Le formulaire de Google (UMP) est une
 * obligation légale en Europe — donc à La Réunion — avant toute annonce
 * personnalisée ; un refus n'empêche pas la diffusion, il la dépersonnalise.
 */
export async function initPubs(): Promise<void> {
  if (!sdk || prete) return;
  try {
    await sdk.AdsConsent.gatherConsent();
  } catch {
    // Refus, absence de réseau, formulaire indisponible : on continue en
    // non-personnalisé plutôt que de priver le joueur de ses récompenses.
  }
  try {
    await sdk.default().initialize();
    prete = true;
  } catch {
    prete = false;
  }
}

/**
 * Affiche une pub récompensée et résout `true` seulement si Google confirme
 * que la vidéo est allée au bout. Ne lève jamais : un échec de pub ne doit
 * pas remonter dans l'interface autrement que par « pas de récompense ».
 */
export function montrerPub(kind: AdKind): Promise<boolean> {
  if (!sdk) return Promise.resolve(false);
  const { RewardedAd, RewardedAdEventType, AdEventType } = sdk;

  return new Promise((resolve) => {
    let gagnee = false;
    let termine = false;
    let detacher: () => void = () => {};

    const finir = (ok: boolean) => {
      if (termine) return;
      termine = true;
      clearTimeout(minuteur);
      detacher();
      resolve(ok);
    };

    const minuteur = setTimeout(() => finir(false), DELAI_CHARGEMENT_MS);

    const pub = RewardedAd.createForAdRequest(unite(kind));
    const arrets = [
      pub.addAdEventListener(RewardedAdEventType.LOADED, () => {
        // le minuteur ne couvre que le chargement : une fois la vidéo à
        // l'écran, c'est le joueur qui décide du rythme
        clearTimeout(minuteur);
        pub.show().catch(() => finir(false));
      }),
      pub.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        gagnee = true;
      }),
      // fermer avant la fin est un cas normal, pas une erreur : on résout sur
      // ce que Google a réellement confirmé
      pub.addAdEventListener(AdEventType.CLOSED, () => finir(gagnee)),
      pub.addAdEventListener(AdEventType.ERROR, () => finir(false)),
    ];
    detacher = () => arrets.forEach((arret) => arret());

    try {
      pub.load();
    } catch {
      finir(false);
    }
  });
}
