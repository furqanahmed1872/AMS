// components/templates/share/StudentCombinedCard.tsx
//
// Single off-screen card captured by html2canvas and shared via WhatsApp.
// Replaces the old StudentScoreCard + StudentAttendanceCard pair.
// No fill/progress bars — all data shown in clean inline tables.

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScoreBySubject {
  subject: string;
  tests: { name: string; obtained: number; total: number }[];
}

export interface AttendanceByMonth {
  month: string; // e.g. "June 2026"
  present: number;
  absent: number;
}

export interface StudentCombinedCardProps {
  academyName: string;
  studentName: string;
  className: string;
  rollNumber: number;
  avgScore: number;
  attendancePercent: number;
  scores: ScoreBySubject[];
  months: AttendanceByMonth[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SUBJECT_COLORS = [
  "#818cf8",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#f472b6",
  "#a78bfa",
];

function scoreColor(pct: number): string {
  if (pct >= 80) return "#4ade80";
  if (pct >= 60) return "#818cf8";
  if (pct >= 33) return "#fbbf24";
  return "#f87171";
}

function attendanceColor(pct: number): string {
  if (pct >= 80) return "#4ade80";
  if (pct >= 60) return "#fbbf24";
  return "#f87171";
}

function grade(pct: number): string {
  if (pct >= 80) return "A";
  if (pct >= 60) return "B";
  if (pct >= 45) return "C";
  if (pct >= 33) return "D";
  return "F";
}

// ─── Shared inline-style constants ────────────────────────────────────────────

const CARD_BASE: React.CSSProperties = {
  position: "fixed",
  top: -9999,
  left: -9999,
  width: 560,
  background: "linear-gradient(145deg, #0f0f1a 0%, #151528 55%, #0f1a2a 100%)",
  borderRadius: 20,
  padding: 28,
  fontFamily: "Inter, system-ui, sans-serif",
  color: "white",
  boxSizing: "border-box",
};

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 8,
};

const TABLE_WRAPPER: React.CSSProperties = {
  borderRadius: 10,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.08)",
  width: "100%",
};

const TH: React.CSSProperties = {
  padding: "7px 10px",
  fontSize: 10,
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  background: "rgba(255,255,255,0.05)",
  textAlign: "left",
  whiteSpace: "nowrap",
};

const TH_RIGHT: React.CSSProperties = { ...TH, textAlign: "right" };

const TD: React.CSSProperties = {
  padding: "7px 10px",
  fontSize: 11,
  color: "#d1d5db",
  borderTop: "1px solid rgba(255,255,255,0.05)",
};

const TD_RIGHT: React.CSSProperties = { ...TD, textAlign: "right" };

