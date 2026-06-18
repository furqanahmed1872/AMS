import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const variants = {
  primary: "bg-brand-600 hover:bg-brand-500 text-white shadow-glow hover:shadow-glow-lg",
  secondary: "bg-surface-3 hover:bg-surface-4 text-white border border-white/10",
  ghost: "hover:bg-white/8 text-white/70 hover:text-white",
  danger: "bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/25",
  outline: "border border-brand-500/40 hover:border-brand-500 text-brand-400 hover:text-brand-300 hover:bg-brand-500/10",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3 text-base rounded-xl gap-2.5",
};

export function Button({ variant = "primary", size = "md", loading, icon, iconRight, children, className, disabled, ...props }: ButtonProps) {
  return (
    <button
      type={props.type || "button"}
      className={cn(
        "font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer",
        variants[variant],
        sizes[size],
        (disabled || loading) && "opacity-50 cursor-not-allowed",
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {children}
      {iconRight && !loading && iconRight}
    </button>
  );
}
