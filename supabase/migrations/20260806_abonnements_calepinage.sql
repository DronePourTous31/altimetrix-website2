-- Option « Calepinage 3D » mensuelle par abonnement : un Starter Mesures avec
-- cette option est un « Starter Mesures+ » (59€/mois, calepinage inclus).
-- Colonne à ajouter via le SQL editor du dashboard Supabase (pas de CLI).
-- Le code retombe sur false si la colonne n'existe pas (erreur 42703).

alter table public.abonnements
  add column if not exists calepinage boolean not null default false;

-- Backfill : marquer les abonnements dont le panier Stripe contient l'option
-- calepinage (price_1TzgqbDXglAiGCG8ODl5n5mJ). À adapter manuellement au
-- besoin — en prod, au moins : sub_1U1VAfDXglAiGCG83KvP5i9n (Nicolas).
-- update public.abonnements
--   set calepinage = true
--   where stripe_subscription_id in ('sub_1U1VAfDXglAiGCG83KvP5i9n');
