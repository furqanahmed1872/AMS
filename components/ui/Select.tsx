import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
}

export function Select({
  label,
  options,
  error,
  placeholder,
  className,
  ...props
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="form-label">{label}</label>}
      <div className="relative group">
        <select
          className={cn(
            "w-full appearance-none pr-10 pl-4 py-2.5 rounded-xl text-sm font-medium",
            "bg-surface-2 border border-white/10 text-white cursor-pointer outline-none",
            "transition-all duration-200",
            "hover:border-white/20 hover:bg-surface-3",
            "focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:bg-surface-2",
            "group-hover:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]",
            error && "border-rose-500/50 focus:border-rose-500",
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" className="bg-surface-2 text-white/40">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-surface-2 text-white py-2"
            >
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom arrow */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center w-5 h-5 rounded-md bg-white/5 group-focus-within:bg-brand-500/20 transition-colors">
          <ChevronDown
            size={13}
            className="text-white/40 group-focus-within:text-brand-400 transition-colors"
          />
        </div>
      </div>
      {error && (
        <p className="text-xs text-rose-400 flex items-center gap-1">{error}</p>
      )}
    </div>
  );
}
