"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function CheckoutButton({
  planId, annual, calepinage, children, highlighted,
}: {
  planId: string;
  annual: boolean;
  calepinage?: boolean;
  children: React.ReactNode;
  highlighted?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await createClient().auth.getSession();
      const token = session?.access_token;
      if (!token) { router.push("/auth/login"); return; }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ planId, annual, calepinage: !!calepinage }),
      });

      if (!res.ok) { router.push("/auth/login"); return; }

      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      router.push("/auth/login");
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`block w-full py-3 text-center text-sm font-medium rounded-xl transition-all ${
        loading ? "opacity-50 pointer-events-none" : ""
      } ${
        highlighted
          ? "gradient-cyan text-white hover:opacity-90 hover:shadow-lg hover:shadow-cyan-500/25"
          : "bg-transparent border border-anthracite-600 text-gray-300 hover:border-cyan-500 hover:text-cyan-400"
      }`}
    >
      {loading ? "Redirection..." : children}
    </button>
  );
}
