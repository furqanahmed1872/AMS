"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useAcademyData } from "@/lib/academy-data/provider";
import { updateStudentAction } from "@/lib/students/actions";
import { ArrowLeft, Save } from "lucide-react";

export default function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const router = useRouter();
  const { role, students, classes } = useAcademyData();

  const student = students.find((s) => s.id === id);
  const classOptions = classes.map((c) => ({
    value: c.id,
    label: c.displayName,
  }));

  const [form, setForm] = useState({
    name: student?.name ?? "",
    fatherName: student?.fatherName ?? "",
    classId: student?.classId ?? "",
    rollNumber: String(student?.rollNumber ?? ""),
    monthlyFee: String(student?.monthlyFee ?? ""),
    admissionDate: student?.admissionDate ?? "",
    phone: student?.phone ?? "",
    address: student?.address ?? "",
    teacherRemarks: student?.teacherRemarks ?? "",
    status: (student?.status ?? "active") as "active" | "inactive",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

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

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const result = await updateStudentAction(id, {
      ...form,
      status: form.status as "active" | "inactive",
    });
    setSaving(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }

    router.push(`/app/students/${id}`);
    router.refresh();
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <PageHeader
        title="Edit Student"
        subtitle={student.name}
        back={
          <Link href={`/app/students/${id}`}>
            <button className="p-2 hover:bg-white/8 rounded-xl transition-colors cursor-pointer">
              <ArrowLeft size={18} />
            </button>
          </Link>
        }
      />

      <div className="glass-card p-6 space-y-5">
        <h2 className="section-title">Personal Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Student Name *"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
          <Input
            label="Father's Name"
            value={form.fatherName}
            onChange={(e) => set("fatherName", e.target.value)}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Phone"
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
          <Input
            label="Admission Date *"
            type="date"
            value={form.admissionDate}
            onChange={(e) => set("admissionDate", e.target.value)}
          />
        </div>
        <Input
          label="Address"
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
        />
      </div>

      <div className="glass-card p-6 space-y-5">
        <h2 className="section-title">Academic Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Select
            label="Class *"
            options={classOptions}
            value={form.classId}
            onChange={(e) => set("classId", e.target.value)}
          />
          <Input
            label="Roll Number *"
            type="number"
            value={form.rollNumber}
            onChange={(e) => set("rollNumber", e.target.value)}
          />
        </div>
        {role === "admin" && (
          <Input
            label="Monthly Fee (Rs.)"
            type="number"
            value={form.monthlyFee}
            onChange={(e) => set("monthlyFee", e.target.value)}
            hint="Leave blank for 'Fee Not Set'"
          />
        )}
        <div>
          <label className="form-label">Status</label>
          <div className="flex gap-2 mt-1">
            {(["active", "inactive"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => set("status", s)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 capitalize cursor-pointer ${
                  form.status === s
                    ? "bg-brand-600/20 border-brand-500/40 text-brand-400"
                    : "border-white/10 text-white/40 hover:text-white hover:border-white/25"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="form-label">Teacher Remarks</label>
          <textarea
            className="input-field resize-none h-20"
            value={form.teacherRemarks}
            onChange={(e) => set("teacherRemarks", e.target.value)}
            placeholder="Add any notes about this student..."
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Link href={`/app/students/${id}`} className="flex-1">
          <Button variant="secondary" className="w-full">
            Cancel
          </Button>
        </Link>
        <Button
          icon={<Save size={15} />}
          className="flex-1"
          loading={saving}
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
