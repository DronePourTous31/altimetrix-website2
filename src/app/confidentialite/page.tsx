import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité AltiMetrix — traitement des données personnelles, RGPD, droits des utilisateurs.",
};

export default function ConfidentialitePage() {
  return (
    <div className="bg-white py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-sm max-w-none">
        <h1 className="text-3xl font-bold text-dark-800 mb-8 font-heading">Politique de confidentialité</h1>
        <p className="text-dark-400 text-sm mb-8">Dernière mise à jour : mai 2026</p>

        <h2>1. Responsable du traitement</h2>
        <p>AltiMetrix SAS, 1 Place Occitane, 31000 Toulouse. Email : dpo@altimetrix.fr.</p>

        <h2>2. Données collectées</h2>
        <p>Nous collectons : nom, prénom, email, adresse de facturation, photos uploadées pour les projets, données de navigation (via Plausible Analytics, anonymisées). Les données de paiement sont traitées exclusivement par Stripe et ne sont pas stockées par AltiMetrix.</p>

        <h2>3. Finalités</h2>
        <p>Les données sont utilisées pour : la création et gestion du compte, le traitement des projets, la facturation, l&apos;envoi d&apos;emails transactionnels, l&apos;amélioration du service.</p>

        <h2>4. Base légale</h2>
        <p>Traitement fondé sur l&apos;exécution du contrat (abonnement, commande) et le consentement (emails marketing optionnels).</p>

        <h2>5. Destinataires</h2>
        <p>Les données sont hébergées chez Supabase (USA, Privacy Shield) et Scaleway (France). Les emails sont envoyés via Resend (USA, Privacy Shield). Les photos sont stockées sur Supabase Storage / AWS S3 (EU).</p>

        <h2>6. Durée de conservation</h2>
        <p>Comptes : durée de l&apos;abonnement + 1 an. Projets : 3 ans après livraison. Photos sources : 6 mois après livraison. Données de navigation : 6 mois (anonymisées).</p>

        <h2>7. Vos droits</h2>
        <p>Conformément au RGPD, vous disposez des droits : accès, rectification, effacement, limitation, portabilité, opposition. Pour les exercer : dpo@altimetrix.fr. Réponse sous 1 mois.</p>

        <h2>8. Cookies</h2>
        <p>Utilisation de cookies strictement nécessaires (session auth). Aucun cookie publicitaire ou tracking tiers. Plausible Analytics utilise des cookies first-party anonymisés sans recueil de données personnelles.</p>

        <h2>9. Sécurité</h2>
        <p>Les données sont chiffrées en transit (TLS 1.3) et au repos (AES-256). Accès restreint au personnel habilité. Connexions Supabase protégées par RLS (Row Level Security).</p>

        <h2>10. Réclamation</h2>
        <p>Vous pouvez saisir la CNIL : 3 Place de Fontenoy, 75007 Paris — www.cnil.fr.</p>
      </div>
    </div>
  );
}
