"use client";
import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { STUDENTS, CLASSES } from "@/lib/dummy-data";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

const role = "admin";

export default function EditStudentPage({ params }: { params: { id: string } }) {
  const student = STUDENTS.find(s => s.id === params.id) || STUDENTS[0];
  const classOptions = CLASSES.map(c => ({ value: c.id, label: c.displayName }));
  const [form, setForm] = useState({
    name: student.name, fatherName: student.fatherName, classId: student.classId,
    rollNumber: String(student.rollNumber), monthlyFee: String(student.monthlyFee || ""),
    admissionDate: student.admissionDate, phone: student.phone, address: student.address,
    teacherRemarks: student.teacherRemarks || "", status: student.status,
  });
  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <PageHeader
        title="Edit Student"
        subtitle={student.name}
        back={<Link href={`/app/students/${params.id}`}><button className="p-2 hover:bg-white/8 rounded-xl transition-colors"><ArrowLeft size={18} /></button></Link>}
      />

      <div className="glass-card p-6 space-y-5">
        <h2 className="section-title">Personal Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Student Name *" value={form.name} onChange={e => set("name", e.target.value)} />
          <Input label="Father's Name" value={form.fatherName} onChange={e => set("fatherName", e.target.value)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Phone" type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} />
          <Input label="Admission Date *" type="date" value={form.admissionDate} onChange={e => set("admissionDate", e.target.value)} />
        </div>
        <Input label="Address" value={form.address} onChange={e => set("address", e.target.value)} />
      </div>

      <div className="glass-card p-6 space-y-5">
        <h2 className="section-title">Academic Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Class *" options={classOptions} value={form.classId} onChange={e => set("classId", e.target.value)} />
          <Input label="Roll Number *" type="number" value={form.rollNumber} onChange={e => set("rollNumber", e.target.value)} />
        </div>
        {role === "admin" && (
          <Input label="Monthly Fee (Rs.)" type="number" value={form.monthlyFee} onChange={e => set("monthlyFee", e.target.value)} />
        )}
        <div>
          <label className="form-label">Status</label>
          <div className="flex gap-2">
            {(["active", "inactive"] as const).map(s => (
              <button key={s} onClick={() => set("status", s)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${
                  form.status === s ? "bg-brand-600/20 border-brand-500/40 text-brand-400" : "border-white/10 text-white/40 hover:text-white"
                }`}>{s}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="form-label">Teacher Remarks</label>
          <textarea className="input-field resize-none h-20" value={form.teacherRemarks} onChange={e => set("teacherRemarks", e.target.value)} placeholder="Add any notes about this student..." />
        </div>
      </div>

      <div className="flex gap-3">
        <Link href={`/app/students/${params.id}`} className="flex-1"><Button variant="secondary" className="w-full">Cancel</Button></Link>
        <Button icon={<Save size={15} />} className="flex-1">Save Changes</Button>
      </div>
    </div>
  );
}
