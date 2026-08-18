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

## Lancer sur Android

```bash
npx expo start --android   # émulateur Android Studio requis
```

Ou scanne le QR code avec l'app **Expo Go** sur un vrai téléphone (iOS ou Android).

## Ce qui est implémenté

- **Création du kok** : 6 classes jouables, personnalisation (couleur du corps, crête, plumes de queue, accessoires), nom libre ou généré aléatoirement.
- **Classes** (équilibrées par simulation, winrates 45–58 %) :
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

## Structure du code

```
src/
  game/        # moteur pur TypeScript (testable hors React)
    types.ts       # modèles de données
    classes.ts     # 6 classes + capacités
    formulas.ts    # XP, coûts, PV, économie (formules type S&F)
    combat.ts      # simulation de combat tour par tour
    items.ts       # génération d'objets (raretés, bonus)
    quests.ts      # quêtes (lieux de La Réunion)
    bots.ts        # 60 adversaires déterministes + apparences
    guilds.ts      # écuries et bonus
    transport.ts   # montures péi (bisiklet → pick-up)
    names.ts       # générateur de noms créoles
  store/
    gameStore.ts   # état global zustand + persistance
  components/
    Rooster.tsx    # coq cartoon SVG paramétrique
    Hud.tsx        # barre du haut (nom, niveau, XP, monnaies)
    ui.tsx         # thème + composants partagés
  screens/         # les 7 écrans du jeu
```

## Vers la vraie prod (multi-joueur réel)

Le prototype simule le multijoueur en local. Pour la version store :

1. **Backend** : Supabase ou Firebase (comptes, classement réel, guildes, combats asynchrones — l'adversaire est un *snapshot* de stats, comme dans S&F : aucun temps réel nécessaire).
2. **IAP réels** : `expo-in-app-purchases` / RevenueCat pour les packs de piments.
3. **Notifications push** : fin de quête, attaques reçues (expo-notifications).
4. **Art final** : remplacer/compléter le coq SVG par des illustrations d'artiste (le SVG paramétrique reste idéal pour la personnalisation).
5. **Build stores** : `eas build` (profils iOS + Android) puis `eas submit`.

Voir `GDD-Batay-Kok.md` pour l'analyse complète de Shakes & Fidget et la roadmap de contenu (donjons de l'île, boss, forteresse-kaz, animaux de compagnie…).
