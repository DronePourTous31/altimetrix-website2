import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_placeholder") {
    console.log(`[EMAIL MOCK] To: ${to} | Subject: ${subject}`);
    return;
  }

  try {
    await resend.emails.send({
      from: "AltiMetrix <noreply@altimetrix.fr>",
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("Resend error:", err);
  }
}

export function welcomeEmailHtml(prenom: string): string {
  return `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:#00BCD4;padding:20px;text-align:center">
    <h1 style="color:#fff;font-family:Syne,sans-serif;margin:0">AltiMetrix</h1>
  </div>
  <div style="padding:32px;background:#fff">
    <h2 style="color:#1A202C">Bienvenue ${prenom} !</h2>
    <p style="color:#4A5568">Merci de votre inscription sur AltiMetrix. Votre compte est prêt.</p>
    <p style="color:#4A5568">Pour commencer :</p>
    <ul style="color:#4A5568"><li>Choisissez un forfait adapté à vos besoins</li><li>Créez votre premier projet</li><li>Uploader vos photos drone</li></ul>
    <a href="https://altimetrix.fr/tarifs" style="display:inline-block;padding:12px 24px;background:#00BCD4;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Voir les offres</a>
  </div>
  <div style="padding:16px;text-align:center;color:#A0AEC0;font-size:12px">© ${new Date().getFullYear()} AltiMetrix SAS</div>
</div>`;
}

export function uploadReceivedHtml(prenom: string, projetNom: string): string {
  return `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:#00BCD4;padding:20px;text-align:center">
    <h1 style="color:#fff;font-family:Syne,sans-serif;margin:0">AltiMetrix</h1>
  </div>
  <div style="padding:32px;background:#fff">
    <h2 style="color:#1A202C">Upload reçu !</h2>
    <p style="color:#4A5568">Bonjour ${prenom},</p>
    <p style="color:#4A5568">Nous avons bien reçu vos photos pour le projet <strong>${projetNom}</strong>.</p>
    <p style="color:#4A5568">Le traitement commence sous 24-48h ouvrées. Vous recevrez une notification dès que votre modèle sera prêt.</p>
    <a href="https://altimetrix.fr/dashboard/projets" style="display:inline-block;padding:12px 24px;background:#00BCD4;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Suivre mon projet</a>
  </div>
  <div style="padding:16px;text-align:center;color:#A0AEC0;font-size:12px">© ${new Date().getFullYear()} AltiMetrix SAS</div>
</div>`;
}

export function projectReadyHtml(prenom: string, projetNom: string, projetUrl: string): string {
  return `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:#00BCD4;padding:20px;text-align:center">
    <h1 style="color:#fff;font-family:Syne,sans-serif;margin:0">AltiMetrix</h1>
  </div>
  <div style="padding:32px;background:#fff">
    <h2 style="color:#1A202C">Votre modèle est prêt !</h2>
    <p style="color:#4A5568">Bonjour ${prenom},</p>
    <p style="color:#4A5568">Le projet <strong>${projetNom}</strong> est terminé. Vous pouvez dès à présent visualiser votre modèle 3D, prendre des mesures et télécharger votre rapport.</p>
    <a href="${projetUrl}" style="display:inline-block;padding:12px 24px;background:#00BCD4;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Voir mon modèle</a>
  </div>
  <div style="padding:16px;text-align:center;color:#A0AEC0;font-size:12px">© ${new Date().getFullYear()} AltiMetrix SAS</div>
</div>`;
}

export function subscriptionExpiryHtml(prenom: string): string {
  return `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:#ED8936;padding:20px;text-align:center">
    <h1 style="color:#fff;font-family:Syne,sans-serif;margin:0">AltiMetrix</h1>
  </div>
  <div style="padding:32px;background:#fff">
    <h2 style="color:#1A202C">Votre abonnement expire bientôt</h2>
    <p style="color:#4A5568">Bonjour ${prenom},</p>
    <p style="color:#4A5568">Votre abonnement AltiMetrix expire dans 7 jours. Pour continuer à profiter de vos projets et fonctionnalités, pensez à le renouveler.</p>
    <a href="https://altimetrix.fr/dashboard/mon-compte" style="display:inline-block;padding:12px 24px;background:#ED8936;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Gérer mon abonnement</a>
  </div>
  <div style="padding:16px;text-align:center;color:#A0AEC0;font-size:12px">© ${new Date().getFullYear()} AltiMetrix SAS</div>
</div>`;
}
