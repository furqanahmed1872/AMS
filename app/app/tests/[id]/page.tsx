"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAcademyData } from "@/lib/academy-data/provider";
import { getTestMarksAction, saveMarksAction } from "@/lib/tests/actions";
import { ArrowLeft, Save } from "lucide-react";

export default function MarksEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const router = useRouter();
  const { tests, students } = useAcademyData();

  const test = tests.find((t) => t.id === id);

  const classStudents = students
    .filter((s) => s.classId === test?.classId && s.status === "active")
    .sort((a, b) => a.rollNumber - b.rollNumber);

  const [marks, setMarks] = useState<Record<string, string>>({});
  const [absent, setAbsent] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!test) {
      setLoading(false);
      return;
    }
    getTestMarksAction(id).then((existing) => {
      const initMarks: Record<string, string> = {};
      const initAbsent: Record<string, boolean> = {};
      for (const s of classStudents) {
        const entry = existing[s.id];
        initMarks[s.id] =
          entry?.marksObtained != null ? String(entry.marksObtained) : "";
        initAbsent[s.id] = entry?.isAbsent ?? false;
      }
      setMarks(initMarks);
      setAbsent(initAbsent);
      setLoading(false);
    });
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const entered =
    Object.values(marks).filter((v) => v !== "").length +
    Object.values(absent).filter(Boolean).length;

  const handleSave = async () => {
    if (!test) return;
    setSaving(true);
    setSaveError("");
    const entries = classStudents.map((s) => ({
      studentId: s.id,
      marksObtained: marks[s.id] ? parseFloat(marks[s.id]) : null,
      isAbsent: absent[s.id] ?? false,
    }));
    const result = await saveMarksAction(id, entries);
    setSaving(false);
    if (!result.success) {
      setSaveError(result.error ?? "Something went wrong.");
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      router.refresh();
    }
  };

  if (!test) {
    return (
      <div className="text-center py-20 text-white/40">
        Test not found.{" "}
        <Link href="/app/tests" className="text-brand-400 hover:underline">
          Go back
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in w-full max-w-2xl">
      <PageHeader
        title={test.name}
        subtitle={`${test.subject} · ${test.class} · ${test.totalMarks} marks`}
        back={
          <Link href="/app/tests">
            <button className="p-2 hover:bg-white/8 rounded-xl transition-colors cursor-pointer">
              <ArrowLeft size={18} />
            </button>
          </Link>
        }
        actions={
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs text-white/40 font-medium whitespace-nowrap">
              {entered}/{classStudents.length} entered
            </span>
            <Button
              icon={<Save size={14} />}
              size="sm"
              loading={saving}
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        }
      />

      <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-3 text-xs text-brand-400 flex items-center gap-2">
        <span>💡</span> Press Enter or Tab to move to the next student
      </div>

      {loading ? (
        <Card className="p-10 text-center text-white/30 text-sm">
          Loading existing marks…
        </Card>
      ) : classStudents.length === 0 ? (
        <Card className="p-10 text-center text-white/30 text-sm">
          No active students in this class.
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-white/5">
            {classStudents.map((student) => {
              const isAbsent = absent[student.id] ?? false;
              const mark = marks[student.id] ?? "";
              const pct =
                mark && !isAbsent
                  ? Math.round((parseFloat(mark) / test.totalMarks) * 100)
                  : null;
              return (
                <div
                  key={student.id}
                  className="flex items-center gap-2 px-3 sm:px-4 py-3 w-full min-w-0"
                >
                  {/* Roll number */}
                  <span className="text-xs font-bold text-white/30 w-7 shrink-0">
                    #{student.rollNumber}
                  </span>

                  {/* Student name — shrinks and truncates */}
                  <span className="flex-1 min-w-0 text-sm font-medium text-white truncate">
                    {student.name}
                  </span>

                  {/* Controls — fixed, never shrink */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {/* Marks input */}
                    <input
                      type="number"
                      disabled={isAbsent}
                      value={mark}
                      min={0}
                      max={test.totalMarks}
                      onChange={(e) =>
                        setMarks((prev) => ({
                          ...prev,
                          [student.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === "Tab") {
                          e.preventDefault();
                          const inputs =
                            document.querySelectorAll<HTMLInputElement>(
                              "input[type=number]",
                            );
                          const idx = Array.from(inputs).findIndex(
                            (el) => el === e.currentTarget,
                          );
                          inputs[idx + 1]?.focus();
                        }
                      }}
                      placeholder="—"
                      className="w-14 sm:w-16 h-9 bg-surface-2 border border-white/10 rounded-lg px-2 text-center text-sm focus:border-brand-500 focus:outline-none disabled:opacity-30 transition-colors"
                    />

                    {/* Total marks */}
                    <span className="text-xs text-white/30 shrink-0">
                      /{test.totalMarks}
                    </span>

                    {/* Percentage — fixed width so checkbox never gets pushed off */}
                    <div className="w-12 text-right shrink-0">
                      {isAbsent ? (
                        <span className="text-xs font-medium text-rose-400">
                          Absent
                        </span>
                      ) : pct !== null ? (
                        <span
                          className={`text-xs font-bold ${pct >= 33 ? "text-emerald-400" : "text-rose-400"}`}
                        >
                          {pct}%
                        </span>
                      ) : (
                        <span className="text-xs text-white/20">—</span>
                      )}
                    </div>

                    {/* Absent checkbox */}
                    <label className="flex items-center gap-1 cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={isAbsent}
                        onChange={(e) => {
                          setAbsent((prev) => ({
                            ...prev,
                            [student.id]: e.target.checked,
                          }));
                          if (e.target.checked) {
                            setMarks((prev) => ({
                              ...prev,
                              [student.id]: "",
                            }));
                          }
                        }}
                        className="w-4 h-4 accent-rose-500"
                      />
                      <span className="text-xs text-white/40 hidden sm:inline">
                        Abs
                      </span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {saveError && (
        <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
          {saveError}
        </p>
      )}
      {saveSuccess && (
        <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
          Marks saved successfully.
        </p>
      )}

      <Button
        icon={<Save size={15} />}
        className="w-full"
        loading={saving}
        onClick={handleSave}
      >
        Save All Marks
      </Button>
    </div>
  );
}
