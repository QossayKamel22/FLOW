import { makeCollectionService, millis } from "./collection";
import type { Activity, AppNotification, Customer, Deal, FollowUp, Lead, Property } from "../types/crm";

export const leadsService = makeCollectionService<Lead>("leads", (id, d) => ({
  id,
  name: d.name ?? "",
  company: d.company ?? "",
  email: d.email ?? "",
  phone: d.phone ?? "",
  source: d.source ?? "Other",
  status: d.status ?? "New",
  score: d.score ?? 50,
  lastContact: d.lastContact ?? null,
  nextAction: d.nextAction ?? "",
  notes: d.notes ?? "",
  createdAt: millis(d),
}));

export const customersService = makeCollectionService<Customer>("customers", (id, d) => ({
  id,
  name: d.name ?? "",
  company: d.company ?? "",
  email: d.email ?? "",
  phone: d.phone ?? "",
  status: d.status ?? "Active",
  notes: d.notes ?? "",
  createdAt: millis(d),
}));

export const dealsService = makeCollectionService<Deal>("deals", (id, d) => ({
  id,
  name: d.name ?? "",
  company: d.company ?? "",
  value: d.value ?? 0,
  stage: d.stage ?? "Lead",
  expectedClose: d.expectedClose ?? null,
  owner: d.owner ?? "",
  leadId: d.leadId,
  customerId: d.customerId,
  notes: d.notes ?? "",
  createdAt: millis(d),
}));

export const followupsService = makeCollectionService<FollowUp>("followups", (id, d) => ({
  id,
  title: d.title ?? "",
  date: d.date ?? "",
  time: d.time ?? "",
  completed: Boolean(d.completed),
  relatedTo: d.relatedTo ?? "",
  notes: d.notes ?? "",
  createdAt: millis(d),
}));

export const activitiesService = makeCollectionService<Activity>("activities", (id, d) => ({
  id,
  title: d.title ?? "",
  date: d.date ?? "",
  time: d.time ?? "",
  type: d.type ?? "Other",
  notes: d.notes ?? "",
  createdAt: millis(d),
}));

export const propertiesService = makeCollectionService<Property>("properties", (id, d) => ({
  id,
  title: d.title ?? "",
  address: d.address ?? "",
  type: d.type ?? "Rent",
  status: d.status ?? "Available",
  price: d.price ?? 0,
  bedrooms: d.bedrooms ?? 0,
  area: d.area ?? 0,
  clientName: d.clientName ?? "",
  contractStart: d.contractStart ?? null,
  contractEnd: d.contractEnd ?? null,
  notes: d.notes ?? "",
  createdAt: millis(d),
}));

export const notificationsService = makeCollectionService<AppNotification>("notifications", (id, d) => ({
  id,
  title: d.title ?? "",
  message: d.message ?? "",
  read: Boolean(d.read),
  type: d.type ?? "lead",
  createdAt: millis(d),
}));
