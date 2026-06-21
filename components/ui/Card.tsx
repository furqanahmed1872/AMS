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
        hover && "hover:border-brand-600/30 hover:shadow-card-hover transition-all duration-300",
        glow && "border-brand-500/30 shadow-glow",
        onClick && "cursor-pointer",
        className
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
  subtitle,
  icon,
  accentColor = "text-brand-400",
  trend,
  className,
}: StatCardProps) {
  return (
    <Card hover className={cn("p-5", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2.5 rounded-xl bg-white/5", accentColor)}>
          {icon}
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              trend.up
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-rose-500/10 text-rose-400",
            )}
          >
            {trend.up ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
      <div className={cn("text-2xl font-bold font-display", accentColor)}>
        {value}
      </div>
      <div className="text-sm text-white/60 mt-0.5">{label}</div>
      {subtitle && <div className="text-xs text-white/40 mt-1">{subtitle}</div>}
    </Card>
  );
}
