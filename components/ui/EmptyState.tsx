import { cn } from "@/lib/utils";

interface EmptyStateProps { icon: React.ReactNode; title: string; description?: string; action?: React.ReactNode; className?: string; }

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <div className="p-4 bg-white/5 rounded-2xl mb-4 text-white/30">{icon}</div>
      <h3 className="text-base font-semibold text-white/70 mb-1">{title}</h3>
      {description && <p className="text-sm text-white/40 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
