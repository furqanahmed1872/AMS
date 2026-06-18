"use client";
import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { STUDENTS, TESTS } from "@/lib/dummy-data";
import { ArrowLeft, Save } from "lucide-react";
import React from "react";

export default function MarksEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const test = TESTS.find((t) => t.id === id) || TESTS[0];
  const students = STUDENTS.filter(
    (s) => s.classId === test.classId && s.status === "active",
  );

  const [marks, setMarks] = useState<Record<string, string>>({});
  const [absent, setAbsent] = useState<Record<string, boolean>>({});

  const entered =
    Object.values(marks).filter((v) => v !== "").length +
    Object.values(absent).filter(Boolean).length;

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <PageHeader
        title={test.name}
        subtitle={`${test.subject} · ${test.class} · ${test.totalMarks} marks`}
        back={
          <Link href="/app/tests">
            <button className="p-2 hover:bg-white/8 rounded-xl transition-colors">
              <ArrowLeft size={18} />
            </button>
          </Link>
        }
        actions={
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40 font-medium">
              {entered}/{students.length} entered
            </span>
            <Button icon={<Save size={14} />} size="sm">
              Save
            </Button>
          </div>
        }
      />

      <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-3 text-xs text-brand-400 flex items-center gap-2">
        <span>💡</span> Press Enter or Tab to move to the next student
      </div>

      <Card className="overflow-hidden">
        <div className="divide-y divide-white/5">
          {students.map((student, i) => {
            const isAbsent = absent[student.id];
            const mark = marks[student.id] || "";
            const pct =
              mark && !isAbsent
                ? Math.round((parseFloat(mark) / test.totalMarks) * 100)
                : null;
            return (
              <div
                key={student.id}
                className="flex items-center gap-4 px-4 py-3"
              >
                <span className="text-xs font-bold text-white/30 w-6">
                  #{student.rollNumber}
                </span>
                <span className="flex-1 text-sm font-medium text-white">
                  {student.name}
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      disabled={isAbsent}
                      value={mark}
                      onChange={(e) =>
                        setMarks((prev) => ({
                          ...prev,
                          [student.id]: e.target.value,
                        }))
                      }
                      placeholder="—"
                      max={test.totalMarks}
                      className="w-16 h-9 bg-surface-2 border border-white/10 rounded-lg px-2 text-center text-sm focus:border-brand-500 focus:outline-none disabled:opacity-30 transition-colors"
                    />
                    <span className="text-xs text-white/30">
                      /{test.totalMarks}
                    </span>
                  </div>
                  <div className="w-14 text-right">
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
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAbsent}
                      onChange={(e) =>
                        setAbsent((prev) => ({
                          ...prev,
                          [student.id]: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 accent-rose-500"
                    />
                    <span className="text-xs text-white/40">Abs</span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      <Button icon={<Save size={15} />} className="w-full">
        Save All Marks
      </Button>
    </div>
  );
}
