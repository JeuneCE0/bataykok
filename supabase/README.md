# Base Batay Kok

Projet Supabase **`bataykok`** (`pwxyezofejjvwochqycy`, eu-west-3).

Schéma en place : 6 tables, 18 vues, 8 fonctions, 11 policies RLS, 24 index.

## Migrations

| Fichier | Ce qu'il pose |
| --- | --- |
| `0001_init` | `koks`, `guilds`, `arena_results`, vue `ladder`, RLS, `submit_arena_result` |
| `0002_defenses` | batays subies hors ligne + `claim_defenses` |
| `0003_parrainage` | code court, `referrals`, `redeem_referral`, `claim_referral_rewards` |
| `0004_marketplace` | `market_listings`, `buy_listing`, `cancel_listing`, `claim_market_sales`, vue `market_quotes` |
| `0005_analytics` | `app_events` |
| `0006_snapshot_enrichi` | grains, piments, donjon, talents… dans `koks` |
| `0007_vues_dashboard` | les 16 vues `stats_*` |
| `0008_verrouillage_stats` | retire les vues `stats_*` aux rôles publics ⚠️ |
| `0009_index_cles_etrangeres` | index sur les FK |

Le ledger Supabase et ce dossier ont divergé un temps (7 migrations appliquées
via l'API n'avaient pas de fichier). Ils sont réalignés — **vérifier le schéma
réel avec `execute_sql`, pas le ledger**, avant de conclure quoi que ce soit.

## Ce qui doit rester ouvert, ce qui doit rester fermé

Lisible avec la clé publiable (celle embarquée dans l'app) :

- `koks`, `ladder` — le classement, c'est le principe même du jeu
- `market_quotes` — la cote sert à fixer un prix
- `arena_results` en lecture — l'historique des batays

**Fermé** aux rôles `anon` et `authenticated` :

- toutes les vues `stats_*` — elles portent les métriques business. Elles
  répondaient à qui voulait avant la migration 0008.

Les RPC sont réservées à `authenticated` : leur logique refuse déjà un
`auth.uid()` nul, mais la porte est fermée en plus.

## Limite assumée

`submit_arena_result` fait confiance au client sur l'issue du combat. Le moteur
est déterministe mais tourne sur l'appareil. Acceptable tant qu'il n'y a que de
l'honneur en jeu ; à porter en plpgsql avant toute récompense réelle. Voir
`docs/BACKEND.md`.
