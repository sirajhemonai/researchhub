# ResearchBridge BD — System Architecture

> Bangladesh's platform connecting industry, academia, and government — turning real-world problems into student and researcher opportunities, with a verified Data Rooms marketplace for secure dataset sharing.

This document reflects the **actual current state** of the codebase.

---

## 1. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| Runtime | React | 19.2.3 |
| Language | TypeScript | ^5 |
| Database | PostgreSQL | — |
| ORM | Prisma | ^5.22.0 |
| Auth | NextAuth.js (Credentials + JWT) | ^4.24.13 |
| Auth Adapter | @next-auth/prisma-adapter | ^1.0.7 |
| Password Hashing | bcryptjs | ^3.0.3 |
| Validation | Zod | ^4.3.6 |
| Styling | Tailwind CSS | ^4 |
| Icons | lucide-react | ^0.577.0 |
| Dates | date-fns | ^4.1.0 |
| Styling utils | clsx, tailwind-merge, class-variance-authority | — |
| Seeding | tsx | ^4.21.0 |

**Dev server:** `next dev -p 5000 -H 0.0.0.0`

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                       │
│   React 19 Client Components · NextAuth SessionProvider       │
└───────────────────────────────┬─────────────────────────────┘
                                 │ fetch() / HTTP
┌───────────────────────────────▼─────────────────────────────┐
│                   Next.js App Router (port 5000)              │
│                                                               │
│  ┌──────────────┐   ┌──────────────────────────────────┐    │
│  │  Page Routes │   │      API Route Handlers           │    │
│  │  (app/*)     │   │      (app/api/*/route.ts)         │    │
│  │              │   │                                    │    │
│  │ (auth)/      │   │  getServerSession() guards        │    │
│  │ (dashboard)/ │   │  Zod validation                   │    │
│  └──────────────┘   └─────────────────┬────────────────┘    │
│                                         │                     │
│  Shared libs: lib/auth · lib/prisma · lib/validations        │
│               lib/trust-score · lib/utils                     │
└─────────────────────────────────────────┼───────────────────┘
                                           │ Prisma Client
┌──────────────────────────────────────────▼──────────────────┐
│                    PostgreSQL Database                        │
│  Users · Profiles · Problems · Submissions · Engagements      │
│  Milestones · Disputes · Jobs · Messages · Verifications      │
│  Certificates · DataAssets · DataAccessRequests · AuditLogs   │
└───────────────────────────────────────────────────────────────┘
```

---

## 3. Directory Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout: Providers + Navbar + Footer
│   ├── globals.css                   # Tailwind v4 theme tokens
│   ├── page.tsx                      # Public landing page
│   ├── (auth)/
│   │   ├── login/                    # Login page
│   │   └── register/                 # Registration page
│   ├── (dashboard)/
│   │   ├── dashboard/                # Authenticated home dashboard
│   │   ├── admin/                    # Admin control panel (tabbed)
│   │   ├── problems/                 # Browse / detail / new problem
│   │   ├── engagements/              # List / detail / agreement
│   │   ├── jobs/                     # List / detail / new job
│   │   ├── talent/                   # Talent directory
│   │   ├── messages/                 # Messaging inbox
│   │   ├── profile/                  # Own profile / [id] public profile
│   │   ├── data-rooms/               # Data marketplace browse
│   │   │   ├── new/                  # Create data asset
│   │   │   └── [id]/                 # Asset detail
│   │   │       └── request/          # Request access form
│   │   └── data-requests/            # My access requests + owner review
│   ├── verify/[certId]/              # Public certificate verification
│   └── api/                          # See API section below
├── components/
│   ├── providers.tsx                 # NextAuth SessionProvider wrapper
│   ├── layout/                       # navbar, footer
│   ├── ui/                           # badge, button, card, input, modal, select, textarea
│   └── data-rooms/                   # AuditLogTable, DataAssetCard, NdaSignModal,
│                                     #   RequestStatusStepper, SensitivityBadge
└── lib/
    ├── auth.ts                       # NextAuth config (Credentials + JWT)
    ├── prisma.ts                     # Prisma client singleton
    ├── validations.ts                # Zod schemas
    ├── trust-score.ts                # Trust score calc (client-safe)
    ├── trust-score-server.ts         # Server-side trust score
    └── utils.ts                      # cn() + helpers

prisma/
├── schema.prisma                     # 19 models
└── seed.ts                           # Demo data seeder
```

---

## 4. Data Model (Prisma)

The schema contains **19 models**. Core relationships:

### Identity & Profiles
- **User** — central identity. Fields: `role` (student/researcher/industry/government/admin), `verified`, `trustScore`. Has one `Profile` and is the hub for nearly every relation.
- **Profile** — role-specific fields (student: university/gpa; researcher: ORCID/h-index; industry: trade license/company). Holds `standingBadge` (green/yellow/red/banned) and `verificationStatus`.
- **Verification** — KYC documents (trade_license, email, faculty, government) reviewed by admins.

