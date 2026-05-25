import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function CgvPage() {
  return (
    <section className="pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link href="/" className="text-sm text-gray-400 hover:text-cyan-400 flex items-center gap-1 mb-4">
          <ChevronRight className="w-3 h-3 rotate-180" /> Accueil
        </Link>
        <h1 className="text-3xl font-bold mb-8">Conditions Générales de Vente</h1>

        <div className="prose prose-invert max-w-none space-y-6 text-gray-400 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">1. Objet</h2>
            <p>
              Les présentes CGV régissent l&apos;utilisation de la plateforme AltiMetrix et
              la fourniture des services de photogrammétrie par drone, d&apos;analyse solaire,
              de mesure et de rapports associés.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-3">2. Abonnements</h2>
            <p>
              Les abonnements sont mensuels ou annuels, sans engagement pour les formules
              mensuelles. Le client peut résilier à tout moment depuis son espace client.
              Pour les abonnements annuels, un préavis de 30 jours est applicable.
            </p>
            <p className="mt-2">
              Les réductions pour engagement annuel sont de 15 à 20% selon la formule
              choisie, appliquées automatiquement lors du passage en mode annuel.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-3">3. Prestations One Shot</h2>
            <p>
              La prestation One Shot à 250€ inclut la captation par le client, le traitement
              automatique et la livraison des modèles et outils en 48h ouvrées. Le paiement
              est exigible avant le début du traitement.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-3">4. Quotas projets</h2>
            <p>
              Chaque formule mensuelle donne droit à un nombre défini de projets par mois.
              Les projets non utilisés ne sont pas reportés au mois suivant. Le passage à
              une formule supérieure est possible à tout moment.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-3">5. Qualité des photos</h2>
            <p>
              La qualité du modèle 3D dépend directement de la qualité des photos fournies
              par le client. AltiMetrix fournit des tutoriels et un Mission Planner pour
              garantir une captation optimale, mais ne peut être tenu responsable d&apos;un
              résultat insuffisant dû à des photos de mauvaise qualité.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-3">6. Propriété des données</h2>
            <p>
              Les photos uploadées et les modèles 3D générés restent la propriété exclusive
              du client. AltiMetrix ne revendique aucun droit de propriété sur ces données.
              Le client accorde à AltiMetrix une licence non exclusive pour le traitement
              et l&apos;amélioration de ses algorithmes.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-3">7. Paiement</h2>
            <p>
              Les paiements sont effectués par carte bancaire via Stripe. Les abonnements
              sont prélevés automatiquement au début de chaque période. En cas d&apos;échec
              de paiement, le compte est suspendu après 7 jours de délai.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-3">8. Service après-vente</h2>
            <p>
              Le support technique est assuré par email sous 24h ouvrées. Les clients
              des formules Pro et Solaire Pro bénéficient d&apos;un support prioritaire
              avec réponse sous 4h ouvrées.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
