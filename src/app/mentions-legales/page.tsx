import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales AltiMetrix — photogrammétrie par drone.",
};

export default function MentionsLegalesPage() {
  return (
    <div className="bg-white py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-sm max-w-none">
        <h1 className="text-3xl font-bold text-dark-800 mb-8 font-heading">Mentions légales</h1>

        <h2>Éditeur</h2>
        <p><strong>AltiMetrix SAS</strong><br />
        SAS au capital de 10 000 €<br />
        RCS Toulouse 987 654 321<br />
        TVA : FR98987654321<br />
        1 Place Occitane, 31000 Toulouse<br />
        Email : contact@altimetrix.fr<br />
        Tél. : 05 00 00 00 00</p>

        <h2>Directeur de publication</h2>
        <p>Valentin M., Président</p>

        <h2>Hébergement</h2>
        <p><strong>Vercel Inc.</strong><br />
        340 S Lemon Ave, Walnut, CA 91789, USA<br />
        Données hébergées chez <strong>Supabase</strong> (USA)<br />
        Photos hébergées sur <strong>AWS S3</strong> (UE)</p>

        <h2>Propriété intellectuelle</h2>
        <p>L&apos;ensemble du site (contenu, design, algorithmes) est la propriété d&apos;AltiMetrix SAS. Toute reproduction sans autorisation est interdite.</p>

        <h2>Droit applicable</h2>
        <p>Droit français. Tribunal de commerce de Toulouse.</p>
      </div>
    </div>
  );
}
