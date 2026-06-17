"use client";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

interface FilterOption { value: string; label: string; }

interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  filters?: { label: string; options: FilterOption[]; value: string; onChange: (v: string) => void; }[];
  onReset?: () => void;
  className?: string;
}

export function SearchFilter({ searchValue, onSearchChange, searchPlaceholder = "Search...", filters, onReset, className }: SearchFilterProps) {
  return (
    <div className={cn("flex flex-wrap gap-3 items-center", className)}>
      <div className="flex-1 min-w-48">
        <Input value={searchValue} onChange={(e) => onSearchChange(e.target.value)} placeholder={searchPlaceholder} icon={<Search size={14} />} className="h-10" />
      </div>
      {filters?.map((f, i) => (
        <Select key={i} options={f.options} value={f.value} onChange={(e) => f.onChange(e.target.value)} className="h-10 min-w-36" />
      ))}
      {onReset && (
        <Button variant="ghost" size="sm" onClick={onReset} icon={<X size={14} />}>Reset</Button>
      )}
    </div>
  );
}
