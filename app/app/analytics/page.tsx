import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getAdminAnalytics } from "@/lib/analytics/actions";
import { AnalyticsView } from "./AnalyticsView";

/**
 * Admin-only analytics dashboard. Server Component: the aggregation runs
 * on the server (no client fetch, no loading state), then hands a plain
 * object to the client view for interaction. Read-only — no writes.
 */
export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/app/dashboard");

  const data = await getAdminAnalytics();
  if (!data) redirect("/app/dashboard");

  return <AnalyticsView data={data} />;
}
