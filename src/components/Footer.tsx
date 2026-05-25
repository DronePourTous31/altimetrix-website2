import Link from "next/link";

const footerLinks = {
  services: [
    { label: "Photogrammétrie", href: "/services#photogrammetrie" },
    { label: "Mesures & Calepinage", href: "/services#mesures" },
    { label: "Analyse Solaire", href: "/services#solaire" },
    { label: "Rapports & Devis", href: "/services#devis" },
  ],
  resources: [
    { label: "Tutoriels", href: "/tutorials" },
    { label: "Démo interactive", href: "/demo" },
    { label: "Mission Planner", href: "/mission-planner" },
    { label: "Blog", href: "#" },
  ],
  company: [
    { label: "À propos", href: "/about" },
    { label: "Tarifs", href: "/pricing" },
    { label: "Contact", href: "/contact" },
    { label: "Espace client", href: "/auth/login" },
  ],
  legal: [
    { label: "Mentions légales", href: "/legal/mentions" },
    { label: "Politique RGPD", href: "/legal/rgpd" },
    { label: "CGV", href: "/legal/cgv" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-anthracite-900 border-t border-anthracite-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 gradient-cyan rounded-lg flex items-center justify-center font-bold text-white">
                A
              </div>
              <span className="text-lg font-bold text-white">
                Alti<span className="text-cyan-400">Metrix</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Photogrammétrie par drone professionnelle. Transformez vos photos en modèles 3D précis.
            </p>
            <div className="flex gap-3">
              {["linkedin", "youtube", "twitter"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-anthracite-800 flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:bg-anthracite-700 transition-colors"
                >
                  <span className="text-xs uppercase font-bold">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {title === "services" ? "Services" :
                 title === "resources" ? "Ressources" :
                 title === "company" ? "Société" : "Légal"}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-anthracite-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} AltiMetrix. Tous droits réservés.
          </p>
          <p className="text-xs text-gray-600">
            Photogrammétrie par drone - Solution SaaS professionnelle
          </p>
        </div>
      </div>
    </footer>
  );
}
