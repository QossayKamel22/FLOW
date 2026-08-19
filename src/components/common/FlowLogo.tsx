export function FlowLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <img
        src="/logo.png"
        alt="FLOW"
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          flexShrink: 0,
          objectFit: "cover",
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
