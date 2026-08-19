<div align="center">

# FLOW

**AI-Powered CRM for modern sales teams**

[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-lightgrey.svg)](#license)

Smarter CRM. Better Sales.

</div>

---

FLOW is a modern CRM for sales teams to manage leads, customers, deals, follow-ups, and calendar activities in one clean, dark-first workspace. It's built as a real, functioning product — every core CRM feature reads and writes live data through Firebase, not mock content.

## Table of Contents

- [Features](#features)
- [AI Experience](#ai-experience)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Firebase](#firebase)
- [Security](#security)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Screens](#screens)
- [Roadmap](#roadmap)
- [License](#license)

## Features

| Module | Description |
| --- | --- |
| **Dashboard** | Live KPIs (leads, active deals, follow-ups, pipeline value) computed from Firestore data, with empty states for new workspaces |
| **Leads** | Full CRUD, search, status/source filtering, lead scoring (Hot/Warm/Cold) |
| **Customers** | Full CRUD, search, and a detail view with contact info and notes |
| **Deals** | Drag-and-drop Kanban pipeline across six stages, with per-stage totals |
| **Follow-ups** | CRUD with Overdue / Upcoming / Completed grouping and one-click complete |
| **Calendar** | Day-grouped sales activities (meetings, deadlines, follow-ups) with CRUD |
| **AI Copilot** | A polished chat-style preview of FLOW's future AI assistant |
| **Analytics** | Win rate, revenue, lead conversion, pipeline-by-stage and lead-source breakdowns, all derived from real data |
| **Notifications** | Firestore-backed, with read/unread state and delete |
| **Settings** | Profile, workspace info, notification preferences, theme, and account security |

## AI Experience

The AI Briefing card, AI Copilot chat, and onboarding "AI setup" animation are **visual/product-concept features only**. They demonstrate FLOW's intended direction but do not call any external AI model or API. Copilot replies are predefined demo content, clearly presented as a preview. No AI API keys, backends, or model integrations exist in this codebase.

## Tech Stack

React 19 · Vite · TypeScript · Firebase (Authentication + Cloud Firestore) · React Router

No custom backend server — Firebase is the entire backend.

## Architecture

```
src/
  components/    reusable UI (Button, Input, Card, Modal, Badge, KpiCard, states…)
  layouts/       AppShell (sidebar + responsive header)
  features/      one folder per CRM module (auth, onboarding, dashboard, leads,
                 customers, deals, followups, calendar, copilot, analytics,
                 notifications, settings)
  context/       AuthContext, ThemeContext, ToastContext
  hooks/         useCollection (generic Firestore subscription hook)
  services/      Firestore data access, isolated from UI (collection.ts factory
                 + crmServices.ts per-module wiring, userService.ts, errors.ts)
  routes/        ProtectedRoute / PublicOnlyRoute
  lib/           firebase.ts (client init), errors.ts (friendly error mapping)
  types/         shared CRM types
```

## Firebase

Data is scoped per authenticated user under `workspaces/{uid}/...`:

```
workspaces/{uid}/leads/{leadId}
workspaces/{uid}/customers/{customerId}
workspaces/{uid}/deals/{dealId}
workspaces/{uid}/followups/{followupId}
workspaces/{uid}/activities/{activityId}
workspaces/{uid}/notifications/{notificationId}
workspaces/{uid}/preferences/settings
```

Security rules (`firestore.rules`) restrict every read/write to `request.auth.uid == uid`, so no user can access another user's CRM data.

## Security

Firebase web config values (`VITE_FIREBASE_*`) are safe to expose client-side — they identify the project, not a secret. Actual data protection comes entirely from Firestore security rules. No service account keys, admin credentials, or AI API keys are used anywhere in this project.

## Getting Started

```bash
git clone https://github.com/QossayKamel22/FLOW.git
cd FLOW
npm install
cp .env.example .env   # fill in your Firebase project config
npm run dev
```

## Environment Variables

See `.env.example`:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Until these are set, the app renders normally but shows a notice on the auth screens that Firebase isn't configured yet.

## Screens

Login · Sign up · Onboarding (business info → AI setup preview → preferences → finish) · Dashboard · Leads · Customers · Deals (Kanban) · Follow-ups · Calendar · AI Copilot · Analytics · Notifications · Settings — all responsive, with light and dark themes.

## Roadmap

- [ ] Real AI-powered insights and Copilot responses
- [ ] Team/multi-user workspaces with roles
- [ ] Email/calendar integrations
- [ ] CSV import/export for leads and deals

## License

Licensed under the [MIT License](LICENSE).

---

<div align="center">

Built by [Qossay Kamel](https://github.com/QossayKamel22)

</div>
