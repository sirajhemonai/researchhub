# ResearchBridge BD — Project Context

> A trust-based marketplace connecting Bangladeshi students, academic researchers, and industry to collaborate on real-world research problems, run structured paid engagements, and hire talent.

---

## 1. Product Overview

ResearchBridge BD is a multi-sided platform for Bangladesh's research and innovation ecosystem. It brings together four kinds of users around real industry problems:

- **Students** — solve posted problems, build portfolios, earn certificates, land internships/jobs.
- **Researchers** — take on consulting/research engagements, showcase publications.
- **Industry (companies)** — post problems, review submissions, run paid engagements, post jobs, hire talent.
- **Admin** — verify accounts, moderate fraud, confirm payments, rule on disputes, oversee closures.

The platform's core value is **trust**: verified accounts, computed trust scores, standing badges, an escrow-style engagement flow with admin-confirmed payments, milestone tracking, disputes, and verifiable certificates.

### Core Loops
1. **Problem → Submission → Engagement**: A company posts a problem → students/researchers submit solutions → company shortlists → an engagement is negotiated with milestones → deposit is confirmed → work is delivered per milestone → payment is released → certificate + ratings issued.
2. **Talent Discovery → Jobs**: Companies browse talent, view profiles/trust scores, post jobs, and message candidates directly.
3. **Trust & Governance**: Verifications, trust scores, standing badges, fraud reports, and admin actions keep the marketplace safe.

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | `16.1.6` |
| UI runtime | React / React DOM | `19.2.3` |
| Language | TypeScript | `^5` |
| Bundler | Turbopack (Next 16 default) | — |
| Database | PostgreSQL (Neon serverless) | — |
| ORM | Prisma + `@prisma/client` | `^5.22.0` |
| Auth | NextAuth.js (Credentials, JWT) | `^4.24.13` |
| Auth adapter | `@next-auth/prisma-adapter` | `^1.0.7` |
| Password hashing | `bcryptjs` | `^3.0.3` |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) | `^4` |
| Component variants | `class-variance-authority` | `^0.7.1` |
| Class utils | `clsx` + `tailwind-merge` (via `cn()`) | `^2.1.1` / `^3.5.0` |
| Icons | `lucide-react` | `^0.577.0` |
| Validation | `zod` | `^4.3.6` |
| Dates | `date-fns` + `Intl` (`en-BD` locale) | `^4.1.0` |
| Seeding | `tsx` running `prisma/seed*.ts` | `^4.21.0` |

**Not used:** no state manager (Redux/Zustand), no data-fetching library (SWR/React Query — uses raw `fetch` in `useEffect`), no test framework.

### Scripts (`package.json`)
```
dev        next dev -p 5000 -H 0.0.0.0
build      next build
start      next start -p 5000 -H 0.0.0.0
lint       eslint
db:push    prisma db push
db:seed    npx tsx prisma/seed.ts
db:reset   prisma db push --force-reset && npx tsx prisma/seed.ts
db:studio  prisma studio
```

Dev server runs on **port 5000**.

---

## 3. Project Structure

```
src/
  app/
    layout.tsx                     Root layout (fonts, providers, navbar/footer)
    page.tsx                       Public landing page
    globals.css                    Tailwind v4 @theme tokens + scrollbar styles
    verify/[certId]/page.tsx       Public certificate verification page

    (auth)/
      login/page.tsx
      register/page.tsx

    (dashboard)/
      dashboard/page.tsx           Role-aware home dashboard
      problems/                    list, new, [id]
      talent/page.tsx              Talent discovery (students + researchers)
      jobs/                        list, new, [id]
      engagements/                 list, [id], [id]/agreement
      messages/page.tsx            Direct messaging threads
      profile/                     own profile + profile/[id]
      admin/page.tsx               Admin console

    api/
      auth/[...nextauth]/          NextAuth handler
      register/                    Sign-up
      problems/  submissions/  talent/  jobs/  profile/  messages/
      engagements/                 + [id]/milestones, agreement, close, rate, release-payment
      milestones/[id]/             + [id]/tags
      certificates/[certId]/
      admin/                       stats, verifications, payment-queue, dispute-queue,
                                   closure-queue, review-watch, standing-badge,
                                   transaction-log, fraud-reports

  components/
    layout/navbar.tsx, footer.tsx
    providers.tsx                  SessionProvider wrapper
    ui/                            badge, button, card, input, modal, select, textarea

  lib/
    auth.ts                        NextAuth options
    prisma.ts                      Prisma client singleton
    trust-score.ts                 Client trust-score + completeness + color helpers
    trust-score-server.ts          Server-side trust-score recompute
    utils.ts                       cn(), parseJsonField(), formatDate(), BD_* constants
    validations.ts                 Zod schemas

prisma/
  schema.prisma                    15 models
  seed.ts                          Base seed (users, problems, jobs, etc.)
  seed-demo.ts                     Supplemental demo data
  seed-talent.ts                   Extra talent profiles
```

