export type TypeCompte = "artisan" | "particulier";

export type StatutProjet = "upload_en_attente" | "en_traitement" | "livre" | "erreur";

export type TypeAnalyse = "mesure" | "solaire" | "pro";

export type StatutCommande = "en_attente" | "payee" | "echec" | "remboursee";

export interface Profile {
  id: string;
  prenom: string;
  nom: string;
  type_compte: TypeCompte;
  siret: string | null;
  telephone: string | null;
  created_at: string;
  abonnement_actif: boolean;
  forfait_id: string | null;
  stripe_customer_id: string | null;
}

export interface Projet {
  id: string;
  user_id: string;
  nom: string;
  adresse: string | null;
  statut: StatutProjet;
  type_analyse: TypeAnalyse;
  created_at: string;
  delivered_at: string | null;
  storage_path_input: string | null;
  storage_path_output: string | null;
  rapport_url: string | null;
}

export interface Forfait {
  id: string;
  nom: string;
  slug: string;
  description: string | null;
  prix_mensuel: number;
  prix_annuel: number;
  nb_projets_mois: number;
  features: string[];
  actif: boolean;
}

export interface Commande {
  id: string;
  user_id: string;
  forfait_id: string | null;
  stripe_session_id: string | null;
  montant: number;
  statut: StatutCommande;
  created_at: string;
}
