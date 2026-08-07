-- Multi-abonnements : un client peut cumuler plusieurs forfaits actifs.
-- Table créée via le SQL editor du dashboard Supabase (aucun accès CLI côté dev).
-- Le code (quota.ts, webhook, admin) fonctionne aussi sans cette table :
-- tant qu'elle n'existe pas, on reste sur le forfait unique (profiles.forfait_id).

create table if not exists public.abonnements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  forfait_id uuid not null references public.forfaits(id),
  plan_id text,
  stripe_subscription_id text,
  stripe_customer_id text,
  statut text not null default 'actif' check (statut in ('actif', 'resilie')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists abonnements_user_statut_idx on public.abonnements (user_id, statut);
create index if not exists abonnements_stripe_sub_idx on public.abonnements (stripe_subscription_id);
create index if not exists abonnements_customer_statut_idx on public.abonnements (stripe_customer_id, statut);

-- RLS : lecture/écriture par l'API (service role) uniquement.
alter table public.abonnements enable row level security;

drop policy if exists "abonnements select own" on public.abonnements;
create policy "abonnements select own"
  on public.abonnements for select
  using (auth.uid() = user_id);

-- Les inserts/updates passent uniquement par le service role (webhook Stripe,
-- routes API) qui contourne la RLS. Aucune écriture directe par le client :
-- on ne pose pas de policy INSERT pour éviter qu'un utilisateur forge ses
-- propres abonnements.
