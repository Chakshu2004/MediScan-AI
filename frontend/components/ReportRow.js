/**
 * components/ReportRow.js
 * A single row in the reports list on the Dashboard.
 */
import Link from "next/link";

const FLAG_STYLE = (n) => {
  if (n === 0)  return { bg:"rgba(104,211,145,0.1)", color:"var(--green)", border:"rgba(104,211,145,0.2)" };
  if (n <= 2)   return { bg:"rgba(237,137,54,0.1)",  color:"var(--amber)", border:"rgba(237,137,54,0.2)"  };
  return              { bg:"rgba(252,129,129,0.1)", color:"var(--red)",   border:"rgba(252,129,129,0.2)" };
};

export default function ReportRow({ report, onDelete }) {
  const style = FLAG_STYLE(report.flag_count);
  const date  = new Date(report.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "18px 22px", borderRadius: 12,
      border: "1px solid var(--border)", background: "var(--bg3)",
      transition: "all 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border2)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
    >
      {/* Info */}
      <div>
        <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 3 }}>
          {report.report_name || report.file_name}
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)",
          fontFamily: "var(--font-mono, 'DM Mono', monospace)" }}>
          {date}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display:"flex", alignItems:"center", gap: 12 }}>
        <span style={{
          padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
          fontFamily: "var(--font-mono, 'DM Mono', monospace)",
          background: style.bg, color: style.color,
          border: `1px solid ${style.border}`,
        }}>
          {report.flag_count === 0
            ? "✓ Normal"
            : `⚠ ${report.flag_count} flag${report.flag_count > 1 ? "s" : ""}`}
        </span>

        <Link href={`/analysis/${report.id}`} style={{
          padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
          background: "rgba(56,178,172,0.1)", color: "var(--teal2)",
          border: "1px solid rgba(56,178,172,0.2)", textDecoration: "none",
        }}>
          View →
        </Link>

        {onDelete && (
          <button
            onClick={() => onDelete(report.id)}
            style={{
              padding: "6px 10px", borderRadius: 8, fontSize: 12,
              background: "transparent", color: "var(--text3)",
              border: "1px solid var(--border)", cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            🗑
          </button>
        )}
      </div>
    </div>
  );
}
