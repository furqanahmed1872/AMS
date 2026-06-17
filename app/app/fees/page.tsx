"use client";
import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Avatar } from "@/components/ui/Avatar";
import { STUDENTS, CLASSES } from "@/lib/dummy-data";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const classOptions = CLASSES.map(c => ({ value: c.id, label: c.displayName }));

export default function FeesPage() {
  const [selectedClass, setSelectedClass] = useState("c1");
  const [confirmPay, setConfirmPay] = useState<typeof STUDENTS[0] | null>(null);
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set(
    STUDENTS.filter(s => s.feeStatus === "paid").map(s => s.id)
  ));

  const students = STUDENTS.filter(s => s.classId === selectedClass && s.status === "active");
  const collected = students.filter(s => paidIds.has(s.id) && s.monthlyFee).reduce((sum, s) => sum + (s.monthlyFee || 0), 0);
  const due = students.filter(s => !paidIds.has(s.id) && s.monthlyFee).reduce((sum, s) => sum + (s.monthlyFee || 0), 0);

  const handleConfirmPay = () => {
    if (confirmPay) { setPaidIds(prev => new Set([...prev, confirmPay.id])); setConfirmPay(null); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title="Fees" subtitle="Manage monthly fee payments" />

      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Select options={classOptions} value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="h-9 min-w-36" />
          <input type="month" defaultValue="2025-06" className="input-field w-44 h-9 text-sm" />
        </div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-xl font-bold text-white font-display">{students.length}</div>
          <div className="text-xs text-white/40 mt-1">Total Records</div>
        </Card>
        <Card className="p-4 text-center bg-emerald-500/5 border-emerald-500/15">
          <div className="text-xl font-bold text-emerald-400 font-display">{formatCurrency(collected)}</div>
          <div className="text-xs text-white/40 mt-1">Collected</div>
        </Card>
        <Card className="p-4 text-center bg-rose-500/5 border-rose-500/15">
          <div className="text-xl font-bold text-rose-400 font-display">{formatCurrency(due)}</div>
          <div className="text-xs text-white/40 mt-1">Due</div>
        </Card>
      </div>

      {/* Student List */}
      <Card className="overflow-hidden">
        <div className="divide-y divide-white/5">
          {students.map((student) => {
            const isPaid = paidIds.has(student.id);
            const isNotSet = !student.monthlyFee;
            return (
              <div key={student.id} className="flex items-center gap-4 px-4 py-3.5">
                <span className="text-xs font-bold text-white/30 w-6">#{student.rollNumber}</span>
                <Avatar name={student.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{student.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {student.monthlyFee && <span className="text-xs text-white/40">{formatCurrency(student.monthlyFee)}/mo</span>}
                    <span className="text-xs text-white/30">Prev: Paid</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isNotSet ? (
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle size={14} className="text-amber-400" />
                      <span className="text-xs text-amber-400">Fee Not Set</span>
                    </div>
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
                      <Button size="sm" icon={<DollarSign size={12} />} onClick={() => setConfirmPay(student)}>Pay</Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <ConfirmDialog
        isOpen={!!confirmPay}
        onClose={() => setConfirmPay(null)}
        onConfirm={handleConfirmPay}
        title="Confirm Payment"
        message={confirmPay ? `Confirm that ${confirmPay.name} has paid ${formatCurrency(confirmPay.monthlyFee || 0)} for June 2025?` : ""}
        confirmLabel="Confirm Payment"
      />
    </div>
  );
}
