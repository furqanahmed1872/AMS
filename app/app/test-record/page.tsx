"use client";
import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { STUDENTS, CLASSES, SUBJECTS } from "@/lib/dummy-data";
import { Download } from "lucide-react";

const classOptions = CLASSES.map(c => ({ value: c.id, label: c.displayName }));
const subjectOptions = SUBJECTS.map(s => ({ value: s.id, label: s.name }));
const testCols = ["T1", "T2", "T3", "T4", "T5"];
const testData = [
  [30, 29, 28, 29, null],
  [30, 29, 30, 29, 59],
  [14, 13, 12, 7, 18],
  [28, 30, null, 27, 50],
];
const totals = [30, 30, 30, 30, 60];

export default function TestRecordPage() {
  const [cls, setCls] = useState("c1");
  const [subject, setSubject] = useState("s1");
  const [teacherName, setTeacherName] = useState("");
  const students = STUDENTS.filter(s => s.classId === cls && s.status === "active");

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title="Test Record" subtitle="Yearly subject test summary" />
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <Select label="Class" options={classOptions} value={cls} onChange={e => setCls(e.target.value)} className="h-9 min-w-36" />
          <Select label="Subject" options={subjectOptions} value={subject} onChange={e => setSubject(e.target.value)} className="h-9 min-w-36" />
          <Input label="Teacher Name (for export)" placeholder="e.g. Ali Ahmed" value={teacherName} onChange={e => setTeacherName(e.target.value)} className="h-9 min-w-44" />
        </div>
      </Card>

      <div className="glass-card overflow-x-auto">
        <div className="p-4 border-b border-white/8 flex items-center justify-between">
          <div>
            <h3 className="section-title">10th Blue · Mathematics</h3>
            {teacherName && <p className="text-xs text-white/40 mt-0.5">Teacher: {teacherName}</p>}
          </div>
          <Button variant="secondary" size="sm" icon={<Download size={14} />}>Download PDF</Button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-surface-2">
            <tr>
              <th className="table-header sticky left-0 bg-surface-2 min-w-32">Name</th>
              {testCols.map((t, i) => <th key={t} className="table-header text-center min-w-20">{t}<br/><span className="text-white/30 text-xs font-normal">/{totals[i]}</span></th>)}
            </tr>
          </thead>
          <tbody>
            {students.slice(0, 4).map((student, i) => (
              <tr key={student.id} className="table-row">
                <td className="table-cell sticky left-0 bg-surface-1 font-medium">{student.name}</td>
                {testCols.map((_, j) => {
                  const val = testData[i]?.[j];
                  return (
                    <td key={j} className={`px-4 py-3 text-center font-medium ${val === null ? "text-white/20" : val / totals[j] >= 0.33 ? "text-white/80" : "text-rose-400"}`}>
                      {val === null ? "—" : `${val}/${totals[j]}`}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
