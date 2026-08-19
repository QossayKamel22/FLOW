export function FlowLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: "linear-gradient(135deg, #6366f1, #06b6d4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 800,
          fontSize: 16,
          flexShrink: 0,
          boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
        }}
      >
        F
      </div>
      {!compact && (
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>FLOW</div>
          <div style={{ fontSize: 10.5, color: "var(--text-tertiary)", letterSpacing: 0.3 }}>AI-Powered CRM</div>
        </div>
      )}
    </div>
  );
}
