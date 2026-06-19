// components/templates/pdf/AttendancePDF.tsx

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
    border: "1px solid #e5e7eb",
    padding: "6px 3px",
    textAlign: "center",
    verticalAlign: "middle",
    fontSize: 10,
    minWidth: 20,
  };

  const headerStyle: React.CSSProperties = {
    ...cellStyle,
    background: "#f3f4f6",
    color: "#374151",
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
        minHeight: "100%",
        background: "#ffffff",
        color: "#111827",
        padding: 0,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Full page wrapper ensures background covers everything */}
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
            Monthly Attendance — {className} — {monthLabel}
          </div>
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
            Generated on{" "}
            {new Date().toLocaleDateString("en-PK", { dateStyle: "long" })}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#ffffff",
            }}
          >
            <thead>
              <tr>
                <th style={{ ...headerStyle, minWidth: 36, textAlign: "left" }}>
                  #
                </th>
                <th
                  style={{ ...headerStyle, minWidth: 140, textAlign: "left" }}
                >
                  Name
                </th>
                <th style={{ ...headerStyle, minWidth: 36 }}>Fee</th>
                {days.map((d) => (
                  <th key={d} style={headerStyle}>
                    {d}
                  </th>
                ))}
                <th style={{ ...headerStyle, minWidth: 28, color: "#16a34a" }}>
                  P
                </th>
                <th style={{ ...headerStyle, minWidth: 28, color: "#dc2626" }}>
                  A
                </th>
                <th style={{ ...headerStyle, minWidth: 28, color: "#d97706" }}>
                  L
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const present = Object.values(row.days).filter(
                  (s) => s === "P",
                ).length;
                const absent = Object.values(row.days).filter(
                  (s) => s === "A",
                ).length;
                const leave = Object.values(row.days).filter(
                  (s) => s === "L",
                ).length;
                return (
                  <tr
                    key={row.rollNumber}
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
                    <td style={cellStyle}>
                      <span
                        style={{
                          color:
                            row.feeStatus === "paid"
                              ? "#16a34a"
                              : row.feeStatus === "not_set"
                                ? "#9ca3af"
                                : "#dc2626",
                          fontWeight: 700,
                          fontSize: 11,
                        }}
                      >
                        {row.feeStatus === "paid"
                          ? "✓"
                          : row.feeStatus === "not_set"
                            ? "—"
                            : "✗"}
                      </span>
                    </td>
                    {days.map((d) => {
                      const s = row.days[d];
                      return (
                        <td
                          key={d}
                          style={{
                            ...cellStyle,
                            color:
                              s === "P"
                                ? "#16a34a"
                                : s === "A"
                                  ? "#dc2626"
                                  : s === "L"
                                    ? "#d97706"
                                    : "#d1d5db",
                            fontWeight: s ? 700 : 400,
                          }}
                        >
                          {s ?? "·"}
                        </td>
                      );
                    })}
                    <td
                      style={{
                        ...cellStyle,
                        color: "#16a34a",
                        fontWeight: 700,
                      }}
                    >
                      {present}
                    </td>
                    <td
                      style={{
                        ...cellStyle,
                        color: "#dc2626",
                        fontWeight: 700,
                      }}
                    >
                      {absent}
                    </td>
                    <td
                      style={{
                        ...cellStyle,
                        color: "#d97706",
                        fontWeight: 700,
                      }}
                    >
                      {leave}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

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
          <span>P = Present · A = Absent · L = Leave</span>
          <span>Academy Management System</span>
        </div>
      </div>
    </div>
  );
}
