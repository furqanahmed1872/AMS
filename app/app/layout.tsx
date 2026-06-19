import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { getSession } from "@/lib/auth/session";
import { getAcademyBootstrapData } from "@/lib/academy-data/get-bootstrap-data";
import { AcademyDataProvider } from "@/lib/academy-data/provider";
import { RealtimeProvider } from "@/components/providers/RealtimeProvider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  console.log("Session in layout:", session);
  if (!session) redirect("/login");

  const data = await getAcademyBootstrapData(session.academyId);

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar
        role={session.role}
        notifications={data.notifications.length}
        academyName={session.academyName}
      />
      <main className="flex-1 overflow-y-auto lg:pt-0 pt-14 pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto p-4 lg:p-6">
          <AcademyDataProvider
            value={{
              ...data,
              role: session.role,
              academyId: session.academyId,
              academyName: session.academyName,
            }}
          >
            <RealtimeProvider academyId={session.academyId}>
              {children}
            </RealtimeProvider>
          </AcademyDataProvider>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
