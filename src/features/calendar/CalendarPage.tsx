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

const typeColor: Record<Activity["type"], string> = {
  "Follow-up": "#6366f1",
  Meeting: "#22d3ee",
  Deadline: "#f87171",
  Other: "#a78bfa",
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function CalendarPage() {
  const { items, loading, error, uid } = useCollection(activitiesService);
  const { show } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Activity | null>(null);
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const byDate = useMemo(() => {
    const map = new Map<string, Activity[]>();
    for (const a of items) {
      const key = a.date || "No date";
      map.set(key, [...(map.get(key) ?? []), a]);
    }
    return map;
  }, [items]);

  const sorted = useMemo(() => [...items].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)), [items]);
  const visibleItems = useMemo(
    () => (selectedDate ? sorted.filter((a) => a.date === selectedDate) : sorted),
    [sorted, selectedDate]
  );
  const grouped = useMemo(() => {
    const map = new Map<string, Activity[]>();
    for (const a of visibleItems) {
      const key = a.date || "No date";
      map.set(key, [...(map.get(key) ?? []), a]);
    }
    return Array.from(map.entries());
  }, [visibleItems]);

  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayKey = toDateKey(new Date());

    const out: { date: Date; key: string; inMonth: boolean; isToday: boolean }[] = [];
    for (let i = 0; i < startOffset; i++) {
      const d = new Date(year, month, 1 - (startOffset - i));
      out.push({ date: d, key: toDateKey(d), inMonth: false, isToday: false });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const key = toDateKey(d);
      out.push({ date: d, key, inMonth: true, isToday: key === todayKey });
    }
    while (out.length % 7 !== 0 || out.length < 42) {
      const last = out[out.length - 1].date;
      const d = new Date(last);
      d.setDate(d.getDate() + 1);
      out.push({ date: d, key: toDateKey(d), inMonth: false, isToday: false });
    }
    return out;
  }, [cursor]);

  function openCreate(presetDate?: string) {
    setEditing(null);
    setForm({ ...emptyForm, date: presetDate ?? "" });
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
      <SectionHeader title="Calendar" subtitle="Follow-ups, meetings, and deal deadlines." action={<Button onClick={() => openCreate()}>+ New Activity</Button>} />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : items.length === 0 ? (
        <EmptyState title="No activities scheduled" description="Add a meeting, deadline, or follow-up." action={{ label: "+ New Activity", onClick: () => openCreate() }} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, 1fr)", gap: 20, alignItems: "start" }}>
          <Card padding={20}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{monthLabel}</div>
              <div style={{ display: "flex", gap: 6 }}>
                <Button size="sm" variant="ghost" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>‹</Button>
                <Button size="sm" variant="ghost" onClick={() => setCursor(new Date())}>Today</Button>
                <Button size="sm" variant="ghost" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>›</Button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
              {weekdayLabels.map((w) => (
                <div key={w} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", padding: "4px 0" }}>
                  {w}
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {cells.map((cell) => {
                const dayItems = byDate.get(cell.key) ?? [];
                const isSelected = selectedDate === cell.key;
                return (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() => setSelectedDate(isSelected ? null : cell.key)}
                    style={{
                      minHeight: 68,
                      padding: "6px 6px",
                      borderRadius: "var(--radius-md)",
                      border: isSelected ? "1px solid var(--accent)" : "1px solid var(--border)",
                      background: isSelected ? "var(--accent-soft)" : cell.isToday ? "var(--bg-elevated)" : "var(--bg-card)",
                      opacity: cell.inMonth ? 1 : 0.35,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: 4,
                      textAlign: "left",
                      transition: "border-color var(--transition-fast), background var(--transition-fast)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: cell.isToday ? 800 : 600,
                        color: cell.isToday ? "var(--accent)" : "var(--text-primary)",
                        width: cell.isToday ? 20 : undefined,
                        height: cell.isToday ? 20 : undefined,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: cell.isToday ? "50%" : undefined,
                        background: cell.isToday ? "var(--accent-soft)" : undefined,
                      }}
                    >
                      {cell.date.getDate()}
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                      {dayItems.slice(0, 3).map((a) => (
                        <span key={a.id} style={{ width: 6, height: 6, borderRadius: "50%", background: typeColor[a.type] }} />
                      ))}
                      {dayItems.length > 3 && (
                        <span style={{ fontSize: 9, color: "var(--text-tertiary)" }}>+{dayItems.length - 3}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 14, marginTop: 16, flexWrap: "wrap" }}>
              {types.map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: typeColor[t] }} />
                  {t}
                </div>
              ))}
            </div>
          </Card>

          <div>
            {selectedDate && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>
                  {new Date(selectedDate).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                </span>
                <button
                  onClick={() => setSelectedDate(null)}
                  style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12.5, cursor: "pointer" }}
                >
                  Show all
                </button>
              </div>
            )}
            {grouped.length === 0 ? (
              <Card>
                <p style={{ fontSize: 13, color: "var(--text-tertiary)", margin: 0 }}>Nothing scheduled{selectedDate ? " this day." : "."}</p>
                {selectedDate && (
                  <div style={{ marginTop: 10 }}>
                    <Button size="sm" onClick={() => openCreate(selectedDate)}>+ Add for this day</Button>
                  </div>
                )}
              </Card>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {grouped.map(([date, dayItems]) => (
                  <div key={date}>
                    {!selectedDate && (
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>{date}</div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {dayItems.map((a) => (
                        <Card key={a.id} padding={14} style={{ borderLeft: `3px solid ${typeColor[a.type]}` }}>
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
          </div>
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
