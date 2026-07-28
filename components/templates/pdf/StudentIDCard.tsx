// components/templates/pdf/StudentIDCard.tsx
//
// Standalone template — reads only from the existing Student shape
// (lib/academy-data/types.ts), no new server action or table needed.
// Rendered off-screen at CR80 card proportions (85.6mm × 54mm) scaled up
// for crisp html2canvas capture, same off-screen pattern as the other
// share/PDF templates.

interface StudentIDCardData {
  academyName: string;
  studentName: string;
  fatherName: string;
  className: string;
  rollNumber: number;
  admissionDate: string; // already formatted, e.g. "12 Jan 2024"
  phone: string;
  address: string;
  academyId: string; // used to build a short reference code
  studentIdShort: string; // short id, e.g. first 8 chars of the uuid
}

// CR80 card at ~3.78 px/mm × 4 (scale factor for crisp capture) = ~1296×816
const CARD_WIDTH = 648;
const CARD_HEIGHT = 408;

function CardShell({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent: string;
}) {
  return (
    <div
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 18,
        background: "#ffffff",
        color: "#111827",
        fontFamily: "Inter, system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
        border: "1px solid #e5e7eb",
      }}
    >
      {/* Top accent band */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 96,
          background: accent,
        }}
      />
      {children}
    </div>
  );
}

/** Front face: photo placeholder, name, class, roll, ID */
function Front({ data }: { data: StudentIDCardData }) {
  return (
    <CardShell accent="linear-gradient(135deg, #0891b2, #0e7490)">
      <div
        style={{
          position: "relative",
          padding: "18px 24px",
          height: "100%",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#ffffff",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 10 12 5 2 10l10 5 10-5Z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>
            {data.academyName}
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            marginTop: 28,
            display: "flex",
            gap: 20,
          }}
        >
          {/* Photo placeholder */}
          <div
            style={{
              width: 108,
              height: 132,
              borderRadius: 10,
              background: "#f3f4f6",
              border: "2px solid #e5e7eb",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9ca3af",
              fontSize: 11,
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            PHOTO
          </div>

          {/* Details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#111827",
                lineHeight: 1.2,
                wordBreak: "break-word",
              }}
            >
              {data.studentName}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
              S/D/O {data.fatherName || "—"}
            </div>

            <div
              style={{
                marginTop: 14,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
                <span style={{ color: "#9ca3af", minWidth: 60 }}>Class</span>
                <span style={{ fontWeight: 700, color: "#111827" }}>
                  {data.className}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
                <span style={{ color: "#9ca3af", minWidth: 60 }}>Roll No.</span>
                <span style={{ fontWeight: 700, color: "#111827" }}>
                  #{data.rollNumber}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
                <span style={{ color: "#9ca3af", minWidth: 60 }}>Admitted</span>
                <span style={{ fontWeight: 600, color: "#111827" }}>
                  {data.admissionDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer strip — pinned to the bottom of the card regardless of
            how much body content there is, instead of relying on flex:1
            to push it down (which left a large empty gap on short cards) */}
        <div
          style={{
            position: "absolute",
            left: 24,
            right: 24,
            bottom: 18,
            borderTop: "1px solid #e5e7eb",
            paddingTop: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 10, color: "#9ca3af" }}>
            ID: {data.studentIdShort.toUpperCase()}
          </span>
          <span style={{ fontSize: 10, color: "#9ca3af" }}>
            Student Identity Card
          </span>
        </div>
      </div>
    </CardShell>
  );
}

/** Back face: contact info, address, terms line */
function Back({ data }: { data: StudentIDCardData }) {
  return (
    <CardShell accent="linear-gradient(135deg, #0891b2, #0e7490)">
      <div
        style={{
          position: "relative",
          padding: "18px 24px",
          height: "100%",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: "#ffffff",
            marginTop: 6,
          }}
        >
          Contact Information
        </div>

        <div style={{ marginTop: 26 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div
                style={{
                  fontSize: 10,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Phone
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#111827",
                  marginTop: 2,
                }}
              >
                {data.phone || "—"}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 10,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Address
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#111827",
                  marginTop: 2,
                  lineHeight: 1.4,
                }}
              >
                {data.address || "—"}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 20,
              padding: "10px 12px",
              background: "#f9fafb",
              borderRadius: 8,
              fontSize: 10,
              color: "#6b7280",
              lineHeight: 1.5,
            }}
          >
            This card is the property of {data.academyName}. If found, please
            return to the academy office. Not transferable.
          </div>
        </div>

        {/* Footer — pinned to the bottom of the card regardless of body
            content height, same fix as the front face */}
        <div
          style={{
            position: "absolute",
            left: 24,
            right: 24,
            bottom: 18,
            borderTop: "1px solid #e5e7eb",
            paddingTop: 10,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 10, color: "#9ca3af" }}>
            Valid for current academic year
          </span>
          <span style={{ fontSize: 10, color: "#9ca3af" }}>
            Academy Management System
          </span>
        </div>
      </div>
    </CardShell>
  );
}

/**
 * Renders both faces off-screen, stacked, each with its own element id so
 * exportElementAsPDF / shareElementAsImage can target them individually,
 * plus a wrapper id that captures both for a single combined PNG/PDF.
 */
export function StudentIDCard({ data }: { data: StudentIDCardData }) {
  return (
    <div
      style={{
        position: "fixed",
        top: -9999,
        left: -9999,
      }}
    >
      <div
        id="student-id-card-combined"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          padding: 20,
          background: "#f3f4f6",
        }}
      >
        <div id="student-id-card-front">
          <Front data={data} />
        </div>
        <div id="student-id-card-back">
          <Back data={data} />
        </div>
      </div>
    </div>
  );
}

// Exported so a visible, scaled-down preview can reuse the exact same
// markup that gets captured off-screen for the PDF — this guarantees the
// preview always matches what actually prints, instead of drifting apart
// as two separately-maintained layouts.
export { Front as StudentIDCardFront, Back as StudentIDCardBack };
export type { StudentIDCardData };