const DIVIDER: React.CSSProperties = {
  height: 1,
  background: "rgba(255,255,255,0.07)",
  margin: "20px 0",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function StudentCombinedCard({
  academyName,
  studentName,
  className,
  rollNumber,
  avgScore,
  attendancePercent,
  scores,
  months,
}: StudentCombinedCardProps) {
  const sColor = scoreColor(avgScore);
  const aColor = attendanceColor(attendancePercent);
  const gradeLabel = grade(avgScore);

  const totalObtained = scores.reduce(
    (sum, s) => sum + s.tests.reduce((a, t) => a + t.obtained, 0),
    0,
  );
  const totalMarks = scores.reduce(
    (sum, s) => sum + s.tests.reduce((a, t) => a + t.total, 0),
    0,
  );

  const totalPresent = months.reduce((s, m) => s + m.present, 0);
  const totalAbsent = months.reduce((s, m) => s + m.absent, 0);
  const totalDays = totalPresent + totalAbsent;

  return (
    <div id="student-combined-share-card" style={CARD_BASE}>
      {/* ── Header ──────────────────────────────────────── */}
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
              flexShrink: 0,
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            🎓
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
              {academyName}
            </div>
            <div style={{ fontSize: 10, color: "#9ca3af" }}>
              Student Performance Report
            </div>
          </div>
        </div>
        <div style={{ fontSize: 10, color: "#6b7280" }}>
          {new Date().toLocaleDateString("en-PK", { dateStyle: "medium" })}
        </div>
      </div>

      {/* ── Student info + summary stats ────────────────── */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "14px 16px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        {/* Name + class */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: "white",
              lineHeight: 1.2,
            }}
          >
            {studentName}
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
            {className} · Roll #{rollNumber}
          </div>
        </div>

        {/* Avg Score pill */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: `${sColor}18`,
            border: `1px solid ${sColor}44`,
            borderRadius: 12,
            padding: "10px 16px",
            gap: 3,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: sColor,
              lineHeight: 1,
            }}
          >
            {avgScore}%
          </div>
          <div
            style={{
              fontSize: 9,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Avg Score
          </div>
        </div>

        {/* Grade circle */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            flexShrink: 0,
            background: `${sColor}22`,
            border: `2px solid ${sColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 900,
            color: sColor,
          }}
        >
          {gradeLabel}
        </div>

        {/* Attendance pill */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: `${aColor}18`,
            border: `1px solid ${aColor}44`,
            borderRadius: 12,
            padding: "10px 16px",
            gap: 3,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: aColor,
              lineHeight: 1,
            }}
          >
            {attendancePercent}%
          </div>
          <div
            style={{
              fontSize: 9,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Attendance
          </div>
        </div>
      </div>

      {/* ══ SECTION 1 — TEST SCORES ══════════════════════ */}
      {scores.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={SECTION_LABEL}>📝 Test Scores</div>

          {/* Subject totals table */}
          <div style={{ ...TABLE_WRAPPER, marginBottom: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={TH}>Subject</th>
                  <th style={{ ...TH_RIGHT, width: 40 }}>Tests</th>
                  <th style={{ ...TH_RIGHT, width: 70 }}>Obtained</th>
                  <th style={{ ...TH_RIGHT, width: 50 }}>Total</th>
                  <th style={{ ...TH_RIGHT, width: 44 }}>Avg %</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((s, idx) => {
                  const ob = s.tests.reduce((a, t) => a + t.obtained, 0);
                  const tot = s.tests.reduce((a, t) => a + t.total, 0);
                  const pct = tot > 0 ? Math.round((ob / tot) * 100) : 0;
                  const col = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
                  return (
                    <tr key={s.subject}>
                      <td style={TD}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <div
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background: col,
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ color: "#e5e7eb" }}>{s.subject}</span>
                        </div>
                      </td>
                      <td style={{ ...TD_RIGHT, color: "#9ca3af" }}>
                        {s.tests.length}
                      </td>
                      <td
                        style={{
                          ...TD_RIGHT,
                          color: "#e5e7eb",
                          fontWeight: 600,
                        }}
                      >
                        {ob}
                      </td>
                      <td style={{ ...TD_RIGHT, color: "#6b7280" }}>{tot}</td>
                      <td
                        style={{
                          ...TD_RIGHT,
                          fontWeight: 700,
                          color: scoreColor(pct),
                        }}
                      >
                        {pct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Totals footer */}
              <tfoot>
                <tr>
                  <td
                    style={{
                      ...TD,
                      color: "#9ca3af",
                      fontWeight: 600,
                      borderTop: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    Overall
                  </td>
                  <td
                    style={{
                      ...TD_RIGHT,
                      color: "#9ca3af",
                      borderTop: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    {scores.reduce((s, sub) => s + sub.tests.length, 0)}
                  </td>
                  <td
                    style={{
                      ...TD_RIGHT,
                      color: "#e5e7eb",
                      fontWeight: 700,
                      borderTop: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    {totalObtained}
                  </td>
                  <td
                    style={{
                      ...TD_RIGHT,
                      color: "#6b7280",
                      borderTop: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    {totalMarks}
                  </td>
                  <td
                    style={{
                      ...TD_RIGHT,
                      fontWeight: 800,
                      color: sColor,
                      borderTop: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    {avgScore}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Per-subject individual test rows */}
          {scores.map((s, idx) => {
            const col = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
            return (
              <div key={s.subject} style={{ marginBottom: 10 }}>
                {/* Subject header row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 10px",
                    background: `${col}12`,
                    borderRadius: "8px 8px 0 0",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: col,
                    }}
                  />
                  <span style={{ fontSize: 11, fontWeight: 700, color: col }}>
                    {s.subject}
                  </span>
                </div>
                {/* Tests table */}
                <div
                  style={{
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderTop: "none",
                    borderRadius: "0 0 8px 8px",
                    overflow: "hidden",
                  }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th
                          style={{
                            ...TH,
                            background: "rgba(255,255,255,0.03)",
                          }}
                        >
                          Test
                        </th>
                        <th
                          style={{
                            ...TH_RIGHT,
                            background: "rgba(255,255,255,0.03)",
                            width: 70,
                          }}
                        >
                          Obtained
                        </th>
                        <th
                          style={{
                            ...TH_RIGHT,
                            background: "rgba(255,255,255,0.03)",
                            width: 50,
                          }}
                        >
                          Total
                        </th>
                        <th
                          style={{
                            ...TH_RIGHT,
                            background: "rgba(255,255,255,0.03)",
                            width: 44,
                          }}
                        >
                          %
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {s.tests.map((t) => {
                        const pct =
                          t.total > 0
                            ? Math.round((t.obtained / t.total) * 100)
                            : 0;
                        return (
                          <tr key={t.name}>
                            <td style={{ ...TD, color: "#d1d5db" }}>
                              {t.name}
                            </td>
                            <td
                              style={{
                                ...TD_RIGHT,
                                fontWeight: 600,
                                color: "#e5e7eb",
                              }}
                            >
                              {t.obtained}
                            </td>
                            <td style={{ ...TD_RIGHT, color: "#6b7280" }}>
                              {t.total}
                            </td>
                            <td
                              style={{
                                ...TD_RIGHT,
                                fontWeight: 700,
                                color: scoreColor(pct),
                              }}
                            >
                              {pct}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Divider */}
      {scores.length > 0 && months.length > 0 && <div style={DIVIDER} />}

      {/* ══ SECTION 2 — ATTENDANCE ═══════════════════════ */}
      {months.length > 0 && (
        <div>
          <div style={SECTION_LABEL}>📋 Monthly Attendance</div>

          <div style={TABLE_WRAPPER}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={TH}>Month</th>
                  <th style={{ ...TH_RIGHT, width: 60 }}>Present</th>
                  <th style={{ ...TH_RIGHT, width: 56 }}>Absent</th>
                  <th style={{ ...TH_RIGHT, width: 60 }}>Total Days</th>
                  <th style={{ ...TH_RIGHT, width: 44 }}>%</th>
                </tr>
              </thead>
              <tbody>
                {months.map((m, i) => {
                  const total = m.present + m.absent;
                  const pct =
                    total > 0 ? Math.round((m.present / total) * 100) : 0;
                  return (
                    <tr key={i}>
                      <td style={{ ...TD, color: "#e5e7eb" }}>{m.month}</td>
                      <td
                        style={{
                          ...TD_RIGHT,
                          color: "#4ade80",
                          fontWeight: 600,
                        }}
                      >
                        {m.present}
                      </td>
                      <td
                        style={{
                          ...TD_RIGHT,
                          color: "#f87171",
                          fontWeight: 600,
                        }}
                      >
                        {m.absent}
                      </td>
                      <td style={{ ...TD_RIGHT, color: "#9ca3af" }}>{total}</td>
                      <td
                        style={{
                          ...TD_RIGHT,
                          fontWeight: 700,
                          color: attendanceColor(pct),
                        }}
                      >
                        {pct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Totals footer */}
              <tfoot>
                <tr>
                  <td
                    style={{
                      ...TD,
                      color: "#9ca3af",
                      fontWeight: 600,
                      borderTop: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    Total
                  </td>
                  <td
                    style={{
                      ...TD_RIGHT,
                      color: "#4ade80",
                      fontWeight: 700,
                      borderTop: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    {totalPresent}
                  </td>
                  <td
                    style={{
                      ...TD_RIGHT,
                      color: "#f87171",
                      fontWeight: 700,
                      borderTop: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    {totalAbsent}
                  </td>
                  <td
                    style={{
                      ...TD_RIGHT,
                      color: "#9ca3af",
                      borderTop: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    {totalDays}
                  </td>
                  <td
                    style={{
                      ...TD_RIGHT,
                      fontWeight: 800,
                      color: aColor,
                      borderTop: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    {attendancePercent}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────── */}
      <div
        style={{
          marginTop: 20,
          paddingTop: 14,
          borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 10, color: "#4b5563" }}>
          Academy Management System
        </span>
        <span style={{ fontSize: 10, color: "#4b5563" }}>
          {new Date().toLocaleDateString("en-PK", { dateStyle: "medium" })}
        </span>
      </div>
    </div>
  );
}
