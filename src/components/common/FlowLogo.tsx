export function FlowLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <img
        src="/logo.svg"
        alt="FLOW"
        style={{
          width: 30,
          height: 30,
          flexShrink: 0,
        }}
      />
      {!compact && (
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>FLOW</div>
          <div style={{ fontSize: 10.5, color: "var(--text-tertiary)", letterSpacing: 0.3 }}>AI-Powered CRM</div>
        </div>
      )}
    </div>
  );
}
