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
          <Select
            label="Class"
            options={classOptions}
            value={cls}
            onChange={(e) => setCls(e.target.value)}
            className="h-9 min-w-36"
          />
          <Select
            label="Subject"
            options={subjectOptions}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="h-9 min-w-36"
          />
          <Input
            label="Teacher Name (for export)"
            placeholder="e.g. Ali Ahmed"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            className="h-9 min-w-44"
          />
        </div>
      </Card>

      <div className="glass-card overflow-x-auto">
        <div className="p-4 border-b border-white/8 flex items-center justify-between">
          <div>
            <h3 className="section-title">10th Blue · Mathematics</h3>
            {teacherName && (
              <p className="text-xs text-white/40 mt-0.5">
                Teacher: {teacherName}
              </p>
            )}
          </div>
          <Button variant="secondary" size="sm" icon={<Download size={14} />}>
            Download PDF
          </Button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-surface-2">
            <tr>
              <th className="table-header sticky left-0 bg-surface-2 min-w-32">
                Name
              </th>
              {testCols.map((t, i) => (
                <th key={t} className="table-header text-center min-w-20">
                  {t}
                  <br />
                  <span className="text-white/30 text-xs font-normal">
                    /{totals[i]}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.slice(0, 4).map((student, i) => (
              <tr key={student.id} className="table-row">
                <td className="table-cell sticky left-0 bg-surface-1 font-medium">
                  {student.name}
                </td>
                {testCols.map((_, j) => {
                  const val = testData[i]?.[j];
                  return (
                    <td
                      key={j}
                      className={`px-4 py-3 text-center font-medium ${val === null ? "text-white/20" : val / totals[j] >= 0.33 ? "text-white/80" : "text-rose-400"}`}
                    >
                      {val === null ? "—" : `${val}/${totals[j]}`}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Graph Section */}
      <div className="glass-card p-5">
        <h3 className="section-title mb-1">Student Performance Graph</h3>
        <p className="text-xs text-white/40 mb-5">
          Each line represents one student's test scores over time
        </p>

        {(() => {
          const W = 500;
          const H = 160;
          const PAD = 30;
          const colors = [
            "#818cf8",
            "#06b6d4",
            "#10b981",
            "#f59e0b",
            "#f43f5e",
            "#a78bfa",
          ];
          const allData = [
            { name: "Ahmad Irfan", scores: [100, 96, 93, 96, 100] },
            { name: "Ali Haider", scores: [100, 96, 100, 96, 98] },
            { name: "Faizan Shakeel", scores: [46, 43, 40, 23, 30] },
            { name: "Zainab Malik", scores: [93, 100, 90, 90, 83] },
          ];

          function pt(scores: number[], i: number) {
            const xStep = (W - PAD * 2) / (scores.length - 1);
            const x = PAD + i * xStep;
            const y = PAD + ((100 - scores[i]) / 100) * (H - PAD * 2);
            return { x, y };
          }

          function linePath(scores: number[]) {
            return scores
              .map((_, i) => {
                const { x, y } = pt(scores, i);
                return `${i === 0 ? "M" : "L"} ${x} ${y}`;
              })
              .join(" ");
          }

          return (
            <div className="bg-surface-2 rounded-xl p-4">
              <svg
                viewBox={`0 0 ${W} ${H}`}
                className="w-full"
                style={{ height: 180 }}
              >
                {/* Grid */}
                {[25, 50, 75, 100].map((g) => {
                  const y = PAD + ((100 - g) / 100) * (H - PAD * 2);
                  return (
                    <g key={g}>
                      <line
                        x1={PAD}
                        y1={y}
                        x2={W - PAD}
                        y2={y}
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="1"
                        strokeDasharray={g === 100 ? "0" : "4 4"}
                      />
                      <text
                        x={PAD - 5}
                        y={y + 3}
                        fontSize="8"
                        fill="rgba(255,255,255,0.25)"
                        textAnchor="end"
                      >
                        {g}%
                      </text>
                    </g>
                  );
                })}
                {/* X axis labels */}
                {testCols.map((label, i) => {
                  const x = PAD + i * ((W - PAD * 2) / (testCols.length - 1));
                  return (
                    <text
                      key={label}
                      x={x}
                      y={H - 2}
                      fontSize="9"
                      fill="rgba(255,255,255,0.3)"
                      textAnchor="middle"
                    >
                      {label}
                    </text>
                  );
                })}
                {/* Lines per student */}
                {allData.map(({ scores }, si) => (
                  <g key={si}>
                    <path
                      d={linePath(scores)}
                      fill="none"
                      stroke={colors[si % colors.length]}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {scores.map((v, i) => {
                      const { x, y } = pt(scores, i);
                      return (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r="3.5"
                          fill={colors[si % colors.length]}
                          stroke="#1e1e35"
                          strokeWidth="1.5"
                        />
                      );
                    })}
                  </g>
                ))}
              </svg>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-white/8">
                {allData.map(({ name }, si) => (
                  <div key={name} className="flex items-center gap-1.5">
                    <div
                      className="w-4 h-1 rounded-full"
                      style={{ background: colors[si % colors.length] }}
                    />
                    <span className="text-xs text-white/50">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
