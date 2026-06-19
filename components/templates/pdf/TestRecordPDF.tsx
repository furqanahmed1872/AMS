// components/templates/pdf/TestRecordPDF.tsx

interface Test {
  id: string;
  name: string;
  totalMarks: number;
}
interface TestRecordRow {
  studentId: string;
  name: string;
  rollNumber: number;
  cells: (number | "absent" | null)[];
}

interface TestRecordPDFProps {
  academyName: string;
  className: string;
  subjectName: string;
  teacherName?: string;
  tests: Test[];
  rows: TestRecordRow[];
}

export function TestRecordPDF({
  academyName,
  className,
  subjectName,
  teacherName,
  tests,
  rows,
}: TestRecordPDFProps) {
  const cellStyle: React.CSSProperties = {
    border: "1px solid #e5e7eb",
    padding: "7px 6px",
    textAlign: "center",
    verticalAlign: "middle",
    fontSize: 11,
    minWidth: 56,
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
      id="test-record-pdf-template"
      style={{
        position: "fixed",
        top: -9999,
        left: -9999,
        width: 1020,
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
            {className} · Subject: {subjectName}
            {teacherName && (
              <span style={{ color: "#6b7280", fontWeight: 400 }}>
                {" "}
                · Teacher: {teacherName}
              </span>
            )}
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
              <th style={{ ...headerStyle, textAlign: "left", minWidth: 160 }}>
                Name
              </th>
              {tests.map((t) => (
                <th key={t.id} style={headerStyle}>
                  {t.name}
                  <br />
                  <span
                    style={{ fontSize: 8, color: "#9ca3af", fontWeight: 400 }}
                  >
                    /{t.totalMarks}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.studentId}
                style={{ background: i % 2 === 0 ? "#f9fafb" : "#ffffff" }}
              >
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
                {row.cells.map((cell, j) => {
                  const pct =
                    cell === null
                      ? null
                      : cell === "absent"
                        ? 0
                        : (cell / tests[j].totalMarks) * 100;
                  return (
                    <td
                      key={j}
                      style={{
                        ...cellStyle,
                        color:
                          cell === null
                            ? "#d1d5db"
                            : cell === "absent"
                              ? "#dc2626"
                              : pct! >= 33
                                ? "#111827"
                                : "#dc2626",
                        fontWeight: cell !== null ? 600 : 400,
                      }}
                    >
                      {cell === null
                        ? "—"
                        : cell === "absent"
                          ? "Absent"
                          : `${cell}/${tests[j].totalMarks}`}
                    </td>
                  );
                })}
              </tr>
            ))}
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
          <span>
            Total Students: {rows.length} · Total Tests: {tests.length}
          </span>
          <span>Pass threshold: 33% · Absent = not present for test</span>
          <span>Academy Management System</span>
        </div>
      </div>
    </div>
  );
}
