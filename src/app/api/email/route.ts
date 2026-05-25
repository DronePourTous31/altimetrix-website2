import { NextResponse } from "next/server";
import { sendEmail, welcomeEmailHtml, uploadReceivedHtml, projectReadyHtml, subscriptionExpiryHtml } from "@/emails/templates";

export async function POST(req: Request) {
  const { type, to, prenom, projetNom, projetUrl } = await req.json();

  const templates: Record<string, () => string> = {
    welcome: () => welcomeEmailHtml(prenom),
    upload_received: () => uploadReceivedHtml(prenom, projetNom || "Projet"),
    project_ready: () => projectReadyHtml(prenom, projetNom || "Projet", projetUrl || "#"),
    subscription_expiry: () => subscriptionExpiryHtml(prenom),
  };

  const templateFn = templates[type];
  if (!templateFn) {
    return NextResponse.json({ error: "Type d&apos;email invalide" }, { status: 400 });
  }

  const subjects: Record<string, string> = {
    welcome: "Bienvenue sur AltiMetrix",
    upload_received: "Upload reçu — votre projet est en cours",
    project_ready: "Votre modèle 3D est prêt !",
    subscription_expiry: "Votre abonnement expire dans 7 jours",
  };

  await sendEmail({
    to,
    subject: subjects[type] || "AltiMetrix",
    html: templateFn(),
  });

  return NextResponse.json({ success: true });
}
