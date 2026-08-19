import type { ReactNode } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

export function EmptyState({
  icon = "✨",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <Card
      style={{
        textAlign: "center",
        padding: "56px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div style={{ fontSize: 32 }}>{icon}</div>
      <h3 style={{ fontSize: 16, fontWeight: 700 }}>{title}</h3>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, maxWidth: 360 }}>{description}</p>
      {action && (
        <div style={{ marginTop: 8 }}>
          <Button size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </Card>
  );
}

export function LoadingState({ rows = 4 }: { rows?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 64,
            borderRadius: "var(--radius-lg)",
            background:
              "linear-gradient(90deg, var(--bg-card) 25%, var(--bg-elevated) 37%, var(--bg-card) 63%)",
            backgroundSize: "400px 100%",
            animation: "shimmer 1.4s ease infinite",
            border: "1px solid var(--border)",
          }}
        />
      ))}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <Card style={{ borderColor: "rgba(239,68,68,0.3)", color: "var(--danger)", fontSize: 14 }}>
      {message}
    </Card>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 20,
      }}
    >
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>{title}</h1>
        {subtitle && <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
