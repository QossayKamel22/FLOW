import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCollection } from "../../hooks/useCollection";
import { notificationsService, followupsService, propertiesService, leadsService } from "../../services/crmServices";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { SectionHeader, LoadingState, EmptyState, ErrorState } from "../../components/common/States";
import { Badge } from "../../components/common/Badge";
import { expiringContracts, daysUntil } from "../../lib/contracts";

const typeIcon: Record<string, string> = { followup: "⏰", deal: "💼", lead: "🎯", customer: "🤝", property: "🏠" };

interface FeedItem {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  live: boolean;
  href?: string;
  createdAt: number;
}

export function NotificationsPage() {
  const { items, loading, error, uid } = useCollection(notificationsService);
  const followups = useCollection(followupsService);
  const properties = useCollection(propertiesService);
  const leads = useCollection(leadsService);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const liveItems = useMemo<FeedItem[]>(() => {
    const out: FeedItem[] = [];
    const now = Date.now();

    for (const f of followups.items) {
      if (f.completed || !f.date) continue;
      if (new Date(f.date) < new Date(new Date().toDateString())) {
        out.push({
          id: `followup-${f.id}`,
          title: "Overdue follow-up",
          message: `"${f.title}" was due ${f.date}${f.relatedTo ? ` · ${f.relatedTo}` : ""}`,
          type: "followup",
          read: false,
          live: true,
          href: "/app/followups",
          createdAt: now,
        });
      }
    }

    for (const p of expiringContracts(properties.items)) {
      const days = daysUntil(p.contractEnd);
      const overdue = days !== null && days < 0;
      out.push({
        id: `property-${p.id}`,
        title: overdue ? "Contract overdue" : "Contract expiring soon",
        message: `${p.title || p.address} (${p.type}) ${overdue ? `expired ${Math.abs(days!)}d ago` : `expires in ${days}d`}`,
        type: "property",
        read: false,
        live: true,
        href: "/app/properties",
        createdAt: now,
      });
    }

    for (const l of leads.items) {
      if (l.score >= 80 && l.status === "New") {
        out.push({
          id: `lead-${l.id}`,
          title: "Hot lead needs attention",
          message: `${l.name}${l.company ? ` at ${l.company}` : ""} scored ${l.score} and hasn't been contacted yet`,
          type: "lead",
          read: false,
          live: true,
          href: "/app/leads",
          createdAt: now,
        });
      }
    }

    return out.filter((n) => !dismissed.has(n.id));
  }, [followups.items, properties.items, leads.items, dismissed]);

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
      })),
    [items]
  );

  const feed = useMemo(() => [...liveItems, ...storedItems].sort((a, b) => Number(a.read) - Number(b.read) || b.createdAt - a.createdAt), [liveItems, storedItems]);
  const unreadCount = feed.filter((n) => !n.read).length;
  const loadingAny = loading || followups.loading || properties.loading || leads.loading;

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

      {loadingAny ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : feed.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="No notifications"
          description="Follow-up reminders, contract alerts, and hot leads will appear here automatically."
        />
      ) : (
        <div className="stagger-in" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {feed.map((n) => {
            const left = (
              <div style={{ display: "flex", gap: 10, minWidth: 0 }}>
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    flexShrink: 0,
                    background: "var(--accent-soft)",
                  }}
                >
                  {typeIcon[n.type] ?? "🔔"}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {n.title}
                    {!n.read && <Badge tone="accent">New</Badge>}
                    {n.live && <Badge tone="warning">Live</Badge>}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 2 }}>{n.message}</div>
                </div>
              </div>
            );
            return (
              <Card
                key={n.id}
                padding={14}
                style={{
                  background: n.read ? "var(--bg-card)" : "var(--accent-soft)",
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
