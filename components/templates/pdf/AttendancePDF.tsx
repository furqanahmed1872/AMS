// components/templates/pdf/AttendancePDF.tsx
// Hidden element captured by html2canvas for PDF export.
// Render this in the DOM, then call exportElementAsPDF("attendance-pdf-template", ...)

interface AttendancePDFProps {
  academyName: string;
  className: string;
  monthLabel: string;
  daysInMonth: number;
  rows: {
    rollNumber: number;
    name: string;
    feeStatus: "paid" | "unpaid" | "not_set";
    days: Record<number, "P" | "A" | "L">;
  }[];
}

export function AttendancePDF({
  academyName,
  className,
  monthLabel,
  daysInMonth,
  rows,
}: AttendancePDFProps) {
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const cellStyle: React.CSSProperties = {
    border: "1px solid #2a2a4a",
    padding: "4px 3px",
    textAlign: "center",
    fontSize: 10,
    minWidth: 20,
  };

  const headerStyle: React.CSSProperties = {
    ...cellStyle,
    background: "#1e1e35",
    color: "#9ca3af",
    fontWeight: 700,
    fontSize: 9,
    textTransform: "uppercase",
  };

  return (
    <div
      id="attendance-pdf-template"
      style={{
        position: "fixed",
        top: -9999,
        left: -9999,
        width: 1120,
        background: "#0f0f1a",
        color: "white",
        padding: 24,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 16, borderBottom: "2px solid #2a2a4a", paddingBottom: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 4 }}>
          {academyName}
        </div>
        <div style={{ fontSize: 13, color: "#818cf8", fontWeight: 600 }}>
          Monthly Attendance — {className} — {monthLabel}
        </div>
        <div style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>
          Generated on {new Date().toLocaleDateString("en-PK", { dateStyle: "long" })}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...headerStyle, minWidth: 36, textAlign: "left" }}>#</th>
              <th style={{ ...headerStyle, minWidth: 140, textAlign: "left" }}>Name</th>
              <th style={{ ...headerStyle, minWidth: 36 }}>Fee</th>
              {days.map((d) => (
                <th key={d} style={headerStyle}>{d}</th>
              ))}
              <th style={{ ...headerStyle, minWidth: 28, color: "#4ade80" }}>P</th>
              <th style={{ ...headerStyle, minWidth: 28, color: "#f87171" }}>A</th>
              <th style={{ ...headerStyle, minWidth: 28, color: "#fbbf24" }}>L</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const present = Object.values(row.days).filter((s) => s === "P").length;
              const absent = Object.values(row.days).filter((s) => s === "A").length;
              const leave = Object.values(row.days).filter((s) => s === "L").length;
              return (
                <tr
                  key={row.rollNumber}
                  style={{ background: i % 2 === 0 ? "#13132a" : "#0f0f1a" }}
                >
                  <td style={{ ...cellStyle, textAlign: "left", color: "#6b7280", fontWeight: 700 }}>
                    {row.rollNumber}
                  </td>
                  <td style={{ ...cellStyle, textAlign: "left", fontWeight: 600, color: "white" }}>
                    {row.name}
                  </td>
                  <td style={cellStyle}>
                    <span style={{
                      color: row.feeStatus === "paid" ? "#4ade80"
                        : row.feeStatus === "not_set" ? "#6b7280"
                        : "#f87171",
                      fontWeight: 700, fontSize: 9,
                    }}>
                      {row.feeStatus === "paid" ? "✓" : row.feeStatus === "not_set" ? "—" : "✗"}
                    </span>
                  </td>
                  {days.map((d) => {
                    const s = row.days[d];
                    return (
                      <td key={d} style={{
                        ...cellStyle,
                        color: s === "P" ? "#4ade80" : s === "A" ? "#f87171" : s === "L" ? "#fbbf24" : "#374151",
                        fontWeight: s ? 700 : 400,
                      }}>
                        {s ?? "·"}
                      </td>
                    );
                  })}
                  <td style={{ ...cellStyle, color: "#4ade80", fontWeight: 700 }}>{present}</td>
                  <td style={{ ...cellStyle, color: "#f87171", fontWeight: 700 }}>{absent}</td>
                  <td style={{ ...cellStyle, color: "#fbbf24", fontWeight: 700 }}>{leave}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", fontSize: 10, color: "#6b7280" }}>
        <span>Total Students: {rows.length}</span>
        <span>P = Present · A = Absent · L = Leave</span>
        <span>Academy Management System</span>
      </div>
    </div>
  );
}
