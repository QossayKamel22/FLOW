export function BotOrb({ size = 40, active = false }: { size?: number; active?: boolean }) {
  const eye = Math.max(3, size * 0.09);
  const satellite = Math.max(4, size * 0.11);

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: -size * 0.18,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.45), transparent 70%)",
          filter: "blur(4px)",
          animation: active ? "orbPulse 1.3s ease-in-out infinite" : "orbPulse 3s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          background: "var(--gradient-brand-diag)",
          padding: size * 0.09,
          boxShadow: "0 4px 18px rgba(99,102,241,0.5)",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 30%, #1e1b4b, #05070f 75%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: size * 0.06 }}>
            <div style={{ display: "flex", gap: size * 0.16 }}>
              <span
                style={{
                  width: eye,
                  height: eye,
                  borderRadius: "50%",
                  background: "#7dd3fc",
                  boxShadow: "0 0 6px 1px rgba(125,211,252,0.9)",
                  animation: active ? "orbBlink 2.6s ease-in-out infinite" : "none",
                }}
              />
              <span
                style={{
                  width: eye,
                  height: eye,
                  borderRadius: "50%",
                  background: "#7dd3fc",
                  boxShadow: "0 0 6px 1px rgba(125,211,252,0.9)",
                  animation: active ? "orbBlink 2.6s ease-in-out infinite" : "none",
                }}
              />
            </div>
            <div
              style={{
                width: size * 0.34,
                height: size * 0.16,
                borderBottom: `${Math.max(1.4, size * 0.035)}px solid #a5b4fc`,
                borderRadius: "0 0 50% 50%",
              }}
            />
          </div>
        </div>
      </div>
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -size * 0.08,
          right: size * 0.02,
          width: satellite,
          height: satellite,
          borderRadius: "50%",
          background: "#38bdf8",
          boxShadow: "0 0 8px 2px rgba(56,189,248,0.8)",
          animation: "botFloat 3.4s ease-in-out infinite",
        }}
      />
    </div>
  );
}
