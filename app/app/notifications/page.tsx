"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAcademyData } from "@/lib/academy-data/provider";
import { Bell, CheckCircle2, ExternalLink } from "lucide-react";
import { resolveNotificationAction } from "@/lib/notifications/actions";

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications } = useAcademyData();
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    await resolveNotificationAction(id);
    setResolvingId(null);
    router.refresh();
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <PageHeader
        title="Notifications"
        subtitle={`${notifications.filter((n) => !n.isResolved).length} unresolved`}
      />
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <Bell size={32} className="mx-auto mb-3" />
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map((n) => (
            <Card
              key={n.id}
              className={`p-4 ${!n.isResolved ? "border-amber-500/25 bg-amber-500/5" : "opacity-60"}`}
            >
              <div className="flex items-start gap-3 flex-wrap sm:flex-nowrap">
                <div
                  className={`p-2 rounded-xl shrink-0 ${n.isResolved ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}
                >
                  {n.isResolved ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <Bell size={16} />
                  )}
                </div>
                <div className="flex-1 min-w-0 basis-[calc(100%-44px)] sm:basis-0">
                  <p className="text-sm text-white/80 break-words">
                    {n.message}
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.isResolved && (
                  <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-end sm:justify-start pl-[44px] sm:pl-0">
                    {n.studentId && (
                      <Link href={`/app/students/${n.studentId}`}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<ExternalLink size={12} />}
                        >
                          Open
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={resolvingId === n.id}
                      onClick={() => handleResolve(n.id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
