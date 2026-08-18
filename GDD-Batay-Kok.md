# Batay Kok — Game Design Document

**RPG mobile idle/asynchrone dans l'univers des batailles coq de La Réunion**
Version 1.0 — août 2026 — inspiré des mécaniques de Shakes & Fidget (Playa Games)

---

## 1. Analyse de Shakes & Fidget

Shakes & Fidget est un RPG satirique free-to-play lancé en 2009, décliné sur navigateur, Steam, iOS et Android. Sa force tient à une boucle de jeu asynchrone extrêmement simple : le joueur ne « joue » jamais un combat en direct, il prépare son personnage et le jeu résout automatiquement les affrontements tour par tour. Tout le gameplay consiste à optimiser des chiffres, et tout le multijoueur est asynchrone — on affronte un instantané des statistiques d'un autre joueur, jamais le joueur lui-même en temps réel. C'est ce qui rend le modèle si économe en infrastructure et si adapté au mobile.

### 1.1 Le personnage

Le joueur crée un personnage en choisissant une classe, une apparence et un nom. Le jeu compte aujourd'hui onze classes (Guerrier, Éclaireur, Mage, Assassin, Mage de combat, Berserker, Chasseur de démons, Druide, Barde, Nécromancien, Paladin), chacune définie par un attribut principal et une capacité spéciale : le Guerrier bloque 25 % des coups avec un bouclier, l'Éclaireur esquive 50 % des attaques, le Mage ignore blocage et esquive, le Berserker a 50 % de chance d'enchaîner une attaque supplémentaire (15 max), le Mage de combat ouvre chaque combat par une comète d'arcane infligeant jusqu'à 33 % des PV adverses, le Barde joue une mélodie tous les quatre tours qui amplifie ses dégâts. Cinq attributs pilotent tout le jeu : Force, Dextérité, Intelligence, Constitution et Chance. Les points de vie valent Constitution × (niveau + 1) × multiplicateur de classe (5 pour le guerrier, 4 pour les classes moyennes, 2 pour les mages, compensé par des armes aux dégâts bien supérieurs). Les attributs s'achètent contre de l'or à coût croissant, ce qui fait de l'or la vraie ressource de progression.

### 1.2 La boucle quotidienne

Le cœur du jeu est la taverne : le joueur dispose de 100 points de « soif d'aventure » par jour, chaque quête consomme des points proportionnels à sa durée, et trois quêtes au choix sont proposées à la fois (durée, or, XP et chance d'objet variables). La bière restaure 20 points (limite de 10 par jour, payée en champignons), portant le total quotidien à 300 points. S'ajoutent l'arène (un combat gratuit toutes les 10 minutes, montée au classement en battant des joueurs mieux classés), le travail à la mine de la guilde, les donjons PvE (séries de boss à débloquer par clés), et des systèmes de long terme : forteresse à la Clash of Clans (niveau 25+), sorcière qui améliore l'équipement, familiers, académie, etc. La journée de jeu type dure 15 à 30 minutes — c'est un jeu de rendez-vous quotidiens, pas de sessions longues.

### 1.3 Économie et monétisation

