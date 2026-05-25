import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description: "CGU AltiMetrix — photogrammétrie par drone, conditions d'utilisation de la plateforme.",
};

export default function CGUPage() {
  return (
    <div className="bg-white py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-sm prose-dark-800 max-w-none">
        <h1 className="text-3xl font-bold text-dark-800 mb-8 font-heading">Conditions générales d&apos;utilisation</h1>
        <p className="text-dark-400 text-sm mb-8">Dernière mise à jour : mai 2026</p>

        <h2>1. Objet</h2>
        <p>Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et l&apos;utilisation de la plateforme AltiMetrix, accessible via le site altimetrix.fr. La plateforme permet aux professionnels du bâtiment de réaliser des relevés photogrammétriques par drone et d&apos;obtenir des modèles 3D, analyses et rapports techniques.</p>

        <h2>2. Définitions</h2>
        <p><strong>Client :</strong> toute personne physique ou morale souscrivant à un abonnement ou commandant un projet sur la plateforme.<br />
        <strong>Abonnement :</strong> forfait mensuel ou annuel donnant accès à un nombre défini de projets.<br />
        <strong>Projet :</strong> ensemble constitué de photos uploadées par le Client et traitées par AltiMetrix pour produire un livrable (modèle 3D, DSM, rapport).</p>

        <h2>3. Inscription et compte</h2>
        <p>L&apos;inscription est libre et gratuite. Le Client s&apos;engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants. AltiMetrix se réserve le droit de suspendre tout compte en cas d&apos;utilisation abusive.</p>

        <h2>4. Abonnements et paiements</h2>
        <p>Les abonnements sont facturés mensuellement ou annuellement selon la formule choisie. Le paiement est effectué via Stripe, carte bancaire. Le Client peut résilier à tout moment depuis son espace personnel. Les projets déjà engagés restent traités jusqu&apos;à leur livraison.</p>

        <h2>5. Obligations du Client</h2>
        <p>Le Client garantit être propriétaire des photos uploadées ou disposer des droits nécessaires. Il s&apos;engage à respecter la réglementation en vigueur concernant les vols de drones (enregistrement, assurance, formation).</p>

        <h2>6. Propriété intellectuelle</h2>
        <p>Les livrables (modèles 3D, rapports) sont la propriété du Client après paiement intégral. AltiMetrix se réserve le droit d&apos;utiliser des données anonymisées à des fins d&apos;amélioration de ses algorithmes.</p>

        <h2>7. Responsabilité</h2>
        <p>AltiMetrix s&apos;engage à traiter les projets avec diligence et professionnalisme. La responsabilité d&apos;AltiMetrix est limitée au montant du projet concerné. Les mesures fournies sont indicatives et ne sauraient se substituer à un relevé topographique certifié.</p>

        <h2>8. Données personnelles</h2>
        <p>Voir notre <a href="/confidentialite" className="text-primary-600 hover:underline">Politique de confidentialité</a>.</p>

        <h2>9. Droit applicable</h2>
        <p>Les présentes CGU sont soumises au droit français. Tout litige relève des tribunaux compétents de Toulouse.</p>
      </div>
    </div>
  );
}
