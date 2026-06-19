// components/templates/share/StudentAttendanceCard.tsx

interface AttendanceByMonth {
  month: string;
  present: number;
  absent: number;
}

interface StudentAttendanceCardProps {
  academyName: string;
  studentName: string;
  className: string;
  rollNumber: number;
  attendancePercent: number;
  months: AttendanceByMonth[];
}

export function StudentAttendanceCard({
  academyName,
  studentName,
  className,
  rollNumber,
  attendancePercent,
  months,
}: StudentAttendanceCardProps) {
  const color = attendancePercent >= 80 ? "#4ade80" : attendancePercent >= 60 ? "#fbbf24" : "#f87171";
  const label = attendancePercent >= 80 ? "Excellent" : attendancePercent >= 60 ? "Average" : "Poor";

  return (
    <div
      id="student-attendance-share-card"
      style={{
        position: "fixed",
        top: -9999,
        left: -9999,
        width: 480,
        background: "linear-gradient(135deg, #0f0f1a 0%, #0d1f2d 100%)",
        borderRadius: 20,
        padding: 28,
        fontFamily: "Inter, system-ui, sans-serif",
        color: "white",
        border: "1px solid rgba(6,182,212,0.3)",
      }}
    >
      {/* Academy header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "linear-gradient(135deg, #0891b2, #0e7490)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16,
        }}>
          📋
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{academyName}</div>
          <div style={{ fontSize: 10, color: "#9ca3af" }}>Attendance Report</div>
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

      {/* Overall attendance */}
      <div style={{
        background: `${color}18`,
        border: `1px solid ${color}44`,
        borderRadius: 14,
        padding: "16px 20px",
        marginBottom: 16,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>Overall Attendance</div>
          <div style={{ fontSize: 32, fontWeight: 900, color }}>{attendancePercent}%</div>
        </div>
        <div style={{
          background: `${color}22`,
          border: `2px solid ${color}`,
          borderRadius: 12,
          padding: "8px 14px",
          fontSize: 13, fontWeight: 700, color,
        }}>
          {label}
        </div>
      </div>

      {/* Monthly breakdown */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
          Monthly Breakdown
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {months.slice(-6).map((m) => {
            const total = m.present + m.absent;
            const pct = total > 0 ? Math.round((m.present / total) * 100) : 0;
            const barColor = pct >= 80 ? "#4ade80" : pct >= 60 ? "#fbbf24" : "#f87171";
            return (
              <div key={m.month} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11, color: "#9ca3af", minWidth: 80 }}>{m.month}</span>
                <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 9999, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 9999 }} />
                </div>
                <div style={{ display: "flex", gap: 8, minWidth: 100, justifyContent: "flex-end" }}>
                  <span style={{ fontSize: 10, color: "#4ade80" }}>{m.present}P</span>
                  <span style={{ fontSize: 10, color: "#f87171" }}>{m.absent}A</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: barColor }}>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
        {months.length > 6 && (
          <div style={{ fontSize: 10, color: "#6b7280", marginTop: 6 }}>
            Showing last 6 months of {months.length} total
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.08)",
        paddingTop: 12,
        display: "flex",
        justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 10, color: "#6b7280" }}>
          {new Date().toLocaleDateString("en-PK", { dateStyle: "medium" })}
        </span>
        <span style={{ fontSize: 10, color: "#6b7280" }}>Academy Management System</span>
      </div>
    </div>
  );
}
