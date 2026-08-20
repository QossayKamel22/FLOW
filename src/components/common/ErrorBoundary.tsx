import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("FLOW crashed:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          textAlign: "center",
          background: "var(--bg, #05070d)",
          color: "var(--text-primary, #f5f6fa)",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <div style={{ fontSize: 40 }}>⚠️</div>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Something went wrong</h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary, #9aa0b4)", maxWidth: 420, margin: 0 }}>
          FLOW hit an unexpected error. Your data is safe — reloading usually fixes this.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: 8,
            padding: "11px 22px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(90deg, #6366f1, #8b5cf6, #22d3ee)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Reload FLOW
        </button>
        {import.meta.env.DEV && (
          <pre
            style={{
              marginTop: 16,
              maxWidth: 640,
              textAlign: "left",
              fontSize: 11.5,
              padding: 12,
              borderRadius: 8,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "#f87171",
              overflow: "auto",
              maxHeight: 200,
            }}
          >
            {this.state.error.stack || this.state.error.message}
          </pre>
        )}
      </div>
    );
  }
}
