import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  glow?: boolean;
}

export function Card({ children, className, onClick, hover, glow }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "glass-card",
        hover &&
          "hover:border-brand-600/30 hover:shadow-card-hover transition-all duration-300",
        glow && "border-brand-500/30 shadow-glow",
        onClick && "cursor-pointer",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  accentColor?: string;
  trend?: { value: string; up: boolean };
  className?: string;
}
export function StatCard({
  label,
  value,
  icon,
  accentColor = "text-brand-400",
  trend,
  className = "",
}: StatCardProps) {
  return (
    <div className={`glass-card p-4 ${className}`}>
      <div className="grid items-start justify-between gap-2">
        <div className={`p-2.5 rounded-xl bg-white/5 shrink-0 ${accentColor}`}>
          {icon}
        </div>
        {trend && (
          <span
            className={`flex items-center gap-1 text-[11px] font-semibold whitespace-nowrap shrink-0 ${
              trend.up ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {trend.up ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white mt-3 truncate">{value}</p>
      <p className="text-xs text-white/50 mt-0.5">{label}</p>
    </div>
  );
}