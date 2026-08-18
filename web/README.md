# Batay Kok — tableau de bord produit

Next.js, rendu côté serveur, lecture directe de Supabase avec la clé de
service. Déployé sur Vercel.

## Variables d'environnement

| Variable | Rôle |
| --- | --- |
| `SUPABASE_URL` | `https://pwxyezofejjvwochqycy.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | clé **secrète** (Dashboard Supabase → Project Settings → API) |
| `DASHBOARD_USER` / `DASHBOARD_PASSWORD` | identifiants d'accès (Basic Auth) |

⚠️ Sans `DASHBOARD_USER`/`DASHBOARD_PASSWORD`, le site répond **503** : c'est
volontaire. Un tableau de bord produit ouvert à tous les vents est pire
qu'un tableau de bord indisponible.

La clé de service ne quitte jamais le serveur : la page est en
`force-dynamic`, aucune donnée n'est embarquée dans le bundle client.

## Ce qui est mesuré

Les vues SQL sont dans la migration `0003_analytics` du projet Supabase :

- `stats_overview` — membres, en ligne (5 min), actifs 24 h, sessions,
  batays, ventes, parrainages
- `stats_daily` — événements / sessions / joueurs par jour, 30 jours
- `stats_events` — les événements les plus fréquents sur 7 jours
- `stats_signups` — inscriptions par jour
- `stats_levels` — répartition des niveaux

L'app envoie ses événements par paquets de 8 (ou toutes les 20 s) via
`src/lib/analytics.ts` : `app_open`, `screen_view`, `player_created`,
`arena_fight`, `quest_done`, `boss_cleared`, `ad_started`, `ad_completed`,
`purchase`.

## Téléchargements

Ce chiffre **n'est pas dans la base** : il vient d'App Store Connect et de la
Play Console. Il faudra une clé d'API App Store Connect (`.p8`) et un compte
de service Google Play pour l'afficher. Tant qu'aucun build n'est publié, il
n'y a rien à compter.

## Lancer en local

```bash
cd web
npm install
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... DASHBOARD_USER=admin DASHBOARD_PASSWORD=... npm run dev
```
