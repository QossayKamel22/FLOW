import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCollection } from "../../hooks/useCollection";
import { useLiveNotifications } from "../../hooks/useLiveNotifications";
import { notificationsService } from "../../services/crmServices";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { SectionHeader, EmptyState, ErrorState } from "../../components/common/States";
import { Badge } from "../../components/common/Badge";
import { IconClock, IconHome, IconTarget, IconBriefcase, IconUsers, IconBell } from "../../components/common/Icons";
import type { ComponentType } from "react";

const typeIconComponent: Record<string, ComponentType<{ size?: number }>> = {
  followup: IconClock,
  property: IconHome,
  lead: IconTarget,
  deal: IconBriefcase,
  customer: IconUsers,
};

const severityColor: Record<string, string> = {
  danger: "#ef4444",
  warning: "#f59e0b",
  accent: "#6366f1",
};

interface FeedItem {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  live: boolean;
  href?: string;
  createdAt: number;
  color: string;
}

function relativeTime(ms: number) {
  if (!ms) return "";
  const diff = Date.now() - ms;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

export function NotificationsPage() {
  const { items, loading, error, uid } = useCollection(notificationsService);
  const { items: liveRaw, loading: liveLoading } = useLiveNotifications();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const liveItems = useMemo<FeedItem[]>(
    () =>
      liveRaw
        .filter((n) => !dismissed.has(n.id))
        .map((n) => ({ id: n.id, title: n.title, message: n.message, type: n.type, read: false, live: true, href: n.href, createdAt: Date.now(), color: severityColor[n.severity] })),
    [liveRaw, dismissed]
  );

  const storedItems = useMemo<FeedItem[]>(
    () =>
      items.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        read: n.read,
        live: false,
        createdAt: n.createdAt ?? 0,
        color: "#6366f1",
      })),
    [items]
  );

  const feed = useMemo(() => {
    const all = [...liveItems, ...storedItems].sort((a, b) => Number(a.read) - Number(b.read) || b.createdAt - a.createdAt);
    return filter === "unread" ? all.filter((n) => !n.read) : all;
  }, [liveItems, storedItems, filter]);

  const unreadCount = [...liveItems, ...storedItems].filter((n) => !n.read).length;
  const loadingAny = loading || liveLoading;

  async function markRead(id: string) {
    if (!uid) return;
    await notificationsService.update(uid, id, { read: true });
  }

  async function remove(item: FeedItem) {
    if (item.live) {
      setDismissed((prev) => new Set(prev).add(item.id));
      return;
    }
    if (!uid) return;
    await notificationsService.remove(uid, item.id);
  }

  async function markAllRead() {
    if (!uid) return;
    await Promise.all(items.filter((n) => !n.read).map((n) => notificationsService.update(uid, n.id, { read: true })));
  }

  return (
    <div>
      <SectionHeader
        title="Notifications"
        subtitle={unreadCount ? `${unreadCount} unread` : "You're all caught up."}
        action={unreadCount > 0 ? <Button variant="secondary" size="sm" onClick={markAllRead}>Mark all as read</Button> : undefined}
      />

      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "7px 16px",
              borderRadius: 999,
              border: `1px solid ${filter === f ? "var(--accent)" : "var(--border)"}`,
              background: filter === f ? "var(--accent-soft)" : "var(--bg-card)",
              color: filter === f ? "var(--accent)" : "var(--text-secondary)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "border-color var(--transition-fast), background var(--transition-fast), color var(--transition-fast)",
            }}
          >
            {f === "all" ? "All" : "Unread"}
            {f === "unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
          </button>
        ))}
      </div>

      {loadingAny ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ height: 64, borderRadius: "var(--radius-lg)", background: "linear-gradient(90deg, var(--bg-card) 25%, var(--bg-elevated) 37%, var(--bg-card) 63%)", backgroundSize: "400px 100%", animation: "shimmer 1.4s ease infinite", border: "1px solid var(--border)" }} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} />
      ) : feed.length === 0 ? (
        <EmptyState
          icon="🔔"
          title={filter === "unread" ? "You're all caught up" : "No notifications"}
          description="Follow-up reminders, contract alerts, and hot leads will appear here automatically."
        />
      ) : (
        <div className="stagger-in" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {feed.map((n) => {
            const Icon = typeIconComponent[n.type] ?? IconBell;
            const left = (
              <div style={{ display: "flex", gap: 10, minWidth: 0 }}>
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: n.color,
                    background: `${n.color}1f`,
                    boxShadow: `inset 0 0 0 1px ${n.color}40`,
                  }}
                >
                  <Icon size={15} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {n.title}
                    {!n.read && <Badge tone="accent">New</Badge>}
                    {n.live && <Badge tone="warning">Live</Badge>}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 2 }}>{n.message}</div>
                  {!n.live && n.createdAt > 0 && (
                    <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 3 }}>{relativeTime(n.createdAt)}</div>
                  )}
                </div>
              </div>
            );
            return (
              <Card
                key={n.id}
                padding={14}
                style={{
                  background: n.read ? "var(--bg-card)" : "var(--accent-soft)",
                  borderLeft: `3px solid ${n.color}`,
                  borderColor: n.read ? "var(--border)" : "rgba(99,102,241,0.3)",
                  transition: "transform var(--transition-base), box-shadow var(--transition-base)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.4), 0 12px 24px -8px rgba(99,102,241,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "var(--shadow-card)";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  {n.href ? (
                    <Link to={n.href} style={{ textDecoration: "none", color: "inherit", minWidth: 0 }}>
                      {left}
                    </Link>
                  ) : (
                    left
                  )}
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {!n.read && !n.live && <Button size="sm" variant="ghost" onClick={() => markRead(n.id)}>Mark read</Button>}
                    <Button size="sm" variant="danger" onClick={() => remove(n)}>{n.live ? "Dismiss" : "Delete"}</Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
