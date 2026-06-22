"use client";
import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAcademyData } from "@/lib/academy-data/provider";
import {
  getTestRecordAction,
  type TestRecordTest,
  type TestRecordRow,
} from "@/lib/tests/actions";
import { Download } from "lucide-react";
import { TestRecordPDF } from "@/components/templates/pdf/TestRecordPDF";
import { exportElementAsPDF } from "@/lib/export/utils";

const COLORS = [
  "#818cf8",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#a78bfa",
  "#34d399",
  "#fb923c",
];

export default function TestRecordPage() {
  const { classes, subjects, academyName } = useAcademyData();

  const [cls, setCls] = useState(classes[0]?.id ?? "");
  const [subject, setSubject] = useState(subjects[0]?.id ?? "");
  const [teacherName, setTeacherName] = useState("");
  const [tests, setTests] = useState<TestRecordTest[]>([]);
  const [rows, setRows] = useState<TestRecordRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  const classOptions = classes.map((c) => ({
    value: c.id,
    label: c.displayName,
  }));
  const subjectOptions = subjects.map((s) => ({ value: s.id, label: s.name }));

  const selectedClassName =
    classes.find((c) => c.id === cls)?.displayName ?? "";
  const selectedSubjectName =
    subjects.find((s) => s.id === subject)?.name ?? "";

  const load = useCallback(async () => {
    if (!cls || !subject) return;
    setLoading(true);
    const result = await getTestRecordAction(cls, subject);
    setTests(result.tests);
    setRows(result.rows);
    setLoading(false);
  }, [cls, subject]);

  useEffect(() => {
    load();
  }, [load]);

  // SVG graph helpers
  const W = 500;
  const H = 160;
  const PAD = 30;

  function pt(scores: number[], i: number) {
    const xStep = tests.length > 1 ? (W - PAD * 2) / (tests.length - 1) : W / 2;
    return {
      x: tests.length > 1 ? PAD + i * xStep : W / 2,
      y: PAD + ((100 - scores[i]) / 100) * (H - PAD * 2),
    };
  }

  function linePath(scores: number[]) {
    if (scores.length < 2) return "";
    return scores
      .map((_, i) => {
        const { x, y } = pt(scores, i);
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  }

  const handleExportPDF = async () => {
    if (!rows || rows.length === 0 || tests.length === 0) return;
    setExportingPDF(true);
    await exportElementAsPDF(
      "test-record-pdf-template",
      `TestRecord_${selectedClassName}_${selectedSubjectName}`,
      "landscape",
    );
    setExportingPDF(false);
  };

  // Build per-student score percentages for the graph
  const graphData = rows
    .map((row) => ({
      name: row.name,
      scores: row.cells
        .map((cell, j) =>
          cell === null
            ? null
            : cell === "absent"
              ? 0
              : Math.round((cell / tests[j].totalMarks) * 100),
        )
        .filter((v): v is number => v !== null),
    }))
    .filter((d) => d.scores.length >= 1);

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
            className="min-w-36"
          />
          <Select
            label="Subject"
            options={subjectOptions}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="min-w-36"
          />
          <Input
            label="Teacher Name (for export)"
            placeholder="e.g. Ali Ahmed"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            className="h-10.5 min-w-44"
          />
        </div>
      </Card>

      {/* Table */}
      <div className="glass-card overflow-x-auto">
        <div className="p-4 border-b border-white/8 flex items-center justify-between">
          <div>
            <h3 className="section-title">
              {selectedClassName} · {selectedSubjectName}
            </h3>
            {teacherName && (
              <p className="text-xs text-white/40 mt-0.5">
                Teacher: {teacherName}
              </p>
            )}
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download size={14} />}
            loading={exportingPDF}
            onClick={handleExportPDF}
          >
            Download PDF
          </Button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-white/30 text-sm">Loading…</div>
        ) : tests.length === 0 ? (
          <div className="p-10 text-center text-white/30 text-sm">
            No tests found for this class and subject.
          </div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-white/30 text-sm">
            No active students in this class.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface-2">
              <tr>
                <th className="table-header sticky left-0 bg-surface-2 min-w-32">
                  Name
                </th>
                {tests.map((t) => (
                  <th key={t.id} className="table-header text-center min-w-20">
                    {t.name}
            
                    
                    <br />
                    <span className="text-white/25 text-xs font-normal">
                      {new Date(t.date).toLocaleDateString("en-PK", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.studentId} className="table-row">
                  <td className="table-cell sticky left-0 bg-surface-1 font-medium">
                    {row.name}
                  </td>
                  {row.cells.map((cell, j) => {
                    const total = tests[j].totalMarks;
                    const pct =
                      cell === null
                        ? null
                        : cell === "absent"
                          ? 0
                          : (cell / total) * 100;
                    return (
                      <td
                        key={j}
                        className={`px-4 py-3 text-center font-medium ${
                          cell === null
                            ? "text-white/20"
                            : cell === "absent"
                              ? "text-rose-400"
                              : pct! >= 33
                                ? "text-white/80"
                                : "text-rose-400"
                        }`}
                      >
                        {cell === null
                          ? "—"
                          : cell === "absent"
                            ? "Absent"
                            : `${cell}/${total}`}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Performance Graph */}
      {graphData.length > 0 && tests.length >= 2 && (
        <div className="glass-card p-5">
          <h3 className="section-title mb-1">Student Performance Graph</h3>
          <p className="text-xs text-white/40 mb-5">
            Each line represents one student's test scores over time
          </p>
          <div className="bg-surface-2 rounded-xl p-4">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full"
              style={{ height: 180 }}
            >
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
              {tests.map((t, i) => {
                const x =
                  tests.length > 1
                    ? PAD + i * ((W - PAD * 2) / (tests.length - 1))
                    : W / 2;
                return (
                  <text
                    key={t.id}
                    x={x}
                    y={H - 2}
                    fontSize="9"
                    fill="rgba(255,255,255,0.3)"
                    textAnchor="middle"
                  >
                    {t.name}
                  </text>
                );
              })}
              {graphData.map(({ scores }, si) => (
                <g key={si}>
                  <path
                    d={linePath(scores)}
                    fill="none"
                    stroke={COLORS[si % COLORS.length]}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {scores.map((_, i) => {
                    const { x, y } = pt(scores, i);
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="3.5"
                        fill={COLORS[si % COLORS.length]}
                        stroke="#1e1e35"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                </g>
              ))}
            </svg>
            <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-white/8">
              {graphData.map(({ name }, si) => (
                <div key={name} className="flex items-center gap-1.5">
                  <div
                    className="w-4 h-1 rounded-full"
                    style={{ background: COLORS[si % COLORS.length] }}
                  />
                  <span className="text-xs text-white/50">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hidden PDF template */}
      {rows.length > 0 && tests.length > 0 && (
        <TestRecordPDF
          academyName={academyName}
          className={selectedClassName}
          subjectName={selectedSubjectName}
          teacherName={teacherName}
          tests={tests}
          rows={rows}
        />
      )}
    </div>
  );
}
