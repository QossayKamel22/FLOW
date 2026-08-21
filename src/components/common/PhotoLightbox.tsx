import { useEffect } from "react";
import { createPortal } from "react-dom";

export function PhotoLightbox({ photoURL, name, onClose }: { photoURL: string | null; name: string; onClose: () => void }) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${name || "Profile"} photo`}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(3, 4, 8, 0.85)",
        backdropFilter: "blur(8px)",
        animation: "fadeIn 150ms ease",
        padding: 24,
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: "absolute",
          top: 20,
          right: 24,
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(255,255,255,0.08)",
          color: "#fff",
          fontSize: 18,
          cursor: "pointer",
        }}
      >
        ✕
      </button>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: "popIn 220ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {photoURL ? (
          <img
            src={photoURL}
            alt={name || "Profile"}
            style={{
              width: "min(60vh, 60vw, 420px)",
              height: "min(60vh, 60vw, 420px)",
              borderRadius: "50%",
              objectFit: "cover",
              boxShadow: "0 0 0 4px rgba(212,175,106,0.5), 0 30px 80px -20px rgba(0,0,0,0.7)",
            }}
          />
        ) : (
          <div
            style={{
              width: "min(60vh, 60vw, 420px)",
              height: "min(60vh, 60vw, 420px)",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent), #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: "min(15vh, 15vw, 120px)",
              boxShadow: "0 30px 80px -20px rgba(0,0,0,0.7)",
            }}
          >
            {(name || "U").charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
