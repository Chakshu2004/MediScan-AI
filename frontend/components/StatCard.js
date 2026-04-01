/**
 * components/StatCard.js
 */
export default function StatCard({ label, value, color }) {
  return (
    <div style={{
      padding: "22px", borderRadius: 12,
      border: "1px solid var(--border)", background: "var(--bg3)",
    }}>
      <div style={{
        fontSize: 11, color: "var(--text3)", letterSpacing: "1px",
        textTransform: "uppercase", marginBottom: 10,
        fontFamily: "var(--font-mono, 'DM Mono', monospace)",
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 30, fontWeight: 600,
        fontFamily: "var(--font-display, 'Fraunces', serif)",
        color: color || "var(--text)",
      }}>
        {value}
      </div>
    </div>
  );
}
