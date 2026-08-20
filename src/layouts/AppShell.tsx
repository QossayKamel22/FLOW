import { useEffect, useState, type CSSProperties, type ComponentType } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { FlowLogo } from "../components/common/FlowLogo";
import { ProfileAvatar } from "../components/common/ProfileAvatar";
import { RouteLoader } from "../components/common/RouteLoader";
import { CommandPalette } from "../components/common/CommandPalette";
import { useProfilePhoto } from "../hooks/useProfilePhoto";
import { useLiveNotifications } from "../hooks/useLiveNotifications";
import { useCollection } from "../hooks/useCollection";
import { notificationsService } from "../services/crmServices";
import {
  IconDashboard,
  IconTarget,
  IconUsers,
  IconHome,
  IconBriefcase,
  IconClock,
  IconCalendar,
  IconSparkle,
  IconTrendingUp,
  IconBell,
  IconSettings,
} from "../components/common/Icons";

const navItems: { to: string; label: string; icon: ComponentType<{ size?: number }>; end?: boolean }[] = [
  { to: "/app", label: "Dashboard", icon: IconDashboard, end: true },
  { to: "/app/leads", label: "Leads", icon: IconTarget },
  { to: "/app/customers", label: "Customers", icon: IconUsers },
  { to: "/app/properties", label: "Properties", icon: IconHome },
  { to: "/app/deals", label: "Deals", icon: IconBriefcase },
  { to: "/app/followups", label: "Follow-ups", icon: IconClock },
  { to: "/app/calendar", label: "Calendar", icon: IconCalendar },
  { to: "/app/copilot", label: "AI Copilot", icon: IconSparkle },
  { to: "/app/analytics", label: "Analytics", icon: IconTrendingUp },
  { to: "/app/notifications", label: "Notifications", icon: IconBell },
  { to: "/app/settings", label: "Settings", icon: IconSettings },
];

const LUXURY = "#d4af6a";

function NavIcon({ Icon, active, badge }: { Icon: ComponentType<{ size?: number }>; active: boolean; badge?: number }) {
  return (
    <span style={{ position: "relative", flexShrink: 0 }}>
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: active ? "#fff" : LUXURY,
          background: active
            ? "rgba(255,255,255,0.16)"
            : `linear-gradient(150deg, ${LUXURY}26, ${LUXURY}0d)`,
          boxShadow: active
            ? "inset 0 0 0 1px rgba(255,255,255,0.35)"
            : `inset 0 0 0 1px ${LUXURY}4d`,
          transition: "background var(--transition-fast), box-shadow var(--transition-fast), color var(--transition-fast), transform var(--transition-fast)",
        }}
      >
        <Icon size={15} />
      </span>
      {!!badge && (
        <span
          style={{
            position: "absolute",
            top: -3,
            right: -3,
            minWidth: 15,
            height: 15,
            padding: "0 3px",
            borderRadius: 999,
            background: "var(--danger)",
            color: "#fff",
            fontSize: 9,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 0 2px var(--bg-elevated)",
            animation: "orbPulse 2s ease-in-out infinite",
          }}
        >
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </span>
  );
}

export function AppShell() {
  const { user, logOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { photoURL } = useProfilePhoto();
  const { items: liveNotifications } = useLiveNotifications();
  const { items: storedNotifications } = useCollection(notificationsService);
  const notificationCount = liveNotifications.length + storedNotifications.filter((n) => !n.read).length;
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
      <CommandPalette />
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
        <button
          onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 10px",
            marginBottom: 14,
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
            background: "var(--bg-card)",
            color: "var(--text-tertiary)",
            fontSize: 12.5,
            cursor: "pointer",
            transition: "border-color var(--transition-fast)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-strong)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          Search
          <kbd style={{ marginLeft: "auto", fontSize: 10.5, border: "1px solid var(--border)", borderRadius: 4, padding: "1px 5px" }}>⌘K</kbd>
        </button>
        {navItems.map((item, i) => (
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
              animation: `fadeIn 320ms ease ${i * 30}ms both`,
              transition: "background var(--transition-fast), color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast)",
            })}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(3px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
          >
            {({ isActive }) => (
              <>
                <NavIcon Icon={item.icon} active={isActive} badge={item.to === "/app/notifications" ? notificationCount : undefined} />
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
          <div style={{ textAlign: "center", fontSize: 10.5, color: "var(--text-tertiary)", marginTop: 14, letterSpacing: 0.2 }}>
            Copyright © {new Date().getFullYear()} Qossay Kamel.
            <br />
            All rights reserved.
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
                    <NavIcon Icon={item.icon} active={isActive} badge={item.to === "/app/notifications" ? notificationCount : undefined} />
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
