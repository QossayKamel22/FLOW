import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCollection } from "../../hooks/useCollection";
import { propertiesService } from "../../services/crmServices";
import type { Property, PropertyStatus, PropertyType } from "../../types/crm";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { NewButton } from "../../components/ui/NewButton";
import { Input, Textarea } from "../../components/ui/Input";
import { Select } from "../../components/common/Select";
import { Modal, ConfirmDialog } from "../../components/common/Modal";
import { SectionHeader, LoadingState, EmptyState, ErrorState } from "../../components/common/States";
import { Badge, StatusBadge } from "../../components/common/Badge";
import { daysUntil, isExpiringSoon, isOverdue } from "../../lib/contracts";
import { useToast } from "../../context/ToastContext";

const propertyTypes: PropertyType[] = ["Rent", "Sale"];
const propertyStatuses: PropertyStatus[] = ["Available", "Rented", "Sold", "Under Contract"];

const emptyForm = {
  title: "",
  address: "",
  type: "Rent" as PropertyType,
  status: "Available" as PropertyStatus,
  price: 0,
  bedrooms: 0,
  area: 0,
  clientName: "",
  contractStart: "",
  contractEnd: "",
  notes: "",
};

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

function ContractPill({ date }: { date: string | null }) {
  if (!date) return null;
  const days = daysUntil(date);
  if (days === null) return null;
  const overdue = isOverdue(date);
  const soon = isExpiringSoon(date);
  if (!overdue && !soon) {
    return <span style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>Contract ends {date}</span>;
  }
  return (
    <Badge tone={overdue ? "danger" : "warning"}>
      {overdue ? `Expired ${Math.abs(days)}d ago` : days === 0 ? "Expires today" : `Expires in ${days}d`}
    </Badge>
  );
}

