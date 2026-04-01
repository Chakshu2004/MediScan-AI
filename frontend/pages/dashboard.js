/**
 * pages/dashboard.js — Main user dashboard with report history
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import ReportRow from "../components/ReportRow";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../utils/AuthContext";
import { listReports, deleteReport } from "../utils/api";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router   = useRouter();
  const [reports, setReports]   = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data } = await listReports();
        setReports(data);
      } catch {
        toast.error("Could not load reports");
      } finally {
        setFetching(false);
      }
    })();
  }, [user]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this report?")) return;
    try {
      await deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
      toast.success("Report deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  if (authLoading || fetching) return <Layout><LoadingSpinner message="Loading dashboard…" /></Layout>;

  const normal    = reports.filter(r => r.overall_status === "normal").length;
  const attention = reports.filter(r => r.overall_status === "attention").length;
  const critical  = reports.filter(r => r.overall_status === "critical").length;

  const today = new Date().toLocaleDateString("en-IN", {
    weekday:"long", day:"numeric", month:"long", year:"numeric",
  });

  return (
    <Layout>
      <div style={{ maxWidth: 1000, margin:"0 auto", padding:"40px 32px" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:40 }}>
          <div>
            <h2 style={{
              fontFamily:"var(--font-display, 'Fraunces', serif)",
              fontSize:28, fontWeight:400,
            }}>
              Hello, <em style={{ color:"var(--teal2)", fontStyle:"italic" }}>
                {user?.name?.split(" ")[0]}
              </em>
            </h2>
            <p style={{ fontSize:13, color:"var(--text3)", marginTop:4,
              fontFamily:"var(--font-mono, 'DM Mono', monospace)" }}>
              {today}
            </p>
          </div>
          <Link href="/upload" style={{
            padding:"10px 22px", borderRadius:10, fontSize:13, fontWeight:600,
            background:"linear-gradient(135deg, var(--teal), #2c7a7b)", color:"white",
            textDecoration:"none", boxShadow:"0 4px 16px rgba(56,178,172,0.25)",
          }}>
            + Upload Report
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:36 }}>
          <StatCard label="Total Reports" value={reports.length} />
          <StatCard label="Normal"         value={normal}         color="var(--green)" />
          <StatCard label="Attention"      value={attention}      color="var(--amber)" />
          <StatCard label="Critical"       value={critical}       color="var(--red)"   />
        </div>

        {/* Reports list */}
        <div style={{ fontSize:13, fontWeight:600, letterSpacing:"1px", textTransform:"uppercase",
          color:"var(--text3)", fontFamily:"var(--font-mono, 'DM Mono', monospace)", marginBottom:16 }}>
          Recent Reports
        </div>

        {reports.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📋</div>
            <p style={{ color:"var(--text2)", fontSize:14, marginBottom:24 }}>
              No reports yet. Upload your first medical report to get started.
            </p>
            <Link href="/upload" style={{
              padding:"12px 24px", borderRadius:10, fontSize:14, fontWeight:600,
              background:"linear-gradient(135deg, var(--teal), #2c7a7b)", color:"white",
              textDecoration:"none",
            }}>
              Upload Report
            </Link>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {reports.map((r) => (
              <ReportRow key={r.id} report={r} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
