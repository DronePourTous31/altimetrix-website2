import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { uploadToR2Altimetrix, R2_ALTIMETRIX_PUBLIC_URL } from "@/lib/r2";

const ADMIN_IDS = ["cacfc3e4-e408-47f6-bc37-04d813625606"];

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Non authé" }, { status: 401 });
  }
  const token = authHeader.slice(7);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      cookies: { getAll: () => [], setAll: () => {} },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authé" }, { status: 401 });
  if (!ADMIN_IDS.includes(user.id)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const projetId = formData.get("projetId") as string;
    const clientName = formData.get("clientName") as string;
    const projectName = formData.get("projectName") as string;

    if (!file || !projetId || !clientName || !projectName) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Seuls les fichiers PDF sont acceptés" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = sanitize(file.name);

    const key = `clients/${clientName}/${projectName}/RAPPORTS/${filename}`;
    await uploadToR2Altimetrix(key, buffer, "application/pdf");
    const url = `${R2_ALTIMETRIX_PUBLIC_URL}/altimetrix/${key}`;

    const { data: projet } = await admin
      .from("projets")
      .select("rapports_pdf")
      .eq("id", projetId)
      .single();

    const rapports = Array.isArray(projet?.rapports_pdf) ? projet.rapports_pdf : [];
    const rapportsUpdated = [
      ...rapports.filter((r: { nom: string; url: string } | null) => r?.nom !== filename),
      { nom: filename, url },
    ];

    const { error } = await admin
      .from("projets")
      .update({ rapports_pdf: rapportsUpdated })
      .eq("id", projetId);

    if (error) {
      console.error("Rapport DB update error:", error.message);
      return NextResponse.json({ error: "Erreur enregistrement rapport" }, { status: 500 });
    }

    return NextResponse.json({ success: true, rapports: rapportsUpdated });
  } catch (err) {
    console.error("Rapport upload error:", err);
    return NextResponse.json({ error: "Erreur upload rapport" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Non authé" }, { status: 401 });
  }
  const token = authHeader.slice(7);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      cookies: { getAll: () => [], setAll: () => {} },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authé" }, { status: 401 });
  if (!ADMIN_IDS.includes(user.id)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const body = await req.json().catch(() => ({}));
  const { projetId, nom } = body;
  if (!projetId || !nom) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const { data: projet } = await admin
    .from("projets")
    .select("rapports_pdf")
    .eq("id", projetId)
    .single();

  const rapports = Array.isArray(projet?.rapports_pdf) ? projet.rapports_pdf : [];
  const rapportsUpdated = rapports.filter((r: { nom: string; url: string } | null) => r?.nom !== nom);

  const { error } = await admin
    .from("projets")
    .update({ rapports_pdf: rapportsUpdated })
    .eq("id", projetId);

  if (error) {
    return NextResponse.json({ error: "Erreur suppression rapport" }, { status: 500 });
  }

  return NextResponse.json({ success: true, rapports: rapportsUpdated });
}
