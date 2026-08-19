import { useMemo, useState } from "react";
import { useCollection } from "../../hooks/useCollection";
import { customersService } from "../../services/crmServices";
import type { Customer } from "../../types/crm";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Textarea } from "../../components/ui/Input";
import { Select } from "../../components/common/Select";
import { Modal, ConfirmDialog } from "../../components/common/Modal";
import { SectionHeader, LoadingState, EmptyState, ErrorState } from "../../components/common/States";
import { StatusBadge } from "../../components/common/Badge";
import { Avatar } from "../../components/common/Avatar";
import { useToast } from "../../context/ToastContext";

const emptyForm = { name: "", company: "", email: "", phone: "", status: "Active" as "Active" | "Inactive", notes: "" };

function MiniStat({ label, value, tone }: { label: string; value: number; tone: string }) {
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

export function CustomersPage() {
  const { items, loading, error, uid } = useCollection(customersService);
  const { show } = useToast();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [selected, setSelected] = useState<Customer | null>(null);

  const filtered = useMemo(
    () => items.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase())),
    [items, search]
  );
  const activeCount = useMemo(() => items.filter((c) => c.status === "Active").length, [items]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(c: Customer) {
    setEditing(c);
    setForm({ ...emptyForm, ...c });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!uid || !form.name.trim()) return;
    try {
      if (editing) {
        await customersService.update(uid, editing.id, form);
        show("Customer updated.", "success");
      } else {
        await customersService.create(uid, form);
        show("Customer created.", "success");
      }
      setModalOpen(false);
    } catch {
      show("Couldn't save the customer.", "error");
    }
  }

  async function handleDelete() {
    if (!uid || !deleteTarget) return;
    try {
      await customersService.remove(uid, deleteTarget.id);
      show("Customer deleted.", "success");
    } catch {
      show("Couldn't delete the customer.", "error");
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      <SectionHeader title="Customers" subtitle="Manage your active customer relationships." action={<Button onClick={openCreate}>+ New Customer</Button>} />

      {!loading && !error && items.length > 0 && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
          <MiniStat label="Total customers" value={items.length} tone="var(--accent)" />
          <MiniStat label="Active" value={activeCount} tone="var(--success)" />
          <MiniStat label="Inactive" value={items.length - activeCount} tone="var(--text-tertiary)" />
        </div>
      )}

      <div style={{ marginBottom: 16, maxWidth: 320 }}>
        <Input placeholder="Search customers…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No customers yet" description="Convert a lead or add a customer directly." action={{ label: "+ New Customer", onClick: openCreate }} />
      ) : (
        <div className="stagger-in" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {filtered.map((c) => (
            <Card
              key={c.id}
              style={{ cursor: "pointer", transition: "transform var(--transition-base), box-shadow var(--transition-base)" }}
              padding={20}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.4), 0 16px 32px -8px rgba(99,102,241,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "var(--shadow-card)";
              }}
            >
              <div onClick={() => setSelected(c)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar name={c.name} size={42} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                      <div style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>{c.company || "No company"}</div>
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ fontSize: 12.5, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ opacity: 0.6 }}>✉</span> {c.email || "—"}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ opacity: 0.6 }}>☎</span> {c.phone || "—"}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => setDeleteTarget(c)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit customer" : "New customer"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <Select label="Status" options={["Active", "Inactive"]} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "Active" | "Inactive" })} />
          <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Button fullWidth onClick={handleSave}>{editing ? "Save changes" : "Create customer"}</Button>
        </div>
      </Modal>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="">
        {selected && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <Avatar name={selected.name} size={56} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{selected.name}</div>
                <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>{selected.company || "No company"}</div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <StatusBadge status={selected.status} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: "1px solid var(--border)" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Email</span>
                <span>{selected.email || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: "1px solid var(--border)" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Phone</span>
                <span>{selected.phone || "—"}</span>
              </div>
              <div style={{ padding: "10px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                <div style={{ color: "var(--text-tertiary)", marginBottom: 6 }}>Notes</div>
                <div>{selected.notes || "—"}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete customer" message={`Delete "${deleteTarget?.name}"?`} />
    </div>
  );
}
