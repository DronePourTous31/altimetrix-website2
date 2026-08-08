-- Demandes de rapport pour particuliers (one-shot avec captation terrain).
-- Flux : le particulier remplit un formulaire d'adresse → demande « en_attente »,
-- l'admin valide la faisabilité (31 Haute-Garonne / 32 Gers, ou hors zone sur
-- devis) → session Stripe créée + email avec lien de paiement. La table est
-- créée via le SQL editor du dashboard Supabase (aucun accès CLI côté dev).

create table if not exists public.demandes_particuliers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null,
  adresse text not null,
  code_postal text not null,
  ville text not null,
  hors_zone boolean not null default false,
  statut text not null default 'en_attente' check (statut in ('en_attente', 'validee', 'refusee', 'payee')),
  stripe_session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists demandes_particuliers_statut_idx on public.demandes_particuliers (statut, created_at);
create index if not exists demandes_particuliers_user_idx on public.demandes_particuliers (user_id);

alter table public.demandes_particuliers enable row level security;

drop policy if exists "demandes select own" on public.demandes_particuliers;
create policy "demandes select own"
  on public.demandes_particuliers for select
  using (auth.uid() = user_id);

-- Les inserts/updates passent uniquement par le service role (routes API).
-- Aucune écriture directe par le client.
