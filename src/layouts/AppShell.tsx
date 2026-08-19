import { useEffect, useState, type CSSProperties } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { FlowLogo } from "../components/common/FlowLogo";
import { ProfileAvatar } from "../components/common/ProfileAvatar";
import { RouteLoader } from "../components/common/RouteLoader";
import { useProfilePhoto } from "../hooks/useProfilePhoto";

const navItems = [
  { to: "/app", label: "Dashboard", icon: "📊", end: true },
  { to: "/app/leads", label: "Leads", icon: "🎯" },
  { to: "/app/customers", label: "Customers", icon: "🤝" },
  { to: "/app/properties", label: "Properties", icon: "🏠" },
  { to: "/app/deals", label: "Deals", icon: "💼" },
  { to: "/app/followups", label: "Follow-ups", icon: "⏰" },
  { to: "/app/calendar", label: "Calendar", icon: "📅" },
  { to: "/app/copilot", label: "AI Copilot", icon: "✨" },
  { to: "/app/analytics", label: "Analytics", icon: "📈" },
  { to: "/app/notifications", label: "Notifications", icon: "🔔" },
  { to: "/app/settings", label: "Settings", icon: "⚙️" },
];

const LUXURY = "#d4af6a";

function NavIcon({ icon, active }: { icon: string; active: boolean }) {
  return (
    <span
      style={{
        width: 27,
        height: 27,
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13.5,
        flexShrink: 0,
        background: active ? "rgba(255,255,255,0.2)" : `${LUXURY}1a`,
        boxShadow: active
          ? "inset 0 0 0 1px rgba(255,255,255,0.35)"
          : `inset 0 0 0 1px ${LUXURY}59`,
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
  const { photoURL } = useProfilePhoto();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [routeLoading, setRouteLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    setRouteLoading(true);
    const t = window.setTimeout(() => setRouteLoading(false), 320);
    return () => window.clearTimeout(t);
  }, [location.pathname]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {routeLoading && <RouteLoader />}
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
                <NavIcon icon={item.icon} active={isActive} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}

        <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px" }}>
            <ProfileAvatar photoURL={photoURL} name={user?.displayName || user?.email || "U"} size={32} />
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
                    <NavIcon icon={item.icon} active={isActive} />
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