Deux monnaies : l'or (gagné en jeu, dépensé en attributs et équipement) et les champignons (premium, achetés en argent réel ou gagnés au compte-goutte). Les champignons achètent de la bière, sautent les temps d'attente, rafraîchissent la boutique, paient la monture haut de gamme (qui réduit la durée des quêtes jusqu'à 50 %) et se convertissent en or. La monétisation est du « time-skip » assumé : rien n'est exclusif aux payants, mais les payants progressent nettement plus vite. Les boutiques (armes et objets magiques) tournent chaque jour avec six objets adaptés au niveau, en quatre niveaux de rareté, avec emplacements de gemmes.

### 1.4 Ce qui fait que ça marche

La recette tient en quatre points : des sessions courtes à forte densité de récompenses (chaque action rend or, XP ou objet), une comparaison sociale permanente (classement, guildes, scrapbook de collection), une friction temporelle monétisable mais jamais bloquante, et un habillage humoristique qui excuse la simplicité du gameplay. C'est exactement cette recette que Batay Kok transpose.

---

## 2. Concept Batay Kok

Batay Kok reprend cette boucle à l'identique mais l'ancre dans la culture réunionnaise, sur le ton cartoon parodique de l'original. Le joueur élève un coq de combat caricatural qu'il personnalise, entraîne, équipe et envoie au « rond » (le gallodrome). L'humour vient du décalage : les quêtes sont des scènes de la vie péi (livrer des makatias, garder le marché forain, braver un cyclone), l'équipement est du bric-à-brac local (kasket, kolié koki, gri-gri), les montures sont la bisiklet, le scooter, la 4L verte et le pick-up 4x4, et la bière devient la Dodo fraîche. Le texte mélange français et créole réunionnais léger, compréhensible par tous.

Positionnement : RPG idle asynchrone, sessions de 5 à 15 minutes, cible 974 + diaspora + amateurs de RPG idle FR, iOS et Android.

### 2.1 Les six classes de coqs

| Classe | Archétype S&F | Attribut principal | Capacité |
|---|---|---|---|
| ⚔️ Kok Gèp | Guerrier | Force | Bloque 25 % des coups avec ses zéprons |
| 💨 Kok Malin | Éclaireur | Adresse | Esquive 50 % des attaques |
| 🌿 Kok Tisanèr | Mage | Esprit | Attaques imblocables et inesquivables |
| 🔥 Kok Sovaz | Berserker | Force | 50 % de chance d'enchaîner (15 max) |
| 🌶️ Kok Piman | Mage de combat | Force | Boule de feu d'ouverture (≤ 33 % PV ennemis) |
| 🎵 Kok Séga | Barde | Esprit | Séga tous les 4 tours : +60 % dégâts |

Les cinq attributs sont Force, Adresse, Esprit, Endurance et Chance. Les formules du prototype : PV = Endurance × (niveau + 1) × multiplicateur de classe (5 / 4 / 2 / 4 / 5 / 3 dans l'ordre du tableau) ; dégâts = arme × multiplicateur de classe × (1 + attribut principal / 10), réduits par l'armure adverse (plafond 50 % pour les classes lourdes, 25 % moyennes, 10 % légères) ; critique ×2 avec probabilité liée à la Chance et plafonnée à 50 %. Les multiplicateurs de dégâts (0,95 / 1,0 / 3,4 / 0,9 / 0,9 / 2,5) ont été calibrés par simulation Monte-Carlo (1 500 combats croisés par paire de classes) pour des taux de victoire entre 45 % et 58 % à équipement égal.

### 2.2 Boucle quotidienne

Le joueur dispose de 100 points de motivation par jour. Chez Mémé Zizine (le snack-bar qui remplace la taverne), trois quêtes sont proposées parmi quinze scénarios situés dans des lieux réels de l'île (Mafate, Piton de la Fournaise, Maïdo, Cap Méchant, Grand-Bassin, l'Ermitage…). Chaque quête a une durée réelle, un coût en motivation, et rapporte grains, XP, parfois un objet ou un piment. La Dodo fraîche restaure 20 points (10 par jour maximum, 1 piment pièce). Le transport possédé réduit la durée des quêtes jusqu'à 50 %. Au Rond, un combat gratuit est disponible régulièrement contre les trois adversaires classés juste au-dessus ; la victoire fait échanger les places au Palmarès. L'Écurie (guilde) apporte des bonus permanents d'or et d'XP, améliorables par donations. Le Bazar tourne chaque jour avec six objets sur huit emplacements d'équipement et quatre raretés (Commun, Korek, Kalité, Mitik).

### 2.3 Économie

Les grains (🌽) sont l'or : gagnés en quête et en arène, dépensés en attributs (coût croissant ≈ 2 + 1,2n + n^1,9/10), équipement et transports. Les piments (🌶️) sont le premium : Dodo, skip de cooldown d'arène, rafraîchissement de boutique, pick-up 4x4, conversion en grains à taux indexé sur le niveau. Monétisation prévue : packs de piments (0,99 € à 12,99 €), pass mensuel « Ti Planteur » (piments quotidiens + 10 % XP), publicité récompensée optionnelle (1 Dodo gratuite/jour), à intégrer via RevenueCat. Aucun contenu exclusif payant : uniquement de l'accélération, comme S&F.

---

## 3. Roadmap de contenu (après le prototype)

**V1 (lancement soft)** — backend Supabase (comptes anonymes puis liaison, classement réel par serveur/« île », guildes persistantes avec chat, combats asynchrones sur snapshots de stats), IAP réels, notifications push de fin de quête, 30 scénarios de quêtes, saisons de classement avec récompenses.

**V1.5** — Donjons PvE « La Route des Cirques » : treize boss thématiques à débloquer par clés (Le Gardien du Maïdo, La Bête de Grand-Bassin, Le Dodo Géant, Gran Mèr Kal, Le Sitarane, jusqu'au Volcan en éruption), objets épiques garantis. Scrapbook de collection (« Zalbum ») qui donne un bonus d'XP au remplissage, comme dans S&F.

**V2** — La Kaz (équivalent forteresse) : bâtiments à construire dans la cour (poulailler, potager, alambic à tisane), production passive de ressources, mine de pierres précieuses à sertir. Ti-animaux (tangue, endormi, papang, margouya, dodo) élevés par habitat, bonus d'attributs. Événements calendaires réunionnais : le 20 Désanm (récompenses doublées), la saison des letchis, le Grand Raid (quête marathon).

**V3** — Batailles d'écuries hebdomadaires (somme des combats individuels, comme les guerres de guilde S&F), tournois éclair, cosmétiques saisonniers, localisation anglaise.

---

## 4. Architecture technique

Le prototype livré est un projet Expo / React Native / TypeScript avec un moteur de jeu en TypeScript pur (`src/game/`), découplé de React et testé par simulation en Node — le même code de combat pourra tourner côté serveur pour la V1, ce qui est indispensable pour empêcher la triche sur les combats classés. L'état global utilise zustand avec persistance AsyncStorage (sauvegarde locale automatique). Le coq est un SVG paramétrique (react-native-svg), ce qui rend la personnalisation gratuite en taille d'app et fluide ; les illustrations d'artiste pourront s'y superposer plus tard. Pour la production : Supabase (Postgres + Auth + Edge Functions pour la résolution serveur des combats), EAS Build pour les binaires iOS/Android, RevenueCat pour les achats, expo-notifications pour le push.

Le choix « snapshot asynchrone » mérite d'être souligné : comme dans Shakes & Fidget, un combat PvP n'a jamais besoin que les deux joueurs soient connectés. Le serveur stocke les stats de chaque coq ; attaquer quelqu'un déclenche une résolution déterministe côté serveur avec un seed aléatoire, dont le déroulé est rejoué en animation côté client. Coût serveur minimal, aucune latence critique, triche impossible.

---

## 5. Note légale et éditoriale

Le jeu est une parodie cartoon assumée, au même degré de violence stylisée qu'un Pokémon ou que Shakes & Fidget lui-même : aucun sang, des coqs caricaturaux anthropomorphes, des KO façon dessin animé (étoiles et plumes). Il convient d'éviter toute représentation de paris d'argent réel sur les combats (les « paris » du folklore ne doivent pas devenir une mécanique de gambling), toute imagerie réaliste de blessures animales, et de prévoir un écran d'intro précisant le ton humoristique et patrimonial. Classification visée : PEGI 7 / 4+ avec violence fantaisiste légère. Les achats intégrés imposent les mentions habituelles et un contrôle parental standard.
