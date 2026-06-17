"use client";
import { cn } from "@/lib/utils";

interface Tab { id: string; label: string; icon?: React.ReactNode; badge?: number; }

interface TabsProps { tabs: Tab[]; activeTab: string; onChange: (id: string) => void; className?: string; }

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex gap-1 bg-surface-2 p-1 rounded-xl", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            activeTab === tab.id ? "bg-brand-600 text-white shadow-glow" : "text-white/50 hover:text-white hover:bg-white/5"
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.badge !== undefined && (
            <span className={cn("px-1.5 py-0.5 rounded-full text-xs", activeTab === tab.id ? "bg-white/20" : "bg-white/10")}>{tab.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
}
