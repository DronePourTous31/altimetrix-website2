"use client";

export function ChecklistButton() {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const printWin = window.open("", "_blank");
    if (!printWin) return;
    printWin.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Checklist captation AltiMetrix</title>
<style>body{font-family:Inter,Arial,sans-serif;max-width:600px;margin:40px auto;padding:20px;color:#1A202C;}
h1{font-family:Syne,sans-serif;font-size:22px;border-bottom:3px solid #00BCD4;padding-bottom:10px;}
h2{font-size:16px;margin-top:24px;color:#2D3748;border-bottom:1px solid #E2E8F0;padding-bottom:6px;}
li{padding:6px 0;font-size:14px;list-style:none;}li:before{content:"☐ ";font-size:16px;}
@media print{body{margin:0;}}</style></head><body>
<h1>Checklist captation drone — AltiMetrix</h1>
<p style="color:#718096;">Protocole optimal pour photogrammétrie</p>
<h2>Préparation</h2>
<li>Vérifier la météo (vent < 20 km/h, pas de pluie, ciel dégagé)</li>
<li>Batteries drones chargées (prévoir 2-3 batteries selon surface)</li>
<li>Carte SD formatée (64 Go minimum)</li>
<li>Calibrer la boussole du drone</li>
<li>Vérifier les restrictions aériennes (carte Géoportail)</li>
<h2>Paramètres drone</h2>
<li>Mode photo (pas vidéo)</li>
<li>ISO réglé sur 100-200</li>
<li>Vitesse d'obturation ≥ 1/1000s</li>
<li>Mise au point sur ∞ (manuel)</li>
<li>Format JPEG + RAW si possible</li>
<li>Désactiver le stabilisateur d'image</li>
<h2>Captation</h2>
<li>Altitude de vol : 50-80 mètres selon résolution souhaitée</li>
<li>Recouvrement frontal : 80% minimum</li>
<li>Recouvrement latéral : 75% minimum</li>
<li>Angle de prise de vue : Nadir (90°) + 45° oblique si possible</li>
<li>Vitesse de vol : 5-8 m/s selon altitude</li>
<li>Déclencher toutes les 2-3 secondes</li>
<li>Voler en lignes parallèles (N-S ou E-O selon orientation du bâtiment)</li>
<li>Prévoir 30-50m de marge autour de la zone d'intérêt</li>
<h2>Post-vol</h2>
<li>Vérifier que toutes les photos sont nettes</li>
<li>Supprimer les photos de transition (décollage, rotation)</li>
<li>Minimum 150 photos pour une toiture standard (300+ recommandé)</li>
<li>Transférer les fichiers sur l'ordinateur</li>
<li>Uploader sur AltiMetrix depuis le dashboard</li>
</body></html>`);
    printWin.document.close();
    setTimeout(() => printWin.print(), 500);
  };

  return (
    <a
      href="#"
      onClick={handleClick}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-dark-800 hover:bg-dark-700 text-white font-semibold text-sm transition-colors shadow-lg"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
      Télécharger la checklist PDF
    </a>
  );
}
