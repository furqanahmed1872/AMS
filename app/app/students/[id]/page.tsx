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
  Calendar,
  DollarSign,
  Share2,
  Phone,
  MapPin,
  User,
  BookOpen,
  UserMinus,
} from "lucide-react";

export default function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const router = useRouter();
  const { role, students } = useAcademyData();
  const student = students.find((s) => s.id === id);

  const [activeModal, setActiveModal] = useState<
    "score" | "attendance" | "fee" | null
  >(null);
  const [scores, setScores] = useState<ScoreBySubject[] | null>(null);
  const [attendance, setAttendance] = useState<AttendanceByMonth[] | null>(
    null,
  );
  const [feeHistory, setFeeHistory] = useState<FeeHistoryRow[] | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [showDeactivate, setShowDeactivate] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const openModal = async (type: "score" | "attendance" | "fee") => {
    setActiveModal(type);
    if (type === "score" && !scores) {
      setModalLoading(true);
      setScores(await getStudentTestScores(id));
      setModalLoading(false);
    }
    if (type === "attendance" && !attendance) {
      setModalLoading(true);
      setAttendance(await getStudentAttendanceByMonth(id));
      setModalLoading(false);
    }
    if (type === "fee" && !feeHistory) {
      setModalLoading(true);
      setFeeHistory(await getStudentFeeHistory(id));
      setModalLoading(false);
    }
  };

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

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl">
      <PageHeader
        title={student.name}
        subtitle={student.class}
        back={
          <Link href="/app/students">
            <button className="p-2 hover:bg-white/8 rounded-xl transition-colors cursor-pointer">
              <ArrowLeft size={18} />
            </button>
          </Link>
        }
        actions={
          <div className="flex gap-2">
            <Link href={`/app/students/${student.id}/analytics`}>
              <Button
                variant="secondary"
                icon={<BarChart3 size={14} />}
                size="sm"
              >
                Analytics
              </Button>
            </Link>
            <Link href={`/app/students/${student.id}/edit`}>
              <Button variant="secondary" icon={<Edit size={14} />} size="sm">
                Edit
              </Button>
            </Link>
            {student.status === "active" && (
              <Button
                variant="danger"
                icon={<UserMinus size={14} />}
                size="sm"
                onClick={() => setShowDeactivate(true)}
              >
                Deactivate
              </Button>
            )}
          </div>
        }
      />

      {/* Profile card */}
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <Avatar name={student.name} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-white text-lg font-display">
                {student.name}
              </h2>
              <Badge
                variant={student.status === "active" ? "active" : "inactive"}
              >
                {student.status}
              </Badge>
            </div>
            <p className="text-white/50 text-sm">
              {student.class} · Roll #{student.rollNumber}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-white/40">Admitted</p>
            <p className="text-sm text-white/70">
              {formatDate(student.admissionDate)}
            </p>
          </div>
        </div>
      </Card>

      {/* 3 Summary Boxes */}
      <div className="grid grid-cols-3 gap-3">
        <Card
          hover
          className="p-4 text-center cursor-pointer"
          onClick={() => openModal("score")}
        >
          <div className="flex justify-center mb-2">
            <TrendingUp size={18} className="text-brand-400" />
          </div>
          <div className="text-xl font-bold text-brand-400 font-display">
            {student.avgScore}%
          </div>
          <div className="text-xs text-white/50 mt-1">Avg. Score</div>
        </Card>

        <Card
          hover
          className="p-4 text-center cursor-pointer"
          onClick={() => openModal("attendance")}
        >
          <div className="flex justify-center mb-2">
            <Calendar size={18} className="text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-400 font-display">
            {student.attendancePercent}%
          </div>
          <div className="text-xs text-white/50 mt-1">Attendance</div>
        </Card>

        <Card
          hover={role === "admin"}
          className="p-4 text-center"
          onClick={() => role === "admin" && openModal("fee")}
        >
          <div className="flex justify-center mb-2">
            <DollarSign
              size={18}
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
          <div className="text-xs text-white/50 mt-1">Fee Status</div>
        </Card>
      </div>

      {/* Profile Details */}
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

      {/* Score Modal */}
      <Modal
        isOpen={activeModal === "score"}
        onClose={() => setActiveModal(null)}
        title="Test Scores by Subject"
        size="lg"
      >
        {modalLoading || !scores ? (
          <div className="py-10 text-center text-white/30 text-sm">
            Loading…
          </div>
        ) : scores.length === 0 ? (
          <div className="py-10 text-center text-white/30 text-sm">
            No test results yet.
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {scores.map(({ subject, tests }) => (
              <div key={subject} className="bg-surface-2 rounded-xl p-4">
                <h4 className="font-semibold text-white mb-3">{subject}</h4>
                <div className="space-y-2">
                  {tests.map((t) => (
                    <div
                      key={t.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-white/50">{t.name}</span>
                      <span className="font-medium text-white">
                        {t.obtained}/{t.total}
                      </span>
                      <span className="text-brand-400">
                        {Math.round((t.obtained / t.total) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <Button
          variant="secondary"
          className="w-full mt-4"
          icon={<Share2 size={14} />}
        >
          Share via WhatsApp
        </Button>
      </Modal>

      {/* Attendance Modal */}
      <Modal
        isOpen={activeModal === "attendance"}
        onClose={() => setActiveModal(null)}
        title="Monthly Attendance"
        size="md"
      >
        {modalLoading || !attendance ? (
          <div className="py-10 text-center text-white/30 text-sm">
            Loading…
          </div>
        ) : attendance.length === 0 ? (
          <div className="py-10 text-center text-white/30 text-sm">
            No attendance records yet.
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {attendance.map(({ month, present, absent }) => (
              <div
                key={month}
                className="bg-surface-2 rounded-xl p-3 flex items-center justify-between"
              >
                <span className="text-sm text-white/70">{month}</span>
                <div className="flex gap-4 text-xs">
                  <span className="text-emerald-400">{present} Present</span>
                  <span className="text-rose-400">{absent} Absent</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <Button
          variant="secondary"
          className="w-full mt-4"
          icon={<Share2 size={14} />}
        >
          Share via WhatsApp
        </Button>
      </Modal>

      {/* Fee History Modal — admin only */}
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
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {feeHistory.map(({ month, due, status }) => (
                <div
                  key={month}
                  className="bg-surface-2 rounded-xl p-3 flex items-center justify-between"
                >
                  <span className="text-sm text-white/70">{month}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/40">
                      {formatCurrency(due)}
                    </span>
                    <Badge variant={status}>
                      {status === "paid" ? "Paid" : "Unpaid"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Deactivate Confirm */}
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
    </div>
  );
}
