type BadgeStatus = "actif" | "en_cours" | "livre" | "erreur";

interface BadgeProps {
  status: BadgeStatus;
  className?: string;
}

const config: Record<BadgeStatus, { label: string; classes: string }> = {
  actif: {
    label: "Actif",
    classes: "bg-primary-100 text-primary-800 border-primary-300",
  },
  en_cours: {
    label: "En cours",
    classes: "bg-amber-100 text-amber-800 border-amber-300",
  },
  livre: {
    label: "Livré",
    classes: "bg-green-100 text-green-800 border-green-300",
  },
  erreur: {
    label: "Erreur",
    classes: "bg-red-100 text-red-800 border-red-300",
  },
};

export default function Badge({ status, className = "" }: BadgeProps) {
  const { label, classes } = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${classes} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full currentColor opacity-60" />
      {label}
    </span>
  );
}
