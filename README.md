# 🐓 Batay Kok — RPG de batailles coq péi (La Réunion)

Jeu mobile iOS / Android inspiré des mécaniques de **Shakes & Fidget**, transposé dans l'univers cartoon des batailles coq réunionnaises. Construit avec **Expo (React Native + TypeScript)**.

## Lancer sur le simulateur iOS (Mac)

Prérequis : Node.js 20+, Xcode installé (avec un simulateur iOS).

```bash
cd batay-kok
npm install
npx expo start --ios
```

`npx expo start --ios` ouvre automatiquement l'app dans le simulateur iOS via **Expo Go** (téléchargé automatiquement la première fois). Sinon, lance `npx expo start` puis appuie sur `i`.

> Si le port 8081 est déjà pris : `npx expo start --ios --port 8082`.
> Expo Go affiche un avertissement sur `expo-notifications` (les push **distantes** n'y sont plus supportées) : les rappels **locaux** du jeu, eux, fonctionnent.

## Lancer sur Android

```bash
npx expo start --android   # émulateur Android Studio requis
```

Ou scanne le QR code avec l'app **Expo Go** sur un vrai téléphone (iOS ou Android).

## Ce qui est implémenté

- **Création du kok** : 6 classes jouables, personnalisation (couleur du corps, crête, plumes de queue, accessoires), nom libre ou généré aléatoirement.
- **Classes** (équilibrées par simulation — 47 à 50 % de victoires, moins de
  3 points d'écart ; `npm test` le vérifie à chaque fois) :
  - ⚔️ **Kok Gèp** (Guerrier, Force) — bloque 25 % des coups
  - 💨 **Kok Malin** (Esquiveur, Adresse) — esquive 50 % des attaques
  - 🌿 **Kok Tisanèr** (Mystique, Esprit) — attaques imblocables/inesquivables
  - 🔥 **Kok Sovaz** (Berserker, Force) — 50 % de chance d'enchaîner (max 15)
  - 🌶️ **Kok Piman** (Mage de combat, Force) — boule de feu d'ouverture (jusqu'à 33 % PV)
  - 🎵 **Kok Séga** (Barde, Esprit) — buff de dégâts tous les 4 tours
- **Attributs** : Force, Adresse, Esprit, Endurance, Chance — achetables en grains, coût croissant (comme S&F).
- **Quêtes** (Chez Mémé Zizine) : 3 quêtes au choix dans des lieux réels de l'île, système de **motivation** (100/jour) + **Dodo fraîche** pour recharger (10/jour max), timers temps réel, récompenses or/XP/objets/piments.
- **Arène — Le Rond** : combats tour par tour animés contre 60 adversaires simulés (noms créoles), montée au classement en battant les rangs supérieurs, cooldown avec skip premium.
- **Palmarès** : classement des 61 combattants avec ta position.
- **Écuries (guildes)** : 5 écuries à rejoindre, bonus XP/or améliorables par donation.
- **Bazar** : boutique d'équipement à rotation (8 emplacements : zéprons, kasket, gilet plimé, zergos, kolié, bag, sintir, gri-gri ; 4 raretés), garage de transports (réduction de durée des quêtes), échange piments → grains, packs de piments (achats intégrés simulés).
- **Économie double** : 🌽 grains (or) + 🌶️ piments (premium), reset quotidien de la motivation et de la boutique.
- **Sauvegarde automatique** (AsyncStorage) — ferme l'app, tout est conservé.

## Multijoueur

Modèle Shakes & Fidget : on n'affronte jamais quelqu'un en direct, mais un
**snapshot** de ses statistiques. Aucun temps réel, donc aucun serveur de jeu —
Postgres suffit.

- **Batay en lign** : les koks juste au-dessus de soi au classement
- **Défense hors ligne** : le snapshot se bat tout seul pendant l'absence, et
  un rapport détaillé attend au retour (avec les grains dus)
- **Hôtel des ventes** entre joueurs, avec cote du marché
- **Parrainage** : code court, récompenses des deux côtés
- Session **anonyme** : personne ne crée de compte pour jouer

Sans `EXPO_PUBLIC_SUPABASE_*`, tout cela disparaît et le jeu tourne en local
avec ses adversaires simulés. Voir `docs/BACKEND.md`.

## Son

Tout est **synthétisé** (`scripts/gen-sfx.js`) : aucune licence, 340 Ko d'AAC,
régénérable à volonté. 12 effets (coups, critique, esquive, KO, pièces,
victoire, défaite, niveau, coffre) et une boucle de fond façon séga. Réglages
Son / Mizik dans La Kaz.

## Tableau de bord produit

`web/` — Next.js déployé sur Vercel, 9 sections avec navigation latérale :
vue d'ensemble, trafic & rétention, annuaire des joueurs, progression,
combats, économie, hôtel des ventes, monétisation, technique. Lecture directe
de Supabase avec la clé de service, côté serveur uniquement, derrière Basic
Auth fail-closed. Voir `web/README.md`.

## Contenu de jeu

- **La Route des Cirques** (onglet Donjon) : 13 gardiens sur des lieux réels de
  l'île, chacun franchi **une seule fois**, nettement au-dessus du joueur, avec une
  récompense garantie (grains, XP, piments, ékipman d'une rareté fixée). Une tentative
  coûte une **clé** — une offerte par jour, perdue même en cas d'échec.
- **Talents** : un choix tous les 5 niveaux (5 paliers × 3 options exclusives) qui
  agissent réellement sur les dégâts, les PV, l'armure, le crit, les gains, les jetons
  de batay et la durée des quêtes. C'est le seul endroit où deux koks de même classe
  divergent.
- **Panoplies** : 5 sets (2 et 4 pièces), pour que le choix d'équipement ne se résume
  pas à « le plus gros score ».
- **Zalbum** : 32 cases emplacement × rareté, +1 % d'XP permanent par case découverte.
- **Saisons du rond** : 14 jours, récompense selon le rang atteint (du Batayeur au
  Roi du rond).
- **Jetons de batay** : 3 (rechargeables), pour enchaîner plusieurs combats au lieu
  d'un cooldown sec.
- **Événement du jour** (tirage stable) : jour de marsé (grains ×1,5), lékol (XP ×1,5),
  chans du gramoune (loot ×2), brad o Bazar (−30 %), gran kabar (+2 jetons).

## Progression, fidélité, monétisation

- **Comparaison d'équipement** : chaque objet du Bazar et du sak affiche un verdict
  **MIEUX / MOINS BON** et le détail des écarts (`Dégâts ▲ +3`, `Armure ▼ −2`…) face à la
  pièce portée. Le score est pondéré par la classe — l'attribut principal pèse plus lourd.
  Le sak est trié par gain, et la fiche affiche une note de **Puissance**.
- **Chemin du ti kok** : 11 étapes d'onboarding (équiper, première quête, premier combat,
  écurie, niveau 5, objet Mitik…). Un bandeau permanent montre la prochaine action, emmène
  sur le bon onglet d'un tap, puis se transforme en récompense à encaisser.
- **Défis du jour** : 3 objectifs tirés chaque jour (tirage stable) + coffre bonus quand
  les trois tombent.
- **Kofr gratui** toutes les 4 h : grains, piments ou ékipman.
- **Série de connexions** : récompense croissante J1 → J7, présentée à l'ouverture.
- **Pubs récompensées** (simulation du SDK, à brancher sur AdMob/RevenueCat en prod) :
  Dodo offerte, sac de grains, **doublement** de la récompense de quête, batay immédiate.
  6 par jour, avec cooldown.
- **Offre de bienvenue** « Pak Ti Batayeur » (une seule fois), packs de piments avec
  bonus affiché, et **Pass Ti Planteur** (20 piments par jour + 10 % d'XP).
- **Rappels locaux** : notification à la fin d'une quête et quand le rond redevient
  disponible (`expo-notifications`, 100 % local, aucun serveur).
- **Pastilles d'appel à l'action** sur la barre d'onglets : une amélioration dans le sak,
  une bonne affaire au Bazar, une quête terminée, un défi à encaisser.

## Direction artistique — « Kabar Volcan »

Nuit tropicale profonde, braise du volcan, or de fête foraine. Tokens dans `src/theme.ts`,
police **Baloo 2**, surfaces en dégradés avec liseré lumineux, boutons à relief, fond SVG
(halo de lave + poussière). Le coq respire et cligne des yeux ; les combats sont mis en
scène (bond, secousse, flash d'impact, dégâts flottants, gerbe de plumes, KO renversé).

## Tests

```bash
npm test        # 74 tests du moteur, ~0,4 s
npm run typecheck
```

`node:test` + `tsx`, aucune dépendance lourde. Les tests ne couvrent que
`src/game/` — le moteur pur, sans React Native — et c'est volontaire : c'est
là que vivent les règles, et c'est là que les bugs coûtent cher.

Deux d'entre eux ont été écrits après coup, pour des bugs réellement rencontrés :

- **une étape du chemin ajoutée sans son cas dans le switch** retombait sur
  `false` et figeait la progression à vie. Le test parcourt maintenant toutes
  les étapes déclarées.
- **la courbe de récompenses reculait trois fois** (une étape plus avancée
  payait moins que la précédente). Invisible à l'œil, évident au test.

## Structure du code

```
src/
  theme.ts       # tokens de direction artistique (couleurs, dégradés, typo, ombres)
  game/          # moteur pur TypeScript (testable hors React)
    types.ts       # modèles de données
    classes.ts     # 6 classes + capacités
    formulas.ts    # XP, coûts, PV, économie (formules type S&F)
    combat.ts      # simulation de combat tour par tour
    items.ts       # génération d'objets (raretés, bonus)
    power.ts       # score de puissance + comparaison d'équipement
    progress.ts    # étapes d'onboarding, défis du jour, série, offres de pub
    dungeons.ts    # les 13 gardiens de la Route des Cirques
    talents.ts     # paliers de talents et leurs effets
    sets.ts        # panoplies et bonus de set
    album.ts       # Zalbum (collection)
    events.ts      # événement du jour
    seasons.ts     # saisons du rond et paliers de récompense
    quests.ts      # quêtes (lieux de La Réunion)
    bots.ts        # 60 adversaires déterministes + apparences
    guilds.ts      # écuries et bonus
    transport.ts   # montures péi (bisiklet → pick-up)
    names.ts       # générateur de noms créoles
    rewards.ts     # récompenses de batay (défaite comprise), bonus, consolation
    day.ts         # jour de jeu en heure locale
    tickets.ts     # jetons de batay (recharge, plafond, consommation)
    __tests__/     # 74 tests : progression, combat, récompenses, objets,
                   #   formules, jetons
  store/
    gameStore.ts   # état global zustand + persistance
    alerts.ts      # pastilles d'appel à l'action par onglet
  lib/
    notifications.ts # rappels locaux (fin de quête, rond disponible)
    supabase.ts / online.ts / useOnlineSync.ts  # multijoueur (inerte sans conf)
    market.ts / referral.ts   # hôtel des ventes, parrainage
    analytics.ts   # collecte produit par paquets
    sound.ts       # effets et musique
  components/
    CombatView.tsx # scène de combat animée (rond et donjons)
    Rooster.tsx    # coq cartoon SVG paramétrique (respiration, clignement)
    Backdrop.tsx   # fond de nuit volcanique
    Hud.tsx        # barre du haut (portrait, niveau, XP, monnaies)
    ui.tsx         # kit d'interface (Card, Button, Bar, Chip, Well…)
    ItemCompare.tsx / AdButton.tsx / StepBanner.tsx / DailyModal.tsx
    DailyMissions.tsx / LevelUpOverlay.tsx / FadeIn.tsx / Counter.tsx
  screens/         # les écrans du jeu (Mon Kok / La Kaz, Quêtes, Rond +
                   # Palmarès, Donjon, Écurie, Bazar)
```

## Vers la vraie prod (multi-joueur réel)

Le prototype simule le multijoueur en local. Pour la version store :

1. **Backend** : Supabase ou Firebase (comptes, classement réel, guildes, combats asynchrones — l'adversaire est un *snapshot* de stats, comme dans S&F : aucun temps réel nécessaire).
2. **IAP réels** : RevenueCat pour les packs de piments (l'UI et les offres sont déjà en
   place, seul l'achat est simulé) + **AdMob** derrière les pubs récompensées.
3. **Notifications push distantes** : attaques reçues, fin de saison (les rappels locaux
   sont déjà branchés ; il faut un development build, pas Expo Go).
4. **Art final** : remplacer/compléter le coq SVG par des illustrations d'artiste (le SVG paramétrique reste idéal pour la personnalisation).
5. **Build stores** : `eas build` (profils iOS + Android) puis `eas submit`.

Voir `GDD-Batay-Kok.md` pour l'analyse complète de Shakes & Fidget et la roadmap de contenu (donjons de l'île, boss, forteresse-kaz, animaux de compagnie…).
