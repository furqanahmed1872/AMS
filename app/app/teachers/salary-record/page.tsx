"use client";
import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { getTeacherSalaryRecordAction } from "@/lib/teachers/queries";
import type { TeacherSalaryRow } from "@/lib/teachers/types";
import { ACADEMIC_MONTHS } from "@/lib/fees/types";
import { ArrowLeftRight } from "lucide-react";

const monthLabels = ACADEMIC_MONTHS.map((m) => m.label);

function buildYearOptions() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const startYear = currentMonth >= 5 ? currentYear : currentYear - 1;
  return [startYear, startYear - 1, startYear - 2].map((y) => ({
    value: String(y),
    label: `${y}–${String(y + 1).slice(2)}`,
  }));
}

const yearOptions = buildYearOptions();

export default function TeacherSalaryRecordPage() {
  const [year, setYear] = useState(yearOptions[0].value);
  const [rows, setRows] = useState<TeacherSalaryRow[] | null>(null);
  const [loading, setLoading] = useState(false);

  const yearLabel = yearOptions.find((y) => y.value === year)?.label ?? year;

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getTeacherSalaryRecordAction(parseInt(year, 10));
    setRows(data);
    setLoading(false);
  }, [year]);

  useEffect(() => {
    load();
  }, [load]);

  const monthTotals = monthLabels.map((_, j) =>
    (rows ?? []).reduce<number>((sum, t) => {
      const val = t.cells[j];
      return sum + (typeof val === "number" ? val : 0);
    }, 0),
  );
  const grandTotal = monthTotals.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Teacher Salary Record"
        subtitle="Yearly salary history for all teachers"
      />

      <Card className="p-4">
        <Select
          options={yearOptions}
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-full sm:w-auto sm:min-w-28"
        />
      </Card>

      <div className="glass-card">
        <div className="p-4 border-b border-white/8">
          <h3 className="section-title">Academic Year {yearLabel}</h3>
        </div>

        {loading ? (
          <div className="p-10 text-center text-white/30 text-sm">Loading…</div>
        ) : !rows || rows.length === 0 ? (
          <div className="p-10 text-center text-white/30 text-sm">
            No active teachers, or no salary records yet for this year.
          </div>
        ) : (
          <>
            <div className="sm:hidden flex items-center gap-1.5 px-4 pt-3 text-[11px] text-white/35">
              <ArrowLeftRight size={12} />
              Scroll sideways to see all months
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-surface-2">
                  <tr>
                    <th className="table-header sticky left-0 bg-surface-2 z-10 min-w-32">
                      Name
                    </th>
                    {monthLabels.map((m) => (
                      <th key={m} className="table-header text-center min-w-14">
                        {m}
                      </th>
                    ))}
                    <th className="table-header text-center min-w-20 text-emerald-400/60">
                      Grand Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((teacher) => {
                    const total = teacher.cells.reduce<number>(
                      (sum, val) => sum + (typeof val === "number" ? val : 0),
                      0,
                    );
                    return (
                      <tr key={teacher.id} className="table-row">
                        <td className="table-cell sticky left-0 bg-surface-1 font-medium">
                          {teacher.name}
                          {teacher.subject && (
                            <span className="text-white/30 ml-1">
                              ({teacher.subject})
                            </span>
                          )}
                        </td>
                        {teacher.cells.map((val, j) => (
                          <td
                            key={j}
                            className={`px-2 py-3 text-center font-semibold ${
                              val === "X"
                                ? "text-rose-400"
                                : val === null
                                  ? "text-white/20"
                                  : "text-emerald-400"
                            }`}
                          >
                            {val === null
                              ? "—"
                              : val === "X"
                                ? "✗"
                                : val.toLocaleString()}
                          </td>
                        ))}
                        <td className="px-2 py-3 text-center text-xs font-bold text-white/60 bg-surface-2">
                          {total > 0 ? `Rs. ${total.toLocaleString()}` : "—"}
                        </td>
                      </tr>
                    );
                  })}

                  <tr className="border-t-2 border-brand-500/20 bg-surface-2">
                    <td className="table-cell font-bold text-white/60 sticky left-0 bg-surface-2">
                      Monthly Total
                    </td>
                    {monthTotals.map((t, j) => (
                      <td
                        key={j}
                        className="px-2 py-3 text-center text-xs font-bold text-brand-400"
                      >
                        {t > 0 ? t.toLocaleString() : "—"}
                      </td>
                    ))}
                    <td className="px-2 py-3 text-center text-xs font-bold text-brand-400">
                      {grandTotal > 0
                        ? `Rs. ${grandTotal.toLocaleString()}`
                        : "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
