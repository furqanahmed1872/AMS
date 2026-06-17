"use client";
import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { STUDENTS, CLASSES } from "@/lib/dummy-data";
import { Download } from "lucide-react";

const classOptions = CLASSES.map(c => ({ value: c.id, label: c.displayName }));
const yearOptions = [{ value: "2024-25", label: "2024–25" }, { value: "2025-26", label: "2025–26" }];
const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

const feeData: Record<string, (string | number | null)[]> = {
  "st1": [4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000],
  "st2": [4000, "X", 4000, 4000, "X", 4000, 4000, 4000, 4000, "X", 4000],
  "st3": [null, null, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000],
  "st4": [4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000],
};

export default function FeeRecordPage() {
  const [selectedClass, setSelectedClass] = useState("c1");
  const [year, setYear] = useState("2024-25");
  const students = STUDENTS.filter(s => s.classId === selectedClass && s.status === "active");

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title="Fee Record" subtitle="Yearly fee history by class" />
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Select options={classOptions} value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="h-9 min-w-36" />
          <Select options={yearOptions} value={year} onChange={e => setYear(e.target.value)} className="h-9 min-w-28" />
        </div>
      </Card>
      <div className="glass-card overflow-x-auto">
        <div className="p-4 border-b border-white/8 flex items-center justify-between">
          <h3 className="section-title">10th Blue · Academic Year {year}</h3>
          <Button variant="secondary" size="sm" icon={<Download size={14} />}>Download PDF</Button>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-surface-2">
            <tr>
              <th className="table-header sticky left-0 bg-surface-2 z-10 min-w-10">Roll</th>
              <th className="table-header sticky left-10 bg-surface-2 z-10 min-w-32">Name</th>
              {months.map(m => <th key={m} className="table-header text-center min-w-14">{m}</th>)}
            </tr>
          </thead>
          <tbody>
            {students.map((student, i) => {
              const data = feeData[student.id] || Array(11).fill("—");
              return (
                <tr key={student.id} className="table-row">
                  <td className="table-cell sticky left-0 bg-surface-1 font-bold text-white/40">#{student.rollNumber}</td>
                  <td className="table-cell sticky left-10 bg-surface-1 font-medium">{student.name}</td>
                  {data.map((val, j) => (
                    <td key={j} className={`px-2 py-3 text-center font-semibold ${val === "X" ? "text-rose-400" : val === null ? "text-white/20" : "text-emerald-400"}`}>
                      {val === null ? "—" : val === "X" ? "✗" : val}
                    </td>
                  ))}
                </tr>
              );
            })}
            <tr className="border-t-2 border-brand-500/20 bg-surface-2">
              <td colSpan={2} className="table-cell font-bold text-white/60 sticky left-0 bg-surface-2">Total</td>
              {months.map((m, j) => {
                const total = students.reduce((sum, s) => {
                  const val = (feeData[s.id] || [])[j];
                  return sum + (typeof val === "number" ? val : 0);
                }, 0);
                return <td key={m} className="px-2 py-3 text-center text-xs font-bold text-brand-400">{total > 0 ? total.toLocaleString() : "—"}</td>;
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
