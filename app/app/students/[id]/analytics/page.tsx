"use client";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { STUDENTS } from "@/lib/dummy-data";
import {
  ArrowLeft,
  Share2,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import React from "react";

export default function AnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const student = STUDENTS.find((s) => s.id === id) || STUDENTS[0];

  const subjectData = [
    {
      subject: "Mathematics",
      avg: 91,
      tests: [78, 83, 87, 90, 97],
      labels: ["T1", "T2", "T3", "T4", "T5"],
      color: "#818cf8",
      colorBg: "rgba(129,140,248,0.15)",
    },
    {
      subject: "Physics",
      avg: 85,
      tests: [90, 80, 75, 88, 92],
      labels: ["T1", "T2", "T3", "T4", "T5"],
      color: "#06b6d4",
      colorBg: "rgba(6,182,212,0.15)",
    },
    {
      subject: "Chemistry",
      avg: 72,
      tests: [68, 75, 70, 72, 78],
      labels: ["T1", "T2", "T3", "T4", "T5"],
      color: "#a78bfa",
      colorBg: "rgba(167,139,250,0.15)",
    },
    {
      subject: "English",
      avg: 88,
      tests: [85, 88, 87, 92, 90],
      labels: ["T1", "T2", "T3", "T4", "T5"],
      color: "#10b981",
      colorBg: "rgba(16,185,129,0.15)",
    },
  ];

  const attendanceData = [
    { month: "Jan", present: 18, absent: 4, leave: 1, total: 23 },
    { month: "Feb", present: 17, absent: 3, leave: 2, total: 22 },
    { month: "Mar", present: 20, absent: 2, leave: 1, total: 23 },
    { month: "Apr", present: 16, absent: 5, leave: 3, total: 24 },
    { month: "May", present: 21, absent: 2, leave: 0, total: 23 },
    { month: "Jun", present: 19, absent: 3, leave: 1, total: 23 },
  ];

  // SVG line graph helper
  const W = 400;
  const H = 120;
  const PAD = 20;
  function buildPath(values: number[]) {
    const min = 0;
    const max = 100;
    const xStep = (W - PAD * 2) / (values.length - 1);
    return values
      .map((v, i) => {
        const x = PAD + i * xStep;
        const y = PAD + ((max - v) / (max - min)) * (H - PAD * 2);
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  }
  function buildArea(values: number[]) {
    const min = 0;
    const max = 100;
    const xStep = (W - PAD * 2) / (values.length - 1);
    const pts = values.map((v, i) => ({
      x: PAD + i * xStep,
      y: PAD + ((max - v) / (max - min)) * (H - PAD * 2),
    }));
    const line = pts
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");
    return `${line} L ${pts[pts.length - 1].x} ${H - PAD} L ${pts[0].x} ${H - PAD} Z`;
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl">
      <PageHeader
        title="Student Analytics"
        subtitle={student.name}
        back={
          <Link href={`/app/students/${id}`}>    
            <button className="p-2 hover:bg-white/8 rounded-xl transition-colors">
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

      {/* Overview */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Avg. Score",
            value: `${student.avgScore}%`,
            color: "text-brand-400",
            trend: "up",
          },
          {
            label: "Attendance",
            value: `${student.attendancePercent}%`,
            color: "text-cyan-400",
            trend: "stable",
          },
          {
            label: "Tests Taken",
            value: "20",
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

      {/* Subject Line Graphs */}
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
                  <div className="flex items-center gap-3">
                    {tests.map((v, i) => (
                      <span key={i} className="text-xs text-white/40">
                        {labels[i]}:{" "}
                        <span className="text-white/70 font-medium">{v}%</span>
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
                {/* SVG Line Chart */}
                <div className="bg-surface-2 rounded-xl p-3 overflow-hidden">
                  <svg
                    viewBox={`0 0 ${W} ${H}`}
                    className="w-full"
                    style={{ height: 100 }}
                  >
                    {/* Grid lines */}
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
                    {/* Area fill */}
                    <path d={buildArea(tests)} fill={colorBg} />
                    {/* Line */}
                    <path
                      d={buildPath(tests)}
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Data points */}
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
                    {/* X labels */}
                    {labels.map((l, i) => {
                      const x = PAD + i * ((W - PAD * 2) / (labels.length - 1));
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
                </div>
              </div>
            ),
          )}
        </div>
      </Card>

      {/* Subject avg comparison bar */}
      <Card className="p-5">
        <h3 className="section-title mb-5">Subject Average Comparison</h3>
        <div className="space-y-3">
          {subjectData
            .sort((a, b) => b.avg - a.avg)
            .map(({ subject, avg, color }) => (
              <div key={subject} className="flex items-center gap-3">
                <span className="text-sm text-white/60 w-28 shrink-0">
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

      {/* Monthly Attendance — stacked bar */}
      <Card className="p-5">
        <h3 className="section-title mb-1">Monthly Attendance Trend</h3>
        <p className="text-xs text-white/40 mb-5">
          Present · Absent · Leave per month
        </p>
        <div className="space-y-3">
          {attendanceData.map(({ month, present, absent, leave, total }) => {
            const pPct = (present / total) * 100;
            const aPct = (absent / total) * 100;
            const lPct = (leave / total) * 100;
            return (
              <div key={month} className="flex items-center gap-3">
                <span className="text-xs text-white/50 w-8 shrink-0">
                  {month}
                </span>
                {/* Stacked bar */}
                <div className="flex-1 h-6 bg-surface-3 rounded-lg overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${pPct}%` }}
                    title={`Present: ${present}`}
                  />
                  <div
                    className="h-full bg-rose-500 transition-all"
                    style={{ width: `${aPct}%` }}
                    title={`Absent: ${absent}`}
                  />
                  <div
                    className="h-full bg-amber-500 transition-all"
                    style={{ width: `${lPct}%` }}
                    title={`Leave: ${leave}`}
                  />
                </div>
                {/* Counts */}
                <div className="flex gap-2 text-xs shrink-0 w-40">
                  <span className="text-emerald-400">{present}P</span>
                  <span className="text-rose-400">{absent}A</span>
                  <span className="text-amber-400">{leave}L</span>
                  <span className="text-white/30">/ {total}</span>
                </div>
                <span className="text-xs font-bold text-white/60 w-10 text-right">
                  {Math.round(pPct)}%
                </span>
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div className="flex gap-4 mt-4 pt-4 border-t border-white/8">
          {[
            ["bg-emerald-500", "Present"],
            ["bg-rose-500", "Absent"],
            ["bg-amber-500", "Leave"],
          ].map(([bg, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${bg}`} />
              <span className="text-xs text-white/40">{label}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
