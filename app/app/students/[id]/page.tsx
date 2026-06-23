"use client";

import { useState } from "react";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useAcademyData } from "@/lib/academy-data/provider";
import {
  getStudentTestScores,
  getStudentAttendanceByMonth,
  getStudentFeeHistory,
  updateStudentAction,
  type ScoreBySubject,
  type AttendanceByMonth,
  type FeeHistoryRow,
} from "@/lib/students/actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Edit,
  BarChart3,
  TrendingUp,
  CalendarDays,
  DollarSign,
  Share2,
  Phone,
  MapPin,
  User,
  BookOpen,
  UserMinus,
} from "lucide-react";
import { StudentCombinedCard } from "@/components/templates/share/StudentCombinedCard";
import { shareElementAsImage } from "@/lib/export/utils";

// ─── Colour helpers ────────────────────────────────────────────────────────────

function scoreColor(pct: number) {
  if (pct >= 75) return "text-emerald-400";
  if (pct >= 50) return "text-brand-400";
  if (pct >= 33) return "text-amber-400";
  return "text-rose-400";
}

function attendanceColor(pct: number) {
  if (pct >= 80) return "text-emerald-400";
  if (pct >= 60) return "text-amber-400";
  return "text-rose-400";
}

function scoreHex(pct: number) {
  if (pct >= 75) return "#4ade80";
  if (pct >= 50) return "#818cf8";
  if (pct >= 33) return "#fbbf24";
  return "#f87171";
}

