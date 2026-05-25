import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function RgpdPage() {
  return (
    <section className="pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link href="/" className="text-sm text-gray-400 hover:text-cyan-400 flex items-center gap-1 mb-4">
          <ChevronRight className="w-3 h-3 rotate-180" /> Accueil
        </Link>
        <h1 className="text-3xl font-bold mb-8">Politique de confidentialité (RGPD)</h1>

        <div className="prose prose-invert max-w-none space-y-6 text-gray-400 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">1. Collecte des données</h2>
            <p>
              Nous collectons les données suivantes lors de la création de votre compte et
              de l&apos;utilisation de nos services : nom, prénom, email, numéro de téléphone,
              nom de l&apos;entreprise, photos uploadées, modèles 3D générés, et données de
              navigation anonymisées.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-3">2. Utilisation des données</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Fournir et améliorer nos services de photogrammétrie</li>
              <li>Générer les modèles 3D et analyses à partir de vos photos</li>
              <li>Vous contacter pour le support client et les communications transactionnelles</li>
              <li>Vous envoyer des informations commerciales (avec votre consentement)</li>
              <li>Améliorer notre plateforme et nos algorithmes</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-3">3. Base légale</h2>
            <p>
              Le traitement de vos données repose sur l&apos;exécution du contrat de service
              (traitement des photos, génération des modèles) et votre consentement
              (communications commerciales, cookies).
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-3">4. Conservation des données</h2>
            <p>
              Vos données sont conservées pendant la durée de votre abonnement, puis
              supprimées dans un délai de 90 jours après résiliation. Les modèles 3D
              générés sont conservés 1 an après la fin de l&apos;abonnement, sauf demande
              de suppression anticipée.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-3">5. Partage des données</h2>
            <p>
              Nous ne partageons pas vos données personnelles avec des tiers, sauf :
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Prestataires techniques (hébergement, traitement d&apos;images) dans le cadre strict de leurs services</li>
              <li>Obligation légale ou judiciaire</li>
              <li>Avec votre consentement explicite</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-3">6. Vos droits</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Droit d&apos;accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l&apos;effacement (droit à l&apos;oubli)</li>
              <li>Droit à la limitation du traitement</li>
              <li>Droit à la portabilité des données</li>
              <li>Droit d&apos;opposition</li>
            </ul>
            <p className="mt-2">
              Pour exercer vos droits, contactez-nous à : dpo@altimetrix.fr
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
