// components/templates/pdf/FeeRecordPDF.tsx

const MONTH_LABELS = [
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
];

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

export function FeeRecordPDF({
  academyName,
  className,
  yearLabel,
  rows,
}: FeeRecordPDFProps) {
  const cellStyle: React.CSSProperties = {
    border: "1px solid #e5e7eb",
    padding: "6px 4px",
    textAlign: "center",
    verticalAlign: "middle",
    fontSize: 10,
    minWidth: 42,
  };

  const headerStyle: React.CSSProperties = {
    ...cellStyle,
    background: "#f3f4f6",
    color: "#374151",
    fontWeight: 700,
    fontSize: 9,
    textTransform: "uppercase",
  };

  const monthTotals = MONTH_LABELS.map((_, j) =>
    rows.reduce<number>(
      (sum, r) =>
        sum + (typeof r.cells[j] === "number" ? (r.cells[j] as number) : 0),
      0,
    ),
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
        background: "#ffffff",
        color: "#111827",
        padding: 0,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Full page wrapper */}
      <div
        style={{
          background: "#ffffff",
          minHeight: "100vh",
          padding: 32,
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: 20,
            borderBottom: "2px solid #e5e7eb",
            paddingBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#111827",
              marginBottom: 4,
            }}
          >
            {academyName}
          </div>
          <div style={{ fontSize: 13, color: "#4f46e5", fontWeight: 600 }}>
            Fee Record — {className} — Academic Year {yearLabel}
          </div>
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
            Generated on{" "}
            {new Date().toLocaleDateString("en-PK", { dateStyle: "long" })}
          </div>
        </div>

        {/* Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#ffffff",
          }}
        >
          <thead>
            <tr>
              <th style={{ ...headerStyle, textAlign: "left", minWidth: 32 }}>
                #
              </th>
              <th style={{ ...headerStyle, textAlign: "left", minWidth: 140 }}>
                Name
              </th>
              {MONTH_LABELS.map((m) => (
                <th key={m} style={headerStyle}>
                  {m}
                </th>
              ))}
              <th style={{ ...headerStyle, color: "#16a34a", minWidth: 72 }}>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const total = row.cells.reduce<number>(
                (s, v) => s + (typeof v === "number" ? v : 0),
                0,
              );
              return (
                <tr
                  key={row.id}
                  style={{ background: i % 2 === 0 ? "#f9fafb" : "#ffffff" }}
                >
                  <td
                    style={{
                      ...cellStyle,
                      textAlign: "left",
                      color: "#6b7280",
                      fontWeight: 700,
                    }}
                  >
                    {row.rollNumber}
                  </td>
                  <td
                    style={{
                      ...cellStyle,
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#111827",
                    }}
                  >
                    {row.name}
                  </td>
                  {row.cells.map((val, j) => (
                    <td
                      key={j}
                      style={{
                        ...cellStyle,
                        color:
                          val === "X"
                            ? "#dc2626"
                            : val === null
                              ? "#d1d5db"
                              : "#16a34a",
                        fontWeight: val !== null ? 700 : 400,
                      }}
                    >
                      {val === null
                        ? "—"
                        : val === "X"
                          ? "✗"
                          : val.toLocaleString()}
                    </td>
                  ))}
                  <td
                    style={{
                      ...cellStyle,
                      color: "#111827",
                      fontWeight: 700,
                      background: "#f3f4f6",
                    }}
                  >
                    {total > 0 ? total.toLocaleString() : "—"}
                  </td>
                </tr>
              );
            })}

            {/* Monthly totals row */}
            <tr
              style={{ background: "#eff6ff", borderTop: "2px solid #6366f1" }}
            >
              <td
                style={{ ...cellStyle, fontWeight: 800, color: "#4f46e5" }}
                colSpan={2}
              >
                Monthly Total
              </td>
              {monthTotals.map((t, j) => (
                <td
                  key={j}
                  style={{ ...cellStyle, color: "#4f46e5", fontWeight: 700 }}
                >
                  {t > 0 ? t.toLocaleString() : "—"}
                </td>
              ))}
              <td
                style={{
                  ...cellStyle,
                  color: "#16a34a",
                  fontWeight: 800,
                  background: "#f0fdf4",
                }}
              >
                {grandTotal.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div
          style={{
            marginTop: 20,
            paddingTop: 12,
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
            color: "#6b7280",
          }}
        >
          <span>Total Students: {rows.length}</span>
          <span>✓ = Paid · ✗ = Unpaid · — = No Record</span>
          <span>Grand Total: Rs. {grandTotal.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
