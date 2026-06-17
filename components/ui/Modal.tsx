"use client";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-2xl" };

export function Modal({ isOpen, onClose, title, children, size = "md", className }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) { document.addEventListener("keydown", handler); document.body.style.overflow = "hidden"; }
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={cn("modal-content w-full", sizes[size], className)}>
        {title && (
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold font-display">{title}</h3>
            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><X size={16} /></button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
