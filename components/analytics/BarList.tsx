"use client";

import { cn } from "@/lib/utils";

export interface BarListItem {
  id: string;
  label: string;
  value: number;
  /** Optional right-hand caption, e.g. "24 students" */
  caption?: string;
}

interface BarListProps {
  items: BarListItem[];
  formatValue?: (v: number) => string;
  /** Bar scale ceiling. Defaults to the largest value in the list. */
  maxValue?: number;
  barClassName?: string;
  emptyLabel?: string;
  className?: string;
}

/**
 * Reusable horizontal bar list — used for class and branch comparisons.
 * Deliberately generic so any ranked metric can reuse it.
 */
export function BarList({
  items,
  formatValue = (v) => String(v),
  maxValue,
  barClassName = "bg-gradient-to-r from-brand-600 to-brand-400",
  emptyLabel = "No data yet",
  className,
}: BarListProps) {
  if (!items.length) {
    return (
      <p className="text-sm text-white/30 py-6 text-center">{emptyLabel}</p>
    );
  }

  const max = maxValue ?? Math.max(1, ...items.map((i) => i.value));

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => (
        <div key={item.id}>
          <div className="flex items-baseline justify-between gap-3 mb-1.5">
            <span className="text-sm text-white/70 truncate">{item.label}</span>
            <div className="flex items-baseline gap-2 shrink-0">
              {item.caption && (
                <span className="text-xs text-white/30">{item.caption}</span>
              )}
              <span className="text-sm font-semibold text-white">
                {formatValue(item.value)}
              </span>
            </div>
          </div>
          <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                barClassName,
              )}
              style={{ width: `${Math.min(100, (item.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
