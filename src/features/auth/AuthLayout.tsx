import type { ReactNode } from "react";
import { useTheme } from "../../context/ThemeContext";

export function AuthLayout({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#05070f", position: "relative" }}>
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 10,
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "1px solid var(--border)",
          background: "var(--bg-card)",
          color: "var(--text-primary)",
          cursor: "pointer",
          fontSize: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "var(--shadow-card)",
          transition: "transform var(--transition-fast)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08) rotate(15deg)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1) rotate(0deg)")}
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>
      <div
        className="auth-brand-panel"
        style={{
          flex: "0 0 48%",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "0 68px",
          background:
            "radial-gradient(circle at 15% 15%, rgba(99,102,241,0.4), transparent 45%), radial-gradient(circle at 85% 85%, rgba(34,211,238,0.3), transparent 45%), radial-gradient(circle at 50% 50%, rgba(139,92,246,0.15), transparent 60%), #05070f",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(circle at 30% 40%, black, transparent 75%)",
            WebkitMaskImage: "radial-gradient(circle at 30% 40%, black, transparent 75%)",
          }}
        />

        <svg
          aria-hidden="true"
          className="auth-waves"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.55 }}
          viewBox="0 0 800 1000"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="wave1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <path d="M-50 640 Q 200 540 400 640 T 850 610" stroke="url(#wave1)" strokeWidth="1.5" fill="none" opacity="0.6" />
          <path d="M-50 710 Q 200 620 400 710 T 850 680" stroke="url(#wave1)" strokeWidth="1.5" fill="none" opacity="0.45" />
          <path d="M-50 780 Q 200 690 400 780 T 850 750" stroke="url(#wave1)" strokeWidth="1.5" fill="none" opacity="0.32" />
          <path d="M-50 850 Q 200 770 400 850 T 850 820" stroke="url(#wave1)" strokeWidth="1.5" fill="none" opacity="0.2" />
          <path d="M-50 920 Q 200 850 400 920 T 850 890" stroke="url(#wave1)" strokeWidth="1.5" fill="none" opacity="0.12" />
        </svg>

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "8%",
            right: "10%",
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: "#7dd3fc",
            boxShadow: "0 0 8px 2px rgba(125,211,252,0.8)",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "22%",
            right: "22%",
            width: 2,
            height: 2,
            borderRadius: "50%",
            background: "#c4b5fd",
            boxShadow: "0 0 6px 2px rgba(196,181,253,0.7)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ position: "relative", width: 232, height: 232, marginBottom: 24 }}>
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: -44,
                background: "radial-gradient(circle, rgba(99,102,241,0.5), transparent 70%)",
                filter: "blur(12px)",
              }}
            />
            <img src="/logo.svg" alt="FLOW" style={{ position: "relative", width: 232, height: 232, filter: "drop-shadow(0 18px 40px rgba(34,211,238,0.25))" }} />
          </div>
          <div style={{ fontSize: 52, fontWeight: 800, color: "#fff", letterSpacing: -1, lineHeight: 1 }}>FLOW</div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginTop: 6,
              marginBottom: 24,
              backgroundImage: "var(--gradient-brand)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: 0.2,
            }}
          >
            AI-Powered CRM
          </div>
          <div style={{ fontSize: 21, fontWeight: 600, color: "rgba(255,255,255,0.88)", lineHeight: 1.45 }}>
            Smarter CRM.
            <br />
            Better Sales.
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 11,
            color: "rgba(255,255,255,0.35)",
            letterSpacing: 0.2,
          }}
        >
          Copyright © {new Date().getFullYear()} Qossay Kamel. All rights reserved.
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          position: "relative",
          background: "radial-gradient(circle at 70% 30%, rgba(99,102,241,0.06), transparent 55%), var(--bg)",
        }}
      >
        <div style={{ width: "100%", maxWidth: 408, animation: "fadeIn 400ms ease" }}>
          <div className="auth-mobile-logo" style={{ display: "none", justifyContent: "center", marginBottom: 24 }}>
            <img src="/logo.svg" alt="FLOW" style={{ width: 64, height: 64 }} />
          </div>
          <div
            style={{
              position: "relative",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.4), 0 24px 60px -12px rgba(99,102,241,0.18), var(--shadow-card)",
              padding: 32,
              overflow: "hidden",
            }}
          >
            <div
              aria-hidden="true"
              style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "var(--gradient-brand-diag)" }}
            />
            {children}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .auth-brand-panel { display: none !important; }
          .auth-mobile-logo { display: flex !important; }
        }
        .auth-waves path {
          animation: authWaveDrift 16s ease-in-out infinite;
        }
        .auth-waves path:nth-child(2) { animation-duration: 20s; animation-delay: -3s; }
        .auth-waves path:nth-child(3) { animation-duration: 24s; animation-delay: -6s; }
        .auth-waves path:nth-child(4) { animation-duration: 28s; animation-delay: -9s; }
        .auth-waves path:nth-child(5) { animation-duration: 32s; animation-delay: -12s; }
        @keyframes authWaveDrift {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(24px); }
        }
      `}</style>
    </div>
  );
}