### Route Groups
- `(auth)` — unauthenticated pages (login, register).
- `(dashboard)` — authenticated app. **Note:** there is no `(dashboard)/layout.tsx` auth guard; each page guards itself via `useSession()` (`status` = `loading | authenticated | unauthenticated`).

---

## 4. Data Model (Prisma)

15 models. String fields prefixed with JSON store serialized arrays/objects (parsed with `parseJsonField`).

| Model | Purpose | Key fields |
|---|---|---|
| **User** | Account + role | `role` (student/researcher/industry/government/admin), `verified`, `trustScore` |
| **Profile** | 1:1 profile for all roles | shared + student/researcher/industry-specific fields, `standingBadge` (green/yellow/red/banned), `verificationStatus` |
| **Problem** | Industry-posted problem | `visibility` (public/private/nda), `bountyType/Value`, `status`, `skills`, `sector` |
| **Submission** | Solver's entry to a problem | `status` (submitted/shortlisted/accepted/rejected), `score`, `feedback` |
| **Engagement** | Paid project between company & student | `status` lifecycle, `projectValueBdt`, `platformFeeRate` (0.30), deposit/payout, confirmations, negotiation rounds |
| **Milestone** | Deliverable within engagement | `status` (pending → submitted → under_review → approved / revision_requested / disputed), `dueDate`, `autoCheckResult` |
| **MilestoneTag** | Peer tagging at milestone | fixed-list `tags`, `overallTag`; unique per (milestone, submitter) |
| **Dispute** | Conflict on engagement/milestone | `ruling` (full_release/partial/refund), `rulingPercent` |
| **AdminAction** | Audit log of admin ops | `actionType`, `entityType`, `notes` (min 10 chars) |
| **Certificate** | Verifiable completion cert | `verificationUrl`, `milestoneSummary` |
| **ProjectRating** | End-of-engagement rating | `overallTag`; unique per (engagement, rater) |
| **Message** | Direct 1:1 messaging | `senderId`, `receiverId`, `read` |
| **Verification** | Verification requests | `type` (trade_license/email/faculty/government), `status` |
| **Job** | Company job/internship listing | `type` (internship/fulltime/parttime/contract), `salary`, `status` |
| **FraudReport** | User-reported abuse | `reason`, `status` |

### Engagement lifecycle (status)
`negotiating → pending_deposit → active → closing → payment_released → closed` (plus `archived`, `cancelled`).

Deposit/payment steps are **admin-confirmed** (no live payment gateway) — see `AdminAction` and the `api/admin/payment-queue`, `release-payment`, `close` routes.

---

## 5. Authentication & Authorization

- **Provider:** NextAuth Credentials (email + password), passwords hashed with `bcryptjs`.
- **Session:** JWT strategy. `secret` comes from `NEXTAUTH_SECRET`.
- **Custom cookie:** `rb.session-token`, `secure` only in production (works over HTTP in preview).
- **JWT/session callbacks** inject `id`, `role`, and `verified` into the session so pages/APIs can authorize by role.
- **Pages:** custom `/login` for sign-in and error.
- **Client guard pattern:** dashboard pages read `useSession()` `status`; on `unauthenticated` they redirect to `/login`, and render a skeleton while `loading`.

