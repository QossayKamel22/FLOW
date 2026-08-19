import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>
      <div
        className="auth-brand-panel"
        style={{
          flex: "0 0 46%",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 64px",
          background:
            "radial-gradient(circle at 15% 20%, rgba(99,102,241,0.35), transparent 45%), radial-gradient(circle at 85% 75%, rgba(34,211,238,0.25), transparent 45%), #05070f",
        }}
      >
        <svg
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.5 }}
          viewBox="0 0 800 1000"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="wave1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <path d="M-50 650 Q 200 550 400 650 T 850 620" stroke="url(#wave1)" strokeWidth="1.5" fill="none" opacity="0.55" />
          <path d="M-50 720 Q 200 630 400 720 T 850 690" stroke="url(#wave1)" strokeWidth="1.5" fill="none" opacity="0.4" />
          <path d="M-50 790 Q 200 700 400 790 T 850 760" stroke="url(#wave1)" strokeWidth="1.5" fill="none" opacity="0.3" />
          <path d="M-50 860 Q 200 780 400 860 T 850 830" stroke="url(#wave1)" strokeWidth="1.5" fill="none" opacity="0.2" />
        </svg>

        <div style={{ position: "relative", zIndex: 1 }}>
          <img src="/logo.png" alt="FLOW" style={{ width: 96, height: 96, borderRadius: 24, marginBottom: 24, boxShadow: "0 12px 40px rgba(99,102,241,0.45)" }} />
          <div style={{ fontSize: 40, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>FLOW</div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              marginTop: 2,
              marginBottom: 20,
              backgroundImage: "var(--gradient-brand)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            AI-Powered CRM
          </div>
          <div style={{ fontSize: 20, fontWeight: 600, color: "rgba(255,255,255,0.85)", lineHeight: 1.4 }}>
            Smarter CRM.
            <br />
            Better Sales.
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div className="auth-mobile-logo" style={{ display: "none", justifyContent: "center", marginBottom: 24 }}>
            <img src="/logo.png" alt="FLOW" style={{ width: 44, height: 44, borderRadius: 12 }} />
          </div>
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow-card)",
              padding: 28,
            }}
          >
            {children}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .auth-brand-panel { display: none !important; }
          .auth-mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
