import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCollection } from "../../hooks/useCollection";
import { dealsService } from "../../services/crmServices";
import type { Deal, DealStage } from "../../types/crm";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { NewButton } from "../../components/ui/NewButton";
import { Input, Textarea } from "../../components/ui/Input";
import { Select } from "../../components/common/Select";
import { Modal, ConfirmDialog } from "../../components/common/Modal";
import { SectionHeader, LoadingState, EmptyState, ErrorState } from "../../components/common/States";
import { useToast } from "../../context/ToastContext";

function MiniStat({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)",
        background: "var(--bg-card)",
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: tone, flexShrink: 0 }} />
      <span style={{ fontSize: 20, fontWeight: 800 }}>{value}</span>
      <span style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>{label}</span>
    </div>
  );
}

const stages: DealStage[] = ["Lead", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];
const stageColor: Record<DealStage, string> = {
  Lead: "#6366f1",
  Qualified: "#38bdf8",
  Proposal: "#a855f7",
  Negotiation: "#f59e0b",
  Won: "#22c55e",
  Lost: "#ef4444",
};
const emptyForm = { name: "", company: "", value: 0, stage: "Lead" as DealStage, expectedClose: "", owner: "", notes: "" };

export function DealsPage() {
  const { items, loading, error, uid } = useCollection(dealsService);
  const { show } = useToast();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Deal | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<DealStage | null>(null);
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(
    () => items.filter((d) => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.company.toLowerCase().includes(search.toLowerCase())),
    [items, search]
  );

  const activeDeals = items.filter((d) => d.stage !== "Won" && d.stage !== "Lost");
  const pipelineValue = activeDeals.reduce((s, d) => s + (d.value || 0), 0);
  const won = items.filter((d) => d.stage === "Won");
  const lost = items.filter((d) => d.stage === "Lost");
  const winRate = won.length + lost.length ? Math.round((won.length / (won.length + lost.length)) * 100) : 0;

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
      <SectionHeader title="Deals" subtitle="Your sales pipeline, stage by stage." action={<NewButton label="New Deal" onClick={() => openCreate()} />} />

      {!loading && !error && items.length > 0 && (
        <div className="stagger-in" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
          <MiniStat label="Pipeline value" value={`$${pipelineValue.toLocaleString()}`} tone="var(--accent)" />
          <MiniStat label="Active deals" value={activeDeals.length} tone="#38bdf8" />
          <MiniStat label="Win rate" value={`${winRate}%`} tone="var(--success)" />
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div style={{ marginBottom: 16, maxWidth: 320 }}>
          <Input placeholder="Search deals by name or company…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      )}

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : items.length === 0 ? (
        <EmptyState title="No deals yet" description="Create your first deal to start tracking your pipeline." action={{ label: "+ New Deal", onClick: () => openCreate() }} />
      ) : (
        <div className="stagger-in scrollbar-thin" style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8 }}>
          {stages.map((stage) => {
            const stageDeals = filteredItems.filter((d) => d.stage === stage);
            const total = stageDeals.reduce((s, d) => s + (d.value || 0), 0);
            const isOver = dragOverStage === stage;
            return (
              <div
                key={stage}
                style={{
                  minWidth: 260,
                  flex: "0 0 260px",
                  borderRadius: "var(--radius-lg)",
                  padding: 10,
                  background: isOver ? `${stageColor[stage]}0f` : "transparent",
                  border: `1px dashed ${isOver ? stageColor[stage] : "transparent"}`,
                  transition: "background var(--transition-fast), border-color var(--transition-fast)",
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragOverStage !== stage) setDragOverStage(stage);
                }}
                onDragLeave={() => setDragOverStage((s) => (s === stage ? null : s))}
                onDrop={() => {
                  if (dragId) moveStage(dragId, stage);
                  setDragOverStage(null);
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 13.5, display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: stageColor[stage] }} />
                    {stage} <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>({stageDeals.length})</span>
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 600 }}>${total.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {stageDeals.map((deal) => (
                    <Card
                      key={deal.id}
                      padding={14}
                      draggable
                      onDragStart={(e) => {
                        setDragId(deal.id);
                        e.currentTarget.style.opacity = "0.4";
                      }}
                      onDragEnd={(e) => {
                        setDragId(null);
                        setDragOverStage(null);
                        e.currentTarget.style.opacity = "1";
                      }}
                      style={{
                        cursor: "grab",
                        borderLeft: `3px solid ${stageColor[stage]}`,
                        transition: "transform var(--transition-base), box-shadow var(--transition-base), opacity var(--transition-fast)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.4), 0 14px 28px -8px rgba(99,102,241,0.25)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.boxShadow = "var(--shadow-card)";
                      }}
                    >
                      <div onClick={() => openEdit(deal)} style={{ cursor: "pointer" }}>
                        <div style={{ fontWeight: 700, fontSize: 13.5 }}>{deal.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 8 }}>{deal.company}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>${deal.value.toLocaleString()}</div>
                        <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 6 }}>
                          {deal.expectedClose ? `Closes ${deal.expectedClose}` : "No close date"} {deal.owner && `· ${deal.owner}`}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                        <button
                          onClick={() => navigate(`/app/deals/${deal.id}`)}
                          style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 11.5, cursor: "pointer", padding: 0 }}
                        >
                          Details
                        </button>
                        <button
                          onClick={() => setDeleteTarget(deal)}
                          style={{ background: "none", border: "none", color: "var(--danger)", fontSize: 11.5, cursor: "pointer", padding: 0 }}
                        >
                          Delete
                        </button>
                      </div>
                    </Card>
                  ))}
                  <button
                    onClick={() => openCreate(stage)}
                    style={{ border: "1px dashed var(--border)", background: "transparent", borderRadius: "var(--radius-md)", padding: "10px", color: "var(--text-tertiary)", fontSize: 12.5, cursor: "pointer", transition: "border-color var(--transition-fast), color var(--transition-fast)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = stageColor[stage];
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.color = "var(--text-tertiary)";
                    }}
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
