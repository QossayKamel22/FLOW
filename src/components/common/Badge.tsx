import type { ReactNode } from "react";

type Tone = "neutral" | "accent" | "success" | "warning" | "danger" | "info";

const tones: Record<Tone, { bg: string; color: string }> = {
  neutral: { bg: "var(--bg-elevated)", color: "var(--text-secondary)" },
  accent: { bg: "var(--accent-soft)", color: "var(--accent)" },
  success: { bg: "rgba(34,197,94,0.14)", color: "var(--success)" },
  warning: { bg: "rgba(245,158,11,0.14)", color: "var(--warning)" },
  danger: { bg: "rgba(239,68,68,0.14)", color: "var(--danger)" },
  info: { bg: "rgba(56,189,248,0.14)", color: "#38bdf8" },
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  const t = tones[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: t.bg,
        color: t.color,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

const statusTone: Record<string, Tone> = {
  New: "info",
  Contacted: "accent",
  Qualified: "warning",
  Proposal: "warning",
  Won: "success",
  Lost: "danger",
  Active: "success",
  Inactive: "neutral",
  Lead: "info",
  Negotiation: "warning",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={statusTone[status] ?? "neutral"}>{status}</Badge>;
}

export function ScoreBadge({ score }: { score: number }) {
  const tier = score >= 80 ? "Hot" : score >= 50 ? "Warm" : "Cold";
  const tone: Tone = tier === "Hot" ? "danger" : tier === "Warm" ? "warning" : "neutral";
  return <Badge tone={tone}>{score} — {tier}</Badge>;
}
