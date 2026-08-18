# Passer Batay Kok en multijoueur

Le jeu tourne aujourd'hui **entièrement en local** : adversaires simulés,
classement calculé sur l'appareil, sauvegarde AsyncStorage. Le code
multijoueur est déjà en place mais **inerte** tant que les variables
d'environnement sont absentes (`isOnlineEnabled === false`) — aucun écran ne
suppose qu'une session existe.

## Ce qui est déjà écrit

| Fichier | Rôle |
| --- | --- |
| `supabase/migrations/0001_init.sql` | Schéma complet : `koks`, `guilds`, `arena_results`, vue `ladder`, RLS, RPC `submit_arena_result` |
| `src/lib/supabase.ts` | Client optionnel (null sans configuration) |
| `src/lib/online.ts` | Session anonyme, publication du snapshot, lecture des rivaux et du classement, remontée des résultats |
| `src/lib/useOnlineSync.ts` | Publie le snapshot quand le kok change |
| `src/screens/ArenaScreen.tsx` | Section « Batay en lign », rendue seulement si des joueurs réels existent |

## Activation (4 étapes)

1. **Créer le projet** Supabase (région `eu-west-3` pour La Réunion).
2. **Appliquer la migration** :
   ```bash
   supabase link --project-ref <ref>
   supabase db push
   ```
3. **Activer les connexions anonymes** : Authentication → Providers → Anonymous
   sign-ins. Personne ne doit créer de compte pour jouer.
4. **Poser les variables** dans `.env.local` (dev) puis dans les variables EAS
   (build) :
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<clé publishable>
   ```
   ⚠️ Sans elles dans les variables EAS, l'app buildée démarre en mode local
   sans le dire.

## Limite assumée de la V1

`submit_arena_result` **fait confiance au client** sur l'issue du combat : le
moteur (`src/game/combat.ts`) est déterministe mais tourne sur l'appareil, donc
un joueur qui modifie l'app peut déclarer des victoires.

C'est acceptable tant qu'il n'y a rien à gagner d'autre que de l'honneur, et
**inacceptable dès qu'il y a des récompenses réelles ou un classement public
sérieux**. Le durcissement consiste à porter `combat.ts` en plpgsql et à
recalculer l'issue dans la fonction : sa signature est déjà celle qu'il faudra,
seul le corps change. Les snapshots des deux combattants sont déjà en base,
c'est tout ce dont le calcul a besoin.

## Ce qui reste à câbler après activation

- Remplacer les bots du classement par les vrais joueurs (aujourd'hui les deux
  cohabitent : bots en local, joueurs réels dans une section dédiée)
- Écuries réelles (`guilds` / `guild_id`) : la table existe, l'écran utilise
  encore les écuries locales
- Notifications push distantes (attaque reçue) — nécessite un development build
