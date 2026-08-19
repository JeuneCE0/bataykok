-- Le snapshot ne portait que les stats de combat. Pour piloter le jeu il faut
-- aussi voir l'économie et la progression — données de jeu, rien de personnel.

alter table public.koks
  add column if not exists grains        bigint not null default 0,
  add column if not exists piments       int    not null default 0,
  add column if not exists dungeon_floor int    not null default 0,
  add column if not exists talents       jsonb  not null default '[]'::jsonb,
  add column if not exists transport     int    not null default 0,
  add column if not exists album_size    int    not null default 0,
  add column if not exists guild_key     text,
  add column if not exists equipped      int    not null default 0,
  add column if not exists app_version   text,
  add column if not exists platform      text;

create index if not exists koks_created_idx on public.koks (created_at desc);
create index if not exists koks_level_idx   on public.koks (level desc);
