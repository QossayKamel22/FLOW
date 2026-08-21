import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCollection } from "../../hooks/useCollection";
import { propertiesService } from "../../services/crmServices";
import type { PropertyStatus, PropertyType } from "../../types/crm";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Textarea } from "../../components/ui/Input";
import { Select } from "../../components/common/Select";
import { ConfirmDialog } from "../../components/common/Modal";
import { LoadingState } from "../../components/common/States";
import { Badge, StatusBadge } from "../../components/common/Badge";
import { BotOrb } from "../../components/common/BotOrb";
import { daysUntil, isExpiringSoon, isOverdue } from "../../lib/contracts";
import { useToast } from "../../context/ToastContext";

const propertyTypes: PropertyType[] = ["Rent", "Sale"];
const propertyStatuses: PropertyStatus[] = ["Available", "Rented", "Sold", "Under Contract"];

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { show } = useToast();
  const { items: properties, loading, uid } = useCollection(propertiesService);

  const property = properties.find((p) => p.id === id);
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState(property);

  if (loading) return <LoadingState />;
  if (!property) {
    return (
      <div>
        <Link to="/app/properties" style={{ color: "var(--accent)", fontSize: 13.5, fontWeight: 600, textDecoration: "none" }}>← Back to Properties</Link>
        <Card style={{ marginTop: 16 }}>
          <p style={{ color: "var(--text-tertiary)" }}>This property doesn't exist or was deleted.</p>
        </Card>
      </div>
    );
  }

  const contractDays = daysUntil(property.contractEnd);
  const overdue = isOverdue(property.contractEnd);
  const soon = isExpiringSoon(property.contractEnd);

  const insight = !property.contractEnd
    ? `No contract end date on file. Add one so FLOW can track lease/sale expiry automatically.`
    : overdue
    ? `The contract for "${property.title}" expired ${Math.abs(contractDays!)} day${Math.abs(contractDays!) !== 1 ? "s" : ""} ago. Follow up with ${property.clientName || "the client"} to renew or close it out.`
    : soon
    ? `Contract expires in ${contractDays} day${contractDays !== 1 ? "s" : ""}. Reach out to ${property.clientName || "the client"} ahead of the deadline.`
    : `Contract runs through ${property.contractEnd}. No action needed right now.`;
  const insightEmotion = overdue ? "sad" : soon ? "neutral" : property.contractEnd ? "happy" : "neutral";

  function startEdit() {
    setForm(property);
    setEditing(true);
  }

  async function saveEdit() {
    if (!uid || !form || !form.title.trim()) return;
    try {
      await propertiesService.update(uid, property!.id, {
        ...form,
        price: Number(form.price) || 0,
        bedrooms: Number(form.bedrooms) || 0,
        area: Number(form.area) || 0,
        contractStart: form.contractStart || null,
        contractEnd: form.contractEnd || null,
      });
      show("Property updated.", "success");
      setEditing(false);
    } catch {
      show("Couldn't save changes.", "error");
    }
  }

  async function handleDelete() {
    if (!uid) return;
    try {
      await propertiesService.remove(uid, property!.id);
      show("Property deleted.", "success");
      navigate("/app/properties");
    } catch {
      show("Couldn't delete the property.", "error");
    }
  }

  return (
    <div>
      <Link to="/app/properties" style={{ color: "var(--accent)", fontSize: 13.5, fontWeight: 600, textDecoration: "none" }}>← Back to Properties</Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginTop: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: property.type === "Rent" ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "linear-gradient(135deg, #f59e0b, #d97706)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            }}
          >
            {property.type === "Rent" ? "🔑" : "🏷️"}
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>{property.title || "Untitled property"}</h1>
            <div style={{ fontSize: 13.5, color: "var(--text-tertiary)" }}>{property.address || "No address"}</div>
          </div>
          <div style={{ display: "flex", gap: 8, marginLeft: 8 }}>
            <Badge tone={property.type === "Rent" ? "accent" : "warning"}>{property.type}</Badge>
            <StatusBadge status={property.status} />
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
          backgroundImage:
            overdue || soon
              ? "linear-gradient(120deg, rgba(245,158,11,0.6), rgba(239,68,68,0.3), rgba(245,158,11,0.6))"
              : "linear-gradient(120deg, rgba(99,102,241,0.5), rgba(34,211,238,0.3), rgba(139,92,246,0.45), rgba(99,102,241,0.5))",
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
            <Input label="Title" value={form?.title ?? ""} onChange={(e) => setForm((f) => (f ? { ...f, title: e.target.value } : f))} />
            <Input label="Address" value={form?.address ?? ""} onChange={(e) => setForm((f) => (f ? { ...f, address: e.target.value } : f))} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Select label="Type" options={propertyTypes} value={form?.type ?? "Rent"} onChange={(e) => setForm((f) => (f ? { ...f, type: e.target.value as PropertyType } : f))} />
              <Select label="Status" options={propertyStatuses} value={form?.status ?? "Available"} onChange={(e) => setForm((f) => (f ? { ...f, status: e.target.value as PropertyStatus } : f))} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Input label={form?.type === "Rent" ? "Price /mo" : "Price"} type="number" value={form?.price ?? 0} onChange={(e) => setForm((f) => (f ? { ...f, price: Number(e.target.value) } : f))} />
              <Input label="Bedrooms" type="number" value={form?.bedrooms ?? 0} onChange={(e) => setForm((f) => (f ? { ...f, bedrooms: Number(e.target.value) } : f))} />
              <Input label="Area (m²)" type="number" value={form?.area ?? 0} onChange={(e) => setForm((f) => (f ? { ...f, area: Number(e.target.value) } : f))} />
            </div>
            <Input label="Tenant / Buyer name" value={form?.clientName ?? ""} onChange={(e) => setForm((f) => (f ? { ...f, clientName: e.target.value } : f))} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Contract start" type="date" value={form?.contractStart ?? ""} onChange={(e) => setForm((f) => (f ? { ...f, contractStart: e.target.value } : f))} />
              <Input label="Contract end" type="date" value={form?.contractEnd ?? ""} onChange={(e) => setForm((f) => (f ? { ...f, contractEnd: e.target.value } : f))} />
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
                <span style={{ color: "var(--text-tertiary)" }}>Price</span>
                <span style={{ fontWeight: 700 }}>${property.price.toLocaleString()}{property.type === "Rent" ? " /mo" : ""}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Size</span>
                <span>{property.bedrooms ? `${property.bedrooms} bd · ` : ""}{property.area ? `${property.area} m²` : "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Tenant / Buyer</span>
                <span>{property.clientName || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Contract</span>
                <span>{property.contractStart || "—"} → {property.contractEnd || "—"}</span>
              </div>
            </div>
          </Card>
          <Card>
            <h3 style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 12 }}>Notes</h3>
            <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{property.notes || "No notes yet."}</p>
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
        title="Delete property"
        message={`Delete "${property.title}"? This can't be undone.`}
      />
    </div>
  );
}
