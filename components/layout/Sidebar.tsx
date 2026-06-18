"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Calendar, DollarSign, FileText,
  BarChart3, BookOpen, LogOut, Bell, GraduationCap, X, Menu
} from "lucide-react";
import { useState } from "react";
import { logoutAction } from "@/lib/auth/actions";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  badge?: number;
}

const navItems: NavItem[] = [
  { href: "/app/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/app/students", label: "Students", icon: <Users size={18} /> },
  { href: "/app/attendance", label: "Attendance", icon: <Calendar size={18} /> },
  { href: "/app/fees", label: "Fees", icon: <DollarSign size={18} />, adminOnly: true },
  { href: "/app/fee-record", label: "Fee Record", icon: <FileText size={18} />, adminOnly: true },
  { href: "/app/tests", label: "Tests", icon: <BookOpen size={18} /> },
  { href: "/app/test-record", label: "Test Record", icon: <BarChart3 size={18} /> },
  { href: "/app/results", label: "Results", icon: <BarChart3 size={18} /> },
  { href: "/app/classes", label: "Classes & Subjects", icon: <GraduationCap size={18} /> },
];

interface SidebarProps {
  role?: "admin" | "teacher";
  notifications?: number;
  academyName?: string;
}

export function Sidebar({ role = "admin", notifications = 1, academyName = "Academy" }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = navItems.filter((item) => !item.adminOnly || role === "admin");

  const handleSignOut = async () => {
    await logoutAction();
    router.push("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-glow">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-sm font-display text-white">{academyName}</div>
            <div className="text-xs text-white/40 capitalize">{role} panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(isActive ? "nav-item-active" : "nav-item")}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge && <span className="bg-brand-600/30 text-brand-400 text-xs px-1.5 py-0.5 rounded-full">{item.badge}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-white/8 space-y-1">
        {role === "admin" && (
          <Link href="/app/notifications" className="nav-item relative">
            <Bell size={18} />
            <span className="flex-1">Notifications</span>
            {notifications > 0 && <span className="bg-rose-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{notifications}</span>}
          </Link>
        )}
        <button onClick={handleSignOut} className="nav-item text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 w-full">
          <LogOut size={18} />
          Sign Out
        </button>
        <div className="px-3 pt-2">
          <div className="bg-surface-2 rounded-lg px-3 py-2 text-xs text-white/30">
            AMS v1.0 · {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-surface-1 border-r border-white/8 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-surface-1 border-b border-white/8 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center shadow-glow">
            <GraduationCap size={15} className="text-white" />
          </div>
          <span className="font-bold text-sm font-display">{academyName}</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-2 hover:bg-white/8 rounded-lg transition-colors">
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-surface-1 border-r border-white/8 flex flex-col animate-slide-down">
            <div className="flex items-center justify-between p-4 border-b border-white/8">
              <span className="font-bold font-display">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto"><SidebarContent /></div>
          </aside>
        </div>
      )}
    </>
  );
}
