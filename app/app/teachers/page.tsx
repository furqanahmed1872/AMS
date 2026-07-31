"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { getTeachersAction } from "@/lib/teachers/queries";
import { addTeacherAction, updateTeacherAction } from "@/lib/teachers/actions";
import type { Teacher } from "@/lib/teachers/types";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  Calendar,
  FileText,
  DollarSign,
  Phone,
  UserX,
  UserCheck,
} from "lucide-react";

export default function TeachersPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Teacher | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    subject: "",
    monthlySalary: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setTeachers(await getTeachersAction());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setForm({ name: "", phone: "", subject: "", monthlySalary: "" });
    setError("");
    setShowAdd(true);
  };

  const openEdit = (t: Teacher) => {
    setEditing(t);
    setForm({
      name: t.name,
      phone: t.phone ?? "",
      subject: t.subject ?? "",
      monthlySalary: t.monthlySalary != null ? String(t.monthlySalary) : "",
    });
    setError("");
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim() || undefined,
      subject: form.subject.trim() || undefined,
      monthlySalary: form.monthlySalary
        ? Number(form.monthlySalary)
        : undefined,
    };

    const result = editing
      ? await updateTeacherAction(editing.id, {
          name: payload.name,
          phone: payload.phone ?? null,
          subject: payload.subject ?? null,
          monthlySalary: payload.monthlySalary ?? null,
        })
      : await addTeacherAction(payload);

    setSaving(false);
    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }
    setShowAdd(false);
    setEditing(null);
    router.refresh();
    load();
  };

  const handleToggleStatus = async () => {
    if (!toggleTarget) return;
    setSaving(true);
    const nextStatus = toggleTarget.status === "active" ? "inactive" : "active";
    await updateTeacherAction(toggleTarget.id, { status: nextStatus });
    setSaving(false);
    setToggleTarget(null);
    load();
  };

  const activeTeachers = teachers.filter((t) => t.status === "active");
  const totalSalaryLoad = activeTeachers.reduce(
    (sum, t) => sum + (t.monthlySalary ?? 0),
    0,
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Teachers"
        subtitle="Manage teaching staff, salary and attendance"
        actions={
          <div className="flex gap-2">
            <Link href="/app/teachers/attendance">
              <Button variant="ghost" size="sm" icon={<Calendar size={14} />}>
                Attendance
              </Button>
            </Link>
            <Link href="/app/teachers/salary">
              <Button variant="ghost" size="sm" icon={<DollarSign size={14} />}>
                Salary
              </Button>
            </Link>
            <Link href="/app/teachers/salary-record">
              <Button variant="ghost" size="sm" icon={<FileText size={14} />}>
                Salary Record
              </Button>
            </Link>
            <Button size="sm" icon={<Plus size={14} />} onClick={openAdd}>
              Add Teacher
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-xl font-bold text-white font-display">
            {teachers.length}
          </div>
          <div className="text-xs text-white/40 mt-1">Total Teachers</div>
        </Card>
        <Card className="p-4 text-center bg-emerald-500/5 border-emerald-500/15">
          <div className="text-xl font-bold text-emerald-400 font-display">
            {activeTeachers.length}
          </div>
          <div className="text-xs text-white/40 mt-1">Active</div>
        </Card>
        <Card className="p-4 text-center col-span-2 sm:col-span-1">
          <div className="text-xl font-bold text-white font-display">
            {formatCurrency(totalSalaryLoad)}
          </div>
          <div className="text-xs text-white/40 mt-1">Monthly Salary Load</div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="divide-y divide-white/5">
          {loading ? (
            <div className="py-12 text-center text-white/30 text-sm">
              Loading…
            </div>
          ) : teachers.length === 0 ? (
            <div className="py-12 text-center text-white/30 text-sm">
              No teachers added yet.
            </div>
          ) : (
            teachers.map((t) => (
              <div
                key={t.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3.5"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar name={t.name} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate">
                        {t.name}
                      </p>
                      <Badge
                        variant={t.status === "active" ? "active" : "inactive"}
                      >
                        {t.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-white/40">
                      {t.subject && <span>{t.subject}</span>}
                      {t.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={11} /> {t.phone}
                        </span>
                      )}
                      {t.monthlySalary != null && (
                        <span>{formatCurrency(t.monthlySalary)}/mo</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-11 sm:pl-0 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={
                      t.status === "active" ? (
                        <UserX size={13} />
                      ) : (
                        <UserCheck size={13} />
                      )
                    }
                    onClick={() => setToggleTarget(t)}
                  >
                    {t.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Add / Edit modal */}
      <Modal
        isOpen={showAdd || !!editing}
        onClose={() => {
          setShowAdd(false);
          setEditing(null);
        }}
        title={editing ? "Edit Teacher" : "Add Teacher"}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            list="existing-teacher-names"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Teacher's full name"
          />
          <datalist id="existing-teacher-names">
            {teachers.map((t) => (
              <option key={t.id} value={t.name} />
            ))}
          </datalist>
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="03XX-XXXXXXX"
          />
          <Input
            label="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="e.g. Mathematics"
          />
          <Input
            label="Monthly Salary"
            type="number"
            value={form.monthlySalary}
            onChange={(e) =>
              setForm({ ...form, monthlySalary: e.target.value })
            }
            placeholder="e.g. 25000"
          />
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <Button className="w-full" loading={saving} onClick={handleSave}>
            {editing ? "Save Changes" : "Add Teacher"}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleToggleStatus}
        loading={saving}
        title={
          toggleTarget?.status === "active"
            ? "Deactivate Teacher"
            : "Activate Teacher"
        }
        message={
          toggleTarget
            ? `${toggleTarget.status === "active" ? "Deactivate" : "Activate"} ${toggleTarget.name}?`
            : ""
        }
        confirmLabel="Confirm"
      />
    </div>
  );
}
