import type { ButtonHTMLAttributes, CSSProperties } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
}

const base: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  borderRadius: "var(--radius-md)",
  fontWeight: 600,
  cursor: "pointer",
  transition: "background var(--transition-fast), border-color var(--transition-fast), opacity var(--transition-fast), transform var(--transition-fast)",
  border: "1px solid transparent",
  whiteSpace: "nowrap",
};

const sizes: Record<Size, CSSProperties> = {
  sm: { padding: "8px 14px", fontSize: 13 },
  md: { padding: "11px 18px", fontSize: 14.5 },
};

const variants: Record<Variant, CSSProperties> = {
  primary: { background: "var(--gradient-brand-diag)", color: "#fff", boxShadow: "0 8px 24px rgba(99,102,241,0.35)" },
  secondary: { background: "var(--bg-elevated)", color: "var(--text-primary)", borderColor: "var(--border)" },
  ghost: { background: "transparent", color: "var(--text-secondary)" },
  danger: { background: "transparent", color: "var(--danger)", borderColor: "rgba(239,68,68,0.3)" },
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  loading,
  disabled,
  style,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      style={{
        ...base,
        ...sizes[size],
        ...variants[variant],
        width: fullWidth ? "100%" : undefined,
        opacity: disabled || loading ? 0.6 : 1,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (variant === "primary") e.currentTarget.style.filter = "brightness(1.1)";
        if (variant === "secondary") e.currentTarget.style.borderColor = "var(--border-strong)";
        if (variant === "ghost") e.currentTarget.style.background = "var(--bg-elevated)";
      }}
      onMouseLeave={(e) => {
        if (variant === "primary") e.currentTarget.style.filter = "none";
        if (variant === "secondary") e.currentTarget.style.borderColor = "var(--border)";
        if (variant === "ghost") e.currentTarget.style.background = "transparent";
      }}
      {...rest}
    >
      {loading ? "…" : children}
    </button>
  );
}
