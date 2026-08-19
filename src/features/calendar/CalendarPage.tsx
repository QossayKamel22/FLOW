import { useMemo, useState } from "react";
import { useCollection } from "../../hooks/useCollection";
import { activitiesService } from "../../services/crmServices";
import type { Activity } from "../../types/crm";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Textarea } from "../../components/ui/Input";
import { Select } from "../../components/common/Select";
import { Modal, ConfirmDialog } from "../../components/common/Modal";
import { SectionHeader, LoadingState, EmptyState, ErrorState } from "../../components/common/States";
import { useToast } from "../../context/ToastContext";

const types = ["Follow-up", "Meeting", "Deadline", "Other"] as const;
const emptyForm = { title: "", date: "", time: "", type: "Meeting" as Activity["type"], notes: "" };

export function CalendarPage() {
  const { items, loading, error, uid } = useCollection(activitiesService);
  const { show } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Activity | null>(null);

  const sorted = useMemo(() => [...items].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)), [items]);
  const grouped = useMemo(() => {
    const map = new Map<string, Activity[]>();
    for (const a of sorted) {
      const key = a.date || "No date";
      map.set(key, [...(map.get(key) ?? []), a]);
    }
    return Array.from(map.entries());
  }, [sorted]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }
  function openEdit(a: Activity) {
    setEditing(a);
    setForm({ ...emptyForm, ...a });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!uid || !form.title.trim()) return;
    try {
      if (editing) {
        await activitiesService.update(uid, editing.id, form);
        show("Activity updated.", "success");
      } else {
        await activitiesService.create(uid, form);
        show("Activity created.", "success");
      }
      setModalOpen(false);
    } catch {
      show("Couldn't save the activity.", "error");
    }
  }

  async function handleDelete() {
    if (!uid || !deleteTarget) return;
    try {
      await activitiesService.remove(uid, deleteTarget.id);
      show("Activity deleted.", "success");
    } catch {
      show("Couldn't delete the activity.", "error");
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      <SectionHeader title="Calendar" subtitle="Follow-ups, meetings, and deal deadlines." action={<Button onClick={openCreate}>+ New Activity</Button>} />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : items.length === 0 ? (
        <EmptyState title="No activities scheduled" description="Add a meeting, deadline, or follow-up." action={{ label: "+ New Activity", onClick: openCreate }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {grouped.map(([date, dayItems]) => (
            <div key={date}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>{date}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {dayItems.map((a) => (
                  <Card key={a.id} padding={14}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{a.time && `${a.time} · `}{a.title}</div>
                        <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{a.type}</div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Button size="sm" variant="ghost" onClick={() => openEdit(a)}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => setDeleteTarget(a)}>Delete</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit activity" : "New activity"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Input label="Time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </div>
          <Select label="Type" options={types} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Activity["type"] })} />
          <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Button fullWidth onClick={handleSave}>{editing ? "Save changes" : "Create activity"}</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete activity" message={`Delete "${deleteTarget?.title}"?`} />
    </div>
  );
}
