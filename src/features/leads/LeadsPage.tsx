import { useMemo, useState } from "react";
import { useCollection } from "../../hooks/useCollection";
import { leadsService } from "../../services/crmServices";
import type { Lead, LeadSource, LeadStatus } from "../../types/crm";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { NewButton } from "../../components/ui/NewButton";
import { Input, Textarea } from "../../components/ui/Input";
import { Select } from "../../components/common/Select";
import { Modal, ConfirmDialog } from "../../components/common/Modal";
import { SectionHeader, LoadingState, EmptyState, ErrorState } from "../../components/common/States";
import { StatusBadge, ScoreBadge } from "../../components/common/Badge";
import { Avatar } from "../../components/common/Avatar";
import { useToast } from "../../context/ToastContext";

const statuses: LeadStatus[] = ["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"];
const sources: LeadSource[] = ["Website", "LinkedIn", "Referral", "Event", "Facebook", "Other"];

const emptyForm = {
  name: "",
  company: "",
  email: "",
  phone: "",
  source: "Website" as LeadSource,
  status: "New" as LeadStatus,
  score: 50,
  nextAction: "",
  notes: "",
};

function MiniStat({ label, value, tone }: { label: string; value: number | string; tone: string }) {
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

export function LeadsPage() {
  const { items, loading, error, uid } = useCollection(leadsService);
  const { show } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return items.filter((l) => {
      const matchesSearch =
        !search ||
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.company.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || l.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

  const hotCount = useMemo(() => items.filter((l) => l.score >= 80).length, [items]);
  const wonCount = useMemo(() => items.filter((l) => l.status === "Won").length, [items]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(lead: Lead) {
    setEditing(lead);
    setForm({ ...emptyForm, ...lead });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!uid || !form.name.trim()) return;
    try {
      if (editing) {
        await leadsService.update(uid, editing.id, form);
        show("Lead updated.", "success");
      } else {
        await leadsService.create(uid, { ...form, lastContact: null });
        show("Lead created.", "success");
      }
      setModalOpen(false);
    } catch {
      show("Couldn't save the lead. Try again.", "error");
    }
  }

  async function handleDelete() {
    if (!uid || !deleteTarget) return;
    try {
      await leadsService.remove(uid, deleteTarget.id);
      show("Lead deleted.", "success");
    } catch {
      show("Couldn't delete the lead.", "error");
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      <SectionHeader
        title="Leads"
        subtitle="Track and qualify incoming prospects."
        action={<NewButton label="New Lead" onClick={openCreate} />}
      />

      {!loading && !error && items.length > 0 && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
          <MiniStat label="Total leads" value={items.length} tone="var(--accent)" />
          <MiniStat label="Hot leads" value={hotCount} tone="var(--danger)" />
          <MiniStat label="Won" value={wonCount} tone="var(--success)" />
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Input placeholder="Search leads by name or company…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select options={["All", ...statuses]} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 170 }} />
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No leads found" description="Create your first lead to start building your pipeline." action={{ label: "+ New Lead", onClick: openCreate }} />
      ) : (
        <Card padding={0} style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 820 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-tertiary)", fontSize: 12 }}>
                {["Lead", "Company", "Status", "Score", "Source", "Next Action", ""].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="stagger-in">
              {filtered.map((lead) => (
                <tr
                  key={lead.id}
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background: hoveredRow === lead.id ? "var(--bg-elevated)" : "transparent",
                    transition: "background var(--transition-fast)",
                  }}
                  onMouseEnter={() => setHoveredRow(lead.id)}
                  onMouseLeave={() => setHoveredRow((h) => (h === lead.id ? null : h))}
                >
                  <td style={{ padding: "10px 16px", fontWeight: 600 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={lead.name} size={30} />
                      <div>
                        {lead.name}
                        <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 400 }}>{lead.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>{lead.company}</td>
                  <td style={{ padding: "12px 16px" }}><StatusBadge status={lead.status} /></td>
                  <td style={{ padding: "12px 16px" }}><ScoreBadge score={lead.score} /></td>
                  <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{lead.source}</td>
                  <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{lead.nextAction || "—"}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(lead)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => setDeleteTarget(lead)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit lead" : "New lead"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Select label="Status" options={statuses} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as LeadStatus })} />
            <Select label="Source" options={sources} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value as LeadSource })} />
          </div>
          <Input label="Score (0-100)" type="number" min={0} max={100} value={form.score} onChange={(e) => setForm({ ...form, score: Number(e.target.value) })} />
          <Input label="Next action" value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })} />
          <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Button fullWidth onClick={handleSave}>{editing ? "Save changes" : "Create lead"}</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete lead"
        message={`Delete "${deleteTarget?.name}"? This can't be undone.`}
      />
    </div>
  );
}
