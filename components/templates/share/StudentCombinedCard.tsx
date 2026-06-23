// components/templates/share/StudentCombinedCard.tsx
// Off-screen card captured by html2canvas and shared via WhatsApp.
// Scores table:     rows = subjects,     columns = test names
// Attendance table: rows = Present/Absent/%, columns = months

export interface ScoreBySubject {
  subject: string;
  tests: { name: string; obtained: number; total: number }[];
}

export interface AttendanceByMonth {
  month: string;
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

// ─── Colour helpers ────────────────────────────────────────────────────────────

function scoreHex(pct: number): string {
  if (pct >= 75) return "#4ade80";
  if (pct >= 50) return "#818cf8";
  if (pct >= 33) return "#fbbf24";
  return "#f87171";
}

function attHex(pct: number): string {
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

// ─── Inline-style constants ────────────────────────────────────────────────────

const CARD: React.CSSProperties = {
  position: "fixed",
  top: -9999,
  left: -9999,
  width: 700,
  background: "linear-gradient(145deg,#0f0f1a 0%,#151528 55%,#0f1a2a 100%)",
  borderRadius: 20,
  padding: 28,
  fontFamily: "Inter,system-ui,sans-serif",
  color: "white",
  boxSizing: "border-box",
};

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "#6b7280",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  marginBottom: 8,
};

const TABLE: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse" as const,
  fontSize: 11,
};

const TH_BASE: React.CSSProperties = {
  padding: "7px 10px",
  fontSize: 10,
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  background: "rgba(255,255,255,0.05)",
  whiteSpace: "nowrap" as const,
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const TH_LEFT: React.CSSProperties = { ...TH_BASE, textAlign: "left" };
const TH_CENTER: React.CSSProperties = { ...TH_BASE, textAlign: "center" };

const TD_BASE: React.CSSProperties = {
  padding: "7px 10px",
  borderTop: "1px solid rgba(255,255,255,0.05)",
};

const TD_LABEL: React.CSSProperties = {
  ...TD_BASE,
  textAlign: "left",
  color: "#d1d5db",
  fontWeight: 600,
  whiteSpace: "nowrap" as const,
  borderRight: "1px solid rgba(255,255,255,0.07)",
  background: "rgba(255,255,255,0.02)",
};

const TD_CENTER: React.CSSProperties = { ...TD_BASE, textAlign: "center" };

const TD_TOTAL: React.CSSProperties = {
  ...TD_CENTER,
  borderLeft: "1px solid rgba(255,255,255,0.07)",
  background: "rgba(255,255,255,0.02)",
};

const TH_LABEL: React.CSSProperties = {
  ...TH_LEFT,
  borderRight: "1px solid rgba(255,255,255,0.07)",
};
const TH_TOTAL: React.CSSProperties = {
  ...TH_CENTER,
  borderLeft: "1px solid rgba(255,255,255,0.07)",
};

const DIVIDER: React.CSSProperties = {
  height: 1,
  background: "rgba(255,255,255,0.07)",
  margin: "20px 0",
};

const TABLE_WRAP: React.CSSProperties = {
  borderRadius: 10,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.08)",
};

