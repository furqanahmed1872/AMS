// components/templates/share/StudentAnalyticsCard.tsx
// Comprehensive analytics card — combines subject scores + attendance
// into one shareable image for WhatsApp.

interface ScoreBySubject {
  subject: string;
  tests: { name: string; obtained: number; total: number }[];
}

interface AttendanceByMonth {
  month: string;
  present: number;
  absent: number;
}

interface StudentAnalyticsCardProps {
  academyName: string;
  studentName: string;
  className: string;
  rollNumber: number;
  avgScore: number;
  attendancePercent: number;
  totalTests: number;
  scores: ScoreBySubject[];
  months: AttendanceByMonth[];
}

const SUBJECT_COLORS = [
  "#818cf8",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#f472b6",
  "#a78bfa",
];

export function StudentAnalyticsCard({
  academyName,
  studentName,
  className,
  rollNumber,
  avgScore,
  attendancePercent,
  totalTests,
  scores,
  months,
}: StudentAnalyticsCardProps) {
  const scoreColor =
    avgScore >= 80
      ? "#4ade80"
      : avgScore >= 60
        ? "#818cf8"
        : avgScore >= 33
          ? "#fbbf24"
          : "#f87171";
  const attColor =
    attendancePercent >= 80
      ? "#4ade80"
      : attendancePercent >= 60
        ? "#fbbf24"
        : "#f87171";
  const grade =
    avgScore >= 80
      ? "A"
      : avgScore >= 60
        ? "B"
        : avgScore >= 45
          ? "C"
          : avgScore >= 33
            ? "D"
            : "F";

  const recentMonths = months.slice(-5);

  return (
    <div
      id="student-analytics-share-card"
      style={{
        position: "fixed",
        top: -9999,
        left: -9999,
        width: 520,
        background:
          "linear-gradient(145deg, #0f0f1a 0%, #151528 50%, #0f1a2a 100%)",
        borderRadius: 20,
        padding: 28,
        fontFamily: "Inter, system-ui, sans-serif",
        color: "white",
        border: "1px solid rgba(129,140,248,0.2)",
        boxSizing: "border-box",
      }}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            📊
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "white" }}>
              {academyName}
            </div>
            <div style={{ fontSize: 10, color: "#9ca3af" }}>
              Student Analytics Report
            </div>
          </div>
        </div>
        <div style={{ fontSize: 10, color: "#6b7280" }}>
          {new Date().toLocaleDateString("en-PK", { dateStyle: "medium" })}
        </div>
      </div>

      {/* ── Student Info ────────────────────────────────── */}
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          borderRadius: 14,
          padding: "12px 16px",
          marginBottom: 16,
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "white" }}>
            {studentName}
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
            {className} · Roll #{rollNumber}
          </div>
        </div>
        {/* Grade badge */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: `${scoreColor}22`,
            border: `2px solid ${scoreColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 900,
            color: scoreColor,
          }}
        >
          {grade}
        </div>
      </div>

      {/* ── 3 Stat Boxes ────────────────────────────────── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        {[
          {
            label: "Avg Score",
            value: `${avgScore}%`,
            color: scoreColor,
            bg: `${scoreColor}18`,
          },
          {
            label: "Attendance",
            value: `${attendancePercent}%`,
            color: attColor,
            bg: `${attColor}18`,
          },
          {
            label: "Tests Taken",
            value: String(totalTests),
            color: "#818cf8",
            bg: "rgba(129,140,248,0.15)",
          },
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            style={{
              flex: 1,
              background: bg,
              border: `1px solid ${color}33`,
              borderRadius: 12,
              padding: "12px 8px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 900, color }}>{value}</div>
            <div
              style={{
                fontSize: 9,
                color: "#9ca3af",
                marginTop: 3,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Subject Performance ──────────────────────────── */}
      {scores.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 10,
            }}
          >
            Subject Performance
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {scores.map((s, idx) => {
              const total = s.tests.reduce((a, t) => a + t.total, 0);
              const obtained = s.tests.reduce((a, t) => a + t.obtained, 0);
              const pct = total > 0 ? Math.round((obtained / total) * 100) : 0;
              const color = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
              return (
                <div key={s.subject}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <div
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: color,
                        }}
                      />
                      <span style={{ fontSize: 11, color: "#e5e7eb" }}>
                        {s.subject}
                      </span>
                      <span style={{ fontSize: 10, color: "#6b7280" }}>
                        ({s.tests.length} tests)
                      </span>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <span style={{ fontSize: 10, color: "#6b7280" }}>
                        {obtained}/{total}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color,
                          background: `${color}22`,
                          padding: "1px 6px",
                          borderRadius: 6,
                        }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      height: 5,
                      background: "rgba(255,255,255,0.07)",
                      borderRadius: 9999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: color,
                        borderRadius: 9999,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Monthly Attendance ───────────────────────────── */}
      {recentMonths.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 10,
            }}
          >
            Monthly Attendance{months.length > 5 ? " (Last 5 months)" : ""}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {recentMonths.map((m) => {
              const total = m.present + m.absent;
              const pct = total > 0 ? Math.round((m.present / total) * 100) : 0;
              const barColor =
                pct >= 80 ? "#4ade80" : pct >= 60 ? "#fbbf24" : "#f87171";
              return (
                <div
                  key={m.month}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <span
                    style={{ fontSize: 10, color: "#9ca3af", minWidth: 72 }}
                  >
                    {m.month.split(" ")[0].slice(0, 3)}{" "}
                    {m.month.split(" ")[1]?.slice(2)}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 5,
                      background: "rgba(255,255,255,0.07)",
                      borderRadius: 9999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: barColor,
                        borderRadius: 9999,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      color: "#6b7280",
                      minWidth: 56,
                      textAlign: "right",
                    }}
                  >
                    {m.present}P / {m.absent}A
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: barColor,
                      minWidth: 30,
                      textAlign: "right",
                    }}
                  >
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────── */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          paddingTop: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 9, color: "#4b5563" }}>
          Academy Management System
        </span>
        <span style={{ fontSize: 9, color: "#4b5563" }}>
          Shared by {academyName}
        </span>
      </div>
    </div>
  );
}
