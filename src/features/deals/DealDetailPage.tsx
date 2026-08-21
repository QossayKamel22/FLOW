import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCollection } from "../../hooks/useCollection";
import { dealsService, leadsService, customersService } from "../../services/crmServices";
import type { DealStage } from "../../types/crm";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Textarea } from "../../components/ui/Input";
import { Select } from "../../components/common/Select";
import { ConfirmDialog } from "../../components/common/Modal";
import { LoadingState } from "../../components/common/States";
import { Badge } from "../../components/common/Badge";
import { BotOrb } from "../../components/common/BotOrb";
import { daysUntil } from "../../lib/contracts";
import { useToast } from "../../context/ToastContext";

const stages: DealStage[] = ["Lead", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];
const stageColor: Record<DealStage, string> = {
  Lead: "#6366f1",
  Qualified: "#38bdf8",
  Proposal: "#a855f7",
  Negotiation: "#f59e0b",
  Won: "#22c55e",
  Lost: "#ef4444",
};

export function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { show } = useToast();
  const { items: deals, loading, uid } = useCollection(dealsService);
  const { items: leads } = useCollection(leadsService);
  const { items: customers } = useCollection(customersService);

  const deal = deals.find((d) => d.id === id);
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState(deal);

  if (loading) return <LoadingState />;
  if (!deal) {
    return (
      <div>
        <Link to="/app/deals" style={{ color: "var(--accent)", fontSize: 13.5, fontWeight: 600, textDecoration: "none" }}>← Back to Deals</Link>
        <Card style={{ marginTop: 16 }}>
          <p style={{ color: "var(--text-tertiary)" }}>This deal doesn't exist or was deleted.</p>
        </Card>
      </div>
    );
  }

  const linkedLead = leads.find((l) => l.id === deal.leadId);
  const linkedCustomer = customers.find((c) => c.id === deal.customerId);
  const closeDays = daysUntil(deal.expectedClose);

  const insight =
    deal.stage === "Won"
      ? `Won deal worth $${deal.value.toLocaleString()}. Nice work — consider following up for referrals or expansion.`
      : deal.stage === "Lost"
      ? `This deal was lost. Review the notes below for what to do differently next time.`
      : closeDays !== null && closeDays < 0
      ? `Expected close date has passed by ${Math.abs(closeDays)} day${Math.abs(closeDays) !== 1 ? "s" : ""}. Reach out to reconfirm the timeline.`
      : closeDays !== null && closeDays <= 7
      ? `Closing in ${closeDays} day${closeDays !== 1 ? "s" : ""} — this is a priority deal this week.`
      : `Currently in "${deal.stage}" worth $${deal.value.toLocaleString()}. Keep it moving with a clear next step.`;

  function startEdit() {
    setForm(deal);
    setEditing(true);
  }

  async function saveEdit() {
    if (!uid || !form || !form.name.trim()) return;
    try {
      await dealsService.update(uid, deal!.id, { ...form, expectedClose: form.expectedClose || null });
      show("Deal updated.", "success");
      setEditing(false);
    } catch {
      show("Couldn't save changes.", "error");
    }
  }

  async function handleDelete() {
    if (!uid) return;
    try {
      await dealsService.remove(uid, deal!.id);
      show("Deal deleted.", "success");
      navigate("/app/deals");
    } catch {
      show("Couldn't delete the deal.", "error");
    }
  }

  return (
    <div>
      <Link to="/app/deals" style={{ color: "var(--accent)", fontSize: 13.5, fontWeight: 600, textDecoration: "none" }}>← Back to Deals</Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginTop: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${stageColor[deal.stage]}, ${stageColor[deal.stage]}99)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            }}
          >
            💼
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>{deal.name}</h1>
            <div style={{ fontSize: 13.5, color: "var(--text-tertiary)" }}>{deal.company || "No company"}</div>
          </div>
          <div style={{ marginLeft: 8 }}>
            <Badge tone={deal.stage === "Won" ? "success" : deal.stage === "Lost" ? "danger" : "accent"}>{deal.stage}</Badge>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button size="sm" onClick={startEdit}>Edit</Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>Delete</Button>
        </div>
      </div>

      <div
        className="animated-gradient-border"
        style={{
          borderRadius: "var(--radius-lg)",
          padding: 1,
          marginBottom: 16,
          backgroundImage: "linear-gradient(120deg, rgba(99,102,241,0.5), rgba(34,211,238,0.3), rgba(139,92,246,0.45), rgba(99,102,241,0.5))",
        }}
      >
        <Card style={{ borderRadius: "calc(var(--radius-lg) - 1px)", background: "linear-gradient(160deg, rgba(99,102,241,0.08), var(--bg-card) 40%)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <BotOrb size={30} />
            <h3 style={{ fontWeight: 800, fontSize: 14.5 }}>AI Insight</h3>
          </div>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{insight}</p>
        </Card>
      </div>

      {editing ? (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Deal name" value={form?.name ?? ""} onChange={(e) => setForm((f) => (f ? { ...f, name: e.target.value } : f))} />
            <Input label="Company" value={form?.company ?? ""} onChange={(e) => setForm((f) => (f ? { ...f, company: e.target.value } : f))} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Value ($)" type="number" value={form?.value ?? 0} onChange={(e) => setForm((f) => (f ? { ...f, value: Number(e.target.value) } : f))} />
              <Select label="Stage" options={stages} value={form?.stage ?? "Lead"} onChange={(e) => setForm((f) => (f ? { ...f, stage: e.target.value as DealStage } : f))} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Expected close" type="date" value={form?.expectedClose ?? ""} onChange={(e) => setForm((f) => (f ? { ...f, expectedClose: e.target.value } : f))} />
              <Input label="Owner" value={form?.owner ?? ""} onChange={(e) => setForm((f) => (f ? { ...f, owner: e.target.value } : f))} />
            </div>
            <Textarea label="Notes" value={form?.notes ?? ""} onChange={(e) => setForm((f) => (f ? { ...f, notes: e.target.value } : f))} />
            <div style={{ display: "flex", gap: 8 }}>
              <Button onClick={saveEdit}>Save changes</Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <Card>
            <h3 style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 12 }}>Overview</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Value</span>
                <span style={{ fontWeight: 700, color: "var(--accent)" }}>${deal.value.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Expected close</span>
                <span>{deal.expectedClose || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Owner</span>
                <span>{deal.owner || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Linked lead</span>
                <span>{linkedLead ? <Link to={`/app/leads/${linkedLead.id}`} style={{ color: "var(--accent)" }}>{linkedLead.name}</Link> : "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Linked customer</span>
                <span>{linkedCustomer ? <Link to={`/app/customers/${linkedCustomer.id}`} style={{ color: "var(--accent)" }}>{linkedCustomer.name}</Link> : "—"}</span>
              </div>
            </div>
          </Card>
          <Card>
            <h3 style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 12 }}>Notes</h3>
            <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{deal.notes || "No notes yet."}</p>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={deleteOpen}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false);
          void handleDelete();
        }}
        title="Delete deal"
        message={`Delete "${deal.name}"? This can't be undone.`}
      />
    </div>
  );
}
