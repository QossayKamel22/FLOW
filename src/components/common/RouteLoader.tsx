export function RouteLoader() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        pointerEvents: "none",
        animation: "fadeIn 120ms ease",
      }}
    >
      <div style={{ position: "relative", width: 64, height: 64 }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: -16,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.5), transparent 70%)",
            filter: "blur(8px)",
            animation: "orbPulse 1s ease-in-out infinite",
          }}
        />
        <svg width="64" height="64" viewBox="0 0 100 100" style={{ position: "absolute", inset: 0 }} aria-hidden="true">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(120,120,140,0.2)" strokeWidth="4" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="url(#routeLoaderRing)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="66 200"
            style={{ transformOrigin: "50px 50px", animation: "spin 0.9s linear infinite" }}
          />
          <defs>
            <linearGradient id="routeLoaderRing" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
        </svg>
        <img
          src="/logo.svg"
          alt=""
          style={{ position: "absolute", inset: 0, margin: "auto", width: 32, height: 32, animation: "loadingBreathe 1s ease-in-out infinite" }}
        />
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes loadingBreathe { 0%, 100% { transform: scale(1); opacity: 0.9; } 50% { transform: scale(1.08); opacity: 1; } }
      `}</style>
    </div>
  );
}
