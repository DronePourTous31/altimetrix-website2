"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import Logo from "./ui/Logo";
import Button from "./ui/Button";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/tutoriels", label: "Tutoriels" },
  { href: "/demo", label: "Démo 3D" },
  { href: "/mission-planner", label: "Mission Planner" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-dark-800 text-white sticky top-0 z-50 border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-700 transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
            <div className="ml-3 pl-3 border-l border-dark-600">
              <Link href="/auth/login">
                <Button variant="primary" size="sm">
                  Démarrer <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-dark-700 transition-colors"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1 border-t border-dark-700 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-dark-300 hover:text-white hover:bg-dark-700 transition-colors text-sm"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 mt-3 border-t border-dark-700">
              <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                <Button variant="primary" size="md" className="w-full">
                  Démarrer <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
