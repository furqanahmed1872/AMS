// components/templates/pdf/FeeReceiptPDF.tsx

interface FeeReceiptPDFProps {
  academyName: string;
  studentName: string;
  rollNumber: number;
  className: string;
  monthLabel: string; // e.g. "July 2026"
  amountPaid: number;
  paidDate: string; // ISO date
  receiptNo: string;
  visible?: boolean;
}

export function FeeReceiptPDF({
  academyName,
  studentName,
  rollNumber,
  className,
  monthLabel,
  amountPaid,
  paidDate,
  receiptNo,
  visible = false,
}: FeeReceiptPDFProps) {
  const rowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #e5e7eb",
    fontSize: 13,
  };
  const labelStyle: React.CSSProperties = { color: "#6b7280", fontWeight: 500 };
  const valueStyle: React.CSSProperties = { color: "#111827", fontWeight: 700 };

  return (
    <div
      id="fee-receipt-pdf-template"
      style={
        visible
          ? {
              width: "100%",
              maxWidth: 480,
              margin: "0 auto",
              background: "#ffffff",
              color: "#111827",
              fontFamily: "Inter, system-ui, sans-serif",
              borderRadius: 12,
              overflow: "hidden",
            }
          : {
              position: "fixed",
              top: -9999,
              left: -9999,
              width: 640,
              background: "#ffffff",
              color: "#111827",
              fontFamily: "Inter, system-ui, sans-serif",
            }
      }
    >
      <div
        style={{ background: "#ffffff", padding: 40, boxSizing: "border-box" }}
      >
        {/* Letterhead */}
        <div
          style={{
            marginBottom: 24,
            borderBottom: "2px solid #6366f1",
            paddingBottom: 16,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>
            {academyName}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#4f46e5",
              fontWeight: 600,
              marginTop: 4,
            }}
          >
            Fee Payment Receipt
          </div>
        </div>

        {/* Receipt meta */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            color: "#6b7280",
            marginBottom: 20,
          }}
        >
          <span>Receipt No: {receiptNo}</span>
          <span>
            Issued:{" "}
            {new Date().toLocaleDateString("en-PK", { dateStyle: "medium" })}
          </span>
        </div>

        {/* Details */}
        <div>
          <div style={rowStyle}>
            <span style={labelStyle}>Student Name</span>
            <span style={valueStyle}>{studentName}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Roll Number</span>
            <span style={valueStyle}>{rollNumber}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Class</span>
            <span style={valueStyle}>{className}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Fee Period</span>
            <span style={valueStyle}>{monthLabel}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Payment Date</span>
            <span style={valueStyle}>
              {new Date(paidDate).toLocaleDateString("en-PK", {
                dateStyle: "medium",
              })}
            </span>
          </div>
        </div>

        {/* Amount */}
        <div
          style={{
            marginTop: 24,
            padding: 18,
            borderRadius: 8,
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 13, color: "#166534", fontWeight: 600 }}>
            Amount Paid
          </span>
          <span style={{ fontSize: 22, color: "#16a34a", fontWeight: 800 }}>
            Rs. {amountPaid.toLocaleString()}
          </span>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 28,
            paddingTop: 14,
            borderTop: "1px solid #e5e7eb",
            fontSize: 10,
            color: "#9ca3af",
            textAlign: "center",
          }}
        >
          This is a computer-generated receipt and does not require a signature.
        </div>
      </div>
    </div>
  );
}
