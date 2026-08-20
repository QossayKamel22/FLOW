import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useCollection } from "../../hooks/useCollection";
import { leadsService, customersService, dealsService, propertiesService } from "../../services/crmServices";
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
} from "./Icons";

interface Item {
  id: string;
  label: string;
  sub?: string;
  icon: ComponentType<{ size?: number }>;
  color: string;
  href: string;
  group: "Pages" | "Leads" | "Customers" | "Deals" | "Properties";
}

const pageItems: Item[] = [
  { id: "p-dash", label: "Dashboard", icon: IconDashboard, color: "#6366f1", href: "/app", group: "Pages" },
  { id: "p-leads", label: "Leads", icon: IconTarget, color: "#6366f1", href: "/app/leads", group: "Pages" },
  { id: "p-cust", label: "Customers", icon: IconUsers, color: "#6366f1", href: "/app/customers", group: "Pages" },
  { id: "p-prop", label: "Properties", icon: IconHome, color: "#6366f1", href: "/app/properties", group: "Pages" },
  { id: "p-deals", label: "Deals", icon: IconBriefcase, color: "#6366f1", href: "/app/deals", group: "Pages" },
  { id: "p-fu", label: "Follow-ups", icon: IconClock, color: "#6366f1", href: "/app/followups", group: "Pages" },
  { id: "p-cal", label: "Calendar", icon: IconCalendar, color: "#6366f1", href: "/app/calendar", group: "Pages" },
  { id: "p-ai", label: "AI Copilot", icon: IconSparkle, color: "#6366f1", href: "/app/copilot", group: "Pages" },
  { id: "p-an", label: "Analytics", icon: IconTrendingUp, color: "#6366f1", href: "/app/analytics", group: "Pages" },
  { id: "p-no", label: "Notifications", icon: IconBell, color: "#6366f1", href: "/app/notifications", group: "Pages" },
  { id: "p-set", label: "Settings", icon: IconSettings, color: "#6366f1", href: "/app/settings", group: "Pages" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const leads = useCollection(leadsService);
  const customers = useCollection(customersService);
  const deals = useCollection(dealsService);
  const properties = useCollection(propertiesService);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    const onOpenEvent = () => setOpen(true);
    window.addEventListener("open-command-palette", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("open-command-palette", onOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const allItems = useMemo<Item[]>(() => {
    const leadItems: Item[] = leads.items.map((l) => ({
      id: `lead-${l.id}`,
      label: l.name,
      sub: l.company || "Lead",
      icon: IconTarget,
      color: "#f43f5e",
      href: `/app/leads/${l.id}`,
      group: "Leads",
    }));
    const custItems: Item[] = customers.items.map((c) => ({
      id: `cust-${c.id}`,
      label: c.name,
      sub: c.company || "Customer",
      icon: IconUsers,
      color: "#f59e0b",
      href: "/app/customers",
      group: "Customers",
    }));
    const dealItems: Item[] = deals.items.map((d) => ({
      id: `deal-${d.id}`,
      label: d.name,
      sub: `${d.company || "Deal"} · $${d.value.toLocaleString()}`,
      icon: IconBriefcase,
      color: "#a855f7",
      href: "/app/deals",
      group: "Deals",
    }));
    const propItems: Item[] = properties.items.map((p) => ({
      id: `prop-${p.id}`,
      label: p.title || p.address,
      sub: p.address,
      icon: IconHome,
      color: "#d4af6a",
      href: "/app/properties",
      group: "Properties",
    }));
    return [...pageItems, ...leadItems, ...custItems, ...dealItems, ...propItems];
  }, [leads.items, customers.items, deals.items, properties.items]);

  const filtered = useMemo(() => {
    if (!query.trim()) return pageItems;
    const q = query.toLowerCase();
    return allItems.filter((i) => i.label.toLowerCase().includes(q) || i.sub?.toLowerCase().includes(q)).slice(0, 30);
  }, [allItems, query]);

  useEffect(() => setActiveIndex(0), [query]);

  function go(item: Item) {
    navigate(item.href);
    setOpen(false);
  }

  if (!open) return null;

  const groups = filtered.reduce<Record<string, Item[]>>((acc, item) => {
    (acc[item.group] ??= []).push(item);
    return acc;
  }, {});

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "12vh",
        background: "var(--overlay)",
        backdropFilter: "blur(4px)",
        animation: "fadeIn 120ms ease",
      }}
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 560,
          maxHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "0 24px 60px -12px rgba(0,0,0,0.5)",
          overflow: "hidden",
          animation: "popIn 180ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads, deals, properties, or jump to a page…"
            style={{ flex: 1, border: "none", background: "transparent", color: "var(--text-primary)", fontSize: 14.5, outline: "none" }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter" && filtered[activeIndex]) {
                go(filtered[activeIndex]);
              }
            }}
          />
          <kbd style={{ fontSize: 11, color: "var(--text-tertiary)", border: "1px solid var(--border)", borderRadius: 5, padding: "2px 6px" }}>Esc</kbd>
        </div>

        <div className="scrollbar-thin" style={{ overflowY: "auto", padding: 8 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-tertiary)", fontSize: 13.5 }}>No results for "{query}"</div>
          ) : (
            Object.entries(groups).map(([group, groupItems]) => (
              <div key={group} style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "var(--text-tertiary)", padding: "6px 10px" }}>
                  {group}
                </div>
                {groupItems.map((item) => {
                  const idx = filtered.indexOf(item);
                  const Icon = item.icon;
                  const active = idx === activeIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => go(item)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "9px 10px",
                        borderRadius: "var(--radius-md)",
                        border: "none",
                        background: active ? "var(--accent-soft)" : "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          color: item.color,
                          background: `${item.color}1f`,
                        }}
                      >
                        <Icon size={14} />
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</div>
                        {item.sub && <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.sub}</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
