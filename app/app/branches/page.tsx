"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAcademyData } from "@/lib/academy-data/provider";
import {
  createBranchAction,
  updateBranchAction,
  deleteBranchAction,
} from "@/lib/branches/actions";
import type { Branch } from "@/lib/branches/types";
import {
  Plus,
  Pencil,
  Trash2,
  Building2,
  MapPin,
  Phone,
  Star,
  X,
} from "lucide-react";

const emptyForm = { name: "", address: "", phone: "" };

/**
 * Admin-only branch management. Not linked from anywhere but the sidebar
 * ("Manage Branches" under the switcher) — teachers never see this route,
 * and the underlying actions already reject non-admin callers server-side.
 */
export default function BranchesPage() {
  const router = useRouter();
  const { branches, role } = useAcademyData();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState<Branch | null>(null);
  const [editForm, setEditForm] = useState({
    ...emptyForm,
    status: "active" as "active" | "inactive",
  });
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  if (role !== "admin") {
    return (
      <EmptyState
        icon={<Building2 size={22} />}
        title="Admins only"
        description="Branch management is restricted to academy admins."
      />
    );
  }

  const resetAddForm = () => {
    setForm(emptyForm);
    setFormError("");
    setShowForm(false);
  };

  const handleAdd = async () => {
    if (!form.name.trim()) {
      setFormError("Branch name is required.");
      return;
    }
    setSaving(true);
    setFormError("");
    const res = await createBranchAction(form);
    setSaving(false);
    if (!res.success) {
      setFormError(res.error ?? "Something went wrong.");
      return;
    }
    resetAddForm();
    router.refresh();
  };

  const openEdit = (branch: Branch) => {
    setEditing(branch);
    setEditForm({
      name: branch.name,
      address: branch.address ?? "",
      phone: branch.phone ?? "",
      status: branch.status,
    });
    setEditError("");
  };

  const handleEdit = async () => {
    if (!editing) return;
    if (!editForm.name.trim()) {
      setEditError("Branch name is required.");
      return;
    }
    setSavingEdit(true);
    setEditError("");
    const res = await updateBranchAction(editing.id, editForm);
    setSavingEdit(false);
    if (!res.success) {
      setEditError(res.error ?? "Something went wrong.");
      return;
    }
    setEditing(null);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    const res = await deleteBranchAction(deleteTarget.id);
    setDeleting(false);
    if (!res.success) {
      setDeleteError(res.error ?? "Something went wrong.");
      return;
    }
    setDeleteTarget(null);
    router.refresh();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Branches"
        subtitle="Manage the physical locations your academy operates from"
        actions={
          <Button icon={<Plus size={15} />} onClick={() => setShowForm(true)}>
            Add Branch
          </Button>
        }
      />

      {branches.length === 0 ? (
        <EmptyState
          icon={<Building2 size={22} />}
          title="No branches yet"
          description="Add your first branch to get started."
          action={
            <Button icon={<Plus size={15} />} onClick={() => setShowForm(true)}>
              Add Branch
            </Button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch) => (
            <Card key={branch.id} className="p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 shrink-0">
                    <Building2 size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {branch.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {branch.isPrimary && (
                        <Badge variant="default" className="gap-1">
                          <Star size={10} /> Primary
                        </Badge>
                      )}
                      <Badge
                        variant={
                          branch.status === "active" ? "active" : "inactive"
                        }
                      >
                        {branch.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-white/40">
                {branch.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{branch.address}</span>
                  </div>
                )}
                {branch.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone size={12} className="shrink-0" />
                    <span className="truncate">{branch.phone}</span>
                  </div>
                )}
                {!branch.address && !branch.phone && (
                  <span className="text-white/25">No contact details</span>
                )}
              </div>

              <div className="flex gap-2 mt-auto pt-1">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  icon={<Pencil size={13} />}
                  onClick={() => openEdit(branch)}
                >
                  Edit
                </Button>
                {!branch.isPrimary && (
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<Trash2 size={13} />}
                    onClick={() => {
                      setDeleteTarget(branch);
                      setDeleteError("");
                    }}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add branch */}
      <Modal isOpen={showForm} onClose={resetAddForm} title="Add Branch">
        <div className="space-y-4">
          <Input
            label="Branch name"
            placeholder="e.g. North Campus"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            autoFocus
          />
          <Input
            label="Address (optional)"
            placeholder="e.g. 12 Main Street"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <Input
            label="Phone (optional)"
            placeholder="e.g. 0300 1234567"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          {formError && <p className="text-xs text-rose-400">{formError}</p>}
          <div className="flex gap-3 pt-1">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={resetAddForm}
            >
              Cancel
            </Button>
            <Button className="flex-1" loading={saving} onClick={handleAdd}>
              Add Branch
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit branch */}
      <Modal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        title={`Edit ${editing?.name ?? "Branch"}`}
      >
        <div className="space-y-4">
          <Input
            label="Branch name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            autoFocus
          />
          <Input
            label="Address"
            value={editForm.address}
            onChange={(e) =>
              setEditForm({ ...editForm, address: e.target.value })
            }
          />
          <Input
            label="Phone"
            value={editForm.phone}
            onChange={(e) =>
              setEditForm({ ...editForm, phone: e.target.value })
            }
          />
          {!editing?.isPrimary && (
            <div className="flex items-center justify-between p-3 bg-surface-2 rounded-xl">
              <span className="text-sm text-white/70">Active</span>
              <button
                onClick={() =>
                  setEditForm((f) => ({
                    ...f,
                    status: f.status === "active" ? "inactive" : "active",
                  }))
                }
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  editForm.status === "active" ? "bg-brand-600" : "bg-surface-3"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    editForm.status === "active" ? "left-5" : "left-1"
                  }`}
                />
              </button>
            </div>
          )}
          {editError && <p className="text-xs text-rose-400">{editError}</p>}
          <div className="flex gap-3 pt-1">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setEditing(null)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              loading={savingEdit}
              onClick={handleEdit}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete branch?"
        message={
          deleteError ||
          `This removes "${deleteTarget?.name}". Branches with students or classes still assigned can't be deleted.`
        }
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </div>
  );
}
