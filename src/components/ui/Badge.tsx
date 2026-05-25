export default function Badge({ status, label }: { status: "actif" | "en_cours" | "livre" | "erreur"; label?: string }) {
  const styles: Record<string, string> = {
    actif: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    en_cours: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    livre: "bg-green-500/10 text-green-400 border-green-500/20",
    erreur: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const labels: Record<string, string> = {
    actif: "Upload en attente",
    en_cours: "En traitement",
    livre: "Livré",
    erreur: "Erreur",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.actif}`}>
      {label || labels[status] || status}
    </span>
  );
}
