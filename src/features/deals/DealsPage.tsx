import { useState } from "react";
import { useCollection } from "../../hooks/useCollection";
import { dealsService } from "../../services/crmServices";
import type { Deal, DealStage } from "../../types/crm";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Textarea } from "../../components/ui/Input";
import { Select } from "../../components/common/Select";
import { Modal, ConfirmDialog } from "../../components/common/Modal";
import { SectionHeader, LoadingState, EmptyState, ErrorState } from "../../components/common/States";
import { useToast } from "../../context/ToastContext";

const stages: DealStage[] = ["Lead", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];
const emptyForm = { name: "", company: "", value: 0, stage: "Lead" as DealStage, expectedClose: "", owner: "", notes: "" };

export function DealsPage() {
  const { items, loading, error, uid } = useCollection(dealsService);
  const { show } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Deal | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  function openCreate(stage?: DealStage) {
    setEditing(null);
    setForm({ ...emptyForm, stage: stage ?? "Lead" });
    setModalOpen(true);
  }

  function openEdit(d: Deal) {
    setEditing(d);
    setForm({ ...emptyForm, ...d, expectedClose: d.expectedClose ?? "" });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!uid || !form.name.trim()) return;
    const payload = { ...form, expectedClose: form.expectedClose || null };
    try {
      if (editing) {
        await dealsService.update(uid, editing.id, payload);
        show("Deal updated.", "success");
      } else {
        await dealsService.create(uid, payload);
        show("Deal created.", "success");
      }
      setModalOpen(false);
    } catch {
      show("Couldn't save the deal.", "error");
    }
  }

  async function handleDelete() {
    if (!uid || !deleteTarget) return;
    try {
      await dealsService.remove(uid, deleteTarget.id);
      show("Deal deleted.", "success");
    } catch {
      show("Couldn't delete the deal.", "error");
    } finally {
      setDeleteTarget(null);
    }
  }

  async function moveStage(dealId: string, stage: DealStage) {
    if (!uid) return;
    await dealsService.update(uid, dealId, { stage });
  }

  return (
    <div>
      <SectionHeader title="Deals" subtitle="Your sales pipeline, stage by stage." action={<Button onClick={() => openCreate()}>+ New Deal</Button>} />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : items.length === 0 ? (
        <EmptyState title="No deals yet" description="Create your first deal to start tracking your pipeline." action={{ label: "+ New Deal", onClick: () => openCreate() }} />
      ) : (
        <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8 }} className="scrollbar-thin">
          {stages.map((stage) => {
            const stageDeals = items.filter((d) => d.stage === stage);
            const total = stageDeals.reduce((s, d) => s + (d.value || 0), 0);
            return (
              <div
                key={stage}
                style={{ minWidth: 260, flex: "0 0 260px" }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => dragId && moveStage(dragId, stage)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 13.5 }}>{stage} <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>({stageDeals.length})</span></span>
                  <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>${total.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {stageDeals.map((deal) => (
                    <Card
                      key={deal.id}
                      padding={14}
                      draggable
                      onDragStart={() => setDragId(deal.id)}
                      style={{ cursor: "grab" }}
                    >
                      <div onClick={() => openEdit(deal)} style={{ cursor: "pointer" }}>
                        <div style={{ fontWeight: 700, fontSize: 13.5 }}>{deal.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 8 }}>{deal.company}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>${deal.value.toLocaleString()}</div>
                        <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 6 }}>
                          {deal.expectedClose ? `Closes ${deal.expectedClose}` : "No close date"} {deal.owner && `· ${deal.owner}`}
                        </div>
                      </div>
                      <button
                        onClick={() => setDeleteTarget(deal)}
                        style={{ background: "none", border: "none", color: "var(--danger)", fontSize: 11.5, cursor: "pointer", marginTop: 8, padding: 0 }}
                      >
                        Delete
                      </button>
                    </Card>
                  ))}
                  <button
                    onClick={() => openCreate(stage)}
                    style={{ border: "1px dashed var(--border)", background: "transparent", borderRadius: "var(--radius-md)", padding: "10px", color: "var(--text-tertiary)", fontSize: 12.5, cursor: "pointer" }}
                  >
                    + Add deal
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit deal" : "New deal"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input label="Deal name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Value ($)" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
            <Select label="Stage" options={stages} value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as DealStage })} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Expected close" type="date" value={form.expectedClose} onChange={(e) => setForm({ ...form, expectedClose: e.target.value })} />
            <Input label="Owner" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
          </div>
          <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Button fullWidth onClick={handleSave}>{editing ? "Save changes" : "Create deal"}</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete deal" message={`Delete "${deleteTarget?.name}"?`} />
    </div>
  );
}
