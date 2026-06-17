import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  back?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, actions, back, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between mb-6 gap-4", className)}>
      <div className="flex items-start gap-3">
        {back}
        <div>
          <h1 className="text-xl font-bold text-white font-display">{title}</h1>
          {subtitle && <p className="text-sm text-white/50 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
