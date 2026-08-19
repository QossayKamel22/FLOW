# Software Requirements Specification (SRS)

**Product:** FLOW — AI-Powered CRM
**Version:** 1.0
**Last updated:** 2026-08-19

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements for FLOW, a web-based CRM built for sales teams and, specifically, real-estate agents managing rental and sale properties. It is intended for the engineering team, designers, and stakeholders evaluating scope and completeness.

### 1.2 Scope
FLOW lets a signed-in user manage leads, customers, deals, properties (rentals/sales), follow-ups, and calendar activities in a single workspace, with a live dashboard, analytics, notifications, and a preview AI assistant ("FLOW AI" / "Copilot"). Each authenticated user owns exactly one workspace (`workspaces/{uid}`); there is no cross-user sharing or team roles in the current version (see Roadmap).

### 1.3 Definitions
- **Workspace** — the per-user data container in Firestore (`workspaces/{uid}/...`).
- **Lead** — a prospective customer not yet converted.
- **Deal** — an active sales opportunity tracked through pipeline stages.
- **Property** — a real-estate listing (for rent or for sale) with optional lease/sale contract dates.
- **Contract reminder** — a system-computed flag when a property's `contractEnd` date is within 30 days or already past.
- **Copilot / FLOW AI** — the in-app assistant surface. Responses are currently pre-written demo content and computed reminders; no external LLM is called.

## 2. Overall Description

### 2.1 User classes
- **Workspace owner** — the only role today. Full read/write over their own workspace. Can sign in via email/password, Google, or as an anonymous Guest.

### 2.2 Operating environment
- Client: modern evergreen browsers (Chrome, Safari, Edge, Firefox), responsive down to ~360px width.
- Backend: Firebase Authentication + Cloud Firestore (no custom server).
- Build: React 19, TypeScript, Vite.

### 2.3 Constraints
- No admin/service credentials are present client-side; all access control is enforced by Firestore Security Rules (`request.auth.uid == uid`).
- The AI Copilot does not call any external AI API in this version — see §4.9.

## 3. Data Model

All collections live under `workspaces/{uid}/{collection}` and are scoped by Firestore rules to the owning `uid`.

| Collection | Key fields |
|---|---|
| `leads` | name, company, email, phone, source, status, score, lastContact, nextAction, notes |
| `customers` | name, company, email, phone, status (Active/Inactive), notes |
| `properties` | title, address, type (Rent/Sale), status (Available/Rented/Sold/Under Contract), price, bedrooms, area, clientName, contractStart, contractEnd, notes |
| `deals` | name, company, value, stage, expectedClose, owner, leadId?, customerId?, notes |
| `followups` | title, date, time, completed, relatedTo, notes |
| `activities` | title, date, time, type (Follow-up/Meeting/Deadline/Other), notes |
| `notifications` | title, message, read, type |
| `preferences/settings` | theme, notification prefs, profile fields |

Every document also carries `id` (Firestore doc id) and `createdAt` (server timestamp, ms).

## 4. Functional Requirements

### 4.1 Authentication
- FR-1: Users can create an account with name, email, and password (min. 6 characters).
- FR-2: Users can sign in with email/password.
- FR-3: Users can sign in with Google (OAuth popup).
- FR-4: Users can continue as a Guest (Firebase Anonymous Auth) without registering.
- FR-5: Users can request a password reset email.
- FR-6: Apple and Microsoft sign-in are present in the UI as disabled placeholders pending OAuth credentials the product owner must provision.
- FR-7: Auth state persists across sessions (`browserLocalPersistence`).

### 4.2 Onboarding
- FR-8: After sign-up, a 4-step onboarding flow collects business name, industry, and team size, previews an "AI setup" animation, and offers notification preference toggles. Onboarding can be skipped at any step.

### 4.3 Leads
- FR-9: Full CRUD on leads with search and status/source filtering.
- FR-10: Leads carry a 0–100 score mapped to a Hot/Warm/Cold tier.

