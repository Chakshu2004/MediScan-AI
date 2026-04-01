/**
 * pages/index.js — Landing / marketing page
 */
import Link from "next/link";
import Layout from "../components/Layout";

const features = [
  { icon: "📄", title: "Upload Any Report",    desc: "PDF, JPG, PNG — paste or upload your medical reports in seconds." },
  { icon: "🔍", title: "Smart OCR Extraction", desc: "Tesseract OCR reads every parameter, value, and reference range automatically." },
  { icon: "⚠️", title: "Flag Abnormals",       desc: "Instantly highlights values outside the normal range with clear visual indicators." },
  { icon: "💡", title: "Plain English",         desc: "Complex medical jargon translated into simple, understandable explanations." },
  { icon: "📊", title: "Report History",        desc: "Track your health parameters over time on your personal dashboard." },
  { icon: "🔐", title: "Secure & Private",      desc: "Google OAuth 2.0 authentication. Your data is encrypted end-to-end." },
];

export default function LandingPage() {
  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 32px 60px", textAlign: "center" }}>

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 14px", borderRadius: 20, marginBottom: 32,
          border: "1px solid rgba(56,178,172,0.3)", background: "rgba(56,178,172,0.08)",
          fontFamily: "var(--font-mono, 'DM Mono', monospace)", fontSize: 11,
          color: "var(--teal2)", letterSpacing: "1px",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%", background: "var(--teal2)",
            boxShadow: "0 0 8px var(--teal2)", animation: "pulse2 2s infinite",
            display: "inline-block",
          }} />
          AI-POWERED MEDICAL ANALYSIS
        </div>

        {/* Hero title */}
        <h1 style={{
          fontFamily: "var(--font-display, 'Fraunces', serif)",
          fontSize: "clamp(42px, 7vw, 74px)",
          fontWeight: 400, lineHeight: 1.05, letterSpacing: "-2px", marginBottom: 24,
        }}>
          Understand your<br />
          <em style={{ fontStyle:"italic", color:"var(--teal2)" }}>health report</em><br />
          instantly
        </h1>

        <p style={{
          fontSize: 16, color: "var(--text2)", lineHeight: 1.7,
          maxWidth: 560, margin: "0 auto 48px", fontWeight: 300,
        }}>
          Upload any medical report — blood work, lipid panel, thyroid — and get a clear,
          plain-language breakdown of what your results actually mean.
        </p>

        {/* CTAs */}
        <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
          <Link href="/login" style={{
            padding: "14px 32px", borderRadius: 10, fontSize: 15, fontWeight: 600,
            background: "linear-gradient(135deg, var(--teal), #2c7a7b)", color: "white",
            textDecoration: "none", boxShadow: "0 4px 24px rgba(56,178,172,0.3)",
            transition: "all 0.25s",
          }}>
            Get Started Free
          </Link>
          <Link href="/login" style={{
            padding: "14px 32px", borderRadius: 10, fontSize: 15, fontWeight: 600,
            border: "1px solid var(--border2)", color: "var(--text2)", textDecoration: "none",
          }}>
            View Demo →
          </Link>
        </div>

        {/* Feature grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16, marginTop: 80,
        }}>
          {features.map((f) => (
            <div key={f.title} style={{
              padding: 28, borderRadius: 14, textAlign: "left",
              border: "1px solid var(--border)", background: "var(--bg3)",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, marginBottom: 16,
                background: "rgba(56,178,172,0.1)", border: "1px solid rgba(56,178,172,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              }}>
                {f.icon}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, fontWeight: 300 }}>
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
