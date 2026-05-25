"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";

const navItems = [
  { label: "Accueil", href: "/" },
  {
    label: "Services",
    href: "/services",
    children: [
      { label: "Photogrammétrie", href: "/services#photogrammetrie" },
      { label: "Mesures & Calepinage", href: "/services#mesures" },
      { label: "Analyse Solaire", href: "/services#solaire" },
      { label: "Rapports & Devis", href: "/services#devis" },
    ],
  },
  { label: "Tarifs", href: "/pricing" },
  { label: "Démo 3D", href: "/demo" },
  { label: "Mission Planner", href: "/mission-planner" },
  { label: "Tutoriels", href: "/tutorials" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-anthracite-900/95 backdrop-blur-md shadow-lg shadow-cyan-500/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 gradient-cyan rounded-lg flex items-center justify-center font-bold text-white text-lg transition-transform group-hover:scale-110">
              A
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white tracking-tight">
                Alti<span className="text-cyan-400">Metrix</span>
              </span>
              <span className="text-[10px] text-cyan-400/60 tracking-widest uppercase -mt-1">
                Photogrammétrie
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setDropdownOpen(item.label)}
                onMouseLeave={() => setDropdownOpen(null)}
              >
                {item.children ? (
                  <button className="flex items-center gap-1 px-4 py-2 text-sm text-gray-300 hover:text-cyan-400 transition-colors rounded-lg hover:bg-anthracite-800/50">
                    {item.label}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className="block px-4 py-2 text-sm text-gray-300 hover:text-cyan-400 transition-colors rounded-lg hover:bg-anthracite-800/50"
                  >
                    {item.label}
                  </Link>
                )}
                {item.children && dropdownOpen === item.label && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-anthracite-800 border border-anthracite-700 rounded-xl shadow-2xl shadow-cyan-500/10 py-2 animate-slide-up">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block px-4 py-2.5 text-sm text-gray-300 hover:text-cyan-400 hover:bg-anthracite-700/50 transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="ml-4 flex items-center gap-3">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/auth/register"
                className="px-5 py-2.5 text-sm font-medium text-white gradient-cyan rounded-lg hover:opacity-90 transition-all hover:shadow-lg hover:shadow-cyan-500/25"
              >
                Essai gratuit
              </Link>
            </div>
          </div>

          <button
            className="lg:hidden text-white p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-anthracite-900/98 backdrop-blur-md border-t border-anthracite-700 animate-slide-up">
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <>
                    <span className="block px-3 py-2 text-sm font-medium text-gray-400 uppercase tracking-wider">
                      {item.label}
                    </span>
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block px-6 py-2 text-sm text-gray-300 hover:text-cyan-400"
                        onClick={() => setIsOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="block px-3 py-2.5 text-sm text-gray-300 hover:text-cyan-400 hover:bg-anthracite-800 rounded-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            <hr className="border-anthracite-700 my-3" />
            <Link
              href="/auth/login"
              className="block px-3 py-2.5 text-sm text-gray-300"
              onClick={() => setIsOpen(false)}
            >
              Connexion
            </Link>
            <Link
              href="/auth/register"
              className="block px-3 py-2.5 text-sm font-medium text-white gradient-cyan rounded-lg text-center mt-2"
              onClick={() => setIsOpen(false)}
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
