"use client";
import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { STUDENTS } from "@/lib/dummy-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Edit, BarChart3, TrendingUp, Calendar, DollarSign, Share2, Phone, MapPin, User, BookOpen } from "lucide-react";

const role: "admin" | "teacher" = "admin";

export default function StudentProfilePage({ params }: { params: { id: string } }) {
  const student = STUDENTS.find(s => s.id === params.id) || STUDENTS[0];
  const [activeModal, setActiveModal] = useState<"score" | "attendance" | "fee" | null>(null);

  const feeHistory = [
    { month: "June 2025", due: 4000, paid: 4000, status: "paid" as const },
    { month: "May 2025", due: 4000, paid: 4000, status: "paid" as const },
    { month: "April 2025", due: 4000, paid: 0, status: "unpaid" as const },
    { month: "March 2025", due: 4000, paid: 4000, status: "paid" as const },
  ];

  const scoresBySubject = [
    { subject: "Mathematics", tests: [{ name: "T1", obtained: 28, total: 30 }, { name: "T2", obtained: 27, total: 30 }] },
    { subject: "Physics", tests: [{ name: "T1", obtained: 18, total: 20 }, { name: "T2", obtained: 19, total: 20 }] },
    { subject: "Chemistry", tests: [{ name: "T1", obtained: 22, total: 25 }] },
  ];

  const attendanceByMonth = [
    { month: "June 2025", present: 12, absent: 3 },
    { month: "May 2025", present: 22, absent: 4 },
    { month: "April 2025", present: 18, absent: 7 },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl">
      <PageHeader
        title={student.name}
        subtitle={student.class}
        back={<Link href="/app/students"><button className="p-2 hover:bg-white/8 rounded-xl transition-colors"><ArrowLeft size={18} /></button></Link>}
        actions={
          <div className="flex gap-2">
            <Link href={`/app/students/${student.id}/analytics`}><Button variant="secondary" icon={<BarChart3 size={14} />} size="sm">Analytics</Button></Link>
            <Link href={`/app/students/${student.id}/edit`}><Button icon={<Edit size={14} />} size="sm">Edit</Button></Link>
          </div>
        }
      />

      {/* Profile card */}
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <Avatar name={student.name} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-white text-lg font-display">{student.name}</h2>
              <Badge variant={student.status === "active" ? "active" : "inactive"}>{student.status}</Badge>
            </div>
            <p className="text-white/50 text-sm">{student.class} · Roll #{student.rollNumber}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-white/40">Admitted</p>
            <p className="text-sm text-white/70">{formatDate(student.admissionDate)}</p>
          </div>
        </div>
      </Card>

      {/* 3 Summary Boxes */}
      <div className="grid grid-cols-3 gap-3">
        {/* Avg Score */}
        <Card hover className="p-4 text-center cursor-pointer" onClick={() => setActiveModal("score")}>
          <div className="flex justify-center mb-2"><TrendingUp size={18} className="text-brand-400" /></div>
          <div className="text-xl font-bold text-brand-400 font-display">{student.avgScore}%</div>
          <div className="text-xs text-white/50 mt-1">Avg. Score</div>
        </Card>

        {/* Attendance */}
        <Card hover className="p-4 text-center cursor-pointer" onClick={() => setActiveModal("attendance")}>
          <div className="flex justify-center mb-2"><Calendar size={18} className="text-cyan-400" /></div>
          <div className="text-xl font-bold text-cyan-400 font-display">{student.attendancePercent}%</div>
          <div className="text-xs text-white/50 mt-1">Attendance</div>
        </Card>

        {/* Fee Status */}
        <Card hover={role === "admin"} className="p-4 text-center" onClick={() => role === "admin" && setActiveModal("fee")}>
          <div className="flex justify-center mb-2"><DollarSign size={18} className={student.feeStatus === "paid" ? "text-emerald-400" : student.feeStatus === "not_set" ? "text-white/30" : "text-rose-400"} /></div>
          <div className={`text-sm font-bold font-display ${student.feeStatus === "paid" ? "text-emerald-400" : student.feeStatus === "not_set" ? "text-white/40" : "text-rose-400"}`}>
            {student.feeStatus === "not_set" ? "Not Set" : student.feeStatus === "paid" ? "Paid" : "Unpaid"}
          </div>
          <div className="text-xs text-white/50 mt-1">Fee Status</div>
        </Card>
      </div>

      {/* Profile Details */}
      <Card className="p-5">
        <h3 className="section-title mb-4">Profile Details</h3>
        <div className="space-y-3">
          {[
            { icon: <User size={14} />, label: "Father's Name", value: student.fatherName || "—" },
            { icon: <Phone size={14} />, label: "Phone", value: student.phone || "—" },
            { icon: <MapPin size={14} />, label: "Address", value: student.address || "—" },
            { icon: <BookOpen size={14} />, label: "Teacher Remarks", value: student.teacherRemarks || "No remarks" },
            ...(role === "admin" && student.monthlyFee ? [{ icon: <DollarSign size={14} />, label: "Monthly Fee", value: formatCurrency(student.monthlyFee) }] : []),
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
              <span className="text-white/30 mt-0.5">{icon}</span>
              <div className="flex-1"><p className="text-xs text-white/40">{label}</p><p className="text-sm text-white/80 mt-0.5">{value}</p></div>
            </div>
          ))}
        </div>
      </Card>

      {/* Modals */}
      <Modal isOpen={activeModal === "score"} onClose={() => setActiveModal(null)} title="Test Scores by Subject" size="lg">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {scoresBySubject.map(({ subject, tests }) => (
            <div key={subject} className="bg-surface-2 rounded-xl p-4">
              <h4 className="font-semibold text-white mb-3">{subject}</h4>
              <div className="space-y-2">
                {tests.map(t => (
                  <div key={t.name} className="flex items-center justify-between text-sm">
                    <span className="text-white/50">{t.name}</span>
                    <span className="font-medium text-white">{t.obtained}/{t.total}</span>
                    <span className="text-brand-400">{Math.round((t.obtained/t.total)*100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Button variant="secondary" className="w-full mt-4" icon={<Share2 size={14} />}>Share via WhatsApp</Button>
      </Modal>

      <Modal isOpen={activeModal === "attendance"} onClose={() => setActiveModal(null)} title="Monthly Attendance" size="md">
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {attendanceByMonth.map(({ month, present, absent }) => (
            <div key={month} className="bg-surface-2 rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm text-white/70">{month}</span>
              <div className="flex gap-4 text-xs">
                <span className="text-emerald-400">{present} Present</span>
                <span className="text-rose-400">{absent} Absent</span>
              </div>
            </div>
          ))}
        </div>
        <Button variant="secondary" className="w-full mt-4" icon={<Share2 size={14} />}>Share via WhatsApp</Button>
      </Modal>

      {role === "admin" && (
        <Modal isOpen={activeModal === "fee"} onClose={() => setActiveModal(null)} title="Fee History" size="md">
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {feeHistory.map(({ month, due, paid, status }) => (
              <div key={month} className="bg-surface-2 rounded-xl p-3 flex items-center justify-between">
                <span className="text-sm text-white/70">{month}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/40">{formatCurrency(due)}</span>
                  <Badge variant={status}>{status === "paid" ? "Paid" : "Unpaid"}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
