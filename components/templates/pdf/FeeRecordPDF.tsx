// components/templates/pdf/FeeRecordPDF.tsx

const MONTH_LABELS = ["May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];

interface FeeRecordPDFProps {
  academyName: string;
  className: string;
  yearLabel: string;
  rows: {
    id: string;
    name: string;
    rollNumber: number;
    cells: (number | "X" | null)[];
  }[];
}

export function FeeRecordPDF({ academyName, className, yearLabel, rows }: FeeRecordPDFProps) {
  const cellStyle: React.CSSProperties = {
    border: "1px solid #2a2a4a",
    padding: "5px 4px",
    textAlign: "center",
    fontSize: 10,
    minWidth: 42,
  };
  const headerStyle: React.CSSProperties = {
    ...cellStyle,
    background: "#1e1e35",
    color: "#9ca3af",
    fontWeight: 700,
    fontSize: 9,
    textTransform: "uppercase",
  };

  const monthTotals = MONTH_LABELS.map((_, j) =>
    rows.reduce((sum, r) => sum + (typeof r.cells[j] === "number" ? (r.cells[j] as number) : 0), 0)
  );
  const grandTotal = monthTotals.reduce((a, b) => a + b, 0);

  return (
    <div
      id="fee-record-pdf-template"
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
        <div style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 4 }}>{academyName}</div>
        <div style={{ fontSize: 13, color: "#818cf8", fontWeight: 600 }}>
          Fee Record — {className} — Academic Year {yearLabel}
        </div>
        <div style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>
          Generated on {new Date().toLocaleDateString("en-PK", { dateStyle: "long" })}
        </div>
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ ...headerStyle, textAlign: "left", minWidth: 32 }}>#</th>
            <th style={{ ...headerStyle, textAlign: "left", minWidth: 140 }}>Name</th>
            {MONTH_LABELS.map((m) => <th key={m} style={headerStyle}>{m}</th>)}
            <th style={{ ...headerStyle, color: "#4ade80", minWidth: 72 }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const total = row.cells.reduce((s, v) => s + (typeof v === "number" ? v : 0), 0);
            return (
              <tr key={row.id} style={{ background: i % 2 === 0 ? "#13132a" : "#0f0f1a" }}>
                <td style={{ ...cellStyle, textAlign: "left", color: "#6b7280", fontWeight: 700 }}>{row.rollNumber}</td>
                <td style={{ ...cellStyle, textAlign: "left", fontWeight: 600, color: "white" }}>{row.name}</td>
                {row.cells.map((val, j) => (
                  <td key={j} style={{
                    ...cellStyle,
                    color: val === "X" ? "#f87171" : val === null ? "#374151" : "#4ade80",
                    fontWeight: val !== null ? 700 : 400,
                  }}>
                    {val === null ? "—" : val === "X" ? "✗" : val.toLocaleString()}
                  </td>
                ))}
                <td style={{ ...cellStyle, color: "#e5e7eb", fontWeight: 700, background: "#1e1e35" }}>
                  {total > 0 ? total.toLocaleString() : "—"}
                </td>
              </tr>
            );
          })}
          {/* Totals row */}
          <tr style={{ background: "#1a1a40", borderTop: "2px solid #4f46e5" }}>
            <td style={{ ...cellStyle, fontWeight: 800, color: "#818cf8" }} colSpan={2}>Monthly Total</td>
            {monthTotals.map((t, j) => (
              <td key={j} style={{ ...cellStyle, color: "#818cf8", fontWeight: 700 }}>
                {t > 0 ? t.toLocaleString() : "—"}
              </td>
            ))}
            <td style={{ ...cellStyle, color: "#4ade80", fontWeight: 800, background: "#052e16" }}>
              {grandTotal.toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", fontSize: 10, color: "#6b7280" }}>
        <span>Total Students: {rows.length}</span>
        <span>✓ = Paid · ✗ = Unpaid · — = No Record</span>
        <span>Grand Total: Rs. {grandTotal.toLocaleString()}</span>
      </div>
    </div>
  );
}
