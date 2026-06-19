"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import React from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAcademyData } from "@/lib/academy-data/provider";
import {
  getStudentTestScores,
  getStudentAttendanceByMonth,
  type ScoreBySubject,
  type AttendanceByMonth,
} from "@/lib/students/actions";
import {
  ArrowLeft,
  Share2,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

// SVG line chart helpers — identical to the original implementation
const W = 400;
const H = 120;
const PAD = 20;

function buildPath(values: number[]) {
  if (values.length < 2) return "";
  const xStep = (W - PAD * 2) / (values.length - 1);
  return values
    .map((v, i) => {
      const x = PAD + i * xStep;
      const y = PAD + ((100 - v) / 100) * (H - PAD * 2);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function buildArea(values: number[]) {
  if (values.length < 2) return "";
  const xStep = (W - PAD * 2) / (values.length - 1);
  const pts = values.map((v, i) => ({
    x: PAD + i * xStep,
    y: PAD + ((100 - v) / 100) * (H - PAD * 2),
  }));
  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  return `${line} L ${pts[pts.length - 1].x} ${H - PAD} L ${pts[0].x} ${H - PAD} Z`;
}

// Colour palette cycles through subjects
const SUBJECT_COLORS = [
  { color: "#818cf8", colorBg: "rgba(129,140,248,0.15)" },
  { color: "#06b6d4", colorBg: "rgba(6,182,212,0.15)" },
  { color: "#a78bfa", colorBg: "rgba(167,139,250,0.15)" },
  { color: "#10b981", colorBg: "rgba(16,185,129,0.15)" },
  { color: "#f59e0b", colorBg: "rgba(245,158,11,0.15)" },
  { color: "#f472b6", colorBg: "rgba(244,114,182,0.15)" },
];

export default function AnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const { students } = useAcademyData();
  const student = students.find((s) => s.id === id);

  const [scores, setScores] = useState<ScoreBySubject[] | null>(null);
  const [attendanceMonths, setAttendanceMonths] = useState<
    AttendanceByMonth[] | null
  >(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const [s, a] = await Promise.all([
        getStudentTestScores(id),
        getStudentAttendanceByMonth(id),
      ]);
      if (!active) return;
      setScores(s);
      setAttendanceMonths(a);
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, [id]);

  if (!student) {
    return (
      <div className="text-center py-20 text-white/40">
        Student not found.{" "}
        <Link href="/app/students" className="text-brand-400 hover:underline">
          Go back
        </Link>
      </div>
    );
  }

  // Shape scores into the format the SVG charts expect
  const subjectData = (scores ?? []).map((s, idx) => {
    const colorPair = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
    const percents = s.tests.map((t) =>
      Math.round((t.obtained / t.total) * 100),
    );
    const avg =
      percents.length > 0
        ? Math.round(percents.reduce((a, b) => a + b, 0) / percents.length)
        : 0;
    return {
      subject: s.subject,
      avg,
      tests: percents,
      labels: s.tests.map((t) => t.name),
      ...colorPair,
    };
  });

  // Shape attendance into stacked bar data
  const attendanceData = (attendanceMonths ?? []).map((m) => ({
    month: m.month.split(" ")[0].slice(0, 3), // "June 2026" -> "Jun"
    present: m.present,
    absent: m.absent,
    leave: 0, // L is already folded into absent in the query
    total: m.present + m.absent,
  }));

  const totalTests = subjectData.reduce((sum, s) => sum + s.tests.length, 0);
  const overallTrend =
    student.avgScore >= 75 ? "up" : student.avgScore >= 50 ? "stable" : "down";
  const attendanceTrend =
    student.attendancePercent >= 80
      ? "up"
      : student.attendancePercent >= 60
        ? "stable"
        : "down";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-white/30 text-sm">
        Loading analytics…
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl">
      <PageHeader
        title="Student Analytics"
        subtitle={student.name}
        back={
          <Link href={`/app/students/${id}`}>
            <button className="p-2 hover:bg-white/8 rounded-xl transition-colors cursor-pointer">
              <ArrowLeft size={18} />
            </button>
          </Link>
        }
        actions={
          <Button variant="secondary" icon={<Share2 size={14} />} size="sm">
            Share via WhatsApp
          </Button>
        }
      />

      {/* Overview cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Avg. Score",
            value: `${student.avgScore}%`,
            color: "text-brand-400",
            trend: overallTrend,
          },
          {
            label: "Attendance",
            value: `${student.attendancePercent}%`,
            color: "text-cyan-400",
            trend: attendanceTrend,
          },
          {
            label: "Tests Taken",
            value: String(totalTests),
            color: "text-violet-400",
            trend: "up",
          },
        ].map(({ label, value, color, trend }) => (
          <Card key={label} className="p-4 text-center">
            <div className={`text-xl font-bold font-display ${color}`}>
              {value}
            </div>
            <div className="text-xs text-white/40 mt-1">{label}</div>
            <div className="flex justify-center mt-2">
              {trend === "up" ? (
                <TrendingUp size={12} className="text-emerald-400" />
              ) : trend === "down" ? (
                <TrendingDown size={12} className="text-rose-400" />
              ) : (
                <Minus size={12} className="text-white/30" />
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Subject line charts */}
      {subjectData.length === 0 ? (
        <Card className="p-10 text-center text-white/30 text-sm">
          No test results yet — charts will appear once marks are entered.
        </Card>
      ) : (
        <Card className="p-5">
          <h3 className="section-title mb-5">Subject-wise Performance</h3>
          <div className="space-y-6">
            {subjectData.map(
              ({ subject, avg, tests, labels, color, colorBg }) => (
                <div key={subject}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: color }}
                      />
                      <span className="text-sm font-semibold text-white">
                        {subject}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap justify-end">
                      {tests.map((v, i) => (
                        <span key={i} className="text-xs text-white/40">
                          {labels[i]}:{" "}
                          <span className="text-white/70 font-medium">
                            {v}%
                          </span>
                        </span>
                      ))}
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: colorBg, color }}
                      >
                        Avg {avg}%
                      </span>
                    </div>
                  </div>
                  <div className="bg-surface-2 rounded-xl p-3 overflow-hidden">
                    {tests.length < 2 ? (
                      // Single test — show a simple bar instead of a line
                      <div className="flex items-center gap-3 py-2">
                        <span className="text-xs text-white/40 w-8">
                          {labels[0]}
                        </span>
                        <div className="flex-1 h-2 bg-surface-3 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${tests[0]}%`, background: color }}
                          />
                        </div>
                        <span className="text-xs font-bold" style={{ color }}>
                          {tests[0]}%
                        </span>
                      </div>
                    ) : (
                      <svg
                        viewBox={`0 0 ${W} ${H}`}
                        className="w-full"
                        style={{ height: 100 }}
                      >
                        {[25, 50, 75].map((g) => {
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
                              />
                              <text
                                x={PAD - 4}
                                y={y + 4}
                                fontSize="8"
                                fill="rgba(255,255,255,0.25)"
                                textAnchor="end"
                              >
                                {g}
                              </text>
                            </g>
                          );
                        })}
                        <path d={buildArea(tests)} fill={colorBg} />
                        <path
                          d={buildPath(tests)}
                          fill="none"
                          stroke={color}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {tests.map((v, i) => {
                          const xStep = (W - PAD * 2) / (tests.length - 1);
                          const x = PAD + i * xStep;
                          const y = PAD + ((100 - v) / 100) * (H - PAD * 2);
                          return (
                            <g key={i}>
                              <circle
                                cx={x}
                                cy={y}
                                r="4"
                                fill={color}
                                stroke="#1e1e35"
                                strokeWidth="2"
                              />
                              <text
                                x={x}
                                y={y - 8}
                                fontSize="9"
                                fill={color}
                                textAnchor="middle"
                              >
                                {v}%
                              </text>
                            </g>
                          );
                        })}
                        {labels.map((l, i) => {
                          const x =
                            PAD + i * ((W - PAD * 2) / (labels.length - 1));
                          return (
                            <text
                              key={l}
                              x={x}
                              y={H - 2}
                              fontSize="9"
                              fill="rgba(255,255,255,0.3)"
                              textAnchor="middle"
                            >
                              {l}
                            </text>
                          );
                        })}
                      </svg>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        </Card>
      )}

      {/* Subject average comparison bar */}
      {subjectData.length > 0 && (
        <Card className="p-5">
          <h3 className="section-title mb-5">Subject Average Comparison</h3>
          <div className="space-y-3">
            {[...subjectData]
              .sort((a, b) => b.avg - a.avg)
              .map(({ subject, avg, color }) => (
                <div key={subject} className="flex items-center gap-3">
                  <span className="text-sm text-white/60 w-28 shrink-0 truncate">
                    {subject}
                  </span>
                  <div className="flex-1 h-2.5 bg-surface-3 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${avg}%`, background: color }}
                    />
                  </div>
                  <span className="text-sm font-bold text-white w-10 text-right">
                    {avg}%
                  </span>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Monthly attendance stacked bar */}
      {attendanceData.length === 0 ? (
        <Card className="p-10 text-center text-white/30 text-sm">
          No attendance records yet.
        </Card>
      ) : (
        <Card className="p-5">
          <h3 className="section-title mb-1">Monthly Attendance Trend</h3>
          <p className="text-xs text-white/40 mb-5">
            Present · Absent per month
          </p>
          <div className="space-y-3">
            {attendanceData.map(({ month, present, absent, total }) => {
              const pPct = total > 0 ? (present / total) * 100 : 0;
              const aPct = total > 0 ? (absent / total) * 100 : 0;
              return (
                <div key={month}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/60 w-10 shrink-0">
                      {month}
                    </span>
                    <div className="flex-1 mx-3 h-3 bg-surface-3 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-700"
                        style={{ width: `${pPct}%` }}
                      />
                      <div
                        className="h-full bg-rose-500 transition-all duration-700"
                        style={{ width: `${aPct}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/40 w-16 text-right shrink-0">
                      {present}P / {absent}A
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
