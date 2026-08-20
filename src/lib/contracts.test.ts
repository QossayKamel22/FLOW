import { describe, expect, it } from "vitest";
import { daysUntil, expiringContracts, isExpiringSoon, isOverdue } from "./contracts";
import type { Property } from "../types/crm";

function isoDaysFromToday(offset: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function property(overrides: Partial<Property>): Property {
  return {
    id: "p1",
    createdAt: null,
    title: "Test property",
    address: "123 Main St",
    type: "Sale",
    status: "Available",
    price: 100000,
    bedrooms: 2,
    area: 900,
    clientName: "Client",
    contractStart: null,
    contractEnd: null,
    notes: "",
    ...overrides,
  };
}

describe("daysUntil", () => {
  it("returns null for a null date", () => {
    expect(daysUntil(null)).toBeNull();
  });

  it("returns null for an unparseable date", () => {
    expect(daysUntil("not-a-date")).toBeNull();
  });

  it("returns 0 for today", () => {
    expect(daysUntil(isoDaysFromToday(0))).toBe(0);
  });

  it("returns a positive count for a future date", () => {
    expect(daysUntil(isoDaysFromToday(10))).toBe(10);
  });

  it("returns a negative count for a past date", () => {
    expect(daysUntil(isoDaysFromToday(-5))).toBe(-5);
  });
});

describe("isExpiringSoon", () => {
  it("is false for a null date", () => {
    expect(isExpiringSoon(null)).toBe(false);
  });

  it("is true for a date within the default 30-day window", () => {
    expect(isExpiringSoon(isoDaysFromToday(15))).toBe(true);
  });

  it("is false for a date beyond the window", () => {
    expect(isExpiringSoon(isoDaysFromToday(45))).toBe(false);
  });

  it("respects a custom window", () => {
    expect(isExpiringSoon(isoDaysFromToday(45), 60)).toBe(true);
  });

  it("is false for an already-past date", () => {
    expect(isExpiringSoon(isoDaysFromToday(-2))).toBe(false);
  });

  it("is true for today (0 days)", () => {
    expect(isExpiringSoon(isoDaysFromToday(0))).toBe(true);
  });
});

describe("isOverdue", () => {
  it("is false for a null date", () => {
    expect(isOverdue(null)).toBe(false);
  });

  it("is true for a past date", () => {
    expect(isOverdue(isoDaysFromToday(-1))).toBe(true);
  });

  it("is false for today", () => {
    expect(isOverdue(isoDaysFromToday(0))).toBe(false);
  });

  it("is false for a future date", () => {
    expect(isOverdue(isoDaysFromToday(5))).toBe(false);
  });
});

describe("expiringContracts", () => {
  it("filters out properties with no contract end date", () => {
    const properties = [property({ id: "a", contractEnd: null })];
    expect(expiringContracts(properties)).toHaveLength(0);
  });

  it("includes properties expiring soon or already overdue, excludes far-future ones", () => {
    const properties = [
      property({ id: "soon", contractEnd: isoDaysFromToday(10) }),
      property({ id: "overdue", contractEnd: isoDaysFromToday(-3) }),
      property({ id: "far", contractEnd: isoDaysFromToday(90) }),
    ];
    const result = expiringContracts(properties);
    expect(result.map((p) => p.id).sort()).toEqual(["overdue", "soon"]);
  });

  it("sorts results by contract end date ascending", () => {
    const properties = [
      property({ id: "later", contractEnd: isoDaysFromToday(20) }),
      property({ id: "earlier", contractEnd: isoDaysFromToday(-1) }),
    ];
    const result = expiringContracts(properties);
    expect(result.map((p) => p.id)).toEqual(["earlier", "later"]);
  });

  it("respects a custom window", () => {
    const properties = [property({ id: "a", contractEnd: isoDaysFromToday(50) })];
    expect(expiringContracts(properties, 30)).toHaveLength(0);
    expect(expiringContracts(properties, 60)).toHaveLength(1);
  });
});
