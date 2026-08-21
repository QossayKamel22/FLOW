import { useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCollection } from "../../hooks/useCollection";
import { leadsService, dealsService, followupsService, customersService } from "../../services/crmServices";
import type { LeadSource, LeadStatus } from "../../types/crm";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Textarea } from "../../components/ui/Input";
import { Select } from "../../components/common/Select";
import { ConfirmDialog } from "../../components/common/Modal";
import { LoadingState } from "../../components/common/States";
import { StatusBadge, ScoreBadge } from "../../components/common/Badge";
import { Avatar } from "../../components/common/Avatar";
import { BotOrb } from "../../components/common/BotOrb";
import { useToast } from "../../context/ToastContext";

const statuses: LeadStatus[] = ["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"];
const sources: LeadSource[] = ["Website", "LinkedIn", "Referral", "Event", "Facebook", "Other"];

function daysAgo(ms: number | null) {
  if (!ms) return null;
  return Math.floor((Date.now() - ms) / 86_400_000);
}

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { show } = useToast();
  const { items: leads, loading, uid } = useCollection(leadsService);
  const { items: deals } = useCollection(dealsService);
  const { items: followups } = useCollection(followupsService);

  const lead = leads.find((l) => l.id === id);
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState(lead);

  const linkedDeals = useMemo(() => deals.filter((d) => d.leadId === id), [deals, id]);
  const linkedFollowups = useMemo(
    () => (lead ? followups.filter((f) => f.relatedTo && f.relatedTo.toLowerCase().includes(lead.name.toLowerCase())) : []),
    [followups, lead]
  );

  if (loading) return <LoadingState />;
  if (!lead) {
    return (
      <div>
        <Link to="/app/leads" style={{ color: "var(--accent)", fontSize: 13.5, fontWeight: 600, textDecoration: "none" }}>← Back to Leads</Link>
        <Card style={{ marginTop: 16 }}>
          <p style={{ color: "var(--text-tertiary)" }}>This lead doesn't exist or was deleted.</p>
        </Card>
      </div>
    );
  }

  const age = daysAgo(lead.createdAt);
  const isStale = lead.status === "New" && age !== null && age >= 3;
  const isHot = lead.score >= 80;
  const insight = isStale
    ? `This lead has been sitting in "New" for ${age} days without contact. Leads this age convert 40% less often — worth a quick outreach today.`
    : isHot
    ? `Hot lead (score ${lead.score}). Prioritize this one — high-scored leads are your best conversion odds right now.`
    : `Steady progress. Keep ${lead.name} moving through the pipeline with a clear next action.`;
  const insightEmotion = isStale ? "sad" : isHot || lead.status === "Won" ? "happy" : "neutral";

  function startEdit() {
    setForm(lead);
    setEditing(true);
  }

  async function saveEdit() {
    if (!uid || !form || !form.name.trim()) return;
    try {
      await leadsService.update(uid, lead!.id, form);
      show("Lead updated.", "success");
      setEditing(false);
    } catch {
      show("Couldn't save changes.", "error");
    }
  }

  async function handleDelete() {
    if (!uid) return;
    try {
      await leadsService.remove(uid, lead!.id);
      show("Lead deleted.", "success");
      navigate("/app/leads");
    } catch {
      show("Couldn't delete the lead.", "error");
    }
  }

  async function convertToCustomer() {
    if (!uid) return;
    try {
      await customersService.create(uid, {
        name: lead!.name,
        company: lead!.company,
        email: lead!.email,
        phone: lead!.phone,
        status: "Active",
        notes: lead!.notes,
      });
      await leadsService.update(uid, lead!.id, { status: "Won" });
      show(`${lead!.name} converted to a customer.`, "success");
      navigate("/app/customers");
    } catch {
      show("Couldn't convert this lead.", "error");
    }
  }

  return (
    <div>
      <Link to="/app/leads" style={{ color: "var(--accent)", fontSize: 13.5, fontWeight: 600, textDecoration: "none" }}>← Back to Leads</Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginTop: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar name={lead.name} size={52} />
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>{lead.name}</h1>
            <div style={{ fontSize: 13.5, color: "var(--text-tertiary)" }}>{lead.company || "No company"}</div>
          </div>
          <div style={{ display: "flex", gap: 8, marginLeft: 8 }}>
            <StatusBadge status={lead.status} />
            <ScoreBadge score={lead.score} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {lead.email && (
            <a href={`mailto:${lead.email}`} style={{ textDecoration: "none" }}>
              <Button variant="secondary" size="sm">✉ Email</Button>
            </a>
          )}
          {lead.phone && (
            <a href={`tel:${lead.phone}`} style={{ textDecoration: "none" }}>
              <Button variant="secondary" size="sm">☎ Call</Button>
            </a>
          )}
          {lead.status !== "Won" && (
            <Button variant="secondary" size="sm" onClick={convertToCustomer}>→ Convert to Customer</Button>
          )}
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
            <BotOrb size={30} emotion={insightEmotion} />
            <h3 style={{ fontWeight: 800, fontSize: 14.5 }}>AI Insight</h3>
          </div>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{insight}</p>
        </Card>
      </div>

      {editing ? (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Name" value={form?.name ?? ""} onChange={(e) => setForm((f) => (f ? { ...f, name: e.target.value } : f))} />
            <Input label="Company" value={form?.company ?? ""} onChange={(e) => setForm((f) => (f ? { ...f, company: e.target.value } : f))} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Email" value={form?.email ?? ""} onChange={(e) => setForm((f) => (f ? { ...f, email: e.target.value } : f))} />
              <Input label="Phone" value={form?.phone ?? ""} onChange={(e) => setForm((f) => (f ? { ...f, phone: e.target.value } : f))} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Select label="Status" options={statuses} value={form?.status ?? "New"} onChange={(e) => setForm((f) => (f ? { ...f, status: e.target.value as LeadStatus } : f))} />
              <Select label="Source" options={sources} value={form?.source ?? "Website"} onChange={(e) => setForm((f) => (f ? { ...f, source: e.target.value as LeadSource } : f))} />
            </div>
            <Input label="Score (0-100)" type="number" min={0} max={100} value={form?.score ?? 0} onChange={(e) => setForm((f) => (f ? { ...f, score: Number(e.target.value) } : f))} />
            <Input label="Next action" value={form?.nextAction ?? ""} onChange={(e) => setForm((f) => (f ? { ...f, nextAction: e.target.value } : f))} />
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
                <span style={{ color: "var(--text-tertiary)" }}>Email</span>
                <span>{lead.email || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Phone</span>
                <span>{lead.phone || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Source</span>
                <span>{lead.source}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Next action</span>
                <span>{lead.nextAction || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Added</span>
                <span>{age !== null ? `${age}d ago` : "—"}</span>
              </div>
            </div>
          </Card>
          <Card>
            <h3 style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 12 }}>Notes</h3>
            <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{lead.notes || "No notes yet."}</p>
          </Card>
        </div>
      )}

      <Card>
        <h3 style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 12 }}>Activity</h3>
        {linkedDeals.length === 0 && linkedFollowups.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>No linked deals or follow-ups yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {linkedDeals.map((d) => (
              <Link key={d.id} to="/app/deals" style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", borderLeft: "3px solid #a855f7" }}>
                  <span>💼</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>{d.stage} · ${d.value.toLocaleString()}</div>
                  </div>
                </div>
              </Link>
            ))}
            {linkedFollowups.map((f) => (
              <Link key={f.id} to="/app/followups" style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", borderLeft: "3px solid #6366f1" }}>
                  <span>⏰</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, textDecoration: f.completed ? "line-through" : "none" }}>{f.title}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>{f.date}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false);
          void handleDelete();
        }}
        title="Delete lead"
        message={`Delete "${lead.name}"? This can't be undone.`}
      />
    </div>
  );
}
