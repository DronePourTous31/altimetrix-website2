interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = "", hover = true }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-dark-200 p-6 ${
        hover ? "hover:-translate-y-1 hover:shadow-lg hover:border-primary-300" : ""
      } transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
}
