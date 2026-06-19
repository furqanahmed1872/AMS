"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useAcademyData } from "@/lib/academy-data/provider";
import { createStudentAction } from "@/lib/students/actions";
import { ArrowLeft, UserPlus } from "lucide-react";

export default function AddStudentPage() {
  const router = useRouter();
  const { role, classes } = useAcademyData();

  const [form, setForm] = useState({
    name: "",
    fatherName: "",
    classId: classes[0]?.id ?? "",
    rollNumber: "",
    monthlyFee: "",
    admissionDate: new Date().toISOString().split("T")[0],
    phone: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const classOptions = classes.map((c) => ({
    value: c.id,
    label: c.displayName,
  }));
  const set = (key: string, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const result = await createStudentAction(form);
    setSaving(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }

    router.push("/app/students");
    router.refresh();
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <PageHeader
        title="Admit Student"
        subtitle="Add a new student to the academy"
        back={
          <Link href="/app/students">
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
            placeholder="Full name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
          <Input
            label="Father's Name"
            placeholder="Father's full name"
            value={form.fatherName}
            onChange={(e) => set("fatherName", e.target.value)}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Phone"
            type="tel"
            placeholder="03XX-XXXXXXX"
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
          placeholder="Home address"
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
            placeholder="Select class..."
          />
          <Input
            label="Roll Number *"
            type="number"
            placeholder="Auto-assigned if blank"
            value={form.rollNumber}
            onChange={(e) => set("rollNumber", e.target.value)}
            hint="Leave blank to auto-assign"
          />
        </div>
        {role === "admin" && (
          <Input
            label="Monthly Fee (Rs.)"
            type="number"
            placeholder="e.g. 3000"
            value={form.monthlyFee}
            onChange={(e) => set("monthlyFee", e.target.value)}
            hint="Leave blank to set later"
          />
        )}
      </div>

      {error && (
        <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Link href="/app/students" className="flex-1">
          <Button variant="secondary" className="w-full">
            Cancel
          </Button>
        </Link>
        <Button
          icon={<UserPlus size={15} />}
          className="flex-1"
          loading={saving}
          onClick={handleSave}
        >
          Admit Student
        </Button>
      </div>
    </div>
  );
}
