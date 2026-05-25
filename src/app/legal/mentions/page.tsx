import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function MentionsLegalesPage() {
  return (
    <section className="pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link href="/" className="text-sm text-gray-400 hover:text-cyan-400 flex items-center gap-1 mb-4">
          <ChevronRight className="w-3 h-3 rotate-180" /> Accueil
        </Link>
        <h1 className="text-3xl font-bold mb-8">Mentions légales</h1>

        <div className="prose prose-invert max-w-none space-y-6 text-gray-400 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">1. Éditeur du site</h2>
            <p>
              Le site AltiMetrix.fr est édité par la société AltiMetrix, SAS au capital
              de 1 000€, immatriculée au RCS de Paris sous le numéro XXX XXX XXX.
            </p>
            <p className="mt-2">
              Siège social : 12 Rue de la Photogrammétrie, 75001 Paris
              <br />
              Email : contact@altimetrix.fr
              <br />
              Téléphone : +33 (0)6 12 34 56 78
              <br />
              Directeur de la publication : [Nom du dirigeant]
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-3">2. Hébergement</h2>
            <p>
              Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-3">3. Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble des contenus présents sur le site AltiMetrix.fr (textes, images,
              vidéos, logos, marques, modèles 3D) est protégé par le droit d&apos;auteur et
              le droit des marques. Toute reproduction, représentation, modification ou
              exploitation, totale ou partielle, sans autorisation préalable est interdite.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-3">4. Responsabilité</h2>
            <p>
              AltiMetrix s&apos;efforce d&apos;assurer l&apos;exactitude des informations publiées
              sur le site. Toutefois, nous ne pouvons garantir l&apos;absence d&apos;erreurs ou
              d&apos;omissions. Les modèles 3D, mesures et analyses fournis via la plateforme
              sont donnés à titre indicatif et ne sauraient engager la responsabilité
              d&apos;AltiMetrix en cas d&apos;erreur de mesure ou d&apos;interprétation.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-3">5. Droit applicable</h2>
            <p>
              Les présentes mentions légales sont régies par le droit français. En cas de
              litige, les tribunaux français seront seuls compétents.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
