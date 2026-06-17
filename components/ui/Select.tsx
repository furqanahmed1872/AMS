import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectOption { value: string; label: string; }

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
}

export function Select({ label, options, error, placeholder, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="form-label">{label}</label>}
      <div className="relative">
        <select
          className={cn(
            "input-field appearance-none pr-10 cursor-pointer",
            error && "border-rose-500/50",
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-surface-2">{opt.label}</option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}
