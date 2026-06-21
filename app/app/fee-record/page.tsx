"use client";
import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { useAcademyData } from "@/lib/academy-data/provider";
import { getFeeRecordAction } from "@/lib/fees/fee-record-actions";
import type { FeeRecordStudent } from "@/lib/fees/types";
import { ACADEMIC_MONTHS } from "@/lib/fees/types";
import { Download, ArrowLeftRight } from "lucide-react";
import { FeeRecordPDF } from "@/components/templates/pdf/FeeRecordPDF";
import { exportElementAsPDF } from "@/lib/export/utils";

// Academic year: May of startYear through March of startYear+1
const monthLabels = ACADEMIC_MONTHS.map((m) => m.label);

// Build academic year options: current year and two prior
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

export default function FeeRecordPage() {
  const { classes, academyName } = useAcademyData();
  const [exportingPDF, setExportingPDF] = useState(false);
  const [selectedClass, setSelectedClass] = useState(classes[0]?.id ?? "");
  const [year, setYear] = useState(yearOptions[0].value);
  const [rows, setRows] = useState<FeeRecordStudent[] | null>(null);
  const [loading, setLoading] = useState(false);

  const classOptions = classes.map((c) => ({
    value: c.id,
    label: c.displayName,
  }));

  const selectedClassName =
    classes.find((c) => c.id === selectedClass)?.displayName ?? "";
  const yearLabel = yearOptions.find((y) => y.value === year)?.label ?? year;

  const handleExportPDF = async () => {
    if (!rows || rows.length === 0) return;
    setExportingPDF(true);
    await exportElementAsPDF(
      "fee-record-pdf-template",
      `FeeRecord_${selectedClassName}_${yearLabel}`,
      "landscape",
    );
    setExportingPDF(false);
  };

  const load = useCallback(async () => {
    if (!selectedClass) return;
    setLoading(true);
    const data = await getFeeRecordAction(selectedClass, parseInt(year, 10));
    setRows(data);
    setLoading(false);
  }, [selectedClass, year]);

  useEffect(() => {
    load();
  }, [load]);

  // Column totals (sum of paid amounts per month)
  const monthTotals = monthLabels.map((_, j) =>
    (rows ?? []).reduce<number>((sum, s) => {
      const val = s.cells[j];
      return sum + (typeof val === "number" ? val : 0);
    }, 0),
  );
  const grandTotal = monthTotals.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title="Fee Record" subtitle="Yearly fee history by class" />

      <Card className="p-4">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 items-center">
          <Select
            options={classOptions}
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full sm:w-auto sm:min-w-36"
          />
          <Select
            options={yearOptions}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full sm:w-auto sm:min-w-28"
          />
        </div>
      </Card>

      <div className="glass-card">
        <div className="p-4 border-b border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="section-title">
            {selectedClassName} · Academic Year {yearLabel}
          </h3>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download size={14} />}
            loading={exportingPDF}
            onClick={handleExportPDF}
            className="w-full sm:w-auto"
          >
            Download PDF
          </Button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-white/30 text-sm">Loading…</div>
        ) : !rows || rows.length === 0 ? (
          <div className="p-10 text-center text-white/30 text-sm">
            No active students in this class, or no fee records yet for this
            year.
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
                    <th className="table-header sticky left-0 bg-surface-2 z-10 min-w-10">
                      Roll
                    </th>
                    <th className="table-header sticky left-10 bg-surface-2 z-10 min-w-32">
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
                  {rows.map((student) => {
                    const studentTotal = student.cells.reduce<number>(
                      (sum, val) => sum + (typeof val === "number" ? val : 0),
                      0,
                    );
                    return (
                      <tr key={student.id} className="table-row">
                        <td className="table-cell sticky left-0 bg-surface-1 font-bold text-white/40">
                          #{student.rollNumber}
                        </td>
                        <td className="table-cell sticky left-10 bg-surface-1 font-medium">
                          {student.name}
                        </td>
                        {student.cells.map((val, j) => (
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
                          {studentTotal > 0
                            ? `Rs. ${studentTotal.toLocaleString()}`
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Monthly totals row */}
                  <tr className="border-t-2 border-brand-500/20 bg-surface-2">
                    <td className="table-cell font-bold text-white/60 sticky left-0 bg-surface-2">
                      Total
                    </td>
                    <td className="table-cell font-bold text-white/60 sticky left-10 bg-surface-2">
                      Monthly
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

                  {/* Grand total row */}
                  <tr className="border-t-2 border-emerald-500/30 bg-emerald-500/5">
                    <td className="table-cell font-bold text-emerald-400 sticky left-0 bg-emerald-500/5">
                      Grand
                    </td>
                    <td className="table-cell font-bold text-emerald-400 sticky left-10 bg-emerald-500/5">
                      Total
                    </td>
                    {monthTotals.map((t, j) => (
                      <td
                        key={j}
                        className="px-2 py-3 text-center text-xs font-bold text-emerald-400"
                      >
                        {t > 0 ? t.toLocaleString() : "—"}
                      </td>
                    ))}
                    <td className="px-2 py-3 text-center text-sm font-bold text-emerald-300 bg-emerald-500/10 rounded">
                      Rs. {grandTotal.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {rows && rows.length > 0 && (
        <FeeRecordPDF
          academyName={academyName}
          className={selectedClassName}
          yearLabel={yearLabel}
          rows={rows}
        />
      )}
    </div>
  );
}
