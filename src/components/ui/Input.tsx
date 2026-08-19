import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const fieldStyle = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border)",
  background: "var(--bg-elevated)",
  color: "var(--text-primary)",
  fontSize: 14.5,
  outline: "none",
  transition: "border-color var(--transition-fast)",
} as const;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, style, id, ...rest },
  ref
) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label htmlFor={id} style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        style={{ ...fieldStyle, borderColor: error ? "var(--danger)" : "var(--border)", ...style }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = error ? "var(--danger)" : "var(--border)")}
        {...rest}
      />
      {error && <span style={{ fontSize: 12.5, color: "var(--danger)" }}>{error}</span>}
    </div>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, id, style, ...rest }: TextareaProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label htmlFor={id} style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        style={{ ...fieldStyle, resize: "vertical", minHeight: 72, fontFamily: "inherit", ...style }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        {...rest}
      />
    </div>
  );
}
