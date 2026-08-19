# FLOW Roadmap

**Last updated:** 2026-08-19

This roadmap tracks where FLOW is headed after the current preview build. Phases are ordered by dependency, not strict calendar commitment.

## Shipped

- Core CRM: Leads, Customers, Deals (Kanban), Follow-ups, Calendar (month grid), Analytics, Notifications, Settings.
- **Properties module** for real-estate use: rentals and sales, contract start/end dates, automatic "expiring soon / overdue" flagging.
- Auth: email/password, Google, Guest (anonymous); Apple/Microsoft stubbed pending credentials.
- Dark/light theme across the whole app, including the pre-auth login/signup screens.
- AI Copilot preview: suggested prompts, demo responses, and one data-driven response (contract reminders computed from live Firestore data).
- Full visual system: gradient brand identity, animated login brand panel, motion system (page transitions, hover/press feedback, message entrance animations, reduced-motion support).

## Phase 1 — Real AI integration
- Replace demo Copilot responses with a real LLM call (server-side function to keep API keys off the client).
- Ground responses in the user's actual Firestore data (leads, deals, properties) via retrieval, not just static templates.
- Proactive AI reminders: surface contract expirations, stale leads, and stalled deals without the user asking — likely via a scheduled Cloud Function that writes to `notifications`.
- Multi-language support for AI responses (starting with Arabic, given the real-estate contract terminology — عقود إيجار وبيع — already used in the product).

## Phase 2 — Real estate depth
- Property media: photo uploads (Firebase Storage), floor plans, document attachments (lease/sale PDFs).
- Contract lifecycle: renewal workflow, e-signature integration, automatic status transition (Available → Under Contract → Rented/Sold) tied to contract dates.
- Commission tracking per deal/property.
- Map view for property addresses (geocoding + pin clustering).

## Phase 3 — Team & permissions
- Multi-user workspaces with roles (Owner, Agent, Viewer).
- Assign leads/properties/deals to specific team members.
- Activity audit log per record.

## Phase 4 — Integrations
- CSV import/export for leads, customers, and properties.
- Email sync (send/receive from within a lead or deal record).
- Calendar sync (Google Calendar / Outlook two-way).
- Webhooks / Zapier-style automation triggers.

## Phase 5 — Scale & polish
- Full-text search across all record types.
- Offline support (Firestore persistence) for spotty-connection field use.
- Native mobile wrapper (Capacitor) for agents on the go.
- Audit-ready security review + SOC2-track data handling docs once team workspaces ship.

## Explicitly not planned
- Support for anonymous/guest *teams* (guest accounts remain single-workspace, disposable).
- On-premise / self-hosted deployment — FLOW is Firebase-native by design.
