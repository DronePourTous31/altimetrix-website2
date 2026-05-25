"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FolderPlus, FolderOpen, Map, User, LogOut,
  ChevronRight, Lock, Shield,
} from "lucide-react";

interface DashboardSidebarProps {
  prenom: string;
  nom: string;
  typeCompte: string;
  abonnementActif: boolean;
  role?: string;
}

const navItems = (prenom: string, nom: string, role?: string) => {
  const items: { icon: any; label: string; href: string; requiresSubscription?: boolean }[] = [
    { icon: LayoutDashboard, label: "Tableau de bord", href: "/dashboard" },
    { icon: FolderPlus, label: "Nouveau projet", href: "/dashboard/nouveau-projet" },
    { icon: FolderOpen, label: "Mes projets", href: "/dashboard/projets" },
    { icon: Map, label: "Mission Planner", href: "/dashboard/mission-planner", requiresSubscription: true },
    { icon: User, label: `${prenom} ${nom}`, href: "/dashboard/mon-compte" },
  ];
  if (role === "admin") {
    items.push({
      icon: Shield,
      label: "Administration",
      href: "/dashboard/admin",
    });
  }
  return items;
};

export default function DashboardSidebar({ prenom, nom, typeCompte, abonnementActif, role }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-anthracite-800 border-r border-anthracite-700 flex flex-col shrink-0 hidden lg:flex">
      <div className="p-6 border-b border-anthracite-700">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 gradient-cyan rounded-lg flex items-center justify-center font-bold text-white text-sm">A</div>
          <div>
            <span className="text-base font-bold text-white">Alti<span className="text-cyan-400">Metrix</span></span>
          </div>
        </Link>
      </div>

      <div className="p-4 border-b border-anthracite-700">
        <p className="text-sm font-medium text-white truncate">{prenom} {nom}</p>
        <p className="text-xs text-gray-500 capitalize">{typeCompte === "artisan" ? "Artisan" : "Particulier"}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems(prenom, nom, role).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const locked = item.requiresSubscription && !abonnementActif;

          return (
            <Link
              key={item.href}
              href={locked ? "/dashboard/abonnement-requis" : item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                isActive
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-gray-400 hover:text-white hover:bg-anthracite-700"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {locked && <Lock className="w-3 h-3 text-gray-600" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-anthracite-700">
        <Link
          href="/auth/logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-anthracite-700 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </Link>
      </div>
    </aside>
  );
}
