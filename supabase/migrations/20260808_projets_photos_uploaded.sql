-- Galerie photos du vol accessible au client.
-- À exécuter via le SQL editor du dashboard Supabase (pas de CLI côté dev).
--
-- projets.photos_uploaded : photos du vol mises à disposition du client sur le
-- bucket public R2 (JSONB : [{ category, filename, url }]).
-- L'upload admin (/api/admin/upload) ajoute chaque photo dans cette liste.

alter table public.projets
  add column if not exists photos_uploaded jsonb not null default '[]'::jsonb;