### Problems & Submissions
- **Problem** — posted by industry/government users. Has `visibility` (public/private/nda), `bountyType` (cash/certificate/none), `status` (open/in_review/closed/archived), `skills` (JSON array), `sector`, `deadline`.
- **Submission** — student/researcher response to a Problem. Fields: `description`, `fileUrl`, `githubRepoUrl`, `demoUrl`, `status` (submitted/shortlisted/accepted/rejected), `score`, `teamMembers`.

### Engagements (Paid Collaboration)
- **Engagement** — a contracted project between a company and a student. Escrow-style flow: `negotiating → pending_deposit → active → closing → payment_released → closed` (plus archived/cancelled). Tracks `platformFeeRate` (default 0.30), deposit, net payout, dual confirmation, negotiation rounds (capped at 2 before admin-binding).
- **Milestone** — deliverable units within an Engagement, with review/revision/extension tracking and `autoCheckResult`.
- **MilestoneTag** — peer-tagging at milestone completion (unique per `milestoneId + submittedBy`).
- **Dispute** — raised against an Engagement/Milestone; admin rules with `full_release`/`partial`/`refund` + `rulingPercent`.
- **ProjectRating** — end-of-engagement ratings (unique per `engagementId + raterId`).
- **Certificate** — verifiable completion certificate with public `verificationUrl`.

### Marketplace & Communication
- **Job** — job/internship postings by companies (type: internship/fulltime/parttime/contract).
- **Message** — direct user-to-user messaging with `read` flag.
- **FraudReport** — user-reported fraud, admin-reviewed.
- **AdminAction** — audit trail of every admin decision (notes min 10 chars, JSON metadata).

### Data Rooms (Dataset Marketplace)
- **DataAsset** — a shareable dataset. `dataType` (tabular/image/text/audio/mixed), `sensitivityLevel` (low/medium/high/critical), `accessMode` (metadata_only/download/controlled), `anonymization` (none/deidentified/anonymized/synthetic), `status` (draft → review → published → suspended).
- **DataAccessRequest** — researcher's request to access a dataset. Two-stage approval: `pending → owner_review → admin_review → approved/rejected` (also revoked/expired). Holds `ownerDecision` and `adminDecision`.
- **DataUseAgreement** — signed NDA/DUA record with IP address + timestamp (unique per request).
- **DataAccessGrant** — active grant with `expiresAt` and revocation support (unique per request).
- **DataAuditLog** — immutable log of every access action (view, request, sign, download, revoke) with IP/user-agent.

---

## 5. API Routes

All handlers live in `app/api/*/route.ts`, guarded by `getServerSession(authOptions)` and validated with Zod.

### Auth & Account
| Route | Purpose |
|-------|---------|
| `auth/[...nextauth]` | NextAuth credential sign-in/session |
| `register` | Create account (hashes password with bcrypt) |
| `profile` / `profile/[id]` | Own profile update / public profile fetch |

### Problems & Submissions
| Route | Purpose |
|-------|---------|
| `problems` / `problems/[id]` | List/create, detail/update problems |
| `submissions` / `submissions/[id]` | Submit/list, review submissions |
| `talent` | Talent directory listing |

### Engagements
| Route | Purpose |
|-------|---------|
| `engagements` / `engagements/[id]` | List/create, detail |
| `engagements/[id]/milestones` | Manage milestones |
| `engagements/[id]/agreement` | Generate agreement |
| `engagements/[id]/close` | Close engagement |
| `engagements/[id]/rate` | Submit ratings |
| `engagements/[id]/release-payment` | Trigger payout |
| `milestones/[id]` / `milestones/[id]/tags` | Milestone update / peer tags |

### Jobs, Messages, Certificates
| Route | Purpose |
|-------|---------|
| `jobs` / `jobs/[id]` | Job CRUD |
| `messages` | Send/list messages |
| `certificates/[certId]` | Certificate data for verification |

### Data Rooms
| Route | Purpose |
|-------|---------|
| `data-assets` / `data-assets/[id]` | List/create, detail/update assets |
| `data-assets/[id]/request-access` | Submit access request |
| `data-assets/[id]/download` | Gated download (checks active grant) |
| `data-access-requests` | List requests (as requester/owner) |
| `data-access-requests/[id]/owner-review` | Owner approve/reject |
| `data-access-requests/[id]/admin-review` | Admin final approve/reject |
| `data-access-requests/[id]/sign-agreement` | Sign DUA → creates grant |
| `data-access-grants/[id]/revoke` | Revoke an active grant |

### Admin
| Route | Purpose |
|-------|---------|
| `admin/stats` | Dashboard metrics |
| `admin/verifications` | KYC review queue |
| `admin/fraud-reports` | Fraud queue |
| `admin/payment-queue` | Payment confirmations |
| `admin/review-watch` | Quality review watch |
| `admin/dispute-queue` | Dispute resolution |
| `admin/closure-queue` | Engagement closures |
| `admin/transaction-log` | Financial log |
| `admin/standing-badge` | Standing badge overrides |
| `admin/data-assets` | Dataset publish/reject queue |
| `admin/data-access-requests` | Data access admin-review queue |
| `admin/data-audit-logs` | Paginated audit log viewer |

