import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@/lib/supabase/server";
import { uploadToR2, r2Key } from "@/lib/r2";
import fs from "fs";
import path from "path";

const CLIENTS_ROOT = process.env.CLIENTS_ROOT || "F:\\DRONE\\ALTIMETRIX\\CLIENTS";

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  let supabase;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        cookies: { getAll: () => [], setAll: () => {} },
      }
    );
  } else {
    supabase = await createClient();
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authé" }, { status: 401 });

  try {
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
    const contentType = ext === ".dng"
      ? "image/x-adobe-dng"
      : `image/${ext.slice(1)}`;

    // R2 upload si configuré
    const r2Configured = !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY && process.env.R2_SECRET_KEY);
    if (r2Configured) {
      try {
        const key = r2Key(clientName, projectName, category, file.name);
        await uploadToR2(key, buffer, contentType);
        const storagePath = `r2://${process.env.R2_BUCKET || "altimetrix-uploads"}/clients/${clientName}/${projectName}`;
        await supabase.from("projets").update({ storage_path_input: storagePath }).eq("id", projetId);
        return NextResponse.json({ success: true, filename: file.name, size: buffer.length, type: category, storage: "r2" });
      } catch (err) {
        console.error("R2 upload error:", err);
        return NextResponse.json({ error: "Erreur upload R2" }, { status: 500 });
      }
    }

    // Fallback local (dev)
    const dir = path.join(CLIENTS_ROOT, clientName, projectName, "PHOTOS", category);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, file.name), buffer);

    await supabase.from("projets").update({
      storage_path_input: path.join(CLIENTS_ROOT, clientName, projectName),
    }).eq("id", projetId);

    return NextResponse.json({ success: true, filename: file.name, size: buffer.length, storage: "local" });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Erreur upload" }, { status: 500 });
  }
}