// ─── Component ─────────────────────────────────────────────────────────────────

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
  const sHex = scoreHex(avgScore);
  const aHex = attHex(attendancePercent);
  const gradeLabel = grade(avgScore);

  // ── Scores: collect all unique test names (column headers) ──────────────────
  const allTestNames = Array.from(
    new Set(scores.flatMap((s) => s.tests.map((t) => t.name))),
  );

  // ── Attendance: month labels (column headers) ───────────────────────────────
  // Shorten "January 2025" → "Jan 25"
  const shortMonth = (m: string) =>
    m.replace(/^(\w{3})\w*\s(\d{2})\d{2}$/, "$1 '$2") || m.slice(0, 6);

  const totalPresent = months.reduce((s, m) => s + m.present, 0);
  const totalAbsent = months.reduce((s, m) => s + m.absent, 0);
  const totalDays = totalPresent + totalAbsent;

  return (
    <div id="student-combined-share-card" style={CARD}>
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
              width: 36,
              height: 36,
              borderRadius: 9,
              flexShrink: 0,
              background: "linear-gradient(135deg,#6366f1,#4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
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

      {/* ── Student summary bar ─────────────────────────── */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "12px 16px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "white" }}>
            {studentName}
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>
            {className} · Roll #{rollNumber}
          </div>
        </div>
        {/* Score pill */}
        <div
          style={{
            background: `${sHex}18`,
            border: `1px solid ${sHex}44`,
            borderRadius: 10,
            padding: "8px 14px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: sHex,
              lineHeight: 1,
            }}
          >
            {avgScore}%
          </div>
          <div
            style={{
              fontSize: 9,
              color: "#9ca3af",
              marginTop: 2,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Avg Score
          </div>
        </div>
        {/* Grade */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            flexShrink: 0,
            background: `${sHex}22`,
            border: `2px solid ${sHex}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 900,
            color: sHex,
          }}
        >
          {gradeLabel}
        </div>
        {/* Attendance pill */}
        <div
          style={{
            background: `${aHex}18`,
            border: `1px solid ${aHex}44`,
            borderRadius: 10,
            padding: "8px 14px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: aHex,
              lineHeight: 1,
            }}
          >
            {attendancePercent}%
          </div>
          <div
            style={{
              fontSize: 9,
              color: "#9ca3af",
              marginTop: 2,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Attendance
          </div>
        </div>
      </div>

      {/* ══ TEST SCORES ═════════════════════════════════════════════════════
          Rows = subjects
          Columns = test names  |  last col = Avg %
      ═══════════════════════════════════════════════════════════════════ */}
      {scores.length > 0 && allTestNames.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={SECTION_LABEL}>📝 Test Scores</div>
          <div style={TABLE_WRAP}>
            <table style={TABLE}>
              <thead>
                <tr>
                  <th style={{ ...TH_LABEL, minWidth: 90 }}>Subject</th>
                  {allTestNames.map((name) => (
                    <th key={name} style={{ ...TH_CENTER, minWidth: 64 }}>
                      {name}
                    </th>
                  ))}
                  <th style={{ ...TH_TOTAL, minWidth: 56 }}>Avg %</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((s) => {
                  const testMap = new Map(s.tests.map((t) => [t.name, t]));
                  const ob = s.tests.reduce((a, t) => a + t.obtained, 0);
                  const tot = s.tests.reduce((a, t) => a + t.total, 0);
                  const avg = tot > 0 ? Math.round((ob / tot) * 100) : 0;
                  return (
                    <tr key={s.subject}>
                      <td style={{ ...TD_LABEL }}>{s.subject}</td>
                      {allTestNames.map((name) => {
                        const t = testMap.get(name);
                        if (!t)
                          return (
                            <td
                              key={name}
                              style={{ ...TD_CENTER, color: "#374151" }}
                            >
                              —
                            </td>
                          );
                        const pct =
                          t.total > 0
                            ? Math.round((t.obtained / t.total) * 100)
                            : 0;
                        return (
                          <td key={name} style={TD_CENTER}>
                            <span style={{ fontWeight: 600, color: "#e5e7eb" }}>
                              {t.obtained}
                            </span>
                            <span style={{ color: "#6b7280", fontSize: 9 }}>
                              /{t.total}
                            </span>
                            <br />
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: scoreHex(pct),
                              }}
                            >
                              {pct}%
                            </span>
                          </td>
                        );
                      })}
                      <td style={TD_TOTAL}>
                        <span
                          style={{
                            fontWeight: 800,
                            color: scoreHex(avg),
                            fontSize: 12,
                          }}
                        >
                          {avg}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Overall footer */}
              <tfoot>
                <tr
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <td style={{ ...TD_LABEL, color: "#9ca3af", fontSize: 10 }}>
                    Overall
                  </td>
                  {allTestNames.map((name) => {
                    let ob = 0,
                      tot = 0;
                    for (const s of scores) {
                      const t = s.tests.find((t) => t.name === name);
                      if (t) {
                        ob += t.obtained;
                        tot += t.total;
                      }
                    }
                    const pct = tot > 0 ? Math.round((ob / tot) * 100) : null;
                    return (
                      <td key={name} style={TD_CENTER}>
                        {pct !== null ? (
                          <span
                            style={{
                              fontWeight: 700,
                              color: scoreHex(pct),
                              fontSize: 10,
                            }}
                          >
                            {pct}%
                          </span>
                        ) : (
                          <span style={{ color: "#374151" }}>—</span>
                        )}
                      </td>
                    );
                  })}
                  <td style={TD_TOTAL}>
                    <span
                      style={{ fontWeight: 900, color: sHex, fontSize: 13 }}
                    >
                      {avgScore}%
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {scores.length > 0 && months.length > 0 && <div style={DIVIDER} />}

      {/* ══ ATTENDANCE ══════════════════════════════════════════════════════
          Rows = Present / Absent / Total Days / %
          Columns = months  |  last col = Total
      ═══════════════════════════════════════════════════════════════════ */}
      {months.length > 0 && (
        <div>
          <div style={SECTION_LABEL}>📋 Attendance</div>
          <div style={TABLE_WRAP}>
            <table style={TABLE}>
              <thead>
                <tr>
                  <th style={{ ...TH_LABEL, minWidth: 80 }}>&nbsp;</th>
                  {months.map((m) => (
                    <th key={m.month} style={{ ...TH_CENTER, minWidth: 52 }}>
                      {shortMonth(m.month)}
                    </th>
                  ))}
                  <th style={{ ...TH_TOTAL, minWidth: 52 }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {/* Present row */}
                <tr>
                  <td style={{ ...TD_LABEL, color: "#4ade80" }}>Present</td>
                  {months.map((m) => (
                    <td
                      key={m.month}
                      style={{
                        ...TD_CENTER,
                        color: "#4ade80",
                        fontWeight: 600,
                      }}
                    >
                      {m.present}
                    </td>
                  ))}
                  <td
                    style={{ ...TD_TOTAL, color: "#4ade80", fontWeight: 700 }}
                  >
                    {totalPresent}
                  </td>
                </tr>
                {/* Absent row */}
                <tr>
                  <td style={{ ...TD_LABEL, color: "#f87171" }}>Absent</td>
                  {months.map((m) => (
                    <td
                      key={m.month}
                      style={{
                        ...TD_CENTER,
                        color: "#f87171",
                        fontWeight: 600,
                      }}
                    >
                      {m.absent}
                    </td>
                  ))}
                  <td
                    style={{ ...TD_TOTAL, color: "#f87171", fontWeight: 700 }}
                  >
                    {totalAbsent}
                  </td>
                </tr>
                {/* Total Days row */}
                <tr>
                  <td style={{ ...TD_LABEL, color: "#9ca3af" }}>Days</td>
                  {months.map((m) => (
                    <td
                      key={m.month}
                      style={{ ...TD_CENTER, color: "#9ca3af" }}
                    >
                      {m.present + m.absent}
                    </td>
                  ))}
                  <td
                    style={{ ...TD_TOTAL, color: "#9ca3af", fontWeight: 700 }}
                  >
                    {totalDays}
                  </td>
                </tr>
                {/* % row */}
                <tr>
                  <td style={{ ...TD_LABEL, color: "#d1d5db" }}>%</td>
                  {months.map((m) => {
                    const total = m.present + m.absent;
                    const pct =
                      total > 0 ? Math.round((m.present / total) * 100) : 0;
                    return (
                      <td key={m.month} style={TD_CENTER}>
                        <span
                          style={{
                            fontWeight: 700,
                            color: attHex(pct),
                            fontSize: 12,
                          }}
                        >
                          {pct}%
                        </span>
                      </td>
                    );
                  })}
                  <td style={TD_TOTAL}>
                    <span
                      style={{ fontWeight: 900, color: aHex, fontSize: 13 }}
                    >
                      {attendancePercent}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────── */}
      <div
        style={{
          marginTop: 20,
          paddingTop: 12,
          borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 10, color: "#374151" }}>
          Academy Management System
        </span>
        <span style={{ fontSize: 10, color: "#374151" }}>
          {new Date().toLocaleDateString("en-PK", { dateStyle: "medium" })}
        </span>
      </div>
    </div>
  );
}
