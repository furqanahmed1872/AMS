"use client";
import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { TESTS, CLASSES, SUBJECTS } from "@/lib/dummy-data";
import { Plus, BookOpen, ArrowRight } from "lucide-react";
import { SearchFilter } from "@/components/shared/SearchFilter";

const classOptions = CLASSES.map(c => ({ value: c.id, label: c.displayName }));
const subjectOptions = SUBJECTS.map(s => ({ value: s.id, label: s.name }));

export default function TestsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [classFilter, setClassFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [search, setSearch] = useState("");

  const allClassOptions = [
    { value: "all", label: "All Classes" },
    ...CLASSES.map((c) => ({ value: c.id, label: c.displayName })),
  ];
  const allSubjectOptions = [
    { value: "all", label: "All Subjects" },
    ...SUBJECTS.map((s) => ({ value: s.id, label: s.name })),
  ];

  const filteredTests = TESTS.filter((t) => {
    const matchClass = classFilter === "all" || t.classId === classFilter;
    const matchSubject =
      subjectFilter === "all" || t.subjectId === subjectFilter;
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase());
    return matchClass && matchSubject && matchSearch;
  });

  const [form, setForm] = useState({ name: "", classId: "", subjectId: "", date: new Date().toISOString().split("T")[0], totalMarks: "" });
  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Tests"
        subtitle={`${TESTS.length} tests created`}
        actions={
          <Button icon={<Plus size={15} />} onClick={() => setShowCreate(true)}>
            Create Test
          </Button>
        }
      />

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search tests..."
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

      <div className="text-xs text-white/40">
        {filteredTests.length} test{filteredTests.length !== 1 ? "s" : ""} found
      </div>

      <div className="space-y-2">
        {filteredTests.map((test) => (
          <Card key={test.id} hover className="p-4 flex items-center gap-4">
            <div className="p-2.5 bg-brand-500/10 rounded-xl text-brand-400 shrink-0">
              <BookOpen size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-white">{test.name}</span>
                <span className="text-xs text-white/40">·</span>
                <span className="text-xs text-white/60">{test.subject}</span>
                <span className="text-xs text-white/40">·</span>
                <span className="text-xs text-white/60">{test.class}</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-white/40">
                  {new Date(test.date).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="text-xs text-white/40">
                  Max: {test.totalMarks} marks
                </span>
                <Badge
                  variant={
                    test.marksEntered === test.totalStudents
                      ? "active"
                      : test.marksEntered > 0
                        ? "default"
                        : "not_set"
                  }
                >
                  {test.marksEntered}/{test.totalStudents} entered
                </Badge>
              </div>
            </div>
            <Link href={`/app/tests/${test.id}`}>
              <Button
                variant="secondary"
                size="sm"
                iconRight={<ArrowRight size={13} />}
              >
                Enter Marks
              </Button>
            </Link>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Test"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Test Name *"
            placeholder="e.g. T1, Chapter 11"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Class *"
              options={classOptions}
              value={form.classId}
              onChange={(e) => set("classId", e.target.value)}
              placeholder="Select class..."
            />
            <Select
              label="Subject *"
              options={subjectOptions}
              value={form.subjectId}
              onChange={(e) => set("subjectId", e.target.value)}
              placeholder="Select subject..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date *"
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
            />
            <Input
              label="Total Marks *"
              type="number"
              placeholder="e.g. 30"
              value={form.totalMarks}
              onChange={(e) => set("totalMarks", e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1">Create & Enter Marks</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
