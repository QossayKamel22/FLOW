import { Card } from "../ui/Card";

const tones = {
  indigo: "linear-gradient(135deg, #6366f1, #4f46e5)",
  cyan: "linear-gradient(135deg, #22d3ee, #0891b2)",
  violet: "linear-gradient(135deg, #a855f7, #7c3aed)",
  emerald: "linear-gradient(135deg, #34d399, #059669)",
} as const;

export function KpiCard({
  label,
  value,
  trend,
  icon,
  tone = "indigo",
}: {
  label: string;
  value: string;
  trend?: string;
  icon: string;
  tone?: keyof typeof tones;
}) {
  return (
    <Card
      style={{ display: "flex", flexDirection: "column", gap: 10, transition: "transform var(--transition-base), box-shadow var(--transition-base)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.4), 0 16px 32px -8px rgba(99,102,241,0.22)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "var(--shadow-card)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>{label}</span>
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: tones[tone],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
          }}
        >
          {icon}
        </span>
      </div>
      <div style={{ fontSize: 27, fontWeight: 800, letterSpacing: -0.5 }}>{value}</div>
      {trend && <div style={{ fontSize: 12.5, color: "var(--success)", fontWeight: 600 }}>{trend}</div>}
    </Card>
  );
}
