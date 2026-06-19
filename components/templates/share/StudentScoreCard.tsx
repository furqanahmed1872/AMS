// components/templates/share/StudentScoreCard.tsx

interface ScoreBySubject {
  subject: string;
  tests: { name: string; obtained: number; total: number }[];
}

interface StudentScoreCardProps {
  academyName: string;
  studentName: string;
  className: string;
  rollNumber: number;
  avgScore: number;
  scores: ScoreBySubject[];
}

const SUBJECT_COLORS = ["#818cf8","#06b6d4","#10b981","#f59e0b","#f472b6","#a78bfa"];

export function StudentScoreCard({
  academyName,
  studentName,
  className,
  rollNumber,
  avgScore,
  scores,
}: StudentScoreCardProps) {
  const gradeColor = avgScore >= 80 ? "#4ade80" : avgScore >= 60 ? "#818cf8" : avgScore >= 33 ? "#fbbf24" : "#f87171";
  const grade = avgScore >= 80 ? "A" : avgScore >= 60 ? "B" : avgScore >= 45 ? "C" : avgScore >= 33 ? "D" : "F";

  return (
    <div
      id="student-score-share-card"
      style={{
        position: "fixed",
        top: -9999,
        left: -9999,
        width: 480,
        background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a35 100%)",
        borderRadius: 20,
        padding: 28,
        fontFamily: "Inter, system-ui, sans-serif",
        color: "white",
        border: "1px solid rgba(129,140,248,0.3)",
      }}
    >
      {/* Academy header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "linear-gradient(135deg, #6366f1, #4f46e5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 800,
        }}>
          🎓
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{academyName}</div>
          <div style={{ fontSize: 10, color: "#9ca3af" }}>Student Result Card</div>
        </div>
      </div>

      {/* Student info */}
      <div style={{
        background: "rgba(255,255,255,0.05)",
        borderRadius: 14,
        padding: "14px 16px",
        marginBottom: 16,
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 2 }}>{studentName}</div>
        <div style={{ fontSize: 12, color: "#9ca3af" }}>{className} · Roll #{rollNumber}</div>
      </div>

      {/* Overall score */}
      <div style={{
        background: "rgba(99,102,241,0.15)",
        border: "1px solid rgba(99,102,241,0.3)",
        borderRadius: 14,
        padding: "16px 20px",
        marginBottom: 16,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>Overall Average</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: gradeColor }}>{avgScore}%</div>
        </div>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: `${gradeColor}22`,
          border: `2px solid ${gradeColor}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, fontWeight: 900, color: gradeColor,
        }}>
          {grade}
        </div>
      </div>

      {/* Subject breakdown */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
          Subject Breakdown
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {scores.map((s, idx) => {
            const total = s.tests.reduce((a, t) => a + t.total, 0);
            const obtained = s.tests.reduce((a, t) => a + t.obtained, 0);
            const pct = total > 0 ? Math.round((obtained / total) * 100) : 0;
            const color = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
            return (
              <div key={s.subject}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                    <span style={{ fontSize: 12, color: "#e5e7eb" }}>{s.subject}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>{obtained}/{total}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color }}>{pct}%</span>
                  </div>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 9999, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 9999 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.08)",
        paddingTop: 12,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span style={{ fontSize: 10, color: "#6b7280" }}>
          {new Date().toLocaleDateString("en-PK", { dateStyle: "medium" })}
        </span>
        <span style={{ fontSize: 10, color: "#6b7280" }}>Academy Management System</span>
      </div>
    </div>
  );
}
