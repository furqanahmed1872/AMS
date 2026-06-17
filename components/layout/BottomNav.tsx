"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Calendar, BookOpen, GraduationCap } from "lucide-react";

const items = [
  { href: "/app/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { href: "/app/students", label: "Students", icon: <Users size={20} /> },
  { href: "/app/attendance", label: "Attend.", icon: <Calendar size={20} /> },
  { href: "/app/tests", label: "Tests", icon: <BookOpen size={20} /> },
  { href: "/app/classes", label: "Classes", icon: <GraduationCap size={20} /> },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-1 border-t border-white/8 flex">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link key={item.href} href={item.href} className={cn(
            "flex-1 flex flex-col items-center py-2 gap-1 transition-colors text-xs",
            isActive ? "text-brand-400" : "text-white/40 hover:text-white/70"
          )}>
            {item.icon}
            {item.label}
            {isActive && <span className="absolute top-0 w-8 h-0.5 bg-brand-500 rounded-b-full" />}
          </Link>
        );
      })}
    </nav>
  );
}
