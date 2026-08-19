export type LeadStatus = "New" | "Contacted" | "Qualified" | "Proposal" | "Won" | "Lost";
export type LeadSource = "Website" | "LinkedIn" | "Referral" | "Event" | "Facebook" | "Other";
export type DealStage = "Lead" | "Qualified" | "Proposal" | "Negotiation" | "Won" | "Lost";

export interface BaseDoc {
  id: string;
  createdAt: number | null;
}

export interface Lead extends BaseDoc {
  name: string;
  company: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  lastContact: string | null;
  nextAction: string;
  notes: string;
}

export interface Customer extends BaseDoc {
  name: string;
  company: string;
  email: string;
  phone: string;
  status: "Active" | "Inactive";
  notes: string;
}

export interface Deal extends BaseDoc {
  name: string;
  company: string;
  value: number;
  stage: DealStage;
  expectedClose: string | null;
  owner: string;
  leadId?: string;
  customerId?: string;
  notes: string;
}

export interface FollowUp extends BaseDoc {
  title: string;
  date: string;
  time: string;
  completed: boolean;
  relatedTo: string;
  notes: string;
}

export interface Activity extends BaseDoc {
  title: string;
  date: string;
  time: string;
  type: "Follow-up" | "Meeting" | "Deadline" | "Other";
  notes: string;
}

export type PropertyType = "Rent" | "Sale";
export type PropertyStatus = "Available" | "Rented" | "Sold" | "Under Contract";

export interface Property extends BaseDoc {
  title: string;
  address: string;
  type: PropertyType;
  status: PropertyStatus;
  price: number;
  bedrooms: number;
  area: number;
  clientName: string;
  contractStart: string | null;
  contractEnd: string | null;
  notes: string;
}

export interface AppNotification extends BaseDoc {
  title: string;
  message: string;
  read: boolean;
  type: "followup" | "deal" | "lead" | "customer";
}

export function scoreTier(score: number): "Hot" | "Warm" | "Cold" {
  if (score >= 80) return "Hot";
  if (score >= 50) return "Warm";
  return "Cold";
}
