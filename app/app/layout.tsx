import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { getSession } from "@/lib/auth/session";
import { getAcademyBootstrapData } from "@/lib/academy-data/get-bootstrap-data";
import { AcademyDataProvider } from "@/lib/academy-data/provider";
import type { BranchScope } from "@/lib/branches/types";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  // Legacy cookies (pre multi-branch) carry no branchId — default to
  // academy-wide so nothing breaks for already-signed-in users.
  const branchId: BranchScope = session.branchId ?? "all";

  const data = await getAcademyBootstrapData(session.academyId, branchId);

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar
        role={session.role}
        notifications={data.notifications.length}
        academyName={session.academyName}
        branches={data.branches}
        activeBranchId={branchId}
      />
      <main className="flex-1 overflow-y-auto lg:pt-0 pt-14 pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto p-4 lg:p-6">
          <AcademyDataProvider
            value={{
              ...data,
              role: session.role,
              academyId: session.academyId,
              academyName: session.academyName,
              branchId,
            }}
          >
            {children}
          </AcademyDataProvider>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
