/**
 * components/LoadingSpinner.js
 */
export default function LoadingSpinner({ message = "Loading…", sub = "" }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 32px" }}>
      <div style={{
        width: 48, height: 48, borderRadius: "50%", margin: "0 auto 24px",
        border: "3px solid var(--border)", borderTopColor: "var(--teal)",
        animation: "spin 0.8s linear infinite",
      }} />
      <div style={{ fontSize: 14, color: "var(--text2)",
        fontFamily: "var(--font-mono, 'DM Mono', monospace)" }}>
        {message}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 8 }}>{sub}</div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
