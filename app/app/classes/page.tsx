"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useAcademyData } from "@/lib/academy-data/provider";
import { createClassAction, deleteClassAction } from "@/lib/classes/actions";
import {
  createSubjectAction,
  deleteSubjectAction,
} from "@/lib/subjects/actions";
import {
  Plus,
  Trash2,
  GraduationCap,
  BookOpen,
  Lightbulb,
  X,
} from "lucide-react";

export default function ClassesPage() {
  const router = useRouter();
  // classes/subjects used to be useState(CLASSES)/useState(SUBJECTS) — now
  // read straight from the real bootstrap data; router.refresh() after each
  // mutation pulls a fresh copy through app/app/layout.tsx.
  const { classes, subjects } = useAcademyData();

  // Class form state
  const [showClassForm, setShowClassForm] = useState(false);
  const [newClass, setNewClass] = useState({ name: "", section: "" });
  const [classError, setClassError] = useState("");
  const [isAddingClass, setIsAddingClass] = useState(false);

  // Subject form state
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [subjectError, setSubjectError] = useState("");
  const [isAddingSubject, setIsAddingSubject] = useState(false);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "class" | "subject";
    id: string;
    name: string;
  } | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const addClass = async () => {
    if (!newClass.name.trim()) {
      setClassError("Class name is required");
      return;
    }
    const displayName = newClass.section.trim()
      ? `${newClass.name.trim()} ${newClass.section.trim()}`
      : newClass.name.trim();
    // Quick client-side check against what's already loaded — the unique
    // index in the database is still the authoritative check underneath.
    const exists = classes.find(
      (c) => c.displayName.toLowerCase() === displayName.toLowerCase(),
    );
    if (exists) {
      setClassError("A class with this name and section already exists");
      return;
    }

    setIsAddingClass(true);
    const result = await createClassAction(
      newClass.name.trim(),
      newClass.section.trim(),
    );
    setIsAddingClass(false);

    if (!result.success) {
      setClassError(result.error ?? "Something went wrong.");
      return;
    }

    setNewClass({ name: "", section: "" });
    setClassError("");
    setShowClassForm(false);
    router.refresh();
  };

  const addSubject = async () => {
    if (!newSubject.trim()) {
      setSubjectError("Subject name is required");
      return;
    }
    const exists = subjects.find(
      (s) => s.name.toLowerCase() === newSubject.trim().toLowerCase(),
    );
    if (exists) {
      setSubjectError("This subject already exists");
      return;
    }

    setIsAddingSubject(true);
    const result = await createSubjectAction(newSubject.trim());
    setIsAddingSubject(false);

    if (!result.success) {
      setSubjectError(result.error ?? "Something went wrong.");
      return;
    }

    setNewSubject("");
    setSubjectError("");
    setShowSubjectForm(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    const result =
      deleteTarget.type === "class"
        ? await deleteClassAction(deleteTarget.id)
        : await deleteSubjectAction(deleteTarget.id);
    setIsDeleting(false);

    if (!result.success) {
      setDeleteError(result.error ?? "Something went wrong.");
      return;
    }

    setDeleteTarget(null);
    setDeleteError("");
    router.refresh();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Classes & Subjects"
        subtitle="Set up your academy structure"
      />

      <div className="flex flex-col w-full gap-4">
        {/* ── Classes ── */}
        <div className="space-y-3">
          <Card className="p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title flex items-center gap-2">
                <GraduationCap size={18} className="text-brand-400" />
                Classes
                <span className="text-xs font-normal text-white/30 ml-1">
                  ({classes.length})
                </span>
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowClassForm((v) => !v);
                  setClassError("");
                  setNewClass({ name: "", section: "" });
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  showClassForm
                    ? "bg-white/10 text-white/60 hover:bg-white/15"
                    : "bg-brand-600 hover:bg-brand-500 text-white shadow-glow"
                }`}
              >
                {showClassForm ? (
                  <>
                    <X size={14} /> Cancel
                  </>
                ) : (
                  <>
                    <Plus size={14} /> Add Class
                  </>
                )}
              </button>
            </div>

            {/* Add Form */}
            {showClassForm && (
              <div className="mb-4 p-4 bg-surface-2 rounded-xl border border-brand-500/20 animate-scale-in space-y-3">
                <p className="text-xs text-white/40 font-medium uppercase tracking-wider">
                  New Class
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="form-label">Class Name *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. 10th, Grade 5"
                      value={newClass.name}
                      onChange={(e) => {
                        setNewClass((p) => ({ ...p, name: e.target.value }));
                        setClassError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && addClass()}
                      autoFocus
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="form-label">
                      Section <span className="text-white/30">(optional)</span>
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Blue, A, Red"
                      value={newClass.section}
                      onChange={(e) => {
                        setNewClass((p) => ({ ...p, section: e.target.value }));
                        setClassError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && addClass()}
                    />
                  </div>
                </div>
                {classError && (
                  <p className="text-xs text-rose-400">{classError}</p>
                )}
                {/* Preview */}
                {newClass.name.trim() && (
                  <p className="text-xs text-white/40">
                    Will be created as:{" "}
                    <span className="text-brand-400 font-semibold">
                      {newClass.section.trim()
                        ? `${newClass.name.trim()} ${newClass.section.trim()}`
                        : newClass.name.trim()}
                    </span>
                  </p>
                )}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowClassForm(false);
                      setClassError("");
                      setNewClass({ name: "", section: "" });
                    }}
                    className="flex-1 py-2 rounded-xl text-sm font-medium border border-white/10 text-white/50 hover:text-white hover:border-white/25 transition-all duration-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={addClass}
                    disabled={isAddingClass}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-glow transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus size={14} />{" "}
                    {isAddingClass ? "Adding..." : "Add Class"}
                  </button>
                </div>
              </div>
            )}

            {/* List */}
            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {classes.length === 0 ? (
                <div className="text-center py-8 text-white/30 text-sm">
                  No classes yet. Add your first class above.
                </div>
              ) : (
                classes.map((cls) => (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between py-2.5 px-3 bg-surface-2 hover:bg-surface-3 rounded-xl group transition-all duration-150"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400">
                        <GraduationCap size={13} />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-white">
                          {cls.displayName}
                        </span>
                        <span className="text-xs text-white/30 ml-2">
                          {cls.studentCount} students
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({
                          type: "class",
                          id: cls.id,
                          name: cls.displayName,
                        })
                      }
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-500/15 text-rose-400/60 hover:text-rose-400 rounded-lg transition-all duration-150 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* ── Subjects ── */}
        <div className="space-y-3">
          <Card className="p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title flex items-center gap-2">
                <BookOpen size={18} className="text-violet-400" />
                Subjects
                <span className="text-xs font-normal text-white/30 ml-1">
                  ({subjects.length})
                </span>
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowSubjectForm((v) => !v);
                  setSubjectError("");
                  setNewSubject("");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  showSubjectForm
                    ? "bg-white/10 text-white/60 hover:bg-white/15"
                    : "bg-violet-600 hover:bg-violet-500 text-white"
                }`}
                style={
                  showSubjectForm
                    ? {}
                    : { boxShadow: "0 0 20px rgba(139,92,246,0.3)" }
                }
              >
                {showSubjectForm ? (
                  <>
                    <X size={14} /> Cancel
                  </>
                ) : (
                  <>
                    <Plus size={14} /> Add Subject
                  </>
                )}
              </button>
            </div>

            {/* Add Form */}
            {showSubjectForm && (
              <div className="mb-4 p-4 bg-surface-2 rounded-xl border border-violet-500/20 animate-scale-in space-y-3">
                <p className="text-xs text-white/40 font-medium uppercase tracking-wider">
                  New Subject
                </p>
                <div>
                  <label className="form-label">Subject Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Mathematics, Physics, Urdu"
                    value={newSubject}
                    onChange={(e) => {
                      setNewSubject(e.target.value);
                      setSubjectError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && addSubject()}
                    autoFocus
                  />
                </div>
                {subjectError && (
                  <p className="text-xs text-rose-400">{subjectError}</p>
                )}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubjectForm(false);
                      setSubjectError("");
                      setNewSubject("");
                    }}
                    className="flex-1 py-2 rounded-xl text-sm font-medium border border-white/10 text-white/50 hover:text-white hover:border-white/25 transition-all duration-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={addSubject}
                    disabled={isAddingSubject}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                    style={{ boxShadow: "0 0 20px rgba(139,92,246,0.25)" }}
                  >
                    <Plus size={14} />{" "}
                    {isAddingSubject ? "Adding..." : "Add Subject"}
                  </button>
                </div>
              </div>
            )}

            {/* List */}
            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {subjects.length === 0 ? (
                <div className="text-center py-8 text-white/30 text-sm">
                  No subjects yet. Add your first subject above.
                </div>
              ) : (
                subjects.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between py-2.5 px-3 bg-surface-2 hover:bg-surface-3 rounded-xl group transition-all duration-150"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
                        <BookOpen size={13} />
                      </div>
                      <span className="text-sm font-medium text-white">
                        {sub.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({
                          type: "subject",
                          id: sub.id,
                          name: sub.name,
                        })
                      }
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-500/15 text-rose-400/60 hover:text-rose-400 rounded-lg transition-all duration-150 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Getting Started Helper */}
      <Card className="p-5 border-brand-500/20 bg-brand-500/5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-brand-500/15 rounded-xl text-brand-400 shrink-0 mt-0.5">
            <Lightbulb size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">Getting Started</h3>
            <ol className="space-y-1.5 text-sm text-white/55 list-decimal list-inside">
              <li>
                Create your classes first — e.g.{" "}
                <span className="text-white/70">"10th Blue"</span>,{" "}
                <span className="text-white/70">"9th A"</span>
              </li>
              <li>
                Add subjects — e.g.{" "}
                <span className="text-white/70">Maths, English, Science</span>
              </li>
              <li>
                Go to <span className="text-white/70">Students</span> and add
                students to each class
              </li>
              <li>
                Fee records are{" "}
                <span className="text-white/70">generated automatically</span>{" "}
                each month — no manual step needed
              </li>
            </ol>
          </div>
        </div>
      </Card>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError("");
        }}
        onConfirm={handleDelete}
        loading={isDeleting}
        title={`Delete ${deleteTarget?.type === "class" ? "Class" : "Subject"}`}
        message={
          deleteError ||
          `Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone and may affect existing student and test records.`
        }
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
