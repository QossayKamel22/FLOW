import { Card } from "../ui/Card";

export function KpiCard({
  label,
  value,
  trend,
  icon,
}: {
  label: string;
  value: string;
  trend?: string;
  icon: string;
}) {
  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>{label}</span>
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: "var(--accent-soft)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
          }}
        >
          {icon}
        </span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800 }}>{value}</div>
      {trend && <div style={{ fontSize: 12.5, color: "var(--success)" }}>{trend}</div>}
    </Card>
  );
}
