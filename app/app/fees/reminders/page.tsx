"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency } from "@/lib/utils";
import {
  getUnpaidStudentsAction,
  type UnpaidStudent,
} from "@/lib/fees/reminders";
import { buildFeeReminderLink } from "@/lib/fees/whatsapp";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function FeeRemindersPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [students, setStudents] = useState<UnpaidStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState<Set<string>>(new Set());

  const monthOptions = MONTH_NAMES.map((m, i) => ({
    value: String(i + 1),
    label: m,
  }));
  const yearOptions = [
    now.getFullYear() - 1,
    now.getFullYear(),
    now.getFullYear() + 1,
  ].map((y) => ({ value: String(y), label: String(y) }));

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getUnpaidStudentsAction(month, year);
    setStudents(data);
    setLoading(false);
  }, [month, year]);

  useEffect(() => {
    load();
  }, [load]);

  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;

  const handleSend = (s: UnpaidStudent) => {
    const link = buildFeeReminderLink(
      s.phone,
      s.name,
      s.className,
      s.amountDue,
      monthLabel,
    );
    if (!link) return;
    window.open(link, "_blank");
    setSent((prev) => new Set(prev).add(s.studentId));
  };

  return (
    <div className="animate-fade-in space-y-4 pb-10">
      <PageHeader
        title="Fee Reminders"
        subtitle="Send one-tap WhatsApp reminders to parents with unpaid fees"
      />

      <Card className="p-4">
        <div className="flex gap-3">
          <Select
            options={monthOptions}
            value={String(month)}
            onChange={(e) => setMonth(Number(e.target.value))}
          />
          <Select
            options={yearOptions}
            value={String(year)}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </div>
      </Card>

      {loading ? (
        <Card className="p-8 text-center text-sm text-white/50">Loading…</Card>
      ) : students.length === 0 ? (
        <Card className="p-8 text-center text-sm text-white/50">
          No unpaid fees for {monthLabel}.
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {students.map((s) => {
            const link = buildFeeReminderLink(
              s.phone,
              s.name,
              s.className,
              s.amountDue,
              monthLabel,
            );
            const wasSent = sent.has(s.studentId);
            return (
              <Card key={s.studentId} className="p-3.5 flex items-center gap-3">
                <Avatar name={s.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {s.name}
                  </p>
                  <p className="text-xs text-white/50">
                    {s.className} · {formatCurrency(s.amountDue)}
                  </p>
                </div>
                {!link ? (
                  <span className="flex items-center gap-1 text-xs text-amber-400">
                    <AlertTriangle size={12} /> No valid phone
                  </span>
                ) : (
                  <Button
                    variant={wasSent ? "ghost" : "secondary"}
                    size="sm"
                    icon={
                      wasSent ? (
                        <ExternalLink size={14} />
                      ) : (
                        <MessageCircle size={14} />
                      )
                    }
                    onClick={() => handleSend(s)}
                  >
                    {wasSent ? "Sent" : "Remind"}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
