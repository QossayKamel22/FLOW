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
  transition: "background var(--transition-fast), border-color var(--transition-fast), opacity var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast)",
  border: "1px solid transparent",
  whiteSpace: "nowrap",
};

const sizes: Record<Size, CSSProperties> = {
  sm: { padding: "8px 14px", fontSize: 13 },
  md: { padding: "11px 18px", fontSize: 14.5 },
};

const variants: Record<Variant, CSSProperties> = {
  primary: {
    background: "var(--gradient-brand-diag)",
    color: "#fff",
    boxShadow: "0 1px 0 rgba(255,255,255,0.25) inset, 0 10px 26px -6px rgba(99,102,241,0.5)",
  },
  secondary: {
    background: "var(--bg-elevated)",
    color: "var(--text-primary)",
    borderColor: "var(--border)",
    boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
  },
  ghost: { background: "transparent", color: "var(--text-secondary)" },
  danger: { background: "transparent", color: "var(--danger)", borderColor: "rgba(239,68,68,0.3)" },
};

const spinnerSize: Record<Size, number> = { sm: 13, md: 15 };

function Spinner({ size }: { size: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: "2px solid rgba(255,255,255,0.35)",
        borderTopColor: "#fff",
        display: "inline-block",
        animation: "spin 0.7s linear infinite",
      }}
    />
  );
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  loading,
  disabled,
  className,
  style,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={variant === "primary" ? `btn-shine ${className ?? ""}`.trim() : className}
      style={{
        ...base,
        ...sizes[size],
        ...variants[variant],
        width: fullWidth ? "100%" : undefined,
        opacity: disabled || loading ? 0.6 : 1,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (variant === "primary") {
          e.currentTarget.style.filter = "brightness(1.1)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }
        if (variant === "secondary") {
          e.currentTarget.style.borderColor = "#d4af6a80";
          e.currentTarget.style.transform = "translateY(-1px)";
        }
        if (variant === "ghost") e.currentTarget.style.background = "var(--bg-elevated)";
      }}
      onMouseLeave={(e) => {
        if (variant === "primary") {
          e.currentTarget.style.filter = "none";
          e.currentTarget.style.transform = "translateY(0)";
        }
        if (variant === "secondary") {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.transform = "translateY(0)";
        }
        if (variant === "ghost") e.currentTarget.style.background = "transparent";
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "scale(0.97)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = variant === "primary" || variant === "secondary" ? "translateY(-1px)" : "scale(1)";
      }}
      {...rest}
    >
      {loading && <Spinner size={spinnerSize[size]} />}
      {!loading && children}
    </button>
  );
}
