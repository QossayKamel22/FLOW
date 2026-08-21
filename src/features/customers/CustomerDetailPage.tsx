import { useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCollection } from "../../hooks/useCollection";
import { customersService, dealsService } from "../../services/crmServices";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Textarea } from "../../components/ui/Input";
import { Select } from "../../components/common/Select";
import { ConfirmDialog } from "../../components/common/Modal";
import { LoadingState } from "../../components/common/States";
import { StatusBadge } from "../../components/common/Badge";
import { Avatar } from "../../components/common/Avatar";
import { BotOrb } from "../../components/common/BotOrb";
import { useToast } from "../../context/ToastContext";

function daysAgo(ms: number | null) {
  if (!ms) return null;
  return Math.floor((Date.now() - ms) / 86_400_000);
}

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { show } = useToast();
  const { items: customers, loading, uid } = useCollection(customersService);
  const { items: deals } = useCollection(dealsService);

  const customer = customers.find((c) => c.id === id);
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState(customer);

  const linkedDeals = useMemo(() => deals.filter((d) => d.customerId === id), [deals, id]);

  if (loading) return <LoadingState />;
  if (!customer) {
    return (
      <div>
        <Link to="/app/customers" style={{ color: "var(--accent)", fontSize: 13.5, fontWeight: 600, textDecoration: "none" }}>← Back to Customers</Link>
        <Card style={{ marginTop: 16 }}>
          <p style={{ color: "var(--text-tertiary)" }}>This customer doesn't exist or was deleted.</p>
        </Card>
      </div>
    );
  }

  const age = daysAgo(customer.createdAt);
  const wonValue = linkedDeals.filter((d) => d.stage === "Won").reduce((s, d) => s + (d.value || 0), 0);
  const insight =
    linkedDeals.length === 0
      ? `${customer.name} has no linked deals yet. Consider starting a new deal to keep this relationship active.`
      : wonValue > 0
      ? `${customer.name} has generated $${wonValue.toLocaleString()} in won deals. A strong relationship worth nurturing for repeat business.`
      : `${customer.name} has ${linkedDeals.length} open deal${linkedDeals.length > 1 ? "s" : ""} in progress. Keep the momentum going.`;

  function startEdit() {
    setForm(customer);
    setEditing(true);
  }

  async function saveEdit() {
    if (!uid || !form || !form.name.trim()) return;
    try {
      await customersService.update(uid, customer!.id, form);
      show("Customer updated.", "success");
      setEditing(false);
    } catch {
      show("Couldn't save changes.", "error");
    }
  }

  async function handleDelete() {
    if (!uid) return;
    try {
      await customersService.remove(uid, customer!.id);
      show("Customer deleted.", "success");
      navigate("/app/customers");
    } catch {
      show("Couldn't delete the customer.", "error");
    }
  }

  return (
    <div>
      <Link to="/app/customers" style={{ color: "var(--accent)", fontSize: 13.5, fontWeight: 600, textDecoration: "none" }}>← Back to Customers</Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginTop: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar name={customer.name} size={52} />
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>{customer.name}</h1>
            <div style={{ fontSize: 13.5, color: "var(--text-tertiary)" }}>{customer.company || "No company"}</div>
          </div>
          <div style={{ display: "flex", gap: 8, marginLeft: 8 }}>
            <StatusBadge status={customer.status} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {customer.email && (
            <a href={`mailto:${customer.email}`} style={{ textDecoration: "none" }}>
              <Button variant="secondary" size="sm">✉ Email</Button>
            </a>
          )}
          {customer.phone && (
            <a href={`tel:${customer.phone}`} style={{ textDecoration: "none" }}>
              <Button variant="secondary" size="sm">☎ Call</Button>
            </a>
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
            <BotOrb size={30} />
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
            <Select label="Status" options={["Active", "Inactive"]} value={form?.status ?? "Active"} onChange={(e) => setForm((f) => (f ? { ...f, status: e.target.value as "Active" | "Inactive" } : f))} />
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
                <span>{customer.email || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Phone</span>
                <span>{customer.phone || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Won deal value</span>
                <span>${wonValue.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Customer since</span>
                <span>{age !== null ? `${age}d ago` : "—"}</span>
              </div>
            </div>
          </Card>
          <Card>
            <h3 style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 12 }}>Notes</h3>
            <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{customer.notes || "No notes yet."}</p>
          </Card>
        </div>
      )}

      <Card>
        <h3 style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 12 }}>Deals</h3>
        {linkedDeals.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>No linked deals yet.</p>
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
        title="Delete customer"
        message={`Delete "${customer.name}"? This can't be undone.`}
      />
    </div>
  );
}
