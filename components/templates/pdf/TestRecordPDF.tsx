// components/templates/pdf/TestRecordPDF.tsx

interface Test { id: string; name: string; totalMarks: number; }
interface TestRecordRow { studentId: string; name: string; rollNumber: number; cells: (number | "absent" | null)[]; }

interface TestRecordPDFProps {
  academyName: string;
  className: string;
  subjectName: string;
  teacherName?: string;
  tests: Test[];
  rows: TestRecordRow[];
}

export function TestRecordPDF({ academyName, className, subjectName, teacherName, tests, rows }: TestRecordPDFProps) {
  const cellStyle: React.CSSProperties = {
    border: "1px solid #2a2a4a",
    padding: "5px 6px",
    textAlign: "center",
    fontSize: 11,
    minWidth: 56,
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
      id="test-record-pdf-template"
      style={{
        position: "fixed",
        top: -9999,
        left: -9999,
        width: 1020,
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
          {className} · Subject: {subjectName}
          {teacherName && <span style={{ color: "#9ca3af", fontWeight: 400 }}> · Teacher: {teacherName}</span>}
        </div>
        <div style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>
          Generated on {new Date().toLocaleDateString("en-PK", { dateStyle: "long" })}
        </div>
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ ...headerStyle, textAlign: "left", minWidth: 160 }}>Name</th>
            {tests.map((t) => (
              <th key={t.id} style={headerStyle}>
                {t.name}<br />
                <span style={{ fontSize: 8, color: "#6b7280", fontWeight: 400 }}>/{t.totalMarks}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.studentId} style={{ background: i % 2 === 0 ? "#13132a" : "#0f0f1a" }}>
              <td style={{ ...cellStyle, textAlign: "left", fontWeight: 600, color: "white" }}>{row.name}</td>
              {row.cells.map((cell, j) => {
                const pct = cell === null ? null : cell === "absent" ? 0 : (cell / tests[j].totalMarks) * 100;
                return (
                  <td key={j} style={{
                    ...cellStyle,
                    color: cell === null ? "#374151"
                      : cell === "absent" ? "#f87171"
                      : pct! >= 33 ? "#e5e7eb"
                      : "#f87171",
                    fontWeight: cell !== null ? 600 : 400,
                  }}>
                    {cell === null ? "—" : cell === "absent" ? "Abs" : `${cell}/${tests[j].totalMarks}`}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 16, fontSize: 10, color: "#6b7280", display: "flex", justifyContent: "space-between" }}>
        <span>Total Students: {rows.length} · Total Tests: {tests.length}</span>
        <span>Pass threshold: 33% · Abs = Absent</span>
        <span>Academy Management System</span>
      </div>
    </div>
  );
}
