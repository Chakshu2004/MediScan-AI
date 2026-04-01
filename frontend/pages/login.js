/**
 * pages/login.js — Google OAuth login + demo mode
 */
import { useEffect } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import { useAuth } from "../utils/AuthContext";
import { getGoogleAuthUrl, googleCallback, setTokens } from "../utils/api";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

export default function LoginPage() {
  const { user, setUser, refetch } = useAuth();
  const router = useRouter();
  const { code } = router.query;

  // Redirect if already logged in
  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  // Handle OAuth callback code in URL
  useEffect(() => {
    if (!code) return;
    const handleCode = async () => {
      try {
        const { data } = await googleCallback(code);
        setTokens(data.access_token, data.refresh_token);
        await refetch();
        toast.success("Signed in successfully!");
        router.push("/dashboard");
      } catch {
        toast.error("Google sign-in failed. Please try again.");
        router.replace("/login");
      }
    };
    handleCode();
  }, [code]); // eslint-disable-line

  const handleGoogleLogin = async () => {
    try {
      const { data } = await getGoogleAuthUrl();
      window.location.href = data.url;
    } catch {
      toast.error("Could not reach authentication service");
    }
  };

  const handleDemo = () => {
    // In a real app, call a /auth/demo endpoint. Here we just show a toast.
    toast("Demo mode: connect a real backend to continue", { icon: "ℹ️" });
  };

  return (
    <Layout>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
        minHeight:"calc(100vh - 72px)", padding: 32 }}>
        <div style={{
          width: "100%", maxWidth: 400, padding: "48px 40px",
          borderRadius: 20, border: "1px solid var(--border)", background: "var(--bg3)",
        }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>🧠</div>
          <h2 style={{
            fontFamily: "var(--font-display, 'Fraunces', serif)",
            fontSize: 30, fontWeight: 400, marginBottom: 8,
          }}>
            Welcome back
          </h2>
          <p style={{ color:"var(--text2)", fontSize:14, marginBottom:36, fontWeight:300 }}>
            Sign in to access your medical report dashboard
          </p>

          {/* Google */}
          <button onClick={handleGoogleLogin} style={{
            width: "100%", padding: 14, borderRadius: 10, fontSize: 14, fontWeight: 600,
            cursor: "pointer", border: "1px solid var(--border2)",
            background: "var(--surface2)", color: "var(--text)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            fontFamily: "inherit", transition: "all 0.2s",
          }}>
            <GoogleIcon /> Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"24px 0",
            color:"var(--text3)", fontSize:12 }}>
            <div style={{ flex:1, height:1, background:"var(--border)" }} />
            or
            <div style={{ flex:1, height:1, background:"var(--border)" }} />
          </div>

          {/* Demo */}
          <button onClick={handleDemo} style={{
            width: "100%", padding: 14, borderRadius: 10, fontSize: 14, fontWeight: 600,
            cursor: "pointer", border: "none",
            background: "linear-gradient(135deg, var(--teal), #2c7a7b)",
            color: "white", fontFamily: "inherit",
          }}>
            Continue with Demo Account →
          </button>

          <p style={{ textAlign:"center", fontSize:12, color:"var(--text3)", marginTop:24, lineHeight:1.6 }}>
            By signing in you agree to our Terms of Service.<br />
            Your medical data is never shared with third parties.
          </p>
        </div>
      </div>
    </Layout>
  );
}
