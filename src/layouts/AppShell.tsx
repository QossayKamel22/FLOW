import { useState, type CSSProperties } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { FlowLogo } from "../components/common/FlowLogo";

const navItems = [
  { to: "/app", label: "Dashboard", icon: "📊", end: true, color: "#6366f1" },
  { to: "/app/leads", label: "Leads", icon: "🎯", color: "#f43f5e" },
  { to: "/app/customers", label: "Customers", icon: "🤝", color: "#f59e0b" },
  { to: "/app/properties", label: "Properties", icon: "🏠", color: "#eab308" },
  { to: "/app/deals", label: "Deals", icon: "💼", color: "#a855f7" },
  { to: "/app/followups", label: "Follow-ups", icon: "⏰", color: "#ec4899" },
  { to: "/app/calendar", label: "Calendar", icon: "📅", color: "#22d3ee" },
  { to: "/app/copilot", label: "AI Copilot", icon: "✨", color: "#8b5cf6" },
  { to: "/app/analytics", label: "Analytics", icon: "📈", color: "#34d399" },
  { to: "/app/notifications", label: "Notifications", icon: "🔔", color: "#fb923c" },
  { to: "/app/settings", label: "Settings", icon: "⚙️", color: "#94a3b8" },
];

function NavIcon({ icon, color, active }: { icon: string; color: string; active: boolean }) {
  return (
    <span
      style={{
        width: 26,
        height: 26,
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13.5,
        flexShrink: 0,
        background: active ? "rgba(255,255,255,0.22)" : `${color}22`,
        boxShadow: active ? "inset 0 0 0 1px rgba(255,255,255,0.3)" : `inset 0 0 0 1px ${color}33`,
        transition: "background var(--transition-fast), box-shadow var(--transition-fast)",
      }}
    >
      {icon}
    </span>
  );
}

export function AppShell() {
  const { user, logOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Desktop sidebar */}
      <aside
        className="scrollbar-thin"
        style={{
          width: 236,
          flexShrink: 0,
          borderRight: "1px solid var(--border)",
          background: "var(--bg-elevated)",
          padding: "20px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
        data-desktop-sidebar
      >
        <div style={{ padding: "6px 10px 20px" }}>
          <FlowLogo />
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              borderRadius: "var(--radius-md)",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              color: isActive ? "#fff" : "var(--text-secondary)",
              background: isActive
                ? "linear-gradient(135deg, var(--accent), #7c3aed)"
                : "transparent",
              boxShadow: isActive ? "0 6px 16px -4px rgba(99,102,241,0.5)" : "none",
              transform: "translateX(0)",
              transition: "background var(--transition-fast), color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast)",
            })}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(3px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
          >
            {({ isActive }) => (
              <>
                <NavIcon icon={item.icon} color={item.color} active={isActive} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}

        <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent), #06b6d4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              {(user?.displayName || user?.email || "U").charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.displayName || "Account"}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.email}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={toggleTheme} style={iconBtn}>{theme === "dark" ? "☀️" : "🌙"}</button>
            <button onClick={() => void logOut()} style={{ ...iconBtn, flex: 1 }}>Log out</button>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header
          style={{
            display: "none",
            padding: "12px 16px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-elevated)",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          className="mobile-header"
        >
          <FlowLogo compact />
          <button onClick={() => setMobileOpen((v) => !v)} style={iconBtn} aria-label="Menu">
            ☰
          </button>
        </header>

        {mobileOpen && (
          <div className="mobile-nav-drawer" style={{ padding: 12, borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                  color: isActive ? "#fff" : "var(--text-secondary)",
                  background: isActive ? "var(--accent)" : "transparent",
                })}
              >
                {({ isActive }) => (
                  <>
                    <NavIcon icon={item.icon} color={item.color} active={isActive} />
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
            <button onClick={() => void logOut()} style={{ ...iconBtn, width: "100%", marginTop: 8 }}>
              Log out
            </button>
          </div>
        )}

        <main style={{ flex: 1, padding: 24, maxWidth: "100%", overflowX: "hidden" }}>
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      <style>{`
        @media (max-width: 880px) {
          [data-desktop-sidebar] { display: none; }
          .mobile-header { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

const iconBtn: CSSProperties = {
  padding: "8px 10px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border)",
  background: "var(--bg-card)",
  color: "var(--text-primary)",
  cursor: "pointer",
  fontSize: 13,
};
