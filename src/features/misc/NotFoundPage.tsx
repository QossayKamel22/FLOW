import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function NotFoundPage() {
  const { user } = useAuth();
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        padding: 24,
        textAlign: "center",
      }}
    >
      <img src="/logo.svg" alt="FLOW" style={{ width: 56, height: 56, opacity: 0.7, marginBottom: 6 }} />
      <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1, backgroundImage: "var(--gradient-brand)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
        404
      </div>
      <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Page not found</h1>
      <p style={{ fontSize: 13.5, color: "var(--text-secondary)", maxWidth: 360, margin: 0 }}>
        That page doesn't exist or may have moved.
      </p>
      <Link
        to={user ? "/app" : "/login"}
        style={{
          marginTop: 8,
          padding: "10px 20px",
          borderRadius: 999,
          background: "var(--gradient-brand-diag)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 13.5,
          textDecoration: "none",
        }}
      >
        {user ? "Back to Dashboard" : "Back to Sign in"}
      </Link>
    </div>
  );
}
