import { useEffect, useRef, useState } from "react";
import { Card } from "../ui/Card";

const tones = {
  indigo: "linear-gradient(135deg, #6366f1, #4f46e5)",
  cyan: "linear-gradient(135deg, #22d3ee, #0891b2)",
  violet: "linear-gradient(135deg, #a855f7, #7c3aed)",
  emerald: "linear-gradient(135deg, #34d399, #059669)",
} as const;

function parseValue(value: string): { prefix: string; num: number; suffix: string } | null {
  const match = value.match(/^([^\d-]*)(-?[\d,]+\.?\d*)(.*)$/);
  if (!match) return null;
  const [, prefix, numStr, suffix] = match;
  const num = Number(numStr.replace(/,/g, ""));
  if (Number.isNaN(num)) return null;
  return { prefix, num, suffix };
}

function useCountUp(target: number) {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);

  useEffect(() => {
    const from = prevRef.current;
    const to = target;
    if (from === to) return;
    const start = performance.now();
    const duration = 650;
    let raf: number;
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else prevRef.current = to;
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return display;
}

function AnimatedValue({ value }: { value: string }) {
  const parsed = parseValue(value);
  const display = useCountUp(parsed?.num ?? 0);
  if (!parsed) return <>{value}</>;
  return (
    <>
      {parsed.prefix}
      {display.toLocaleString()}
      {parsed.suffix}
    </>
  );
}

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
        const icon = e.currentTarget.querySelector<HTMLElement>("[data-kpi-icon]");
        if (icon) icon.style.transform = "scale(1.12) rotate(-6deg)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "var(--shadow-card)";
        const icon = e.currentTarget.querySelector<HTMLElement>("[data-kpi-icon]");
        if (icon) icon.style.transform = "scale(1) rotate(0deg)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>{label}</span>
        <span
          data-kpi-icon
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
            transition: "transform var(--transition-base)",
          }}
        >
          {icon}
        </span>
      </div>
      <div style={{ fontSize: 27, fontWeight: 800, letterSpacing: -0.5, animation: "valuePop 380ms cubic-bezier(0.16, 1, 0.3, 1)", transformOrigin: "left center" }}>
        <AnimatedValue value={value} />
      </div>
      {trend && <div style={{ fontSize: 12.5, color: "var(--success)", fontWeight: 600 }}>{trend}</div>}
    </Card>
  );
}
