"use client";
import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { useAcademyData } from "@/lib/academy-data/provider";
import { getTestResultsAction, type ResultRow } from "@/lib/tests/actions";
import { Trophy, Users, TrendingUp, Award, Play } from "lucide-react";

const gradeColor = (pct: number) =>
  pct >= 80
    ? "text-emerald-400"
    : pct >= 60
      ? "text-brand-400"
      : pct >= 33
        ? "text-amber-400"
        : "text-rose-400";

const grade = (pct: number) =>
  pct >= 80 ? "A" : pct >= 60 ? "B" : pct >= 45 ? "C" : pct >= 33 ? "D" : "F";

export default function ResultsPage() {
  const { tests } = useAcademyData();

  const testOptions = tests.map((t) => ({
    value: t.id,
    label: `${t.name} · ${t.subject} · ${t.class}`,
  }));

  const [selectedTest, setSelectedTest] = useState("");
  const [results, setResults] = useState<ResultRow[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!selectedTest) return;
    setLoading(true);
    const data = await getTestResultsAction(selectedTest);
    // Sort: non-absent by marks desc, absent at bottom
    const sorted = [...data].sort((a, b) => {
      if (a.isAbsent && !b.isAbsent) return 1;
      if (!a.isAbsent && b.isAbsent) return -1;
      return (b.marks ?? 0) - (a.marks ?? 0);
    });
    setResults(sorted);
    setLoading(false);
  };

  const nonAbsent = (results ?? []).filter((r) => !r.isAbsent);
  const absentStudents = (results ?? []).filter((r) => r.isAbsent);

  const avg = nonAbsent.length
    ? Math.round(
        nonAbsent.reduce(
          (s, r) => s + ((r.marks ?? 0) / r.totalMarks) * 100,
          0,
        ) / nonAbsent.length,
      )
    : 0;
  const highest = nonAbsent.length
    ? Math.max(...nonAbsent.map((r) => r.marks ?? 0))
    : 0;
  const totalMarks = results?.[0]?.totalMarks ?? 0;
  const passed = nonAbsent.filter(
    (r) => ((r.marks ?? 0) / r.totalMarks) * 100 >= 33,
  ).length;

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Results"
        subtitle="Test result summaries and rankings"
      />

      <Card className="p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <Select
            label="Select Test"
            options={testOptions}
            value={selectedTest}
            onChange={(e) => {
              setSelectedTest(e.target.value);
              setResults(null);
            }}
            placeholder="Choose a test..."
          />
        </div>
        <Button
          icon={<Play size={14} />}
          onClick={handleGenerate}
          disabled={!selectedTest}
          loading={loading}
        >
          Generate Result
        </Button>
      </Card>

      {results !== null && (
        <div className="space-y-5 animate-fade-in">
          {/* Summary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Students"
              value={nonAbsent.length}
              icon={<Users size={18} />}
              accentColor="text-white/70"
            />
            <StatCard
              label="Class Average"
              value={`${avg}%`}
              icon={<TrendingUp size={18} />}
              accentColor="text-brand-400"
            />
            <StatCard
              label="Highest Marks"
              value={`${highest}/${totalMarks}`}
              icon={<Trophy size={18} />}
              accentColor="text-amber-400"
            />
            <StatCard
              label="Passed (≥33%)"
              value={passed}
              icon={<Award size={18} />}
              accentColor="text-emerald-400"
            />
          </div>

          {results.length === 0 ? (
            <Card className="p-10 text-center text-white/30 text-sm">
              No marks entered for this test yet.
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-white/8">
                <h3 className="section-title">Student Rankings</h3>
              </div>
              <div className="divide-y divide-white/5">
                {nonAbsent.map((result, i) => {
                  const pct = Math.round(
                    ((result.marks ?? 0) / result.totalMarks) * 100,
                  );
                  return (
                    <div
                      key={result.studentId}
                      className="flex items-center gap-4 px-4 py-3"
                    >
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          i === 0
                            ? "bg-amber-500/20 text-amber-400"
                            : i === 1
                              ? "bg-white/10 text-white/60"
                              : i === 2
                                ? "bg-orange-500/10 text-orange-400"
                                : "text-white/30"
                        }`}
                      >
                        {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                      </span>
                      <Avatar name={result.name} size="sm" />
                      <span className="flex-1 text-sm font-medium text-white">
                        {result.name}
                      </span>
                      <span className="text-sm text-white/60">
                        {result.marks}/{result.totalMarks}
                      </span>
                      <span
                        className={`text-sm font-bold w-12 text-right ${gradeColor(pct)}`}
                      >
                        {pct}%
                      </span>
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${gradeColor(pct)} bg-white/5`}
                      >
                        {grade(pct)}
                      </span>
                      <Badge variant={pct >= 33 ? "active" : "unpaid"}>
                        {pct >= 33 ? "Pass" : "Fail"}
                      </Badge>
                    </div>
                  );
                })}

                {/* Absent students at the bottom */}
                {absentStudents.map((result) => (
                  <div
                    key={result.studentId}
                    className="flex items-center gap-4 px-4 py-3 opacity-50"
                  >
                    <span className="w-7 shrink-0" />
                    <Avatar name={result.name} size="sm" />
                    <span className="flex-1 text-sm text-white/50">
                      {result.name}
                    </span>
                    <Badge variant="not_set">Absent</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
