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

        {[
          { top: "8%", right: "10%", size: 3, color: "#7dd3fc", duration: 3.2, delay: 0 },
          { top: "22%", right: "22%", size: 2, color: "#c4b5fd", duration: 4, delay: 0.6 },
          { top: "68%", right: "14%", size: 2.5, color: "#67e8f9", duration: 3.6, delay: 1.2 },
          { top: "78%", right: "32%", size: 2, color: "#a5b4fc", duration: 4.4, delay: 0.3 },
          { top: "14%", right: "38%", size: 1.5, color: "#7dd3fc", duration: 3.8, delay: 1.8 },
          { top: "45%", right: "6%", size: 2, color: "#c4b5fd", duration: 3.4, delay: 0.9 },
        ].map((p, i) => (
          <div
            key={i}
            aria-hidden="true"
            style={{
              position: "absolute",
              top: p.top,
              right: p.right,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: p.color,
              boxShadow: `0 0 8px 2px ${p.color}`,
              animation: `authTwinkle ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: -200,
            background: "radial-gradient(circle at 20% 25%, rgba(99,102,241,0.25), transparent 40%), radial-gradient(circle at 80% 75%, rgba(34,211,238,0.2), transparent 40%)",
            animation: "authNebula 14s ease-in-out infinite",
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
                animation: "orbPulse 3.5s ease-in-out infinite",
              }}
            />
            <svg aria-hidden="true" style={{ position: "absolute", inset: -20, animation: "spin 18s linear infinite" }} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="47" fill="none" stroke="url(#authRing)" strokeWidth="0.6" strokeDasharray="4 10" strokeLinecap="round" opacity="0.6" />
              <defs>
                <linearGradient id="authRing" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
            </svg>
            <img src="/logo.svg" alt="FLOW" style={{ position: "relative", width: 232, height: 232, filter: "drop-shadow(0 18px 40px rgba(34,211,238,0.25))" }} />
          </div>
          <div style={{ fontSize: 52, fontWeight: 800, color: "#fff", letterSpacing: -1, lineHeight: 1 }}>FLOW</div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginTop: 6,
              marginBottom: 24,
              backgroundImage: "linear-gradient(90deg, #6366f1, #22d3ee, #6366f1)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: 0.2,
              animation: "shimmerText 4s linear infinite",
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
              className="animated-gradient-border"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                backgroundImage: "linear-gradient(90deg, #6366f1, #8b5cf6, #22d3ee, #6366f1)",
              }}
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
        @keyframes authTwinkle {
          0%, 100% { opacity: 0.25; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes authNebula {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.06); }
        }
      `}</style>
    </div>
  );
}
