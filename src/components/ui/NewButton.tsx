import type { ButtonHTMLAttributes } from "react";
import { IconPlus } from "../common/Icons";

interface NewButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function NewButton({ label, className, style, ...rest }: NewButtonProps) {
  return (
    <button
      className={`btn-shine ${className ?? ""}`.trim()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 20px 10px 14px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "var(--gradient-brand-diag)",
        color: "#fff",
        fontWeight: 700,
        fontSize: 13.5,
        letterSpacing: 0.15,
        cursor: "pointer",
        boxShadow: "0 1px 0 rgba(255,255,255,0.28) inset, 0 10px 26px -6px rgba(99,102,241,0.55)",
        transition: "transform var(--transition-fast), filter var(--transition-fast), box-shadow var(--transition-fast)",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px) scale(1.02)";
        e.currentTarget.style.filter = "brightness(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.filter = "none";
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(-1px) scale(1.02)")}
      {...rest}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.22)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <IconPlus size={13} />
      </span>
      {label}
    </button>
  );
}
