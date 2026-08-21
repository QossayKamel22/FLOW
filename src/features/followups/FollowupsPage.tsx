import { useMemo, useState } from "react";
import { useCollection } from "../../hooks/useCollection";
import { followupsService } from "../../services/crmServices";
import type { FollowUp } from "../../types/crm";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { NewButton } from "../../components/ui/NewButton";
import { Input, Textarea } from "../../components/ui/Input";
import { Modal, ConfirmDialog } from "../../components/common/Modal";
import { SectionHeader, LoadingState, EmptyState, ErrorState } from "../../components/common/States";
import { Badge } from "../../components/common/Badge";
import { useToast } from "../../context/ToastContext";

const emptyForm = { title: "", date: "", time: "", relatedTo: "", notes: "", completed: false };

function isOverdue(f: FollowUp) {
  if (f.completed || !f.date) return false;
  return new Date(f.date) < new Date(new Date().toDateString());
}

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatTime(time: string) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function formatFollowupDate(dateStr: string) {
  if (!dateStr) return "No date";
  const target = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(target.getTime())) return dateStr;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 1 && diffDays <= 6) return weekdays[target.getDay()];
  if (diffDays < -1 && diffDays >= -6) return `Last ${weekdays[target.getDay()]}`;

  const sameYear = target.getFullYear() === today.getFullYear();
  return target.toLocaleDateString("en-US", { month: "short", day: "numeric", year: sameYear ? undefined : "numeric" });
}

const groupMeta = {
  Overdue: { icon: "⚠️", tone: "danger" as const, accent: "#ef4444" },
  Upcoming: { icon: "🕐", tone: "accent" as const, accent: "#6366f1" },
  Completed: { icon: "✅", tone: "neutral" as const, accent: "#22c55e" },
};

function CheckToggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      style={{
        width: 20,
        height: 20,
        borderRadius: 6,
        border: `1.5px solid ${checked ? "var(--success)" : "var(--border-strong)"}`,
        background: checked ? "var(--success)" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background var(--transition-fast), border-color var(--transition-fast), transform var(--transition-fast)",
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.85)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {checked && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "popIn 200ms ease" }}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}

export function FollowupsPage() {
  const { items, loading, error, uid } = useCollection(followupsService);
  const { show } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FollowUp | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<FollowUp | null>(null);

  const groups = useMemo(() => {
    const overdue = items.filter(isOverdue);
    const upcoming = items.filter((f) => !f.completed && !isOverdue(f));
    const completed = items.filter((f) => f.completed);
    return { Overdue: overdue, Upcoming: upcoming, Completed: completed };
  }, [items]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(f: FollowUp) {
    setEditing(f);
    setForm({ ...emptyForm, ...f });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!uid || !form.title.trim()) return;
    try {
      if (editing) {
        await followupsService.update(uid, editing.id, form);
        show("Follow-up updated.", "success");
      } else {
        await followupsService.create(uid, form);
        show("Follow-up created.", "success");
      }
      setModalOpen(false);
    } catch {
      show("Couldn't save the follow-up.", "error");
    }
  }

  async function toggleComplete(f: FollowUp) {
    if (!uid) return;
    await followupsService.update(uid, f.id, { completed: !f.completed });
  }

  async function handleDelete() {
    if (!uid || !deleteTarget) return;
    try {
      await followupsService.remove(uid, deleteTarget.id);
      show("Follow-up deleted.", "success");
    } catch {
      show("Couldn't delete the follow-up.", "error");
    } finally {
      setDeleteTarget(null);
    }
  }

  function renderGroup(title: keyof typeof groupMeta, list: FollowUp[]) {
    if (list.length === 0) return null;
    const meta = groupMeta[title];
    return (
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 15 }}>{meta.icon}</span>
          <h3 style={{ fontSize: 14, fontWeight: 700 }}>{title}</h3>
          <Badge tone={meta.tone}>{list.length}</Badge>
        </div>
        <div className="stagger-in" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {list.map((f) => (
            <Card
              key={f.id}
              padding={14}
              style={{
                borderLeft: `3px solid ${meta.accent}`,
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <CheckToggle checked={f.completed} onChange={() => toggleComplete(f)} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5, textDecoration: f.completed ? "line-through" : "none", color: f.completed ? "var(--text-tertiary)" : "var(--text-primary)" }}>
                      {f.title}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
                      {f.date && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 999,
                            color: title === "Overdue" ? "var(--danger)" : title === "Completed" ? "var(--text-tertiary)" : "var(--accent)",
                            background: title === "Overdue" ? "rgba(239,68,68,0.12)" : title === "Completed" ? "var(--bg-elevated)" : "var(--accent-soft)",
                          }}
                        >
                          {formatFollowupDate(f.date)}
                        </span>
                      )}
                      <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                        {f.time && formatTime(f.time)} {f.relatedTo && `· ${f.relatedTo}`}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(f)}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => setDeleteTarget(f)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="Follow-ups" subtitle="Stay on top of every commitment." action={<NewButton label="New Follow-up" onClick={openCreate} />} />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : items.length === 0 ? (
        <EmptyState title="No follow-ups yet" description="Schedule your first follow-up." action={{ label: "+ New Follow-up", onClick: openCreate }} />
      ) : (
        <>
          {renderGroup("Overdue", groups.Overdue)}
          {renderGroup("Upcoming", groups.Upcoming)}
          {renderGroup("Completed", groups.Completed)}
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit follow-up" : "New follow-up"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Input label="Time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </div>
          <Input label="Related to (lead/customer/deal)" value={form.relatedTo} onChange={(e) => setForm({ ...form, relatedTo: e.target.value })} />
          <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Button fullWidth onClick={handleSave}>{editing ? "Save changes" : "Create follow-up"}</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete follow-up" message={`Delete "${deleteTarget?.title}"?`} />
    </div>
  );
}
