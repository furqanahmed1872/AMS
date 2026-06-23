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
  CalendarDays,
  TrendingDown,
  Minus,
} from "lucide-react";
import { StudentAnalyticsCard } from "@/components/templates/share/StudentAnalyticsCard";
import { shareElementAsImage } from "@/lib/export/utils";
import { Modal } from "@/components/ui/Modal";

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
  const { students, academyName } = useAcademyData();
  const student = students.find((s) => s.id === id);

  const [scores, setScores] = useState<ScoreBySubject[] | null>(null);
  const [attendanceMonths, setAttendanceMonths] = useState<
    AttendanceByMonth[] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  // ── ADD after existing useState lines ──
  const [showCombinedModal, setShowCombinedModal] = useState(false);
  const [combinedTab, setCombinedTab] = useState<"scores" | "attendance">(
    "scores",
  );

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

  const handleShare = async () => {
    if (!student) return;
    const s = student;
    setSharing(true);
    await shareElementAsImage(
      "student-analytics-share-card",
      `${s.name}'s Analytics — ${s.class}\nAvg Score: ${s.avgScore}% · Attendance: ${s.attendancePercent}%\n\nShared via Academy Management System`,
    );
    setSharing(false);
  };

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
          <Button
            variant="secondary"
            icon={<Share2 size={14} />}
            size="sm"
            loading={sharing}
            onClick={handleShare}
          >
            Share via WhatsApp
          </Button>
        }
      />
      {/* Overview cards */}
      // ── REPLACE the entire "Overview cards" div ──
      {/* Combined Stats Card */}
      <button
        onClick={() => setShowCombinedModal(true)}
        className="w-full text-left glass-card p-5 rounded-2xl border border-white/8 hover:border-brand-500/40 transition-all duration-200 cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
            Performance Overview
          </span>
          <span className="text-xs text-brand-400/60 group-hover:text-brand-400 transition-colors">
            View Details →
          </span>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {/* Avg Score */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center shrink-0">
              <TrendingUp size={18} className="text-brand-400" />
            </div>
            <div>
              <p
                className="text-2xl font-bold"
                style={{
                  color:
                    student.avgScore >= 75
                      ? "#4ade80"
                      : student.avgScore >= 50
                        ? "#818cf8"
                        : student.avgScore >= 33
                          ? "#fbbf24"
                          : "#f87171",
                }}
              >
                {student.avgScore}%
              </p>
              <p className="text-xs text-white/50 mt-0.5">Avg. Score</p>
            </div>
          </div>
          {/* Attendance */}
          <div className="flex items-center gap-4 border-l border-white/8 pl-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center shrink-0">
              <CalendarDays size={18} className="text-cyan-400" />
            </div>
            <div>
              <p
                className="text-2xl font-bold"
                style={{
                  color:
                    student.attendancePercent >= 80
                      ? "#4ade80"
                      : student.attendancePercent >= 60
                        ? "#fbbf24"
                        : "#f87171",
                }}
              >
                {student.attendancePercent}%
              </p>
              <p className="text-xs text-white/50 mt-0.5">Attendance</p>
            </div>
          </div>
        </div>
        {/* Summary footer */}
        <div className="mt-4 pt-4 border-t border-white/6 flex items-center justify-between text-xs text-white/35">
          <span>
            {totalTests} test{totalTests !== 1 ? "s" : ""} recorded
          </span>
          <span>
            {attendanceData.reduce((s, m) => s + m.present + m.absent, 0)}{" "}
            school days tracked
          </span>
        </div>
      </button>
      {/* Combined Modal */}
      {showCombinedModal && (
        <Modal
          isOpen={showCombinedModal}
          onClose={() => setShowCombinedModal(false)}
          title="Performance Details"
          size="lg"
        >
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-surface-2 rounded-xl mb-5">
            {(["scores", "attendance"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setCombinedTab(tab)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                  combinedTab === tab
                    ? "bg-brand-500 text-white shadow-sm"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {tab === "scores" ? "Test Scores" : "Attendance"}
              </button>
            ))}
          </div>

          {combinedTab === "scores" && (
            <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
              {subjectData.length === 0 ? (
                <p className="text-center text-white/30 text-sm py-10">
                  No test scores yet.
                </p>
              ) : (
                subjectData.map(
                  ({ subject, avg, tests: percents, labels, color }) => (
                    <div key={subject}>
                      {/* Subject header */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-sm font-semibold"
                          style={{ color }}
                        >
                          {subject}
                        </span>
                        <span className="text-xs text-white/40">
                          Avg:{" "}
                          <span className="text-white/70 font-medium">
                            {avg}%
                          </span>
                        </span>
                      </div>
                      {/* Per-test table */}
                      <div className="rounded-xl overflow-hidden border border-white/8">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-surface-2 text-white/40 text-xs">
                              <th className="px-3 py-2 text-left font-medium">
                                Test
                              </th>
                              <th className="px-3 py-2 text-right font-medium">
                                Obtained
                              </th>
                              <th className="px-3 py-2 text-right font-medium">
                                Total
                              </th>
                              <th className="px-3 py-2 text-right font-medium">
                                %
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {(scores ?? [])
                              .find((s) => s.subject === subject)
                              ?.tests.map((t, i) => {
                                const pct = Math.round(
                                  (t.obtained / t.total) * 100,
                                );
                                return (
                                  <tr
                                    key={i}
                                    className="hover:bg-white/3 transition-colors"
                                  >
                                    <td className="px-3 py-2.5 text-white/80">
                                      {t.name}
                                    </td>
                                    <td className="px-3 py-2.5 text-right text-white/70">
                                      {t.obtained}
                                    </td>
                                    <td className="px-3 py-2.5 text-right text-white/40">
                                      {t.total}
                                    </td>
                                    <td
                                      className="px-3 py-2.5 text-right font-semibold"
                                      style={{
                                        color:
                                          pct >= 75
                                            ? "#4ade80"
                                            : pct >= 50
                                              ? "#818cf8"
                                              : pct >= 33
                                                ? "#fbbf24"
                                                : "#f87171",
                                      }}
                                    >
                                      {pct}%
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ),
                )
              )}
            </div>
          )}

          {combinedTab === "attendance" && (
            <div className="max-h-[60vh] overflow-y-auto pr-1">
              {attendanceData.length === 0 ? (
                <p className="text-center text-white/30 text-sm py-10">
                  No attendance records yet.
                </p>
              ) : (
                <div className="rounded-xl overflow-hidden border border-white/8">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-surface-2 text-white/40 text-xs">
                        <th className="px-3 py-2 text-left font-medium">
                          Month
                        </th>
                        <th className="px-3 py-2 text-right font-medium">
                          Present
                        </th>
                        <th className="px-3 py-2 text-right font-medium">
                          Absent
                        </th>
                        <th className="px-3 py-2 text-right font-medium">
                          Total Days
                        </th>
                        <th className="px-3 py-2 text-right font-medium">%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(attendanceMonths ?? []).map((m, i) => {
                        const total = m.present + m.absent;
                        const pct =
                          total > 0 ? Math.round((m.present / total) * 100) : 0;
                        return (
                          <tr
                            key={i}
                            className="hover:bg-white/3 transition-colors"
                          >
                            <td className="px-3 py-2.5 text-white/80">
                              {m.month}
                            </td>
                            <td className="px-3 py-2.5 text-right text-emerald-400 font-medium">
                              {m.present}
                            </td>
                            <td className="px-3 py-2.5 text-right text-rose-400 font-medium">
                              {m.absent}
                            </td>
                            <td className="px-3 py-2.5 text-right text-white/40">
                              {total}
                            </td>
                            <td
                              className="px-3 py-2.5 text-right font-semibold"
                              style={{
                                color:
                                  pct >= 80
                                    ? "#4ade80"
                                    : pct >= 60
                                      ? "#fbbf24"
                                      : "#f87171",
                              }}
                            >
                              {pct}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {/* Totals footer */}
                    <tfoot>
                      <tr className="bg-surface-2 text-xs text-white/50 border-t border-white/10">
                        <td className="px-3 py-2 font-medium">Total</td>
                        <td className="px-3 py-2 text-right text-emerald-400 font-semibold">
                          {attendanceData.reduce((s, m) => s + m.present, 0)}
                        </td>
                        <td className="px-3 py-2 text-right text-rose-400 font-semibold">
                          {attendanceData.reduce((s, m) => s + m.absent, 0)}
                        </td>
                        <td className="px-3 py-2 text-right text-white/40 font-semibold">
                          {attendanceData.reduce(
                            (s, m) => s + m.present + m.absent,
                            0,
                          )}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-white/70">
                          {student.attendancePercent}%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}
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
      {!loading && student && (
        <StudentAnalyticsCard
          academyName={academyName}
          studentName={student.name}
          className={student.class}
          rollNumber={student.rollNumber}
          avgScore={student.avgScore}
          attendancePercent={student.attendancePercent}
          totalTests={totalTests}
          scores={scores ?? []}
          months={attendanceMonths ?? []}
        />
      )}
    </div>
  );
}
