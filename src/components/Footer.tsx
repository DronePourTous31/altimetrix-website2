import Link from "next/link";
import Logo from "./ui/Logo";

const footerLinks = [
  {
    title: "Services",
    links: [
      "Modélisation 3D",
      "DSM & orthophotos",
      "Analyse d'irradiation",
      "Calepinage solaire",
      "Rapports PDF",
    ],
  },
  {
    title: "Liens",
    links: [
      { label: "Tarifs", href: "/tarifs" },
      { label: "Tutoriels", href: "/tutoriels" },
      { label: "Démo 3D", href: "/demo" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Mentions légales", href: "/mentions-legales" },
      { label: "CGU", href: "/cgu" },
      { label: "Confidentialité", href: "/confidentialite" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-dark-800 text-dark-400 border-t border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Logo className="mb-4" />
            <p className="text-sm leading-relaxed">
              Photogrammétrie drone pour les professionnels. Mesures, modélisation 3D et analyses solaires.
            </p>
          </div>
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">
                {group.title}
              </h4>
              <ul className="space-y-2">
                {group.links.map((link) => {
                  if (typeof link === "string") {
                    return (
                      <li key={link} className="text-sm">
                        {link}
                      </li>
                    );
                  }
                  return (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm hover:text-primary-400 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-dark-700 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} AltiMetrix. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-primary-400 transition-colors" aria-label="LinkedIn">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
            <a href="#" className="hover:text-primary-400 transition-colors" aria-label="YouTube">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