### 4.4 Customers
- FR-11: Full CRUD on customers with search.
- FR-12: Customer list shows aggregate counts (total/active/inactive) and gradient-initial avatars.

### 4.5 Properties (real estate)
- FR-13: Full CRUD on properties: title, address, type (Rent/Sale), status, price, bedrooms, area, tenant/buyer name, contract start/end dates, notes.
- FR-14: Property list is filterable by type (All/Rent/Sale) and searchable by title/address.
- FR-15: A property whose `contractEnd` is within 30 days (or past) is visually flagged (card border + pill) as needing attention.
- FR-16: Aggregate stats (total, available, rented/sold, contracts expiring soon) are shown above the list.

### 4.6 Deals
- FR-17: Deals move through a Kanban pipeline (Lead → Qualified → Proposal → Negotiation → Won/Lost) with drag-and-drop and per-stage value totals.

### 4.7 Follow-ups & Calendar
- FR-18: Follow-ups support CRUD with Overdue/Upcoming/Completed grouping and one-click complete.
- FR-19: Calendar renders an interactive month grid with color-coded activity-type dots per day; clicking a day filters the agenda panel below. Agenda entries support CRUD.

### 4.8 Dashboard
- FR-20: Live KPIs (new leads, active deals, open follow-ups, pipeline value) computed from Firestore data.
- FR-21: An "AI Briefing" card summarizes open follow-ups, projected weekly revenue, and — when applicable — the count of properties with contracts needing attention (from FR-15).
- FR-22: Empty-state guidance is shown when the workspace has no data yet.

### 4.9 AI Copilot
- FR-23: A chat-style interface accepts free text and suggested-prompt buttons.
- FR-24: Responses are pre-written demo content for four suggested prompts (leads to contact, deals needing attention, priorities, highest-value opportunities), plus one computed response: "Which contracts are expiring soon?" — generated client-side from live `properties` data (FR-15), not from an LLM.
- FR-25: The UI clearly labels itself as a preview and discloses that no live AI model is called.
- FR-26: Any other free-text input receives a static "preview" disclaimer response.

### 4.10 Notifications & Analytics
- FR-27: Notifications are Firestore-backed with read/unread state and delete.
- FR-28: Analytics computes win rate, revenue, lead conversion, pipeline-by-stage, and lead-source breakdowns from live data.

### 4.11 Settings
- FR-29: Users can edit profile, workspace info, notification preferences, theme, and manage account security (sign out).

### 4.12 Theming
- FR-30: The app supports light and dark themes, togglable from the sidebar (in-app) and from the login/signup screen (pre-auth), persisted to `localStorage` and, once signed in, to `preferences/settings`.

## 5. Non-Functional Requirements

- NFR-1 (Security): All data access enforced by Firestore rules restricting reads/writes to `request.auth.uid == uid`. No secrets are shipped client-side beyond the public Firebase web config (safe to expose by design).
- NFR-2 (Performance): Firestore snapshot listeners provide real-time updates without manual refresh; UI shows shimmer loading states while the initial snapshot resolves.
- NFR-3 (Accessibility): Motion respects `prefers-reduced-motion`; interactive elements have `aria-label`s where icon-only.
- NFR-4 (Responsiveness): Layout adapts down to ~360px; the sidebar collapses to a mobile drawer under 880px.
- NFR-5 (Resilience): Firestore/network errors surface friendly, mapped messages (`friendlyAuthError`, `friendlyFirestoreError`) rather than raw SDK errors.
- NFR-6 (Browser support): Latest two versions of Chrome, Safari, Firefox, Edge.

## 6. Out of Scope (current version)
- Live/external AI model integration (see Roadmap).
- Multi-user workspaces, roles, or permissions beyond the single owner.
- Apple / Microsoft sign-in (UI present, requires customer-provisioned OAuth credentials).
- Server-side scheduled reminders/push notifications (contract reminders are computed client-side on page load, not pushed).
- CSV import/export, email/calendar integrations.
