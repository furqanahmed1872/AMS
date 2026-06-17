"use client";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { STUDENTS } from "@/lib/dummy-data";
import { ArrowLeft, Share2, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function AnalyticsPage({ params }: { params: { id: string } }) {
  const student = STUDENTS.find(s => s.id === params.id) || STUDENTS[0];

  const subjectData = [
    { subject: "Mathematics", avg: 91, tests: [93, 90, 87, 97, 90], color: "bg-brand-500" },
    { subject: "Physics", avg: 85, tests: [90, 80, 85, 88, 82], color: "bg-cyan-500" },
    { subject: "Chemistry", avg: 72, tests: [68, 75, 70, 78, 72], color: "bg-violet-500" },
    { subject: "English", avg: 88, tests: [85, 90, 87, 92, 88], color: "bg-emerald-500" },
  ];

  const attendanceData = [
    { month: "Mar", pct: 85 }, { month: "Apr", pct: 90 }, { month: "May", pct: 92 },
    { month: "Jun", pct: 88 }, { month: "Jul", pct: 95 }, { month: "Aug", pct: 92 },
  ];

  const maxAttendance = Math.max(...attendanceData.map(d => d.pct));

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl">
      <PageHeader
        title="Student Analytics"
        subtitle={student.name}
        back={<Link href={`/app/students/${params.id}`}><button className="p-2 hover:bg-white/8 rounded-xl transition-colors"><ArrowLeft size={18} /></button></Link>}
        actions={<Button variant="secondary" icon={<Share2 size={14} />} size="sm">Share via WhatsApp</Button>}
      />

      {/* Overview */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Avg. Score", value: `${student.avgScore}%`, color: "text-brand-400", trend: "up" },
          { label: "Attendance", value: `${student.attendancePercent}%`, color: "text-cyan-400", trend: "stable" },
          { label: "Tests Taken", value: "18", color: "text-violet-400", trend: "up" },
        ].map(({ label, value, color, trend }) => (
          <Card key={label} className="p-4 text-center">
            <div className={`text-xl font-bold font-display ${color}`}>{value}</div>
            <div className="text-xs text-white/40 mt-1">{label}</div>
            <div className="flex justify-center mt-2">
              {trend === "up" ? <TrendingUp size={12} className="text-emerald-400" /> : trend === "down" ? <TrendingDown size={12} className="text-rose-400" /> : <Minus size={12} className="text-white/30" />}
            </div>
          </Card>
        ))}
      </div>

      {/* Subject Performance */}
      <Card className="p-5">
        <h3 className="section-title mb-5">Subject-wise Performance</h3>
        <div className="space-y-4">
          {subjectData.map(({ subject, avg, tests, color }) => (
            <div key={subject}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white/80">{subject}</span>
                <span className="text-sm font-bold text-white">{avg}%</span>
              </div>
              {/* Simple bar chart using divs */}
              <div className="flex items-end gap-1 h-12 mb-1">
                {tests.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end group cursor-pointer">
                    <div className={`${color} rounded-sm opacity-70 group-hover:opacity-100 transition-all relative`} style={{ height: `${val}%` }}>
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-surface-3 text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        T{i + 1}: {val}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-1">
                {tests.map((_, i) => <div key={i} className="flex-1 text-center text-xs text-white/20">T{i+1}</div>)}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Subject avg comparison */}
      <Card className="p-5">
        <h3 className="section-title mb-5">Subject Average Comparison</h3>
        <div className="space-y-3">
          {subjectData.sort((a, b) => b.avg - a.avg).map(({ subject, avg, color }) => (
            <div key={subject} className="flex items-center gap-3">
              <span className="text-sm text-white/60 w-28 shrink-0">{subject}</span>
              <div className="flex-1 h-2 bg-surface-3 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${avg}%` }} />
              </div>
              <span className="text-sm font-bold text-white w-10 text-right">{avg}%</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Attendance trend */}
      <Card className="p-5">
        <h3 className="section-title mb-5">Monthly Attendance Trend</h3>
        <div className="flex items-end gap-3 h-24">
          {attendanceData.map(({ month, pct }) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
              <span className="text-xs text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">{pct}%</span>
              <div className="w-full bg-cyan-500/70 group-hover:bg-cyan-400 rounded-sm transition-all" style={{ height: `${(pct / maxAttendance) * 80}px` }} />
              <span className="text-xs text-white/40">{month}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
