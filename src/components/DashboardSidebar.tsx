"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderPlus, Plus, User, LogOut } from "lucide-react";

interface SidebarProps {
  prenom: string;
  nom: string;
  typeCompte: string;
  abonnementActif: boolean;
}

const links = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/projets", label: "Mes projets", icon: FolderPlus },
  { href: "/dashboard/nouveau-projet", label: "Nouveau projet", icon: Plus },
  { href: "/dashboard/mon-compte", label: "Mon compte", icon: User },
];

export default function DashboardSidebar({ prenom, nom, typeCompte, abonnementActif }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-dark-800 text-white hidden lg:flex flex-col">
      <div className="p-4 border-b border-dark-700">
        <p className="text-sm font-medium text-white truncate">
          {prenom} {nom}
        </p>
        <p className="text-xs text-dark-400 mt-0.5">
          {typeCompte === "artisan" ? "Artisan" : "Particulier"}
        </p>
      </div>
      <nav className="p-3 space-y-0.5 flex-1">
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                isActive
                  ? "bg-dark-700 text-white"
                  : "text-dark-300 hover:text-white hover:bg-dark-700"
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-dark-700">
        <a
          href="/auth/logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </a>
      </div>
    </aside>
  );
}
