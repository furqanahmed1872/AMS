import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar role="admin" notifications={1} />
      <main className="flex-1 overflow-y-auto lg:pt-0 pt-14 pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto p-4 lg:p-6">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
