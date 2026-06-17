import { cn } from "@/lib/utils";

type BadgeVariant = "paid" | "unpaid" | "not_set" | "active" | "inactive" | "present" | "absent" | "leave" | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  paid: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
  unpaid: "bg-rose-500/15 text-rose-400 border border-rose-500/25",
  not_set: "bg-white/10 text-white/50 border border-white/15",
  active: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
  inactive: "bg-white/10 text-white/40 border border-white/15",
  present: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
  absent: "bg-rose-500/15 text-rose-400 border border-rose-500/25",
  leave: "bg-amber-500/15 text-amber-400 border border-amber-500/25",
  default: "bg-brand-500/15 text-brand-400 border border-brand-500/25",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center", variants[variant], className)}>
      {children}
    </span>
  );
}