---

## 6. Authentication & Authorization

**Strategy:** NextAuth.js with the **Credentials provider** and **JWT sessions**.

- `lib/auth.ts` defines `authOptions`. `authorize()` looks up the user by email and verifies the password with `bcrypt.compare`.
- JWT callback injects `role` and `verified` into the token; session callback exposes `id`, `role`, `verified` on `session.user`.
- Sign-in/error pages route to `/login`.
- **Requires `NEXTAUTH_SECRET`** in the environment to sign/encrypt JWTs.

**Authorization model:** Role-based, enforced inside each API handler via `getServerSession`. Pages also gate UI by role (e.g. only verified industry/government can create data assets; only admins reach `/admin`).

| Role | Key Capabilities |
|------|-----------------|
| **student** | Submit to problems, accept engagements, request data access |
| **researcher** | Same as student + research-focused profile, data requests |
| **industry** | Post problems/jobs, create data assets, hire via engagements |
| **government** | Post problems, create data assets |
| **admin** | All review queues, disputes, payments, dataset & data-request approval |

---

## 7. Key Workflows

### Data Access Request (two-stage approval)
```
Researcher browses Data Rooms
        │
        ▼
Submits access request (purpose, methodology, ethics doc)
        │  status: owner_review
        ▼
Dataset Owner reviews ──reject──► status: rejected
        │ approve
        ▼  status: admin_review
Admin reviews ──reject──► status: rejected
        │ approve
        ▼  status: approved
Researcher signs Data Use Agreement (NDA)
        │  → DataUseAgreement + DataAccessGrant created
        ▼  grant: active (expiresAt set)
Gated download enabled · every action written to DataAuditLog
        │
        ▼  (owner/admin may revoke) → grant: revoked
```

### Engagement Lifecycle
```
negotiating → pending_deposit → active → closing
   → payment_released → closed
(disputes may branch off · admin rules full/partial/refund)
```

### Problem → Engagement
```
Industry posts Problem → Student/researcher submits Solution
   → Company shortlists/accepts → Engagement created
   → Milestones tracked → Ratings exchanged → Certificate issued
```

### Trust Score
`lib/trust-score.ts` computes a 0–100 score per role from verification status, profile completeness, linked accounts (GitHub/ORCID/Scholar), publications, and platform activity. Score color: ≥70 emerald, ≥40 amber, else red.

---

## 8. Frontend Composition

- **Root layout** wires `Providers` (NextAuth `SessionProvider`) around a persistent `Navbar` and `Footer`, using Geist Sans/Mono fonts.
- **Route groups** `(auth)` and `(dashboard)` separate unauthenticated and authenticated experiences.
- **UI primitives** in `components/ui/` (button, card, badge, input, select, textarea, modal) follow a shared CVA-based design system.
- **Data Rooms components** (`SensitivityBadge`, `DataAssetCard`, `RequestStatusStepper`, `NdaSignModal`, `AuditLogTable`) encapsulate the marketplace UI.
- Client components fetch from API routes with `fetch()`; session-dependent fetches are guarded to run only after the session resolves.

---

## 9. Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (Prisma) |
| `NEXTAUTH_SECRET` | Signs/encrypts NextAuth JWT sessions (**required**) |
| `NEXTAUTH_URL` | Canonical app URL (recommended in production) |

---

## 10. Database Scripts

| Command | Action |
|---------|--------|
| `npm run db:push` | Push schema to the database |
| `npm run db:seed` | Seed demo data (`tsx prisma/seed.ts`) |
| `npm run db:reset` | Force-reset schema + reseed |
| `npm run db:studio` | Open Prisma Studio |

---

## 11. Security Measures

- Passwords hashed with **bcrypt**; never stored or returned in plaintext.
- All mutations validated with **Zod** schemas before touching the database.
- API handlers verify session + role before acting on data.
- **Data Rooms**: layered controls — sensitivity levels, NDA/DUA signing with IP capture, time-limited grants, revocation, and an immutable `DataAuditLog` for every access event.
- Admin actions recorded in `AdminAction` with mandatory notes for accountability.
- Prisma parameterizes all queries (SQL-injection safe).

---

## 12. Notable Conventions

- JSON-as-string columns (e.g. `skills`, `tags`, `metadata`, `teamMembers`) store arrays/objects serialized; parse on read.
- `Engagement.platformFeeRate` defaults to **0.30** (30% platform fee).
- Negotiation capped at 2 rounds before admin-binding milestones.
- Certificates expose a public, shareable `verificationUrl` via `/verify/[certId]`.
- Profiles carry a `standingBadge` (green/yellow/red/banned) used for reputation and admin moderation.
