# ResearchBridge BD — Replit Setup

## Project Overview

A multi-stakeholder collaboration platform for Bangladesh connecting industry, academia, government, and society. Industry problems become student and researcher opportunities; research reaches real implementation; government gains data and visibility.

## Tech Stack

- **Framework:** Next.js 16 (App Router, fullstack)
- **Language:** TypeScript
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** NextAuth.js v4 (credentials + JWT strategy)
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React

## Architecture

- `src/app/` — Next.js App Router pages and API routes
- `src/components/` — Shared UI components
- `src/lib/` — Utilities (auth, prisma client)
- `src/types/` — TypeScript type definitions
- `prisma/` — Prisma schema and seed script

## Replit Configuration

- **Port:** 5000 (required for Replit webview)
- **Dev command:** `npm run dev` (runs on `0.0.0.0:5000`)
- **Workflow:** "Start application" — runs the Next.js dev server

## Required Secrets

Set these in the Secrets tab:

| Key              | Description                              |
|------------------|------------------------------------------|
| `DATABASE_URL`   | PostgreSQL connection string             |
| `NEXTAUTH_SECRET`| Secret key for NextAuth JWT signing      |
| `NEXTAUTH_URL`   | Full public URL of the app (auto-set)    |

## Database

Uses Prisma ORM. To apply schema changes:
```bash
npm run db:push
```

To seed the database:
```bash
npm run db:seed
```

## Key Modules

- `src/lib/trust-score.ts` — Dynamic trust score calculation per role (student/researcher/industry), called on profile save and profile view; persists to `User.trustScore` field
- `src/lib/trust-score-server.ts` — Server-side trust score computation and persistence; includes project-based trust formula (completion rate × 0.40 + on-time rate × 0.30 + positive tag ratio × 0.20 + log(avg project value BDT)/10 × 0.10)
- `src/lib/validations.ts` — Zod schemas for all forms (problems, submissions, profiles, jobs)

## Engagement Pipeline (Tasks #3 & #4)

Full negotiation → deposit → milestone execution → closure loop. 
State machine: `negotiating → pending_deposit → active → closing → payment_released → closed → archived`.

### Data Models Added
- **Milestone** — Per-engagement deliverable with states: `pending → submitted → under_review → approved` (plus `revision_requested`, `disputed`). Stores deliverable URL, written note (50-word min), isLate (computed, immutable), revisionCount (max 2), autoCheckResult (JSON).
- **MilestoneTag** — Performance tags submitted by each party (milestone-level after approval, or project-level 7-21 days after closure).
- **Dispute** — Linked to Milestone: ruling (`full_release/partial/refund`), admin-managed, immutable once set.
- **AdminAction** — Append-only log: `adminId`, `actionType`, `entityId`, `entityType`, `notes` (min 10 chars), `metadata` (JSON). Never deleted or updated.
- **Certificate** — Generated on payment release with unique ID and permanent verification URL.
- **ProjectRating** — Tag-based ratings (no stars); rating window opens 7 days after closure, closes at 21 days.
- **Engagement** extended with: `projectValueBdt`, `platformFeeRate` (30%), `depositAmountBdt`, `netStudentPayoutBdt`, `namedContactPhone`, `agreedAt`, `depositDeadline`, `depositConfirmedAt`, `agreementPdfUrl`, negotiation tracking fields.
- **Profile** gains `standingBadge` (`green/yellow/red/banned`).

### API Routes
- `GET /api/engagements` — List user's engagements with milestones
- `GET/PATCH /api/engagements/[id]` — Actions: `propose_milestones`, `confirm_agreement`, `set_contact_phone`, `mark_deposit_received`, `update_project_value`
- `POST /api/engagements/[id]/milestones` — Student submits deliverable with auto-check (URL reachability + word count)
- `GET/POST /api/engagements/[id]/agreement` — Generates/serves HTML agreement document
- `PATCH /api/milestones/[id]` — Actions: `approve`, `request_revision`, `extend_review`, `escalate_dispute`, `resolve_dispute`
- `POST /api/milestones/[id]/tags` — Submit milestone performance tags
- `POST /api/engagements/[id]/close` — Admin quality check, moves to closing
- `POST /api/engagements/[id]/release-payment` — Admin releases payment, generates certificate, updates trust score
- `GET/POST /api/engagements/[id]/rate` — Tag-based rating with 7–21 day window
- `GET /api/certificates/[certId]` — Public certificate data (no auth required)

### Frontend & Admin
- `/engagements` — List page with status-grouped cards
- `/engagements/[id]` — Workspace with role-gated views for each state
- `/verify/[certId]` — Permanent public certificate verification page (no login required)
- **Dashboard "Active Engagements"** — Quick-action card with count badge and notification dot
- **Admin Dashboard (6 tabs on /admin):**
    1. **Payment Queue** — `pending_deposit` projects with countdown and deposit confirmation
    2. **Review Watch** — Milestones under review approaching deadlines (day 8/10)
    3. **Dispute Queue** — Open disputes with ruling form (full_release/partial/refund)
    4. **Closure Queue** — `closing` projects with quality check + payment release forms
    5. **Transaction Log** — Append-only view of all payment AdminActions
    6. **Standing Badge Mgmt** — Company standing badges (green/yellow/red/banned) with override
- **Profile Enhancements:** Certificate badges on student profiles with verification links; `standingBadge` visibility.

## Notes

- `NEXTAUTH_URL` is set to the Replit dev domain automatically
- Auth uses JWT sessions (no database session table needed)
- The `SESSION_SECRET` secret may be used in place of `NEXTAUTH_SECRET` depending on configuration
- Trust scores are dynamically recalculated on profile save (PATCH /api/profile) and on profile view (GET /api/profile, GET /api/profile/[id])
- Submissions support GitHub repo URL, demo URL, document URL, and team members
- Profile fields vary by role: students have academic fields, researchers have publication metrics (h-index, citations, ResearchGate), industry has company details (year established)
- AdminAction records are append-only (never deleted or updated)
- Certificate verification pages are public and permanent
- Tag-based ratings use fixed tag lists; no star ratings (spec excludes them)
- Shortlisting a submission creates an Engagement in `negotiating` state (not `active`)
- Agreement is generated as HTML served at `/api/engagements/[id]/agreement`
- Deposit has 5-day window; auto-check runs URL reachability and word count on milestone submission
