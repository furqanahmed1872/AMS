"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Avatar } from "@/components/ui/Avatar";
import { useAcademyData } from "@/lib/academy-data/provider";
import {
  markFeePaidAction,
  generateMonthlyFeesAction,
} from "@/lib/fees/actions";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import type { Student } from "@/lib/academy-data/types";

export default function FeesPage() {
  const router = useRouter();
  const { students, classes } = useAcademyData();

  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [selectedClass, setSelectedClass] = useState(classes[0]?.id ?? "");
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [confirmPay, setConfirmPay] = useState<Student | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [payError, setPayError] = useState("");

  const classOptions = classes.map((c) => ({
    value: c.id,
    label: c.displayName,
  }));

  const [monthYear, month, year] = useMemo(() => {
    const [y, m] = selectedMonth.split("-").map(Number);
    return [selectedMonth, m, y];
  }, [selectedMonth]);

  const classStudents = useMemo(
    () =>
      students.filter(
        (s) => s.classId === selectedClass && s.status === "active",
      ),
    [students, selectedClass],
  );

  // Bootstrap data already has this month's feeStatus — but if the user
  // changes the month picker to a past/future month, we can't know the
  // fee status from context (which only carries the current month).
  // For this version, we use context for the current month, and show
  // "—" for other months until the user lands on them through a
  // router.refresh() after generating records. This is a known v1
  // limitation documented in the PRD (per-month fee view is the
  // Fee Record page, not this page).
  const isCurrentMonth =
    month === now.getMonth() + 1 && year === now.getFullYear();

  const collected = classStudents
    .filter((s) => s.feeStatus === "paid" && s.monthlyFee)
    .reduce((sum, s) => sum + (s.monthlyFee ?? 0), 0);
  const due = classStudents
    .filter((s) => s.feeStatus === "unpaid" && s.monthlyFee)
    .reduce((sum, s) => sum + (s.monthlyFee ?? 0), 0);

  const handleConfirmPay = async () => {
    if (!confirmPay) return;
    setIsPaying(true);
    setPayError("");
    const result = await markFeePaidAction(
      confirmPay.id,
      month,
      year,
      confirmPay.monthlyFee ?? 0,
    );
    setIsPaying(false);
    if (!result.success) {
      setPayError(result.error ?? "Something went wrong.");
      return;
    }
    setConfirmPay(null);
    router.refresh();
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    await generateMonthlyFeesAction(month, year);
    setIsGenerating(false);
    router.refresh();
  };

  const monthLabel = new Date(year, month - 1).toLocaleDateString("en-PK", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title="Fees" subtitle="Manage monthly fee payments" />

      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-center sm:justify-between">
          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3">
            <Select
              options={classOptions}
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full sm:w-auto sm:min-w-36"
            />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="input-field w-full sm:w-44 h-10.5 text-sm"
            />
          </div>
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

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-xl font-bold text-white font-display">
            {classStudents.length}
          </div>
          <div className="text-xs text-white/40 mt-1">Total Records</div>
        </Card>
        <Card className="p-4 text-center bg-emerald-500/5 border-emerald-500/15">
          <div className="text-xl font-bold text-emerald-400 font-display">
            {formatCurrency(collected)}
          </div>
          <div className="text-xs text-white/40 mt-1">Collected</div>
        </Card>
        <Card className="p-4 text-center bg-rose-500/5 border-rose-500/15">
          <div className="text-xl font-bold text-rose-400 font-display">
            {formatCurrency(due)}
          </div>
          <div className="text-xs text-white/40 mt-1">Due</div>
        </Card>
      </div>

      {/* Student list */}
      <Card className="overflow-hidden">
        <div className="divide-y divide-white/5">
          {classStudents.length === 0 ? (
            <div className="py-12 text-center text-white/30 text-sm">
              No active students in this class.
            </div>
          ) : (
            classStudents.map((student) => {
              const isNotSet = !student.monthlyFee;
              const isPaid = isCurrentMonth
                ? student.feeStatus === "paid"
                : false;
              return (
                <div
                  key={student.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-white/30 w-6 shrink-0">
                      #{student.rollNumber}
                    </span>
                    <Avatar name={student.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {student.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {student.monthlyFee && (
                          <span className="text-xs text-white/40">
                            {formatCurrency(student.monthlyFee)}/mo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-9 sm:pl-0 sm:ml-auto shrink-0">
                    {isNotSet ? (
                      <Link href={`/app/students/${student.id}/edit`}>
                        <div className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 px-3 py-1.5 rounded-xl cursor-pointer transition-all group whitespace-nowrap">
                          <AlertTriangle
                            size={13}
                            className="text-amber-400 shrink-0"
                          />
                          <span className="text-xs text-amber-400 font-medium">
                            Fee Not Set
                          </span>
                          <span className="text-xs text-amber-400/50 group-hover:text-amber-400 transition-colors">
                            → Set Now
                          </span>
                        </div>
                      </Link>
                    ) : isPaid ? (
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
                          onClick={() => setConfirmPay(student)}
                        >
                          Pay
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
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
            ? `Confirm that ${confirmPay.name} has paid ${formatCurrency(confirmPay.monthlyFee ?? 0)} for ${monthLabel}?`
            : "")
        }
        confirmLabel="Confirm Payment"
      />
    </div>
  );
}
