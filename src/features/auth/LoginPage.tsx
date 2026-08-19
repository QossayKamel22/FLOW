import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { ProviderButtons } from "./ProviderButtons";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { friendlyAuthError } from "../../lib/errors";
import { useToast } from "../../context/ToastContext";

export function LoginPage() {
  const { logIn, firebaseReady } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await logIn(email, password);
      navigate("/app");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
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

  return (
    <AuthLayout>
      {!firebaseReady && (
        <div style={{ marginBottom: 16, fontSize: 12.5, color: "var(--warning)" }}>
          Firebase isn't configured yet — add your project keys to .env to enable sign in.
        </div>
      )}
      <h2 style={{ fontSize: 19, fontWeight: 800, marginBottom: 4 }}>Welcome back</h2>
      <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 22 }}>
        Sign in to your FLOW workspace.
      </p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Input label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
        <Button type="submit" fullWidth loading={loading}>
          Sign in
        </Button>
      </form>
      <ProviderButtons onError={setError} />
      <p style={{ textAlign: "center", fontSize: 13.5, color: "var(--text-secondary)", marginTop: 20 }}>
        Don't have an account? <Link to="/signup" style={{ color: "var(--accent)", fontWeight: 600 }}>Create account</Link>
      </p>
    </AuthLayout>
  );
}
