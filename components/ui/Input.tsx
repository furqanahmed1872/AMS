import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, iconRight, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="form-label">{label}</label>}
        <div className="relative">
          {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">{icon}</span>}
          <input
            ref={ref}
            className={cn(
              "input-field",
              icon && "pl-10",
              iconRight && "pr-10",
              error && "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30",
              className
            )}
            {...props}
          />
          {iconRight && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">{iconRight}</span>}
        </div>
        {hint && !error && <p className="text-xs text-white/40">{hint}</p>}
        {error && <p className="text-xs text-rose-400">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
