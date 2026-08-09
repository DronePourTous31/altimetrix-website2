import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { copyToAltimetrix, R2_ALTIMETRIX_PUBLIC_URL, sanitizeKeyPart } from "@/lib/r2";
import fs from "fs";
import path from "path";

const ADMIN_IDS = ["cacfc3e4-e408-47f6-bc37-04d813625606"];
const CLIENTS_ROOT = process.env.CLIENTS_ROOT || "F:\\DRONE\\ALTIMETRIX\\CLIENTS";

function sanitize(name: string) {
  return sanitizeKeyPart(name);
}

async function verifyAdmin(req: Request, token: string) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      cookies: { getAll: () => [], setAll: () => {} },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  if (!ADMIN_IDS.includes(user.id)) return false;
  return true;
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Non authé" }, { status: 401 });
  }
  const token = authHeader.slice(7);

  if (!(await verifyAdmin(req, token))) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const contentType = req.headers.get("content-type") || "";

    // Mode JSON : l'admin a déjà uploadé la photo en direct navigateur → R2
    // via URL pré-signée (contourne la limite de 4,5 Mo de Vercel). Ici on
    // copie l'objet vers le bucket public (galerie) et on met à jour la DB.
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { projetId, category, filename, clientName, projectName } = body;
      if (!projetId || !category || !filename || !clientName || !projectName) {
        return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
      }

      const safeFilename = sanitize(filename);
      const safeClient = sanitize(clientName);
      const safeProject = sanitize(projectName);
      const sourceKey = `clients/${safeClient}/${safeProject}/PHOTOS/${category}/${safeFilename}`;
      const destKey = sourceKey;

      try {
        await copyToAltimetrix(sourceKey, destKey);
      } catch (err) {
        console.error("CopyObject R2 error:", err);
        return NextResponse.json({ error: "Erreur copie publique R2" }, { status: 500 });
      }

      const publicUrl = `${R2_ALTIMETRIX_PUBLIC_URL}/altimetrix/${destKey}`;

      const { data: projet } = await admin
        .from("projets")
        .select("photos_uploaded")
        .eq("id", projetId)
        .single();
      const photos = Array.isArray(projet?.photos_uploaded) ? projet.photos_uploaded : [];
      const photosUpdated = [
        ...photos.filter((p: { category?: string; filename?: string } | null) => !(p?.category === category && p?.filename === safeFilename)),
        { category, filename: safeFilename, url: publicUrl },
      ];

      await admin.from("projets").update({
        storage_path_input: `r2://${process.env.R2_BUCKET || "altimetrix-uploads"}/clients/${safeClient}/${safeProject}`,
        photos_uploaded: photosUpdated,
      }).eq("id", projetId);

      return NextResponse.json({ success: true, filename: safeFilename, storage: "r2" });
    }

    // Mode multipart (fallback) : upload complet via le serveur.
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const projetId = formData.get("projetId") as string;
    const category = formData.get("category") as string;
    const clientName = formData.get("clientName") as string;
    const projectName = formData.get("projectName") as string;

    if (!file || !projetId || !category || !clientName || !projectName) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name).toLowerCase();
    const ct = ext === ".dng"
      ? "image/x-adobe-dng"
      : `image/${ext.slice(1)}`;

    // R2 upload si configuré (service role pour bypasser la RLS : le projet
    // appartient au client, pas à l'admin qui uploade).
    const r2Configured = !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY && process.env.R2_SECRET_KEY);
    if (r2Configured) {
      try {
        const { uploadToR2, r2Key } = await import("@/lib/r2");
        const key = r2Key(clientName, projectName, category, file.name);
        await uploadToR2(key, buffer, ct);
        const safeClient = sanitize(clientName);
        const safeProject = sanitize(projectName);
        const storagePath = `r2://${process.env.R2_BUCKET || "altimetrix-uploads"}/clients/${safeClient}/${safeProject}`;

        // Copie publique (bucket altimetrix) : donne accès au client aux
        // photos du vol qu'il a payées (galerie sur la page projet).
        const filename = sanitize(file.name);
        const publicKey = `clients/${safeClient}/${safeProject}/PHOTOS/${category}/${filename}`;
        await copyToAltimetrix(key, publicKey);
        const publicUrl = `${R2_ALTIMETRIX_PUBLIC_URL}/altimetrix/${publicKey}`;

        const { data: projet } = await admin
          .from("projets")
          .select("photos_uploaded")
          .eq("id", projetId)
          .single();
        const photos = Array.isArray(projet?.photos_uploaded) ? projet.photos_uploaded : [];
        const photosUpdated = [
          ...photos.filter((p: { category?: string; filename?: string } | null) => !(p?.category === category && p?.filename === filename)),
          { category, filename, url: publicUrl },
        ];

        await admin.from("projets").update({
          storage_path_input: storagePath,
          photos_uploaded: photosUpdated,
        }).eq("id", projetId);
        return NextResponse.json({ success: true, filename: file.name, size: buffer.length, type: category, storage: "r2" });
      } catch (err) {
        console.error("R2 upload error:", err);
        return NextResponse.json({ error: "Erreur upload R2" }, { status: 500 });
      }
    }

    // Fallback local (dev)
    const dir = path.join(CLIENTS_ROOT, sanitize(clientName), sanitize(projectName), "PHOTOS", category);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, sanitize(file.name)), buffer);

    await admin.from("projets").update({
      storage_path_input: path.join(CLIENTS_ROOT, sanitize(clientName), sanitize(projectName)),
    }).eq("id", projetId);

    return NextResponse.json({ success: true, filename: file.name, size: buffer.length, storage: "local" });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Erreur upload" }, { status: 500 });
  }
}
