interface SectionProps {
  children: React.ReactNode;
  className?: string;
  background?: "white" | "light" | "dark";
}

const bgStyles: Record<string, string> = {
  white: "bg-white",
  light: "bg-dark-50",
  dark: "bg-dark-800 text-white",
};

export default function Section({ children, className = "", background = "white" }: SectionProps) {
  return (
    <section className={`py-16 md:py-20 lg:py-24 ${bgStyles[background]} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}
