/**
 * pages/404.js
 */
import Link from "next/link";
import Layout from "../components/Layout";

export default function NotFound() {
  return (
    <Layout>
      <div style={{ textAlign:"center", padding:"120px 32px" }}>
        <div style={{ fontFamily:"var(--font-display,'Fraunces',serif)",
          fontSize:96, fontWeight:400, color:"var(--teal2)", marginBottom:16 }}>
          404
        </div>
        <p style={{ fontSize:16, color:"var(--text2)", marginBottom:32 }}>
          This page doesn't exist — or you may need to log in.
        </p>
        <Link href="/" style={{
          padding:"12px 28px", borderRadius:10, fontSize:14, fontWeight:600,
          background:"linear-gradient(135deg,var(--teal),#2c7a7b)", color:"white",
          textDecoration:"none",
        }}>
          Go Home
        </Link>
      </div>
    </Layout>
  );
}
