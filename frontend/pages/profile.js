/**
 * pages/profile.js — User profile + account info
 */
import { useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../utils/AuthContext";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading || !user) return <Layout><LoadingSpinner /></Layout>;

  const joined = new Date(user.created_at).toLocaleDateString("en-IN", {
    month:"long", year:"numeric",
  });

  const initials = user.name
    .split(" ")
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Layout>
      <div style={{ maxWidth:640, margin:"0 auto", padding:"40px 32px" }}>
        <h2 style={{ fontFamily:"var(--font-display, 'Fraunces', serif)",
          fontSize:28, fontWeight:400, marginBottom:28 }}>
          Profile
        </h2>

        {/* Avatar card */}
        <div style={{ padding:36, borderRadius:16, border:"1px solid var(--border)",
          background:"var(--bg3)", marginBottom:20 }}>
          <div style={{
            width:72, height:72, borderRadius:"50%", marginBottom:20,
            background:"linear-gradient(135deg, var(--teal), #2c7a7b)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:24, fontWeight:700, border:"3px solid rgba(56,178,172,0.3)",
          }}>
            {user.picture
              ? <img src={user.picture} alt="avatar" style={{ width:"100%", height:"100%", borderRadius:"50%", objectFit:"cover" }} />
              : initials}
          </div>

          <div style={{ fontFamily:"var(--font-display, 'Fraunces', serif)", fontSize:26, fontWeight:400, marginBottom:4 }}>
            {user.name}
          </div>
          <div style={{ fontSize:13, color:"var(--text3)",
            fontFamily:"var(--font-mono, 'DM Mono', monospace)", marginBottom:28 }}>
            {user.email}
          </div>

          {/* Mini stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {[
              { val: user.report_count, label:"REPORTS" },
              { val: "Active",          label:"STATUS" },
              { val: joined,            label:"JOINED" },
            ].map(s => (
              <div key={s.label} style={{
                padding:16, borderRadius:10, background:"var(--surface)",
                border:"1px solid var(--border)", textAlign:"center",
              }}>
                <div style={{ fontSize:s.val.toString().length > 6 ? 13 : 22, fontWeight:600,
                  fontFamily:"var(--font-display, 'Fraunces', serif)", color:"var(--teal2)" }}>
                  {s.val}
                </div>
                <div style={{ fontSize:11, color:"var(--text3)",
                  fontFamily:"var(--font-mono, 'DM Mono', monospace)", marginTop:4 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account details */}
        <div style={{ padding:"24px 28px", borderRadius:16, border:"1px solid var(--border)",
          background:"var(--bg3)", marginBottom:20 }}>
          <div style={{ fontSize:13, fontWeight:600, letterSpacing:"1px", textTransform:"uppercase",
            color:"var(--text3)", fontFamily:"var(--font-mono, 'DM Mono', monospace)", marginBottom:16 }}>
            Account Details
          </div>
          {[
            ["Member since",     joined],
            ["Authentication",   "Google OAuth 2.0"],
            ["Data encryption",  "AES-256"],
            ["Account status",   "Active"],
          ].map(([k,v]) => (
            <div key={k} style={{ display:"flex", justifyContent:"space-between",
              padding:"12px 0", borderBottom:"1px solid var(--border)", fontSize:13 }}>
              <span style={{ color:"var(--text3)" }}>{k}</span>
              <span style={{ fontFamily:"var(--font-mono, 'DM Mono', monospace)", fontSize:12 }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Sign out */}
        <button
          onClick={logout}
          style={{
            width:"100%", padding:14, borderRadius:10, fontSize:14, fontWeight:600,
            cursor:"pointer", border:"1px solid rgba(252,129,129,0.3)",
            background:"rgba(252,129,129,0.05)", color:"var(--red)",
            fontFamily:"inherit", transition:"all 0.2s",
          }}
        >
          Sign Out
        </button>
      </div>
    </Layout>
  );
}
