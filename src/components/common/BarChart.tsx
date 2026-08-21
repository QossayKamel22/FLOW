import { useState } from "react";

export function BarChart({
  data,
  color = "#6366f1",
  formatValue = (v: number) => v.toLocaleString(),
}: {
  data: { label: string; value: number }[];
  color?: string;
  formatValue?: (v: number) => string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const gridLines = [0.25, 0.5, 0.75, 1];

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "relative", height: 140, display: "flex", alignItems: "flex-end", gap: 8, paddingTop: 22 }}>
        {gridLines.map((g) => (
          <div
            key={g}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: `${g * 100}%`,
              borderTop: "1px dashed var(--border)",
              opacity: 0.6,
            }}
          />
        ))}
        {data.map((d, i) => {
          const heightPct = (d.value / max) * 100;
          const isHovered = hovered === i;
          return (
            <div
              key={d.label}
              style={{ position: "relative", flex: 1, height: "100%", display: "flex", alignItems: "flex-end", minWidth: 0 }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
            >
              {isHovered && d.value > 0 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: `calc(${heightPct}% + 8px)`,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 6,
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    whiteSpace: "nowrap",
                    animation: "fadeIn 120ms ease",
                    zIndex: 1,
                  }}
                >
                  {formatValue(d.value)}
                </div>
              )}
              <div
                style={{
                  width: "100%",
                  height: `${Math.max(heightPct, d.value > 0 ? 3 : 1)}%`,
                  borderRadius: "5px 5px 2px 2px",
                  background: isHovered ? color : `color-mix(in srgb, ${color} 78%, transparent)`,
                  transition: "height 650ms cubic-bezier(0.16, 1, 0.3, 1), background var(--transition-fast)",
                  boxShadow: isHovered ? `0 0 12px ${color}66` : "none",
                }}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        {data.map((d) => (
          <div key={d.label} style={{ flex: 1, textAlign: "center", fontSize: 10.5, color: "var(--text-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}
