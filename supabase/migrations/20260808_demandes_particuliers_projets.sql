-- Traitement des rapports particuliers comme des projets classiques.
-- À exécuter via le SQL editor du dashboard Supabase (pas de CLI côté dev).
--
-- 1. demandes_particuliers.description : détail de la demande (champ libre).
-- 2. demandes_particuliers.projet_id   : projet créé par l'admin pour traiter
--    la demande (statut de traitement visible côté client).
-- 3. projets.rapports_pdf              : un ou plusieurs rapports PDF
--    d'analyse livrés au client (JSONB : [{ nom, url }]).

alter table public.demandes_particuliers
  add column if not exists description text;

alter table public.demandes_particuliers
  add column if not exists projet_id uuid references public.projets(id) on delete set null;

alter table public.projets
  add column if not exists rapports_pdf jsonb not null default '[]'::jsonb;
