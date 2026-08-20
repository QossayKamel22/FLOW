import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../auth/AuthLayout";
import { BotOrb } from "../../components/common/BotOrb";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/common/Select";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { savePreferences } from "../../services/userService";

const industries = ["Software / SaaS", "E-commerce", "Real Estate", "Finance", "Healthcare", "Other"] as const;
const teamSizes = ["Just me", "2–5", "6–20", "21–50", "50+"] as const;
const aiSteps = [
  "Analyzing your business...",
  "Building sales pipeline...",
  "Setting up follow-up rules...",
  "Creating AI insights...",
  "Almost done!",
];

export function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [business, setBusiness] = useState("");
  const [industry, setIndustry] = useState<string>(industries[0]);
  const [teamSize, setTeamSize] = useState<string>(teamSizes[0]);
  const [aiIndex, setAiIndex] = useState(0);

  useEffect(() => {
    if (step !== 1) return;
    if (aiIndex >= aiSteps.length - 1) return;
    const t = setTimeout(() => setAiIndex((i) => i + 1), 700);
    return () => clearTimeout(t);
  }, [step, aiIndex]);

  async function finish() {
    if (user) {
      await savePreferences(user.uid, {
        displayName: user.displayName || "",
        businessName: business,
        industry,
      }).catch(() => undefined);
    }
    navigate("/app");
  }

  return (
    <AuthLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-tertiary)" }}>Step {step + 1} of 4</span>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: "var(--border)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: i <= step ? "100%" : "0%",
                background: "var(--gradient-brand-diag)",
                borderRadius: 4,
                transition: "width 500ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </div>
        ))}
      </div>

      {step === 0 && (
        <div key={step} style={{ animation: "fadeIn 350ms cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
            Hi {user?.displayName?.split(" ")[0] || "there"}! 👋
          </h2>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 20 }}>
            Tell me about your business. I'll configure FLOW for you.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input label="Business name" value={business} onChange={(e) => setBusiness(e.target.value)} />
            <Select label="Industry" options={industries} value={industry} onChange={(e) => setIndustry(e.target.value)} />
            <Select label="Team size" options={teamSizes} value={teamSize} onChange={(e) => setTeamSize(e.target.value)} />
            <Button fullWidth onClick={() => setStep(1)}>Continue</Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div key={step} style={{ textAlign: "center", padding: "20px 0", animation: "fadeIn 350ms cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <BotOrb size={64} active />
          </div>
          <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 18 }}>Setting up your AI workspace</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start", maxWidth: 260, margin: "0 auto" }}>
            {aiSteps.map((label, i) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: i <= aiIndex ? "var(--text-primary)" : "var(--text-tertiary)" }}>
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: i < aiIndex ? "var(--success)" : i === aiIndex ? "var(--accent-soft)" : "transparent",
                    border: i === aiIndex ? "none" : `1.5px solid ${i < aiIndex ? "var(--success)" : "var(--border-strong)"}`,
                  }}
                >
                  {i < aiIndex ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "popIn 200ms ease" }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : i === aiIndex ? (
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", animation: "orbPulse 1s ease-in-out infinite" }} />
                  ) : null}
                </span>
                {label}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 18 }}>
            Preview experience — this demonstrates FLOW's future AI setup.
          </p>
          <Button fullWidth style={{ marginTop: 18 }} onClick={() => setStep(2)} disabled={aiIndex < aiSteps.length - 1}>
            Continue
          </Button>
        </div>
      )}

      {step === 2 && (
        <div key={step} style={{ animation: "fadeIn 350ms cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Preferences</h2>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 20 }}>
            You can change these anytime in Settings.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {["Email notifications for follow-ups", "Daily AI briefing", "Weekly performance summary"].map((label) => (
              <label key={label} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: "var(--text-secondary)" }}>
                <input type="checkbox" defaultChecked />
                {label}
              </label>
            ))}
          </div>
          <Button fullWidth style={{ marginTop: 20 }} onClick={() => setStep(3)}>Continue</Button>
        </div>
      )}

      {step === 3 && (
        <div key={step} style={{ textAlign: "center", padding: "12px 0", animation: "fadeIn 350ms cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <div style={{ fontSize: 34, marginBottom: 14, animation: "popIn 500ms cubic-bezier(0.16, 1, 0.3, 1)" }}>🎉</div>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>You're all set, {business || "there"}!</h2>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 20 }}>
            Your FLOW workspace is ready. Let's start closing deals.
          </p>
          <Button fullWidth onClick={() => void finish()}>Go to dashboard</Button>
        </div>
      )}

      {step < 3 && (
        <button
          onClick={() => void finish()}
          style={{ display: "block", margin: "16px auto 0", background: "none", border: "none", color: "var(--text-tertiary)", fontSize: 12.5, cursor: "pointer" }}
        >
          Skip for now
        </button>
      )}
    </AuthLayout>
  );
}
