-- ============================================
-- AltiMetrix — Schéma Supabase
-- ============================================

-- Types énumérés
CREATE TYPE type_compte AS ENUM ('artisan', 'particulier');
CREATE TYPE statut_projet AS ENUM ('upload_en_attente', 'en_traitement', 'livre', 'erreur');
CREATE TYPE type_analyse AS ENUM ('mesure', 'solaire', 'pro');
CREATE TYPE statut_commande AS ENUM ('en_attente', 'payee', 'echec', 'remboursee');

-- 1. PROFILES (extension de auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL,
  type_compte type_compte NOT NULL DEFAULT 'particulier',
  siret TEXT,
  telephone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  abonnement_actif BOOLEAN NOT NULL DEFAULT false,
  forfait_id UUID,
  stripe_customer_id TEXT
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. FORFAITS
CREATE TABLE public.forfaits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  prix_mensuel INTEGER NOT NULL,
  prix_annuel INTEGER NOT NULL,
  nb_projets_mois INTEGER NOT NULL DEFAULT 3,
  features JSONB NOT NULL DEFAULT '[]',
  actif BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.forfaits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "forfaits_public_read"
  ON public.forfaits FOR SELECT
  USING (true);

-- 3. PROJETS
CREATE TABLE public.projets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  adresse TEXT,
  statut statut_projet NOT NULL DEFAULT 'upload_en_attente',
  type_analyse type_analyse NOT NULL DEFAULT 'mesure',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  storage_path_input TEXT,
  storage_path_output TEXT,
  rapport_url TEXT
);
ALTER TABLE public.projets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_projets"
  ON public.projets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_projets"
  ON public.projets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_projets"
  ON public.projets FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. COMMANDES
CREATE TABLE public.commandes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  forfait_id UUID REFERENCES public.forfaits(id),
  stripe_session_id TEXT,
  montant INTEGER NOT NULL,
  statut statut_commande NOT NULL DEFAULT 'en_attente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.commandes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_commandes"
  ON public.commandes FOR SELECT
  USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_projets_user_id ON public.projets(user_id);
CREATE INDEX idx_projets_statut ON public.projets(statut);
CREATE INDEX idx_commandes_user_id ON public.commandes(user_id);

-- Seed forfaits
INSERT INTO public.forfaits (nom, slug, description, prix_mensuel, prix_annuel, nb_projets_mois, features) VALUES
  ('Mesure', 'mesure', 'Idéal pour les métrés et relevés ponctuels.', 6900, 70380, 3, '["Modèle 3D + mesures précises", "DSM haute résolution", "Rapport de métrés PDF", "Outils de mesure en ligne"]'),
  ('Solaire', 'solaire', 'Pour les installateurs photovoltaïques et couvreurs.', 9900, 100980, 3, '["Tout Mesure +", "Analyse d''irradiation", "Calepinage panneaux solaires", "Calcul de production annuelle", "Étude d''ombrage"]'),
  ('Pro', 'pro', 'Volume élevé et fonctionnalités avancées.', 14900, 151980, 10, '["Tout Solaire +", "Mission planner prioritaire", "Support dédié sous 2h", "API d''intégration", "Pipeline personnalisé"]')
ON CONFLICT (slug) DO NOTHING;
