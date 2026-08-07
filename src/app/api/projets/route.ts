import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { deleteR2Prefix, deleteR2AltimetrixPrefix } from "@/lib/r2";

const R2_PUBLIC = "https://pub-0459c8bf6e9348e592f4decd8b6bab91.r2.dev";
const R2_BASE = `${R2_PUBLIC}/altimetrix/shared`;
const R2_CLIENT = `${R2_PUBLIC}/altimetrix`;

async function authUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const authResp = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
  });
  if (!authResp.ok) return null;
  const user = await authResp.json();
  return { user, token };
}

function getSupabase(token: string) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: serviceKey
        ? { headers: { Authorization: `Bearer ${serviceKey}` } }
        : { headers: { Authorization: `Bearer ${token}` } },
      cookies: { getAll: () => [], setAll: () => {} },
    }
  );
}

export async function GET(req: Request) {
  const auth = await authUser(req);
  if (!auth) return NextResponse.json({ error: "Non authé" }, { status: 401 });
  const { user, token } = auth;
  const supabase = getSupabase(token);

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const base = supabase.from("projets").select("*").eq("user_id", user.id);

  function enrich(p: any) {
    if (!p || p.statut !== "livre") return p;
    const clientMatch = p.storage_path_input?.match(/(?:CLIENTS[\\/]|clients\/)(.+)$/i);
    const clientName = clientMatch ? clientMatch[1].replace(/\\/g, '/') : p.nom;
    return {
      ...p,
      viewer_3d_url: `${R2_BASE}/index_3D.html?client=${clientName}&edit=1`,
      viewer_2d_url: `${R2_BASE}/index_2D.html?client=${clientName}&edit=1`,
      url_3d: `${R2_BASE}/index_3D.html?client=${clientName}&edit=1`,
      url_2d: `${R2_BASE}/index_2D.html?client=${clientName}&edit=1`,
      viewer_url: `${R2_BASE}/index_3D.html?client=${clientName}&edit=1`,
      rapport_url: `${R2_BASE}/index_2D.html?client=${clientName}&edit=1`,
      rapport_webodm_url: `${R2_CLIENT}/clients/${clientName}/rapport_photogrammetrie.pdf`,
    };
  }

  if (id) {
    const { data, error } = await base.eq("id", id).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ projets: enrich(data) });
  }

  const { data, error } = await base.order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ projets: (data || []).map(enrich) });
}

export async function DELETE(req: Request) {
  const auth = await authUser(req);
  if (!auth) return NextResponse.json({ error: "Non authé" }, { status: 401 });
  const { user, token } = auth;
  const supabase = getSupabase(token);

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const { data: projet, error: findErr } = await supabase
    .from("projets").select("*").eq("id", id).eq("user_id", user.id).single();
  if (findErr || !projet) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });

  // Nettoyer R2 (uniquement les fichiers du client, PAS les viewers partagés)
  const clientMatch = projet.storage_path_input?.match(/(?:CLIENTS[\\/]|clients\/)(.+)$/i);
  const clientName = clientMatch?.[1].replace(/\\/g, '/') || projet.nom;
  try { await deleteR2AltimetrixPrefix(`clients/${clientName}`); } catch {}
  try { await deleteR2Prefix(`clients/${clientName}`); } catch {}

  // Supprimer l'entrée DB
  const { error: delErr } = await supabase.from("projets").delete().eq("id", id);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  return NextResponse.json({
    success: true,
    details: ["Projet supprimé (R2 + DB) — le watcher nettoie les fichiers locaux et WebODM"],
  });
}
