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
import { useToast } from "../../context/ToastContext";

const emptyForm = { name: "", company: "", email: "", phone: "", status: "Active" as "Active" | "Inactive", notes: "" };

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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {filtered.map((c) => (
            <Card key={c.id} style={{ cursor: "pointer" }} padding={18}>
              <div onClick={() => setSelected(c)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                    <div style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>{c.company}</div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <div style={{ marginTop: 12, fontSize: 12.5, color: "var(--text-secondary)" }}>{c.email}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{c.phone}</div>
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

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ""}>
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
            <div><strong>Company:</strong> {selected.company || "—"}</div>
            <div><strong>Email:</strong> {selected.email || "—"}</div>
            <div><strong>Phone:</strong> {selected.phone || "—"}</div>
            <div><strong>Status:</strong> <StatusBadge status={selected.status} /></div>
            <div><strong>Notes:</strong> {selected.notes || "—"}</div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete customer" message={`Delete "${deleteTarget?.name}"?`} />
    </div>
  );
}
