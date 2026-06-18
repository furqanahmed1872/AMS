"use client";
import Link from "next/link";
import { StatCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Calendar,
  Plus,
  DollarSign,
  ArrowRight,
  Bell,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAcademyData } from "@/lib/academy-data/provider";
import { formatCurrency, getCurrentMonthYear } from "@/lib/utils";

export default function DashboardPage() {
  // Same shapes the dummy arrays used to provide — DASHBOARD_STATS,
  // STUDENTS, NOTIFICATIONS, TESTS — now backed by the real bootstrap
  // fetch in app/app/layout.tsx.
  const {
    role,
    students,
    tests,
    notifications,
    dashboardStats,
    todaysAttendance,
  } = useAcademyData();

  // "Recent" wasn't actually sorted in the dummy version (it just took the
  // first 5 in declaration order) — sorting by admission date descending
  // makes "Recent Students" mean what it says now that the data is real.
  const recentStudents = [...students]
    .sort(
      (a, b) =>
        new Date(b.admissionDate).getTime() -
        new Date(a.admissionDate).getTime(),
    )
    .slice(0, 5);
  const recentTests = tests.slice(0, 5); // tests[] is already ordered by date desc

  const unresolved = notifications.filter((n) => !n.isResolved);

  // The "+3 this month" trend was a hardcoded string in the dummy UI —
  // this computes the real count of students admitted in the current month.
  const now = new Date();
  const newThisMonth = students.filter((s) => {
    const d = new Date(s.admissionDate);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;

  const todaysTotal =
    todaysAttendance.present + todaysAttendance.absent + todaysAttendance.leave;
  const feeTotal =
    dashboardStats.collectedThisMonth + dashboardStats.dueThisMonth;
  const collectionRate =
    feeTotal > 0
      ? Math.round((dashboardStats.collectedThisMonth / feeTotal) * 100)
      : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">
            Dashboard
          </h1>
          <p className="text-white/50 text-sm mt-0.5">
            {getCurrentMonthYear()}
          </p>
        </div>
        <Link href="/app/attendance">
          <Button icon={<Calendar size={15} />} size="sm">
            Take Attendance
          </Button>
        </Link>
      </div>

      {/* Notifications Banner */}
      {role === "admin" && unresolved.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 flex items-start gap-3">
          <Bell size={16} className="text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-amber-400 text-sm font-medium">
              {unresolved.length} pending notification
              {unresolved.length > 1 ? "s" : ""}
            </p>
            <p className="text-amber-400/70 text-xs mt-0.5">
              {unresolved[0].message}
            </p>
          </div>
          <Link href="/app/notifications">
            <Button variant="ghost" size="sm">
              View
            </Button>
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Active Students"
          value={dashboardStats.activeStudents}
          icon={<Users size={18} />}
          accentColor="text-brand-400"
          trend={{ value: `+${newThisMonth} this month`, up: true }}
        />
        <StatCard
          label="Total Classes"
          value={dashboardStats.totalClasses}
          icon={<GraduationCap size={18} />}
          accentColor="text-violet-400"
        />
        <StatCard
          label="Total Tests"
          value={dashboardStats.totalTests}
          icon={<BookOpen size={18} />}
          accentColor="text-cyan-400"
        />
        {role === "admin" && (
          <>
            <StatCard
              label="Collected (this month)"
              value={formatCurrency(dashboardStats.collectedThisMonth)}
              icon={<TrendingUp size={18} />}
              accentColor="text-emerald-400"
            />
            <StatCard
              label="Due (this month)"
              value={formatCurrency(dashboardStats.dueThisMonth)}
              icon={<TrendingDown size={18} />}
              accentColor="text-rose-400"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-5">
        <h2 className="section-title mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Take Attendance",
              href: "/app/attendance",
              icon: <Calendar size={18} />,
              color: "text-cyan-400 bg-cyan-500/10",
            },
            {
              label: "Add Student",
              href: "/app/students?action=add",
              icon: <Plus size={18} />,
              color: "text-brand-400 bg-brand-500/10",
            },
            ...(role === "admin"
              ? [
                  {
                    label: "Manage Fees",
                    href: "/app/fees",
                    icon: <DollarSign size={18} />,
                    color: "text-emerald-400 bg-emerald-500/10",
                  },
                ]
              : []),
            {
              label: "Create Test",
              href: "/app/tests?action=create",
              icon: <BookOpen size={18} />,
              color: "text-violet-400 bg-violet-500/10",
            },
          ].map((action) => (
            <Link key={action.label} href={action.href}>
              <div className="glass rounded-xl p-4 hover:border-white/20 hover:bg-white/5 transition-all duration-200 cursor-pointer group flex flex-col items-center gap-3 text-center">
                <div className={`p-3 rounded-xl ${action.color}`}>
                  {action.icon}
                </div>
                <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                  {action.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Students */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Students</h2>
            <Link href="/app/students">
              <Button
                variant="ghost"
                size="sm"
                iconRight={<ArrowRight size={13} />}
              >
                View all
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0"
              >
                <Avatar name={student.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {student.name}
                  </p>
                  <p className="text-xs text-white/40">
                    {student.class} · Roll #{student.rollNumber}
                  </p>
                </div>
                <Badge
                  variant={
                    student.feeStatus === "paid"
                      ? "paid"
                      : student.feeStatus === "not_set"
                        ? "not_set"
                        : "unpaid"
                  }
                >
                  {student.feeStatus === "not_set"
                    ? "Not Set"
                    : student.feeStatus === "paid"
                      ? "Paid"
                      : "Unpaid"}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tests */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Tests</h2>
            <Link href="/app/tests">
              <Button
                variant="ghost"
                size="sm"
                iconRight={<ArrowRight size={13} />}
              >
                View all
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentTests.map((test) => (
              <div
                key={test.id}
                className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0"
              >
                <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400 shrink-0">
                  <BookOpen size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {test.name} · {test.subject}
                  </p>
                  <p className="text-xs text-white/40">{test.class}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-white/70">
                    {test.marksEntered}/{test.totalStudents}
                  </p>
                  <p className="text-xs text-white/30">entered</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Today's Attendance</h2>
            <Link href="/app/attendance">
              <Button
                variant="ghost"
                size="sm"
                iconRight={<ArrowRight size={13} />}
              >
                Mark
              </Button>
            </Link>
          </div>
          <div className="space-y-3 mb-4">
            {[
              {
                label: "Present",
                count: todaysAttendance.present,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
                bar: "bg-emerald-500",
              },
              {
                label: "Absent",
                count: todaysAttendance.absent,
                color: "text-rose-400",
                bg: "bg-rose-500/10",
                bar: "bg-rose-500",
              },
              {
                label: "Leave",
                count: todaysAttendance.leave,
                color: "text-amber-400",
                bg: "bg-amber-500/10",
                bar: "bg-amber-500",
              },
            ].map(({ label, count, color, bg, bar }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-medium ${color}`}>
                    {label}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${bg} ${color}`}
                  >
                    {count}
                  </span>
                </div>
                <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${bar} rounded-full`}
                    style={{
                      width: `${todaysTotal > 0 ? (count / todaysTotal) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="text-center py-2 bg-surface-2 rounded-xl">
            <span className="text-xs text-white/40">
              Total:{" "}
              <span className="text-white/70 font-semibold">
                {todaysTotal} students
              </span>
            </span>
          </div>
        </div>

        {/* Fee Overview — admin only, full width */}
        {role === "admin" && (
          <div className="glass-card p-5 lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">
                Fee Overview — {getCurrentMonthYear()}
              </h2>
              <Link href="/app/fees">
                <Button
                  variant="ghost"
                  size="sm"
                  iconRight={<ArrowRight size={13} />}
                >
                  Manage
                </Button>
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-center justify-between py-3 px-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  <span className="text-sm text-white/70">Collected</span>
                </div>
                <span className="text-sm font-semibold text-emerald-400">
                  {formatCurrency(dashboardStats.collectedThisMonth)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 px-4 bg-rose-500/5 border border-rose-500/15 rounded-xl">
                <div className="flex items-center gap-2">
                  <AlertCircle size={15} className="text-rose-400" />
                  <span className="text-sm text-white/70">Pending</span>
                </div>
                <span className="text-sm font-semibold text-rose-400">
                  {formatCurrency(dashboardStats.dueThisMonth)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 px-4 bg-surface-2 rounded-xl">
                <span className="text-sm text-white/50">Collection Rate</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 rounded-full"
                      style={{ width: `${collectionRate}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-white">
                    {collectionRate}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
