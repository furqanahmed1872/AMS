"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchFilter } from "@/components/shared/SearchFilter";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { useAcademyData } from "@/lib/academy-data/provider";
import { isAllBranches } from "@/lib/branches/types";
import {
  getExamScheduleAction,
  createExamScheduleAction,
  updateExamScheduleAction,
  deleteExamScheduleAction,
  type ExamScheduleEntry,
  type ExamScheduleForm,
} from "@/lib/exam-schedule/actions";
import {
  CalendarDays,
  Plus,
  MapPin,
  Clock,
  Pencil,
  Trash2,
  X as XIcon,
  Building2,
  Globe,
} from "lucide-react";

const NO_CLASS = ""; // "no specific class" sentinel for the class select

// Fetched client-side on mount, same pattern as NoticesPage — brand-new,
// low-traffic module, no bootstrap-data entry, no realtime subscription.
//
// Deliberately separate from the Tests module: this is a calendar of
// upcoming papers (date/time/venue), not marks entry. There is no FK to
// tests.id — a date sheet is usually published before a matching `tests`
// row (and marks) even exists.
//
// Targeting: an exam can be scoped to one class, to a whole branch (no
// class picked), or to the whole academy (neither picked) — resolved
// once here and read the same way on the parent portal
// (getUpcomingExamsForStudent in lib/exam-schedule/actions.ts).
export default function ExamSchedulePage() {
  const {
    role,
    classes,
    subjects,
    branches,
    branchId: activeBranchScope,
  } = useAcademyData();

  const [entries, setEntries] = useState<ExamScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setEntries(await getExamScheduleAction());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // `classes` from context is already scoped server-side to the
  // session's active branch (see get-bootstrap-data.ts) — so when the
  // admin has a specific branch selected, only that branch's classes
  // ever appear here; switching to "All Branches" brings every class
  // back in. Nothing extra to filter client-side.
  const classOptions = classes.map((c) => ({
    value: c.id,
    label: c.displayName,
  }));
  const subjectOptions = subjects.map((s) => ({ value: s.id, label: s.name }));
  const allClassOptions = [
    { value: "all", label: "All Classes" },
    ...classOptions,
  ];
  const allSubjectOptions = [
    { value: "all", label: "All Subjects" },
    ...subjectOptions,
  ];

  const isViewingAllBranches = isAllBranches(activeBranchScope);
  const branchOptions = branches.map((b) => ({ value: b.id, label: b.name }));

  const scopeLabel = (entry: ExamScheduleEntry) => {
    if (entry.className) return entry.className;
    if (entry.branchName) return `${entry.branchName} (all classes)`;
    return "Academy-wide";
  };

  // ── Filters ──────────────────────────────────────────────────────
  const [classFilter, setClassFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredEntries = entries.filter((e) => {
    const matchClass = classFilter === "all" || e.classId === classFilter;
    const matchSubject =
      subjectFilter === "all" || e.subjectId === subjectFilter;
    const matchSearch =
      e.examName.toLowerCase().includes(search.toLowerCase()) ||
      e.subjectName.toLowerCase().includes(search.toLowerCase()) ||
      scopeLabel(e).toLowerCase().includes(search.toLowerCase()) ||
      (e.venue ?? "").toLowerCase().includes(search.toLowerCase());
    return matchClass && matchSubject && matchSearch;
  });

  // Group by date for the calendar-style layout.
  const grouped = useMemo(() => {
    const map = new Map<string, ExamScheduleEntry[]>();
    for (const entry of filteredEntries) {
      const key = entry.examDate;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }
    return Array.from(map.entries()).sort(
      ([a], [b]) => new Date(a).getTime() - new Date(b).getTime(),
    );
  }, [filteredEntries]);

  const todayIso = new Date().toISOString().split("T")[0];

  // ── Create/Edit modal state ──────────────────────────────────────
  const emptyForm: ExamScheduleForm = {
    classId: NO_CLASS,
    branchId: isViewingAllBranches ? "" : (activeBranchScope as string),
    subjectId: subjects[0]?.id ?? "",
    examName: "",
    examDate: todayIso,
    startTime: "",
    endTime: "",
    venue: "",
    notes: "",
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ExamScheduleForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const set = <K extends keyof ExamScheduleForm>(
    k: K,
    v: ExamScheduleForm[K],
  ) => setForm((prev) => ({ ...prev, [k]: v }));

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (entry: ExamScheduleEntry) => {
    setEditingId(entry.id);
    setForm({
      classId: entry.classId ?? NO_CLASS,
      branchId: entry.branchId ?? "",
      subjectId: entry.subjectId,
      examName: entry.examName,
      examDate: entry.examDate,
      startTime: entry.startTime ?? "",
      endTime: entry.endTime ?? "",
      venue: entry.venue ?? "",
      notes: entry.notes ?? "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormError("");
    const result = editingId
      ? await updateExamScheduleAction(editingId, form)
      : await createExamScheduleAction(form);
    setSaving(false);

    if (!result.success) {
      setFormError(result.error ?? "Something went wrong.");
      return;
    }

    setModalOpen(false);
    await loadEntries();
  };

  // ── Delete state ─────────────────────────────────────────────────
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const result = await deleteExamScheduleAction(id);
    setDeletingId(null);
    if (result.success) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const formatTime = (t: string | null) => {
    if (!t) return null;
    const [h, m] = t.split(":");
    const hour = parseInt(h, 10);
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${m} ${suffix}`;
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Exam Schedule"
        subtitle={`${entries.length} paper${entries.length !== 1 ? "s" : ""} on the date sheet`}
        actions={
          <Button icon={<Plus size={15} />} onClick={openCreate}>
            Schedule Exam
          </Button>
        }
      />

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search exam, subject, class, venue..."
        filters={[
          {
            label: "Class",
            options: allClassOptions,
            value: classFilter,
            onChange: setClassFilter,
          },
          {
            label: "Subject",
            options: allSubjectOptions,
            value: subjectFilter,
            onChange: setSubjectFilter,
          },
        ]}
        onReset={() => {
          setSearch("");
          setClassFilter("all");
          setSubjectFilter("all");
        }}
      />

      {loading ? (
        <Card className="p-10 text-center text-white/30 text-sm">Loading…</Card>
      ) : grouped.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CalendarDays size={28} />}
            title={
              entries.length === 0
                ? "No exams scheduled yet"
                : "No exams match your filters"
            }
            description={
              entries.length === 0
                ? "Build the date sheet by scheduling papers for each class and subject."
                : undefined
            }
            action={
              entries.length === 0 ? (
                <Button icon={<Plus size={15} />} onClick={openCreate}>
                  Schedule Exam
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="space-y-5">
          {grouped.map(([date, dayEntries]) => {
            const isPast = date < todayIso;
            return (
              <div key={date}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <CalendarDays size={14} className="text-white/40" />
                  <span
                    className={`text-xs font-semibold ${isPast ? "text-white/30" : "text-white/70"}`}
                  >
                    {new Date(date).toLocaleDateString("en-PK", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  {date === todayIso && <Badge variant="default">Today</Badge>}
                </div>
                <div className="space-y-2">
                  {dayEntries.map((entry) => {
                    const start = formatTime(entry.startTime);
                    const end = formatTime(entry.endTime);
                    return (
                      <Card
                        key={entry.id}
                        hover
                        className={`p-4 flex items-center gap-4 ${isPast ? "opacity-50" : ""}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-white">
                              {entry.examName}
                            </span>
                            <span className="text-xs text-white/40">·</span>
                            <span className="text-xs text-white/60">
                              {entry.subjectName}
                            </span>
                            <span className="text-xs text-white/40">·</span>
                            <span className="flex items-center gap-1 text-xs text-white/60">
                              {entry.className ? (
                                <Building2
                                  size={11}
                                  className="text-white/30"
                                />
                              ) : (
                                <Globe size={11} className="text-white/30" />
                              )}
                              {scopeLabel(entry)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            {(start || end) && (
                              <span className="flex items-center gap-1 text-xs text-white/40">
                                <Clock size={11} />
                                {start ?? "—"}
                                {end ? ` – ${end}` : ""}
                              </span>
                            )}
                            {entry.venue && (
                              <span className="flex items-center gap-1 text-xs text-white/40">
                                <MapPin size={11} />
                                {entry.venue}
                              </span>
                            )}
                          </div>
                          {entry.notes && (
                            <p className="text-xs text-white/40 mt-1.5 whitespace-pre-wrap break-words">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Pencil size={13} />}
                            onClick={() => openEdit(entry)}
                          >
                            {""}
                          </Button>
                          {role === "admin" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Trash2 size={13} />}
                              loading={deletingId === entry.id}
                              onClick={() => handleDelete(entry.id)}
                              className="text-rose-400/70 hover:text-rose-400"
                            >
                              {""}
                            </Button>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ CREATE / EDIT MODAL ═══════════════════════════════════════ */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setFormError("");
        }}
        title={editingId ? "Edit Exam" : "Schedule Exam"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Class"
              options={[
                { value: NO_CLASS, label: "No specific class" },
                ...classOptions,
              ]}
              value={form.classId}
              onChange={(e) => set("classId", e.target.value)}
            />
            <Select
              label="Subject *"
              options={subjectOptions}
              value={form.subjectId}
              onChange={(e) => set("subjectId", e.target.value)}
              placeholder="Select subject..."
            />
          </div>

          {/* Branch targeting only matters once no specific class is
              picked — a class already belongs to exactly one branch. */}
          {!form.classId && (
            <div>
              <Select
                label="Branch"
                options={[
                  { value: "", label: "Academy-wide (all branches)" },
                  ...branchOptions,
                ]}
                value={form.branchId}
                onChange={(e) => set("branchId", e.target.value)}
                disabled={!isViewingAllBranches}
              />
              <p className="text-xs text-white/40 mt-1.5">
                {form.branchId
                  ? "Every student in this branch will see it on their parent portal."
                  : "Every student in the academy will see it on their parent portal."}
                {!isViewingAllBranches &&
                  ' Switch to "All Branches" in the sidebar to target a different branch.'}
              </p>
            </div>
          )}

          <Input
            label="Exam Name *"
            placeholder="e.g. Mid-Term 2026, Final Term"
            value={form.examName}
            onChange={(e) => set("examName", e.target.value)}
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Date *"
              type="date"
              value={form.examDate}
              onChange={(e) => set("examDate", e.target.value)}
            />
            <Input
              label="Start Time"
              type="time"
              value={form.startTime}
              onChange={(e) => set("startTime", e.target.value)}
            />
            <Input
              label="End Time"
              type="time"
              value={form.endTime}
              onChange={(e) => set("endTime", e.target.value)}
            />
          </div>
          <Input
            label="Venue"
            placeholder="e.g. Room 4, Main Hall"
            value={form.venue}
            onChange={(e) => set("venue", e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="form-label">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Syllabus, instructions, materials to bring…"
              rows={3}
              className="input-field resize-none"
              maxLength={500}
            />
          </div>

          {formError && (
            <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
              {formError}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              icon={<XIcon size={14} />}
              onClick={() => {
                setModalOpen(false);
                setFormError("");
              }}
            >
              Cancel
            </Button>
            <Button className="flex-1" loading={saving} onClick={handleSave}>
              {editingId ? "Save Changes" : "Schedule Exam"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
