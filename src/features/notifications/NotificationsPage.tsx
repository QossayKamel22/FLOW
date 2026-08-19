import { useCollection } from "../../hooks/useCollection";
import { notificationsService } from "../../services/crmServices";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { SectionHeader, LoadingState, EmptyState, ErrorState } from "../../components/common/States";
import { Badge } from "../../components/common/Badge";

const typeIcon: Record<string, string> = { followup: "⏰", deal: "💼", lead: "🎯", customer: "🤝" };

export function NotificationsPage() {
  const { items, loading, error, uid } = useCollection(notificationsService);
  const unreadCount = items.filter((n) => !n.read).length;

  async function markRead(id: string) {
    if (!uid) return;
    await notificationsService.update(uid, id, { read: true });
  }

  async function remove(id: string) {
    if (!uid) return;
    await notificationsService.remove(uid, id);
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

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="No notifications"
          description="Follow-up reminders and CRM updates will appear here."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((n) => (
            <Card key={n.id} padding={14} style={{ background: n.read ? "var(--bg-card)" : "var(--accent-soft)", borderColor: n.read ? "var(--border)" : "rgba(99,102,241,0.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <span>{typeIcon[n.type] ?? "🔔"}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                      {n.title} {!n.read && <Badge tone="accent">New</Badge>}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 2 }}>{n.message}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  {!n.read && <Button size="sm" variant="ghost" onClick={() => markRead(n.id)}>Mark read</Button>}
                  <Button size="sm" variant="danger" onClick={() => remove(n.id)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
