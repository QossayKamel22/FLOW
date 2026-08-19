import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.68-3.87 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.81.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03l2.97-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58Z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 384 512" aria-hidden="true" fill="currentColor">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141 0 184.8 0 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-57.7-90-57.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 21 21" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}

export function ProviderButtons({ onError }: { onError: (message: string) => void }) {
  const { signInWithGoogle, firebaseReady } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function handleGoogle() {
    onError("");
    setBusy(true);
    try {
      await signInWithGoogle();
      navigate("/app");
    } catch (err) {
      onError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Button type="button" variant="secondary" fullWidth disabled={!firebaseReady} loading={busy} onClick={handleGoogle}>
        <GoogleIcon /> Continue with Google
      </Button>
      <Button type="button" variant="secondary" fullWidth disabled title="Coming soon">
        <MicrosoftIcon /> Continue with Microsoft
      </Button>
      <Button type="button" variant="secondary" fullWidth disabled title="Coming soon">
        <AppleIcon /> Continue with Apple
      </Button>
    </div>
  );
}

export function GuestLink({ onError }: { onError: (message: string) => void }) {
  const { signInAsGuest, firebaseReady } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function handleGuest() {
    onError("");
    setBusy(true);
    try {
      await signInAsGuest();
      navigate("/app");
    } catch (err) {
      onError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleGuest}
      disabled={!firebaseReady || busy}
      style={{
        display: "block",
        margin: "16px auto 0",
        background: "none",
        border: "none",
        color: "var(--text-secondary)",
        fontSize: 13,
        cursor: "pointer",
        opacity: !firebaseReady || busy ? 0.6 : 1,
      }}
    >
      {busy ? "…" : "Continue as guest"}
    </button>
  );
}
