"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { getTeachersAction } from "@/lib/teachers/queries";
import { getTeacherAttendanceForDateAction } from "@/lib/teachers/queries";
import { markTeacherAttendanceAction } from "@/lib/teachers/actions";
import type { Teacher, AttendanceStatus } from "@/lib/teachers/types";
import {
  ChevronLeft,
  ChevronRight,
  CheckCheck,
  XCircle,
  Clock,
} from "lucide-react";

const statusStyle: Record<AttendanceStatus, string> = {
  P: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  A: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  L: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

export default function TeacherAttendancePage() {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendance, setAttendance] = useState<
    Record<string, AttendanceStatus | null>
  >({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setSaveSuccess(false);
    setSaveError("");
    const [allTeachers, existing] = await Promise.all([
      getTeachersAction(),
      getTeacherAttendanceForDateAction(date),
    ]);
    const active = allTeachers.filter((t) => t.status === "active");
    setTeachers(active);
    const init: Record<string, AttendanceStatus | null> = {};
    for (const t of active) init[t.id] = existing[t.id] ?? null;
    setAttendance(init);
    setLoading(false);
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  const mark = (id: string, status: AttendanceStatus) =>
    setAttendance((prev) => ({ ...prev, [id]: status }));

  const markAll = (status: AttendanceStatus) => {
    const next: Record<string, AttendanceStatus> = {};
    for (const t of teachers) next[t.id] = status;
    setAttendance(next);
  };

  const stepDate = (dir: 1 | -1) => {
    const d = new Date(date);
    d.setDate(d.getDate() + dir);
    setDate(d.toISOString().split("T")[0]);
  };

  const handleSave = async () => {
    const entries = teachers.filter((t) => attendance[t.id] != null);
    if (entries.length === 0) {
      setSaveError("Please mark at least one teacher before saving.");
      return;
    }
    setSaving(true);
    setSaveError("");
    const results = await Promise.all(
      entries.map((t) =>
        markTeacherAttendanceAction(
          t.id,
          date,
          attendance[t.id] as AttendanceStatus,
          t.branchId,
        ),
      ),
    );
    setSaving(false);
    const failed = results.find((r) => !r.success);
    if (failed) {
      setSaveError(failed.error ?? "Something went wrong.");
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      router.refresh();
    }
  };

  const counts = { P: 0, A: 0, L: 0 };
  Object.values(attendance).forEach((s) => {
    if (s) counts[s]++;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Teacher Attendance"
        subtitle="Mark daily attendance for teaching staff"
      />

      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
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

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center bg-emerald-500/5 border-emerald-500/15">
          <div className="text-xl font-bold text-emerald-400 font-display">
            {counts.P}
          </div>
          <div className="text-xs text-white/40 mt-1">Present</div>
        </Card>
        <Card className="p-4 text-center bg-rose-500/5 border-rose-500/15">
          <div className="text-xl font-bold text-rose-400 font-display">
            {counts.A}
          </div>
          <div className="text-xs text-white/40 mt-1">Absent</div>
        </Card>
        <Card className="p-4 text-center bg-amber-500/5 border-amber-500/15">
          <div className="text-xl font-bold text-amber-400 font-display">
            {counts.L}
          </div>
          <div className="text-xs text-white/40 mt-1">Leave</div>
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
              No active teachers. Add teachers first.
            </div>
          ) : (
            teachers.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 px-4 py-3.5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={t.name} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {t.name}
                    </p>
                    {t.subject && (
                      <p className="text-xs text-white/40">{t.subject}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {(["P", "A", "L"] as AttendanceStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => mark(t.id, s)}
                      className={`w-9 h-9 rounded-lg text-xs font-bold border transition-all ${
                        attendance[t.id] === s
                          ? statusStyle[s]
                          : "bg-white/5 text-white/30 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {saveError && <p className="text-sm text-rose-400">{saveError}</p>}
      {saveSuccess && (
        <p className="text-sm text-emerald-400">Attendance saved.</p>
      )}

      <Button
        className="w-full sm:w-auto"
        loading={saving}
        onClick={handleSave}
        disabled={teachers.length === 0}
      >
        Save Attendance
      </Button>
    </div>
  );
}
