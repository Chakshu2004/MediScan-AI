/**
 * components/Navbar.js
 */
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../utils/AuthContext";

const BrainIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-4.24z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-4.24z"/>
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const router           = useRouter();
  const path             = router.pathname;

  const navLink = (href, label) => (
    <Link
      href={href}
      style={{
        padding: "7px 14px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 500,
        color: path === href ? "var(--teal2)" : "var(--text2)",
        background: path === href ? "rgba(56,178,172,0.12)" : "transparent",
        textDecoration: "none",
        transition: "all 0.2s",
      }}
    >
      {label}
    </Link>
  );

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 32px",
      background: "rgba(10,13,18,0.85)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border)",
    }}>
      {/* Logo */}
      <Link href={user ? "/dashboard" : "/"} style={{ display:"flex", alignItems:"center", gap:10,
        fontFamily:"var(--font-display, 'Fraunces', serif)", fontSize:18, fontWeight:600,
        color:"var(--teal2)", textDecoration:"none" }}>
        <BrainIcon />
        MediScan AI
      </Link>

      {/* Links */}
      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
        {user ? (
          <>
            {navLink("/dashboard", "Dashboard")}
            {navLink("/upload",    "Upload")}
            {navLink("/profile",   "Profile")}
            <button
              onClick={logout}
              style={{
                padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                border: "none", background: "transparent", color: "var(--text2)",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <Link href="/login" style={{
            padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            border: "1px solid var(--teal)", background: "rgba(56,178,172,0.1)",
            color: "var(--teal2)", textDecoration: "none",
          }}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
