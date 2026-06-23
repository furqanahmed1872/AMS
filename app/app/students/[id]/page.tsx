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

  const [activeModal, setActiveModal] = useState<"perf" | "fee" | null>(null);
  const [perfTab, setPerfTab] = useState<"scores" | "attendance">("scores");

  const [scores, setScores] = useState<ScoreBySubject[] | null>(null);
  const [attendance, setAttendance] = useState<AttendanceByMonth[] | null>(
    null,
  );
  const [feeHistory, setFeeHistory] = useState<FeeHistoryRow[] | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [showDeactivate, setShowDeactivate] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [sharing, setSharing] = useState(false);

  // ── Data loaders ─────────────────────────────────────────────────────────────

  const openPerfModal = async (tab: "scores" | "attendance") => {
    setPerfTab(tab);
    setActiveModal("perf");
    const needsScores = !scores;
    const needsAtt = !attendance;
    if (!needsScores && !needsAtt) return;
    setModalLoading(true);
    const [s, a] = await Promise.all([
      needsScores ? getStudentTestScores(id) : Promise.resolve(scores!),
      needsAtt ? getStudentAttendanceByMonth(id) : Promise.resolve(attendance!),
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

  const switchTab = (tab: "scores" | "attendance") => {
    setPerfTab(tab);
  };

  // ── Share ─────────────────────────────────────────────────────────────────────

  const handleShare = async () => {
    if (!student) return;
    setSharing(true);
    const [s, a] = await Promise.all([
      scores ?? getStudentTestScores(id),
      attendance ?? getStudentAttendanceByMonth(id),
    ]);
    setScores(s);
    setAttendance(a);
    await new Promise((r) => setTimeout(r, 80));
    await shareElementAsImage(
      "student-combined-share-card",
      `${student.name} — ${student.class}\nAvg Score: ${student.avgScore}% · Attendance: ${student.attendancePercent}%\n\nShared via Academy Management System`,
    );
    setSharing(false);
  };

  // ── Deactivate ────────────────────────────────────────────────────────────────

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

  // ── Derived data for tables ───────────────────────────────────────────────────

  // Scores: collect all unique test names in order
  const allTestNames = Array.from(
    new Set((scores ?? []).flatMap((s) => s.tests.map((t) => t.name))),
  );

  // Attendance: months are already ordered from the server
  const allMonths = (attendance ?? []).map((m) => m.month);

  // ── Render ────────────────────────────────────────────────────────────────────

  const sColorClass = scoreColor(student.avgScore);
  const aColorClass = attendanceColor(student.attendancePercent);

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

      {/* Avatar card */}
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

      {/* ── Summary cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Combined Performance card */}
        <Card
          hover
          className="p-4 cursor-pointer"
          onClick={() => openPerfModal("scores")}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-white/40 font-medium uppercase tracking-wider">
              Performance
            </span>
            <span className="text-[10px] text-brand-400/60">
              View Details →
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Score */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                <TrendingUp size={15} className="text-brand-400" />
              </div>
              <div>
                <div
                  className={`text-xl font-bold font-display leading-none ${sColorClass}`}
                >
                  {student.avgScore}%
                </div>
                <div className="text-[10px] text-white/40 mt-0.5">
                  Avg. Score
                </div>
              </div>
            </div>
            {/* Attendance */}
            <div className="flex items-center gap-2.5 border-l border-white/8 pl-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                <CalendarDays size={15} className="text-cyan-400" />
              </div>
              <div>
                <div
                  className={`text-xl font-bold font-display leading-none ${aColorClass}`}
                >
                  {student.attendancePercent}%
                </div>
                <div className="text-[10px] text-white/40 mt-0.5">
                  Attendance
                </div>
              </div>
            </div>
          </div>
          {/* Share inline */}
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
                <Share2 size={11} /> Share via WhatsApp
              </>
            )}
          </button>
        </Card>

        {/* Fee Status card */}
        <Card
          hover={role === "admin" && student.feeStatus !== "not_set"}
          className={`p-4 ${role === "admin" && student.feeStatus !== "not_set" ? "cursor-pointer" : ""}`}
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

      {/* ══ PERFORMANCE MODAL ══════════════════════════════════════════════════ */}
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

        {modalLoading && (
          <div className="py-12 text-center text-white/30 text-sm">
            Loading…
          </div>
        )}

        {/* ── SCORES TAB ─────────────────────────────────────────────────────── */}
        {/* Layout: rows = subjects, columns = test names */}
        {!modalLoading && perfTab === "scores" && (
          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            {!scores || scores.length === 0 ? (
              <div className="py-12 text-center text-white/30 text-sm">
                No test results yet.
              </div>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr>
                    {/* First column: Subject label */}
                    <th className="bg-surface-2 px-3 py-2.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wide whitespace-nowrap border-b border-white/8 border-r border-white/8 min-w-[110px]">
                      Subject
                    </th>
                    {/* One column per test name */}
                    {allTestNames.map((name) => (
                      <th
                        key={name}
                        className="bg-surface-2 px-3 py-2.5 text-center text-xs font-semibold text-white/40 uppercase tracking-wide whitespace-nowrap border-b border-white/8 min-w-[72px]"
                      >
                        {name}
                      </th>
                    ))}
                    {/* Avg column */}
                    <th className="bg-surface-2 px-3 py-2.5 text-center text-xs font-semibold text-white/40 uppercase tracking-wide whitespace-nowrap border-b border-white/8 border-l border-white/8 min-w-[64px]">
                      Avg %
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {scores.map((s) => {
                    const ob = s.tests.reduce((a, t) => a + t.obtained, 0);
                    const tot = s.tests.reduce((a, t) => a + t.total, 0);
                    const avg = tot > 0 ? Math.round((ob / tot) * 100) : 0;
                    // Build a lookup for this subject's test results
                    const testMap = new Map(s.tests.map((t) => [t.name, t]));
                    return (
                      <tr
                        key={s.subject}
                        className="hover:bg-white/3 transition-colors"
                      >
                        {/* Subject name */}
                        <td className="px-3 py-2.5 text-white/80 font-medium whitespace-nowrap border-r border-white/8">
                          {s.subject}
                        </td>
                        {/* Marks per test */}
                        {allTestNames.map((name) => {
                          const t = testMap.get(name);
                          if (!t) {
                            return (
                              <td
                                key={name}
                                className="px-3 py-2.5 text-center text-white/20"
                              >
                                —
                              </td>
                            );
                          }
                          const pct =
                            t.total > 0
                              ? Math.round((t.obtained / t.total) * 100)
                              : 0;
                          return (
                            <td key={name} className="px-3 py-2.5 text-center">
                              <span className="font-semibold text-white/80">
                                {t.obtained}
                              </span>
                              <span className="text-white/30 text-[10px]">
                                /{t.total}
                              </span>
                              <br />
                              <span
                                className="text-[10px] font-bold"
                                style={{ color: scoreHex(pct) }}
                              >
                                {pct}%
                              </span>
                            </td>
                          );
                        })}
                        {/* Subject avg */}
                        <td className="px-3 py-2.5 text-center border-l border-white/8">
                          <span
                            className="text-sm font-bold"
                            style={{ color: scoreHex(avg) }}
                          >
                            {avg}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Overall footer */}
                <tfoot>
                  <tr className="border-t-2 border-white/10 bg-surface-2">
                    <td className="px-3 py-2.5 text-xs font-semibold text-white/50 border-r border-white/8">
                      Overall
                    </td>
                    {allTestNames.map((name) => {
                      // Sum across all subjects for this test name
                      let ob = 0,
                        tot = 0;
                      for (const s of scores) {
                        const t = s.tests.find((t) => t.name === name);
                        if (t) {
                          ob += t.obtained;
                          tot += t.total;
                        }
                      }
                      const pct = tot > 0 ? Math.round((ob / tot) * 100) : null;
                      return (
                        <td key={name} className="px-3 py-2.5 text-center">
                          {pct !== null ? (
                            <span
                              className="text-xs font-bold"
                              style={{ color: scoreHex(pct) }}
                            >
                              {pct}%
                            </span>
                          ) : (
                            <span className="text-white/20 text-xs">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2.5 text-center border-l border-white/8">
                      <span
                        className="text-sm font-bold"
                        style={{ color: scoreHex(student.avgScore) }}
                      >
                        {student.avgScore}%
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        )}

        {/* ── ATTENDANCE TAB ──────────────────────────────────────────────────── */}
        {/* Layout: rows = Present / Absent / %, columns = months */}
        {!modalLoading && perfTab === "attendance" && (
          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            {!attendance || attendance.length === 0 ? (
              <div className="py-12 text-center text-white/30 text-sm">
                No attendance records yet.
              </div>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr>
                    {/* Row label column */}
                    <th className="bg-surface-2 px-3 py-2.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wide border-b border-white/8 border-r border-white/8 min-w-[90px] whitespace-nowrap">
                      &nbsp;
                    </th>
                    {/* One column per month */}
                    {allMonths.map((m) => (
                      <th
                        key={m}
                        className="bg-surface-2 px-3 py-2.5 text-center text-xs font-semibold text-white/40 uppercase tracking-wide border-b border-white/8 min-w-[80px] whitespace-nowrap"
                      >
                        {/* Shorten to "Jan 2025" style if long */}
                        {m.replace(/^(\w{3})\w+\s/, "$1 ")}
                      </th>
                    ))}
                    {/* Total column */}
                    <th className="bg-surface-2 px-3 py-2.5 text-center text-xs font-semibold text-white/40 uppercase tracking-wide border-b border-white/8 border-l border-white/8 min-w-[64px] whitespace-nowrap">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Present row */}
                  <tr className="border-b border-white/5 hover:bg-white/2">
                    <td className="px-3 py-3 text-xs font-semibold text-emerald-400 border-r border-white/8 whitespace-nowrap">
                      Present
                    </td>
                    {attendance.map((m) => (
                      <td
                        key={m.month}
                        className="px-3 py-3 text-center font-semibold text-emerald-400"
                      >
                        {m.present}
                      </td>
                    ))}
                    <td className="px-3 py-3 text-center font-bold text-emerald-400 border-l border-white/8">
                      {attendance.reduce((s, m) => s + m.present, 0)}
                    </td>
                  </tr>
                  {/* Absent row */}
                  <tr className="border-b border-white/5 hover:bg-white/2">
                    <td className="px-3 py-3 text-xs font-semibold text-rose-400 border-r border-white/8 whitespace-nowrap">
                      Absent
                    </td>
                    {attendance.map((m) => (
                      <td
                        key={m.month}
                        className="px-3 py-3 text-center font-semibold text-rose-400"
                      >
                        {m.absent}
                      </td>
                    ))}
                    <td className="px-3 py-3 text-center font-bold text-rose-400 border-l border-white/8">
                      {attendance.reduce((s, m) => s + m.absent, 0)}
                    </td>
                  </tr>
                  {/* Total Days row */}
                  <tr className="border-b border-white/5 hover:bg-white/2">
                    <td className="px-3 py-3 text-xs font-semibold text-white/40 border-r border-white/8 whitespace-nowrap">
                      Total Days
                    </td>
                    {attendance.map((m) => (
                      <td
                        key={m.month}
                        className="px-3 py-3 text-center text-white/50"
                      >
                        {m.present + m.absent}
                      </td>
                    ))}
                    <td className="px-3 py-3 text-center font-bold text-white/50 border-l border-white/8">
                      {attendance.reduce((s, m) => s + m.present + m.absent, 0)}
                    </td>
                  </tr>
                  {/* % row */}
                  <tr className="hover:bg-white/2">
                    <td className="px-3 py-3 text-xs font-semibold text-white/40 border-r border-white/8 whitespace-nowrap">
                      %
                    </td>
                    {attendance.map((m) => {
                      const total = m.present + m.absent;
                      const pct =
                        total > 0 ? Math.round((m.present / total) * 100) : 0;
                      return (
                        <td key={m.month} className="px-3 py-3 text-center">
                          <span
                            className="text-sm font-bold"
                            style={{ color: attendanceHex(pct) }}
                          >
                            {pct}%
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-3 py-3 text-center border-l border-white/8">
                      <span
                        className="text-sm font-bold"
                        style={{
                          color: attendanceHex(student.attendancePercent),
                        }}
                      >
                        {student.attendancePercent}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Share button */}
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

      {/* ══ HIDDEN SHARE CARD ════════════════════════════════════════════════ */}
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
