"use client";
import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MONTHLY_ATTENDANCE, CLASSES } from "@/lib/dummy-data";
import { ChevronLeft, ChevronRight, CheckCheck, XCircle, Clock, Save, Download } from "lucide-react";

type AttendanceStatus = "P" | "A" | "L" | null;

const classOptions = CLASSES.map(c => ({ value: c.id, label: c.displayName }));

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState("daily");
  const [selectedClass, setSelectedClass] = useState("c1");
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(
    Object.fromEntries(MONTHLY_ATTENDANCE.map(s => [s.studentId, s.status]))
  );

  const mark = (id: string, status: AttendanceStatus) => setAttendance(prev => ({ ...prev, [id]: status }));
  const markAll = (status: "P" | "A") => setAttendance(Object.fromEntries(MONTHLY_ATTENDANCE.map(s => [s.studentId, status])));

  const stepDate = (dir: 1 | -1) => {
    const d = new Date(date); d.setDate(d.getDate() + dir);
    setDate(d.toISOString().split("T")[0]);
  };

  const counts = { P: 0, A: 0, L: 0 };
  Object.values(attendance).forEach(s => { if (s) counts[s]++; });

  const statusVariantMap: Record<"P" | "A" | "L", string> = { P: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", A: "bg-rose-500/20 text-rose-400 border-rose-500/30", L: "bg-amber-500/20 text-amber-400 border-amber-500/30" };

  // Monthly table dummy data
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const statuses: AttendanceStatus[] = ["P", "A", "P", "P", "L", "P", "A", "P", "P", "P", "P", "A", "P", "P", "L", "P", "P", "P", "A", "P", "P", "P", "P", "L", "P", "A", "P", "P", "P", "P"];

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title="Attendance" subtitle="Track daily student attendance" />

      <Tabs
        tabs={[{ id: "daily", label: "Daily Marking" }, { id: "monthly", label: "Monthly Record" }]}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="w-fit"
      />

      {activeTab === "daily" && (
        <div className="space-y-4">
          {/* Controls */}
          <Card className="p-4">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => stepDate(-1)} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ChevronLeft size={16} /></button>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field w-40 h-9 text-sm" />
                <button onClick={() => stepDate(1)} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ChevronRight size={16} /></button>
              </div>
              <Select options={classOptions} value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="h-9 min-w-36" />
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => markAll("P")} icon={<CheckCheck size={14} />}>All P</Button>
                <Button variant="ghost" size="sm" onClick={() => markAll("A")} icon={<XCircle size={14} />}>All A</Button>
              </div>
            </div>
          </Card>

          {/* Summary */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Present", count: counts.P, color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { label: "Absent", count: counts.A, color: "text-rose-400", bg: "bg-rose-500/10" },
              { label: "Leave", count: counts.L, color: "text-amber-400", bg: "bg-amber-500/10" },
              { label: "Total", count: MONTHLY_ATTENDANCE.length, color: "text-white/70", bg: "bg-white/5" },
            ].map(({ label, count, color, bg }) => (
              <div key={label} className={`glass-card p-3 text-center ${bg}`}>
                <div className={`text-xl font-bold font-display ${color}`}>{count}</div>
                <div className="text-xs text-white/40 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Student List */}
          <Card className="overflow-hidden">
            <div className="divide-y divide-white/5">
              {MONTHLY_ATTENDANCE.map((student) => {
                const status = attendance[student.studentId];
                return (
                  <div key={student.studentId} className="flex items-center gap-4 px-4 py-3">
                    <span className="text-xs font-bold text-white/30 w-6">#{student.rollNumber}</span>
                    <span className="flex-1 text-sm font-medium text-white">{student.name}</span>
                    <div className="flex gap-1.5">
                      {(["P", "A", "L"] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => mark(student.studentId, s)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold border transition-all duration-150 ${
                            status === s ? statusVariantMap[s] : "border-white/10 text-white/30 hover:border-white/30"
                          }`}
                        >{s}</button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Button icon={<Save size={15} />} className="w-full">Save Attendance</Button>
        </div>
      )}

      {activeTab === "monthly" && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <Select options={classOptions} value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="h-9 min-w-36" />
              <input type="month" defaultValue="2025-06" className="input-field w-44 h-9 text-sm" />
            </div>
          </Card>

          <div className="glass-card overflow-x-auto">
            <div className="p-4 border-b border-white/8 flex items-center justify-between">
              <h3 className="section-title">10th Blue — June 2025</h3>
              <Button variant="secondary" size="sm" icon={<Download size={14} />}>Download PDF</Button>
            </div>
            <table className="w-full text-xs">
              <thead className="bg-surface-2">
                <tr>
                  <th className="table-header sticky left-0 bg-surface-2 z-10">Roll</th>
                  <th className="table-header sticky left-12 bg-surface-2 z-10 min-w-28">Name</th>
                  <th className="table-header">Fee</th>
                  {days.map(d => <th key={d} className="table-header min-w-8 px-2">{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {MONTHLY_ATTENDANCE.map((student, i) => (
                  <tr key={student.studentId} className="table-row">
                    <td className="table-cell sticky left-0 bg-surface-1 font-bold text-white/40">#{student.rollNumber}</td>
                    <td className="table-cell sticky left-12 bg-surface-1 font-medium min-w-28">{student.name}</td>
                    <td className="table-cell"><Badge variant="paid">Yes</Badge></td>
                    {days.map(d => {
                      const s = statuses[(d + i) % statuses.length] || null;
                      return (
                        <td key={d} className={`px-2 py-3 text-center font-bold ${s === "P" ? "text-emerald-400" : s === "A" ? "text-rose-400" : s === "L" ? "text-amber-400" : "text-white/20"}`}>
                          {s || "—"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
