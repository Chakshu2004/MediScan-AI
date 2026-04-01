/**
 * pages/analysis/[id].js — View AI analysis for a specific report
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import toast from "react-hot-toast";
import Layout from "../../components/Layout";
import ParameterCard from "../../components/ParameterCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../utils/AuthContext";
import { getAnalysis } from "../../utils/api";

const STATUS_STYLES = {
  normal:    { bg:"rgba(104,211,145,0.08)", border:"rgba(104,211,145,0.2)", color:"var(--green)", label:"All clear" },
  attention: { bg:"rgba(237,137,54,0.08)",  border:"rgba(237,137,54,0.2)",  color:"var(--amber)", label:"Needs attention" },
  critical:  { bg:"rgba(252,129,129,0.08)", border:"rgba(252,129,129,0.2)", color:"var(--red)",   label:"Critical — see a doctor" },
};

export default function AnalysisPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!id || !user) return;
    (async () => {
      try {
        const { data } = await getAnalysis(id);
        setAnalysis(data);
      } catch (err) {
        toast.error(err?.response?.data?.detail || "Could not load analysis");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user]);

  if (authLoading || loading) return <Layout><LoadingSpinner message="Loading analysis…" /></Layout>;

  if (!analysis) return (
    <Layout>
      <div style={{ textAlign:"center", padding:"80px 32px" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>❌</div>
        <p style={{ color:"var(--text2)", marginBottom:24 }}>Analysis not found or not yet complete.</p>
        <Link href="/upload" style={{
          padding:"12px 24px", borderRadius:10, fontSize:14, fontWeight:600,
          background:"linear-gradient(135deg, var(--teal), #2c7a7b)", color:"white", textDecoration:"none",
        }}>Upload New Report</Link>
      </div>
    </Layout>
  );

  const st = STATUS_STYLES[analysis.overall_status] || STATUS_STYLES.normal;

  return (
    <Layout>
      <div style={{ maxWidth:820, margin:"0 auto", padding:"40px 32px" }}>

        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <span style={{
            display:"inline-block", padding:"4px 12px", borderRadius:20, fontSize:12,
            background:"rgba(56,178,172,0.1)", border:"1px solid rgba(56,178,172,0.2)",
            color:"var(--teal2)", fontWeight:500, marginBottom:10,
          }}>
            {analysis.report_name}
          </span>
          <h2 style={{ fontFamily:"var(--font-display, 'Fraunces', serif)",
            fontSize:28, fontWeight:400, marginBottom:6 }}>
            Analysis Results
          </h2>
          <div style={{ fontSize:12, color:"var(--text3)",
            fontFamily:"var(--font-mono, 'DM Mono', monospace)" }}>
            AI-powered insights
          </div>
        </div>

        {/* Overall status banner */}
        <div style={{
          padding:"14px 20px", borderRadius:12, marginBottom:28,
          background:st.bg, border:`1px solid ${st.border}`,
          display:"flex", alignItems:"center", gap:10,
        }}>
          <span style={{ fontSize:18 }}>
            {analysis.overall_status === "normal" ? "✅" :
             analysis.overall_status === "attention" ? "⚠️" : "🚨"}
          </span>
          <span style={{ fontWeight:600, color:st.color }}>{st.label}</span>
        </div>

        {/* AI Summary */}
        <div style={{
          padding:24, borderRadius:14, marginBottom:28,
          border:"1px solid rgba(56,178,172,0.2)",
          background:"linear-gradient(135deg, rgba(56,178,172,0.06), transparent)",
        }}>
          <div style={{ fontSize:11, fontFamily:"var(--font-mono, 'DM Mono', monospace)",
            color:"var(--teal2)", letterSpacing:1, marginBottom:10 }}>
            🧠 AI SUMMARY
          </div>
          <p style={{ fontSize:14, lineHeight:1.8, color:"var(--text2)" }}>
            {analysis.summary}
          </p>
        </div>

        {/* Parameters grid */}
        {analysis.parameters?.length > 0 && (
          <>
            <div style={{ fontSize:13, fontWeight:600, letterSpacing:"1px", textTransform:"uppercase",
              color:"var(--text3)", fontFamily:"var(--font-mono, 'DM Mono', monospace)", marginBottom:16 }}>
              Health Parameters
            </div>
            <div style={{
              display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))",
              gap:12, marginBottom:28,
            }}>
              {analysis.parameters.map((p, i) => (
                <ParameterCard key={i} param={p} />
              ))}
            </div>
          </>
        )}

        {/* Recommendations */}
        {analysis.recommendations?.length > 0 && (
          <>
            <div style={{ fontSize:13, fontWeight:600, letterSpacing:"1px", textTransform:"uppercase",
              color:"var(--text3)", fontFamily:"var(--font-mono, 'DM Mono', monospace)", marginBottom:16 }}>
              Recommendations
            </div>
            <div style={{
              padding:24, borderRadius:14, border:"1px solid var(--border)",
              background:"var(--bg3)", marginBottom:24,
            }}>
              {analysis.recommendations.map((r, i) => (
                <div key={i} style={{
                  display:"flex", gap:12, padding:"12px 0",
                  borderBottom: i < analysis.recommendations.length - 1 ? "1px solid var(--border)" : "none",
                }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{r.icon}</span>
                  <span style={{ fontSize:13, color:"var(--text2)", lineHeight:1.6 }}>{r.text}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Disclaimer */}
        <div style={{
          padding:"14px 18px", borderRadius:10, fontSize:12, color:"var(--text3)",
          background:"var(--bg3)", border:"1px solid var(--border)", lineHeight:1.6,
          fontStyle:"italic", marginBottom:24,
        }}>
          ⚕️ This analysis is generated by AI for informational purposes only and does not constitute
          medical advice. Please consult a qualified healthcare professional for diagnosis and treatment.
        </div>

        {/* Actions */}
        <div style={{ display:"flex", gap:12 }}>
          <Link href="/upload" style={{
            flex:1, padding:12, borderRadius:10, fontSize:14, fontWeight:600,
            border:"1px solid var(--border2)", color:"var(--text2)", textDecoration:"none",
            textAlign:"center",
          }}>
            ← Upload Another
          </Link>
          <Link href="/dashboard" style={{
            flex:1, padding:12, borderRadius:10, fontSize:14, fontWeight:600,
            background:"linear-gradient(135deg, var(--teal), #2c7a7b)", color:"white",
            textDecoration:"none", textAlign:"center",
          }}>
            Dashboard →
          </Link>
        </div>
      </div>
    </Layout>
  );
}
