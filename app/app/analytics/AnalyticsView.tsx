"use client";

import { useMemo, useState } from "react";
import {
  TrendingUp,
  Wallet,
  CalendarCheck,
  Users,
  Building2,
  GraduationCap,
} from "lucide-react";
import { StatCard } from "@/components/ui/Card";
import {
  TrendChart,
  type TrendSeries,
} from "@/components/analytics/TrendChart";
import { BarList, type BarListItem } from "@/components/analytics/BarList";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";
import type { AdminAnalytics } from "@/lib/analytics/types";

type RangeKey = "3" | "6" | "12";

const RANGE_OPTIONS = [
  { value: "3", label: "Last 3 months" },
  { value: "6", label: "Last 6 months" },
  { value: "12", label: "Last 12 months" },
];

const COLORS = {
  collection: "#34d399",
  attendance: "#22d3ee",
  enrollment: "#a78bfa",
};

export function AnalyticsView({ data }: { data: AdminAnalytics }) {
  const [range, setRange] = useState<RangeKey>("6");

  const take = <T,>(arr: T[]): T[] => arr.slice(-Number(range));

  const collectionSeries: TrendSeries[] = useMemo(
    () => [
      {
        name: "Collection rate",
        color: COLORS.collection,
        points: take(data.collectionTrend).map((p) => ({
          label: p.label,
          value: p.value,
        })),
      },
    ],
    [data.collectionTrend, range],
  );

  const attendanceSeries: TrendSeries[] = useMemo(
    () => [
      {
        name: "Attendance",
        color: COLORS.attendance,
        points: take(data.attendanceTrend).map((p) => ({
          label: p.label,
          value: p.value,
        })),
      },
    ],
    [data.attendanceTrend, range],
  );

  const enrollmentSeries: TrendSeries[] = useMemo(
    () => [
      {
        name: "Active students",
        color: COLORS.enrollment,
        points: take(data.enrollmentTrend).map((p) => ({
          label: p.label,
          value: p.value,
        })),
      },
    ],
    [data.enrollmentTrend, range],
  );

  const branchItems: BarListItem[] = data.branchPerformance.map((b) => ({
    id: b.branchId,
    label: b.branchName,
    value: b.collectionRate,
    caption: `${b.activeStudents} students`,
  }));

  const classAttendanceItems: BarListItem[] = data.classPerformance
    .slice(0, 8)
    .map((c) => ({
      id: c.classId,
      label: c.className,
      value: c.attendancePercent,
      caption: `${c.studentCount} students`,
    }));

  const classScoreItems: BarListItem[] = data.classPerformance
    .slice(0, 8)
    .map((c) => ({
      id: c.classId,
      label: c.className,
      value: c.avgScore,
      caption: `${c.studentCount} students`,
    }));

  const latestCollection = data.collectionTrend.at(-1);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">
            Analytics
          </h1>
          <p className="text-white/50 text-sm mt-0.5">
            Owner-level view across collections, attendance and enrollment
          </p>
        </div>
        <div className="w-full sm:w-48">
          <Select
            options={RANGE_OPTIONS}
            value={range}
            onChange={(e) => setRange(e.target.value as RangeKey)}
          />
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Lifetime Collected"
          value={formatCurrency(data.totals.lifetimeCollected)}
          icon={<Wallet size={18} />}
          accentColor="text-emerald-400"
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(data.totals.outstanding)}
          icon={<TrendingUp size={18} />}
          accentColor="text-rose-400"
        />
        <StatCard
          label="Avg Collection Rate"
          value={`${data.totals.avgCollectionRate}%`}
          icon={<TrendingUp size={18} />}
          accentColor="text-brand-400"
          trend={
            latestCollection
              ? {
                  value: `${latestCollection.value}% this month`,
                  up: latestCollection.value >= data.totals.avgCollectionRate,
                }
              : undefined
          }
        />
        <StatCard
          label="Avg Attendance"
          value={`${data.totals.avgAttendance}%`}
          icon={<CalendarCheck size={18} />}
          accentColor="text-cyan-400"
        />
      </div>

      {/* Collection trend */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Fee Collection Rate</h2>
          <span className="text-xs text-white/30">% of billed fees paid</span>
        </div>
        <TrendChart
          series={collectionSeries}
          maxValue={100}
          formatValue={(v) => `${v}%`}
        />
      </div>

      {/* Attendance + enrollment */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h2 className="section-title mb-4">Academy-wide Attendance</h2>
          <TrendChart
            series={attendanceSeries}
            maxValue={100}
            formatValue={(v) => `${v}%`}
          />
        </div>
        <div className="glass-card p-5">
          <h2 className="section-title mb-4">Active Enrollment</h2>
          <TrendChart series={enrollmentSeries} />
        </div>
      </div>

      {/* Branch comparison */}
      {data.branchPerformance.length > 1 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={15} className="text-brand-400" />
            <h2 className="section-title">Branch Comparison</h2>
          </div>
          <BarList
            items={branchItems}
            maxValue={100}
            formatValue={(v) => `${v}%`}
            barClassName="bg-gradient-to-r from-brand-600 to-emerald-400"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
            {data.branchPerformance.map((b) => (
              <div key={b.branchId} className="bg-surface-2 rounded-xl p-4">
                <p className="text-sm font-semibold text-white truncate">
                  {b.branchName}
                </p>
                <div className="grid grid-cols-2 gap-y-2 mt-3 text-xs">
                  <span className="text-white/40">Collected</span>
                  <span className="text-emerald-400 font-medium text-right">
                    {formatCurrency(b.collected)}
                  </span>
                  <span className="text-white/40">Pending</span>
                  <span className="text-rose-400 font-medium text-right">
                    {formatCurrency(b.due)}
                  </span>
                  <span className="text-white/40">Attendance</span>
                  <span className="text-white/70 font-medium text-right">
                    {b.attendancePercent}%
                  </span>
                  <span className="text-white/40">Avg Score</span>
                  <span className="text-white/70 font-medium text-right">
                    {b.avgScore}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Class breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={15} className="text-cyan-400" />
            <h2 className="section-title">Attendance by Class</h2>
          </div>
          <BarList
            items={classAttendanceItems}
            maxValue={100}
            formatValue={(v) => `${v}%`}
            barClassName="bg-gradient-to-r from-cyan-600 to-cyan-400"
          />
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap size={15} className="text-violet-400" />
            <h2 className="section-title">Average Score by Class</h2>
          </div>
          <BarList
            items={classScoreItems}
            maxValue={100}
            formatValue={(v) => `${v}%`}
            barClassName="bg-gradient-to-r from-violet-600 to-violet-400"
          />
        </div>
      </div>

      {!data.classPerformance.length && (
        <EmptyState
          icon={<TrendingUp size={22} />}
          title="Nothing to analyse yet"
          description="Add classes, mark attendance and record fees — charts will populate automatically."
        />
      )}
    </div>
  );
}
