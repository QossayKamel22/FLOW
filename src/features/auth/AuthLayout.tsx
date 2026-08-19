import type { ReactNode } from "react";
import { FlowLogo } from "../../components/common/FlowLogo";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.16), transparent 40%), radial-gradient(circle at 80% 80%, rgba(6,182,212,0.14), transparent 40%), var(--bg)",
        padding: 20,
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <FlowLogo />
        </div>
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-card)",
            padding: 28,
          }}
        >
          {children}
        </div>
        <p style={{ textAlign: "center", fontSize: 12.5, color: "var(--text-tertiary)", marginTop: 20 }}>
          Smarter CRM. Better Sales.
        </p>
      </div>
    </div>
  );
}
