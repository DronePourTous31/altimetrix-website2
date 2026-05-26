-- Ajout du champ updated_at pour le suivi des modifications
ALTER TABLE public.projets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
