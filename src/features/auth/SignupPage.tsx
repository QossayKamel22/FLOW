import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { ProviderButtons, GuestLink } from "./ProviderButtons";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";

export function SignupPage() {
  const { signUp, firebaseReady } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name || !email || !password) {
      setError("Fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await signUp(name, email, password);
      navigate("/onboarding");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      {!firebaseReady && (
        <div style={{ marginBottom: 16, fontSize: 12.5, color: "var(--warning)" }}>
          Firebase isn't configured yet — add your project keys to .env to enable sign up.
        </div>
      )}
      <h2 style={{ fontSize: 19, fontWeight: 800, marginBottom: 4 }}>Create your workspace</h2>
      <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 22 }}>
        Start managing your sales pipeline with FLOW.
      </p>

      <ProviderButtons onError={(m) => setError(m || null)} />

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>or</span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <div style={{ color: "var(--danger)", fontSize: 13 }}>{error}</div>}
        <Button type="submit" fullWidth loading={loading}>
          Create account
        </Button>
      </form>

      <GuestLink onError={(m) => setError(m || null)} />

      <p style={{ textAlign: "center", fontSize: 13.5, color: "var(--text-secondary)", marginTop: 20 }}>
        Already have an account? <Link to="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>Sign in</Link>
      </p>
    </AuthLayout>
  );
}
