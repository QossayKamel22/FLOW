export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, cursor: "pointer" }}>
      <span>{label}</span>
      <span
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onChange(!checked);
          }
        }}
        style={{
          position: "relative",
          width: 40,
          height: 22,
          borderRadius: 999,
          flexShrink: 0,
          background: checked ? "var(--gradient-brand-diag)" : "var(--bg-elevated)",
          border: `1px solid ${checked ? "transparent" : "var(--border-strong)"}`,
          transition: "background var(--transition-base), border-color var(--transition-base)",
          outline: "none",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 20 : 2,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.35)",
            transition: "left var(--transition-base)",
          }}
        />
      </span>
    </label>
  );
}
