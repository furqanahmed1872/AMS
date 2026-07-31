"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Check, ChevronDown, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { switchBranchAction } from "@/lib/branches/actions";
import {
  ALL_BRANCHES,
  type Branch,
  type BranchScope,
} from "@/lib/branches/types";

interface BranchSwitcherProps {
  branches: Branch[];
  activeBranchId: BranchScope;
  /** Only admins may select "All Branches". */
  canViewAll?: boolean;
  className?: string;
}

export function BranchSwitcher({
  branches,
  activeBranchId,
  canViewAll = false,
  className,
}: BranchSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const active = branches.find((b) => b.id === activeBranchId);
  const currentLabel =
    activeBranchId === ALL_BRANCHES
      ? "All Branches"
      : (active?.name ?? "Branch");

  // A single branch and no cross-branch view: nothing to switch between.
  if (branches.length <= 1 && !canViewAll) return null;

  const select = (id: BranchScope) => {
    setOpen(false);
    if (id === activeBranchId) return;
    startTransition(async () => {
      const res = await switchBranchAction(id);
      if (res.success) router.refresh();
    });
  };

  const options: { id: BranchScope; label: string; icon: React.ReactNode }[] = [
    ...(canViewAll
      ? [
          {
            id: ALL_BRANCHES,
            label: "All Branches",
            icon: <Globe size={14} />,
          },
        ]
      : []),
    ...branches
      .filter((b) => b.status === "active" || b.id === activeBranchId)
      .map((b) => ({
        id: b.id as BranchScope,
        label: b.name,
        icon: <Building2 size={14} />,
      })),
  ];

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        className={cn(
          "flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-medium",
          "bg-surface-2 border border-white/10 text-white/80 outline-none",
          "hover:border-white/20 hover:bg-surface-3 transition-all duration-200",
          "focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20",
          pending && "opacity-50 cursor-wait",
        )}
      >
        {activeBranchId === ALL_BRANCHES ? (
          <Globe size={14} className="text-brand-400 shrink-0" />
        ) : (
          <Building2 size={14} className="text-brand-400 shrink-0" />
        )}
        <span className="flex-1 text-left truncate">{currentLabel}</span>
        <ChevronDown
          size={14}
          className={cn(
            "text-white/40 transition-transform duration-200 shrink-0",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 mt-1.5 w-full min-w-[190px] rounded-xl bg-surface-2 border border-white/10 shadow-card-hover overflow-hidden animate-slide-down">
            {options.map((opt) => {
              const isActive = opt.id === activeBranchId;
              return (
                <button
                  key={opt.id}
                  onClick={() => select(opt.id)}
                  className={cn(
                    "flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-left transition-colors",
                    isActive
                      ? "bg-brand-600/15 text-brand-400"
                      : "text-white/70 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <span className="shrink-0">{opt.icon}</span>
                  <span className="flex-1 truncate">{opt.label}</span>
                  {isActive && <Check size={14} className="shrink-0" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