function attendanceHex(pct: number) {
  if (pct >= 80) return "#4ade80";
  if (pct >= 60) return "#fbbf24";
  return "#f87171";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const router = useRouter();
  const { role, students, academyName } = useAcademyData();
  const student = students.find((s) => s.id === id);

  // Modal state ─ "perf" covers Score + Attendance together
  const [activeModal, setActiveModal] = useState<"perf" | "fee" | null>(null);
  const [perfTab, setPerfTab] = useState<"scores" | "attendance">("scores");

  // Data state
  const [scores, setScores] = useState<ScoreBySubject[] | null>(null);
  const [attendance, setAttendance] = useState<AttendanceByMonth[] | null>(
    null,
  );
  const [feeHistory, setFeeHistory] = useState<FeeHistoryRow[] | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [showDeactivate, setShowDeactivate] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [sharing, setSharing] = useState(false);

  // ── Data loaders ────────────────────────────────────────────────────────────

  const openPerfModal = async (tab: "scores" | "attendance") => {
    setPerfTab(tab);
    setActiveModal("perf");

    const needsScores = tab === "scores" && !scores;
    const needsAtt = tab === "attendance" && !attendance;
    if (!needsScores && !needsAtt) return;

    setModalLoading(true);
    const [s, a] = await Promise.all([
      needsScores ? getStudentTestScores(id) : Promise.resolve(scores),
      needsAtt ? getStudentAttendanceByMonth(id) : Promise.resolve(attendance),
    ]);
    if (needsScores) setScores(s);
    if (needsAtt) setAttendance(a);
    setModalLoading(false);
  };

  const openFeeModal = async () => {
    setActiveModal("fee");
    if (!feeHistory) {
      setModalLoading(true);
      setFeeHistory(await getStudentFeeHistory(id));
      setModalLoading(false);
    }
  };

  // Load both datasets when switching tabs inside the open modal
  const switchTab = async (tab: "scores" | "attendance") => {
    setPerfTab(tab);
    const needsScores = tab === "scores" && !scores;
    const needsAtt = tab === "attendance" && !attendance;
    if (!needsScores && !needsAtt) return;
    setModalLoading(true);
    const [s, a] = await Promise.all([
      needsScores ? getStudentTestScores(id) : Promise.resolve(scores),
      needsAtt ? getStudentAttendanceByMonth(id) : Promise.resolve(attendance),
    ]);
    if (needsScores) setScores(s);
    if (needsAtt) setAttendance(a);
    setModalLoading(false);
  };

  // ── Share handler ────────────────────────────────────────────────────────────

  const handleShare = async () => {
    if (!student) return;
    // Make sure both datasets are loaded before capturing the card
    setSharing(true);
    const [s, a] = await Promise.all([
      scores ?? getStudentTestScores(id),
      attendance ?? getStudentAttendanceByMonth(id),
    ]);
    setScores(s);
    setAttendance(a);
    // Give React one tick to render the hidden card with fresh data
    await new Promise((r) => setTimeout(r, 80));
    await shareElementAsImage(
      "student-combined-share-card",
      `${student.name} — ${student.class}\nAvg Score: ${student.avgScore}% · Attendance: ${student.attendancePercent}%\n\nShared via Academy Management System`,
    );
    setSharing(false);
  };

  // ── Deactivate ───────────────────────────────────────────────────────────────

  const handleDeactivate = async () => {
    if (!student) return;
    setIsDeactivating(true);
    await updateStudentAction(id, {
      name: student.name,
      fatherName: student.fatherName,
      classId: student.classId,
      rollNumber: String(student.rollNumber),
      monthlyFee: String(student.monthlyFee ?? ""),
      admissionDate: student.admissionDate,
      phone: student.phone,
      address: student.address,
      teacherRemarks: student.teacherRemarks ?? "",
      status: "inactive",
    });
    setIsDeactivating(false);
    setShowDeactivate(false);
    router.refresh();
  };

  // ── Guard ────────────────────────────────────────────────────────────────────

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

  // ── Derived values ───────────────────────────────────────────────────────────

  const sColor = scoreColor(student.avgScore);
  const aColor = attendanceColor(student.attendancePercent);

  const SUBJECT_COLORS = [
    "#818cf8",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
    "#f472b6",
    "#a78bfa",
  ];

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      {/* Page header */}
      <PageHeader
        title={student.name}
        subtitle={`${student.class} · Roll #${student.rollNumber}`}
        back={
          <Link href="/app/students">
            <button className="p-2 hover:bg-white/8 rounded-xl transition-colors cursor-pointer">
              <ArrowLeft size={18} />
            </button>
          </Link>
        }
        actions={
          <div className="flex items-center gap-2">
            {role === "admin" && student.status === "active" && (
              <Button
                variant="ghost"
                size="sm"
                icon={<UserMinus size={14} />}
                onClick={() => setShowDeactivate(true)}
              >
                Deactivate
              </Button>
            )}
            <Link href={`/app/students/${id}/analytics`}>
              <Button variant="ghost" size="sm" icon={<BarChart3 size={14} />}>
                Analytics
              </Button>
            </Link>
            <Link href={`/app/students/${id}/edit`}>
              <Button variant="secondary" size="sm" icon={<Edit size={14} />}>
                Edit
              </Button>
            </Link>
          </div>
        }
      />

      {/* Avatar + name card */}
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <Avatar name={student.name} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-white">{student.name}</h2>
              <Badge
                variant={student.status === "active" ? "active" : "inactive"}
              >
                {student.status}
              </Badge>
            </div>
            <p className="text-white/50 text-sm mt-0.5">
              {student.class} · Roll #{student.rollNumber}
            </p>
          </div>
          <div className="text-right hidden sm:block shrink-0">
            <p className="text-xs text-white/40">Admitted</p>
            <p className="text-sm text-white/70">
              {formatDate(student.admissionDate)}
            </p>
          </div>
        </div>
      </Card>

      {/* ── 2-column summary: Combined Perf + Fee Status ── */}
      <div className="grid grid-cols-2 gap-3">
        {/* ── Combined Score + Attendance card ─────────── */}
        <Card
          hover
          className="p-4 cursor-pointer col-span-1"
          onClick={() => openPerfModal("scores")}
        >
          {/* Card header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-white/40 font-medium">
              Performance
            </span>
            <span className="text-[10px] text-brand-400/60 hover:text-brand-400 transition-colors">
              View Details →
            </span>
          </div>

          {/* Two metrics side by side */}
          <div className="grid grid-cols-2 gap-3">
            {/* Avg Score */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                <TrendingUp size={15} className="text-brand-400" />
              </div>
              <div>
                <div
                  className={`text-lg font-bold font-display leading-none ${sColor}`}
                >
                  {student.avgScore}%
                </div>
                <div className="text-[10px] text-white/40 mt-0.5">
                  Avg. Score
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-2.5 border-l border-white/8 pl-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                <CalendarDays size={15} className="text-cyan-400" />
              </div>
              <div>
                <div
                  className={`text-lg font-bold font-display leading-none ${aColor}`}
                >
                  {student.attendancePercent}%
                </div>
                <div className="text-[10px] text-white/40 mt-0.5">
                  Attendance
                </div>
              </div>
            </div>
          </div>

          {/* Share button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            className="mt-3 pt-3 border-t border-white/6 w-full flex items-center justify-center gap-1.5 text-[10px] text-white/30 hover:text-brand-400 transition-colors"
          >
            {sharing ? (
              <span className="text-brand-400">Sharing…</span>
            ) : (
              <>
                <Share2 size={11} />
                Share via WhatsApp
              </>
            )}
          </button>
        </Card>

        {/* ── Fee Status card ──────────────────────────── */}
        <Card
          hover={role === "admin" && student.feeStatus !== "not_set"}
          className={`p-4 col-span-1 ${role === "admin" && student.feeStatus !== "not_set" ? "cursor-pointer" : ""}`}
          onClick={() =>
            role === "admin" &&
            student.feeStatus !== "not_set" &&
            openFeeModal()
          }
        >
          <div className="flex flex-col items-center justify-center h-full gap-1 py-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-1"
              style={{
                background:
                  student.feeStatus === "paid"
                    ? "rgba(52,211,153,0.12)"
                    : student.feeStatus === "not_set"
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(248,113,113,0.12)",
              }}
            >
              <DollarSign
                size={15}
                className={
                  student.feeStatus === "paid"
                    ? "text-emerald-400"
                    : student.feeStatus === "not_set"
                      ? "text-white/30"
                      : "text-rose-400"
                }
              />
            </div>
            <div
              className={`text-sm font-bold font-display ${
                student.feeStatus === "paid"
                  ? "text-emerald-400"
                  : student.feeStatus === "not_set"
                    ? "text-white/40"
                    : "text-rose-400"
              }`}
            >
              {student.feeStatus === "not_set"
                ? "Not Set"
                : student.feeStatus === "paid"
                  ? "Paid"
                  : "Unpaid"}
            </div>
            <div className="text-[10px] text-white/40">Fee Status</div>
          </div>
        </Card>
      </div>

      {/* Profile details */}
      <Card className="p-5">
        <h3 className="section-title mb-4">Profile Details</h3>
        <div className="space-y-3">
          {[
            {
              icon: <User size={14} />,
              label: "Father's Name",
              value: student.fatherName || "—",
            },
            {
              icon: <Phone size={14} />,
              label: "Phone",
              value: student.phone || "—",
            },
            {
              icon: <MapPin size={14} />,
              label: "Address",
              value: student.address || "—",
            },
            {
              icon: <BookOpen size={14} />,
              label: "Teacher Remarks",
              value: student.teacherRemarks || "No remarks",
            },
            ...(role === "admin" && student.monthlyFee
              ? [
                  {
                    icon: <DollarSign size={14} />,
                    label: "Monthly Fee",
                    value: formatCurrency(student.monthlyFee),
                  },
                ]
              : []),
          ].map(({ icon, label, value }) => (
            <div
              key={label}
              className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0"
            >
              <span className="text-white/30 mt-0.5">{icon}</span>
              <div className="flex-1">
                <p className="text-xs text-white/40">{label}</p>
                <p className="text-sm text-white/80 mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ══ PERFORMANCE MODAL (Score + Attendance tabbed) ══════════════════════ */}
      <Modal
        isOpen={activeModal === "perf"}
        onClose={() => setActiveModal(null)}
        title="Performance Details"
        size="lg"
      >
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-surface-2 rounded-xl mb-5">
          {(["scores", "attendance"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => switchTab(tab)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                perfTab === tab
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {tab === "scores" ? "Test Scores" : "Attendance"}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {modalLoading && (
          <div className="py-12 text-center text-white/30 text-sm">
            Loading…
          </div>
        )}

        {/* ── Scores Tab ─────────────────────────────────── */}
        {!modalLoading && perfTab === "scores" && (
          <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-0.5">
            {!scores || scores.length === 0 ? (
              <div className="py-12 text-center text-white/30 text-sm">
                No test results yet.
              </div>
            ) : (
              <>
                {/* Subject summary table */}
                <div>
                  <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-2">
                    Subject Summary
                  </p>
                  <div className="rounded-xl overflow-hidden border border-white/8">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-surface-2">
                          <th className="px-3 py-2.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wide">
                            Subject
                          </th>
                          <th className="px-3 py-2.5 text-right text-xs font-semibold text-white/40 uppercase tracking-wide w-14">
                            Tests
                          </th>
                          <th className="px-3 py-2.5 text-right text-xs font-semibold text-white/40 uppercase tracking-wide w-20">
                            Obtained
                          </th>
                          <th className="px-3 py-2.5 text-right text-xs font-semibold text-white/40 uppercase tracking-wide w-16">
                            Total
                          </th>
                          <th className="px-3 py-2.5 text-right text-xs font-semibold text-white/40 uppercase tracking-wide w-14">
                            Avg %
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {scores.map((s, idx) => {
                          const ob = s.tests.reduce(
                            (a, t) => a + t.obtained,
                            0,
                          );
                          const tot = s.tests.reduce((a, t) => a + t.total, 0);
                          const pct =
                            tot > 0 ? Math.round((ob / tot) * 100) : 0;
                          const col =
                            SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
                          return (
                            <tr
                              key={s.subject}
                              className="hover:bg-white/3 transition-colors"
                            >
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ background: col }}
                                  />
                                  <span className="text-white/80">
                                    {s.subject}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-2.5 text-right text-white/40">
                                {s.tests.length}
                              </td>
                              <td className="px-3 py-2.5 text-right font-semibold text-white/80">
                                {ob}
                              </td>
                              <td className="px-3 py-2.5 text-right text-white/40">
                                {tot}
                              </td>
                              <td
                                className="px-3 py-2.5 text-right font-bold"
                                style={{ color: scoreHex(pct) }}
                              >
                                {pct}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {/* Overall footer */}
                      <tfoot>
                        <tr className="border-t border-white/10 bg-surface-2">
                          <td className="px-3 py-2.5 text-xs font-semibold text-white/50">
                            Overall
                          </td>
                          <td className="px-3 py-2.5 text-right text-xs text-white/40">
                            {scores.reduce((s, sub) => s + sub.tests.length, 0)}
                          </td>
                          <td className="px-3 py-2.5 text-right text-xs font-bold text-white/70">
                            {scores.reduce(
                              (s, sub) =>
                                s +
                                sub.tests.reduce((a, t) => a + t.obtained, 0),
                              0,
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-right text-xs text-white/40">
                            {scores.reduce(
                              (s, sub) =>
                                s + sub.tests.reduce((a, t) => a + t.total, 0),
                              0,
                            )}
                          </td>
                          <td
                            className="px-3 py-2.5 text-right text-xs font-bold"
                            style={{ color: scoreHex(student.avgScore) }}
                          >
                            {student.avgScore}%
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Per-subject test breakdown */}
                {scores.map((s, idx) => {
                  const col = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
                  return (
                    <div key={s.subject}>
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: col }}
                        />
                        <p
                          className="text-sm font-semibold"
                          style={{ color: col }}
                        >
                          {s.subject}
                        </p>
                        <span className="text-xs text-white/30">
                          · {s.tests.length} test
                          {s.tests.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-white/8">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-surface-2">
                              <th className="px-3 py-2 text-left text-xs font-semibold text-white/40">
                                Test
                              </th>
                              <th className="px-3 py-2 text-right text-xs font-semibold text-white/40 w-20">
                                Obtained
                              </th>
                              <th className="px-3 py-2 text-right text-xs font-semibold text-white/40 w-16">
                                Total
                              </th>
                              <th className="px-3 py-2 text-right text-xs font-semibold text-white/40 w-14">
                                %
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {s.tests.map((t) => {
                              const pct =
                                t.total > 0
                                  ? Math.round((t.obtained / t.total) * 100)
                                  : 0;
                              return (
                                <tr
                                  key={t.name}
                                  className="hover:bg-white/3 transition-colors"
                                >
                                  <td className="px-3 py-2.5 text-white/70">
                                    {t.name}
                                  </td>
                                  <td className="px-3 py-2.5 text-right font-semibold text-white/80">
                                    {t.obtained}
                                  </td>
                                  <td className="px-3 py-2.5 text-right text-white/40">
                                    {t.total}
                                  </td>
                                  <td
                                    className="px-3 py-2.5 text-right font-bold"
                                    style={{ color: scoreHex(pct) }}
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
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ── Attendance Tab ──────────────────────────────── */}
        {!modalLoading && perfTab === "attendance" && (
          <div className="max-h-[60vh] overflow-y-auto pr-0.5">
            {!attendance || attendance.length === 0 ? (
              <div className="py-12 text-center text-white/30 text-sm">
                No attendance records yet.
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden border border-white/8">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-2">
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wide">
                        Month
                      </th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold text-white/40 uppercase tracking-wide w-20">
                        Present
                      </th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold text-white/40 uppercase tracking-wide w-16">
                        Absent
                      </th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold text-white/40 uppercase tracking-wide w-20">
                        Total Days
                      </th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold text-white/40 uppercase tracking-wide w-14">
                        %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {attendance.map((m, i) => {
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
                          <td className="px-3 py-2.5 text-right font-semibold text-emerald-400">
                            {m.present}
                          </td>
                          <td className="px-3 py-2.5 text-right font-semibold text-rose-400">
                            {m.absent}
                          </td>
                          <td className="px-3 py-2.5 text-right text-white/40">
                            {total}
                          </td>
                          <td
                            className="px-3 py-2.5 text-right font-bold"
                            style={{ color: attendanceHex(pct) }}
                          >
                            {pct}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Totals footer */}
                  <tfoot>
                    <tr className="border-t border-white/10 bg-surface-2">
                      <td className="px-3 py-2.5 text-xs font-semibold text-white/50">
                        Total
                      </td>
                      <td className="px-3 py-2.5 text-right text-xs font-bold text-emerald-400">
                        {attendance.reduce((s, m) => s + m.present, 0)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-xs font-bold text-rose-400">
                        {attendance.reduce((s, m) => s + m.absent, 0)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-xs text-white/40">
                        {attendance.reduce(
                          (s, m) => s + m.present + m.absent,
                          0,
                        )}
                      </td>
                      <td
                        className="px-3 py-2.5 text-right text-xs font-bold"
                        style={{
                          color: attendanceHex(student.attendancePercent),
                        }}
                      >
                        {student.attendancePercent}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Share button inside modal */}
        <div className="mt-5 pt-4 border-t border-white/8">
          <Button
            variant="secondary"
            className="w-full"
            icon={<Share2 size={14} />}
            loading={sharing}
            onClick={handleShare}
          >
            Share via WhatsApp
          </Button>
        </div>
      </Modal>

      {/* ══ FEE HISTORY MODAL ══════════════════════════════════════════════════ */}
      {role === "admin" && (
        <Modal
          isOpen={activeModal === "fee"}
          onClose={() => setActiveModal(null)}
          title="Fee History"
          size="md"
        >
          {modalLoading || !feeHistory ? (
            <div className="py-10 text-center text-white/30 text-sm">
              Loading…
            </div>
          ) : feeHistory.length === 0 ? (
            <div className="py-10 text-center text-white/30 text-sm">
              No fee records yet.
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-white/8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-2">
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wide">
                      Month
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-white/40 uppercase tracking-wide w-28">
                      Amount
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-white/40 uppercase tracking-wide w-20">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {feeHistory.map(({ month, due, status }) => (
                    <tr
                      key={month}
                      className="hover:bg-white/3 transition-colors"
                    >
                      <td className="px-3 py-2.5 text-white/80">{month}</td>
                      <td className="px-3 py-2.5 text-right text-white/60">
                        {formatCurrency(due)}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <Badge variant={status}>
                          {status === "paid" ? "Paid" : "Unpaid"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}

      {/* ══ DEACTIVATE CONFIRM ════════════════════════════════════════════════ */}
      <ConfirmDialog
        isOpen={showDeactivate}
        onClose={() => setShowDeactivate(false)}
        onConfirm={handleDeactivate}
        loading={isDeactivating}
        title="Deactivate Student"
        message={`This will mark ${student.name} as inactive. They will no longer appear in attendance, fees, or active student lists. You can reactivate them from the Edit page at any time.`}
        confirmLabel="Deactivate"
        danger
      />

      {/* ══ HIDDEN SHARE CARD (off-screen, captured by html2canvas) ══════════ */}
      <StudentCombinedCard
        academyName={academyName}
        studentName={student.name}
        className={student.class}
        rollNumber={student.rollNumber}
        avgScore={student.avgScore}
        attendancePercent={student.attendancePercent}
        scores={scores ?? []}
        months={attendance ?? []}
      />
    </div>
  );
}
