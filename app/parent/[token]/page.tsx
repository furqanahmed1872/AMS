import { getParentSession } from "@/lib/parent-portal/session";
import { getParentDashboardData } from "@/lib/parent-portal/actions";
import { ParentLoginForm } from "@/components/parent-portal/ParentLoginForm";
import { ParentDashboard } from "@/components/parent-portal/ParentDashboard";

export default async function ParentPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const session = await getParentSession();
  const data = session ? await getParentDashboardData(token) : null;

  if (data) {
    return <ParentDashboard data={data} />;
  }

  return <ParentLoginForm shareToken={token} />;
}
