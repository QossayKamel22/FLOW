import type { Property } from "../types/crm";

export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function isExpiringSoon(dateStr: string | null, withinDays = 30): boolean {
  const d = daysUntil(dateStr);
  return d !== null && d >= 0 && d <= withinDays;
}

export function isOverdue(dateStr: string | null): boolean {
  const d = daysUntil(dateStr);
  return d !== null && d < 0;
}

export function expiringContracts(properties: Property[], withinDays = 30): Property[] {
  return properties
    .filter((p) => p.contractEnd && (isExpiringSoon(p.contractEnd, withinDays) || isOverdue(p.contractEnd)))
    .sort((a, b) => (a.contractEnd ?? "").localeCompare(b.contractEnd ?? ""));
}
