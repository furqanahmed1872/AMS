import {
  CalendarCheck,
  CalendarClock,
  GraduationCap,
  Wallet,
  LogOut,
  BookOpen,
  Megaphone,
  MapPin,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { parentLogoutAction } from "@/lib/parent-portal/actions";
import type { ParentDashboardData } from "@/lib/parent-portal/types";

function ringColor(pct: number): string {
  if (pct >= 75) return "#34d399";
  if (pct >= 50) return "#60a5fa";
  if (pct >= 33) return "#fbbf24";
  return "#fb7185";
}

function ProgressRing({
  percent,
  label,
}: {
  percent: number | null;
  label: string;
}) {
  const pct = percent ?? 0;
  const r = 32;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <Card className="p-4 flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="7"
          />
          {percent != null && (
            <circle
              cx="40"
              cy="40"
              r={r}
              fill="none"
              stroke={ringColor(pct)}
              strokeWidth="7"
              strokeDasharray={c}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white">
          {percent != null ? `${Math.round(percent)}%` : "—"}
        </div>
      </div>
      <p className="text-xs text-white/50">{label}</p>
    </Card>
  );
}

function AttendanceCalendar({
  days,
}: {
  days: ParentDashboardData["attendanceDays"];
}) {
  const byDate = new Map(days.map((d) => [d.date, d.status]));
  const now = new Date();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();
  const firstWeekday = new Date(now.getFullYear(), now.getMonth(), 1).getDay();

  const colors: Record<string, string> = {
    P: "bg-emerald-500/70",
    A: "bg-rose-500/70",
    L: "bg-amber-500/70",
  };

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <CalendarCheck className="w-4 h-4 text-brand-400" />
        <p className="text-sm font-medium text-white">This Month</p>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] text-white/30">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day == null) return <div key={i} />;
          const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const status = byDate.get(dateStr);
          return (
            <div
              key={i}
              className={`aspect-square rounded-md flex items-center justify-center text-[10px] ${
                status
                  ? `${colors[status]} text-white`
                  : "bg-white/5 text-white/30"
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10 text-[10px] text-white/40">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500/70" /> Present
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-500/70" /> Absent
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500/70" /> Leave
        </span>
      </div>
    </Card>
  );
}

function SubjectScores({
  scores,
}: {
  scores: ParentDashboardData["subjectScores"];
}) {
  if (scores.length === 0) return null;
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-brand-400" />
        <p className="text-sm font-medium text-white">Test Scores by Subject</p>
      </div>
      <div className="flex flex-col gap-3">
        {scores.map((s) => {
          const totalObtained = s.tests.reduce((a, t) => a + t.obtained, 0);
          const totalMax = s.tests.reduce((a, t) => a + t.total, 0);
          const pct =
            totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
          return (
            <div key={s.subject}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-white/80">{s.subject}</span>
                <span className="text-white/50">{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: ringColor(pct) }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function NoticesList({ notices }: { notices: ParentDashboardData["notices"] }) {
  if (notices.length === 0) return null;
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Megaphone className="w-4 h-4 text-brand-400" />
        <p className="text-sm font-medium text-white">Notices</p>
      </div>
      <div className="flex flex-col gap-3">
        {notices.map((n, i) => (
          <div
            key={i}
            className="border-b border-white/8 pb-3 last:border-0 last:pb-0"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">{n.title}</p>
              <span className="text-[10px] text-white/30">
                {new Date(n.createdAt).toLocaleDateString("en-PK", {
                  dateStyle: "medium",
                })}
              </span>
            </div>
            <p className="text-sm text-white/60 mt-1 whitespace-pre-wrap break-words">
              {n.message}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Resolved server-side (class > branch > academy-wide) before this ever
// reaches the client — see getUpcomingExamsForStudent() in
// lib/exam-schedule/actions.ts. This component just renders what it's given.
function UpcomingExams({
  exams,
}: {
  exams: ParentDashboardData["upcomingExams"];
}) {
  if (exams.length === 0) return null;

  const formatTime = (t: string | null) => {
    if (!t) return null;
    const [h, m] = t.split(":");
    const hour = parseInt(h, 10);
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${m} ${suffix}`;
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <CalendarClock className="w-4 h-4 text-brand-400" />
        <p className="text-sm font-medium text-white">Upcoming Exams</p>
      </div>
      <div className="flex flex-col gap-3">
        {exams.map((e, i) => {
          const start = formatTime(e.startTime);
          const end = formatTime(e.endTime);
          return (
            <div
              key={i}
              className="border-b border-white/8 pb-3 last:border-0 last:pb-0"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white truncate">
                  {e.examName} · {e.subjectName}
                </p>
                <span className="text-[10px] text-white/30 shrink-0">
                  {new Date(e.examDate).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {(start || end) && (
                  <span className="text-xs text-white/50">
                    {start ?? "—"}
                    {end ? ` – ${end}` : ""}
                  </span>
                )}
                {e.venue && (
                  <span className="flex items-center gap-1 text-xs text-white/50">
                    <MapPin className="w-3 h-3" />
                    {e.venue}
                  </span>
                )}
              </div>
              {e.notes && (
                <p className="text-sm text-white/60 mt-1 whitespace-pre-wrap break-words">
                  {e.notes}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function ParentDashboard({ data }: { data: ParentDashboardData }) {
  return (
    <div className="min-h-screen bg-surface p-4">
      <div className="max-w-md mx-auto flex flex-col gap-4">
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-lg font-semibold text-white">
              {data.studentName}
            </h1>
            <p className="text-sm text-white/50">
              {data.className}
              {data.rollNumber != null && ` · Roll #${data.rollNumber}`}
              {data.subjects.length > 0 && ` · ${data.subjects.join(", ")}`}
            </p>
          </div>
          <form action={parentLogoutAction}>
            <button
              type="submit"
              className="text-white/40 hover:text-white transition-colors p-2"
              aria-label="Log out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>

        <NoticesList notices={data.notices} />
        <UpcomingExams exams={data.upcomingExams} />

        <div className="grid grid-cols-2 gap-3">
          <ProgressRing percent={data.attendancePercent} label="Attendance" />
          <ProgressRing percent={data.testAverage} label="Test Average" />
        </div>

        <AttendanceCalendar days={data.attendanceDays} />
        <SubjectScores scores={data.subjectScores} />

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-brand-600/15 flex items-center justify-center text-brand-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-white/50">This Month&apos;s Fee</p>
              <p className="text-lg font-semibold text-white">
                {data.monthlyFee != null ? `Rs. ${data.monthlyFee}` : "—"}
              </p>
            </div>
            <Badge variant={data.currentMonthFeeStatus}>
              {data.currentMonthFeeStatus === "not_set"
                ? "N/A"
                : data.currentMonthFeeStatus}
            </Badge>
          </div>

          {data.feeHistory.length > 0 && (
            <div className="border-t border-white/10 pt-3 mt-1">
              <p className="text-xs text-white/50 mb-2">Recent History</p>
              <div className="flex flex-col gap-1.5">
                {data.feeHistory.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-white/70">
                      {f.month}/{f.year}
                    </span>
                    <span className="text-white/50">Rs. {f.amount_due}</span>
                    <Badge variant={f.status}>{f.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
