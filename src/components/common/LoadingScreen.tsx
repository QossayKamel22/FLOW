import { useEffect, useState } from "react";

const tips = [
  "Syncing your pipeline…",
  "Warming up the dashboard…",
  "Checking today's follow-ups…",
  "Almost there…",
];

export function LoadingScreen() {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTipIndex((i) => (i + 1) % tips.length), 1500);
    return () => clearInterval(t);
  }, []);

  const tip = tips[tipIndex];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        background:
          "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.28), transparent 45%), radial-gradient(circle at 80% 80%, rgba(34,211,238,0.22), transparent 45%), #05070f",
        zIndex: 999,
      }}
    >
      <div style={{ position: "relative", width: 96, height: 96 }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: -20,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.5), transparent 70%)",
            filter: "blur(10px)",
            animation: "orbPulse 1.6s ease-in-out infinite",
          }}
        />
        <svg width="96" height="96" viewBox="0 0 100 100" style={{ position: "absolute", inset: 0 }} aria-hidden="true">
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="3"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="url(#loadingRing)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="70 200"
            style={{ transformOrigin: "50px 50px", animation: "spin 1.1s linear infinite" }}
          />
          <defs>
            <linearGradient id="loadingRing" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
        </svg>
        <img
          src="/logo.svg"
          alt="FLOW"
          style={{ position: "absolute", inset: 0, margin: "auto", width: 52, height: 52, animation: "loadingBreathe 1.6s ease-in-out infinite" }}
        />
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: -0.3 }}>FLOW</div>
        <div key={tip} style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 6, animation: "fadeIn 400ms ease" }}>
          {tip}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes loadingBreathe {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.08); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
