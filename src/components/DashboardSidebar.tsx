"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, FolderPlus, FolderOpen, Map, User, LogOut,
  ChevronRight, Lock, Shield, Menu, X,
} from "lucide-react";
import { getAuthToken } from "@/lib/supabase/client";

const ADMIN_IDS = ["cacfc3e4-e408-47f6-bc37-04d813625606"];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    getAuthToken().then(async (token) => {
      if (!token) return;
      const res = await fetch("/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    });
  }, []);

  const prenom = user?.prenom || "";
  const nom = user?.nom || "";
  const displayName = prenom || nom ? `${prenom} ${nom}`.trim() : user?.email || "Mon compte";
  const isAdmin = !!user?.id && ADMIN_IDS.includes(user.id);
  const abonnementActif = user?.abonnement_actif ?? false;

  const navItems: { icon: any; label: string; href: string; requiresSubscription?: boolean }[] = [
    { icon: LayoutDashboard, label: "Tableau de bord", href: "/dashboard" },
    { icon: FolderPlus, label: "Nouveau projet", href: "/dashboard/nouveau-projet" },
    { icon: FolderOpen, label: "Mes projets", href: "/dashboard/projets" },
    { icon: Map, label: "Mission Planner", href: "/dashboard/mission-planner", requiresSubscription: true },
    { icon: User, label: displayName, href: "/dashboard/mon-compte" },
  ];

  if (isAdmin) {
    navItems.push({ icon: Shield, label: "Administration", href: "/dashboard/admin" });
  }

  const handleLogout = () => {
    window.location.href = "/auth/logout";
  };

  const sidebarContent = (
    <>
      <div className="p-4 lg:p-6 border-b border-anthracite-700">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 gradient-cyan rounded-lg flex items-center justify-center font-bold text-white text-sm">A</div>
          <div>
            <span className="text-base font-bold text-white">Alti<span className="text-cyan-400">Metrix</span></span>
          </div>
        </Link>
      </div>

      {user && (
        <div className="p-4 border-b border-anthracite-700">
          <p className="text-sm font-medium text-white truncate">{displayName}</p>
          <p className="text-xs text-gray-500 capitalize">
            {user?.type_compte === "artisan" ? "Artisan / Pro" : "Particulier"}
          </p>
        </div>
      )}

      <nav className="flex-1 p-3 lg:p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const locked = item.requiresSubscription && !abonnementActif;

          return (
            <Link
              key={item.href}
              href={locked ? "/dashboard/abonnement-requis" : item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                isActive
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-gray-400 hover:text-white hover:bg-anthracite-700"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {locked && <Lock className="w-3 h-3 text-gray-600" />}
              {!locked && isActive && <ChevronRight className="w-3 h-3 text-cyan-400" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 lg:p-4 border-t border-anthracite-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-anthracite-700 transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-20 left-4 z-40 bg-anthracite-800 border border-anthracite-700 rounded-xl p-2.5 text-gray-400 hover:text-white transition-colors shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-anthracite-800 border-r border-anthracite-700 flex flex-col transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-anthracite-700">
          <Link href="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <div className="w-8 h-8 gradient-cyan rounded-lg flex items-center justify-center font-bold text-white text-sm">A</div>
            <span className="text-base font-bold text-white">Alti<span className="text-cyan-400">Metrix</span></span>
          </Link>
          <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-anthracite-800 border-r border-anthracite-700 flex-col shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}
