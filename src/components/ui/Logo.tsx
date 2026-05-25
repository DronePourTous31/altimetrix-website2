interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#1A202C" />
        <path
          d="M12 26L20 10L28 26H12Z"
          fill="#00BCD4"
          opacity="0.9"
        />
        <path
          d="M16 22L20 14L24 22H16Z"
          fill="#1A202C"
        />
        <circle cx="20" cy="18" r="2" fill="#00BCD4" />
        <path
          d="M10 28H30"
          stroke="#00BCD4"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <span className="font-heading text-xl font-bold tracking-tight">
          Alti<span className="text-primary-500">Metrix</span>
        </span>
      )}
    </span>
  );
}