export function PropertiesPage() {
  const { items, loading, error, uid } = useCollection(propertiesService);
  const { show } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | PropertyType>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);

  const filtered = useMemo(
    () =>
      items
        .filter((p) => {
          const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.address.toLowerCase().includes(search.toLowerCase());
          const matchesType = typeFilter === "All" || p.type === typeFilter;
          return matchesSearch && matchesType;
        })
        .sort((a, b) => {
          const aFlagged = isExpiringSoon(a.contractEnd) || isOverdue(a.contractEnd);
          const bFlagged = isExpiringSoon(b.contractEnd) || isOverdue(b.contractEnd);
          if (aFlagged !== bFlagged) return aFlagged ? -1 : 1;
          if (aFlagged && bFlagged) return (a.contractEnd ?? "").localeCompare(b.contractEnd ?? "");
          return 0;
        }),
    [items, search, typeFilter]
  );

  const expiringCount = useMemo(() => items.filter((p) => isExpiringSoon(p.contractEnd) || isOverdue(p.contractEnd)).length, [items]);
  const availableCount = useMemo(() => items.filter((p) => p.status === "Available").length, [items]);
  const occupiedCount = useMemo(() => items.filter((p) => p.status === "Rented" || p.status === "Sold").length, [items]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(p: Property) {
    setEditing(p);
    setForm({ ...emptyForm, ...p, contractStart: p.contractStart ?? "", contractEnd: p.contractEnd ?? "" });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!uid || !form.title.trim()) return;
    const payload = {
      ...form,
      price: Number(form.price) || 0,
      bedrooms: Number(form.bedrooms) || 0,
      area: Number(form.area) || 0,
      contractStart: form.contractStart || null,
      contractEnd: form.contractEnd || null,
    };
    try {
      if (editing) {
        await propertiesService.update(uid, editing.id, payload);
        show("Property updated.", "success");
      } else {
        await propertiesService.create(uid, payload);
        show("Property created.", "success");
      }
      setModalOpen(false);
    } catch {
      show("Couldn't save the property.", "error");
    }
  }

  async function handleDelete() {
    if (!uid || !deleteTarget) return;
    try {
      await propertiesService.remove(uid, deleteTarget.id);
      show("Property deleted.", "success");
    } catch {
      show("Couldn't delete the property.", "error");
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      <SectionHeader title="Properties" subtitle="Manage listings, leases, and sale contracts." action={<NewButton label="New Property" onClick={openCreate} />} />

      {!loading && !error && items.length > 0 && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
          <MiniStat label="Total properties" value={items.length} tone="var(--accent)" />
          <MiniStat label="Available" value={availableCount} tone="var(--success)" />
          <MiniStat label="Rented / Sold" value={occupiedCount} tone="#38bdf8" />
          <MiniStat label="Contracts expiring soon" value={expiringCount} tone="var(--warning)" />
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ maxWidth: 320, flex: 1, minWidth: 220 }}>
          <Input placeholder="Search by title or address…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {(["All", "Rent", "Sale"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              style={{
                padding: "9px 14px",
                borderRadius: "var(--radius-md)",
                border: `1px solid ${typeFilter === t ? "var(--accent)" : "var(--border)"}`,
                background: typeFilter === t ? "var(--accent-soft)" : "var(--bg-card)",
                color: typeFilter === t ? "var(--accent)" : "var(--text-secondary)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "border-color var(--transition-fast), background var(--transition-fast)",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🏠" title="No properties yet" description="Add a listing to start tracking rentals and sales." action={{ label: "+ New Property", onClick: openCreate }} />
      ) : (
        <div className="stagger-in" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {filtered.map((p) => {
            const flagged = isExpiringSoon(p.contractEnd) || isOverdue(p.contractEnd);
            const cardEl = (
              <Card
                style={{
                  cursor: "pointer",
                  transition: "transform var(--transition-base), box-shadow var(--transition-base)",
                  borderRadius: flagged ? "calc(var(--radius-lg) - 1px)" : undefined,
                }}
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
                <div onClick={() => navigate(`/app/properties/${p.id}`)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 10,
                          background: p.type === "Rent" ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "linear-gradient(135deg, #f59e0b, #d97706)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                        }}
                      >
                        {p.type === "Rent" ? "🔑" : "🏷️"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{p.title || "Untitled property"}</div>
                        <div style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>{p.address || "No address"}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                      <Badge tone={p.type === "Rent" ? "accent" : "warning"}>{p.type}</Badge>
                      <StatusBadge status={p.status} />
                    </div>
                  </div>

                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 17, fontWeight: 800 }}>
                      ${p.price.toLocaleString()}
                      {p.type === "Rent" && <span style={{ fontSize: 11.5, color: "var(--text-tertiary)", fontWeight: 500 }}> /mo</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                      {p.bedrooms ? `${p.bedrooms} bd · ` : ""}
                      {p.area ? `${p.area} m²` : ""}
                    </div>
                  </div>

                  {(p.clientName || p.contractEnd) && (
                    <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{p.clientName || "—"}</span>
                      <ContractPill date={p.contractEnd} />
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => setDeleteTarget(p)}>Delete</Button>
                </div>
              </Card>
            );
            return flagged ? (
              <div
                key={p.id}
                className="animated-gradient-border"
                style={{
                  borderRadius: "var(--radius-lg)",
                  padding: 1,
                  backgroundImage: isOverdue(p.contractEnd)
                    ? "linear-gradient(120deg, rgba(239,68,68,0.65), rgba(245,158,11,0.3), rgba(239,68,68,0.65))"
                    : "linear-gradient(120deg, rgba(245,158,11,0.6), rgba(245,158,11,0.2), rgba(245,158,11,0.6))",
                }}
              >
                {cardEl}
              </div>
            ) : (
              <div key={p.id}>{cardEl}</div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit property" : "New property"} width={560}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Select label="Type" options={propertyTypes} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PropertyType })} />
            <Select label="Status" options={propertyStatuses} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PropertyStatus })} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Input label={form.type === "Rent" ? "Price /mo" : "Price"} type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            <Input label="Bedrooms" type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: Number(e.target.value) })} />
            <Input label="Area (m²)" type="number" value={form.area} onChange={(e) => setForm({ ...form, area: Number(e.target.value) })} />
          </div>
          <Input label="Tenant / Buyer name" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Contract start" type="date" value={form.contractStart} onChange={(e) => setForm({ ...form, contractStart: e.target.value })} />
            <Input label="Contract end" type="date" value={form.contractEnd} onChange={(e) => setForm({ ...form, contractEnd: e.target.value })} />
          </div>
          <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Button fullWidth onClick={handleSave}>{editing ? "Save changes" : "Create property"}</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete property" message={`Delete "${deleteTarget?.title}"?`} />
    </div>
  );
}
