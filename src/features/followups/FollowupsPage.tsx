import { useMemo, useState } from "react";
import { useCollection } from "../../hooks/useCollection";
import { followupsService } from "../../services/crmServices";
import type { FollowUp } from "../../types/crm";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
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
    return { overdue, upcoming, completed };
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

  function renderGroup(title: string, list: FollowUp[], tone: "danger" | "accent" | "neutral") {
    if (list.length === 0) return null;
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700 }}>{title}</h3>
          <Badge tone={tone}>{list.length}</Badge>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {list.map((f) => (
            <Card key={f.id} padding={14} style={{ borderColor: tone === "danger" ? "rgba(239,68,68,0.35)" : "var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input type="checkbox" checked={f.completed} onChange={() => toggleComplete(f)} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5, textDecoration: f.completed ? "line-through" : "none" }}>{f.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                      {f.date} {f.time && `· ${f.time}`} {f.relatedTo && `· ${f.relatedTo}`}
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
      <SectionHeader title="Follow-ups" subtitle="Stay on top of every commitment." action={<Button onClick={openCreate}>+ New Follow-up</Button>} />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : items.length === 0 ? (
        <EmptyState title="No follow-ups yet" description="Schedule your first follow-up." action={{ label: "+ New Follow-up", onClick: openCreate }} />
      ) : (
        <>
          {renderGroup("Overdue", groups.overdue, "danger")}
          {renderGroup("Upcoming", groups.upcoming, "accent")}
          {renderGroup("Completed", groups.completed, "neutral")}
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
