/**
 * components/ParameterCard.js
 * Displays a single medical parameter with status colouring and a progress bar.
 */

const STATUS_COLORS = {
  normal:     "var(--green)",
  high:       "var(--red)",
  low:        "var(--red)",
  borderline: "var(--amber)",
};

const TAG_STYLES = {
  normal:     { bg: "rgba(104,211,145,0.1)", color: "var(--green)", border: "rgba(104,211,145,0.2)" },
  high:       { bg: "rgba(252,129,129,0.1)", color: "var(--red)",   border: "rgba(252,129,129,0.2)" },
  low:        { bg: "rgba(252,129,129,0.1)", color: "var(--red)",   border: "rgba(252,129,129,0.2)" },
  borderline: { bg: "rgba(237,137,54,0.1)",  color: "var(--amber)", border: "rgba(237,137,54,0.2)"  },
};

export default function ParameterCard({ param }) {
  const { name, value, unit, range, status, barPercent = 50, explanation } = param;
  const color = STATUS_COLORS[status] || "var(--text2)";
  const tag   = TAG_STYLES[status]   || TAG_STYLES.normal;
  const pct   = Math.min(100, Math.max(5, barPercent));

  return (
    <div style={{
      padding: "18px 20px",
      borderRadius: 12,
      border: "1px solid var(--border)",
      background: "var(--bg3)",
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <span style={{
          fontSize: 11, color: "var(--text3)",
          fontFamily: "var(--font-mono, 'DM Mono', monospace)",
          letterSpacing: "0.5px", textTransform: "uppercase",
        }}>
          {name}
        </span>
        <span style={{
          padding: "2px 8px", borderRadius: 10,
          fontSize: 10, fontWeight: 700,
          fontFamily: "var(--font-mono, 'DM Mono', monospace)",
          background: tag.bg, color: tag.color,
          border: `1px solid ${tag.border}`,
        }}>
          {status?.toUpperCase()}
        </span>
      </div>

      {/* Value */}
      <div style={{ display:"flex", alignItems:"baseline", gap: 6 }}>
        <span style={{ fontSize: 24, fontWeight: 600, color,
          fontFamily: "var(--font-display, 'Fraunces', serif)" }}>
          {value}
        </span>
        <span style={{ fontSize: 12, color: "var(--text3)" }}>{unit}</span>
      </div>

      {/* Ref range */}
      <div style={{ fontSize: 11, color: "var(--text3)",
        fontFamily: "var(--font-mono, 'DM Mono', monospace)" }}>
        Ref: {range}
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, borderRadius: 4, background: "var(--border)", position: "relative" }}>
        <div style={{
          width: `${pct}%`, height: "100%", borderRadius: 4,
          background: color, transition: "width 0.6s ease",
        }} />
      </div>

      {/* Explanation */}
      {explanation && (
        <div style={{ fontSize: 11, color: "var(--text3)", lineHeight: 1.5, marginTop: 4 }}>
          {explanation}
        </div>
      )}
    </div>
  );
}
