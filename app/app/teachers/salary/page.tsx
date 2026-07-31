"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  getTeachersAction,
  getTeacherSalaryStatusAction,
} from "@/lib/teachers/queries";
import {
  markTeacherSalaryPaidAction,
  generateMonthlyTeacherSalariesAction,
} from "@/lib/teachers/actions";
import type { Teacher } from "@/lib/teachers/types";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  CheckCircle2,
  Clock,
  RefreshCw,
  FileText,
} from "lucide-react";

interface TeacherWithStatus extends Teacher {
  salaryStatus: "paid" | "unpaid" | "not_set";
}

export default function TeacherSalaryPage() {
  const router = useRouter();
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [teachers, setTeachers] = useState<TeacherWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmPay, setConfirmPay] = useState<TeacherWithStatus | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [payError, setPayError] = useState("");

  const [monthYear, month, year] = useMemo(() => {
    const [y, m] = selectedMonth.split("-").map(Number);
    return [selectedMonth, m, y];
  }, [selectedMonth]);

  const load = useCallback(async () => {
    setLoading(true);
    const [allTeachers, statusMap] = await Promise.all([
      getTeachersAction().then((ts) => ts.filter((t) => t.status === "active")),
      getTeacherSalaryStatusAction(month, year),
    ]);

    setTeachers(
      allTeachers.map((t) => ({
        ...t,
        salaryStatus: t.monthlySalary
          ? (statusMap[t.id] ?? "unpaid")
          : "not_set",
      })),
    );
    setLoading(false);
  }, [month, year]);

  useEffect(() => {
    load();
  }, [load]);

  const collected = teachers
    .filter((t) => t.salaryStatus === "paid")
    .reduce((sum, t) => sum + (t.monthlySalary ?? 0), 0);
  const due = teachers
    .filter((t) => t.salaryStatus === "unpaid")
    .reduce((sum, t) => sum + (t.monthlySalary ?? 0), 0);

  const handleConfirmPay = async () => {
    if (!confirmPay) return;
    setIsPaying(true);
    setPayError("");
    const result = await markTeacherSalaryPaidAction(
      confirmPay.id,
      month,
      year,
      confirmPay.monthlySalary ?? 0,
      confirmPay.branchId,
    );
    setIsPaying(false);
    if (!result.success) {
      setPayError(result.error ?? "Something went wrong.");
      return;
    }
    setConfirmPay(null);
    router.refresh();
    load();
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    await generateMonthlyTeacherSalariesAction(month, year);
    setIsGenerating(false);
    load();
  };

  const monthLabel = new Date(year, month - 1).toLocaleDateString("en-PK", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Teacher Salary"
        subtitle="Manage monthly salary payments"
        actions={
          <Link href="/app/teachers/salary-record">
            <Button variant="ghost" size="sm" icon={<FileText size={14} />}>
              Salary Record
            </Button>
          </Link>
        }
      />

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-center sm:justify-between">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input-field w-full sm:w-44 h-10.5 text-sm"
          />
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw size={13} />}
            loading={isGenerating}
            onClick={handleGenerate}
            className="w-full sm:w-auto"
          >
            Generate Records
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-xl font-bold text-white font-display">
            {teachers.length}
          </div>
          <div className="text-xs text-white/40 mt-1">Total Teachers</div>
        </Card>
        <Card className="p-4 text-center bg-emerald-500/5 border-emerald-500/15">
          <div className="text-xl font-bold text-emerald-400 font-display">
            {formatCurrency(collected)}
          </div>
          <div className="text-xs text-white/40 mt-1">Paid</div>
        </Card>
        <Card className="p-4 text-center bg-rose-500/5 border-rose-500/15">
          <div className="text-xl font-bold text-rose-400 font-display">
            {formatCurrency(due)}
          </div>
          <div className="text-xs text-white/40 mt-1">Due</div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="divide-y divide-white/5">
          {loading ? (
            <div className="py-12 text-center text-white/30 text-sm">
              Loading…
            </div>
          ) : teachers.length === 0 ? (
            <div className="py-12 text-center text-white/30 text-sm">
              No active teachers.
            </div>
          ) : (
            teachers.map((t) => (
              <div
                key={t.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3.5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={t.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {t.name}
                    </p>
                    {t.monthlySalary && (
                      <span className="text-xs text-white/40">
                        {formatCurrency(t.monthlySalary)}/mo
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-11 sm:pl-0 sm:ml-auto shrink-0">
                  {t.salaryStatus === "not_set" ? (
                    <Badge variant="not_set">Salary Not Set</Badge>
                  ) : t.salaryStatus === "paid" ? (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <Badge variant="paid">Paid</Badge>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-rose-400" />
                        <Badge variant="unpaid">Unpaid</Badge>
                      </div>
                      <Button
                        size="sm"
                        icon={<DollarSign size={12} />}
                        onClick={() => setConfirmPay(t)}
                      >
                        Pay
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <ConfirmDialog
        isOpen={!!confirmPay}
        onClose={() => {
          setConfirmPay(null);
          setPayError("");
        }}
        onConfirm={handleConfirmPay}
        loading={isPaying}
        title="Confirm Payment"
        message={
          payError ||
          (confirmPay
            ? `Confirm that ${confirmPay.name} has been paid ${formatCurrency(confirmPay.monthlySalary ?? 0)} for ${monthLabel}?`
            : "")
        }
        confirmLabel="Confirm Payment"
      />
    </div>
  );
}