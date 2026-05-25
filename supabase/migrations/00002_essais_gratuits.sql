-- Ajout du champ essais_gratuits pour le système d'essai gratuit
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS essais_gratuits_restants INTEGER NOT NULL DEFAULT 2;

-- Mise à jour RLS pour permettre la lecture/écriture de ce champ
-- Les politiques existantes couvrent déjà toutes les colonnes via SELECT/UPDATE sans restriction de colonnes,
-- donc aucune modification de politique nécessaire.
