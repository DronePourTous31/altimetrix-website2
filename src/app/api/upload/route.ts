import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import fs from "fs";
import path from "path";

const CLIENTS_ROOT = "F:\\DRONE\\ALTIMETRIX\\CLIENTS";

export async function POST(req: Request) {
  const supabase = await createClient();
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

    // Structure: CLIENTS/{clientName}/{projectName}/PHOTOS/{category}/
    const dir = path.join(CLIENTS_ROOT, clientName, projectName, "PHOTOS", category);
    const filepath = path.join(dir, file.name);

    fs.mkdirSync(dir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filepath, buffer);

    // Update storage path in Supabase
    await supabase.from("projets").update({
      storage_path_input: path.join(CLIENTS_ROOT, clientName, projectName),
    }).eq("id", projetId);

    return NextResponse.json({ success: true, filename: file.name, size: buffer.length, path: filepath });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Erreur écriture fichier" }, { status: 500 });
  }
}
