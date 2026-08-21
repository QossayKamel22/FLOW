export function TopProgressBar({ active }: { active: boolean }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2.5,
        zIndex: 500,
        pointerEvents: "none",
        opacity: active ? 1 : 0,
        transition: active ? "opacity 80ms ease" : "opacity 300ms ease 150ms",
      }}
    >
      <div
        style={{
          height: "100%",
          background: "var(--gradient-brand-diag)",
          boxShadow: "0 0 8px rgba(99,102,241,0.6)",
          width: active ? "70%" : "100%",
          transition: active ? "width 550ms cubic-bezier(0.16, 1, 0.3, 1)" : "width 200ms ease",
        }}
      />
    </div>
  );
}
