// components/templates/share/NoticeCard.tsx
// Off-screen render target for html2canvas — same pattern as
// StudentAttendanceCard.tsx. Captured and shared via shareElementAsImage().

interface NoticeCardProps {
  academyName: string;
  title: string;
  message: string;
  className: string; // "All Classes" or the specific class display name
  date: string; // already formatted, e.g. "28 Jul 2026"
}

export function NoticeCard({
  academyName,
  title,
  message,
  className,
  date,
}: NoticeCardProps) {
  return (
    <div
      id="notice-share-card"
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
        boxSizing: "border-box",
      }}
    >
      {/* ── Academy header ────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #0891b2, #0e7490)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          📢
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
            {academyName}
          </div>
          <div style={{ fontSize: 10, color: "#9ca3af" }}>Notice</div>
        </div>
      </div>

      {/* ── Scope badge ───────────────────────────────── */}
      <div
        style={{
          display: "inline-block",
          background: "rgba(8,145,178,0.15)",
          border: "1px solid rgba(8,145,178,0.35)",
          borderRadius: 9999,
          padding: "5px 12px",
          fontSize: 11,
          fontWeight: 700,
          color: "#22d3ee",
          marginBottom: 16,
        }}
      >
        {className}
      </div>

      {/* ── Title + message ───────────────────────────── */}
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          borderRadius: 14,
          padding: "18px 18px",
          marginBottom: 16,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: "white",
            lineHeight: 1.3,
            marginBottom: 10,
            wordBreak: "break-word",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#d1d5db",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {message}
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────── */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 10, color: "#6b7280" }}>{date}</span>
        <span style={{ fontSize: 10, color: "#6b7280" }}>
          Academy Management System
        </span>
      </div>
    </div>
  );
}
