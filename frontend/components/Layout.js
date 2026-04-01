/**
 * components/Layout.js — Page shell with Navbar
 */
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
      <Navbar />
      <main style={{ paddingTop: 72, position: "relative", zIndex: 1 }}>
        {children}
      </main>
    </div>
  );
}
