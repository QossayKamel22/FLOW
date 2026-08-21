type Emotion = "neutral" | "happy" | "sad";

const emotionColor: Record<Emotion, string> = {
  neutral: "#7dd3fc",
  happy: "#6ee7b7",
  sad: "#93c5fd",
};

const emotionGlow: Record<Emotion, string> = {
  neutral: "rgba(99,102,241,0.45)",
  happy: "rgba(34,197,94,0.5)",
  sad: "rgba(99,102,241,0.3)",
};

export function BotOrb({ size = 40, active = false, emotion = "neutral" }: { size?: number; active?: boolean; emotion?: Emotion }) {
  const eye = Math.max(3, size * 0.09);
  const satellite = Math.max(4, size * 0.11);
  const mouthColor = emotionColor[emotion];
  const browSize = size * 0.12;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: -size * 0.18,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${emotionGlow[emotion]}, transparent 70%)`,
          filter: "blur(4px)",
          animation: active ? "orbPulse 1.3s ease-in-out infinite" : "orbPulse 3s ease-in-out infinite",
          transition: "background 400ms ease",
        }}
      />
      {emotion === "happy" && (
        <>
          <span style={{ position: "absolute", top: -size * 0.1, left: size * 0.06, fontSize: size * 0.22, animation: "sparkleFloat 2s ease-in-out infinite" }}>✦</span>
          <span style={{ position: "absolute", top: size * 0.02, right: -size * 0.1, fontSize: size * 0.16, animation: "sparkleFloat 2.4s ease-in-out infinite 0.4s" }}>✦</span>
        </>
      )}
      <div
        className="bot-orb-body"
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          background: "var(--gradient-brand-diag)",
          padding: size * 0.09,
          boxShadow: "0 4px 18px rgba(99,102,241,0.5)",
          animation: active
            ? "botBounceActive 900ms ease-in-out infinite"
            : emotion === "sad"
            ? "botBounceSad 3.8s ease-in-out infinite"
            : "botBounceIdle 3.2s ease-in-out infinite",
          transformOrigin: "50% 100%",
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
          <div
            className="bot-orb-face"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: size * 0.06,
              animation: active ? "eyeLookActive 2.4s ease-in-out infinite" : "eyeLookIdle 5s ease-in-out infinite",
            }}
          >
            <div style={{ position: "relative", display: "flex", gap: size * 0.16 }}>
              {emotion === "sad" && (
                <>
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: -size * 0.11,
                      left: -size * 0.01,
                      width: browSize,
                      height: Math.max(1.2, size * 0.025),
                      background: "#93c5fd",
                      borderRadius: 2,
                      opacity: 0.85,
                      transform: "rotate(-22deg)",
                      transformOrigin: "left center",
                    }}
                  />
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: -size * 0.11,
                      right: -size * 0.01,
                      width: browSize,
                      height: Math.max(1.2, size * 0.025),
                      background: "#93c5fd",
                      borderRadius: 2,
                      opacity: 0.85,
                      transform: "rotate(22deg)",
                      transformOrigin: "right center",
                    }}
                  />
                </>
              )}
              <span
                className="bot-orb-eye"
                style={{
                  width: eye,
                  height: emotion === "happy" ? eye * 0.7 : eye,
                  borderRadius: "50%",
                  background: emotionColor[emotion],
                  boxShadow: `0 0 6px 1px ${emotionColor[emotion]}e6`,
                  animation:
                    emotion === "happy"
                      ? "none"
                      : active
                      ? "orbBlinkExpressive 2.2s ease-in-out infinite"
                      : "orbBlinkExpressive 4.5s ease-in-out infinite",
                  transition: "height 300ms ease, background 400ms ease",
                }}
              />
              <span
                className="bot-orb-eye"
                style={{
                  width: eye,
                  height: emotion === "happy" ? eye * 0.7 : eye,
                  borderRadius: "50%",
                  background: emotionColor[emotion],
                  boxShadow: `0 0 6px 1px ${emotionColor[emotion]}e6`,
                  animation:
                    emotion === "happy"
                      ? "none"
                      : active
                      ? "orbBlinkExpressive 2.2s ease-in-out infinite"
                      : "orbBlinkExpressive 4.5s ease-in-out infinite",
                  transition: "height 300ms ease, background 400ms ease",
                }}
              />
            </div>
            {emotion === "sad" ? (
              <div
                style={{
                  width: size * 0.28,
                  height: size * 0.12,
                  borderTop: `${Math.max(1.4, size * 0.035)}px solid ${mouthColor}`,
                  borderRadius: "50% 50% 0 0",
                  marginTop: size * 0.04,
                  transition: "border-color 400ms ease",
                }}
              />
            ) : emotion === "happy" ? (
              <div
                style={{
                  width: size * 0.4,
                  height: size * 0.22,
                  borderBottom: `${Math.max(1.8, size * 0.045)}px solid ${mouthColor}`,
                  borderRadius: "0 0 50% 50%",
                  transition: "border-color 400ms ease",
                }}
              />
            ) : (
              <div
                style={{
                  width: size * 0.34,
                  height: size * 0.16,
                  borderBottom: `${Math.max(1.4, size * 0.035)}px solid ${mouthColor}`,
                  borderRadius: "0 0 50% 50%",
                  transition: "border-color 400ms ease",
                }}
              />
            )}
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
          background: emotion === "sad" ? "#64748b" : "#38bdf8",
          boxShadow: `0 0 8px 2px ${emotion === "sad" ? "rgba(100,116,139,0.6)" : "rgba(56,189,248,0.8)"}`,
          animation: active
            ? "antennaWiggleActive 900ms ease-in-out infinite"
            : emotion === "sad"
            ? "antennaWiggleIdle 5.5s ease-in-out infinite"
            : "antennaWiggleIdle 3.2s ease-in-out infinite",
          transformOrigin: "50% 150%",
          transition: "background 400ms ease",
        }}
      />
    </div>
  );
}
