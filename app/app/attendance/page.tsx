"use client";
import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAcademyData } from "@/lib/academy-data/provider";
import {
  getAttendanceForDateAction,
  saveAttendanceAction,
  getMonthlyAttendanceAction,
  type AttendanceStatus,
  type MonthlyStudentRow,
} from "@/lib/attendance/actions";
import {
  ChevronLeft,
  ChevronRight,
  CheckCheck,
  XCircle,
  Clock,
  Save,
  Download,
} from "lucide-react";

const statusVariantMap: Record<AttendanceStatus, string> = {
  P: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  A: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  L: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

export default function AttendancePage() {
  const { classes, students } = useAcademyData();

  const today = new Date().toISOString().split("T")[0];

  // ── Shared state ──────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("daily");
  const [selectedClass, setSelectedClass] = useState(classes[0]?.id ?? "");

  const classOptions = classes.map((c) => ({
    value: c.id,
    label: c.displayName,
  }));

  // ── Daily tab state ───────────────────────────────────────────
  const [date, setDate] = useState(today);
  const [attendance, setAttendance] = useState<
    Record<string, AttendanceStatus | null>
  >({});
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Students for the selected class (active only, sorted by roll number)
  const classStudents = students
    .filter((s) => s.classId === selectedClass && s.status === "active")
    .sort((a, b) => a.rollNumber - b.rollNumber);

  // Load existing records whenever class or date changes
  const loadDailyAttendance = useCallback(async () => {
    if (!selectedClass) return;
    setLoadingDaily(true);
    setSaveSuccess(false);
    setSaveError("");
    const existing = await getAttendanceForDateAction(selectedClass, date);
    // Pre-fill: existing statuses from DB, null for students not yet marked
    const init: Record<string, AttendanceStatus | null> = {};
    for (const s of classStudents) {
      init[s.id] = existing[s.id] ?? null;
    }
    setAttendance(init);
    setLoadingDaily(false);
  }, [selectedClass, date]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadDailyAttendance();
  }, [loadDailyAttendance]);

  const mark = (id: string, status: AttendanceStatus) =>
    setAttendance((prev) => ({ ...prev, [id]: status }));

  const markAll = (status: AttendanceStatus) => {
    const next: Record<string, AttendanceStatus> = {};
    for (const s of classStudents) next[s.id] = status;
    setAttendance(next);
  };

  const stepDate = (dir: 1 | -1) => {
    const d = new Date(date);
    d.setDate(d.getDate() + dir);
    setDate(d.toISOString().split("T")[0]);
  };

  const handleSave = async () => {
    const records = classStudents
      .filter((s) => attendance[s.id] != null)
      .map((s) => ({
        studentId: s.id,
        status: attendance[s.id] as AttendanceStatus,
      }));

    if (records.length === 0) {
      setSaveError("Please mark at least one student before saving.");
      return;
    }

    setSaving(true);
    setSaveError("");
    const result = await saveAttendanceAction(selectedClass, date, records);
    setSaving(false);

    if (!result.success) {
      setSaveError(result.error ?? "Something went wrong.");
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const counts = { P: 0, A: 0, L: 0 };
  Object.values(attendance).forEach((s) => {
    if (s) counts[s]++;
  });

  // ── Monthly tab state ─────────────────────────────────────────
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [monthInput, setMonthInput] = useState(defaultMonth);
  const [monthlyRows, setMonthlyRows] = useState<MonthlyStudentRow[] | null>(
    null,
  );
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  const loadMonthly = useCallback(async () => {
    if (!selectedClass || !monthInput) return;
    setLoadingMonthly(true);
    const [y, m] = monthInput.split("-").map(Number);
    const rows = await getMonthlyAttendanceAction(selectedClass, m, y);
    setMonthlyRows(rows);
    setLoadingMonthly(false);
  }, [selectedClass, monthInput]);

  useEffect(() => {
    if (activeTab === "monthly") loadMonthly();
  }, [activeTab, loadMonthly]);

  const daysInMonth = (() => {
    const [y, m] = monthInput.split("-").map(Number);
    return new Date(y, m, 0).getDate();
  })();

  const selectedClassName =
    classes.find((c) => c.id === selectedClass)?.displayName ?? "";
  const monthLabel = new Date(
    ...([monthInput + "-01"].map((d) => new Date(d)) as [Date]),
  ).toLocaleDateString("en-PK", { month: "long", year: "numeric" });

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Attendance"
        subtitle="Track daily student attendance"
      />

      <Tabs
        tabs={[
          { id: "daily", label: "Daily Marking" },
          { id: "monthly", label: "Monthly Record" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="w-fit"
      />

      {/* ── DAILY TAB ── */}
      {activeTab === "daily" && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              {/* Date picker */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => stepDate(-1)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field w-40 h-9 text-sm"
                />
                <button
                  onClick={() => stepDate(1)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Class selector */}
              <Select
                options={classOptions}
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="min-w-36"
              />

              {/* Mark-all shortcuts */}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => markAll("P")}
                  icon={<CheckCheck size={14} />}
                >
                  All P
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAll("A")}
                  icon={<XCircle size={14} />}
                >
                  All A
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAll("L")}
                  icon={<Clock size={14} />}
                >
                  All L
                </Button>
              </div>
            </div>
          </Card>

          {/* Summary counters */}
          <div className="grid grid-cols-4 gap-3">
            {[
              {
                label: "Present",
                count: counts.P,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
              },
              {
                label: "Absent",
                count: counts.A,
                color: "text-rose-400",
                bg: "bg-rose-500/10",
              },
              {
                label: "Leave",
                count: counts.L,
                color: "text-amber-400",
                bg: "bg-amber-500/10",
              },
              {
                label: "Total",
                count: classStudents.length,
                color: "text-white/70",
                bg: "bg-white/5",
              },
            ].map(({ label, count, color, bg }) => (
              <div key={label} className={`glass-card p-3 text-center ${bg}`}>
                <div className={`text-xl font-bold font-display ${color}`}>
                  {count}
                </div>
                <div className="text-xs text-white/40 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Student list */}
          {loadingDaily ? (
            <Card className="p-8 text-center text-white/30 text-sm">
              Loading…
            </Card>
          ) : classStudents.length === 0 ? (
            <Card className="p-10 text-center text-white/30 text-sm">
              No active students in this class.
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="divide-y divide-white/5">
                {classStudents.map((student) => {
                  const status = attendance[student.id] ?? null;
                  return (
                    <div
                      key={student.id}
                      className="flex items-center gap-4 px-4 py-3"
                    >
                      <span className="text-xs font-bold text-white/30 w-6">
                        #{student.rollNumber}
                      </span>
                      <span className="flex-1 text-sm font-medium text-white">
                        {student.name}
                      </span>
                      <div className="flex gap-1.5">
                        {(["P", "A", "L"] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => mark(student.id, s)}
                            className={`w-9 h-9 rounded-xl text-xs font-bold border transition-all duration-150 cursor-pointer ${
                              status === s
                                ? statusVariantMap[s]
                                : "border-white/10 text-white/30 hover:border-white/30"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {saveError && (
            <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
              {saveError}
            </p>
          )}
          {saveSuccess && (
            <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
              Attendance saved successfully.
            </p>
          )}

          <Button
            icon={<Save size={15} />}
            className="w-full"
            loading={saving}
            onClick={handleSave}
          >
            Save Attendance
          </Button>
        </div>
      )}

      {/* ── MONTHLY TAB ── */}
      {activeTab === "monthly" && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <Select
                options={classOptions}
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="min-w-36"
              />
              <input
                type="month"
                value={monthInput}
                onChange={(e) => setMonthInput(e.target.value)}
                className="input-field w-44 h-9 text-sm"
              />
            </div>
          </Card>

          <div className="glass-card overflow-x-auto">
            <div className="p-4 border-b border-white/8 flex items-center justify-between">
              <h3 className="section-title">
                {selectedClassName} — {monthLabel}
              </h3>
              <Button
                variant="secondary"
                size="sm"
                icon={<Download size={14} />}
              >
                Download PDF
              </Button>
            </div>

            {loadingMonthly ? (
              <div className="p-10 text-center text-white/30 text-sm">
                Loading…
              </div>
            ) : !monthlyRows || monthlyRows.length === 0 ? (
              <div className="p-10 text-center text-white/30 text-sm">
                No attendance records for this class and month.
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-surface-2">
                  <tr>
                    <th className="table-header sticky left-0 bg-surface-2 z-10">
                      Roll
                    </th>
                    <th className="table-header sticky left-12 bg-surface-2 z-10 min-w-28">
                      Name
                    </th>
                    <th className="table-header">Fee</th>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                      (d) => (
                        <th key={d} className="table-header min-w-8 px-2">
                          {d}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {monthlyRows.map((row) => (
                    <tr key={row.studentId} className="table-row">
                      <td className="table-cell sticky left-0 bg-surface-1 font-bold text-white/40">
                        #{row.rollNumber}
                      </td>
                      <td className="table-cell sticky left-12 bg-surface-1 font-medium min-w-28">
                        {row.name}
                      </td>
                      <td className="table-cell">
                        <Badge
                          variant={
                            row.feeStatus === "paid"
                              ? "paid"
                              : row.feeStatus === "not_set"
                                ? "not_set"
                                : "unpaid"
                          }
                        >
                          {row.feeStatus === "paid"
                            ? "Yes"
                            : row.feeStatus === "not_set"
                              ? "—"
                              : "No"}
                        </Badge>
                      </td>
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                        (d) => {
                          const s = row.days[d];
                          return (
                            <td
                              key={d}
                              className={`px-2 py-3 text-center font-bold ${
                                s === "P"
                                  ? "text-emerald-400"
                                  : s === "A"
                                    ? "text-rose-400"
                                    : s === "L"
                                      ? "text-amber-400"
                                      : "text-white/20"
                              }`}
                            >
                              {s ?? "—"}
                            </td>
                          );
                        },
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
