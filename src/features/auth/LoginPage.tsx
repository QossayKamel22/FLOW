import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { ProviderButtons, GuestLink } from "./ProviderButtons";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { friendlyAuthError } from "../../lib/errors";
import { useToast } from "../../context/ToastContext";
import { LoadingScreen } from "../../components/common/LoadingScreen";

export function LoginPage() {
  const { logIn, firebaseReady } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authenticating, setAuthenticating] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setAuthenticating(true);
    try {
      await logIn(email, password);
      navigate("/app");
    } catch (err) {
      setError((err as Error).message);
      setAuthenticating(false);
    }
  }

  function handleError(message: string) {
    setError(message || null);
    if (message) setAuthenticating(false);
  }

  async function handleForgotPassword() {
    if (!auth) return setError("Firebase is not configured yet.");
    if (!email) return setError("Enter your email above first, then click Forgot password.");
    try {
      await sendPasswordResetEmail(auth, email);
      show("Password reset email sent.", "success");
    } catch (err) {
      setError(friendlyAuthError(err));
    }
  }

  if (authenticating) return <LoadingScreen />;

  return (
    <AuthLayout>
      {!firebaseReady && (
        <div style={{ marginBottom: 16, fontSize: 12.5, color: "var(--warning)" }}>
          Firebase isn't configured yet — add your project keys to .env to enable sign in.
        </div>
      )}
      <h2 style={{ fontSize: 19, fontWeight: 800, marginBottom: 4 }}>Welcome back 👋</h2>
      <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 22 }}>
        Sign in to continue to your workspace.
      </p>

      <ProviderButtons onError={handleError} onStart={() => setAuthenticating(true)} />

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>or</span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Input label="Email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember me
          </label>
          <button type="button" onClick={handleForgotPassword} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: 13 }}>
            Forgot password?
          </button>
        </div>
        {error && <div style={{ color: "var(--danger)", fontSize: 13 }}>{error}</div>}
        <Button type="submit" fullWidth>
          Sign in
        </Button>
      </form>

      <GuestLink onError={handleError} onStart={() => setAuthenticating(true)} />

      <p style={{ textAlign: "center", fontSize: 13.5, color: "var(--text-secondary)", marginTop: 20 }}>
        Don't have an account? <Link to="/signup" style={{ color: "var(--accent)", fontWeight: 600 }}>Create account</Link>
      </p>
    </AuthLayout>
  );
}
