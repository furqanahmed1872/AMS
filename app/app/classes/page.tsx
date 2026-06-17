"use client";
import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CLASSES, SUBJECTS } from "@/lib/dummy-data";
import { Plus, Trash2, GraduationCap, BookOpen, Lightbulb } from "lucide-react";

export default function ClassesPage() {
  const [classes, setClasses] = useState(CLASSES);
  const [subjects, setSubjects] = useState(SUBJECTS);
  const [newClass, setNewClass] = useState({ name: "", section: "" });
  const [newSubject, setNewSubject] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ type: "class" | "subject"; id: string; name: string } | null>(null);

  const addClass = () => {
    if (!newClass.name.trim()) return;
    const displayName = newClass.section ? `${newClass.name} ${newClass.section}` : newClass.name;
    setClasses(prev => [...prev, { id: `c${Date.now()}`, name: newClass.name, section: newClass.section || undefined, displayName, studentCount: 0 }]);
    setNewClass({ name: "", section: "" });
  };

  const addSubject = () => {
    if (!newSubject.trim()) return;
    setSubjects(prev => [...prev, { id: `s${Date.now()}`, name: newSubject.trim() }]);
    setNewSubject("");
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "class") setClasses(prev => prev.filter(c => c.id !== deleteTarget.id));
    else setSubjects(prev => prev.filter(s => s.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Classes & Subjects" subtitle="Set up your academy structure" />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Classes */}
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="section-title mb-4 flex items-center gap-2"><GraduationCap size={18} className="text-brand-400" />Classes</h2>
            <div className="flex gap-2 mb-4">
              <Input placeholder="Class name (e.g. 10th)" value={newClass.name} onChange={e => setNewClass(p => ({ ...p, name: e.target.value }))} className="flex-1" />
              <Input placeholder="Section (optional)" value={newClass.section} onChange={e => setNewClass(p => ({ ...p, section: e.target.value }))} className="w-28" />
              <Button size="md" icon={<Plus size={14} />} onClick={addClass} className="shrink-0">Add</Button>
            </div>
            <div className="space-y-2">
              {classes.map(cls => (
                <div key={cls.id} className="flex items-center justify-between py-2.5 px-3 bg-surface-2 rounded-xl group">
                  <div>
                    <span className="text-sm font-medium text-white">{cls.displayName}</span>
                    <span className="text-xs text-white/40 ml-2">{cls.studentCount} students</span>
                  </div>
                  <button onClick={() => setDeleteTarget({ type: "class", id: cls.id, name: cls.displayName })}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-500/10 text-rose-400 rounded-lg transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Subjects */}
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="section-title mb-4 flex items-center gap-2"><BookOpen size={18} className="text-violet-400" />Subjects</h2>
            <div className="flex gap-2 mb-4">
              <Input placeholder="Subject name (e.g. Mathematics)" value={newSubject} onChange={e => setNewSubject(e.target.value)} className="flex-1"
                onKeyDown={e => e.key === "Enter" && addSubject()} />
              <Button size="md" icon={<Plus size={14} />} onClick={addSubject} className="shrink-0">Add</Button>
            </div>
            <div className="space-y-2">
              {subjects.map(sub => (
                <div key={sub.id} className="flex items-center justify-between py-2.5 px-3 bg-surface-2 rounded-xl group">
                  <span className="text-sm font-medium text-white">{sub.name}</span>
                  <button onClick={() => setDeleteTarget({ type: "subject", id: sub.id, name: sub.name })}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-500/10 text-rose-400 rounded-lg transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Helper Panel */}
      <Card className="p-5 border-brand-500/20 bg-brand-500/5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-brand-500/15 rounded-xl text-brand-400 shrink-0"><Lightbulb size={18} /></div>
          <div>
            <h3 className="font-semibold text-white mb-2">Getting Started</h3>
            <ol className="space-y-1.5 text-sm text-white/60 list-decimal list-inside">
              <li>Create your classes first (e.g., "10th Blue", "9th A")</li>
              <li>Add subjects (e.g., Maths, English, Science)</li>
              <li>Go to Students and add students to each class</li>
              <li>Fee records are generated automatically each month</li>
            </ol>
          </div>
        </div>
      </Card>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.type === "class" ? "Class" : "Subject"}`}
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete" danger />
    </div>
  );
}