Roles: `student`, `researcher`, `industry`, `government`, `admin`.

---

## 6. Business Logic Highlights

### Trust Score (`lib/trust-score.ts`, server recompute in `trust-score-server.ts`)
Role-specific 0–100 score, each with weighted factors:
- **Student:** verified email (20), profile completeness (30), GitHub (5), portfolio (5), past research (5), submissions count (15), shortlisted ratio (20).
- **Researcher:** verified (20), ORCID (15), Google Scholar (10), ResearchGate (5), h-index (10), publications (20), activity (20).
- **Industry:** verified (30), trade license verified (20), website (10), problems posted (20), company profile completeness (20).

Helpers: `getProfileCompleteness`, `getProfileCompletenessFromForm`, and `getTrustColorClasses` (>=70 emerald, >=40 amber, else red).

### Reference Data (`lib/utils.ts`)
`BD_SKILLS`, `BD_SECTORS`, `BD_UNIVERSITIES` — Bangladesh-specific dropdown constants. `isEduBdEmail()` checks `.edu.bd`. Dates formatted with `en-BD` locale.

---

## 7. Design System

- **Tailwind v4**, CSS-first config in `globals.css` via `@theme inline` (no `tailwind.config.js`).
- **Tokens:** `--color-background` `#ffffff`, `--color-foreground` `#0f172a`, `--font-sans` (Geist Sans), `--font-mono` (Geist Mono).
- **Palette:** slate neutrals with role/status accent colors — emerald (good/verified), amber (warning/pending), red (risk/rejected).
- **Components:** hand-rolled shadcn-style primitives in `components/ui/` using `cva` + `cn()`.
- **Icons:** `lucide-react` only (no emojis as icons).

---

## 8. Environment Variables

Loaded from `.env.development.local` (dev) / project env (prod):

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Stable JWT encryption secret (required) |
| `NEXTAUTH_URL` | Base URL, e.g. `http://localhost:5000` |

> If `NEXTAUTH_SECRET` is missing, NextAuth generates a new random key per restart and invalidates all sessions (causes `JWEDecryptionFailed`). Keep it pinned.

---

## 9. Seed Data & Test Accounts

Run `npm run db:seed` (or `db:reset` to wipe + reseed). Supplemental: `prisma/seed-demo.ts`, `prisma/seed-talent.ts`.

All seeded accounts use password **`password123`**.

| Role | Example emails |
|---|---|
| Admin | `admin@researchbridge.com.bd` |
| Students | `rahim@diu.edu.bd`, `fatima@bracu.edu.bd`, `karim@nsu.edu.bd`, `aisha@aiub.edu.bd`, `hassan@iu.edu.bd`, `nadia@iubat.edu.bd`, `tanvir@eastwest.edu.bd`, `sharmin@du.edu.bd` |
| Researchers | `nasrin@diu.edu.bd`, `mehedi@cuet.edu.bd` |
| Companies | `hr@techsolve.com.bd`, `info@agridata.com.bd`, `contact@finedge.com.bd`, `contact@greenenergy.com.bd`, `hello@newstartup.com.bd` (pending verification) |

Seed content includes industry problems, submissions (submitted/shortlisted), active + negotiating engagements with milestones, job postings, and message threads.

---

## 10. Conventions & Gotchas

- **JSON-in-string fields:** arrays/objects (skills, tags, portfolio, `autoCheckResult`, etc.) are stored as JSON strings — always read via `parseJsonField()` and `JSON.stringify()` on write.
- **No RLS:** authorization is enforced in API route handlers by session role/ownership — every query touching user data must scope by the session user.
- **Client-side data fetching:** pages fetch via `fetch()` inside `useEffect` guarded on auth `status` (not SWR/RSC).
- **Admin actions require notes** (min 10 chars) and are logged to `AdminAction` for auditability.
- **Payments are simulated** via admin confirmation queues, not a real gateway.
- **Auth guard is per-page**, not via a route-group layout — replicate the `useSession` status pattern when adding new dashboard pages.
